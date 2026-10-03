import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { sound } from '../services/sound';
import { getPriorityById } from '../data/ontology';
import { Sparkles, Sliders, CheckCircle2, RotateCcw, Volume2, ArrowRight } from 'lucide-react';

interface Props {
  priorityId: string;
  initialHours: number;
  minHours?: number;
  maxHours?: number;
  onChange: (newHours: number) => void;
  onCommit?: (hours: number) => void;
}

export const Tactile3DSliderBar: React.FC<Props> = ({
  priorityId,
  initialHours,
  minHours = 0,
  maxHours = 120,
  onChange,
  onCommit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentValue, setCurrentValue] = useState<number>(initialHours);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);

  const priorityItem = getPriorityById(priorityId);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const thumbMeshRef = useRef<THREE.Mesh | null>(null);
  const beamMeshRef = useRef<THREE.Mesh | null>(null);
  const glowMeshRef = useRef<THREE.Mesh | null>(null);
  const railMeshRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastSoundTickRef = useRef<number>(initialHours);

  const railLength = 16; // 3D units for rail width (-8 to +8)

  const valueToPos = useCallback((val: number): number => {
    const fraction = (val - minHours) / (maxHours - minHours);
    return (fraction - 0.5) * railLength;
  }, [minHours, maxHours, railLength]);

  const posToValue = useCallback((posX: number): number => {
    const clampedX = Math.max(-railLength / 2, Math.min(railLength / 2, posX));
    const fraction = (clampedX + railLength / 2) / railLength;
    return Math.round(minHours + fraction * (maxHours - minHours));
  }, [minHours, maxHours, railLength]);

  // Sync internal state if prop changes
  useEffect(() => {
    setCurrentValue(initialHours);
  }, [initialHours]);

  // Initialize Three.js 3D Slider Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = 140;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 4.5, 13);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const keyLight = new THREE.PointLight(0xf59e0b, 3, 30);
    keyLight.position.set(0, 8, 8);
    scene.add(keyLight);

    // 1. Sleek Precision Base Rail (Machined Dark Matte Bevel)
    const railGeo = new THREE.BoxGeometry(railLength + 1.2, 0.4, 0.9);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, -0.3, 0);
    scene.add(rail);
    railMeshRef.current = rail;

    // 2. Glowing Internal Guide Channel (Linear Track)
    const channelGeo = new THREE.BoxGeometry(railLength, 0.15, 0.2);
    const channelMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const channel = new THREE.Mesh(channelGeo, channelMat);
    channel.position.set(0, 0, 0);
    scene.add(channel);

    // 3. Volumetric Active Energy Fill Beam
    const beamGeo = new THREE.BoxGeometry(1, 0.22, 0.35);
    const beamMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(priorityItem?.color || '#f59e0b'),
      emissive: new THREE.Color(priorityItem?.color || '#f59e0b'),
      emissiveIntensity: 0.75,
      roughness: 0.2,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    scene.add(beam);
    beamMeshRef.current = beam;

    // 4. Precision Tactile 3D Slider Thumb Carriage (Beveled Hexagonal Block)
    const thumbGeo = new THREE.CylinderGeometry(0.75, 0.85, 1.2, 16);
    const thumbMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.9,
      roughness: 0.18,
    });
    const thumb = new THREE.Mesh(thumbGeo, thumbMat);
    thumb.position.set(valueToPos(currentValue), 0.35, 0);
    scene.add(thumb);
    thumbMeshRef.current = thumb;

    // Glow Ring on Thumb
    const glowGeo = new THREE.TorusGeometry(0.85, 0.08, 12, 24);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(priorityItem?.color || '#f59e0b'),
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = Math.PI / 2;
    thumb.add(glow);
    glowMeshRef.current = glow;

    // Graduation Tick Marks
    const tickCount = 9;
    for (let i = 0; i < tickCount; i++) {
      const x = -railLength / 2 + (i / (tickCount - 1)) * railLength;
      const tGeo = new THREE.BoxGeometry(0.08, 0.25, 0.4);
      const tMat = new THREE.MeshBasicMaterial({ color: i === 0 || i === tickCount - 1 ? 0x94a3b8 : 0x334155 });
      const tick = new THREE.Mesh(tGeo, tMat);
      tick.position.set(x, -0.05, 0.45);
      scene.add(tick);
    }

    // Animation Render Loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.03;

      if (thumbMeshRef.current && glowMeshRef.current) {
        glowMeshRef.current.scale.setScalar(1.0 + Math.sin(clock * 4) * 0.06);
      }

      // Update Fill Beam position & scale
      if (beamMeshRef.current && thumbMeshRef.current) {
        const curX = thumbMeshRef.current.position.x;
        const beamStart = -railLength / 2;
        const currentLength = Math.max(0.1, curX - beamStart);
        beamMeshRef.current.scale.x = currentLength;
        beamMeshRef.current.position.x = beamStart + currentLength / 2;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 360;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [railLength, valueToPos, priorityItem?.color]);

  // Update 3D thumb position when value changes
  useEffect(() => {
    if (thumbMeshRef.current && !isDraggingRef.current) {
      thumbMeshRef.current.position.x = valueToPos(currentValue);
    }
  }, [currentValue, valueToPos]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsInteracting(true);
    sound.haptic(15);
    updateFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    updateFromPointer(e);
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsInteracting(false);
      sound.playLcarsConfirm();
      if (onCommit) onCommit(currentValue);
    }
  };

  const updateFromPointer = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;

    // Convert screen NDC X into 3D world plane position
    const worldX = ndcX * (railLength / 1.7);
    const newValue = posToValue(worldX);

    if (newValue !== currentValue) {
      // Audio tick every 2 units
      if (Math.abs(newValue - lastSoundTickRef.current) >= 3) {
        sound.playTick();
        lastSoundTickRef.current = newValue;
      }

      setCurrentValue(newValue);
      onChange(newValue);

      if (thumbMeshRef.current) {
        thumbMeshRef.current.position.x = valueToPos(newValue);
      }
    }
  };

  const weeklyEquivalent = (currentValue / 4.33).toFixed(1);
  const deltaFromBaseline = currentValue - initialHours;

  return (
    <div className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden font-sans select-none">
      
      {/* Top Readout Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl p-1.5 rounded-lg bg-black border border-slate-800">
            {priorityItem?.emoji || '⏱️'}
          </span>
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Tactile Allocation Slider // {priorityItem?.name}</span>
            </div>
            <div className="text-xs text-slate-400">
              Direct physical simulation of weekly calendar demand
            </div>
          </div>
        </div>

        {/* Current Value Pill */}
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-mono font-black text-white">
            {currentValue} <span className="text-xs font-normal text-slate-400">hrs/mo</span>
          </div>
          <div className="text-xs font-mono text-cyan-400 font-semibold">
            ≈ {weeklyEquivalent} hrs / week
          </div>
        </div>
      </div>

      {/* Interactive 3D WebGL Canvas */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-[140px] cursor-ew-resize active:cursor-grabbing touch-none my-1"
        title="Drag the 3D cylinder horizontally to adjust allocation"
      />

      {/* Quick Adjustment Steppers & Data Context */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const val = Math.max(minHours, currentValue - 5);
              setCurrentValue(val);
              onChange(val);
              sound.playTick();
            }}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold"
          >
            -5h
          </button>
          <button
            type="button"
            onClick={() => {
              const val = Math.min(maxHours, currentValue + 5);
              setCurrentValue(val);
              onChange(val);
              sound.playTick();
            }}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-mono font-bold"
          >
            +5h
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentValue(initialHours);
              onChange(initialHours);
              sound.playTick();
            }}
            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono"
            title="Reset to initial baseline"
          >
            Reset
          </button>
        </div>

        {/* Delta feedback */}
        <div className="font-mono text-xs">
          {deltaFromBaseline === 0 ? (
            <span className="text-slate-400">At current baseline</span>
          ) : deltaFromBaseline > 0 ? (
            <span className="text-emerald-400 font-bold">+{deltaFromBaseline} hrs/mo reallocation</span>
          ) : (
            <span className="text-rose-400 font-bold">{deltaFromBaseline} hrs/mo reduction</span>
          )}
        </div>
      </div>
    </div>
  );
};
