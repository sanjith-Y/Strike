import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { TrainingGroundWorld } from './TrainingGroundWorld';
import { TouchControls } from './TouchControls';
import { soundSystem } from '../services/audio';
import { WEAPONS, getEquippedIds } from '../services/catalog';
import { Crosshair, Target, RotateCcw, ArrowLeft, Zap, ShieldAlert, Award } from 'lucide-react';

interface TrainingCanvasProps {
  username: string;
  onExit: () => void;
}

interface DummyTarget {
  mesh: THREE.Group;
  headMesh: THREE.Mesh;
  bodyMesh: THREE.Mesh;
  hp: number;
  initialPos: THREE.Vector3;
  elevationName: string;
}

export const TrainingCanvas: React.FC<TrainingCanvasProps> = ({ username, onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [headshots, setHeadshots] = useState(0);
  const [lastDamage, setLastDamage] = useState<{ amount: number; isHeadshot: boolean } | null>(null);
  const [showHitmarker, setShowHitmarker] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const equipped = getEquippedIds();
  const gun = WEAPONS.find((w) => w.id === equipped.weaponId) || WEAPONS[0];

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mobileMove = useRef<{ forward: number; right: number }>({ forward: 0, right: 0 });
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, -10));
  const playerVelocityY = useRef<number>(0);
  const isGrounded = useRef<boolean>(true);

  // Targets
  const targets = useRef<DummyTarget[]>([]);

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    localMesh: PlayerMesh;
    tpsCamera: ThirdPersonCamera;
    world: TrainingGroundWorld;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // 1. Build Free Fire Training Ground / Combat Zone (Reference Image 3)
    const world = new TrainingGroundWorld(scene);
    const localMesh = new PlayerMesh(username, false, equipped.costumeId, equipped.weaponId, equipped.characterId || 'maxim');
    scene.add(localMesh.group);

    const tpsCamera = new ThirdPersonCamera(camera, world);
    const clock = new THREE.Clock();

    sceneRefs.current = {
      scene,
      camera,
      renderer,
      localMesh,
      tpsCamera,
      world,
      clock,
    };

    // 2. Spawn Training Target Dummies at authentic Image 3 heights & ranges
    const dummyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const dummyHeadMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    const targetConfigs = [
      { pos: new THREE.Vector3(0, 0, 14), name: 'Roadway Barrier' },
      { pos: new THREE.Vector3(-5.5, 2.8, 16.5), name: 'Shipping Container Roof' },
      { pos: new THREE.Vector3(4, 0, 22), name: 'Container Yard Alley' },
      { pos: new THREE.Vector3(-28, 5.0, 24), name: 'Warehouse Balcony' },
      { pos: new THREE.Vector3(-28, 9.5, 34), name: 'Warehouse Rooftop' },
      { pos: new THREE.Vector3(24, 4.0, 24), name: 'Barracks Platform' },
    ];

    targets.current = targetConfigs.map((cfg) => {
      const group = new THREE.Group();

      // Dummy Body (Cylinder)
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 1.3, 8), dummyMat.clone());
      body.position.y = 0.95;
      body.castShadow = true;
      group.add(body);

      // Dummy Head (Sphere)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), dummyHeadMat.clone());
      head.position.y = 1.82;
      head.castShadow = true;
      group.add(head);

      // Bullseye Chest Target
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.26, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      ring.position.set(0, 1.05, 0.4);
      group.add(ring);

      group.position.copy(cfg.pos);
      scene.add(group);

      return {
        mesh: group,
        headMesh: head,
        bodyMesh: body,
        hp: 100,
        initialPos: cfg.pos.clone(),
        elevationName: cfg.name,
      };
    });

    // 3. Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
      if (e.code === 'KeyR') {
        resetDummies();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === renderer.domElement && sceneRefs.current) {
        sceneRefs.current.tpsCamera.handleMouseMove(e.movementX, e.movementY);
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement === renderer.domElement) {
        shootTarget();
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === renderer.domElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    // 4. Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!sceneRefs.current) return;

      const delta = Math.min(0.1, clock.getDelta());
      const time = clock.getElapsedTime();

      // WASD
      let moveForward = 0;
      let moveRight = 0;
      if (keysPressed.current['KeyW']) moveForward += 1;
      if (keysPressed.current['KeyS']) moveForward -= 1;
      if (keysPressed.current['KeyA']) moveRight -= 1;
      if (keysPressed.current['KeyD']) moveRight += 1;

      if (mobileMove.current.forward !== 0 || mobileMove.current.right !== 0) {
        moveForward += mobileMove.current.forward;
        moveRight += mobileMove.current.right;
      }

      const isSprinting = Boolean(keysPressed.current['ShiftLeft']);
      const moveSpeed = (isSprinting ? 9.5 : 6.0) * delta;

      const yaw = tpsCamera.yaw;
      const forwardDir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).normalize();
      const rightDir = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).normalize();

      const moveVec = new THREE.Vector3().add(forwardDir.multiplyScalar(moveForward)).add(rightDir.multiplyScalar(moveRight));
      if (moveVec.lengthSq() > 0.001) {
        moveVec.normalize().multiplyScalar(moveSpeed);
        playerPos.current.add(moveVec);
      }

      // Gravity & Jump / Platform Landing
      playerVelocityY.current -= 22 * delta;
      playerPos.current.y += playerVelocityY.current * delta;
      if (playerPos.current.y <= 0.5) {
        playerPos.current.y = 0.5;
        playerVelocityY.current = 0;
        isGrounded.current = true;
      }
      if (keysPressed.current['Space'] && isGrounded.current) {
        playerVelocityY.current = 8.5;
        isGrounded.current = false;
        soundSystem.playJumpSound();
      }

      // Arena collision
      const corrected = world.checkSphereCollision(playerPos.current, 0.6);
      playerPos.current.copy(corrected);

      localMesh.group.position.copy(playerPos.current);
      localMesh.group.rotation.y = yaw;
      localMesh.animateRun(moveVec.length() / delta, time);

      // Subtle target sway
      targets.current.forEach((t, idx) => {
        if (t.hp > 0) {
          t.mesh.position.x = t.initialPos.x + Math.sin(time * 1.4 + idx) * 0.4;
        }
      });

      tpsCamera.update(playerPos.current, delta);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);

      world.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [username]);

  const resetDummies = () => {
    targets.current.forEach((t) => {
      t.hp = 100;
      t.mesh.position.copy(t.initialPos);
      (t.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
    });
    soundSystem.playReloadSound();
  };

  const shootTarget = () => {
    if (!sceneRefs.current) return;
    soundSystem.playShootSound();

    const { tpsCamera, localMesh, scene } = sceneRefs.current;
    localMesh.triggerMuzzleFlash();

    const muzzle = localMesh.getWorldMuzzlePosition();
    const forward = tpsCamera.getForwardVector();

    // Bullet tracer line
    const end = muzzle.clone().add(forward.clone().multiplyScalar(90));
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([muzzle, end]);
    const tracerMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
    const tracer = new THREE.Line(tracerGeo, tracerMat);
    scene.add(tracer);
    setTimeout(() => {
      scene.remove(tracer);
      tracerGeo.dispose();
      tracerMat.dispose();
    }, 55);

    // Raycast hit test against dummy targets
    let hitFound = false;
    for (const t of targets.current) {
      if (t.hp <= 0) continue;

      const headWorldPos = new THREE.Vector3();
      t.headMesh.getWorldPosition(headWorldPos);

      const bodyWorldPos = new THREE.Vector3();
      t.bodyMesh.getWorldPosition(bodyWorldPos);

      // 1. Test Headshot
      const toHead = headWorldPos.clone().sub(muzzle);
      const dotHead = toHead.dot(forward);
      if (dotHead > 0) {
        const closestPointHead = muzzle.clone().add(forward.clone().multiplyScalar(dotHead));
        if (closestPointHead.distanceTo(headWorldPos) < 0.45) {
          hitFound = true;
          soundSystem.playKillSound();
          setHeadshots((prev) => prev + 1);
          setHits((prev) => prev + 1);
          setScore((prev) => prev + 1500);
          setLastDamage({ amount: 150, isHeadshot: true });
          setShowHitmarker(true);
          setTimeout(() => setShowHitmarker(false), 120);
          setTimeout(() => setLastDamage(null), 450);

          (t.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xffffff);
          setTimeout(() => {
            (t.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
          }, 100);
          break;
        }
      }

      // 2. Test Body Hit
      const toBody = bodyWorldPos.clone().sub(muzzle);
      const dotBody = toBody.dot(forward);
      if (dotBody > 0) {
        const closestPointBody = muzzle.clone().add(forward.clone().multiplyScalar(dotBody));
        if (closestPointBody.distanceTo(bodyWorldPos) < 0.75) {
          hitFound = true;
          soundSystem.playHitSound();
          setHits((prev) => prev + 1);
          setScore((prev) => prev + 450);
          setLastDamage({ amount: 45, isHeadshot: false });
          setShowHitmarker(true);
          setTimeout(() => setShowHitmarker(false), 100);
          setTimeout(() => setLastDamage(null), 350);

          (t.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xfbbf24);
          setTimeout(() => {
            (t.bodyMesh.material as THREE.MeshStandardMaterial).color.setHex(0xef4444);
          }, 100);
          break;
        }
      }
    }
  };

  const lockPointer = () => {
    if (mountRef.current && sceneRefs.current) {
      sceneRefs.current.renderer.domElement.requestPointerLock();
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#7fa9d2] overflow-hidden select-none font-inter">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Free Fire Crosshair + Dynamic Hitmarker + Damage Popup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <div className="w-8 h-8 flex items-center justify-center relative">
          <div className="w-2.5 h-0.5 bg-white/90 absolute left-0" />
          <div className="w-2.5 h-0.5 bg-white/90 absolute right-0" />
          <div className="h-2.5 w-0.5 bg-white/90 absolute top-0" />
          <div className="h-2.5 w-0.5 bg-white/90 absolute bottom-0" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)]" />

          {/* Free Fire X Hitmarker */}
          {showHitmarker && (
            <div className="absolute inset-0 flex items-center justify-center animate-ping">
              <div className="w-5 h-5 border-2 border-red-500 rotate-45" />
            </div>
          )}
        </div>

        {/* Damage Popup */}
        {lastDamage && (
          <div
            className={`absolute -top-10 font-orbitron font-black text-2xl animate-bounce tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
              lastDamage.isHeadshot ? 'text-red-500 scale-125' : 'text-yellow-400'
            }`}
          >
            {lastDamage.isHeadshot ? `HEADSHOT +${lastDamage.amount}` : `+${lastDamage.amount}`}
          </div>
        )}
      </div>

      {/* Pointer Lock Overlay */}
      {!isPointerLocked && (
        <div
          onClick={lockPointer}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center cursor-pointer z-40"
        >
          <div className="glass-panel-neon p-8 rounded-3xl text-center max-w-md border border-amber-500/50 shadow-2xl">
            <Target className="w-14 h-14 text-amber-400 mx-auto mb-3 animate-spin-slow" />
            <h2 className="text-2xl font-orbitron font-black text-white mb-2">COMBAT ZONE • TRAINING GROUND</h2>
            <p className="text-slate-300 text-sm mb-4">
              Click anywhere to lock mouse and practice recoil control across shipping containers, ramps, and the 2-story warehouse!
            </p>
            <div className="text-xs text-amber-400 font-mono mb-4">
              [WASD] Move • [SPACE] Jump/Climb Ramps • [L-CLICK] Fire • [R] Reset Targets
            </div>
            <div className="px-6 py-2.5 rounded-xl bg-amber-400 text-black font-orbitron font-bold text-xs inline-block">
              CLICK TO ENTER ARENA
            </div>
          </div>
        </div>
      )}

      {/* Top HUD Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-4 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700 text-xs font-orbitron font-bold flex items-center gap-2 pointer-events-auto active:scale-95 transition-all shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT TO LOBBY</span>
          </button>

          <button
            onClick={resetDummies}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/90 hover:bg-slate-900 text-amber-400 border border-slate-700 text-xs font-orbitron font-bold flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-all shadow-lg"
            title="Reset Targets (R)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">RESET (R)</span>
          </button>

          <div className="bg-slate-950/85 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono shadow">
            <span className="text-slate-400">Weapon:</span> <span className="text-amber-400 font-bold font-orbitron">{gun.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/85 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono shadow flex items-center gap-2">
            <span className="text-red-400 font-bold">🎯 HEADSHOTS:</span>
            <span className="text-white font-orbitron font-black">{headshots}</span>
          </div>

          <div className="bg-slate-950/85 px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono shadow flex items-center gap-2">
            <span className="text-slate-400">HITS:</span>
            <span className="text-emerald-400 font-orbitron font-bold">{hits}</span>
          </div>

          <div className="bg-slate-950/85 px-4 py-2 rounded-xl border border-amber-500/40 text-xs font-mono shadow flex items-center gap-2">
            <span className="text-amber-400 font-bold">SCORE:</span>
            <span className="text-yellow-300 font-orbitron font-black text-sm">{score.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Bottom Right Controls Guide */}
      <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 pointer-events-none">
        <span className="text-amber-400 font-bold">CONTROLS:</span>
        <span>WASD Move</span>
        <span>•</span>
        <span>SPACE Jump / Climb</span>
        <span>•</span>
        <span>SHIFT Sprint</span>
        <span>•</span>
        <span>R Reset</span>
      </div>

      {/* Mobile Touch Controls */}
      <TouchControls
        onMove={(fwd, rt) => {
          mobileMove.current = { forward: fwd, right: rt };
        }}
        onLook={(dx, dy) => {
          if (sceneRefs.current) sceneRefs.current.tpsCamera.handleMouseMove(dx * 1.5, dy * 1.5);
        }}
        onFire={(firing) => {
          if (firing) shootTarget();
        }}
        onJump={() => {
          if (isGrounded.current) {
            playerVelocityY.current = 8.5;
            isGrounded.current = false;
            soundSystem.playJumpSound();
          }
        }}
        onReload={() => resetDummies()}
      />
    </div>
  );
};
