import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Skill } from '../../types/portfolio';
import { playSound } from '../../utils/storage';

interface SkillsOrbCanvasProps {
  skills: Skill[];
}

export const SkillsOrbCanvas: React.FC<SkillsOrbCanvasProps> = ({ skills }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSkill, setActiveSkill] = useState<Skill | null>(null);

  const categories = ['All', 'Development', 'Backend & DB', 'UI/UX & Design', 'Styling & Tools'];

  const filteredSkills = selectedCategory === 'All' 
    ? skills 
    : skills.filter(s => s.category === selectedCategory);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // Render Skills as 3D Floating Orbs
    const count = filteredSkills.length;
    const radius = 9;

    filteredSkills.forEach((skill, idx) => {
      const phi = Math.acos(-1 + (2 * idx) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const orbGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({
        color: skill.color || '#38bdf8',
        emissive: skill.color || '#38bdf8',
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(orbGeo, orbMat);
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Drag / Rotation
    let isMouseDown = false;
    let mousePos = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent) => {
      isMouseDown = true;
      mousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - mousePos.x;
      const dy = e.clientY - mousePos.y;
      group.rotation.y += dx * 0.005;
      group.rotation.x += dy * 0.005;
      mousePos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isMouseDown) {
        group.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [filteredSkills]);

  return (
    <div className="w-full space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSound('click');
              setSelectedCategory(cat);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono-code transition-all border ${
              selectedCategory === cat
                ? 'bg-sky-500/20 text-sky-300 border-sky-500 glow-cyan'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Interactive Skill Matrix Sphere Viewport */}
        <div className="lg:col-span-7 h-[380px] relative rounded-2xl glass-panel border border-purple-500/20 overflow-hidden">
          <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-slate-950/80 text-[11px] font-mono-code text-purple-300 border border-purple-500/30">
            🌌 Interactive 3D Skill Cloud (Drag to rotate)
          </div>
        </div>

        {/* Skill Proficiency Meter List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              onClick={() => {
                playSound('hover');
                setActiveSkill(skill);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                activeSkill?.id === skill.id
                  ? 'bg-slate-800/90 border-sky-400 glow-cyan'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono-code mb-1.5">
                <span className="flex items-center gap-2 text-slate-200 font-semibold">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: skill.color || '#38bdf8' }}
                  />
                  {skill.name}
                </span>
                <span className="text-sky-400 font-bold">{skill.level}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-sky-500 to-purple-500"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
