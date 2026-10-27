import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { ArenaWorld } from './ArenaWorld';
import { TouchControls } from './TouchControls';
import { soundSystem } from '../services/audio';
import { WEAPONS, getEquippedIds } from '../services/catalog';
import { Crosshair, Target, RotateCcw, ArrowLeft, Shield } from 'lucide-react';

interface TrainingCanvasProps {
  username: string;
  onExit: () => void;
}

export const TrainingCanvas: React.FC<TrainingCanvasProps> = ({ username, onExit }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [lastDamage, setLastDamage] = useState<number | null>(null);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const equipped = getEquippedIds();
  const gun = WEAPONS.find(w => w.id === equipped.weaponId) || WEAPONS[0];

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mobileMove = useRef<{ forward: number; right: number }>({ forward: 0, right: 0 });
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));
  const playerVelocityY = useRef<number>(0);
  const isGrounded = useRef<boolean>(true);

  // Targets
  const targets = useRef<{ mesh: THREE.Group; hp: number; initialPos: THREE.Vector3 }[]>([]);

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    localMesh: PlayerMesh;
    tpsCamera: ThirdPersonCamera;
    world: ArenaWorld;
    clock: THREE.Clock;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090e);
    scene.fog = new THREE.FogExp2(0x07090e, 0.015);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    const world = new ArenaWorld(scene);
    const localMesh = new PlayerMesh(username, false, equipped.costumeId, equipped.weaponId);
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

    // 2. Spawn Training Target Dummies
    const dummyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const dummyHeadMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });

    const targetPositions = [
      new THREE.Vector3(-8, 0, 15),
      new THREE.Vector3(0, 0, 20),
      new THREE.Vector3(8, 0, 15),
      new THREE.Vector3(-14, 0, 28),
      new THREE.Vector3(14, 0, 28),
    ];

    targets.current = targetPositions.map((pos) => {
      const group = new THREE.Group();

      // Dummy Body
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8), dummyMat);
      body.position.y = 1.0;
      body.castShadow = true;
      group.add(body);

      // Dummy Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), dummyHeadMat);
      head.position.y = 1.9;
      head.castShadow = true;
      group.add(head);

      // Bullseye Ring
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.3, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }));
      ring.position.set(0, 1.1, 0.42);
      group.add(ring);

      group.position.copy(pos);
      scene.add(group);
      return { mesh: group, hp: 100, initialPos: pos.clone() };
    });

    // 3. Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
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

      // Gravity & Jump
      playerVelocityY.current -= 20 * delta;
      playerPos.current.y += playerVelocityY.current * delta;
      if (playerPos.current.y <= 0.5) {
        playerPos.current.y = 0.5;
        playerVelocityY.current = 0;
        isGrounded.current = true;
      }
      if (keysPressed.current['Space'] && isGrounded.current) {
        playerVelocityY.current = 7.5;
        isGrounded.current = false;
        soundSystem.playJumpSound();
      }

      // Arena collision
      const corrected = world.checkSphereCollision(playerPos.current, 0.6);
      playerPos.current.copy(corrected);

      localMesh.group.position.copy(playerPos.current);
      localMesh.group.rotation.y = yaw;
      localMesh.animateRun(moveVec.length() / delta, time);

      // Target sway animation
      targets.current.forEach((t, idx) => {
        t.mesh.position.x = t.initialPos.x + Math.sin(time * 1.5 + idx) * 1.8;
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

  const shootTarget = () => {
    if (!sceneRefs.current) return;
    soundSystem.playShootSound();

    const { tpsCamera, localMesh, scene } = sceneRefs.current;
    localMesh.triggerMuzzleFlash();

    const muzzle = localMesh.getWorldMuzzlePosition();
    const forward = tpsCamera.getForwardVector();

    // Bullet tracer
    const end = muzzle.clone().add(forward.clone().multiplyScalar(60));
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([muzzle, end]);
    const tracerMat = new THREE.LineBasicMaterial({ color: 0x00f0ff });
    const tracer = new THREE.Line(tracerGeo, tracerMat);
    scene.add(tracer);
    setTimeout(() => {
      scene.remove(tracer);
      tracerGeo.dispose();
      tracerMat.dispose();
    }, 60);

    // Hit test against dummy targets
    let hitFound = false;
    for (const t of targets.current) {
      const d = t.mesh.position.distanceTo(muzzle);
      // Ray projection to target center
      const toTarget = t.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)).sub(muzzle);
      const dot = toTarget.dot(forward);
      if (dot > 0) {
        const closestPoint = muzzle.clone().add(forward.clone().multiplyScalar(dot));
        const distToCenter = closestPoint.distanceTo(t.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0)));
        if (distToCenter < 1.1) {
          hitFound = true;
          soundSystem.playHitSound();
          setHits(prev => prev + 1);
          setScore(prev => prev + gun.damage * 10);
          setLastDamage(gun.damage);
          setTimeout(() => setLastDamage(null), 300);
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
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
        <div className="w-6 h-6 flex items-center justify-center relative">
          <div className="w-2 h-0.5 bg-arena-neon absolute left-0" />
          <div className="w-2 h-0.5 bg-arena-neon absolute right-0" />
          <div className="h-2 w-0.5 bg-arena-neon absolute top-0" />
          <div className="h-2 w-0.5 bg-arena-neon absolute bottom-0" />
          <div className="w-1 h-1 rounded-full bg-arena-neon" />
        </div>
        {lastDamage && (
          <div className="absolute -top-8 font-orbitron font-black text-xl text-yellow-400 animate-bounce">
            +{lastDamage}
          </div>
        )}
      </div>

      {/* Pointer Lock Overlay */}
      {!isPointerLocked && (
        <div
          onClick={lockPointer}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center cursor-pointer z-40"
        >
          <div className="glass-panel-neon p-8 rounded-3xl text-center max-w-md border border-emerald-500/50">
            <Target className="w-12 h-12 text-emerald-400 mx-auto mb-3 animate-spin-slow" />
            <h2 className="text-2xl font-orbitron font-extrabold text-white mb-2">TRAINING GROUNDS</h2>
            <p className="text-slate-300 text-sm mb-4">Click anywhere to lock mouse and test your firing accuracy on target dummies!</p>
            <div className="text-xs text-emerald-400 font-mono">Infinite Ammunition • Recoil Practice Active</div>
          </div>
        </div>
      )}

      {/* Top HUD Bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-orbitron font-bold flex items-center gap-2 pointer-events-auto active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT TRAINING</span>
          </button>
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Weapon:</span> <span className="text-arena-neon font-bold">{gun.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Target Hits:</span> <span className="text-emerald-400 font-bold">{hits}</span>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Accuracy Score:</span> <span className="text-yellow-400 font-bold font-orbitron">{score}</span>
          </div>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      <TouchControls
        onMove={(fwd, rt) => { mobileMove.current = { forward: fwd, right: rt }; }}
        onLook={(dx, dy) => {
          if (sceneRefs.current) sceneRefs.current.tpsCamera.handleMouseMove(dx * 1.5, dy * 1.5);
        }}
        onFire={(firing) => { if (firing) shootTarget(); }}
        onJump={() => {
          if (isGrounded.current) {
            playerVelocityY.current = 7.5;
            isGrounded.current = false;
            soundSystem.playJumpSound();
          }
        }}
        onReload={() => soundSystem.playReloadSound()}
      />
    </div>
  );
};
