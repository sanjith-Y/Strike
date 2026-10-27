import * as THREE from 'three';
import { COSTUMES, WEAPONS, CHARACTERS } from '../services/catalog';

export class PlayerMesh {
  public group: THREE.Group;
  public muzzlePoint: THREE.Object3D;
  public isEnemy: boolean;
  public username: string;

  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private torso: THREE.Mesh;
  private head: THREE.Mesh;
  private rifleGroup: THREE.Group;
  private muzzleFlash: THREE.PointLight;
  private flashMesh: THREE.Mesh;
  private nametagCanvas: HTMLCanvasElement;
  private nametagTexture: THREE.CanvasTexture;
  private nametagSprite: THREE.Sprite;

  constructor(
    username: string,
    isEnemy: boolean = false,
    costumeId: string = 's2_hiphop',
    weaponId: string = 'ar7_valkyrie',
    characterId: string = 'maxim'
  ) {
    this.username = username;
    this.isEnemy = isEnemy;
    this.group = new THREE.Group();

    // Resolve character, costume and weapon configs
    const character = CHARACTERS.find(c => c.id === characterId) || CHARACTERS[0];
    const costume = COSTUMES.find(c => c.id === costumeId) || COSTUMES[0];
    const weapon = WEAPONS.find(w => w.id === weaponId) || WEAPONS[0];

    // Priority: enemy -> costume -> character
    const armorColor = isEnemy
      ? 0x2d1525
      : costumeId && costumeId !== 'default'
      ? costume.armorColor
      : character.armorColor;

    const glowColor = isEnemy
      ? 0xff0055
      : costumeId && costumeId !== 'default'
      ? costume.glowColor
      : character.glowColor;

    const accentColor = isEnemy
      ? 0x991b1b
      : costumeId && costumeId !== 'default'
      ? costume.accentColor
      : 0x1e293b;

    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.35,
      metalness: 0.7,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: glowColor,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.5,
      metalness: 0.6,
    });

    // 1. Torso Plating
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.92, 0.44);
    this.torso = new THREE.Mesh(torsoGeo, armorMat);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Chest Core Energy Reactor
    const coreGeo = new THREE.BoxGeometry(0.24, 0.32, 0.08);
    const core = new THREE.Mesh(coreGeo, glowMat);
    core.position.set(0, 1.25, 0.23);
    this.group.add(core);

    // Shoulder Pauldrons / Spikes (like Golden Mecha in Free Fire screenshot)
    const leftShoulderGeo = new THREE.ConeGeometry(0.22, 0.45, 4);
    const leftShoulder = new THREE.Mesh(leftShoulderGeo, accentMat);
    leftShoulder.position.set(-0.55, 1.6, 0);
    leftShoulder.rotation.z = Math.PI / 4;
    leftShoulder.castShadow = true;
    this.group.add(leftShoulder);

    const rightShoulderGeo = new THREE.ConeGeometry(0.22, 0.45, 4);
    const rightShoulder = new THREE.Mesh(rightShoulderGeo, accentMat);
    rightShoulder.position.set(0.55, 1.6, 0);
    rightShoulder.rotation.z = -Math.PI / 4;
    rightShoulder.castShadow = true;
    this.group.add(rightShoulder);

    // 2. Head & Cyber Visor / Crown
    const headGeo = new THREE.BoxGeometry(0.38, 0.4, 0.4);
    this.head = new THREE.Mesh(headGeo, armorMat);
    this.head.position.y = 1.82;
    this.head.castShadow = true;
    this.group.add(this.head);

    // Glowing Cyber Visor
    const visorGeo = new THREE.BoxGeometry(0.32, 0.12, 0.06);
    const visor = new THREE.Mesh(visorGeo, glowMat);
    visor.position.set(0, 1.84, 0.21);
    this.group.add(visor);

    // Custom Bundle Accessories: S2 Hip Hop backwards cap & gold chain
    if (costumeId === 's2_hiphop') {
      // Hip Hop Backwards Cap
      const capMat = new THREE.MeshStandardMaterial({ color: 0xdb2777, roughness: 0.6 });
      const capGeo = new THREE.BoxGeometry(0.42, 0.16, 0.42);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(0, 2.05, 0);
      this.group.add(cap);

      // Backwards Cap Visor
      const visorCapGeo = new THREE.BoxGeometry(0.34, 0.04, 0.22);
      const visorCap = new THREE.Mesh(visorCapGeo, capMat);
      visorCap.position.set(0, 2.0, -0.26);
      this.group.add(visorCap);

      // Golden Chain Medallion
      const chainMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.9, roughness: 0.2 });
      const chainGeo = new THREE.TorusGeometry(0.24, 0.03, 8, 16);
      const chain = new THREE.Mesh(chainGeo, chainMat);
      chain.position.set(0, 1.48, 0.18);
      chain.rotation.x = Math.PI / 4;
      this.group.add(chain);
    } else {
      // Horns / Crest on helmet
      const crestGeo = new THREE.BoxGeometry(0.08, 0.25, 0.35);
      const crest = new THREE.Mesh(crestGeo, accentMat);
      crest.position.set(0, 2.05, 0.05);
      crest.rotation.x = -0.3;
      this.group.add(crest);
    }

    // 3. Legs
    const legGeo = new THREE.BoxGeometry(0.26, 0.72, 0.26);
    this.leftLeg = new THREE.Mesh(legGeo, armorMat);
    this.leftLeg.position.set(-0.2, 0.36, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, armorMat);
    this.rightLeg.position.set(0.2, 0.36, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // 4. Arms
    const armGeo = new THREE.BoxGeometry(0.22, 0.68, 0.22);
    this.leftArm = new THREE.Mesh(armGeo, armorMat);
    this.leftArm.position.set(-0.52, 1.15, 0.12);
    this.leftArm.rotation.x = -Math.PI / 4;
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armorMat);
    this.rightArm.position.set(0.52, 1.15, 0.22);
    this.rightArm.rotation.x = -Math.PI / 3;
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // 5. Equipped Weapon Mesh
    this.rifleGroup = new THREE.Group();
    const gunMat = new THREE.MeshStandardMaterial({
      color: weapon.bodyColor,
      metalness: 0.85,
      roughness: 0.25,
    });
    const gunGlowMat = new THREE.MeshBasicMaterial({ color: weapon.glowColor });

    // Gun Receiver
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.18, 0.68);
    const body = new THREE.Mesh(bodyGeo, gunMat);
    this.rifleGroup.add(body);

    // Gun Glow Stripes
    const stripeGeo = new THREE.BoxGeometry(0.13, 0.04, 0.4);
    const stripe = new THREE.Mesh(stripeGeo, gunGlowMat);
    stripe.position.set(0, 0.05, 0);
    this.rifleGroup.add(stripe);

    // Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.035, 0.035, weapon.barrelLength);
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.34 + weapon.barrelLength / 2);
    this.rifleGroup.add(barrel);

    // Magazine
    const magGeo = new THREE.BoxGeometry(0.08, 0.22, 0.14);
    const mag = new THREE.Mesh(magGeo, gunMat);
    mag.position.set(0, -0.16, 0.1);
    mag.rotation.x = 0.25;
    this.rifleGroup.add(mag);

    // Position weapon in hands
    this.rifleGroup.position.set(0.32, 1.05, 0.42);
    this.rifleGroup.rotation.y = 0.05;
    this.group.add(this.rifleGroup);

    // Muzzle Point & Flash
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0.02, 0.34 + weapon.barrelLength);
    this.rifleGroup.add(this.muzzlePoint);

    this.muzzleFlash = new THREE.PointLight(weapon.glowColor, 0, 8);
    this.muzzleFlash.position.copy(this.muzzlePoint.position);
    this.rifleGroup.add(this.muzzleFlash);

    const flashGeo = new THREE.SphereGeometry(0.14, 6, 6);
    this.flashMesh = new THREE.Mesh(flashGeo, gunGlowMat);
    this.flashMesh.position.copy(this.muzzlePoint.position);
    this.flashMesh.visible = false;
    this.rifleGroup.add(this.flashMesh);

    // 6. Overhead Name Tag & Health bar
    this.nametagCanvas = document.createElement('canvas');
    this.nametagCanvas.width = 256;
    this.nametagCanvas.height = 64;
    this.nametagTexture = new THREE.CanvasTexture(this.nametagCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.nametagTexture });
    this.nametagSprite = new THREE.Sprite(spriteMat);
    this.nametagSprite.position.set(0, 2.35, 0);
    this.nametagSprite.scale.set(2.4, 0.6, 1);
    this.group.add(this.nametagSprite);

    this.updateNametag(100);
  }

  public updateNametag(health: number) {
    const ctx = this.nametagCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 64);
    ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
    ctx.beginPath();
    ctx.roundRect(10, 4, 236, 56, 10);
    ctx.fill();

    ctx.strokeStyle = this.isEnemy ? '#ff0055' : '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(this.username.slice(0, 14), 128, 28);

    const hpWidth = Math.max(0, Math.min(216, (health / 100) * 216));
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(20, 38, 216, 12);

    ctx.fillStyle = health > 30 ? (this.isEnemy ? '#ff0055' : '#00f0ff') : '#ef4444';
    ctx.fillRect(20, 38, hpWidth, 12);

    this.nametagTexture.needsUpdate = true;
  }

  public animateRun(speed: number, time: number) {
    if (speed > 0.1) {
      const freq = speed * 10;
      this.leftLeg.rotation.x = Math.sin(time * freq) * 0.6;
      this.rightLeg.rotation.x = -Math.sin(time * freq) * 0.6;
      this.leftArm.rotation.x = -Math.PI / 4 + Math.sin(time * freq) * 0.3;
    } else {
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftArm.rotation.x = -Math.PI / 4;
    }
  }

  /**
   * Subtle idle breathing and swaying animation for the Lobby stage
   */
  public animateIdle(time: number) {
    const breath = Math.sin(time * 2.2) * 0.02;
    this.torso.position.y = 1.15 + breath;
    this.head.position.y = 1.82 + breath * 1.2;
    this.rightArm.rotation.x = -Math.PI / 3 + Math.sin(time * 1.5) * 0.03;
    this.leftArm.rotation.x = -Math.PI / 4 + Math.cos(time * 1.5) * 0.03;
  }

  public triggerMuzzleFlash() {
    this.muzzleFlash.intensity = 3;
    this.flashMesh.visible = true;
    setTimeout(() => {
      this.muzzleFlash.intensity = 0;
      this.flashMesh.visible = false;
    }, 50);
  }

  public getWorldMuzzlePosition(): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.muzzlePoint.getWorldPosition(pos);
    return pos;
  }
}
