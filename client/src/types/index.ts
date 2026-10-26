export type Vector3Tuple = [number, number, number];

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatarUrl?: string;
  isGuest?: boolean;
}

export interface PlayerStats {
  matches_played: number;
  matches_won: number;
  total_kills: number;
  total_deaths: number;
  win_rate_pct: number;
  kd_ratio: number;
}

export interface RoomSettings {
  minPlayers: number;
  maxPlayers: number;
  matchDurationSec: number;
  killTarget: number;
  respawnDelaySec: number;
}

export type RoomStatus = 'waiting' | 'starting' | 'active' | 'finished';

export interface RoomPlayer {
  id: string;
  username: string;
  avatarUrl?: string;
  isReady: boolean;
  isOwner: boolean;
  connected: boolean;
  joinedAt: number;
}

export interface RoomState {
  id: string;
  code: string;
  ownerId: string;
  status: RoomStatus;
  settings: RoomSettings;
  players: RoomPlayer[];
  createdAt: number;
}

export interface PlayerSnapshot {
  id: string;
  username: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  health: number;
  maxHealth: number;
  kills: number;
  deaths: number;
  isDead: boolean;
  isSprinting: boolean;
  isReloading: boolean;
  ammo: number;
  reserveAmmo: number;
  ping: number;
}

export interface ScoreboardEntry {
  userId: string;
  username: string;
  kills: number;
  deaths: number;
  score: number;
  placement: number;
}

export interface MatchResultData {
  matchId: string;
  roomId: string;
  startedAt: string;
  endedAt: string;
  winnerUserId: string | null;
  winnerUsername: string;
  reason: 'time_expired' | 'kill_target_reached' | 'abandoned';
  scoreboard: ScoreboardEntry[];
}

export interface KillNotification {
  id: string;
  killerName: string;
  victimName: string;
  isLocalKiller: boolean;
  isLocalVictim: boolean;
  timestamp: number;
}

export interface GameSettings {
  mouseSensitivity: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  soundVolume: number;
  musicVolume: number;
  crosshairColor: string;
  crosshairStyle: 'classic' | 'dot' | 'circle';
}
