import * as THREE from 'three';
import { ArenaWorld } from './ArenaWorld';

export class ThirdPersonCamera {
  public camera: THREE.PerspectiveCamera;
  public yaw: number = 0;
  public pitch: number = 0;
  public sensitivity: number = 0.0022;

  private currentTarget: THREE.Vector3 = new THREE.Vector3();
  private idealOffset: THREE.Vector3 = new THREE.Vector3(0.6, 1.8, -3.2); // Over-the-right-shoulder offset
  private world: ArenaWorld;

  constructor(camera: THREE.PerspectiveCamera, world: ArenaWorld) {
    this.camera = camera;
    this.world = world;
  }

  public handleMouseMove(movementX: number, movementY: number) {
    this.yaw -= movementX * this.sensitivity;
    this.pitch -= movementY * this.sensitivity;

    // Clamp pitch between -70 deg and +70 deg
    const maxPitch = (70 * Math.PI) / 180;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  public update(playerPos: THREE.Vector3, delta: number) {
    // Smooth target follow
    this.currentTarget.lerp(new THREE.Vector3(playerPos.x, playerPos.y + 1.2, playerPos.z), 15 * delta);

    // Compute ideal camera position based on yaw and pitch
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    // Right-shoulder camera offset rotated by yaw
    const forward = new THREE.Vector3(sinYaw * cosPitch, sinPitch, cosYaw * cosPitch);
    const right = new THREE.Vector3(cosYaw, 0, -sinYaw);
    const up = new THREE.Vector3().crossVectors(right, forward).normalize();

    // Desired camera position: Target minus forward * distance + right * rightOffset + up * upOffset
    const camDist = 3.2;
    const rightOffset = 0.7;
    const upOffset = 0.4;

    const desiredCamPos = this.currentTarget.clone()
      .sub(forward.clone().multiplyScalar(camDist))
      .add(right.clone().multiplyScalar(rightOffset))
      .add(up.clone().multiplyScalar(upOffset));

    // Simple camera ray collision against arena walls to prevent wall-clipping
    const rayDir = desiredCamPos.clone().sub(this.currentTarget);
    const rayLength = rayDir.length();
    rayDir.normalize();

    const raycaster = new THREE.Raycaster(this.currentTarget, rayDir, 0.1, rayLength);
    const meshes = this.world.colliders.map(c => c.mesh);
    const hits = raycaster.intersectObjects(meshes, false);

    if (hits.length > 0 && hits[0].distance < rayLength) {
      // Pull camera closer than nearest hit
      const safeDist = Math.max(0.6, hits[0].distance - 0.2);
      this.camera.position.copy(this.currentTarget).add(rayDir.multiplyScalar(safeDist));
    } else {
      this.camera.position.lerp(desiredCamPos, 20 * delta);
    }

    // Look at target point slightly ahead
    const lookAtPoint = this.currentTarget.clone().add(forward.clone().multiplyScalar(50));
    this.camera.lookAt(lookAtPoint);
  }

  public getForwardVector(): THREE.Vector3 {
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);
    return new THREE.Vector3(sinYaw * cosPitch, sinPitch, cosYaw * cosPitch).normalize();
  }
}
