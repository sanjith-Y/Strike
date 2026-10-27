import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh';

interface Lobby3DStageProps {
  username: string;
  costumeId: string;
  weaponId: string;
}

export const Lobby3DStage: React.FC<Lobby3DStageProps> = ({ username, costumeId, weaponId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterRotation = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const previousMouseX = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090e, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 4.2);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Key Spotlight from top-front
    const spotLight = new THREE.SpotLight(0xfff5e6, 3.2, 18, Math.PI / 4, 0.5, 1);
    spotLight.position.set(1.5, 4.5, 3.5);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Rim neon-cyan light from behind
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Golden floor glow light
    const floorGlow = new THREE.PointLight(0xffd700, 1.8, 6);
    floorGlow.position.set(0, 0.3, 0);
    scene.add(floorGlow);

    // 3. Stage Runway Floor
    const stageGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.25, 32);
    const stageMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const stage = new THREE.Mesh(stageGeo, stageMat);
    stage.position.y = -0.12;
    stage.receiveShadow = true;
    scene.add(stage);

    // Outer Neon Ring on stage edge
    const ringGeo = new THREE.TorusGeometry(2.42, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    // 4. Player Character
    const character = new PlayerMesh(username, false, costumeId, weaponId);
    scene.add(character.group);

    // 5. Cute Pet Companion Beside Character (like Free Fire screenshot)
    const petGroup = new THREE.Group();
    const petMat = new THREE.MeshStandardMaterial({ color: 0xffe4e6, roughness: 0.4 });
    const petGlowMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });

    // Pet Body
    const petBodyGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const petBody = new THREE.Mesh(petBodyGeo, petMat);
    petGroup.add(petBody);

    // Pet Head
    const petHeadGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const petHead = new THREE.Mesh(petHeadGeo, petMat);
    petHead.position.set(0, 0.28, 0.12);
    petGroup.add(petHead);

    // Pet Ears
    const earGeo = new THREE.ConeGeometry(0.08, 0.16, 4);
    const leftEar = new THREE.Mesh(earGeo, petGlowMat);
    leftEar.position.set(-0.12, 0.45, 0.1);
    const rightEar = new THREE.Mesh(earGeo, petGlowMat);
    rightEar.position.set(0.12, 0.45, 0.1);
    petGroup.add(leftEar, rightEar);

    petGroup.position.set(1.1, 0.25, 0.4);
    petGroup.rotation.y = -0.5;
    scene.add(petGroup);

    // 6. Floating Sparks / Embers Particle System
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 5;
      particlePos[i + 1] = Math.random() * 3.5;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse Drag 360 Character Rotation
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouseX.current = e.clientX;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousMouseX.current;
      characterRotation.current += deltaX * 0.012;
      previousMouseX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging.current = true;
        previousMouseX.current = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging.current || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - previousMouseX.current;
      characterRotation.current += deltaX * 0.015;
      previousMouseX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    dom.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth character rotation
      character.group.rotation.y = THREE.MathUtils.lerp(character.group.rotation.y, characterRotation.current, 0.1);
      character.animateIdle(time);

      // Pet bobbing animation
      petGroup.position.y = 0.25 + Math.sin(time * 3) * 0.04;
      petHead.rotation.x = Math.sin(time * 2) * 0.1;

      // Particle float up
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArr[i] += 0.008;
        if (posArr[i] > 3.5) posArr[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      dom.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);

      if (mountRef.current && dom) {
        mountRef.current.removeChild(dom);
      }
      renderer.dispose();
    };
  }, [username, costumeId, weaponId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      title="Click and drag to rotate character 360°"
    />
  );
};
