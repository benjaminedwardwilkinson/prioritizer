import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PRIORITIES, getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { ChevronUp, ChevronDown, RefreshCw, Check, Sparkles, Layers, X, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  initialTop5Ids: string[];
  onConfirm: (confirmedIds: string[]) => void;
}

export const TopFiveReveal: React.FC<Props> = ({ initialTop5Ids, onConfirm }) => {
  const [top5Ids, setTop5Ids] = useState<string[]>(initialTop5Ids);
  const [swapModalIdx, setSwapModalIdx] = useState<number | null>(null);
  const [drillDownId, setDrillDownId] = useState<string | null>(null);

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetsGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.45, y: 0 });

  // Play reveal fanfare on mount
  useEffect(() => {
    sound.playBigReveal();
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6'],
      });
    } catch {}
  }, []);

  // Initialize 3D Celestial Formation Preview
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth || 360;
    const height = 240;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 22, 36);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xf59e0b, 3, 50);
    scene.add(sunLight);

    // Central sun
    const sunGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Starfield particles
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.8 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Planets Group
    const planetsGroup = new THREE.Group();
    planetsGroupRef.current = planetsGroup;
    scene.add(planetsGroup);

    top5Ids.forEach((id, idx) => {
      const item = getPriorityById(id);
      const dist = 4.2 + idx * 1.8;

      // Orbit line
      const orbitCurve = new THREE.EllipseCurve(0, 0, dist, dist, 0, Math.PI * 2, false, 0);
      const pts = orbitCurve.getPoints(48);
      const oGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const oMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
      planetsGroup.add(new THREE.Line(oGeo, oMat));

      // Planet Mesh
      const size = Math.max(0.65, 1.15 - idx * 0.05);
      const pGeo = new THREE.SphereGeometry(size, 24, 24);
      const pMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(item?.color || '#3b82f6'),
        roughness: 0.35,
      });
      const pMesh = new THREE.Mesh(pGeo, pMat);

      // Atmospheric halo
      const hGeo = new THREE.SphereGeometry(size * 1.3, 16, 16);
      const hMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(item?.color || '#3b82f6'),
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide,
      });
      const hMesh = new THREE.Mesh(hGeo, hMat);

      const angle = (idx / top5Ids.length) * Math.PI * 2;
      pMesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      hMesh.position.copy(pMesh.position);

      planetsGroup.add(pMesh);
      planetsGroup.add(hMesh);
    });

    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.015;

      planetsGroup.rotation.y = rotRef.current.y + clock * 0.2;
      planetsGroup.rotation.x = rotRef.current.x;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [top5Ids]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    rotRef.current.y += dx * 0.01;
    rotRef.current.x = Math.max(0.1, Math.min(1.0, rotRef.current.x + dy * 0.01));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    sound.playTick();
    const updated = [...top5Ids];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setTop5Ids(updated);
  };

  const moveDown = (index: number) => {
    if (index === top5Ids.length - 1) return;
    sound.playTick();
    const updated = [...top5Ids];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setTop5Ids(updated);
  };

  const handleSwap = (newPriorityId: string) => {
    if (swapModalIdx === null) return;
    sound.playAscend();
    const updated = [...top5Ids];
    updated[swapModalIdx] = newPriorityId;
    setTop5Ids(updated);
    setSwapModalIdx(null);
  };

  const handleConfirmDeclared = () => {
    sound.playLockConfirm();
    onConfirm(top5Ids);
  };

  const drillPriority = drillDownId ? getPriorityById(drillDownId) : null;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header Payoff */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Here's what your answers suggest</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100">
          YOUR TOP 10 PRIORITIES
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Your emerging priority universe is taking shape. Reorder, swap, or inspect sub-priorities before locking them in as your <strong className="text-slate-200">10 Declared Priorities</strong>.
        </p>
      </div>

      {/* 3D Celestial Formation Preview */}
      <div className="w-full rounded-2xl border-2 border-amber-500/80 bg-black shadow-2xl overflow-hidden mb-6 relative">
        <div className="flex items-center justify-between p-3.5 border-b border-amber-500/40 bg-slate-950/80 backdrop-blur">
          <div className="text-xs sm:text-sm font-mono text-amber-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
            <span>REVEALED PREFERENCE // 3D CELESTIAL ORBITS</span>
          </div>
          <span className="text-xs sm:text-sm text-slate-300 flex items-center gap-1 font-mono">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Drag to rotate orbits</span>
          </span>
        </div>

        <div
          ref={canvasContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-[230px] cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* 5 Cards Stack */}
      <div className="w-full space-y-3.5">
        {top5Ids.map((id, index) => {
          const item = getPriorityById(id);
          if (!item) return null;

          return (
            <div
              key={item.id}
              className="w-full p-4 sm:p-5 rounded-xl border-2 border-slate-800 bg-slate-950 shadow-lg flex items-center justify-between gap-3 hover:border-amber-500/60 transition-all"
            >
              {/* Rank & Emoji */}
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="font-mono font-black text-amber-400 text-lg sm:text-xl w-7 shrink-0">
                  #{index + 1}
                </span>
                <span
                  style={{ backgroundColor: `${item.color}25`, borderColor: `${item.color}50` }}
                  className="text-2xl sm:text-3xl p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-inner"
                >
                  {item.emoji}
                </span>
                <div className="min-w-0">
                  <div className="font-bold text-white text-base sm:text-lg flex items-center gap-2 truncate">
                    <span>{item.name}</span>
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 line-clamp-1 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Up, Down, Swap, Sub-priorities with comfortable touch size */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playLcarsBeep();
                    setDrillDownId(item.id);
                  }}
                  title="Drill into sub-priorities"
                  className="p-2 sm:p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 transition-colors"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playLcarsBeep();
                    setSwapModalIdx(index);
                  }}
                  title="Swap with another priority"
                  className="p-2 sm:p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                </button>
                <div className="flex flex-col gap-1 ml-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === top5Ids.length - 1}
                    onClick={() => moveDown(index)}
                    className="p-1.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Lock CTA */}
      <div className="w-full mt-7 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleConfirmDeclared}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 text-black font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 hover:bg-amber-400 shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>CONFIRM DECLARED CONSTELLATION // ENGAGE</span>
        </button>
        <span className="text-xs sm:text-sm text-slate-400 font-mono">
          Next Phase: Measure actual behavioral votes (Money, Time, Attention)
        </span>
      </div>

      {/* Swap Modal */}
      {swapModalIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-slate-100">
                Swap #{swapModalIdx + 1} with another priority
              </h3>
              <button
                type="button"
                onClick={() => setSwapModalIdx(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 py-3">
              {PRIORITIES.map(item => {
                const isAlreadySelected = top5Ids.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isAlreadySelected}
                    onClick={() => handleSwap(item.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isAlreadySelected
                        ? 'bg-slate-950/50 border-slate-800/40 opacity-40 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-800 hover:border-amber-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {item.emoji}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-400">{item.domainName}</div>
                      </div>
                    </div>
                    {isAlreadySelected ? (
                      <span className="text-[11px] text-slate-500 font-mono">In Top 10</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">Choose</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Drill-down Sub-priorities Modal */}
      {drillPriority && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{drillPriority.emoji}</span>
                <h3 className="font-display font-bold text-base text-slate-100">
                  {drillPriority.name} — Sub-Priorities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrillDownId(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2.5 py-4">
              {drillPriority.subPriorities.map(sub => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                >
                  <span className="text-xl p-1.5 rounded bg-slate-900 border border-slate-800">
                    {sub.emoji}
                  </span>
                  <div>
                    <h5 className="font-semibold text-sm text-slate-200">{sub.name}</h5>
                    <p className="text-xs text-slate-400 mt-0.5">{sub.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setDrillDownId(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
