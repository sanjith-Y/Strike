import crypto from 'crypto';
import { RoomPlayer, RoomSettings, RoomState, RoomStatus, UserIdentity } from '../types/game.js';

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  minPlayers: 2,
  maxPlayers: 8,
  matchDurationSec: 300, // 5 minutes
  killTarget: 20,
  respawnDelaySec: 3,
};

export class RoomManager {
  private rooms: Map<string, RoomState> = new Map(); // Keyed by room ID
  private codeToRoomId: Map<string, string> = new Map(); // Keyed by uppercase room code
  private socketToPlayer: Map<string, { roomId: string; userId: string }> = new Map();

  /**
   * Generates a 6-character human-readable room code, ensuring no collisions
   */
  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars like 0, O, 1, I
    let code = '';
    let attempts = 0;

    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
      }
      attempts++;
      if (attempts > 100) break;
    } while (this.codeToRoomId.has(code));

    return code;
  }

  /**
   * Creates a new multiplayer room
   */
  public createRoom(owner: UserIdentity, customSettings?: Partial<RoomSettings>): RoomState {
    const roomId = crypto.randomUUID();
    const code = this.generateRoomCode();

    const settings: RoomSettings = {
      ...DEFAULT_ROOM_SETTINGS,
      ...customSettings,
      maxPlayers: Math.min(Math.max(customSettings?.maxPlayers || 8, 2), 8),
      minPlayers: Math.min(Math.max(customSettings?.minPlayers || 2, 1), 8),
      matchDurationSec: Math.min(Math.max(customSettings?.matchDurationSec || 300, 60), 1200),
      killTarget: Math.min(Math.max(customSettings?.killTarget || 20, 5), 100),
      respawnDelaySec: Math.min(Math.max(customSettings?.respawnDelaySec || 3, 1), 10),
    };

    const ownerPlayer: RoomPlayer = {
      id: owner.id,
      username: owner.username,
      avatarUrl: owner.avatarUrl,
      isReady: true, // Owner is ready by default
      isOwner: true,
      connected: true,
      joinedAt: Date.now(),
    };

    const room: RoomState = {
      id: roomId,
      code,
      ownerId: owner.id,
      status: 'waiting',
      settings,
      players: [ownerPlayer],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    this.codeToRoomId.set(code, roomId);

    return room;
  }

  /**
   * Retrieves a room by its code or ID
   */
  public getRoom(codeOrId: string): RoomState | undefined {
    const clean = codeOrId.trim().toUpperCase();
    if (this.codeToRoomId.has(clean)) {
      return this.rooms.get(this.codeToRoomId.get(clean)!);
    }
    return this.rooms.get(codeOrId);
  }

  /**
   * Adds an authenticated player to a room
   */
  public joinRoom(code: string, user: UserIdentity): { success: boolean; room?: RoomState; error?: string } {
    const cleanCode = code.trim().toUpperCase();
    const roomId = this.codeToRoomId.get(cleanCode);

    if (!roomId) {
      return { success: false, error: 'Room not found. Please check the code.' };
    }

    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room does not exist or has closed.' };
    }

    if (room.status === 'finished') {
      return { success: false, error: 'This match has already completed.' };
    }

    // Check if player is already in room (reconnection)
    const existingIndex = room.players.findIndex(p => p.id === user.id);
    if (existingIndex !== -1) {
      room.players[existingIndex].connected = true;
      room.players[existingIndex].username = user.username;
      return { success: true, room };
    }

    // Check if match is already active
    if (room.status === 'active') {
      return { success: false, error: 'Match is already in progress.' };
    }

    // Check capacity
    if (room.players.length >= room.settings.maxPlayers) {
      return { success: false, error: `Room is full (Maximum ${room.settings.maxPlayers} players).` };
    }

    const newPlayer: RoomPlayer = {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      isReady: false,
      isOwner: false,
      connected: true,
      joinedAt: Date.now(),
    };

    room.players.push(newPlayer);
    return { success: true, room };
  }

  /**
   * Sets player ready status
   */
  public toggleReady(roomId: string, userId: string, isReady?: boolean): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find(p => p.id === userId);
    if (!player) return null;

    player.isReady = isReady !== undefined ? isReady : !player.isReady;
    return room;
  }

  /**
   * Updates room settings by room owner
   */
  public updateSettings(roomId: string, userId: string, newSettings: Partial<RoomSettings>): { success: boolean; room?: RoomState; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { success: false, error: 'Room not found' };

    if (room.ownerId !== userId) {
      return { success: false, error: 'Only the room owner can modify match settings.' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Settings cannot be modified while match is active.' };
    }

    room.settings = {
      ...room.settings,
      ...newSettings,
      maxPlayers: Math.min(Math.max(newSettings.maxPlayers || room.settings.maxPlayers, 2), 8),
      minPlayers: Math.min(Math.max(newSettings.minPlayers || room.settings.minPlayers, 1), 8),
      matchDurationSec: Math.min(Math.max(newSettings.matchDurationSec || room.settings.matchDurationSec, 60), 1200),
      killTarget: Math.min(Math.max(newSettings.killTarget || room.settings.killTarget, 5), 100),
      respawnDelaySec: Math.min(Math.max(newSettings.respawnDelaySec || room.settings.respawnDelaySec, 1), 10),
    };

    return { success: true, room };
  }

  /**
   * Validates if room is ready to start
   */
  public canStartMatch(roomId: string, userId: string): { canStart: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { canStart: false, error: 'Room does not exist.' };

    if (room.ownerId !== userId) {
      return { canStart: false, error: 'Only the room owner can start the match.' };
    }

    if (room.status !== 'waiting') {
      return { canStart: false, error: 'Match is already running or completed.' };
    }

    // Allow single player start in dev mode or check against minPlayers
    if (room.players.length < room.settings.minPlayers) {
      return { canStart: false, error: `Need at least ${room.settings.minPlayers} players to begin match.` };
    }

    // Check if other non-owner players are ready
    const unreadyPlayers = room.players.filter(p => !p.isOwner && !p.isReady);
    if (unreadyPlayers.length > 0) {
      return { canStart: false, error: `Waiting for all players to be ready (${unreadyPlayers.map(p => p.username).join(', ')} not ready).` };
    }

    return { canStart: true };
  }

  /**
   * Sets room status
   */
  public setRoomStatus(roomId: string, status: RoomStatus): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.status = status;
    return room;
  }

  /**
   * Removes player from room or marks disconnected. Transfers ownership if owner leaves.
   */
  public leaveRoom(roomId: string, userId: string): { room?: RoomState; roomDeleted: boolean; newOwnerId?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { roomDeleted: true };

    const playerIndex = room.players.findIndex(p => p.id === userId);
    if (playerIndex === -1) return { room, roomDeleted: false };

    // If match is active, mark disconnected rather than removing completely so they can rejoin
    if (room.status === 'active') {
      room.players[playerIndex].connected = false;
      return { room, roomDeleted: false };
    }

    // Remove player
    room.players.splice(playerIndex, 1);

    // If no players remain, clean up room
    if (room.players.length === 0) {
      this.codeToRoomId.delete(room.code);
      this.rooms.delete(roomId);
      return { roomDeleted: true };
    }

    // If owner left, transfer ownership to the next player
    let newOwnerId: string | undefined;
    if (room.ownerId === userId) {
      const nextOwner = room.players[0];
      nextOwner.isOwner = true;
      nextOwner.isReady = true;
      room.ownerId = nextOwner.id;
      newOwnerId = nextOwner.id;
    }

    return { room, roomDeleted: false, newOwnerId };
  }

  /**
   * Socket association tracking
   */
  public bindSocket(socketId: string, roomId: string, userId: string): void {
    this.socketToPlayer.set(socketId, { roomId, userId });
  }

  public getSocketBinding(socketId: string): { roomId: string; userId: string } | undefined {
    return this.socketToPlayer.get(socketId);
  }

  public unbindSocket(socketId: string): { roomId: string; userId: string } | undefined {
    const binding = this.socketToPlayer.get(socketId);
    if (binding) {
      this.socketToPlayer.delete(socketId);
    }
    return binding;
  }
}
