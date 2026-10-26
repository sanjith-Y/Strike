import * as THREE from 'three';

export class PlayerMesh {
  public group: THREE.Group;
  public muzzlePoint: THREE.Object3D;
  public isEnemy: boolean;
  public username: string;

  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private muzzleFlash: THREE.PointLight;
  private flashMesh: THREE.Mesh;
  private nametagCanvas: HTMLCanvasElement;
  private nametagTexture: THREE.CanvasTexture;
  private nametagSprite: THREE.Sprite;

  constructor(username: string, isEnemy: boolean = false) {
    this.username = username;
    this.isEnemy = isEnemy;
    this.group = new THREE.Group();

    const armorColor = isEnemy ? 0x2d1525 : 0x122338;
    const trimColor = isEnemy ? 0xff0055 : 0x00f0ff;

    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.3,
      metalness: 0.7,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: trimColor,
    });

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.9, 0.4);
    const torso = new THREE.Mesh(torsoGeo, armorMat);
    torso.position.y = 1.15;
    torso.castShadow = true;
    this.group.add(torso);

    // Torso Core Glow
    const coreGeo = new THREE.BoxGeometry(0.2, 0.3, 0.05);
    const core = new THREE.Mesh(coreGeo, glowMat);
    core.position.set(0, 1.25, 0.21);
    this.group.add(core);

    // 2. Head & Cyber Visor
    const headGeo = new THREE.BoxGeometry(0.35, 0.38, 0.38);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.y = 1.8;
    head.castShadow = true;
    this.group.add(head);

    const visorGeo = new THREE.BoxGeometry(0.3, 0.1, 0.05);
    const visor = new THREE.Mesh(visorGeo, glowMat);
    visor.position.set(0, 1.82, 0.19);
    this.group.add(visor);

    // 3. Legs
    const legGeo = new THREE.BoxGeometry(0.25, 0.7, 0.25);
    this.leftLeg = new THREE.Mesh(legGeo, armorMat);
    this.leftLeg.position.set(-0.2, 0.35, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, armorMat);
    this.rightLeg.position.set(0.2, 0.35, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // 4. Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.65, 0.2);
    this.leftArm = new THREE.Mesh(armGeo, armorMat);
    this.leftArm.position.set(-0.5, 1.15, 0.1);
    this.leftArm.rotation.x = -Math.PI / 4;
    this.leftArm.castShadow = true;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, armorMat);
    this.rightArm.position.set(0.5, 1.15, 0.2);
    this.rightArm.rotation.x = -Math.PI / 3;
    this.rightArm.castShadow = true;
    this.group.add(this.rightArm);

    // 5. Starter Rifle (AR-7 Valkyrie)
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x111115, metalness: 0.9, roughness: 0.2 });
    const rifle = new THREE.Group();
    const bodyGeo = new THREE.BoxGeometry(0.12, 0.16, 0.7);
    const body = new THREE.Mesh(bodyGeo, gunMat);
    rifle.add(body);

    const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0, 0.02, 0.45);
    rifle.add(barrel);

    const magGeo = new THREE.BoxGeometry(0.08, 0.2, 0.15);
    const mag = new THREE.Mesh(magGeo, gunMat);
    mag.position.set(0, -0.15, 0.1);
    mag.rotation.x = 0.2;
    rifle.add(mag);

    // Rifle Position relative to player
    rifle.position.set(0.3, 1.05, 0.4);
    rifle.rotation.y = 0.05;
    this.group.add(rifle);

    // Muzzle Point
    this.muzzlePoint = new THREE.Object3D();
    this.muzzlePoint.position.set(0, 0.02, 0.7);
    rifle.add(this.muzzlePoint);

    // Muzzle flash light & sprite
    this.muzzleFlash = new THREE.PointLight(trimColor, 0, 8);
    this.muzzleFlash.position.copy(this.muzzlePoint.position);
    rifle.add(this.muzzleFlash);

    const flashGeo = new THREE.SphereGeometry(0.12, 6, 6);
    this.flashMesh = new THREE.Mesh(flashGeo, glowMat);
    this.flashMesh.position.copy(this.muzzlePoint.position);
    this.flashMesh.visible = false;
    rifle.add(this.flashMesh);

    // 6. Overhead Name Tag & Health bar
    this.nametagCanvas = document.createElement('canvas');
    this.nametagCanvas.width = 256;
    this.nametagCanvas.height = 64;
    this.nametagTexture = new THREE.CanvasTexture(this.nametagCanvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.nametagTexture });
    this.nametagSprite = new THREE.Sprite(spriteMat);
    this.nametagSprite.position.set(0, 2.3, 0);
    this.nametagSprite.scale.set(2.4, 0.6, 1);
    this.group.add(this.nametagSprite);

    this.updateNametag(100);
  }

  public updateNametag(health: number) {
    const ctx = this.nametagCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 256, 64);

    // Background pill
    ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
    ctx.beginPath();
    ctx.roundRect(10, 4, 236, 56, 10);
    ctx.fill();

    // Border
    ctx.strokeStyle = this.isEnemy ? '#ff0055' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Username text
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(this.username.slice(0, 14), 128, 28);

    // Health Bar
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
