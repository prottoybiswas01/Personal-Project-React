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
function createProjectSignboardTexture(text: string, status: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Glassmorphic Signboard Card Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 20);
    ctx.fill();

    // Vibrant Glow Border
    ctx.strokeStyle = colorHex || '#38bdf8';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Title Text
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text.length > 24 ? text.substring(0, 22) + '...' : text, 256, 52);

    // Status / Commit Badge
    ctx.font = 'bold 18px "Fira Code", monospace';
    ctx.fillStyle = colorHex || '#38bdf8';
    ctx.fillText(status, 256, 92);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 🚗 Neighborhood Car Generator
function createSuburbanCar(colorHex: string): THREE.Group {
  const carGroup = new THREE.Group();

  // Body
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

  // Roof & Windows
  const cabinGeo = new THREE.BoxGeometry(0.75, 0.38, 0.75);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.1,
    metalness: 0.8,
  });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.position.set(0, 0.65, -0.05);
  carGroup.add(cabinMesh);

  // Wheels
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

  // Lights
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

  // Wooden Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 1.0, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 });
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.position.y = 0.5;
  trunkMesh.castShadow = true;
  treeGroup.add(trunkMesh);

  if (type === 'oak') {
    // Deciduous Foliage Spheres
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
    // Pine Tree Cones
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

  // Pole
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, 1.8, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.8 });
  const poleMesh = new THREE.Mesh(poleGeo, poleMat);
  poleMesh.position.y = 0.9;
  lampGroup.add(poleMesh);

  // Arm & Lantern
  const lanternGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xf6e05e });
  const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
  lanternMesh.position.set(0.15, 1.8, 0);
  lampGroup.add(lanternMesh);

  return lampGroup;
}

// 🏡 REALISTIC SUBURBAN PROJECT HOUSE BUILDER (5 Authentic House Archetypes)
function createSuburbanHome(proj: Project, idx: number): THREE.Group {
  const houseGroup = new THREE.Group();

  // House Color Palettes
  const housePalettes = [
    { wall: 0xf7fafc, roof: 0x2d3748, trim: 0xffffff, door: 0x742a2a }, // Classic Cream & Slate Roof
    { wall: 0xebf8ff, roof: 0x2b6cb0, trim: 0xe2e8f0, door: 0xd69e2e }, // Soft Blue Villa
    { wall: 0x9b2c2c, roof: 0x1a202c, trim: 0xffffff, door: 0x4a5568 }, // Red Brick Cottage
    { wall: 0xfefcbf, roof: 0xc05621, trim: 0xffffff, door: 0x276749 }, // Warm Sun Yellow Bungalow
    { wall: 0xe6fffa, roof: 0x234e52, trim: 0xe2e8f0, door: 0x805ad5 }, // Mint Coastal Home
  ];

  const palette = housePalettes[idx % housePalettes.length];
  const customWallColor = proj.buildingColor ? parseInt(proj.buildingColor.replace('#', '0x')) : palette.wall;

  const wallMat = new THREE.MeshStandardMaterial({ color: customWallColor, roughness: 0.4, metalness: 0.05 });
  const roofMat = new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.5, metalness: 0.05 });
  const trimMat = new THREE.MeshStandardMaterial({ color: palette.trim, roughness: 0.3 });
  const doorMat = new THREE.MeshStandardMaterial({ color: palette.door, roughness: 0.4 });
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0xfffaed,
    emissive: 0xffd8a8,
    emissiveIntensity: 0.75,
    roughness: 0.1,
  });

  const styleType = idx % 5;

  if (styleType === 0) {
    // 🏡 ARCHETYPE 0: TWO-STORY SUBURBAN FAMILY HOME WITH PORCH & CHIMNEY
    const w = 2.6;
    const h = 2.2;
    const d = 2.4;

    // Main House Box
    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + h / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    houseGroup.add(wallMesh);

    // Eave Roof Trim
    const eaveGeo = new THREE.BoxGeometry(w + 0.3, 0.14, d + 0.3);
    const eaveMesh = new THREE.Mesh(eaveGeo, trimMat);
    eaveMesh.position.y = 0.2 + h;
    houseGroup.add(eaveMesh);

    // Pitched Shingle Roof (Pyramid / Gable)
    const roofH = 1.3;
    const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (w / 2 + 0.2), roofH, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 0.2 + h + 0.07 + roofH / 2;
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    // Porch Roof & Columns
    const porchRoofGeo = new THREE.BoxGeometry(1.4, 0.12, 0.8);
    const porchRoofMesh = new THREE.Mesh(porchRoofGeo, roofMat);
    porchRoofMesh.position.set(0, 0.2 + 1.1, d / 2 + 0.4);
    houseGroup.add(porchRoofMesh);

    [-0.55, 0.55].forEach(px => {
      const colGeo = new THREE.CylinderGeometry(0.05, 0.06, 1.1, 8);
      const colMesh = new THREE.Mesh(colGeo, trimMat);
      colMesh.position.set(px, 0.2 + 0.55, d / 2 + 0.7);
      houseGroup.add(colMesh);
    });

    // Front Door & Handle
    const doorGeo = new THREE.BoxGeometry(0.55, 0.9, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.45, d / 2 + 0.04);
    houseGroup.add(doorMesh);

    const knobGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const knobMesh = new THREE.Mesh(knobGeo, new THREE.MeshStandardMaterial({ color: 0xd69e2e, metalness: 0.8 }));
    knobMesh.position.set(0.2, 0.2 + 0.45, d / 2 + 0.08);
    houseGroup.add(knobMesh);

    // Windows (Ground & 1st Floor)
    [
      [-0.7, 0.6], [0.7, 0.6],
      [-0.7, 1.6], [0.7, 1.6]
    ].forEach(([wx, wy]) => {
      const frameGeo = new THREE.BoxGeometry(0.44, 0.52, 0.06);
      const frameMesh = new THREE.Mesh(frameGeo, trimMat);
      frameMesh.position.set(wx, 0.2 + wy, d / 2 + 0.03);
      houseGroup.add(frameMesh);

      const winGeo = new THREE.BoxGeometry(0.36, 0.44, 0.08);
      const winMesh = new THREE.Mesh(winGeo, windowMat);
      winMesh.position.set(wx, 0.2 + wy, d / 2 + 0.04);
      houseGroup.add(winMesh);
    });

    // Chimney & Smoke
    const chimneyGeo = new THREE.BoxGeometry(0.35, 1.0, 0.35);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x742a2a });
    const chimneyMesh = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimneyMesh.position.set(0.7, 0.2 + h + 0.5, 0.3);
    houseGroup.add(chimneyMesh);

    for (let s = 0; s < 3; s++) {
      const smokeGeo = new THREE.SphereGeometry(0.12 + s * 0.06, 8, 8);
      const smokeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 - s * 0.18 });
      const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
      smokeMesh.position.set(0.7 + (s % 2 === 0 ? 0.04 : -0.04), 0.2 + h + 1.1 + s * 0.25, 0.3);
      houseGroup.add(smokeMesh);
    }

  } else if (styleType === 1) {
    // 🏢 ARCHETYPE 1: MODERN GLASS & TIMBER ARCHITECTURAL VILLA
    const w = 2.8;
    const h = 2.0;
    const d = 2.4;

    // Ground Floor Unit
    const wallGeo = new THREE.BoxGeometry(w, h * 0.5, d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + h * 0.25;
    wallMesh.castShadow = true;
    houseGroup.add(wallMesh);

    // Upper Cantilevered Glass Floor
    const upperGeo = new THREE.BoxGeometry(w * 0.9, h * 0.5, d * 0.9);
    const upperMesh = new THREE.Mesh(upperGeo, new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.2 }));
    upperMesh.position.set(0.2, 0.2 + h * 0.75, 0);
    upperMesh.castShadow = true;
    houseGroup.add(upperMesh);

    // Flat Terrace Roof
    const roofGeo = new THREE.BoxGeometry(w * 0.95, 0.12, d * 0.95);
    const roofMesh = new THREE.Mesh(roofGeo, trimMat);
    roofMesh.position.set(0.2, 0.2 + h + 0.06, 0);
    houseGroup.add(roofMesh);

    // Large Panoramic Windows
    const winGeo = new THREE.BoxGeometry(w * 0.7, h * 0.35, 0.08);
    const winMesh = new THREE.Mesh(winGeo, windowMat);
    winMesh.position.set(0.2, 0.2 + h * 0.75, d * 0.45 + 0.02);
    houseGroup.add(winMesh);

    // Wooden Pergola / Awning
    const pergolaGeo = new THREE.BoxGeometry(1.6, 0.08, 0.7);
    const pergolaMat = new THREE.MeshStandardMaterial({ color: 0x8d5b4c });
    const pergolaMesh = new THREE.Mesh(pergolaGeo, pergolaMat);
    pergolaMesh.position.set(-0.2, 0.2 + h * 0.5, d / 2 + 0.35);
    houseGroup.add(pergolaMesh);

    // Front Glass Door
    const doorGeo = new THREE.BoxGeometry(0.6, 0.85, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(-0.2, 0.2 + 0.42, d / 2 + 0.04);
    houseGroup.add(doorMesh);

  } else if (styleType === 2) {
    // 🧱 ARCHETYPE 2: RED BRICK COUNTRY COTTAGE
    const w = 2.4;
    const h = 1.9;
    const d = 2.3;

    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMesh = new THREE.Mesh(wallGeo, new THREE.MeshStandardMaterial({ color: 0x9b2c2c, roughness: 0.7 }));
    wallMesh.position.y = 0.2 + h / 2;
    wallMesh.castShadow = true;
    houseGroup.add(wallMesh);

    // Deep Gable Roof
    const roofH = 1.4;
    const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (w / 2 + 0.2), roofH, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 0.2 + h + roofH / 2;
    roofMesh.castShadow = true;
    houseGroup.add(roofMesh);

    // Arched Front Door
    const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.42, d / 2 + 0.04);
    houseGroup.add(doorMesh);

    // Dormer Roof Window
    const dormerGeo = new THREE.BoxGeometry(0.5, 0.45, 0.4);
    const dormerMesh = new THREE.Mesh(dormerGeo, trimMat);
    dormerMesh.position.set(0, 0.2 + h + 0.4, d / 2 - 0.2);
    houseGroup.add(dormerMesh);

    const dormerWin = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.08), windowMat);
    dormerWin.position.set(0, 0.2 + h + 0.4, d / 2 + 0.01);
    houseGroup.add(dormerWin);

  } else if (styleType === 3) {
    // 🏛️ ARCHETYPE 3: PASTEL COASTAL TOWNHOUSE WITH BALCONY
    const w = 2.2;
    const h = 2.4;
    const d = 2.2;

    const wallGeo = new THREE.BoxGeometry(w, h, d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + h / 2;
    wallMesh.castShadow = true;
    houseGroup.add(wallMesh);

    // Tiled Roof
    const roofH = 1.1;
    const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (w / 2 + 0.15), roofH, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 0.2 + h + roofH / 2;
    houseGroup.add(roofMesh);

    // Wrought Iron Balcony
    const balcGeo = new THREE.BoxGeometry(1.6, 0.12, 0.35);
    const balcMesh = new THREE.Mesh(balcGeo, new THREE.MeshStandardMaterial({ color: 0x1a202c }));
    balcMesh.position.set(0, 0.2 + 1.25, d / 2 + 0.15);
    houseGroup.add(balcMesh);

    // French Doors to Balcony
    const frenchDoorGeo = new THREE.BoxGeometry(0.8, 0.7, 0.06);
    const frenchDoorMesh = new THREE.Mesh(frenchDoorGeo, windowMat);
    frenchDoorMesh.position.set(0, 0.2 + 1.6, d / 2 + 0.04);
    houseGroup.add(frenchDoorMesh);

    // Ground Door
    const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.42, d / 2 + 0.04);
    houseGroup.add(doorMesh);

  } else {
    // 🏡 ARCHETYPE 4: CRAFTSMAN BUNGALOW WITH STONE BASE
    const w = 2.5;
    const h = 1.8;
    const d = 2.4;

    // Stone Base
    const baseGeo = new THREE.BoxGeometry(w + 0.1, 0.4, d + 0.1);
    const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.8 }));
    baseMesh.position.y = 0.4;
    houseGroup.add(baseMesh);

    // Timber Wall Body
    const wallGeo = new THREE.BoxGeometry(w, h - 0.4, d);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.6 + (h - 0.4) / 2;
    wallMesh.castShadow = true;
    houseGroup.add(wallMesh);

    // Overhanging Roof
    const roofH = 1.2;
    const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (w / 2 + 0.3), roofH, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 0.2 + h + roofH / 2;
    houseGroup.add(roofMesh);

    // Door & Porch Lantern
    const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.06);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.6, d / 2 + 0.04);
    houseGroup.add(doorMesh);
  }

  // Driveway connecting house to main street
  const driveGeo = new THREE.BoxGeometry(1.0, 0.02, 2.0);
  const driveMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.8 });
  const driveMesh = new THREE.Mesh(driveGeo, driveMat);
  driveMesh.position.set(0, 0.01, 1.8);
  houseGroup.add(driveMesh);

  return houseGroup;
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
  const vehiclesRef = useRef<{ mesh: THREE.Group; speed: number; angle: number; radius: number }[]>([]);
  const commitPulsesRef = useRef<{ mesh: THREE.Mesh; startPos: THREE.Vector3; targetPos: THREE.Vector3; progress: number; speed: number }[]>([]);

  const [activeCamPreset, setActiveCamPreset] = useState<'overview' | 'street' | 'drone'>('overview');

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
    scene.fog = new THREE.FogExp2(currentTheme.sky, 0.007);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(34, 28, 40);
    camera.lookAt(0, 3, 0);
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

    // 4. Sunny Warm Ambient & Sunlight
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff3bf, 1.8);
    sunLight.position.set(35, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const fillLight = new THREE.PointLight(currentTheme.light2, 2.5, 70);
    fillLight.position.set(-15, 25, -15);
    scene.add(fillLight);

    // 5. Neighborhood Grid Streets & Sidewalks
    if (cityConfig.showGrid) {
      const gridHelper = new THREE.GridHelper(90, 60, currentTheme.grid, 0x334155);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);
    }

    // Asphalt Highway Ring
    const roadInner = 12;
    const roadOuter = 16;
    const roadGeo = new THREE.RingGeometry(roadInner, roadOuter, 64);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = Math.PI / 2;
    roadMesh.position.y = 0.02;
    scene.add(roadMesh);

    // Road Yellow Center Dividers
    const laneGeo = new THREE.RingGeometry(13.9, 14.1, 64);
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xf6e05e, side: THREE.DoubleSide });
    const laneMesh = new THREE.Mesh(laneGeo, laneMat);
    laneMesh.rotation.x = Math.PI / 2;
    laneMesh.position.y = 0.03;
    scene.add(laneMesh);

    // Lush Green Lawn Ground Disc
    const groundGeo = new THREE.CylinderGeometry(42, 44, 0.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: currentTheme.grass,
      roughness: 0.6,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 6. Build Houses for Each Project (No Spire/Rocket Shapes!)
    houseMeshesRef.current = [];
    commitPulsesRef.current = [];

    const sortedProjects = [...projects].sort((a, b) => b.commitsCount - a.commitsCount);

    sortedProjects.forEach((proj, idx) => {
      // Ring Placement along Neighborhood Lots
      const ringIndex = Math.floor(idx / 8);
      const posInRing = idx % 8;

      let ringRadius = 6 + ringIndex * 5;
      if (ringRadius >= 11 && ringRadius <= 17) {
        ringRadius = 18 + (ringIndex - 2) * 5;
      }

      const angle = (posInRing / 8) * Math.PI * 2 + (ringIndex * 0.4);
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      // Construct Suburban House
      const houseGroup = createSuburbanHome(proj, idx);
      houseGroup.position.set(x, 0, z);
      houseGroup.rotation.y = -angle + Math.PI / 2; // Face towards the road/center!

      const houseColorHex = proj.buildingColor || '#38bdf8';

      // Floating Project Name Signboard
      const labelText = proj.title;
      const statusBadge = `🏡 SUBURBAN HOUSE • ${proj.commitsCount} COMMITS`;

      const texture = createProjectSignboardTexture(labelText, statusBadge, houseColorHex);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(0, 4.2, 0);
      labelSprite.scale.set(7.2, 1.8, 1);
      houseGroup.add(labelSprite);

      scene.add(houseGroup);

      // Trees & Street Lamps near the house lot
      const treeType = idx % 2 === 0 ? 'oak' : 'pine';
      const treeMesh = createNeighborhoodTree(treeType);
      treeMesh.position.set(x + 2.2, 0, z + 1.2);
      scene.add(treeMesh);

      if (idx % 3 === 0) {
        const lampMesh = createStreetLamp();
        lampMesh.position.set(x - 2.0, 0, z + 1.6);
        scene.add(lampMesh);
      }

      const housePos = new THREE.Vector3(x, 0, z);
      houseMeshesRef.current.push({
        id: proj.id,
        mesh: houseGroup,
        baseColor: houseColorHex,
        project: proj,
        position: housePos
      });

      // Animated Git Commit Energy Pulses ("প্রজেক্টের ভিতর কমেন্ট ঢুকছে")
      const pulseGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({ color: parseInt(houseColorHex.replace('#', ''), 16) || 0x38bdf8 });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      
      const startPos = new THREE.Vector3(Math.cos(angle) * 14, 0.3, Math.sin(angle) * 14); // Road position
      pulseMesh.position.copy(startPos);
      scene.add(pulseMesh);

      commitPulsesRef.current.push({
        mesh: pulseMesh,
        startPos,
        targetPos: housePos.clone().add(new THREE.Vector3(0, 0.3, 0)),
        progress: Math.random(),
        speed: 0.005 + Math.random() * 0.005
      });
    });

    // 7. Animated Cars on Neighborhood Street
    vehiclesRef.current = [];
    const carColors = ['38bdf8', 'ef4444', '10b981', 'f59e0b', 'a855f7', 'fdcb6e'];
    for (let c = 0; c < 8; c++) {
      const carColor = carColors[c % carColors.length];
      const carMesh = createSuburbanCar(carColor);
      const angle = (c / 8) * Math.PI * 2;
      const radius = 14;

      carMesh.position.set(Math.cos(angle) * radius, 0.05, Math.sin(angle) * radius);
      carMesh.rotation.y = -angle + Math.PI / 2;
      scene.add(carMesh);

      vehiclesRef.current.push({
        mesh: carMesh,
        speed: 0.006 + Math.random() * 0.004,
        angle,
        radius
      });
    }

    // 8. Raycasting for Mouse Interaction
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

    // 9. Orbit Dragging Logic & Animation Loop
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraAngle = 0;

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
      camera.position.y = Math.max(5, Math.min(50, camera.position.y - deltaY * 0.1));
      camera.lookAt(0, 3, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Real-time Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cityConfig.autoRotate && !isDragging) {
        cameraAngle += cityConfig.rotationSpeed;
        const currentRadius = 40;
        camera.position.x = Math.sin(cameraAngle) * currentRadius;
        camera.position.z = Math.cos(cameraAngle) * currentRadius;
        camera.lookAt(0, 3, 0);
      }

      // Animate Vehicles driving on neighborhood road
      vehiclesRef.current.forEach((v) => {
        v.angle += v.speed;
        v.mesh.position.x = Math.cos(v.angle) * v.radius;
        v.mesh.position.z = Math.sin(v.angle) * v.radius;
        v.mesh.rotation.y = -v.angle + Math.PI / 2;
      });

      // Animate Git Commit Energy Pulses flowing into house doors ("কমেন্ট ঢুকছে")
      commitPulsesRef.current.forEach((cp) => {
        cp.progress += cp.speed;
        if (cp.progress > 1) cp.progress = 0;
        cp.mesh.position.lerpVectors(cp.startPos, cp.targetPos, cp.progress);
      });

      // Gentle Scale Highlight on Hover
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
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [projects, cityConfig, hoveredProjectId]);

  const resetCamera = (preset: 'overview' | 'street' | 'drone') => {
    setActiveCamPreset(preset);
    playSound('click');
    if (!cameraRef.current) return;
    if (preset === 'overview') {
      cameraRef.current.position.set(34, 28, 40);
    } else if (preset === 'street') {
      cameraRef.current.position.set(16, 6, 20);
    } else if (preset === 'drone') {
      cameraRef.current.position.set(0, 52, 1);
    }
    cameraRef.current.lookAt(0, 3, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-sky-500/20 glass-panel shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating 3D HUD Camera Controls */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-auto">
        <button
          onClick={() => resetCamera('overview')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'overview'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🌐</span> Neighborhood Overview
        </button>
        <button
          onClick={() => resetCamera('street')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'street'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🚗</span> Street Level
        </button>
        <button
          onClick={() => resetCamera('drone')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'drone'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🏠</span> Drone View
        </button>
      </div>

      {/* 3D Neighborhood Legend & Stats Badge */}
      <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl glass-panel border border-slate-700/60 text-xs font-mono-code pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          SUBURBAN 3D PROJECT NEIGHBORHOOD
        </div>
        <p className="text-slate-400 text-[10px]">
          • Real Residential Houses, Streets, Trees & Live Commit Traffic Flow
        </p>
        <p className="text-slate-400 text-[10px]">
          • Inspect: Click any Project House
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-2 text-slate-300 text-[11px]">
          <span>Houses: <strong className="text-sky-300">{projects.length}</strong></span>
          <span>Theme: <strong className="text-purple-400 capitalize">{cityConfig.theme}</strong></span>
        </div>
      </div>
    </div>
  );
};
