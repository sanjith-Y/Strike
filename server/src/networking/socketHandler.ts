import { Server, Socket } from 'socket.io';
import { RoomManager } from '../rooms/RoomManager.js';
import { MatchEngine } from '../gameplay/MatchEngine.js';
import { verifyUserToken } from '../auth/supabase.js';
import { PlayerInputPayload, PlayerShootPayload, RoomSettings, UserIdentity } from '../types/game.js';
import crypto from 'crypto';

export class NetworkHandler {
  private io: Server;
  private roomManager: RoomManager;
  private activeMatches: Map<string, MatchEngine> = new Map(); // RoomId -> MatchEngine

  constructor(io: Server, roomManager: RoomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  public registerEvents(): void {
    // Authenticate socket connections
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      const user = await verifyUserToken(token);

      if (!user) {
        // Allow guest connection with fallback if token is missing
        const guestId = 'guest_' + crypto.randomUUID().slice(0, 8);
        const guestUser: UserIdentity = {
          id: guestId,
          username: socket.handshake.auth?.username || 'Pilot_' + guestId.slice(-4),
          isGuest: true,
        };
        (socket as any).user = guestUser;
        return next();
      }

      (socket as any).user = user;
      next();
    });

    this.io.on('connection', (socket: Socket) => {
      const user: UserIdentity = (socket as any).user;
      console.log(`[SOCKET] User connected: ${user.username} (${user.id}) socket=${socket.id}`);

      // 1. Create Room
      socket.on('create_room', (data?: { settings?: Partial<RoomSettings> }) => {
        try {
          const room = this.roomManager.createRoom(user, data?.settings);
          socket.join(room.id);
          this.roomManager.bindSocket(socket.id, room.id, user.id);

          socket.emit('room_created', room);
          this.io.to(room.id).emit('room_state', room);
          console.log(`[ROOM] Created room ${room.code} (${room.id}) by ${user.username}`);
        } catch (err: any) {
          socket.emit('error', { message: err.message || 'Failed to create room' });
        }
      });

      // 2. Join Room
      socket.on('join_room', (data: { code: string }) => {
        try {
          if (!data?.code) {
            return socket.emit('error', { message: 'Room code is required' });
          }

          const result = this.roomManager.joinRoom(data.code, user);
          if (!result.success || !result.room) {
            return socket.emit('error', { message: result.error || 'Cannot join room' });
          }

          const room = result.room;
          socket.join(room.id);
          this.roomManager.bindSocket(socket.id, room.id, user.id);

          this.io.to(room.id).emit('room_state', room);
          console.log(`[ROOM] User ${user.username} joined room ${room.code}`);
        } catch (err: any) {
          socket.emit('error', { message: err.message || 'Failed to join room' });
        }
      });

      // 3. Toggle Ready
      socket.on('toggle_ready', (data?: { isReady?: boolean }) => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const updatedRoom = this.roomManager.toggleReady(binding.roomId, user.id, data?.isReady);
        if (updatedRoom) {
          this.io.to(updatedRoom.id).emit('room_state', updatedRoom);
        }
      });

      // 4. Update Settings (Owner only)
      socket.on('update_settings', (settings: Partial<RoomSettings>) => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const result = this.roomManager.updateSettings(binding.roomId, user.id, settings);
        if (result.success && result.room) {
          this.io.to(result.room.id).emit('room_state', result.room);
        } else {
          socket.emit('error', { message: result.error || 'Failed to update settings' });
        }
      });

      // 5. Start Match (Owner only)
      socket.on('start_match', () => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const validation = this.roomManager.canStartMatch(binding.roomId, user.id);
        if (!validation.canStart) {
          return socket.emit('error', { message: validation.error || 'Cannot start match' });
        }

        const room = this.roomManager.getRoom(binding.roomId);
        if (!room) return;

        this.roomManager.setRoomStatus(room.id, 'active');
        const matchId = crypto.randomUUID();

        // Create match engine
        const matchEngine = new MatchEngine(matchId, room.id, room.settings, room.players, this.io);
        this.activeMatches.set(room.id, matchEngine);

        // Notify clients to load into 3D arena
        this.io.to(room.id).emit('match_started', {
          matchId,
          roomId: room.id,
          settings: room.settings,
          players: room.players,
        });

        matchEngine.start();
      });

      // 6. Player Movement & Aiming Input
      socket.on('player_input', (payload: PlayerInputPayload) => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const match = this.activeMatches.get(binding.roomId);
        if (match && match.isActive) {
          match.handlePlayerInput(user.id, payload);
        }
      });

      // 7. Player Shoot Event
      socket.on('player_shoot', (payload: PlayerShootPayload) => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const match = this.activeMatches.get(binding.roomId);
        if (match && match.isActive) {
          match.handleShoot(user.id, payload);
        }
      });

      // 8. Player Reload Event
      socket.on('player_reload', () => {
        const binding = this.roomManager.getSocketBinding(socket.id);
        if (!binding) return;

        const match = this.activeMatches.get(binding.roomId);
        if (match && match.isActive) {
          match.handleReload(user.id);
        }
      });

      // 9. Ping for latency monitoring
      socket.on('client_ping', (data: { clientTime: number }) => {
        socket.emit('server_pong', {
          clientTime: data?.clientTime || 0,
          serverTime: Date.now(),
        });
      });

      // 10. Leave Room
      socket.on('leave_room', () => {
        this.handleDisconnect(socket, user);
      });

      // 11. Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket, user);
      });
    });
  }

  private handleDisconnect(socket: Socket, user: UserIdentity): void {
    const binding = this.roomManager.unbindSocket(socket.id);
    if (!binding) return;

    console.log(`[SOCKET] User ${user.username} left/disconnected from room ${binding.roomId}`);
    const result = this.roomManager.leaveRoom(binding.roomId, user.id);

    if (result.roomDeleted) {
      // Room was deleted, clean up active match if any
      const match = this.activeMatches.get(binding.roomId);
      if (match) {
        match.finishMatch('abandoned');
        this.activeMatches.delete(binding.roomId);
      }
    } else if (result.room) {
      this.io.to(result.room.id).emit('room_state', result.room);
    }
  }
}
