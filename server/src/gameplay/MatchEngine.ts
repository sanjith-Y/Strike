import { Server } from 'socket.io';
import {
  MatchResultData,
  PlayerInputPayload,
  PlayerShootPayload,
  PlayerSnapshot,
  RoomPlayer,
  RoomSettings,
  ScoreboardEntry,
  Vector3Tuple,
  SafeZoneState,
} from '../types/game.js';
import { validateHit, WeaponState } from './WeaponSystem.js';
import { persistMatchResult } from '../auth/supabase.js';

// Pre-defined safe arena spawn points in 3D space
export const ARENA_SPAWN_POINTS: Vector3Tuple[] = [
  [-25, 0.5, -25],
  [25, 0.5, -25],
  [25, 0.5, 25],
  [-25, 0.5, 25],
  [0, 0.5, -30],
  [0, 0.5, 30],
  [-30, 0.5, 0],
  [30, 0.5, 0],
];

export interface ServerPlayerState {
  id: string;
  username: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  health: number;
  maxHealth: number;
  kills: number;
  deaths: number;
  isDead: boolean;
  respawnAt: number;
  isSprinting: boolean;
  weapon: WeaponState;
  lastInputSeq: number;
  lastInputTime: number;
  ping: number;
}

export class MatchEngine {
  public matchId: string;
  public roomId: string;
  public settings: RoomSettings;
  public startTime: number = 0;
  public endTime: number = 0;
  public isActive: boolean = false;
  public isFinished: boolean = false;
  public players: Map<string, ServerPlayerState> = new Map();
  public safeZone: SafeZoneState = {
    centerX: 0,
    centerZ: 0,
    radius: 45,
    phase: 1,
    dps: 1.5,
  };

  private tickInterval: NodeJS.Timeout | null = null;
  private io: Server;
  private currentTickSeq: number = 0;

  constructor(matchId: string, roomId: string, settings: RoomSettings, players: RoomPlayer[], io: Server) {
    this.matchId = matchId;
    this.roomId = roomId;
    this.settings = settings;
    this.io = io;

    // Initialize players at distinct spawn locations
    players.forEach((p, index) => {
      const spawnPoint = ARENA_SPAWN_POINTS[index % ARENA_SPAWN_POINTS.length];
      this.players.set(p.id, {
        id: p.id,
        username: p.username,
        position: [...spawnPoint] as Vector3Tuple,
        rotation: [0, 0, 0],
        health: 100,
        maxHealth: 100,
        kills: 0,
        deaths: 0,
        isDead: false,
        respawnAt: 0,
        isSprinting: false,
        weapon: new WeaponState(),
        lastInputSeq: 0,
        lastInputTime: Date.now(),
        ping: 0,
      });
    });
  }

  public start(): void {
    this.isActive = true;
    this.isFinished = false;
    this.startTime = Date.now();
    this.endTime = this.startTime + this.settings.matchDurationSec * 1000;
    this.safeZone = {
      centerX: 0,
      centerZ: 0,
      radius: 45,
      phase: 1,
      dps: 1.5,
    };

    // Start 30Hz simulation loop
    this.tickInterval = setInterval(() => {
      this.tick();
    }, 1000 / 30);

    console.log(`[MATCH] Match ${this.matchId} started in room ${this.roomId} with ${this.players.size} players`);
  }

  private tick(): void {
    if (!this.isActive || this.isFinished) return;

    this.currentTickSeq++;
    const now = Date.now();

    // 1. Process respawns and weapon reload updates
    for (const player of this.players.values()) {
      player.weapon.update(now);

      if (player.isDead && now >= player.respawnAt) {
        this.respawnPlayer(player);
      }
    }

    // 2. Simulate Safe Zone Progression & Blue Zone Storm Damage
    const totalDuration = this.settings.matchDurationSec * 1000;
    const elapsed = Math.min(totalDuration, now - this.startTime);
    const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

    if (progress < 0.35) {
      this.safeZone.phase = 1;
      this.safeZone.dps = 2.0;
      this.safeZone.radius = 45 - (progress / 0.35) * 15;
    } else if (progress < 0.70) {
      this.safeZone.phase = 2;
      this.safeZone.dps = 4.0;
      this.safeZone.radius = 30 - ((progress - 0.35) / 0.35) * 15;
    } else {
      this.safeZone.phase = 3;
      this.safeZone.dps = 8.0;
      this.safeZone.radius = Math.max(2, 15 - ((progress - 0.70) / 0.30) * 13);
    }

    // Apply safe zone damage to players caught outside the perimeter
    const dt = 1 / 30;
    for (const player of this.players.values()) {
      if (player.isDead) continue;

      const dist = Math.hypot(
        player.position[0] - this.safeZone.centerX,
        player.position[2] - this.safeZone.centerZ
      );

      if (dist > this.safeZone.radius) {
        player.health = Math.max(0, player.health - this.safeZone.dps * dt);

        if (player.health <= 0 && !player.isDead) {
          player.isDead = true;
          player.deaths += 1;
          player.respawnAt = now + this.settings.respawnDelaySec * 1000;

          this.io.to(this.roomId).emit('player_killed', {
            killerId: 'storm',
            victimId: player.id,
            killerName: 'Electric Storm (Blue Zone)',
            victimName: player.username,
            killerKills: 0,
            victimDeaths: player.deaths,
          });
        }
      }
    }

    // 3. Check match timer
    const timeRemainingSec = Math.max(0, Math.ceil((this.endTime - now) / 1000));
    if (timeRemainingSec <= 0) {
      this.finishMatch('time_expired');
      return;
    }

    // 4. Broadcast game state snapshot to room
    const snapshots: Record<string, PlayerSnapshot> = {};
    for (const [id, p] of this.players.entries()) {
      snapshots[id] = {
        id: p.id,
        username: p.username,
        position: p.position,
        rotation: p.rotation,
        health: p.health,
        maxHealth: p.maxHealth,
        kills: p.kills,
        deaths: p.deaths,
        isDead: p.isDead,
        isSprinting: p.isSprinting,
        isReloading: p.weapon.isReloading,
        ammo: p.weapon.ammoInMag,
        reserveAmmo: p.weapon.reserveAmmo,
        ping: p.ping,
      };
    }

    this.io.to(this.roomId).emit('game_tick', {
      seq: this.currentTickSeq,
      timestamp: now,
      players: snapshots,
      matchTimeRemaining: timeRemainingSec,
      safeZone: this.safeZone,
    });
  }

  /**
   * Respawns dead player at the safest spawn point
   */
  private respawnPlayer(player: ServerPlayerState): void {
    player.isDead = false;
    player.health = 100;
    player.weapon.reset();

    // Pick spawn point furthest from active opponents
    let bestPoint = ARENA_SPAWN_POINTS[0];
    let maxMinDist = -1;

    for (const spawn of ARENA_SPAWN_POINTS) {
      let minDistToEnemy = Infinity;
      for (const enemy of this.players.values()) {
        if (enemy.id !== player.id && !enemy.isDead) {
          const d = Math.hypot(spawn[0] - enemy.position[0], spawn[2] - enemy.position[2]);
          if (d < minDistToEnemy) minDistToEnemy = d;
        }
      }
      if (minDistToEnemy > maxMinDist) {
        maxMinDist = minDistToEnemy;
        bestPoint = spawn;
      }
    }

    // Add slight random offset to avoid exact overlap
    const offsetX = (Math.random() - 0.5) * 2;
    const offsetZ = (Math.random() - 0.5) * 2;
    player.position = [bestPoint[0] + offsetX, bestPoint[1], bestPoint[2] + offsetZ];

    this.io.to(this.roomId).emit('player_respawned', {
      playerId: player.id,
      position: player.position,
      health: player.health,
    });
  }

  /**
   * Handles player movement input from client with bounds and speed verification
   */
  public handlePlayerInput(playerId: string, payload: PlayerInputPayload): void {
    const player = this.players.get(playerId);
    if (!player || player.isDead || !this.isActive) return;

    const now = Date.now();
    const dt = Math.max(0.001, (now - player.lastInputTime) / 1000);

    // Arena boundary clamp [-45, 45] on X/Z, [0, 15] on Y
    const clampedX = Math.max(-45, Math.min(45, payload.position[0]));
    const clampedY = Math.max(0, Math.min(15, payload.position[1]));
    const clampedZ = Math.max(-45, Math.min(45, payload.position[2]));

    // Speed check (sprint max speed ~12 units/sec + 50% network tolerance)
    const moveDist = Math.hypot(clampedX - player.position[0], clampedZ - player.position[2]);
    const maxAllowedDist = 20 * dt + 3.0; // grace distance for latency spikes

    if (moveDist <= maxAllowedDist) {
      player.position = [clampedX, clampedY, clampedZ];
    } else {
      // Interpolate towards target if slightly exceeding, or reject teleport
      const ratio = maxAllowedDist / moveDist;
      player.position[0] += (clampedX - player.position[0]) * ratio;
      player.position[2] += (clampedZ - player.position[2]) * ratio;
      player.position[1] = clampedY;
    }

    player.rotation = payload.rotation;
    player.isSprinting = payload.isSprinting;
    player.lastInputSeq = payload.seq;
    player.lastInputTime = now;
  }

  /**
   * Handles authoritative weapon shooting and hit registration
   */
  public handleShoot(shooterId: string, payload: PlayerShootPayload): void {
    const shooter = this.players.get(shooterId);
    if (!shooter || shooter.isDead || !this.isActive) return;

    const now = Date.now();
    const fired = shooter.weapon.recordShot(now);
    if (!fired) return;

    // Broadcast muzzle flash and shot sound to all players in the room
    this.io.to(this.roomId).emit('player_shot', {
      shooterId,
      origin: payload.origin,
      direction: payload.direction,
    });

    // Authoritatively check for hit candidates
    let closestTargetId: string | null = null;
    let closestDist = Infinity;

    for (const [targetId, target] of this.players.entries()) {
      if (targetId === shooterId || target.isDead) continue;

      const { hit, distance } = validateHit(
        payload.origin,
        payload.direction,
        target.position,
        1.1, // radius
        2.2, // height
        shooter.weapon.weapon.range
      );

      if (hit && distance < closestDist) {
        closestDist = distance;
        closestTargetId = targetId;
      }
    }

    if (closestTargetId) {
      const target = this.players.get(closestTargetId)!;
      const damage = shooter.weapon.weapon.damage;
      target.health = Math.max(0, target.health - damage);

      this.io.to(this.roomId).emit('player_damaged', {
        targetId: target.id,
        attackerId: shooter.id,
        damage,
        currentHealth: target.health,
      });

      // Check if target was eliminated
      if (target.health <= 0 && !target.isDead) {
        target.isDead = true;
        target.deaths += 1;
        shooter.kills += 1;
        target.respawnAt = now + this.settings.respawnDelaySec * 1000;

        this.io.to(this.roomId).emit('player_killed', {
          killerId: shooter.id,
          victimId: target.id,
          killerName: shooter.username,
          victimName: target.username,
          killerKills: shooter.kills,
          victimDeaths: target.deaths,
        });

        // Check victory condition
        if (shooter.kills >= this.settings.killTarget) {
          this.finishMatch('kill_target_reached', shooter.id);
        }
      }
    }
  }

  /**
   * Handles player reload request
   */
  public handleReload(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player || player.isDead || !this.isActive) return;

    const now = Date.now();
    player.weapon.startReload(now);
  }

  /**
   * Finishes the match, computes scoreboard, persists to DB, and notifies room
   */
  public finishMatch(reason: 'time_expired' | 'kill_target_reached' | 'abandoned', explicitWinnerId?: string): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.isActive = false;

    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }

    // Rank players by kills descending, then deaths ascending
    const playerList = Array.from(this.players.values());
    playerList.sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);

    let winnerId = explicitWinnerId || (playerList.length > 0 ? playerList[0].id : null);
    const winnerName = playerList.find(p => p.id === winnerId)?.username || 'No Winner';

    const scoreboard: ScoreboardEntry[] = playerList.map((p, idx) => ({
      userId: p.id,
      username: p.username,
      kills: p.kills,
      deaths: p.deaths,
      score: p.kills * 100,
      placement: idx + 1,
    }));

    const resultData: MatchResultData = {
      matchId: this.matchId,
      roomId: this.roomId,
      startedAt: new Date(this.startTime).toISOString(),
      endedAt: new Date().toISOString(),
      winnerUserId: winnerId,
      winnerUsername: winnerName,
      reason,
      scoreboard,
    };

    // Emit match_ended to all clients in the room
    this.io.to(this.roomId).emit('match_ended', resultData);

    // Asynchronously persist results to database
    persistMatchResult(resultData).catch(err => {
      console.error('[MATCH ENGINE] Error during persistence:', err);
    });

    console.log(`[MATCH] Match ${this.matchId} concluded. Winner: ${winnerName} (${reason})`);
  }

  public stop(): void {
    this.isActive = false;
    this.isFinished = true;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }
}
