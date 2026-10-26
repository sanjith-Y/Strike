import { Vector3Tuple } from '../types/game.js';

export interface WeaponConfig {
  id: string;
  name: string;
  damage: number;
  fireRateMs: number; // Cooldown between shots
  magazineCapacity: number;
  maxReserveAmmo: number;
  reloadDurationMs: number;
  range: number;
  spread: number;
}

export const STARTER_RIFLE: WeaponConfig = {
  id: 'assault_rifle_mk1',
  name: 'AR-7 Valkyrie',
  damage: 25, // 4 shots to eliminate 100HP
  fireRateMs: 125, // 8 rounds per second
  magazineCapacity: 30,
  maxReserveAmmo: 120,
  reloadDurationMs: 2000, // 2.0s reload
  range: 120, // Max effective range in 3D units
  spread: 0.02,
};

export class WeaponState {
  public weapon: WeaponConfig;
  public ammoInMag: number;
  public reserveAmmo: number;
  public lastShotTime: number = 0;
  public reloadStartTime: number = 0;
  public isReloading: boolean = false;

  constructor(weapon: WeaponConfig = STARTER_RIFLE) {
    this.weapon = weapon;
    this.ammoInMag = weapon.magazineCapacity;
    this.reserveAmmo = weapon.maxReserveAmmo;
  }

  public canShoot(now: number): { allowed: boolean; reason?: string } {
    if (this.isReloading) {
      if (now - this.reloadStartTime >= this.weapon.reloadDurationMs) {
        this.completeReload();
      } else {
        return { allowed: false, reason: 'reloading' };
      }
    }

    if (this.ammoInMag <= 0) {
      return { allowed: false, reason: 'empty_magazine' };
    }

    if (now - this.lastShotTime < this.weapon.fireRateMs) {
      return { allowed: false, reason: 'rate_limited' };
    }

    return { allowed: true };
  }

  public recordShot(now: number): boolean {
    const { allowed } = this.canShoot(now);
    if (!allowed) return false;

    this.ammoInMag -= 1;
    this.lastShotTime = now;
    return true;
  }

  public startReload(now: number): boolean {
    if (this.isReloading) return false;
    if (this.ammoInMag >= this.weapon.magazineCapacity) return false;
    if (this.reserveAmmo <= 0) return false;

    this.isReloading = true;
    this.reloadStartTime = now;
    return true;
  }

  public update(now: number): void {
    if (this.isReloading && now - this.reloadStartTime >= this.weapon.reloadDurationMs) {
      this.completeReload();
    }
  }

  private completeReload(): void {
    const needed = this.weapon.magazineCapacity - this.ammoInMag;
    const taken = Math.min(needed, this.reserveAmmo);
    this.ammoInMag += taken;
    this.reserveAmmo -= taken;
    this.isReloading = false;
  }

  public reset(): void {
    this.ammoInMag = this.weapon.magazineCapacity;
    this.reserveAmmo = this.weapon.maxReserveAmmo;
    this.lastShotTime = 0;
    this.reloadStartTime = 0;
    this.isReloading = false;
  }
}

/**
 * Validates whether a bullet ray intersects a player's bounding cylinder
 * @param rayOrigin Shooter position / weapon muzzle
 * @param rayDir Normalized shooting direction vector
 * @param targetPos Target player position
 * @param cylinderRadius Radius of player hit cylinder (approx 0.7 units)
 * @param cylinderHeight Height of player (approx 2.0 units)
 * @param maxRange Max weapon distance
 */
export function validateHit(
  rayOrigin: Vector3Tuple,
  rayDir: Vector3Tuple,
  targetPos: Vector3Tuple,
  cylinderRadius = 0.9, // slightly forgiving for latency compensation
  cylinderHeight = 2.2,
  maxRange = 120
): { hit: boolean; distance: number } {
  // Vector from ray origin to target base
  const dx = targetPos[0] - rayOrigin[0];
  const dy = targetPos[1] - rayOrigin[1];
  const dz = targetPos[2] - rayOrigin[2];

  const totalDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (totalDist > maxRange) {
    return { hit: false, distance: totalDist };
  }

  // Normalize ray direction
  const mag = Math.sqrt(rayDir[0] * rayDir[0] + rayDir[1] * rayDir[1] + rayDir[2] * rayDir[2]);
  if (mag === 0) return { hit: false, distance: totalDist };
  const nx = rayDir[0] / mag;
  const ny = rayDir[1] / mag;
  const nz = rayDir[2] / mag;

  // Projection of vector to target onto ray direction
  const dot = dx * nx + dy * ny + dz * nz;
  if (dot < 0) {
    // Target is behind shooter
    return { hit: false, distance: totalDist };
  }

  // Closest point on ray to target center (at y = targetPos[1] + height/2)
  const targetCenterY = targetPos[1] + cylinderHeight / 2;
  const dyCenter = targetCenterY - rayOrigin[1];
  const dotCenter = dx * nx + dyCenter * ny + dz * nz;

  const closestX = rayOrigin[0] + nx * dotCenter;
  const closestY = rayOrigin[1] + ny * dotCenter;
  const closestZ = rayOrigin[2] + nz * dotCenter;

  // Distance from closest point to cylinder center line
  const distSqXZ = (closestX - targetPos[0]) ** 2 + (closestZ - targetPos[2]) ** 2;
  const withinRadius = distSqXZ <= cylinderRadius * cylinderRadius;
  const withinHeight = closestY >= targetPos[1] - 0.2 && closestY <= targetPos[1] + cylinderHeight + 0.2;

  if (withinRadius && withinHeight) {
    return { hit: true, distance: dotCenter };
  }

  return { hit: false, distance: totalDist };
}
