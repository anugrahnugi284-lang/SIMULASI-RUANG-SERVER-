import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createFloorTileTexture,
  createPerforatedVentTexture,
  createServerGrillTexture,
  createSmokeParticleTexture,
} from './proceduralTextures';
import { RackData, CRACUnitData, SmokeDetectorData, VisualizationMode } from '../../types/monitoring';

// Reusable math scratchpads outside render loop (Zero GC)
const _vec3 = new THREE.Vector3();
const _color = new THREE.Color();

export interface RaycastHitItem {
  type: 'rack' | 'crac' | 'smoke';
  id: string;
  name: string;
  object: THREE.Object3D;
}

export class ServerRoomScene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public isSoftwareGl: boolean;

  // Visual collections for dynamic telemetry updates
  public rackGroups: Map<string, THREE.Group> = new Map();
  public rackBeacons: Map<string, THREE.Mesh> = new Map();
  public rackChassisMeshes: Map<string, THREE.Mesh[]> = new Map();
  public cracGroups: Map<string, THREE.Group> = new Map();
  public smokeDetectorMeshes: Map<string, THREE.Mesh> = new Map();
  public interactiveObjects: THREE.Object3D[] = [];

  // Particle systems
  private coldAirParticles!: THREE.Points;
  private hotAirParticles!: THREE.Points;
  private smokeParticles!: THREE.Points;
  private smokeGeometry!: THREE.BufferGeometry;
  private smokePositions!: Float32Array;
  private smokeVelocities!: Float32Array;
  private smokeOpacities!: Float32Array;
  public hasActiveSmoke: boolean = false;

  // Strobe emergency light
  public emergencyStrobeLight!: THREE.PointLight;

  // Common materials
  private rackMetalMaterial!: THREE.MeshStandardMaterial;
  private rackGlassMaterial!: THREE.MeshStandardMaterial;
  private floorTileTexture!: THREE.CanvasTexture;
  private perforatedVentTexture!: THREE.CanvasTexture;
  private serverGrillTexture!: THREE.CanvasTexture;

  constructor(container: HTMLElement) {
    // 1. Software WebGL Probe
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer configuration
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0b0e14');
    this.scene.fog = new THREE.FogExp2('#0b0e14', 0.032);

    this.camera = new THREE.PerspectiveCamera(
      48,
      container.clientWidth / container.clientHeight,
      0.1,
      60
    );
    // Initial isometric perspective
    this.camera.position.set(0, 9.5, 14.5);
    this.camera.lookAt(0, 1.2, 0);

    // 4. Studio Environment Reflection (RoomEnvironment PMREM)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Initialize Procedural Textures & Materials
    this.initTexturesAndMaterials();

    // 6. Build Server Room Architecture
    this.buildLightingRig();
    this.buildRoomArchitecture();
    this.buildAirflowParticles();
    this.buildSmokeParticles();
  }

  private initTexturesAndMaterials() {
    this.floorTileTexture = createFloorTileTexture();
    this.perforatedVentTexture = createPerforatedVentTexture();
    this.serverGrillTexture = createServerGrillTexture();

    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.floorTileTexture.anisotropy = maxAnisotropy;
    this.perforatedVentTexture.anisotropy = maxAnisotropy;
    this.serverGrillTexture.anisotropy = maxAnisotropy;

    this.rackMetalMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1e27',
      roughness: 0.35,
      metalness: 0.82,
    });

    this.rackGlassMaterial = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.45,
    });
  }

  private buildLightingRig() {
    // Cool Ambient / Hemisphere Light
    const hemiLight = new THREE.HemisphereLight('#88a4c8', '#101520', 0.85);
    this.scene.add(hemiLight);

    // Warm Key Directional Light with soft PCF shadow
    const keyLight = new THREE.DirectionalLight('#fff4e6', 1.8);
    keyLight.position.set(7, 12, 6);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 30;
      keyLight.shadow.camera.left = -12;
      keyLight.shadow.camera.right = 12;
      keyLight.shadow.camera.top = 10;
      keyLight.shadow.camera.bottom = -10;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Blue fill light for Cold Aisle Tech look
    const aisleFill = new THREE.DirectionalLight('#38bdf8', 0.9);
    aisleFill.position.set(-6, 8, -4);
    this.scene.add(aisleFill);

    // Emergency Flashing Strobe (Red)
    this.emergencyStrobeLight = new THREE.PointLight('#ef4444', 0, 18);
    this.emergencyStrobeLight.position.set(0, 3.8, 0);
    this.scene.add(this.emergencyStrobeLight);
  }

  private buildRoomArchitecture() {
    // 1. Raised Floor (22m x 16m)
    const floorGeo = new THREE.PlaneGeometry(22, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.floorTileTexture,
      roughness: 0.4,
      metalness: 0.3,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = !this.isSoftwareGl;
    this.scene.add(floor);

    // Perforated Cold Aisle Floor Tiles (Between Row A and Row B, z: -1.2 to 1.2)
    const coldAisleGeo = new THREE.PlaneGeometry(12, 1.8);
    const coldAisleMat = new THREE.MeshStandardMaterial({
      map: this.perforatedVentTexture,
      roughness: 0.35,
      metalness: 0.65,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const coldAisle = new THREE.Mesh(coldAisleGeo, coldAisleMat);
    coldAisle.rotation.x = -Math.PI / 2;
    coldAisle.position.set(0, 0.005, 0); // flush on floor
    this.scene.add(coldAisle);

    // 2. Ceiling with LED Troffers & Cable Trays
    const ceilingGeo = new THREE.PlaneGeometry(22, 16);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: '#11141c',
      roughness: 0.8,
      metalness: 0.1,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 4.2;
    this.scene.add(ceiling);

    // Ceiling Linear LED Lights (Strip panels)
    const ledMat = new THREE.MeshBasicMaterial({ color: '#e0f2fe' });
    const ledStrip1 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.25), ledMat);
    ledStrip1.position.set(0, 4.15, 0);
    this.scene.add(ledStrip1);

    const ledStrip2 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.25), ledMat);
    ledStrip2.position.set(0, 4.15, -3.8);
    this.scene.add(ledStrip2);

    const ledStrip3 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.06, 0.25), ledMat);
    ledStrip3.position.set(0, 4.15, 3.8);
    this.scene.add(ledStrip3);

    // 3. Perimeter Structural Beams / Server Room Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: '#141822',
      roughness: 0.7,
      metalness: 0.2,
    });

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(22, 4.2, 0.3), wallMat);
    backWall.position.set(0, 2.1, -8);
    this.scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 16), wallMat);
    leftWall.position.set(-11, 2.1, 0);
    this.scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 16), wallMat);
    rightWall.position.set(11, 2.1, 0);
    this.scene.add(rightWall);

    // Overhead Yellow Cable Trays (Spanning across rows)
    const trayMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5, metalness: 0.5 });
    [-4.2, -1.4, 1.4, 4.2].forEach((xPos) => {
      const crossTray = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 7.5), trayMat);
      crossTray.position.set(xPos, 3.4, 0);
      this.scene.add(crossTray);
    });

    // Fire Suppression (FM-200) Discharge Heads on Ceiling
    const nozzleMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9, roughness: 0.2 });
    [[-3, -1], [3, -1], [-3, 1], [3, 1]].forEach(([nx, nz]) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), nozzleMat);
      pipe.position.set(nx, 4.0, nz);
      const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.12, 12), nozzleMat);
      nozzle.rotation.x = Math.PI;
      nozzle.position.set(nx, 3.75, nz);
      this.scene.add(pipe);
      this.scene.add(nozzle);
    });
  }

  /**
   * Builds high-fidelity procedural server rack (Composite 3-12 parts)
   */
  public createServerRack(rack: RackData): THREE.Group {
    const rackGroup = new THREE.Group();
    rackGroup.position.set(...rack.position);
    rackGroup.userData = { type: 'rack', id: rack.id, name: rack.name };

    const rackWidth = 1.05;
    const rackHeight = 2.45;
    const rackDepth = 1.25;

    // Part 1: Heavy Base Plinth
    const plinthGeo = new THREE.BoxGeometry(rackWidth + 0.08, 0.12, rackDepth + 0.08);
    const plinthMat = new THREE.MeshStandardMaterial({ color: '#0d1117', roughness: 0.7, metalness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.06;
    plinth.castShadow = !this.isSoftwareGl;
    rackGroup.add(plinth);

    // Part 2: Four Vertical Corner Structural Rails
    const railGeo = new THREE.BoxGeometry(0.06, rackHeight, 0.06);
    const railMat = new THREE.MeshStandardMaterial({ color: '#262d3d', roughness: 0.3, metalness: 0.9 });
    const postOffsets = [
      [-rackWidth / 2 + 0.03, -rackDepth / 2 + 0.03],
      [rackWidth / 2 - 0.03, -rackDepth / 2 + 0.03],
      [-rackWidth / 2 + 0.03, rackDepth / 2 - 0.03],
      [rackWidth / 2 - 0.03, rackDepth / 2 - 0.03],
    ];
    postOffsets.forEach(([px, pz]) => {
      const post = new THREE.Mesh(railGeo, railMat);
      post.position.set(px, rackHeight / 2 + 0.06, pz);
      rackGroup.add(post);
    });

    // Part 3: Top Canopy Roof Panel with cable collar vents
    const roofGeo = new THREE.BoxGeometry(rackWidth, 0.08, rackDepth);
    const roof = new THREE.Mesh(roofGeo, this.rackMetalMaterial);
    roof.position.set(0, rackHeight + 0.06, 0);
    rackGroup.add(roof);

    // Part 4 & 5: Side Sheet Metal Panels
    const sideGeo = new THREE.BoxGeometry(0.03, rackHeight - 0.12, rackDepth - 0.08);
    const leftSide = new THREE.Mesh(sideGeo, this.rackMetalMaterial);
    leftSide.position.set(-rackWidth / 2, rackHeight / 2 + 0.06, 0);
    leftSide.castShadow = !this.isSoftwareGl;
    rackGroup.add(leftSide);

    const rightSide = new THREE.Mesh(sideGeo, this.rackMetalMaterial);
    rightSide.position.set(rackWidth / 2, rackHeight / 2 + 0.06, 0);
    rightSide.castShadow = !this.isSoftwareGl;
    rackGroup.add(rightSide);

    // Part 6: Front Facing Door (Cold air intake face)
    // Row A racks face positive Z (towards center cold aisle z=0); Row B racks face negative Z (towards center cold aisle z=0).
    const isRowA = rack.zone.includes('Row A');
    const frontZ = isRowA ? rackDepth / 2 : -rackDepth / 2;

    const doorFrameGeo = new THREE.BoxGeometry(rackWidth - 0.02, rackHeight - 0.14, 0.04);
    const doorMesh = new THREE.Mesh(doorFrameGeo, this.rackGlassMaterial);
    doorMesh.position.set(0, rackHeight / 2 + 0.06, frontZ);
    rackGroup.add(doorMesh);

    // Part 7: Internal Stacked Server Blade Modules (1U to 4U units)
    const bladeGeo = new THREE.BoxGeometry(rackWidth - 0.12, 0.22, rackDepth - 0.2);
    const bladeMat = new THREE.MeshStandardMaterial({
      map: this.serverGrillTexture,
      roughness: 0.4,
      metalness: 0.7,
    });

    const chassisList: THREE.Mesh[] = [];
    const bladeCount = 8;
    for (let b = 0; b < bladeCount; b++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      const by = 0.28 + b * 0.26;
      blade.position.set(0, by, 0);
      blade.castShadow = !this.isSoftwareGl;
      rackGroup.add(blade);
      chassisList.push(blade);

      // Micro LED Activity Dots on server front
      const ledGeo = new THREE.BoxGeometry(0.015, 0.015, 0.01);
      const ledMat = new THREE.MeshBasicMaterial({ color: b % 2 === 0 ? '#10b981' : '#38bdf8' });
      const led1 = new THREE.Mesh(ledGeo, ledMat);
      led1.position.set(-0.35, by, frontZ + (isRowA ? 0.015 : -0.015));
      rackGroup.add(led1);
    }
    this.rackChassisMeshes.set(rack.id, chassisList);

    // Part 8: Overhead Cylindrical Thermal Beacon Dome Light
    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 16);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#10b981',
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.1,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, rackHeight + 0.2, 0);
    rackGroup.add(beacon);
    this.rackBeacons.set(rack.id, beacon);

    // Part 9: Overhead ID Plate
    const plateGeo = new THREE.BoxGeometry(0.6, 0.16, 0.05);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, rackHeight + 0.1, frontZ);
    rackGroup.add(plate);

    // Part 10: Ground Contact Shadow Plane
    const contactShadowGeo = new THREE.PlaneGeometry(rackWidth + 0.4, rackDepth + 0.4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.set(0, 0.008, 0);
    rackGroup.add(contactShadow);

    // Part 11: Invisible Proxy Collision Box for snappy raycasting
    const proxyGeo = new THREE.BoxGeometry(rackWidth + 0.2, rackHeight + 0.4, rackDepth + 0.2);
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const proxy = new THREE.Mesh(proxyGeo, proxyMat);
    proxy.position.set(0, rackHeight / 2, 0);
    proxy.userData = { type: 'rack', id: rack.id, name: rack.name, rootGroup: rackGroup };
    rackGroup.add(proxy);
    this.interactiveObjects.push(proxy);

    this.scene.add(rackGroup);
    this.rackGroups.set(rack.id, rackGroup);
    return rackGroup;
  }

  /**
   * Builds Precision In-Row CRAC Cooling Unit
   */
  public createCRACUnit(crac: CRACUnitData): THREE.Group {
    const cracGroup = new THREE.Group();
    cracGroup.position.set(...crac.position);
    cracGroup.userData = { type: 'crac', id: crac.id, name: crac.name };

    const w = 1.35;
    const h = 2.6;
    const d = 1.35;

    // Body
    const bodyGeo = new THREE.BoxGeometry(w, h, d);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#2d3748',
      roughness: 0.4,
      metalness: 0.7,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = h / 2;
    body.castShadow = !this.isSoftwareGl;
    cracGroup.add(body);

    // Front Air Discharge Louvers (Blue accented)
    const louverGeo = new THREE.BoxGeometry(w - 0.2, h * 0.65, 0.05);
    const louverMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.3,
      metalness: 0.6,
    });
    const louvers = new THREE.Mesh(louverGeo, louverMat);
    louvers.position.set(0, h * 0.45, d / 2 + 0.02);
    cracGroup.add(louvers);

    // Digital Control Screen
    const screenGeo = new THREE.PlaneGeometry(0.45, 0.3);
    const screenMat = new THREE.MeshBasicMaterial({ color: '#0369a1' });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, h * 0.85, d / 2 + 0.03);
    cracGroup.add(screen);

    // Overhead Status Dome
    const domeGeo = new THREE.SphereGeometry(0.12, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, h, 0);
    cracGroup.add(dome);

    // Invisible proxy
    const proxyGeo = new THREE.BoxGeometry(w + 0.2, h + 0.2, d + 0.2);
    const proxy = new THREE.Mesh(proxyGeo, new THREE.MeshBasicMaterial({ visible: false }));
    proxy.position.y = h / 2;
    proxy.userData = { type: 'crac', id: crac.id, name: crac.name, rootGroup: cracGroup };
    cracGroup.add(proxy);
    this.interactiveObjects.push(proxy);

    this.scene.add(cracGroup);
    this.cracGroups.set(crac.id, cracGroup);
    return cracGroup;
  }

  /**
   * Builds Optical Ceiling Smoke Detector
   */
  public createSmokeDetector(sd: SmokeDetectorData): THREE.Group {
    const sdGroup = new THREE.Group();
    sdGroup.position.set(...sd.position);
    sdGroup.userData = { type: 'smoke', id: sd.id, name: sd.name };

    // Base mounting ring
    const baseGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.05, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    sdGroup.add(base);

    // Optical chamber conical cone
    const chamberGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.09, 20);
    const chamberMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.5 });
    const chamber = new THREE.Mesh(chamberGeo, chamberMat);
    chamber.position.y = -0.06;
    sdGroup.add(chamber);

    // Central Status LED Indicator
    const ledGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const ledMat = new THREE.MeshBasicMaterial({ color: '#10b981' });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.y = -0.11;
    sdGroup.add(led);
    this.smokeDetectorMeshes.set(sd.id, led);

    // Invisible proxy for raycasting
    const proxy = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    proxy.userData = { type: 'smoke', id: sd.id, name: sd.name, rootGroup: sdGroup };
    sdGroup.add(proxy);
    this.interactiveObjects.push(proxy);

    this.scene.add(sdGroup);
    return sdGroup;
  }

  /**
   * Procedural Cold & Hot Airflow Particle Systems
   */
  private buildAirflowParticles() {
    // 1. Cold Air Particles (Rising from Cold Aisle Floor)
    const coldCount = 180;
    const coldGeo = new THREE.BufferGeometry();
    const coldPos = new Float32Array(coldCount * 3);
    for (let i = 0; i < coldCount; i++) {
      coldPos[i * 3] = (Math.random() - 0.5) * 11;
      coldPos[i * 3 + 1] = Math.random() * 2.8;
      coldPos[i * 3 + 2] = (Math.random() - 0.5) * 1.6; // centered around z=0 cold aisle
    }
    coldGeo.setAttribute('position', new THREE.BufferAttribute(coldPos, 3));

    const coldMat = new THREE.PointsMaterial({
      color: '#38bdf8',
      size: 0.085,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    this.coldAirParticles = new THREE.Points(coldGeo, coldMat);
    this.scene.add(this.coldAirParticles);

    // 2. Hot Air Particles (Rising behind racks in Hot Aisle)
    const hotCount = 160;
    const hotGeo = new THREE.BufferGeometry();
    const hotPos = new Float32Array(hotCount * 3);
    for (let i = 0; i < hotCount; i++) {
      hotPos[i * 3] = (Math.random() - 0.5) * 11;
      hotPos[i * 3 + 1] = Math.random() * 3.2;
      // In Row A rear (z < -3) or Row B rear (z > 3)
      const isRowA = Math.random() > 0.5;
      hotPos[i * 3 + 2] = isRowA ? -3.4 + (Math.random() - 0.5) * 1.2 : 3.4 + (Math.random() - 0.5) * 1.2;
    }
    hotGeo.setAttribute('position', new THREE.BufferAttribute(hotPos, 3));

    const hotMat = new THREE.PointsMaterial({
      color: '#fb923c',
      size: 0.08,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.hotAirParticles = new THREE.Points(hotGeo, hotMat);
    this.scene.add(this.hotAirParticles);
  }

  /**
   * Volumetric Procedural Dynamic Smoke System
   */
  private buildSmokeParticles() {
    const smokeCount = 120;
    this.smokeGeometry = new THREE.BufferGeometry();
    this.smokePositions = new Float32Array(smokeCount * 3);
    this.smokeVelocities = new Float32Array(smokeCount * 3);
    this.smokeOpacities = new Float32Array(smokeCount);

    for (let i = 0; i < smokeCount; i++) {
      this.resetSmokeParticle(i, 0, 0, 0, false);
    }

    this.smokeGeometry.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));

    const smokeTex = createSmokeParticleTexture();
    const smokeMat = new THREE.PointsMaterial({
      map: smokeTex,
      size: 0.65,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.smokeParticles = new THREE.Points(this.smokeGeometry, smokeMat);
    this.scene.add(this.smokeParticles);
  }

  private resetSmokeParticle(i: number, originX: number, originY: number, originZ: number, active: boolean) {
    this.smokePositions[i * 3] = originX + (Math.random() - 0.5) * 0.8;
    this.smokePositions[i * 3 + 1] = originY + Math.random() * 0.4;
    this.smokePositions[i * 3 + 2] = originZ + (Math.random() - 0.5) * 0.8;

    this.smokeVelocities[i * 3] = (Math.random() - 0.5) * 0.4;
    this.smokeVelocities[i * 3 + 1] = 0.6 + Math.random() * 0.8; // upward draft
    this.smokeVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

    this.smokeOpacities[i] = active ? 0.75 : 0;
  }

  /**
   * Update dynamic telemetry visualization (Colors, Beacons, Smoke, Strobe)
   */
  public updateTelemetry(
    racks: RackData[],
    smokeDetectors: SmokeDetectorData[],
    mode: VisualizationMode,
    elapsedTime: number
  ) {
    let anySmokeDetected = false;
    let anyCriticalAlert = false;
    let smokeOriginX = -1.4;
    let smokeOriginZ = -2.4;

    racks.forEach((rack) => {
      const beacon = this.rackBeacons.get(rack.id);
      const chassisMeshes = this.rackChassisMeshes.get(rack.id);

      // Determine colors
      let statusColor = '#10b981'; // Green
      let emissiveIntensity = 0.8;

      if (rack.status === 'warning') {
        statusColor = '#f59e0b'; // Amber
        emissiveIntensity = 1.2;
      } else if (rack.status === 'critical') {
        statusColor = '#ef4444'; // Red
        emissiveIntensity = Math.sin(elapsedTime * 9) > 0 ? 2.5 : 0.2; // Fast blink
        anyCriticalAlert = true;
      }

      if (rack.smokeTriggered) {
        anySmokeDetected = true;
        smokeOriginX = rack.position[0];
        smokeOriginZ = rack.position[2];
      }

      // Heatmap color override if thermal mode
      if (mode === 'thermal') {
        const temp = rack.temp;
        if (temp < 21) statusColor = '#06b6d4'; // Cyan
        else if (temp < 24) statusColor = '#10b981'; // Green
        else if (temp < 28) statusColor = '#f59e0b'; // Yellow/Orange
        else statusColor = '#ef4444'; // Hot Red
        emissiveIntensity = 1.4;
      }

      if (beacon) {
        const mat = beacon.material as THREE.MeshStandardMaterial;
        mat.color.set(statusColor);
        mat.emissive.set(statusColor);
        mat.emissiveIntensity = emissiveIntensity;
      }

      if (chassisMeshes && mode === 'thermal') {
        chassisMeshes.forEach((mesh) => {
          (mesh.material as THREE.MeshStandardMaterial).color.set(statusColor);
        });
      } else if (chassisMeshes && mode !== 'thermal') {
        chassisMeshes.forEach((mesh) => {
          (mesh.material as THREE.MeshStandardMaterial).color.set('#1a1e27');
        });
      }
    });

    // Update Smoke Detector LED status
    smokeDetectors.forEach((sd) => {
      const led = this.smokeDetectorMeshes.get(sd.id);
      if (led) {
        const mat = led.material as THREE.MeshBasicMaterial;
        if (sd.status === 'critical' || sd.triggered) {
          mat.color.set(Math.sin(elapsedTime * 12) > 0 ? '#ef4444' : '#450a0a');
          anySmokeDetected = true;
          anyCriticalAlert = true;
          smokeOriginX = sd.position[0];
          smokeOriginZ = sd.position[2];
        } else if (sd.status === 'warning') {
          mat.color.set('#f59e0b');
        } else {
          mat.color.set('#10b981');
        }
      }
    });

    // Emergency ceiling strobe
    if (anyCriticalAlert) {
      this.emergencyStrobeLight.intensity = Math.sin(elapsedTime * 10) > 0.2 ? 3.5 : 0;
    } else {
      this.emergencyStrobeLight.intensity = 0;
    }

    // Update Smoke Particles
    this.hasActiveSmoke = anySmokeDetected;
    const smokeMat = this.smokeParticles.material as THREE.PointsMaterial;
    if (anySmokeDetected) {
      smokeMat.opacity = 0.8;
      const count = this.smokePositions.length / 3;
      for (let i = 0; i < count; i++) {
        this.smokePositions[i * 3 + 1] += this.smokeVelocities[i * 3 + 1] * 0.025;
        this.smokePositions[i * 3] += this.smokeVelocities[i * 3] * 0.02;
        this.smokePositions[i * 3 + 2] += this.smokeVelocities[i * 3 + 2] * 0.02;

        if (this.smokePositions[i * 3 + 1] > 4.1) {
          this.resetSmokeParticle(i, smokeOriginX, 0.4, smokeOriginZ, true);
        }
      }
      this.smokeGeometry.attributes.position.needsUpdate = true;
    } else {
      smokeMat.opacity = 0;
    }

    // Update Airflow Particles
    if (mode !== 'airflow') {
      (this.coldAirParticles.material as THREE.PointsMaterial).opacity = 0.2;
      (this.hotAirParticles.material as THREE.PointsMaterial).opacity = 0.15;
    } else {
      (this.coldAirParticles.material as THREE.PointsMaterial).opacity = 0.75;
      (this.hotAirParticles.material as THREE.PointsMaterial).opacity = 0.65;
    }

    const coldAttr = this.coldAirParticles.geometry.attributes.position;
    const coldArr = coldAttr.array as Float32Array;
    for (let i = 0; i < coldArr.length; i += 3) {
      coldArr[i + 1] += 0.022; // rise
      if (coldArr[i + 1] > 2.8) coldArr[i + 1] = 0.05;
    }
    coldAttr.needsUpdate = true;

    const hotAttr = this.hotAirParticles.geometry.attributes.position;
    const hotArr = hotAttr.array as Float32Array;
    for (let i = 0; i < hotArr.length; i += 3) {
      hotArr[i + 1] += 0.026;
      if (hotArr[i + 1] > 3.4) hotArr[i + 1] = 0.2;
    }
    hotAttr.needsUpdate = true;
  }

  public dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
