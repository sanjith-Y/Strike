// ============================================================
// ARENA STRIKE — MULTIPLAYER TYPES & PROTOCOL DEFINITIONS
// ============================================================

export type Vector3Tuple = [number, number, number];

export interface SafeZoneState {
  centerX: number;
  centerZ: number;
  radius: number;
  phase: number;
  dps: number;
}

export interface UserIdentity {
  id: string;
  username: string;
  avatarUrl?: string;
  isGuest?: boolean;
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

export interface PlayerInputPayload {
  seq: number;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  velocity?: Vector3Tuple;
  isSprinting: boolean;
  isJumping: boolean;
  timestamp: number;
}

export interface PlayerShootPayload {
  origin: Vector3Tuple;
  direction: Vector3Tuple;
  targetId?: string;
  clientTimestamp: number;
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
