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
    // Glassmorphic Label Background
    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 108, 16);
    ctx.fill();

    // Glow Border
    ctx.strokeStyle = colorHex || '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Title Text
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
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

// 3D Moving Vehicle Generator for Living City Highway
function createVehicle(colorHex: string): THREE.Group {
  const vehicleGroup = new THREE.Group();

  // Car Body
  const bodyGeo = new THREE.BoxGeometry(0.8, 0.4, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: parseInt(colorHex, 16),
    metalness: 0.9,
    roughness: 0.1,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0.3;
  vehicleGroup.add(bodyMesh);

  // Roof / Cabin
  const cabinGeo = new THREE.BoxGeometry(0.65, 0.3, 0.7);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.1,
  });
  const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
  cabinMesh.position.set(0, 0.6, -0.1);
  vehicleGroup.add(cabinMesh);

  // Headlights
  const lightGeo = new THREE.BoxGeometry(0.2, 0.1, 0.05);
  const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const headlight1 = new THREE.Mesh(lightGeo, lightMat);
  headlight1.position.set(-0.25, 0.3, 0.7);
  const headlight2 = new THREE.Mesh(lightGeo, lightMat);
  headlight2.position.set(0.25, 0.3, 0.7);
  vehicleGroup.add(headlight1);
  vehicleGroup.add(headlight2);

  // Taillights
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const taillight1 = new THREE.Mesh(lightGeo, tailMat);
  taillight1.position.set(-0.25, 0.3, -0.7);
  const taillight2 = new THREE.Mesh(lightGeo, tailMat);
  taillight2.position.set(0.25, 0.3, -0.7);
  vehicleGroup.add(taillight1);
  vehicleGroup.add(taillight2);

  return vehicleGroup;
}

// 🏙️ ICONIC 3D REAL-WORLD LANDMARK SKYSCRAPER BUILDER
// (Burj Khalifa Spire, Google Tech HQ, Cyber Spire, Stepped Art Deco, Crystal Prism)
function createIconicSkyscraper(proj: Project, idx: number): THREE.Group {
  const buildingGroup = new THREE.Group();

  const floors = Math.max(4, Math.min(28, Math.floor(proj.commitsCount / 2)));
  const floorHeight = 0.65;
  const totalHeight = floors * floorHeight;

  // Curated Architectural Color Palettes
  const palettes = [
    { glass: 0x38bdf8, frame: 0x0f172a, emissive: 0x0284c7 }, // Sapphire Cyan
    { glass: 0xa855f7, frame: 0x111827, emissive: 0x7e22ce }, // Royal Neon Purple
    { glass: 0x10b981, frame: 0x064e3b, emissive: 0x047857 }, // Emerald Crystal
    { glass: 0xf59e0b, frame: 0x1e293b, emissive: 0xd97706 }, // Gold Champagne
    { glass: 0xec4899, frame: 0x1f2937, emissive: 0xbe185d }, // Ruby Rose Glass
    { glass: 0x06b6d4, frame: 0x0f172a, emissive: 0x0e7490 }, // Electric Cyan
  ];
  const palette = palettes[idx % palettes.length];
  const customColor = proj.buildingColor ? parseInt(proj.buildingColor.replace('#', '0x')) : palette.glass;

  // 5 Distinct Iconic Landmark Styles
  const styleType = idx % 5;

  if (styleType === 0) {
    // 🗼 LANDMARK 1: BURJ KHALIFA STYLE MEGA-SPIRE (Tapered 4-Tier Cylindrical Spire)
    const tier1H = totalHeight * 0.4;
    const tier2H = totalHeight * 0.3;
    const tier3H = totalHeight * 0.2;
    const tier4H = totalHeight * 0.1;

    // Tier 1 (Base Cylinder)
    const t1Geo = new THREE.CylinderGeometry(2.2, 2.6, tier1H, 16);
    const t1Mat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: customColor, emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.9 });
    const t1Mesh = new THREE.Mesh(t1Geo, t1Mat);
    t1Mesh.position.y = 0.2 + tier1H / 2;
    buildingGroup.add(t1Mesh);

    // Tier 2 (Middle Spire)
    const t2Geo = new THREE.CylinderGeometry(1.6, 2.0, tier2H, 16);
    const t2Mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: customColor, emissiveIntensity: 0.45, roughness: 0.1, metalness: 0.9 });
    const t2Mesh = new THREE.Mesh(t2Geo, t2Mat);
    t2Mesh.position.y = 0.2 + tier1H + tier2H / 2;
    buildingGroup.add(t2Mesh);

    // Tier 3 (Upper Tower)
    const t3Geo = new THREE.CylinderGeometry(1.0, 1.4, tier3H, 16);
    const t3Mat = new THREE.MeshStandardMaterial({ color: customColor, emissive: customColor, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.95 });
    const t3Mesh = new THREE.Mesh(t3Geo, t3Mat);
    t3Mesh.position.y = 0.2 + tier1H + tier2H + tier3H / 2;
    buildingGroup.add(t3Mesh);

    // Tier 4 (Rooftop Needle Spire)
    const t4Geo = new THREE.CylinderGeometry(0.1, 0.8, tier4H + 2.5, 12);
    const t4Mat = new THREE.MeshBasicMaterial({ color: customColor });
    const t4Mesh = new THREE.Mesh(t4Geo, t4Mat);
    t4Mesh.position.y = 0.2 + tier1H + tier2H + tier3H + (tier4H + 2.5) / 2;
    buildingGroup.add(t4Mesh);

    // Searchlight Beacon on Spire Apex
    const beaconGeo = new THREE.SphereGeometry(0.25, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.y = 0.2 + totalHeight + 3.0;
    buildingGroup.add(beaconMesh);

  } else if (styleType === 1) {
    // 🏢 LANDMARK 2: GOOGLE TECH HQ STYLE MODERN CANTILEVERED GLASS CAMPUS
    const blockCount = Math.min(5, Math.floor(floors / 4) + 2);
    const blockH = totalHeight / blockCount;

    for (let b = 0; b < blockCount; b++) {
      const offsetX = (b % 2 === 0 ? 0.3 : -0.3);
      const offsetZ = (b % 3 === 0 ? 0.2 : -0.2);
      const blockGeo = new THREE.BoxGeometry(2.4, blockH * 0.92, 2.4);
      
      const blockMat = new THREE.MeshStandardMaterial({
        color: (b % 2 === 0 ? customColor : 0x0f172a),
        emissive: customColor,
        emissiveIntensity: (b % 2 === 0 ? 0.6 : 0.25),
        roughness: 0.1,
        metalness: 0.95
      });
      const blockMesh = new THREE.Mesh(blockGeo, blockMat);
      blockMesh.position.set(offsetX, 0.2 + b * blockH + blockH / 2, offsetZ);
      blockMesh.castShadow = true;
      buildingGroup.add(blockMesh);

      // Connecting Glass Bridges
      if (b > 0) {
        const bridgeGeo = new THREE.BoxGeometry(0.8, 0.3, 0.8);
        const bridgeMat = new THREE.MeshBasicMaterial({ color: customColor });
        const bridgeMesh = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridgeMesh.position.set(0, 0.2 + b * blockH, 0);
        buildingGroup.add(bridgeMesh);
      }
    }

  } else if (styleType === 2) {
    // 🌐 LANDMARK 3: CYBER SPIRE HIGH-TECH LATTICE SKYSCRAPER
    const bodyGeo = new THREE.BoxGeometry(2.2, totalHeight, 2.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      emissive: customColor,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.2 + totalHeight / 2;
    buildingGroup.add(bodyMesh);

    // Outer Diagonal Steel Lattice Cage
    const cageGeo = new THREE.BoxGeometry(2.38, totalHeight, 2.38);
    const cageMat = new THREE.MeshStandardMaterial({
      color: customColor,
      wireframe: true
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    cageMesh.position.y = 0.2 + totalHeight / 2;
    buildingGroup.add(cageMesh);

    // Rooftop Helipad
    const helipadGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.15, 24);
    const helipadMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const helipadMesh = new THREE.Mesh(helipadGeo, helipadMat);
    helipadMesh.position.y = 0.2 + totalHeight + 0.1;
    buildingGroup.add(helipadMesh);

    // Helipad Landing Light Ring
    const ringGeo = new THREE.TorusGeometry(1.2, 0.05, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: customColor });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.2 + totalHeight + 0.2;
    buildingGroup.add(ringMesh);

  } else if (styleType === 3) {
    // 🏛️ LANDMARK 4: STEPPED ART-DECO GLASS & COPPER TOWER
    for (let f = 0; f < floors; f++) {
      const width = 2.5 - f * 0.04;
      const depth = 2.5 - f * 0.04;
      const floorGeo = new THREE.BoxGeometry(width, floorHeight * 0.9, depth);
      
      const isTop = f === floors - 1;
      const floorMat = new THREE.MeshStandardMaterial({
        color: isTop ? customColor : (f % 2 === 0 ? 0x1e293b : 0x0f172a),
        emissive: isTop ? customColor : (f % 2 === 0 ? customColor : 0x000000),
        emissiveIntensity: isTop ? 0.8 : 0.35,
        roughness: 0.2,
        metalness: 0.8,
      });

      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.position.y = 0.4 + f * floorHeight + floorHeight / 2;
      buildingGroup.add(floorMesh);
    }
  } else {
    // 💎 LANDMARK 5: CRYSTAL DIAMOND FACET TOWER
    const prismGeo = new THREE.CylinderGeometry(0.7, 1.7, totalHeight, 8);
    const prismMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      emissive: customColor,
      emissiveIntensity: 0.65,
      metalness: 0.95,
      roughness: 0.05,
      flatShading: true
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    prismMesh.position.y = 0.2 + totalHeight / 2;
    buildingGroup.add(prismMesh);
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
    cyberpunk: { sky: 0x090d16, grid: 0x38bdf8, light1: 0x38bdf8, light2: 0xa855f7 },
    matrix: { sky: 0x05140b, grid: 0x10b981, light1: 0x10b981, light2: 0x34d399 },
    sunset: { sky: 0x190b14, grid: 0xf59e0b, light1: 0xf59e0b, light2: 0xec4899 },
    diamond: { sky: 0x0f172a, grid: 0x64748b, light1: 0x38bdf8, light2: 0xf8fafc },
    'neon-blue': { sky: 0x020617, grid: 0x06b6d4, light1: 0x06b6d4, light2: 0x3b82f6 },
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
    scene.fog = new THREE.FogExp2(currentTheme.sky, 0.009);
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

    // 4. Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(currentTheme.light1, 1.6);
    dirLight.position.set(35, 45, 25);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(currentTheme.light2, 3, 70);
    pointLight.position.set(-15, 25, -15);
    scene.add(pointLight);

    // 5. City Roads & Ground Layout
    if (cityConfig.showGrid) {
      const gridHelper = new THREE.GridHelper(90, 60, currentTheme.grid, 0x1e293b);
      gridHelper.position.y = 0;
      scene.add(gridHelper);
    }

    // Circular City Highway Ring
    const roadInner = 12;
    const roadOuter = 16;
    const roadGeo = new THREE.RingGeometry(roadInner, roadOuter, 64);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = Math.PI / 2;
    roadMesh.position.y = 0.02;
    scene.add(roadMesh);

    // Road Lane Divider Ring (Glowing Yellow/Cyan)
    const laneGeo = new THREE.RingGeometry(13.9, 14.1, 64);
    const laneMat = new THREE.MeshBasicMaterial({ color: currentTheme.grid, side: THREE.DoubleSide });
    const laneMesh = new THREE.Mesh(laneGeo, laneMat);
    laneMesh.rotation.x = Math.PI / 2;
    laneMesh.position.y = 0.03;
    scene.add(laneMesh);

    // Ground platform disc
    const groundGeo = new THREE.CylinderGeometry(42, 44, 0.4, 48);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.4,
      metalness: 0.8,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 6. Particle Starfield Atmosphere
    if (cityConfig.showParticles) {
      const particleCount = 600;
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
        size: 0.3,
        transparent: true,
        opacity: 0.6,
      });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;
    }

    // 7. Render Iconic Architectural 3D Skyscraper Landmarks
    buildingMeshesRef.current = [];

    // Sort projects by commit count to rank them
    const sortedProjects = [...projects].sort((a, b) => b.commitsCount - a.commitsCount);

    sortedProjects.forEach((proj, idx) => {
      // Concentric city layout rings
      const ringIndex = Math.floor(idx / 8);
      const posInRing = idx % 8;
      
      // Skip the road lane radius (12-16)
      let ringRadius = 6 + ringIndex * 5;
      if (ringRadius >= 11 && ringRadius <= 17) {
        ringRadius = 18 + (ringIndex - 2) * 5;
      }

      const angle = (posInRing / 8) * Math.PI * 2 + (ringIndex * 0.4);
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      // Build Iconic Architectural Skyscraper
      const buildingGroup = createIconicSkyscraper(proj, idx);
      buildingGroup.position.set(x, 0, z);

      const floors = Math.max(4, Math.min(28, Math.floor(proj.commitsCount / 2)));
      const totalHeight = floors * 0.65;
      const buildingColorHex = proj.buildingColor || '#38bdf8';

      // Floating 3D Building Project Name Banner Above Building
      const labelText = proj.title;
      const statusBadge = `🏢 ${proj.category.toUpperCase()} • ${proj.commitsCount} COMMITS`;

      const texture = createTextLabelTexture(labelText, statusBadge, buildingColorHex);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const labelSprite = new THREE.Sprite(spriteMat);
      labelSprite.position.set(0, 0.4 + totalHeight + 3.2, 0);
      labelSprite.scale.set(7.5, 1.85, 1);
      buildingGroup.add(labelSprite);

      scene.add(buildingGroup);

      buildingMeshesRef.current.push({
        id: proj.id,
        mesh: buildingGroup,
        baseColor: buildingColorHex,
        project: proj
      });
    });

    // 8. Animated 3D City Vehicles / Traffic Flow on Circular Highway
    vehiclesRef.current = [];
    const carColors = ['38bdf8', 'ef4444', '10b981', 'f59e0b', 'a855f7', 'f8fafc'];
    for (let c = 0; c < 8; c++) {
      const carColor = carColors[c % carColors.length];
      const carMesh = createVehicle(carColor);
      const angle = (c / 8) * Math.PI * 2;
      const radius = 14; // Driving along the highway ring

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
          <span>🌐</span> City Overview
        </button>
        <button
          onClick={() => resetCamera('street')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'street'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🚗</span> Traffic & Street Level
        </button>
        <button
          onClick={() => resetCamera('drone')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'drone'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🏢</span> Architectural Drone View
        </button>
      </div>

      {/* 3D City Legend & Stats Badge */}
      <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl glass-panel border border-slate-700/60 text-xs font-mono-code pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          3D ARCHITECTURAL LANDMARK METROPOLIS
        </div>
        <p className="text-slate-400 text-[10px]">
          • Iconic Landmarks: Burj Khalifa Spire, Google Tech HQ, Cyber Spire & Glass Towers
        </p>
        <p className="text-slate-400 text-[10px]">
          • Inspect: Click any 3D Building
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-slate-800 flex items-center gap-2 text-slate-300 text-[11px]">
          <span>Buildings: <strong className="text-sky-300">{projects.length}</strong></span>
          <span>Theme: <strong className="text-purple-400 capitalize">{cityConfig.theme}</strong></span>
        </div>
      </div>
    </div>
  );
};
