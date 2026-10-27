import * as THREE from 'three';

export interface BoxCollider {
  box: THREE.Box3;
  mesh: THREE.Mesh;
}

/**
 * Free Fire Combat Zone / Training Ground 3D Environment
 * Recreates Reference Image 3:
 * - Daylight sky and sunlight
 * - Asphalt road with yellow curbs and white lane dashes
 * - Sea-blue corrugated shipping containers (stacked in angles)
 * - Wooden / steel climbable ramps leading to container roofs
 * - 2-Story military warehouse with open balconies, windows, and rooftop
 * - Right-side concrete barracks building with exterior stairs
 * - Concrete perimeter wall with industrial light posts
 */
export class TrainingGroundWorld {
  public scene: THREE.Scene;
  public colliders: BoxCollider[] = [];
  private disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildWorld();
  }

  private buildWorld() {
    // 1. Daylight Atmosphere (Reference Image 3)
    this.scene.background = new THREE.Color(0x7fa9d2); // Clear daytime sky
    this.scene.fog = new THREE.Fog(0x7fa9d2, 60, 160);

    // 2. Realistic Daylight Lighting
    const ambientLight = new THREE.AmbientLight(0xdce9f6, 0.95);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff6e5, 1.6);
    sunLight.position.set(40, 60, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 160;
    const d = 50;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Soft sky fill light
    const skyFill = new THREE.DirectionalLight(0x93c5fd, 0.4);
    skyFill.position.set(-30, 40, -30);
    this.scene.add(skyFill);

    // 3. Concrete Ground & Asphalt Road
    this.buildTerrain();

    // 4. Blue Shipping Containers & Ramps (Image 3)
    this.buildShippingContainers();

    // 5. Two-Story Industrial Warehouse Building (Left of Image 3)
    this.buildWarehouse();

    // 6. Right-Side Compound Barracks with Exterior Stairs (Right of Image 3)
    this.buildBarracksCompound();

    // 7. Perimeter Walls & Lamp Posts
    this.buildPerimeterAndLighting();
  }

  private buildTerrain() {
    const groundSize = 120;

    // Base Concrete Ground
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af, // Weathered concrete pavement
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.disposables.push(groundGeo, groundMat);

    // Central Asphalt Roadway (Image 3 center road)
    const roadWidth = 10;
    const roadLength = 110;
    const roadGeo = new THREE.PlaneGeometry(roadLength, roadWidth);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark asphalt
      roughness: 0.7,
      metalness: 0.15,
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, 4);
    road.receiveShadow = true;
    this.scene.add(road);
    this.disposables.push(roadGeo, roadMat);

    // Yellow Curbs
    const curbGeo = new THREE.BoxGeometry(roadLength, 0.15, 0.4);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const topCurb = new THREE.Mesh(curbGeo, curbMat);
    topCurb.position.set(0, 0.08, 4 + roadWidth / 2);
    topCurb.receiveShadow = true;
    this.scene.add(topCurb);

    const bottomCurb = new THREE.Mesh(curbGeo, curbMat);
    bottomCurb.position.set(0, 0.08, 4 - roadWidth / 2);
    bottomCurb.receiveShadow = true;
    this.scene.add(bottomCurb);
    this.disposables.push(curbGeo, curbMat);

    // White Dashed Lane Dividers
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.disposables.push(dashMat);
    for (let x = -50; x <= 50; x += 6) {
      const dashGeo = new THREE.PlaneGeometry(3.2, 0.35);
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(x, 0.02, 4);
      this.scene.add(dash);
      this.disposables.push(dashGeo);
    }
  }

  private buildShippingContainers() {
    // Blue Corrugated Shipping Container Material (Image 3)
    const containerMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Vibrant Free Fire Blue
      roughness: 0.45,
      metalness: 0.35,
    });
    const darkContainerMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.5,
      metalness: 0.3,
    });
    const rampMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Amber/yellow wooden/steel ramp
      roughness: 0.7,
      metalness: 0.2,
    });
    this.disposables.push(containerMat, darkContainerMat, rampMat);

    const addContainer = (w: number, h: number, d: number, x: number, y: number, z: number, rotY: number = 0, mat = containerMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);

      // Add white/yellow stencil marking bar
      const barGeo = new THREE.BoxGeometry(w * 0.95, 0.25, 0.04);
      const barMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(0, 0, d / 2 + 0.02);
      mesh.add(bar);

      const box = new THREE.Box3().setFromObject(mesh);
      this.colliders.push({ box, mesh });
      this.disposables.push(geo, barGeo, barMat);
      return mesh;
    };

    // 1. Center Containers Group (Angle as seen in Image 3)
    // Container A (Ground)
    addContainer(3.2, 2.8, 8.0, -6, 0, 16, 0.2);
    // Container B (Ground, perpendicular/angled)
    addContainer(3.2, 2.8, 8.0, 4, 0, 18, -0.3, darkContainerMat);
    // Container C (Stacked on Container A!)
    addContainer(3.2, 2.8, 8.0, -5.5, 2.8, 16.5, 0.18);
    // Container D (Roadside single)
    addContainer(3.2, 2.8, 8.0, -14, 0, 8, 0.05);
    // Container E (Near compound)
    addContainer(3.2, 2.8, 8.0, 14, 0, 15, -0.1);

    // 2. Inclined Climbable Ramps (allowing player to run up onto container roofs!)
    const rampWidth = 2.4;
    const rampLength = 7.5;
    const rampAngle = Math.atan2(2.8, rampLength); // ~20 degrees incline

    const rampGeo = new THREE.BoxGeometry(rampWidth, 0.2, rampLength);
    const ramp1 = new THREE.Mesh(rampGeo, rampMat);
    ramp1.position.set(-6, 1.4, 9.8);
    ramp1.rotation.x = rampAngle;
    ramp1.rotation.y = 0.2;
    ramp1.castShadow = true;
    ramp1.receiveShadow = true;
    this.scene.add(ramp1);

    const ramp1Box = new THREE.Box3().setFromObject(ramp1);
    this.colliders.push({ box: ramp1Box, mesh: ramp1 });
    this.disposables.push(rampGeo);

    // Catwalk Bridge Planks connecting containers
    const bridgeGeo = new THREE.BoxGeometry(7, 0.25, 2);
    const bridge = new THREE.Mesh(bridgeGeo, rampMat);
    bridge.position.set(-1, 2.9, 17.5);
    bridge.castShadow = true;
    bridge.receiveShadow = true;
    this.scene.add(bridge);
    this.colliders.push({ box: new THREE.Box3().setFromObject(bridge), mesh: bridge });
    this.disposables.push(bridgeGeo);
  }

  private buildWarehouse() {
    // Two-Story Beige Military Industrial Warehouse (Left of Image 3)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xb5aba0, // Light weathered industrial concrete
      roughness: 0.75,
      metalness: 0.1,
    });
    const redTrimMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Red accent stripe
      roughness: 0.5,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
    });
    this.disposables.push(wallMat, redTrimMat, roofMat);

    const addWall = (w: number, h: number, d: number, x: number, y: number, z: number, mat = wallMat) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      const box = new THREE.Box3().setFromObject(mesh);
      this.colliders.push({ box, mesh });
      this.disposables.push(geo);
      return mesh;
    };

    const warehouseX = -28;
    const warehouseZ = 34;
    const width = 24;
    const height = 9.5;
    const depth = 20;

    // Warehouse Main Body Structure
    addWall(width, height, depth, warehouseX, 0, warehouseZ);

    // Red Trim Stripe around mid-height (Image 3)
    const trimGeo = new THREE.BoxGeometry(width + 0.3, 0.45, depth + 0.3);
    const trim = new THREE.Mesh(trimGeo, redTrimMat);
    trim.position.set(warehouseX, 5.0, warehouseZ);
    this.scene.add(trim);
    this.disposables.push(trimGeo);

    // Rooftop Skylight Vents (Image 3)
    for (let i = -1; i <= 1; i++) {
      const ventGeo = new THREE.BoxGeometry(4.5, 1.2, 3.5);
      const vent = new THREE.Mesh(ventGeo, redTrimMat);
      vent.position.set(warehouseX + i * 6.5, height + 0.6, warehouseZ);
      vent.castShadow = true;
      this.scene.add(vent);
      this.colliders.push({ box: new THREE.Box3().setFromObject(vent), mesh: vent });
      this.disposables.push(ventGeo);
    }

    // Front Balcony Overhang at 2nd floor (Image 3)
    const balconyGeo = new THREE.BoxGeometry(10, 0.4, 3.5);
    const balcony = new THREE.Mesh(balconyGeo, roofMat);
    balcony.position.set(warehouseX, 5.0, warehouseZ - depth / 2 - 1.75);
    balcony.castShadow = true;
    balcony.receiveShadow = true;
    this.scene.add(balcony);
    this.colliders.push({ box: new THREE.Box3().setFromObject(balcony), mesh: balcony });
    this.disposables.push(balconyGeo);
  }

  private buildBarracksCompound() {
    // Right-Side 2-Story Military Barracks Building (Right of Image 3)
    const barracksMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Grey military concrete
      roughness: 0.7,
      metalness: 0.2,
    });
    this.disposables.push(barracksMat);

    const barracksX = 26;
    const barracksZ = 32;
    const bWidth = 16;
    const bHeight = 8;
    const bDepth = 18;

    const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
    const barracks = new THREE.Mesh(bGeo, barracksMat);
    barracks.position.set(barracksX, bHeight / 2, barracksZ);
    barracks.castShadow = true;
    barracks.receiveShadow = true;
    this.scene.add(barracks);
    this.colliders.push({ box: new THREE.Box3().setFromObject(barracks), mesh: barracks });
    this.disposables.push(bGeo);

    // Exterior Concrete Staircase Leading Up (Image 3)
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const stepGeo = new THREE.BoxGeometry(3.5, 0.6, 1.4);
      const step = new THREE.Mesh(stepGeo, barracksMat);
      step.position.set(barracksX - bWidth / 2 - 1.8, (i + 1) * 0.6, barracksZ - 6 + i * 1.4);
      step.castShadow = true;
      step.receiveShadow = true;
      this.scene.add(step);
      this.colliders.push({ box: new THREE.Box3().setFromObject(step), mesh: step });
      this.disposables.push(stepGeo);
    }
  }

  private buildPerimeterAndLighting() {
    const wallHeight = 6.0;
    const wallThickness = 1.5;
    const boundary = 55;

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x4b5563,
      roughness: 0.8,
    });
    this.disposables.push(wallMat);

    const makeWall = (w: number, d: number, x: number, z: number) => {
      const geo = new THREE.BoxGeometry(w, wallHeight, d);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, wallHeight / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.scene.add(mesh);
      this.colliders.push({ box: new THREE.Box3().setFromObject(mesh), mesh });
      this.disposables.push(geo);
    };

    // 4 Outer Boundary Walls
    makeWall(110, wallThickness, 0, boundary);
    makeWall(110, wallThickness, 0, -boundary);
    makeWall(wallThickness, 110, boundary, 0);
    makeWall(wallThickness, 110, -boundary, 0);

    // Industrial Light Poles along road and corners (Image 3)
    const polePositions = [
      [-20, 10],
      [20, 10],
      [-20, -2],
      [20, -2],
      [-40, 20],
      [40, 20],
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.disposables.push(poleMat, lampGlowMat);

    polePositions.forEach(([px, pz]) => {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7, 8);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, 3.5, pz);
      pole.castShadow = true;
      this.scene.add(pole);

      const lampGeo = new THREE.BoxGeometry(0.6, 0.2, 0.4);
      const lamp = new THREE.Mesh(lampGeo, lampGlowMat);
      lamp.position.set(px, 7.1, pz);
      this.scene.add(lamp);

      this.disposables.push(poleGeo, lampGeo);
    });

    // Distant Green Mountain Horizon (Image 3 background hill)
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x365314, roughness: 0.95 });
    this.disposables.push(hillMat);

    const hill1 = new THREE.Mesh(new THREE.ConeGeometry(50, 28, 12), hillMat);
    hill1.position.set(0, 5, 85);
    hill1.scale.set(2.2, 1, 1);
    this.scene.add(hill1);

    const hill2 = new THREE.Mesh(new THREE.ConeGeometry(40, 24, 12), hillMat);
    hill2.position.set(-55, 4, 75);
    this.scene.add(hill2);
  }

  /**
   * Smooth Player Collision against all Training Ground Geometry (containers, ramps, buildings)
   */
  public checkSphereCollision(pos: THREE.Vector3, radius: number): THREE.Vector3 {
    const adjusted = pos.clone();
    for (const { box } of this.colliders) {
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

        // If landing on top of a surface (like container roof or ramp), adjust Y
        if (adjusted.y > box.max.y - 0.3 && dy > 0) {
          adjusted.y = box.max.y + radius * 0.8;
        } else {
          // Push out along horizontal plane
          adjusted.x += (dx / dist) * overlap;
          adjusted.z += (dz / dist) * overlap;
        }
      }
    }
    return adjusted;
  }

  public dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
