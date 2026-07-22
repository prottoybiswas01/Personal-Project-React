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

// Canvas Texture Generator for Floating 3D Building Text Banners
function createTextLabelTexture(text: string, status: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Glassmorphic / Cute Label Background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 20);
    ctx.fill();

    // Glow Border
    ctx.strokeStyle = colorHex || '#38bdf8';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Title Text
    ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(text.length > 24 ? text.substring(0, 22) + '...' : text, 256, 52);

    // Status / Subtitle Badge
    ctx.font = 'bold 18px "Fira Code", monospace';
    ctx.fillStyle = colorHex || '#38bdf8';
    ctx.fillText(status, 256, 92);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 🚗 Cute Cartoon Vehicle Generator
function createCartoonVehicle(colorHex: string): THREE.Group {
  const vehicleGroup = new THREE.Group();

  // Car Body (Rounded Box)
  const bodyGeo = new THREE.BoxGeometry(0.85, 0.45, 1.35);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: parseInt(colorHex, 16),
    roughness: 0.2,
    metalness: 0.1,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.35;
  bodyMesh.castShadow = true;
  vehicleGroup.add(bodyMesh);

  // Cute Bubble Cabin Roof
  const cabinGeo = new THREE.SphereGeometry(0.42, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    transparent: true,
    opacity: 0.85,
  });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.position.set(0, 0.55, -0.05);
  cabinMesh.scale.set(1.1, 0.85, 1.2);
  vehicleGroup.add(cabinMesh);

  // Wheels (4 cute black tires)
  const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  wheelGeo.rotateZ(Math.PI / 2);

  [
    [-0.45, 0.18, 0.4],
    [0.45, 0.18, 0.4],
    [-0.45, 0.18, -0.4],
    [0.45, 0.18, -0.4],
  ].forEach(([wx, wy, wz]) => {
    const wMesh = new THREE.Mesh(wheelGeo, wheelMat);
    wMesh.position.set(wx, wy, wz);
    vehicleGroup.add(wMesh);
  });

  // Cute Headlights
  const lightGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
  const h1 = new THREE.Mesh(lightGeo, lightMat);
  h1.position.set(-0.28, 0.35, 0.68);
  const h2 = new THREE.Mesh(lightGeo, lightMat);
  h2.position.set(0.28, 0.35, 0.68);
  vehicleGroup.add(h1);
  vehicleGroup.add(h2);

  return vehicleGroup;
}

// 🌳 Cute 3D Cartoon Tree Generator
function createCartoonTree(): THREE.Group {
  const treeGroup = new THREE.Group();

  // Wooden Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.8, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x795548, roughness: 0.8 });
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.position.y = 0.4;
  trunkMesh.castShadow = true;
  treeGroup.add(trunkMesh);

  // Foliage Spheres
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2ed573, roughness: 0.4 });
  const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), foliageMat);
  f1.position.y = 0.95;
  f1.castShadow = true;
  treeGroup.add(f1);

  const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 8), foliageMat);
  f2.position.y = 1.35;
  f2.castShadow = true;
  treeGroup.add(f2);

  return treeGroup;
}

// 🏡 CUTE 3D CARTOON HOUSE & BUILDING BUILDER
function createCartoonBuilding(proj: Project, idx: number): THREE.Group {
  const buildingGroup = new THREE.Group();

  const floors = Math.max(3, Math.min(20, Math.floor(proj.commitsCount / 2)));
  const floorHeight = 0.55;
  const houseHeight = Math.max(1.8, floors * floorHeight);

  // Vibrant Cartoon Color Palettes
  const cartoonPalettes = [
    { wall: 0xff7675, roof: 0xd63031, trim: 0xfff5f5, door: 0x6c5ce7, window: 0xfff3bf }, // Coral Pink & Ruby Roof
    { wall: 0x74b9ff, roof: 0x0984e3, trim: 0xe0f2fe, door: 0xfdcb6e, window: 0xfffaed }, // Sky Blue & Royal Blue Roof
    { wall: 0x55efc4, roof: 0x00b894, trim: 0xe6fffa, door: 0xe17055, window: 0xfff3bf }, // Mint Green & Emerald Roof
    { wall: 0xffeaa7, roof: 0xe17055, trim: 0xfffbeb, door: 0x6c5ce7, window: 0xfff3bf }, // Sun Yellow & Terracotta Roof
    { wall: 0xa29bfe, roof: 0x6c5ce7, trim: 0xf3e8ff, door: 0x00b894, window: 0xfffaed }, // Lavender & Purple Roof
    { wall: 0xffb8b8, roof: 0xc0392b, trim: 0xfff0f0, door: 0x27ae60, window: 0xfff3bf }, // Peach Pink & Cherry Red Roof
  ];

  const palette = cartoonPalettes[idx % cartoonPalettes.length];
  const customWallColor = proj.buildingColor ? parseInt(proj.buildingColor.replace('#', '0x')) : palette.wall;

  const wallMat = new THREE.MeshStandardMaterial({
    color: customWallColor,
    roughness: 0.3,
    metalness: 0.05,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: palette.roof,
    roughness: 0.4,
    metalness: 0.05,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: palette.trim,
    roughness: 0.3,
    metalness: 0.1,
  });

  const doorMat = new THREE.MeshStandardMaterial({
    color: palette.door,
    roughness: 0.4,
    metalness: 0.1,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: palette.window,
    emissive: 0xffe066,
    emissiveIntensity: 0.85,
    roughness: 0.1,
  });

  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
  });

  const styleType = idx % 5;

  if (styleType === 0) {
    // 🏠 STYLE 0: CUTE COTTAGE WITH SLOPED PYRAMID ROOF & CHIMNEY
    const baseW = 2.4;
    const baseD = 2.4;

    // Main House Box Wall
    const wallGeo = new THREE.BoxGeometry(baseW, houseHeight, baseD);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + houseHeight / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    buildingGroup.add(wallMesh);

    // Cute Roof Trim Overhang
    const trimGeo = new THREE.BoxGeometry(baseW + 0.3, 0.15, baseD + 0.3);
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.2 + houseHeight;
    buildingGroup.add(trimMesh);

    // Sloped Pyramid Roof
    const roofH = 1.4;
    const roofGeo = new THREE.CylinderGeometry(0, Math.sqrt(2) * (baseW / 2 + 0.2), roofH, 4);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.rotation.y = Math.PI / 4;
    roofMesh.position.y = 0.2 + houseHeight + 0.08 + roofH / 2;
    roofMesh.castShadow = true;
    buildingGroup.add(roofMesh);

    // Chimney Box on Roof
    const chimneyGeo = new THREE.BoxGeometry(0.35, 0.9, 0.35);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.6 });
    const chimneyMesh = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimneyMesh.position.set(0.6, 0.2 + houseHeight + roofH * 0.5, 0.4);
    buildingGroup.add(chimneyMesh);

    // Chimney Smoke Puffs (3 cute spheres)
    for (let s = 0; s < 3; s++) {
      const smokeGeo = new THREE.SphereGeometry(0.12 + s * 0.06, 8, 8);
      const smokeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 - s * 0.15 });
      const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
      smokeMesh.position.set(0.6 + (s % 2 === 0 ? 0.05 : -0.05), 0.2 + houseHeight + roofH * 0.5 + 0.5 + s * 0.25, 0.4);
      buildingGroup.add(smokeMesh);
    }

    // Front Door & Window
    const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.08);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.45, baseD / 2 + 0.04);
    buildingGroup.add(doorMesh);

    // Golden Knob
    const knobGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0xfdcb6e, metalness: 0.9 });
    const knobMesh = new THREE.Mesh(knobGeo, knobMat);
    knobMesh.position.set(0.18, 0.2 + 0.45, baseD / 2 + 0.09);
    buildingGroup.add(knobMesh);

    // Windows on multiple floors
    const windowRows = Math.max(1, Math.floor(houseHeight / 0.8));
    for (let r = 0; r < windowRows; r++) {
      const winY = 0.2 + 0.7 + r * 0.75;
      if (winY < 0.2 + houseHeight - 0.3) {
        // Front windows
        [-0.65, 0.65].forEach((wx) => {
          const frameGeo = new THREE.BoxGeometry(0.42, 0.48, 0.06);
          const frameMesh = new THREE.Mesh(frameGeo, windowFrameMat);
          frameMesh.position.set(wx, winY, baseD / 2 + 0.03);
          buildingGroup.add(frameMesh);

          const winGeo = new THREE.BoxGeometry(0.34, 0.40, 0.08);
          const winMesh = new THREE.Mesh(winGeo, windowMat);
          winMesh.position.set(wx, winY, baseD / 2 + 0.04);
          buildingGroup.add(winMesh);
        });
      }
    }

  } else if (styleType === 1) {
    // 🗼 STYLE 1: CUTE CARTOON CLOCKTOWER / WINDMILL TOWER WITH CONICAL ROOF
    const radius = 1.3;
    
    // Bottom Module
    const botH = houseHeight * 0.6;
    const botGeo = new THREE.CylinderGeometry(radius, radius + 0.2, botH, 16);
    const botMesh = new THREE.Mesh(botGeo, wallMat);
    botMesh.position.y = 0.2 + botH / 2;
    botMesh.castShadow = true;
    buildingGroup.add(botMesh);

    // Mid Wooden Trim Ring
    const trimRingGeo = new THREE.CylinderGeometry(radius + 0.25, radius + 0.25, 0.18, 16);
    const trimRingMesh = new THREE.Mesh(trimRingGeo, trimMat);
    trimRingMesh.position.y = 0.2 + botH;
    buildingGroup.add(trimRingMesh);

    // Upper Module
    const topH = houseHeight * 0.4;
    const topGeo = new THREE.CylinderGeometry(radius - 0.2, radius, topH, 16);
    const topMesh = new THREE.Mesh(topGeo, wallMat);
    topMesh.position.y = 0.2 + botH + topH / 2;
    buildingGroup.add(topMesh);

    // Conical Roof
    const coneH = 1.5;
    const coneGeo = new THREE.CylinderGeometry(0, radius + 0.2, coneH, 16);
    const coneMesh = new THREE.Mesh(coneGeo, roofMat);
    coneMesh.position.y = 0.2 + houseHeight + coneH / 2;
    coneMesh.castShadow = true;
    buildingGroup.add(coneMesh);

    // Weathercock / Flag Pole Apex
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xfdcb6e, metalness: 0.8 });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.y = 0.2 + houseHeight + coneH + 0.4;
    buildingGroup.add(poleMesh);

    // Cute Flag
    const flagGeo = new THREE.BoxGeometry(0.35, 0.2, 0.02);
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    const flagMesh = new THREE.Mesh(flagGeo, flagMat);
    flagMesh.position.set(0.18, 0.2 + houseHeight + coneH + 0.6, 0);
    buildingGroup.add(flagMesh);

    // Clock Face on Upper Module
    const clockGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16);
    const clockMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
    const clockMesh = new THREE.Mesh(clockGeo, clockMat);
    clockMesh.rotation.x = Math.PI / 2;
    clockMesh.position.set(0, 0.2 + botH + topH / 2, radius - 0.15);
    buildingGroup.add(clockMesh);

  } else if (styleType === 2) {
    // 🏪 STYLE 2: CUTE CARTOON BAKERY / CAFE WITH STRIPED AWNING
    const baseW = 2.5;
    const baseD = 2.2;

    const wallGeo = new THREE.BoxGeometry(baseW, houseHeight, baseD);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + houseHeight / 2;
    wallMesh.castShadow = true;
    buildingGroup.add(wallMesh);

    // Striped Awning Over Entrance
    const awningW = 2.0;
    const awningGeo = new THREE.BoxGeometry(awningW, 0.12, 0.6);
    const awningMat = new THREE.MeshStandardMaterial({ color: palette.roof, roughness: 0.3 });
    const awningMesh = new THREE.Mesh(awningGeo, awningMat);
    awningMesh.rotation.x = 0.2;
    awningMesh.position.set(0, 0.2 + 1.1, baseD / 2 + 0.25);
    buildingGroup.add(awningMesh);

    // Awning White Stripe Detail
    for (let s = -3; s <= 3; s += 2) {
      const stripeGeo = new THREE.BoxGeometry(0.25, 0.14, 0.62);
      const stripeMesh = new THREE.Mesh(stripeGeo, trimMat);
      stripeMesh.rotation.x = 0.2;
      stripeMesh.position.set(s * 0.26, 0.2 + 1.1, baseD / 2 + 0.25);
      buildingGroup.add(stripeMesh);
    }

    // Flat Terrace Roof Edge Balustrade
    const railGeo = new THREE.BoxGeometry(baseW + 0.1, 0.25, baseD + 0.1);
    const railMesh = new THREE.Mesh(railGeo, trimMat);
    railMesh.position.y = 0.2 + houseHeight + 0.12;
    buildingGroup.add(railMesh);

    // Rooftop Water Tank / Bush
    const tankGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.7, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x795548 });
    const tankMesh = new THREE.Mesh(tankGeo, tankMat);
    tankMesh.position.set(-0.6, 0.2 + houseHeight + 0.5, -0.4);
    buildingGroup.add(tankMesh);

    // Front Shop Door
    const doorGeo = new THREE.BoxGeometry(0.6, 0.9, 0.08);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.45, baseD / 2 + 0.04);
    buildingGroup.add(doorMesh);

  } else if (styleType === 3) {
    // 🏛️ STYLE 3: CUTE DUTCH STEP-GABLE TOWN HOUSE
    const baseW = 2.2;
    const baseD = 2.4;

    // Wall Box
    const wallGeo = new THREE.BoxGeometry(baseW, houseHeight, baseD);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + houseHeight / 2;
    wallMesh.castShadow = true;
    buildingGroup.add(wallMesh);

    // Stepped Facade Top Gable (Dutch Gable Steps)
    for (let st = 0; st < 3; st++) {
      const stepW = baseW - st * 0.5;
      const stepH = 0.35;
      const stepGeo = new THREE.BoxGeometry(stepW, stepH, baseD + 0.05);
      const stepMesh = new THREE.Mesh(stepGeo, trimMat);
      stepMesh.position.y = 0.2 + houseHeight + st * stepH + stepH / 2;
      buildingGroup.add(stepMesh);
    }

    // Cozy Round Attic Window
    const roundWinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.08, 16);
    const roundWinMesh = new THREE.Mesh(roundWinGeo, windowMat);
    roundWinMesh.rotation.x = Math.PI / 2;
    roundWinMesh.position.set(0, 0.2 + houseHeight + 0.4, baseD / 2 + 0.04);
    buildingGroup.add(roundWinMesh);

    // Main Arched Door
    const doorGeo = new THREE.BoxGeometry(0.55, 0.85, 0.08);
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.2 + 0.45, baseD / 2 + 0.04);
    buildingGroup.add(doorMesh);

  } else {
    // 🏰 STYLE 4: CUTE CARTOON APARTMENT TOWER WITH DOMED CAPS & BALCONIES
    const baseW = 2.3;
    const baseD = 2.3;

    const wallGeo = new THREE.BoxGeometry(baseW, houseHeight, baseD);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 0.2 + houseHeight / 2;
    wallMesh.castShadow = true;
    buildingGroup.add(wallMesh);

    // Cute Dome Roof Cap
    const domeRadius = 1.1;
    const domeGeo = new THREE.SphereGeometry(domeRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMesh = new THREE.Mesh(domeGeo, roofMat);
    domeMesh.position.y = 0.2 + houseHeight;
    domeMesh.castShadow = true;
    buildingGroup.add(domeMesh);

    // Dome Star/Spire
    const starGeo = new THREE.OctahedronGeometry(0.22);
    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffb700, emissiveIntensity: 0.8 });
    const starMesh = new THREE.Mesh(starGeo, starMat);
    starMesh.position.y = 0.2 + houseHeight + domeRadius + 0.2;
    buildingGroup.add(starMesh);

    // Front Windows & Balcony Trims
    const floorsCount = Math.max(2, Math.floor(houseHeight / 0.7));
    for (let f = 0; f < floorsCount; f++) {
      const winY = 0.2 + 0.5 + f * 0.7;
      if (winY < 0.2 + houseHeight - 0.2) {
        // Balcony Trim
        const balcGeo = new THREE.BoxGeometry(1.4, 0.12, 0.25);
        const balcMesh = new THREE.Mesh(balcGeo, trimMat);
        balcMesh.position.set(0, winY - 0.25, baseD / 2 + 0.1);
        buildingGroup.add(balcMesh);

        // Window
        const winGeo = new THREE.BoxGeometry(0.8, 0.42, 0.08);
        const winMesh = new THREE.Mesh(winGeo, windowMat);
        winMesh.position.set(0, winY, baseD / 2 + 0.04);
        buildingGroup.add(winMesh);
      }
    }
  }

  return buildingGroup;
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
  const buildingMeshesRef = useRef<{ id: string; mesh: THREE.Group; baseColor: string; project: Project }[]>([]);
  const vehiclesRef = useRef<{ mesh: THREE.Group; speed: number; angle: number; radius: number }[]>([]);
  const particlesRef = useRef<THREE.Points | null>(null);

  const [activeCamPreset, setActiveCamPreset] = useState<'overview' | 'street' | 'drone'>('overview');

  // Theme color maps
  const themeColors = {
    cyberpunk: { sky: 0x0f172a, grid: 0x38bdf8, grass: 0x10b981, light1: 0xfffaed, light2: 0x38bdf8 },
    matrix: { sky: 0x05140b, grid: 0x10b981, grass: 0x059669, light1: 0xfffaed, light2: 0x34d399 },
    sunset: { sky: 0x190b14, grid: 0xf59e0b, grass: 0xd97706, light1: 0xffedd5, light2: 0xec4899 },
    diamond: { sky: 0x0f172a, grid: 0x64748b, grass: 0x2563eb, light1: 0xfffaed, light2: 0x94a3b8 },
    'neon-blue': { sky: 0x020617, grid: 0x06b6d4, grass: 0x0284c7, light1: 0xfffaed, light2: 0x3b82f6 },
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup
    const currentTheme = themeColors[cityConfig.theme] || themeColors.cyberpunk;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(currentTheme.sky);
    scene.fog = new THREE.FogExp2(currentTheme.sky, 0.007);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(34, 28, 40);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Warm Sunny Ambient & Directional Sun Lights
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3bf, 1.8);
    dirLight.position.set(35, 45, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(currentTheme.light2, 2.5, 70);
    pointLight.position.set(-15, 25, -15);
    scene.add(pointLight);

    // 5. Cartoon Ground & Road Layout
    if (cityConfig.showGrid) {
      const gridHelper = new THREE.GridHelper(90, 60, currentTheme.grid, 0x334155);
      gridHelper.position.y = 0.01;
      scene.add(gridHelper);
    }

    // Circular Highway Ring for Cute Cars
    const roadInner = 12;
    const roadOuter = 16;
    const roadGeo = new THREE.RingGeometry(roadInner, roadOuter, 64);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = Math.PI / 2;
    roadMesh.position.y = 0.02;
    scene.add(roadMesh);

    // Road Lane Divider Ring
    const laneGeo = new THREE.RingGeometry(13.9, 14.1, 64);
    const laneMat = new THREE.MeshBasicMaterial({ color: 0xfdcb6e, side: THREE.DoubleSide });
    const laneMesh = new THREE.Mesh(laneGeo, laneMat);
    laneMesh.rotation.x = Math.PI / 2;
    laneMesh.position.y = 0.03;
    scene.add(laneMesh);

    // Lush Cartoon Grass Ground Disc
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

    // 6. Particle Atmosphere
    if (cityConfig.showParticles) {
      const particleCount = 500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 120;
        positions[i + 1] = Math.random() * 60;
        positions[i + 2] = (Math.random() - 0.5) * 120;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: currentTheme.grid,
        size: 0.35,
        transparent: true,
        opacity: 0.6,
      });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;
    }

    // 7. Render Cute 3D Cartoon Houses & Neighborhood Buildings
    buildingMeshesRef.current = [];
    const sortedProjects = [...projects].sort((a, b) => b.commitsCount - a.commitsCount);

    sortedProjects.forEach((proj, idx) => {
      // Concentric layout rings
      const ringIndex = Math.floor(idx / 8);
      const posInRing = idx % 8;
      
      let ringRadius = 6 + ringIndex * 5;
      if (ringRadius >= 11 && ringRadius <= 17) {
        ringRadius = 18 + (ringIndex - 2) * 5;
      }

      const angle = (posInRing / 8) * Math.PI * 2 + (ringIndex * 0.4);
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      // Create Cute Cartoon House/Building
      const buildingGroup = createCartoonBuilding(proj, idx);
      buildingGroup.position.set(x, 0, z);

      const floors = Math.max(3, Math.min(20, Math.floor(proj.commitsCount / 2)));
      const houseHeight = Math.max(1.8, floors * 0.55);
      const buildingColorHex = proj.buildingColor || '#38bdf8';

      // Floating 3D Building Project Name Banner Above Building
      const labelText = proj.title;
      const statusBadge = `🏠 CARTOON HOUSE • ${proj.commitsCount} COMMITS`;

      const texture = createTextLabelTexture(labelText, statusBadge, buildingColorHex);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(0, 0.4 + houseHeight + 2.4, 0);
      labelSprite.scale.set(7.2, 1.8, 1);
      buildingGroup.add(labelSprite);

      scene.add(buildingGroup);

      // Add cute cartoon trees near the house!
      if (idx % 2 === 0) {
        const treeMesh = createCartoonTree();
        treeMesh.position.set(x + 2.0, 0, z + 1.2);
        scene.add(treeMesh);
      }

      buildingMeshesRef.current.push({
        id: proj.id,
        mesh: buildingGroup,
        baseColor: buildingColorHex,
        project: proj
      });
    });

    // 8. Animated 3D Cute Cartoon Vehicles driving on highway
    vehiclesRef.current = [];
    const carColors = ['38bdf8', 'ef4444', '10b981', 'f59e0b', 'a855f7', 'fdcb6e'];
    for (let c = 0; c < 8; c++) {
      const carColor = carColors[c % carColors.length];
      const carMesh = createCartoonVehicle(carColor);
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

    // 9. Raycasting for Interaction (Click & Hover)
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
          const target = buildingMeshesRef.current.find(b => b.mesh === currentObj);
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
          const target = buildingMeshesRef.current.find(b => b.mesh === currentObj);
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

    // 10. Orbit Dragging Logic & Animation Loop
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

    // 11. Real-time Animation Loop (Vehicles, Starfield, Hover Glow)
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cityConfig.autoRotate && !isDragging) {
        cameraAngle += cityConfig.rotationSpeed;
        const currentRadius = 40;
        camera.position.x = Math.sin(cameraAngle) * currentRadius;
        camera.position.z = Math.cos(cameraAngle) * currentRadius;
        camera.lookAt(0, 4, 0);
      }

      // Animate Vehicles driving on highway ring
      vehiclesRef.current.forEach((v) => {
        v.angle += v.speed;
        v.mesh.position.x = Math.cos(v.angle) * v.radius;
        v.mesh.position.z = Math.sin(v.angle) * v.radius;
        v.mesh.rotation.y = -v.angle + Math.PI / 2;
      });

      // Rotate particle cloud gently
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
      }

      // Gentle floating scale for building hover highlights
      buildingMeshesRef.current.forEach((item) => {
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
    cameraRef.current.lookAt(0, 4, 0);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-2xl border border-sky-500/20 glass-panel shadow-2xl">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating 3D City HUD Camera Controls */}
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

      {/* 3D City Legend & Stats Badge */}
      <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl glass-panel border border-slate-700/60 text-xs font-mono-code pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          3D CARTOON TOWN & NEIGHBORHOOD
        </div>
        <p className="text-slate-400 text-[10px]">
          • Cute Cartoon Houses: Cottages, Clocktowers, Bakeries & Apartments
        </p>
        <p className="text-slate-400 text-[10px]">
          • Inspect: Click any 3D Cartoon House
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-2 text-slate-300 text-[11px]">
          <span>Houses: <strong className="text-sky-300">{projects.length}</strong></span>
          <span>Theme: <strong className="text-purple-400 capitalize">{cityConfig.theme}</strong></span>
        </div>
      </div>
    </div>
  );
};
