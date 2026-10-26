import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../../rooms/RoomManager.js';
import { STARTER_RIFLE, validateHit, WeaponState } from '../WeaponSystem.js';

describe('ARENA STRIKE — Room Management Logic', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  it('generates a 6-character uppercase alphanumeric room code', () => {
    const code = roomManager.generateRoomCode();
    expect(code).toHaveLength(6);
    expect(code).toMatch(/^[A-Z0-9]+$/);
    // Should not include easily confused characters 0, O, 1, I
    expect(code).not.toMatch(/[0O1I]/);
  });

  it('creates a room with owner and default settings', () => {
    const owner = { id: 'user-1', username: 'StrikerAlpha' };
    const room = roomManager.createRoom(owner);

    expect(room.id).toBeDefined();
    expect(room.code).toHaveLength(6);
    expect(room.ownerId).toBe('user-1');
    expect(room.players).toHaveLength(1);
    expect(room.players[0].isOwner).toBe(true);
    expect(room.players[0].isReady).toBe(true);
    expect(room.settings.maxPlayers).toBe(8);
    expect(room.settings.matchDurationSec).toBe(300);
  });

  it('allows players to join and respects capacity limit', () => {
    const owner = { id: 'user-1', username: 'Host' };
    const room = roomManager.createRoom(owner, { maxPlayers: 2 });

    const player2 = { id: 'user-2', username: 'Challenger' };
    const join2 = roomManager.joinRoom(room.code, player2);
    expect(join2.success).toBe(true);
    expect(join2.room?.players).toHaveLength(2);

    const player3 = { id: 'user-3', username: 'Latecomer' };
    const join3 = roomManager.joinRoom(room.code, player3);
    expect(join3.success).toBe(false);
    expect(join3.error).toContain('full');
  });

  it('handles player leaving and transfers ownership', () => {
    const owner = { id: 'user-1', username: 'Host' };
    const room = roomManager.createRoom(owner);
    const player2 = { id: 'user-2', username: 'Player2' };
    roomManager.joinRoom(room.code, player2);

    const leaveRes = roomManager.leaveRoom(room.id, 'user-1');
    expect(leaveRes.roomDeleted).toBe(false);
    expect(leaveRes.newOwnerId).toBe('user-2');
    expect(leaveRes.room?.ownerId).toBe('user-2');
  });
});

describe('ARENA STRIKE — Authoritative Weapon System', () => {
  it('enforces starter rifle magazine and fire rate cooldown', () => {
    const weaponState = new WeaponState(STARTER_RIFLE);
    const now = 1000;

    // First shot should succeed
    expect(weaponState.canShoot(now).allowed).toBe(true);
    const fired = weaponState.recordShot(now);
    expect(fired).toBe(true);
    expect(weaponState.ammoInMag).toBe(29);

    // Immediate next shot within fire rate cooldown should be rejected
    const tooSoon = now + 50; // 50ms < 125ms cooldown
    expect(weaponState.canShoot(tooSoon).allowed).toBe(false);
    expect(weaponState.canShoot(tooSoon).reason).toBe('rate_limited');

    // After cooldown period passes, shot should be allowed
    const validTime = now + 130;
    expect(weaponState.canShoot(validTime).allowed).toBe(true);
  });

  it('handles reload timing and ammo replenishment', () => {
    const weaponState = new WeaponState(STARTER_RIFLE);
    weaponState.ammoInMag = 5;
    const now = 1000;

    expect(weaponState.startReload(now)).toBe(true);
    expect(weaponState.isReloading).toBe(true);
    expect(weaponState.canShoot(now + 100).allowed).toBe(false);

    // Before reload completes (1500ms < 2000ms)
    weaponState.update(now + 1500);
    expect(weaponState.isReloading).toBe(true);

    // After reload completes (2100ms > 2000ms)
    weaponState.update(now + 2100);
    expect(weaponState.isReloading).toBe(false);
    expect(weaponState.ammoInMag).toBe(30);
    expect(weaponState.reserveAmmo).toBe(120 - 25);
  });
});

describe('ARENA STRIKE — Hit Detection & Raycasting Math', () => {
  it('detects a direct hit along the raycast line', () => {
    const origin: [number, number, number] = [0, 1.5, 0];
    const direction: [number, number, number] = [0, 0, 1]; // Looking down +Z
    const targetPos: [number, number, number] = [0, 0, 10]; // Target at Z=10

    const result = validateHit(origin, direction, targetPos, 0.9, 2.2, 120);
    expect(result.hit).toBe(true);
    expect(result.distance).toBeCloseTo(10, 0);
  });

  it('rejects shots aimed in the opposite direction (behind shooter)', () => {
    const origin: [number, number, number] = [0, 1.5, 0];
    const direction: [number, number, number] = [0, 0, 1]; // Looking down +Z
    const targetBehind: [number, number, number] = [0, 0, -10]; // Target at Z=-10

    const result = validateHit(origin, direction, targetBehind, 0.9, 2.2, 120);
    expect(result.hit).toBe(false);
  });

  it('rejects shots exceeding maximum weapon range', () => {
    const origin: [number, number, number] = [0, 1.5, 0];
    const direction: [number, number, number] = [0, 0, 1];
    const targetTooFar: [number, number, number] = [0, 0, 150]; // Range is 120

    const result = validateHit(origin, direction, targetTooFar, 0.9, 2.2, 120);
    expect(result.hit).toBe(false);
  });
});
