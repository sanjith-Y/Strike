import * as THREE from 'three';

export interface BoxCollider {
  box: THREE.Box3;
  mesh: THREE.Mesh;
}

export class ArenaWorld {
  public scene: THREE.Scene;
  public colliders: BoxCollider[] = [];
  private disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildWorld();
  }

  private buildWorld() {
    // 1. Atmosphere and Fog
    this.scene.background = new THREE.Color('#07090e');
    this.scene.fog = new THREE.FogExp2('#07090e', 0.015);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.8);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#00f0ff', 1.4);
    dirLight.position.set(30, 45, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 120;
    const d = 50;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight('#ff0055', 0.8);
    rimLight.position.set(-30, 25, -20);
    this.scene.add(rimLight);

    // 3. Ground Plane with Sci-Fi Grid
    const floorSize = 100;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 20, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0c101a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.disposables.push(floorGeo, floorMat);

    // Ground Grid overlay
    const grid = new THREE.GridHelper(floorSize, 50, 0x00f0ff, 0x1e293b);
    grid.position.y = 0.02;
    this.scene.add(grid);

    // 4. Perimeter Walls & Energy Barriers
    this.buildPerimeter(floorSize);

    // 5. Tactical Cover Obstacles & Structures
    this.buildStructures();
  }

  private buildPerimeter(size: number) {
    const half = size / 2;
    const wallHeight = 6;
    const wallThickness = 2;

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x141c2c,
      roughness: 0.5,
      metalness: 0.5,
    });
    const neonTrimMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
    });

    const createWall = (w: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Neon top trim
      const trimGeo = new THREE.BoxGeometry(w, 0.2, d);
      const trimMesh = new THREE.Mesh(trimGeo, neonTrimMat);
      trimMesh.position.set(x, wallHeight + 0.1, z);
      this.scene.add(trimMesh);

      const box = new THREE.Box3().setFromObject(mesh);
      this.colliders.push({ box, mesh });
      this.disposables.push(geo, trimGeo);
    };

    // 4 Outer Walls
    createWall(size, wallThickness, 0, -half);
    createWall(size, wallThickness, 0, half);
    createWall(wallThickness, size, -half, 0);
    createWall(wallThickness, size, half, 0);

    this.disposables.push(wallMat, neonTrimMat);
  }

  private buildStructures() {
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.4,
    });
    const orangeMat = new THREE.MeshStandardMaterial({
      color: 0x243048,
      roughness: 0.4,
      metalness: 0.6,
    });
    const neonGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    this.disposables.push(crateMat, orangeMat, neonGlowMat);

    // Helper to spawn a cover box
    const addBox = (w: number, h: number, d: number, x: number, z: number, mat: THREE.Material = crateMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      const box = new THREE.Box3().setFromObject(mesh);
      this.colliders.push({ box, mesh });
      this.disposables.push(geo);
      return mesh;
    };

    // Center Core Monument
    addBox(8, 3.5, 8, 0, 0, orangeMat);
    const centerPillarGeo = new THREE.CylinderGeometry(1.5, 2, 8, 8);
    const centerPillar = new THREE.Mesh(centerPillarGeo, crateMat);
    centerPillar.position.set(0, 4, 0);
    centerPillar.castShadow = true;
    this.scene.add(centerPillar);
    this.colliders.push({ box: new THREE.Box3().setFromObject(centerPillar), mesh: centerPillar });
    this.disposables.push(centerPillarGeo);

    // Symmetrical Corner Bunkers and Cover Crate Clusters
    const quadrants = [
      { x: 15, z: 15 },
      { x: -15, z: 15 },
      { x: 15, z: -15 },
      { x: -15, z: -15 },
      { x: 28, z: 0 },
      { x: -28, z: 0 },
      { x: 0, z: 28 },
      { x: 0, z: -28 },
    ];

    quadrants.forEach((q, idx) => {
      // Primary cover block
      addBox(5, 2.2, 2.5, q.x, q.z, crateMat);
      // Small tactical stack
      if (idx % 2 === 0) {
        addBox(2, 1.4, 2, q.x + 3.5, q.z + 1, orangeMat);
      } else {
        addBox(2, 2.8, 2, q.x - 3.5, q.z - 1, crateMat);
      }
    });

    // Elevated Sci-Fi Ramp / Bridge Platform
    const bridgeGeo = new THREE.BoxGeometry(16, 0.8, 6);
    const bridge = new THREE.Mesh(bridgeGeo, orangeMat);
    bridge.position.set(0, 3, 14);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    this.scene.add(bridge);
    this.colliders.push({ box: new THREE.Box3().setFromObject(bridge), mesh: bridge });
    this.disposables.push(bridgeGeo);
  }

  /**
   * Checks sphere collision against world colliders
   */
  public checkSphereCollision(pos: THREE.Vector3, radius: number): THREE.Vector3 {
    const adjusted = pos.clone();
    for (const { box } of this.colliders) {
      // Find closest point on bounding box to sphere center
      const closestX = Math.max(box.min.x, Math.min(adjusted.x, box.max.x));
      const closestY = Math.max(box.min.y, Math.min(adjusted.y, box.max.y));
      const closestZ = Math.max(box.min.z, Math.min(adjusted.z, box.max.z));

      const dx = adjusted.x - closestX;
      const dy = adjusted.y - closestY;
      const dz = adjusted.z - closestZ;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < radius * radius && distSq > 0.000001) {
        const dist = Math.sqrt(distSq);
        const overlap = radius - dist;
        // Push out along normal (primarily X and Z to avoid falling through or flying)
        adjusted.x += (dx / dist) * overlap;
        adjusted.z += (dz / dist) * overlap;
      }
    }
    return adjusted;
  }

  public dispose() {
    this.disposables.forEach(d => d.dispose());
  }
}
