import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArenaWorld } from './ArenaWorld';
import { PlayerMesh } from './PlayerMesh';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { GameHUD } from './GameHUD';
import { TouchControls } from './TouchControls';
import { socketService } from '../services/socket';
import { soundSystem } from '../services/audio';
import { GameSettings, KillNotification, MatchResultData, PlayerSnapshot, ScoreboardEntry, Vector3Tuple } from '../types';
import { getEquippedIds, addCoins } from '../services/catalog';

interface GameCanvasProps {
  currentUserId: string;
  username: string;
  settings: GameSettings;
  onExit: () => void;
  onPlayAgain?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  currentUserId,
  username,
  settings,
  onExit,
  onPlayAgain,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // HUD State
  const [health, setHealth] = useState(100);
  const [maxHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [reserveAmmo, setReserveAmmo] = useState(120);
  const [isReloading, setIsReloading] = useState(false);
  const [kills, setKills] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [matchTimeRemaining, setMatchTimeRemaining] = useState(300);
  const [isDead, setIsDead] = useState(false);
  const [respawnTimeRemaining, setRespawnTimeRemaining] = useState(3);
  const [hitMarkerActive, setHitMarkerActive] = useState(false);
  const [damageFlashActive, setDamageFlashActive] = useState(false);
  const [killfeed, setKillfeed] = useState<KillNotification[]>([]);
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResultData | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Key tracking & Movement refs
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mobileMove = useRef<{ forward: number; right: number }>({ forward: 0, right: 0 });
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  const playerVelocityY = useRef<number>(0);
  const isGrounded = useRef<boolean>(true);
  const inputSeq = useRef<number>(0);

  // Remote player meshes
  const remotePlayers = useRef<Map<string, { mesh: PlayerMesh; targetPos: THREE.Vector3; targetRot: THREE.Euler }>>(new Map());

  // Scene elements ref for animation loop
  const sceneElements = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    world: ArenaWorld;
    localMesh: PlayerMesh;
    tpsCamera: ThirdPersonCamera;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    soundSystem.setVolumes(settings.soundVolume, settings.musicVolume);

    // 1. Setup Three.js Scene, Camera, Renderer
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: settings.graphicsQuality !== 'low', powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.graphicsQuality === 'high' ? 2 : 1.5));
    renderer.shadowMap.enabled = settings.graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 2. Build 3D Arena World
    const world = new ArenaWorld(scene);

    // 3. Create Local Player Mesh & Camera
    const equipped = getEquippedIds();
    const localMesh = new PlayerMesh(username, false, equipped.costumeId, equipped.weaponId);
    scene.add(localMesh.group);

    const tpsCamera = new ThirdPersonCamera(camera, world);
    tpsCamera.sensitivity = settings.mouseSensitivity * 0.003;

    const clock = new THREE.Clock();
    sceneElements.current = {
      scene,
      camera,
      renderer,
      world,
      localMesh,
      tpsCamera,
      clock,
    };

    // Play match start fanfare
    soundSystem.playMatchStartSound();

    // 4. Socket Listeners for Real-time Gameplay
    const socket = socketService.socket;
    if (socket) {
      // Game Tick
      socket.on('game_tick', (data: { seq: number; players: Record<string, PlayerSnapshot>; matchTimeRemaining: number }) => {
        setMatchTimeRemaining(data.matchTimeRemaining);

        // Update local player vitals
        const mySnap = data.players[currentUserId];
        if (mySnap) {
          setHealth(mySnap.health);
          setKills(mySnap.kills);
          setDeaths(mySnap.deaths);
          setIsDead(mySnap.isDead);
          setAmmo(mySnap.ammo);
          setReserveAmmo(mySnap.reserveAmmo);
          setIsReloading(mySnap.isReloading);
        }

        // Update scoreboard
        const list: ScoreboardEntry[] = Object.values(data.players).map((p, idx) => ({
          userId: p.id,
          username: p.username,
          kills: p.kills,
          deaths: p.deaths,
          score: p.kills * 100,
          placement: idx + 1,
        }));
        list.sort((a, b) => b.kills - a.kills || a.deaths - b.deaths);
        setScoreboard(list);

        // Update remote player meshes
        for (const [id, snap] of Object.entries(data.players)) {
          if (id === currentUserId) continue;

          let entry = remotePlayers.current.get(id);
          if (!entry) {
            const mesh = new PlayerMesh(snap.username, true);
            scene.add(mesh.group);
            entry = {
              mesh,
              targetPos: new THREE.Vector3(...snap.position),
              targetRot: new THREE.Euler(...snap.rotation),
            };
            remotePlayers.current.set(id, entry);
          }

          // Update target pos & rot for smooth interpolation
          entry.targetPos.set(...snap.position);
          entry.targetRot.set(...snap.rotation);
          entry.mesh.updateNametag(snap.health);
          entry.mesh.group.visible = !snap.isDead;
        }

        // Remove disconnected players
        for (const [id, entry] of remotePlayers.current.entries()) {
          if (!data.players[id]) {
            scene.remove(entry.mesh.group);
            remotePlayers.current.delete(id);
          }
        }
      });

      // Player Shot Event (Visual tracer + sound)
      socket.on('player_shot', (data: { shooterId: string; origin: Vector3Tuple; direction: Vector3Tuple }) => {
        soundSystem.playShootSound();

        // Spawn bullet tracer beam
        const start = new THREE.Vector3(...data.origin);
        const dir = new THREE.Vector3(...data.direction).normalize();
        const end = start.clone().add(dir.clone().multiplyScalar(40));

        const tracerGeo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const tracerMat = new THREE.LineBasicMaterial({
          color: data.shooterId === currentUserId ? 0x00f0ff : 0xff0055,
          linewidth: 2,
        });
        const tracer = new THREE.Line(tracerGeo, tracerMat);
        scene.add(tracer);

        // Trigger muzzle flash on shooter mesh
        if (data.shooterId === currentUserId) {
          localMesh.triggerMuzzleFlash();
        } else {
          const entry = remotePlayers.current.get(data.shooterId);
          if (entry) entry.mesh.triggerMuzzleFlash();
        }

        // Dispose tracer after 50ms
        setTimeout(() => {
          scene.remove(tracer);
          tracerGeo.dispose();
          tracerMat.dispose();
        }, 50);
      });

      // Player Damaged Event
      socket.on('player_damaged', (data: { targetId: string; attackerId: string; damage: number; currentHealth: number }) => {
        if (data.targetId === currentUserId) {
          // Local player took damage
          setDamageFlashActive(true);
          setTimeout(() => setDamageFlashActive(false), 200);
        } else if (data.attackerId === currentUserId) {
          // Local player inflicted damage -> hitmarker!
          soundSystem.playHitSound();
          setHitMarkerActive(true);
          setTimeout(() => setHitMarkerActive(false), 150);
        }
      });

      // Player Killed Event
      socket.on('player_killed', (data: { killerId: string; victimId: string; killerName: string; victimName: string }) => {
        const isLocalKiller = data.killerId === currentUserId;
        const isLocalVictim = data.victimId === currentUserId;

        if (isLocalKiller) {
          soundSystem.playKillSound();
        }

        const notif: KillNotification = {
          id: Math.random().toString(),
          killerName: data.killerName,
          victimName: data.victimName,
          isLocalKiller,
          isLocalVictim,
          timestamp: Date.now(),
        };

        setKillfeed(prev => [notif, ...prev.slice(0, 5)]);

        if (isLocalVictim) {
          let count = 3;
          setRespawnTimeRemaining(count);
          const interval = setInterval(() => {
            count--;
            setRespawnTimeRemaining(count);
            if (count <= 0) clearInterval(interval);
          }, 1000);
        }
      });

      // Player Respawned Event
      socket.on('player_respawned', (data: { playerId: string; position: Vector3Tuple; health: number }) => {
        if (data.playerId === currentUserId) {
          soundSystem.playRespawnSound();
          playerPos.current.set(...data.position);
          setIsDead(false);
          setHealth(100);
        }
      });

      // Match Ended Event
      socket.on('match_ended', (data: MatchResultData) => {
        setMatchResult(data);
        // Award Gold Coins for participating & kills
        addCoins(250);
        soundSystem.playKillSound();
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      });
    }

    // 5. Input Listeners (Keyboard, Mouse, Pointer Lock)
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'KeyR') {
        handleReload();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        setShowScoreboard(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
      if (e.code === 'Tab') {
        setShowScoreboard(false);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement && sceneElements.current) {
        sceneElements.current.tpsCamera.handleMouseMove(e.movementX, e.movementY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement === renderer.domElement) {
        handleShoot();
      }
    };

    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      setIsPointerLocked(locked);
    };

    const handleResize = () => {
      if (!mountRef.current || !sceneElements.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      sceneElements.current.camera.aspect = w / h;
      sceneElements.current.camera.updateProjectionMatrix();
      sceneElements.current.renderer.setSize(w, h);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('resize', handleResize);

    // 6. Main Render & Physics Simulation Loop
    let animationFrameId: number;
    let lastNetworkSync = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!sceneElements.current) return;

      const { delta } = { delta: Math.min(0.1, clock.getDelta()) };
      const time = clock.getElapsedTime();

      // --- Local Player Movement ---
      if (!isDead) {
        let moveForward = 0;
        let moveRight = 0;

        // Desktop keyboard input
        if (keysPressed.current['KeyW']) moveForward += 1;
        if (keysPressed.current['KeyS']) moveForward -= 1;
        if (keysPressed.current['KeyA']) moveRight -= 1;
        if (keysPressed.current['KeyD']) moveRight += 1;

        // Mobile touch input
        if (mobileMove.current.forward !== 0 || mobileMove.current.right !== 0) {
          moveForward += mobileMove.current.forward;
          moveRight += mobileMove.current.right;
        }

        const isSprinting = Boolean(keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight']);
        const moveSpeed = (isSprinting ? 9.5 : 6.0) * delta;

        // Calculate world movement direction based on camera yaw
        const yaw = tpsCamera.yaw;
        const forwardDir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
        const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

        const moveVec = new THREE.Vector3()
          .add(forwardDir.multiplyScalar(moveForward))
          .add(rightDir.multiplyScalar(moveRight));

        if (moveVec.lengthSq() > 0.001) {
          moveVec.normalize().multiplyScalar(moveSpeed);
          playerPos.current.add(moveVec);
        }

        // Jumping & Gravity
        const gravity = -20 * delta;
        playerVelocityY.current += gravity;
        playerPos.current.y += playerVelocityY.current * delta;

        // Ground Collision (Y = 0.5)
        if (playerPos.current.y <= 0.5) {
          playerPos.current.y = 0.5;
          playerVelocityY.current = 0;
          isGrounded.current = true;
        }

        // Jump trigger
        if (keysPressed.current['Space'] && isGrounded.current) {
          playerVelocityY.current = 7.5;
          isGrounded.current = false;
          soundSystem.playJumpSound();
        }

        // Arena Collision against walls & crates
        const correctedPos = world.checkSphereCollision(playerPos.current, 0.6);
        playerPos.current.copy(correctedPos);

        // Update Local Mesh
        localMesh.group.position.copy(playerPos.current);
        localMesh.group.rotation.y = yaw;
        localMesh.animateRun(moveVec.length() / delta, time);

        // Send Authoritative Movement Update to Server (approx 20-30 times per sec)
        if (Date.now() - lastNetworkSync > 33) {
          inputSeq.current++;
          socketService.sendPlayerInput(
            inputSeq.current,
            [playerPos.current.x, playerPos.current.y, playerPos.current.z],
            [0, yaw, 0],
            isSprinting,
            !isGrounded.current
          );
          lastNetworkSync = Date.now();
        }
      }

      // Update Third Person Camera
      tpsCamera.update(playerPos.current, delta);

      // Interpolate Remote Players
      for (const entry of remotePlayers.current.values()) {
        entry.mesh.group.position.lerp(entry.targetPos, 15 * delta);
        entry.mesh.group.quaternion.slerp(new THREE.Quaternion().setFromEuler(entry.targetRot), 15 * delta);
        const dist = entry.mesh.group.position.distanceTo(entry.targetPos);
        entry.mesh.animateRun(dist / delta, time);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('resize', handleResize);

      if (socket) {
        socket.off('game_tick');
        socket.off('player_shot');
        socket.off('player_damaged');
        socket.off('player_killed');
        socket.off('player_respawned');
        socket.off('match_ended');
      }

      world.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [currentUserId, username, settings]);

  const handleShoot = () => {
    if (isDead || isReloading || ammo <= 0 || !sceneElements.current) return;

    const { tpsCamera, localMesh } = sceneElements.current;
    const muzzlePos = localMesh.getWorldMuzzlePosition();
    const forward = tpsCamera.getForwardVector();

    // Send authoritative shot request to server
    socketService.sendShoot(
      [muzzlePos.x, muzzlePos.y, muzzlePos.z],
      [forward.x, forward.y, forward.z]
    );
  };

  const handleReload = () => {
    if (isReloading || ammo >= 30 || reserveAmmo <= 0) return;
    soundSystem.playReloadSound();
    socketService.sendReload();
  };

  const handleLockPointer = () => {
    if (mountRef.current && sceneElements.current) {
      sceneElements.current.renderer.domElement.requestPointerLock();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* 2D HUD Layer */}
      <GameHUD
        health={health}
        maxHealth={maxHealth}
        ammo={ammo}
        reserveAmmo={reserveAmmo}
        isReloading={isReloading}
        kills={kills}
        deaths={deaths}
        matchTimeRemaining={matchTimeRemaining}
        isDead={isDead}
        respawnTimeRemaining={respawnTimeRemaining}
        hitMarkerActive={hitMarkerActive}
        damageFlashActive={damageFlashActive}
        killfeed={killfeed}
        scoreboard={scoreboard}
        showScoreboard={showScoreboard}
        matchResult={matchResult}
        currentUserId={currentUserId}
        isPointerLocked={isPointerLocked}
        onLockPointer={handleLockPointer}
        onReload={handleReload}
        onLeaveMatch={onExit}
        onPlayAgain={onPlayAgain}
        crosshairColor={settings.crosshairColor}
        crosshairStyle={settings.crosshairStyle}
      />

      {/* Mobile On-Screen Controls */}
      <TouchControls
        onMove={(fwd, rt) => {
          mobileMove.current = { forward: fwd, right: rt };
        }}
        onLook={(dx, dy) => {
          if (sceneElements.current) {
            sceneElements.current.tpsCamera.handleMouseMove(dx * 1.5, dy * 1.5);
          }
        }}
        onFire={(firing) => {
          if (firing) handleShoot();
        }}
        onJump={() => {
          if (isGrounded.current) {
            playerVelocityY.current = 7.5;
            isGrounded.current = false;
            soundSystem.playJumpSound();
          }
        }}
        onReload={handleReload}
      />
    </div>
  );
};
