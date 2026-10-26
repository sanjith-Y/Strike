import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './supabase';
import { MatchResultData, PlayerSnapshot, RoomSettings, RoomState, Vector3Tuple } from '../types';

class SocketService {
  public socket: Socket | null = null;
  public isConnected: boolean = false;
  public ping: number = 0;
  private pingInterval: any = null;

  public async connect(): Promise<Socket> {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    const token = await getAuthToken();
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('[SOCKET] Connected to server:', this.socket?.id);
      this.startPingMonitor();
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('[SOCKET] Disconnected:', reason);
      this.stopPingMonitor();
    });

    this.socket.on('server_pong', (data: { clientTime: number }) => {
      if (data?.clientTime) {
        this.ping = Math.round(Date.now() - data.clientTime);
      }
    });

    return this.socket;
  }

  private startPingMonitor() {
    this.stopPingMonitor();
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('client_ping', { clientTime: Date.now() });
      }
    }, 3000);
  }

  private stopPingMonitor() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public disconnect() {
    this.stopPingMonitor();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // --- Room Actions ---
  public createRoom(settings?: Partial<RoomSettings>) {
    this.socket?.emit('create_room', { settings });
  }

  public joinRoom(code: string) {
    this.socket?.emit('join_room', { code: code.trim().toUpperCase() });
  }

  public toggleReady(isReady?: boolean) {
    this.socket?.emit('toggle_ready', { isReady });
  }

  public updateSettings(settings: Partial<RoomSettings>) {
    this.socket?.emit('update_settings', settings);
  }

  public startMatch() {
    this.socket?.emit('start_match');
  }

  public leaveRoom() {
    this.socket?.emit('leave_room');
  }

  // --- Gameplay Actions ---
  public sendPlayerInput(seq: number, position: Vector3Tuple, rotation: Vector3Tuple, isSprinting: boolean, isJumping: boolean) {
    this.socket?.emit('player_input', {
      seq,
      position,
      rotation,
      isSprinting,
      isJumping,
      timestamp: Date.now(),
    });
  }

  public sendShoot(origin: Vector3Tuple, direction: Vector3Tuple) {
    this.socket?.emit('player_shoot', {
      origin,
      direction,
      clientTimestamp: Date.now(),
    });
  }

  public sendReload() {
    this.socket?.emit('player_reload');
  }
}

export const socketService = new SocketService();
