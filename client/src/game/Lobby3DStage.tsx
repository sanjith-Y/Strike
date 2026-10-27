import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PlayerMesh } from './PlayerMesh';

interface Lobby3DStageProps {
  username: string;
  costumeId: string;
  weaponId: string;
  characterId: string;
}

export const Lobby3DStage: React.FC<Lobby3DStageProps> = ({ username, costumeId, weaponId, characterId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterRotation = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const previousMouseX = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene, Camera, Transparent WebGL Renderer
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera to align with military cargo plane ramp perspective (Reference Image 4)
    camera.position.set(0, 1.25, 3.8);
    camera.lookAt(0, 1.0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true, // Transparent so background image /assets/hangar_lobby.jpg shows through
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // 2. Realistic Lighting for the Cargo Plane Hangar Interior
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.1);
    scene.add(ambientLight);

    // Key Spotlight from cargo ceiling onto the character
    const spotLight = new THREE.SpotLight(0xffeacc, 4.0, 15, Math.PI / 4, 0.4, 1.2);
    spotLight.position.set(1.2, 4.5, 3.0);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.bias = -0.001;
    scene.add(spotLight);

    // Soft Rim Light from rear runway (matches twilight airfield lights in Image 4)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // Warm orange floor bounce light (matches the amber work light in cargo bay)
    const amberBounce = new THREE.PointLight(0xf59e0b, 2.0, 5);
    amberBounce.position.set(-1.5, 0.4, 0.5);
    scene.add(amberBounce);

    // 3. Shadow-Catcher Floor Plane
    // By using ShadowMaterial, the runway tarmac texture and "KEEP CLEAR" stenciling
    // in the backdrop image remain 100% visible while catching real 3D player shadows!
    const shadowFloorGeo = new THREE.PlaneGeometry(10, 10);
    const shadowFloorMat = new THREE.ShadowMaterial({ opacity: 0.55 });
    const shadowFloor = new THREE.Mesh(shadowFloorGeo, shadowFloorMat);
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = 0;
    shadowFloor.receiveShadow = true;
    scene.add(shadowFloor);

    // Subtle Glowing Holographic Runway Anchor Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.26, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    // 4. Player Character (Equipped with character, costume, weapon)
    const character = new PlayerMesh(username, false, costumeId, weaponId, characterId);
    scene.add(character.group);

    // 5. Free Fire Style Pet Companion (sitting beside the player on the ramp)
    const petGroup = new THREE.Group();
    const petMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
    const petAccentMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.4 });
    const petGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Pet Body
    const petBody = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), petMat);
    petBody.castShadow = true;
    petGroup.add(petBody);

    // Pet Head
    const petHead = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), petMat);
    petHead.position.set(0, 0.28, 0.1);
    petHead.castShadow = true;
    petGroup.add(petHead);

    // Pet Cyber Visor / Eyes
    const petVisor = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.05), petGlowMat);
    petVisor.position.set(0, 0.29, 0.28);
    petGroup.add(petVisor);

    // Pet Ears
    const earGeo = new THREE.ConeGeometry(0.07, 0.16, 4);
    const leftEar = new THREE.Mesh(earGeo, petAccentMat);
    leftEar.position.set(-0.11, 0.46, 0.08);
    leftEar.rotation.z = 0.2;
    const rightEar = new THREE.Mesh(earGeo, petAccentMat);
    rightEar.position.set(0.11, 0.46, 0.08);
    rightEar.rotation.z = -0.2;
    petGroup.add(leftEar, rightEar);

    petGroup.position.set(1.05, 0.24, 0.3);
    petGroup.rotation.y = -0.45;
    scene.add(petGroup);

    // 6. Floating Warm Ember Sparks (matching cargo bay atmosphere)
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 4;
      particlePos[i + 1] = Math.random() * 2.8;
      particlePos[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.04,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse and Touch Drag 360° Character Rotation
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
      petGroup.position.y = 0.24 + Math.sin(time * 3) * 0.03;
      petHead.rotation.x = Math.sin(time * 2) * 0.08;

      // Particle float up
      const posArr = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        posArr[i] += 0.006;
        if (posArr[i] > 2.8) posArr[i] = 0;
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
  }, [username, costumeId, weaponId, characterId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
      title="Click and drag to rotate character 360°"
    />
  );
};
