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
  const particlesRef = useRef<THREE.Points | null>(null);

  const [activeCamPreset, setActiveCamPreset] = useState<'overview' | 'hero' | 'wireframe'>('overview');

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
    scene.fog = new THREE.FogExp2(currentTheme.sky, 0.012);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(28, 22, 34);
    camera.lookAt(0, 3, 0);
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(currentTheme.light1, 1.4);
    dirLight.position.set(30, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(currentTheme.light2, 2.5, 60);
    pointLight.position.set(-15, 20, -15);
    scene.add(pointLight);

    // 5. Grid Floor
    if (cityConfig.showGrid) {
      const gridHelper = new THREE.GridHelper(80, 50, currentTheme.grid, 0x1e293b);
      gridHelper.position.y = 0;
      scene.add(gridHelper);
    }

    // Ground platform disc
    const groundGeo = new THREE.CylinderGeometry(35, 37, 0.4, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.8,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = -0.2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // 6. Particle Starfield
    if (cityConfig.showParticles) {
      const particleCount = 500;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = Math.random() * 50;
        positions[i + 2] = (Math.random() - 0.5) * 100;
      }
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: currentTheme.grid,
        size: 0.25,
        transparent: true,
        opacity: 0.6,
      });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;
    }

    // 7. Render 3D Buildings in Compact Concentric City Rings
    buildingMeshesRef.current = [];

    projects.forEach((proj, idx) => {
      // Concentric city rings: 8 buildings per ring
      const ringIndex = Math.floor(idx / 8);
      const posInRing = idx % 8;
      const ringRadius = 5 + ringIndex * 4.2;
      const angle = (posInRing / 8) * Math.PI * 2 + (ringIndex * 0.4);

      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      const buildingGroup = new THREE.Group();
      buildingGroup.position.set(x, 0, z);

      // Height computed from commits count (floors)
      const floors = Math.max(3, Math.min(25, Math.floor(proj.commitsCount / 2)));
      const floorHeight = 0.6;
      const totalHeight = floors * floorHeight;
      const buildingColorHex = proj.buildingColor || '#38bdf8';

      // Base Pedestal
      const baseGeo = new THREE.BoxGeometry(2.4, 0.4, 2.4);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      buildingGroup.add(baseMesh);

      // Stacked Floors
      for (let f = 0; f < floors; f++) {
        const width = 2.0 - f * 0.03;
        const depth = 2.0 - f * 0.03;
        const floorGeo = new THREE.BoxGeometry(width, floorHeight * 0.85, depth);
        
        const isTop = f === floors - 1;
        const floorMat = new THREE.MeshStandardMaterial({
          color: isTop ? buildingColorHex : 0x0f172a,
          emissive: isTop ? buildingColorHex : (f % 2 === 0 ? buildingColorHex : 0x000000),
          emissiveIntensity: isTop ? 0.7 : 0.3,
          roughness: 0.2,
          metalness: 0.7,
        });

        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.position.y = 0.4 + f * floorHeight + floorHeight / 2;
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        buildingGroup.add(floorMesh);
      }

      // Spire Light on top floor
      const spireGeo = new THREE.CylinderGeometry(0.05, 0.15, 1.0, 8);
      const spireMat = new THREE.MeshBasicMaterial({ color: buildingColorHex });
      const spireMesh = new THREE.Mesh(spireGeo, spireMat);
      spireMesh.position.y = 0.4 + totalHeight + 0.5;
      buildingGroup.add(spireMesh);

      // Pulsing Beacon Light
      const beaconGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.y = 0.4 + totalHeight + 1.0;
      buildingGroup.add(beaconMesh);

      scene.add(buildingGroup);

      buildingMeshesRef.current.push({
        id: proj.id,
        mesh: buildingGroup,
        baseColor: buildingColorHex,
        project: proj
      });
    });

    // 8. Raycasting for Interaction (Click & Hover)
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
      camera.position.y = Math.max(5, Math.min(45, camera.position.y - deltaY * 0.1));
      camera.lookAt(0, 3, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (cityConfig.autoRotate && !isDragging) {
        cameraAngle += cityConfig.rotationSpeed;
        const currentRadius = 35;
        camera.position.x = Math.sin(cameraAngle) * currentRadius;
        camera.position.z = Math.cos(cameraAngle) * currentRadius;
        camera.lookAt(0, 4, 0);
      }

      // Rotate particle cloud gently
      if (particlesRef.current) {
        particlesRef.current.rotation.y += 0.0005;
      }

      // Gentle floating oscillation for building hover highlights
      buildingMeshesRef.current.forEach((item) => {
        const isHovered = item.id === hoveredProjectId;
        if (isHovered) {
          item.mesh.scale.set(1.1, 1.1, 1.1);
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

  const resetCamera = (preset: 'overview' | 'hero' | 'wireframe') => {
    setActiveCamPreset(preset);
    playSound('click');
    if (!cameraRef.current) return;
    if (preset === 'overview') {
      cameraRef.current.position.set(28, 22, 34);
    } else if (preset === 'hero') {
      cameraRef.current.position.set(12, 10, 16);
    } else if (preset === 'wireframe') {
      cameraRef.current.position.set(0, 45, 1);
    }
    cameraRef.current.lookAt(0, 3, 0);
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
          <span>🌐</span> Overview
        </button>
        <button
          onClick={() => resetCamera('hero')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'hero'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>🎯</span> Low Angle
        </button>
        <button
          onClick={() => resetCamera('wireframe')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono-code flex items-center gap-1 transition-all border ${
            activeCamPreset === 'wireframe'
              ? 'bg-sky-500/30 text-sky-300 border-sky-400 glow-cyan'
              : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>📡</span> Satellite
        </button>
      </div>

      {/* 3D City Legend & Stats Badge */}
      <div className="absolute bottom-3 left-3 z-10 p-2.5 rounded-xl glass-panel border border-slate-700/60 text-xs font-mono-code pointer-events-auto hidden sm:block">
        <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          3D GITHUB CITY ACTIVE
        </div>
        <p className="text-slate-400 text-[10px]">
          • Rotate: Click + Drag mouse
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
