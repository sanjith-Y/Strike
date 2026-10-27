export type Vector3Tuple = [number, number, number];

export interface UserProfile {
  id: string;
  email?: string;
  username: string;
  avatarUrl?: string;
  isGuest?: boolean;
  level?: number;
  exp?: number;
  coins?: number;
  diamonds?: number;
  rank?: string;
  rankPoints?: number;
}

export interface CharacterItem {
  id: string;
  name: string;
  title: string;
  ability: string;
  abilityDesc: string;
  armorColor: number;
  glowColor: number;
  priceCoins: number;
  priceDiamonds: number;
  owned: boolean;
  avatarUrl: string;
}

export interface CostumeItem {
  id: string;
  name: string;
  category: 'bundle' | 'mask' | 'top' | 'pants';
  rarity: 'rare' | 'epic' | 'mythic' | 'legendary';
  armorColor: number;
  glowColor: number;
  accentColor: number;
  headStyle?: 'helmet' | 'visor' | 'cyber_horns' | 'crown';
  torsoStyle?: 'heavy' | 'ninja' | 'mecha' | 'vest';
  priceCoins: number;
  priceDiamonds: number;
  owned: boolean;
  iconBg: string;
}

export interface WeaponItem {
  id: string;
  name: string;
  category: 'AR' | 'SMG' | 'Shotgun' | 'Sniper' | 'Pistol';
  rarity: 'rare' | 'epic' | 'legendary';
  damage: number;
  fireRate: number; // RPM
  fireRateMs: number;
  magazineCapacity: number;
  maxReserveAmmo: number;
  reloadDurationMs: number;
  range: number;
  bodyColor: number;
  glowColor: number;
  barrelLength: number;
  priceCoins: number;
  priceDiamonds: number;
  owned: boolean;
}

export type GameModeType = 'BR_RANKED' | 'CS_RANKED' | 'TRAINING' | 'CLASSIC_BR';
export type TeamModeType = 'SOLO' | 'DUO' | 'SQUAD';

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
  gameMode?: GameModeType;
  teamMode?: TeamModeType;
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
  characterId?: string;
  costumeId?: string;
  weaponId?: string;
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
  costumeId?: string;
  weaponId?: string;
}

export interface ScoreboardEntry {
  userId: string;
  username: string;
  kills: number;
  deaths: number;
  score: number;
  placement: number;
  coinsEarned?: number;
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
  coinsAwarded?: number;
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
