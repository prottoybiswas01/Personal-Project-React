import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Project, CityConfig } from '../../types/portfolio';
import { playSound } from '../../utils/storage';

interface CityCanvasProps {
  projects: Project[];
  cityConfig: CityConfig;
  onSelectProject: (project: Project) => void;
  hoveredProjectId?: string | null;
  onHoverProject?: (projectId: string | null) => void;
}

// Floating Signboard Canvas Texture for Project Names
function createProjectSignboardTexture(title: string, commits: number, floors: number, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 130;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 110, 20);
    ctx.fill();

    ctx.strokeStyle = colorHex || '#38bdf8';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(title.length > 24 ? textTruncate(title, 22) : title, 256, 52);

    ctx.font = 'bold 18px "Fira Code", monospace';
    ctx.fillStyle = colorHex || '#38bdf8';
    ctx.fillText(`🏢 ${floors} FLOORS • ${commits} COMMITS`, 256, 92);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function textTruncate(str: string, maxLen: number): string {
  return str.length > maxLen ? str.substring(0, maxLen - 2) + '...' : str;
}

// 🚶 3D Animated Pedestrian Walking
function createPedestrian(shirtColor: number): { group: THREE.Group; leftLeg: THREE.Mesh; rightLeg: THREE.Mesh; leftArm: THREE.Mesh; rightArm: THREE.Mesh } {
  const pGroup = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.5 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.4 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

  // Head
  const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 0.72;
  headMesh.castShadow = true;
  pGroup.add(headMesh);

  // Torso / Shirt
  const torsoGeo = new THREE.BoxGeometry(0.22, 0.32, 0.14);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.position.y = 0.48;
  torsoMesh.castShadow = true;
  pGroup.add(torsoMesh);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.07, 0.28, 0.07);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(-0.15, 0.48, 0);
  pGroup.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0.15, 0.48, 0);
  pGroup.add(rightArm);

  // Legs
  const legGeo = new THREE.BoxGeometry(0.08, 0.32, 0.08);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.06, 0.16, 0);
  pGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.06, 0.16, 0);
  pGroup.add(rightLeg);

  return { group: pGroup, leftLeg, rightLeg, leftArm, rightArm };
}

// 🏗️ 3D Rooftop Construction Crane with Swinging Arm & Warning Beacon
function createRooftopCrane(): { group: THREE.Group; arm: THREE.Group } {
  const craneGroup = new THREE.Group();
  const armGroup = new THREE.Group();

  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });

  // Vertical Lattice Mast
  const mastGeo = new THREE.BoxGeometry(0.2, 2.5, 0.2);
  const mastMesh = new THREE.Mesh(mastGeo, yellowMat);
  mastMesh.position.y = 1.25;
  craneGroup.add(mastMesh);

  // Horizontal Swinging Arm Group
  armGroup.position.y = 2.5;

  const jibGeo = new THREE.BoxGeometry(2.4, 0.15, 0.15);
  const jibMesh = new THREE.Mesh(jibGeo, yellowMat);
  jibMesh.position.set(0.6, 0, 0);
  armGroup.add(jibMesh);

  const weightGeo = new THREE.BoxGeometry(0.4, 0.3, 0.3);
  const weightMesh = new THREE.Mesh(weightGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
  weightMesh.position.set(-0.5, 0, 0);
  armGroup.add(weightMesh);

  // Hanging Cable & Hook
  const cableGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.2, 6);
  const cableMesh = new THREE.Mesh(cableGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
  cableMesh.position.set(1.4, -0.6, 0);
  armGroup.add(cableMesh);

  craneGroup.add(armGroup);

  // Red Warning Beacon Light
  const beaconGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const beaconMesh = new THREE.Mesh(beaconGeo, new THREE.MeshBasicMaterial({ color: 0xef4444 }));
  beaconMesh.position.set(0, 2.6, 0);
  craneGroup.add(beaconMesh);

  return { group: craneGroup, arm: armGroup };
}

// 🦅 3D Flying Bird Generator
function create3DBird(): { group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh } {
  const birdGroup = new THREE.Group();

  const bodyGeo = new THREE.ConeGeometry(0.12, 0.5, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const birdMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const bodyMesh = new THREE.Mesh(bodyGeo, birdMat);
  birdGroup.add(bodyMesh);

  const wingGeo = new THREE.BoxGeometry(0.45, 0.03, 0.2);
  const leftWing = new THREE.Mesh(wingGeo, birdMat);
  leftWing.position.set(-0.24, 0, 0);
  birdGroup.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeo, birdMat);
  rightWing.position.set(0.24, 0, 0);
  birdGroup.add(rightWing);

  birdGroup.scale.set(1.2, 1.2, 1.2);
  return { group: birdGroup, leftWing, rightWing };
}

// 🚗 Neighborhood Car Generator
function createSuburbanCar(colorHex: string): THREE.Group {
  const carGroup = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(0.9, 0.45, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: parseInt(colorHex, 16),
    roughness: 0.2,
    metalness: 0.1,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.35;
  bodyMesh.castShadow = true;
  carGroup.add(bodyMesh);

  const cabinGeo = new THREE.BoxGeometry(0.75, 0.38, 0.75);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.8 });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.position.set(0, 0.65, -0.05);
  carGroup.add(cabinMesh);

  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  wheelGeo.rotateZ(Math.PI / 2);

  [
    [-0.48, 0.18, 0.42],
    [0.48, 0.18, 0.42],
    [-0.48, 0.18, -0.42],
    [0.48, 0.18, -0.42],
  ].forEach(([wx, wy, wz]) => {
    const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
    wMesh.position.set(wx, wy, wz);
    carGroup.add(wMesh);
  });

  const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const h1 = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xfffaed }));
  h1.position.set(-0.3, 0.35, 0.7);
  const h2 = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({ color: 0xfffaed }));
  h2.position.set(0.3, 0.35, 0.7);
  carGroup.add(h1);
  carGroup.add(h2);

  return carGroup;
}

// 🌳 Detailed Neighborhood Tree Generator
function createNeighborhoodTree(type: 'oak' | 'pine'): THREE.Group {
  const treeGroup = new THREE.Group();

  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.0, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.position.y = 0.5;
  trunkMesh.castShadow = true;
  treeGroup.add(trunkMesh);

  if (type === 'oak') {
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x276749, roughness: 0.5 });
    const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 10, 10), leafMat);
    f1.position.y = 1.1;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), leafMat);
    f2.position.set(0.2, 1.5, -0.1);
    f2.castShadow = true;
    treeGroup.add(f2);
  } else {
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x1c4532, roughness: 0.5 });
    for (let p = 0; p < 3; p++) {
      const coneGeo = new THREE.CylinderGeometry(0, 0.75 - p * 0.18, 0.7, 8);
      const coneMesh = new THREE.Mesh(coneGeo, pineMat);
      coneMesh.position.y = 1.0 + p * 0.45;
      coneMesh.castShadow = true;
      treeGroup.add(coneMesh);
    }
  }

  return treeGroup;
}

// 💡 Street Lamp Post Generator
function createStreetLamp(): THREE.Group {
  const lampGroup = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.8, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8 });
  const poleMesh = new THREE.Mesh(poleGeo, poleMat);
  poleMesh.position.y = 0.9;
  lampGroup.add(poleMesh);

  const lanternGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf6e05e });
  const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
  lanternMesh.position.set(0.15, 1.8, 0);
  lampGroup.add(lanternMesh);

  return lampGroup;
}

// 🏢 MULTI-STORY SUBURBAN BUILDING BUILDER (HEIGHT & FLOORS DIRECTLY SCALE WITH COMMIT COUNT!)
function createMultiStoryBuilding(proj: Project, idx: number): { buildingGroup: THREE.Group; craneArm: THREE.Group | null } {
  const buildingGroup = new THREE.Group();
  let craneArm: THREE.Group | null = null;

  // Real commits count determines height & floors! (e.g. 67 commits = 33 floors!)
  const floors = Math.max(2, Math.min(36, Math.floor(proj.commitsCount / 2)));
  const floorHeight = 0.65;
  const totalBuildingHeight = floors * floorHeight;

  // House Color Palettes
  const palettes = [
    { wall: 0xf7fafc, roof: 0x2d3748, trim: 0xffffff, door: 0x742a2a }, // Classic Cream & Slate Roof
    { wall: 0xebf8ff, roof: 0x2b6cb0, trim: 0xe2e8f0, door: 0xd69e2e }, // Soft Blue Villa
    { wall: 0x9b2c2c, roof: 0x1a202c, trim: 0xffffff, door: 0x4a5568 }, // Red Brick Cottage
    { wall: 0xfefcbf, roof: 0xc05621, trim: 0xffffff, door: 0x276749 }, // Warm Sun Yellow Bungalow
    { wall: 0xe6fffa, roof: 0x234e52, trim: 0xe2e8f0, door: 0x805ad5 }, // Mint Coastal Home
  ];

  const palette = palettes[idx % palettes.length];
  const customWallColor = proj.buildingColor ? parseInt(proj.buildingColor.replace('#', '0x')) : palette.wall;

  const wallMat = new THREE.MeshStandardMaterial({ color: customWallColor, roughness: 0.4, metalness: 0.05 });
  const roofMat = new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.5, metalness: 0.05 });
  const trimMat = new THREE.MeshStandardMaterial({ color: palette.trim, roughness: 0.3 });
  const doorMat = new THREE.MeshStandardMaterial({ color: palette.door, roughness: 0.4 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfffaed,
    emissive: 0xffd8a8,
    emissiveIntensity: 0.8,
    roughness: 0.1,
  });

  const w = 2.6;
  const d = 2.4;

  // 1. Centered Square Lot Foundation Pad (PERFECTLY CENTERED AT (0,0,0)!)
  const lotPadGeo = new THREE.BoxGeometry(w + 0.6, 0.15, d + 0.6);
  const lotPadMesh = new THREE.Mesh(lotPadGeo, new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
  lotPadMesh.position.set(0, 0.075, 0);
  lotPadMesh.receiveShadow = true;
  buildingGroup.add(lotPadMesh);

  // 2. Multi-Story Floor Stack
  for (let f = 0; f < floors; f++) {
    const floorY = 0.15 + f * floorHeight + floorHeight / 2;

    const floorGeo = new THREE.BoxGeometry(w, floorHeight * 0.92, d);
    const floorMesh = new THREE.Mesh(floorGeo, wallMat);
    floorMesh.position.set(0, floorY, 0);
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    buildingGroup.add(floorMesh);

    // Floor Division Trim Line
    if (f > 0) {
      const divGeo = new THREE.BoxGeometry(w + 0.1, 0.08, d + 0.1);
      const divMesh = new THREE.Mesh(divGeo, trimMat);
      divMesh.position.set(0, 0.15 + f * floorHeight, 0);
      buildingGroup.add(divMesh);
    }

    // Ground floor entrance vs upper floor windows
    if (f === 0) {
      const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.06);
      const doorMesh = new THREE.Mesh(doorGeo, doorMat);
      doorMesh.position.set(0, 0.15 + 0.42, d / 2 + 0.04);
      buildingGroup.add(doorMesh);

      const porchRoofGeo = new THREE.BoxGeometry(1.4, 0.1, 0.7);
      const porchRoofMesh = new THREE.Mesh(porchRoofGeo, roofMat);
      porchRoofMesh.position.set(0, 0.15 + 0.9, d / 2 + 0.35);
      buildingGroup.add(porchRoofMesh);

      [-0.55, 0.55].forEach(px => {
        const colGeo = new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8);
        const colMesh = new THREE.Mesh(colGeo, trimMat);
        colMesh.position.set(px, 0.15 + 0.45, d / 2 + 0.65);
        buildingGroup.add(colMesh);
      });
    } else {
      [-0.7, 0.7].forEach(wx => {
        const frameGeo = new THREE.BoxGeometry(0.44, 0.42, 0.06);
        const frameMesh = new THREE.Mesh(frameGeo, trimMat);
        frameMesh.position.set(wx, floorY, d / 2 + 0.03);
        buildingGroup.add(frameMesh);

        const winGeo = new THREE.BoxGeometry(0.36, 0.34, 0.08);
        const winMesh = new THREE.Mesh(winGeo, windowMat);
        winMesh.position.set(wx, floorY, d / 2 + 0.04);
        buildingGroup.add(winMesh);
      });
    }
  }

  // 3. Roof Top Cap
  const roofH = 1.3;
  const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (w / 2 + 0.2), roofH, 4);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.position.set(0, 0.15 + totalBuildingHeight + roofH / 2, 0);
  roofMesh.castShadow = true;
  buildingGroup.add(roofMesh);

  // Active Construction Crane on Roof for High-Commit Projects (floors > 10)!
  if (floors > 10) {
    const crane = createRooftopCrane();
    crane.group.position.set(0, 0.15 + totalBuildingHeight + roofH, 0);
    buildingGroup.add(crane.group);
    craneArm = crane.arm;
  }

  // Concrete Driveway Path connecting front door to street
  const driveGeo = new THREE.BoxGeometry(1.0, 0.02, 2.2);
  const driveMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.8 });
  const driveMesh = new THREE.Mesh(driveGeo, driveMat);
  driveMesh.position.set(0, 0.01, d / 2 + 1.1);
  buildingGroup.add(driveMesh);

  return { buildingGroup, craneArm };
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  projects,
  cityConfig,
  onSelectProject,
  hoveredProjectId,
  onHoverProject
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const houseMeshesRef = useRef<{ id: string; mesh: THREE.Group; baseColor: string; project: Project; position: THREE.Vector3 }[]>([]);
  const craneArmsRef = useRef<{ arm: THREE.Group; speed: number; offset: number }[]>([]);
  const vehiclesRef = useRef<{ mesh: THREE.Group; speed: number; direction: 'x' | 'z'; pathCoord: number; currentPos: number }[]>([]);
  const birdsRef = useRef<{ group: THREE.Group; leftWing: THREE.Mesh; rightWing: THREE.Mesh; angle: number; speed: number; radius: number; altitude: number }[]>([]);
  const pedestriansRef = useRef<{ group: THREE.Group; leftLeg: THREE.Mesh; rightLeg: THREE.Mesh; leftArm: THREE.Mesh; rightArm: THREE.Mesh; targetPos: THREE.Vector3; startPos: THREE.Vector3; progress: number; speed: number }[]>([]);
  const commitPulsesRef = useRef<{ mesh: THREE.Mesh; startPos: THREE.Vector3; targetPos: THREE.Vector3; progress: number; speed: number }[]>([]);

  const [activeCamPreset, setActiveCamPreset] = useState<'overview' | 'street' | 'drone'>('overview');
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);

  const themeColors = {
    cyberpunk: { sky: 0x0f172a, grid: 0x38bdf8, grass: 0x15803d, light1: 0xfffaed, light2: 0x38bdf8 },
    matrix: { sky: 0x05140b, grid: 0x10b981, grass: 0x047857, light1: 0xfffaed, light2: 0x34d399 },
    sunset: { sky: 0x190b14, grid: 0xf59e0b, grass: 0xb45309, light1: 0xffedd5, light2: 0xec4899 },
    diamond: { sky: 0x0f172a, grid: 0x64748b, grass: 0x1d4ed8, light1: 0xfffaed, light2: 0x94a3b8 },
    'neon-blue': { sky: 0x020617, grid: 0x06b6d4, grass: 0x0369a1, light1: 0xfffaed, light2: 0x3b82f6 },
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene Setup
    const currentTheme = themeColors[cityConfig.theme] || themeColors.cyberpunk;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(currentTheme.sky);
    scene.fog = new THREE.FogExp2(currentTheme.sky, 0.0035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1400);
    camera.position.set(54, 44, 62);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3bf, 1.9);
    sunLight.position.set(45, 65, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(currentTheme.light2, 2.5, 90);
    fillLight.position.set(-20, 35, -20);
    scene.add(fillLight);

    // 5. Expanded Green Lawn Ground Disc
    const groundGeo = new THREE.CylinderGeometry(85, 88, 0.4, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: currentTheme.grass,
      roughness: 0.6,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 🛣️ 6. ACCURATE NEIGHBORHOOD GRID STREET NETWORK (Roads frame the lots - ZERO building overlap!)
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf6e05e });

    // Grid Coordinates along X & Z for 7 Columns × 5 Rows lot centers:
    // Road Grid X lines: [-42, -30, -18, -6, 6, 18, 30, 42]
    // Road Grid Z lines: [-30, -18, -6, 6, 18, 30]
    const roadXCoords = [-42, -30, -18, -6, 6, 18, 30, 42];
    const roadZCoords = [-30, -18, -6, 6, 18, 30];

    // East-West Streets
    roadZCoords.forEach((z) => {
      const roadGeo = new THREE.BoxGeometry(90, 0.02, 2.6);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(0, 0.02, z);
      scene.add(roadMesh);

      const lineGeo = new THREE.BoxGeometry(90, 0.03, 0.15);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(0, 0.03, z);
      scene.add(lineMesh);
    });

    // North-South Avenues
    roadXCoords.forEach((x) => {
      const roadGeo = new THREE.BoxGeometry(2.6, 0.02, 70);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.position.set(x, 0.02, 0);
      scene.add(roadMesh);

      const lineGeo = new THREE.BoxGeometry(0.15, 0.03, 70);
      const lineMesh = new THREE.Mesh(lineGeo, lineMat);
      lineMesh.position.set(x, 0.03, 0);
      scene.add(lineMesh);
    });

    // 🏡 7. ACCURATE LOT CENTERS (Buildings sit 100% centered in lot blocks with 6-unit buffer to streets!)
    // Lot Centers X: [-36, -24, -12, 0, 12, 24, 36] (7 Columns)
    // Lot Centers Z: [-24, -12, 0, 12, 24] (5 Rows) -> 35 primary lots, wrapping nicely for 48!
    const lotCenterX = [-36, -24, -12, 0, 12, 24, 36];
    const lotCenterZ = [-24, -12, 0, 12, 24];

    houseMeshesRef.current = [];
    craneArmsRef.current = [];
    commitPulsesRef.current = [];
    pedestriansRef.current = [];

    const sortedProjects = [...projects].sort((a, b) => b.commitsCount - a.commitsCount);
    const pedestrianShirtColors = [0x38bdf8, 0xef4444, 0x10b981, 0xf59e0b, 0xa855f7, 0xec4899];

    sortedProjects.forEach((proj, idx) => {
      const col = idx % 7;
      const row = Math.floor(idx / 7);

      const x = lotCenterX[col];
      const z = lotCenterZ[row % 5] + (row >= 5 ? 3 : 0);

      // Build Multi-Story Building (Height scales with commits!)
      const { buildingGroup, craneArm } = createMultiStoryBuilding(proj, idx);
      buildingGroup.position.set(x, 0, z);

      if (craneArm) {
        craneArmsRef.current.push({ arm: craneArm, speed: 0.8 + Math.random() * 0.6, offset: idx });
      }

      const houseColorHex = proj.buildingColor || '#38bdf8';
      const floors = Math.max(2, Math.min(36, Math.floor(proj.commitsCount / 2)));
      const totalBuildingHeight = floors * 0.65;

      // Floating Project Name Signboard Above Building Top
      const texture = createProjectSignboardTexture(proj.title, proj.commitsCount, floors, houseColorHex);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(0, 0.4 + totalBuildingHeight + 2.8, 0);
      labelSprite.scale.set(7.5, 1.85, 1);
      buildingGroup.add(labelSprite);

      scene.add(buildingGroup);

      // Trees & Street Lamps around lot
      const treeType = idx % 2 === 0 ? 'oak' : 'pine';
      const treeMesh = createNeighborhoodTree(treeType);
      treeMesh.position.set(x + 2.4, 0, z + 1.4);
      scene.add(treeMesh);

      if (idx % 3 === 0) {
        const lampMesh = createStreetLamp();
        lampMesh.position.set(x - 2.2, 0, z + 1.8);
        scene.add(lampMesh);
      }

      // Add Pedestrian Walking into Front Door ("মানুষ হেটে হেটে বিল্ডিংয়ের ভেতরে যাবে")
      const pedData = createPedestrian(pedestrianShirtColors[idx % pedestrianShirtColors.length]);
      const doorY = 0.3;
      const startPos = new THREE.Vector3(x, doorY, z + 4.5);
      const targetPos = new THREE.Vector3(x, doorY, z + 1.2);
      pedData.group.position.copy(startPos);
      scene.add(pedData.group);

      pedestriansRef.current.push({
        ...pedData,
        startPos,
        targetPos,
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.004
      });

      const housePos = new THREE.Vector3(x, 0, z);
      houseMeshesRef.current.push({
        id: proj.id,
        mesh: buildingGroup,
        baseColor: houseColorHex,
        project: proj,
        position: housePos
      });

      // Animated Git Commit Energy Pulses ("কমেন্ট ঢুকছে")
      const pulseGeo = new THREE.SphereGeometry(0.22, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: parseInt(houseColorHex.replace('#', ''), 16) || 0x38bdf8 });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);

      const pulseStartPos = new THREE.Vector3(x, 0.3, z - 5);
      pulseMesh.position.copy(pulseStartPos);
      scene.add(pulseMesh);

      commitPulsesRef.current.push({
        mesh: pulseMesh,
        startPos: pulseStartPos,
        targetPos: housePos.clone().add(new THREE.Vector3(0, 0.3, 0)),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.006
      });
    });

    // 🦅 8. FLOCK OF 3D ANIMATED BIRDS FLYING OVERHEAD
    birdsRef.current = [];
    for (let b = 0; b < 12; b++) {
      const birdData = create3DBird();
      const angle = (b / 12) * Math.PI * 2;
      const radius = 30 + Math.random() * 15;
      const altitude = 22 + Math.random() * 14;

      birdData.group.position.set(Math.cos(angle) * radius, altitude, Math.sin(angle) * radius);
      scene.add(birdData.group);

      birdsRef.current.push({
        group: birdData.group,
        leftWing: birdData.leftWing,
        rightWing: birdData.rightWing,
        angle,
        speed: 0.006 + Math.random() * 0.003,
        radius,
        altitude
      });
    }

    // 🚗 9. ANIMATED CARS DRIVING ON GRID STREETS
    vehiclesRef.current = [];
    const carColors = ['38bdf8', 'ef4444', '10b981', 'f59e0b', 'a855f7', 'fdcb6e'];

    roadZCoords.forEach((zCoord, cIdx) => {
      const carMesh = createSuburbanCar(carColors[cIdx % carColors.length]);
      carMesh.rotation.y = Math.PI / 2;
      scene.add(carMesh);
      vehiclesRef.current.push({
        mesh: carMesh,
        speed: 0.12 + Math.random() * 0.08,
        direction: 'x',
        pathCoord: zCoord,
        currentPos: -42 + (cIdx * 10)
      });
    });

    // 🔍 10. MOUSE WHEEL & TOUCH PINCH ZOOM CONTROLS
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomDelta = e.deltaY * 0.05;
      const currentRadius = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 4, 0));
      const newRadius = Math.max(8, Math.min(130, currentRadius + zoomDelta));

      const dir = cameraRef.current.position.clone().sub(new THREE.Vector3(0, 4, 0)).normalize();
      cameraRef.current.position.copy(dir.multiplyScalar(newRadius).add(new THREE.Vector3(0, 4, 0)));
      cameraRef.current.lookAt(0, 4, 0);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    // Raycasting for Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && currentObj.parent !== scene) {
          currentObj = currentObj.parent;
        }

        if (currentObj) {
          const target = houseMeshesRef.current.find(b => b.mesh === currentObj);
          if (target) {
            playSound('click');
            onSelectProject(target.project);
          }
        }
      }
    };

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let currentObj: THREE.Object3D | null = intersects[0].object;
        while (currentObj && currentObj.parent !== scene) {
          currentObj = currentObj.parent;
        }
        if (currentObj) {
          const target = houseMeshesRef.current.find(b => b.mesh === currentObj);
          if (target && onHoverProject) {
            container.style.cursor = 'pointer';
            onHoverProject(target.id);
            return;
          }
        }
      }
      container.style.cursor = 'grab';
      if (onHoverProject) onHoverProject(null);
    };

    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);

    // Orbit Drag & Touch Pinch Zoom
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = 0;
    let initialPinchDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraAngle += deltaX * 0.005;
      const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
      camera.position.x = Math.sin(cameraAngle) * currentRadius;
      camera.position.z = Math.cos(cameraAngle) * currentRadius;
      camera.position.y = Math.max(5, Math.min(95, camera.position.y - deltaY * 0.12));
      camera.lookAt(0, 4, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        cameraAngle += deltaX * 0.005;
        const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        camera.position.x = Math.sin(cameraAngle) * currentRadius;
        camera.position.z = Math.cos(cameraAngle) * currentRadius;
        camera.position.y = Math.max(5, Math.min(95, camera.position.y - deltaY * 0.12));
        camera.lookAt(0, 4, 0);

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2 && cameraRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const deltaDist = initialPinchDistance - distance;

        const zoomFactor = deltaDist * 0.15;
        const currentRadius = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 4, 0));
        const newRadius = Math.max(8, Math.min(130, currentRadius + zoomFactor));

        const direction = cameraRef.current.position.clone().sub(new THREE.Vector3(0, 4, 0)).normalize();
        cameraRef.current.position.copy(direction.multiplyScalar(newRadius).add(new THREE.Vector3(0, 4, 0)));
        cameraRef.current.lookAt(0, 4, 0);

        initialPinchDistance = distance;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    // 11. Real-time Animation Loop (Ultra-Smooth Slow Rotation, Swinging Cranes, Flapping Birds, Walking Pedestrians)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // CINEMATIC SLOW 360 AUTO-ROTATION (0.0007 speed so it doesn't dizzy the user!)
      if (isAutoRotating && !isDragging) {
        cameraAngle += 0.0007;
        const currentRadius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2);
        camera.position.x = Math.sin(cameraAngle) * currentRadius;
        camera.position.z = Math.cos(cameraAngle) * currentRadius;
        camera.lookAt(0, 4, 0);
      }

      // SWINGING ROOFTOP CONSTRUCTION CRANES ("ক্রেনগুলো ডানে-বায়ে মুভ করবে")
      craneArmsRef.current.forEach((item) => {
        item.arm.rotation.y = Math.sin(elapsedTime * item.speed + item.offset) * 0.6;
      });

      // Animate Flying Birds in Sky
      birdsRef.current.forEach((b) => {
        b.angle += b.speed;
        b.group.position.x = Math.cos(b.angle) * b.radius;
        b.group.position.z = Math.sin(b.angle) * b.radius;
        b.group.position.y = b.altitude + Math.sin(elapsedTime * 2 + b.angle) * 1.5;
        b.group.rotation.y = -b.angle + Math.PI / 2;

        const wingFlap = Math.sin(elapsedTime * 12 + b.angle) * 0.45;
        b.leftWing.rotation.z = wingFlap;
        b.rightWing.rotation.z = -wingFlap;
      });

      // Animate Walking Pedestrians ("মানুষ হেটে হেটে বিল্ডিংয়ের ভেতরে যাবে")
      pedestriansRef.current.forEach((ped) => {
        ped.progress += ped.speed;
        if (ped.progress > 1) ped.progress = 0;

        ped.group.position.lerpVectors(ped.startPos, ped.targetPos, ped.progress);

        const legSwing = Math.sin(elapsedTime * 10) * 0.35;
        ped.leftLeg.rotation.x = legSwing;
        ped.rightLeg.rotation.x = -legSwing;
        ped.leftArm.rotation.x = -legSwing;
        ped.rightArm.rotation.x = legSwing;
      });

      // Animate Vehicles driving on grid streets
      vehiclesRef.current.forEach((v) => {
        v.currentPos += v.speed;
        if (v.currentPos > 42) v.currentPos = -42;
        v.mesh.position.set(v.currentPos, 0.05, v.pathCoord);
      });

      // Animate Git Commit Energy Pulses ("কমেন্ট ঢুকছে")
      commitPulsesRef.current.forEach((cp) => {
        cp.progress += cp.speed;
        if (cp.progress > 1) cp.progress = 0;
        cp.mesh.position.lerpVectors(cp.startPos, cp.targetPos, cp.progress);
      });

      // Scale Highlight on Hover
      houseMeshesRef.current.forEach((item) => {
        const isHovered = item.id === hoveredProjectId;
        if (isHovered) {
          item.mesh.scale.set(1.08, 1.08, 1.08);
        } else {
          item.mesh.scale.set(1, 1, 1);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [projects, cityConfig, hoveredProjectId, isAutoRotating]);

  const resetCamera = (preset: 'overview' | 'street' | 'drone') => {
    setActiveCamPreset(preset);
    playSound('click');
    if (!cameraRef.current) return;
    if (preset === 'overview') {
      cameraRef.current.position.set(54, 44, 62);
    } else if (preset === 'street') {
      cameraRef.current.position.set(22, 6, 28);
    } else if (preset === 'drone') {
      cameraRef.current.position.set(0, 68, 1);
    }
    cameraRef.current.lookAt(0, 4, 0);
  };

  const handleZoom = (delta: number) => {
    playSound('click');
    if (!cameraRef.current) return;
    const dir = cameraRef.current.position.clone().sub(new THREE.Vector3(0, 4, 0)).normalize();
    const currentDist = cameraRef.current.position.distanceTo(new THREE.Vector3(0, 4, 0));
    const newDist = Math.max(8, Math.min(130, currentDist + delta));
    cameraRef.current.position.copy(dir.multiplyScalar(newDist).add(new THREE.Vector3(0, 4, 0)));
    cameraRef.current.lookAt(0, 4, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[550px] overflow-hidden rounded-2xl border border-sky-500/20 glass-panel shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Camera & Zoom & Pause Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 pointer-events-auto">
        <button
          onClick={() => resetCamera('overview')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'overview'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🌐</span> Overview ({projects.length})
        </button>
        <button
          onClick={() => resetCamera('street')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'street'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🚗</span> Street
        </button>
        <button
          onClick={() => resetCamera('drone')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'drone'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan font-bold'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🦅</span> Drone
        </button>

        {/* Pause/Play Auto Rotate Button */}
        <button
          onClick={() => {
            playSound('click');
            setIsAutoRotating(!isAutoRotating);
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            isAutoRotating
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}
          title={isAutoRotating ? 'Pause slow 360 camera rotation' : 'Resume slow 360 camera rotation'}
        >
          <span>{isAutoRotating ? '⏸️ Pause Rotate' : '▶️ Resume Rotate'}</span>
        </button>

        {/* Zoom In & Out Buttons */}
        <div className="flex items-center gap-1 ml-1 pl-1 border-l border-slate-700">
          <button
            onClick={() => handleZoom(-8)}
            title="Zoom In (Scroll Mouse Wheel Up)"
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-mono-code font-bold"
          >
            🔍 + Zoom
          </button>
          <button
            onClick={() => handleZoom(8)}
            title="Zoom Out (Scroll Mouse Wheel Down)"
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700 text-xs font-mono-code font-bold"
          >
            🔍 - Zoom
          </button>
        </div>
      </div>

      {/* 3D Neighborhood Legend & Stats Badge */}
      <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl glass-panel border border-slate-700/60 text-xs font-mono-code pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          ALL {projects.length} GITHUB PROJECTS SUBURBAN NEIGHBORHOOD
        </div>
        <p className="text-slate-400 text-[10px]">
          • 100% Centered Lots & Streets • Swinging Rooftop Cranes • Walking Pedestrians
        </p>
        <p className="text-slate-400 text-[10px]">
          • Real-Time Live GitHub Sync Active • Slow Cinematic 360 Rotation (Pause/Resume available)
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-2 text-slate-300 text-[11px]">
          <span>Buildings: <strong className="text-sky-300">{projects.length} Active</strong></span>
          <span>Theme: <strong className="text-purple-400 capitalize">{cityConfig.theme}</strong></span>
        </div>
      </div>
    </div>
  );
};
