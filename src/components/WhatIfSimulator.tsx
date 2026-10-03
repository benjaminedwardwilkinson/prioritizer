import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { Sliders, Clock, DollarSign, Sparkles, PlusCircle, RotateCcw } from 'lucide-react';
import { LifeExperiment } from '../types';

interface Props {
  declaredIds: string[];
  onCommitExperiment: (exp: LifeExperiment) => void;
}

function getDefaultHours(declaredIds: string[]): Record<string, number> {
  const allocations: Record<string, number> = {};
  const hourBaselines = [120, 75, 45, 30, 20, 16, 12, 10, 8, 5];
  declaredIds.forEach((id, idx) => {
    allocations[id] = hourBaselines[idx] || 10;
  });
  return allocations;
}

function getDefaultSpend(declaredIds: string[]): Record<string, number> {
  const allocations: Record<string, number> = {};
  const spendBaselines = [550, 700, 280, 180, 120, 90, 70, 50, 35, 20];
  declaredIds.forEach((id, idx) => {
    allocations[id] = spendBaselines[idx] || 50;
  });
  return allocations;
}

export const WhatIfSimulator: React.FC<Props> = ({ declaredIds, onCommitExperiment }) => {
  const [mode, setMode] = useState<'time' | 'money'>('time');

  const defaultMonthlyHours = getDefaultHours(declaredIds);
  const defaultMonthlySpend = getDefaultSpend(declaredIds);

  // Time simulation state (monthly waking hours across all declared priorities)
  const [timeAllocations, setTimeAllocations] = useState<Record<string, number>>(defaultMonthlyHours);

  // Money simulation state (monthly spend $ across all declared priorities)
  const [moneyAllocations, setMoneyAllocations] = useState<Record<string, number>>(defaultMonthlySpend);

  // Selected target priority to experiment on
  const [selectedTargetId, setSelectedTargetId] = useState<string>(declaredIds[3] || declaredIds[0]);

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetMeshesRef = useRef<Record<string, { mesh: THREE.Mesh; halo: THREE.Mesh; baseAngle: number; dist: number }>>({});
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.4, y: 0 });

  // Initialize and run the 3D Gravitational Sandbox
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth || 340;
    const height = 260;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 16, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xf59e0b, 2.5, 50);
    scene.add(sunLight);

    // Central anchor sun
    const sunGeo = new THREE.SphereGeometry(1.8, 24, 24);
    const sunMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, roughness: 0.3 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Ambient dust particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 150;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x64748b, size: 0.8 });
    const pCloud = new THREE.Points(pGeo, pMat);
    scene.add(pCloud);

    // World group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    planetMeshesRef.current = {};

    declaredIds.forEach((id, idx) => {
      const item = getPriorityById(id);
      const dist = 5.2 + idx * 2.8;

      // Orbit ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, dist, dist, 0, Math.PI * 2, false, 0);
      const pts = orbitCurve.getPoints(48);
      const oGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
      const oMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
      worldGroup.add(new THREE.Line(oGeo, oMat));

      // Planet sphere
      const pSphereGeo = new THREE.SphereGeometry(1.0, 24, 24);
      const pSphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(item?.color || '#3b82f6'),
        roughness: 0.4,
      });
      const pMesh = new THREE.Mesh(pSphereGeo, pSphereMat);

      // Atmospheric halo
      const hGeo = new THREE.SphereGeometry(1.3, 16, 16);
      const hMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(item?.color || '#3b82f6'),
        transparent: true,
        opacity: 0.25,
        side: THREE.BackSide,
      });
      const hMesh = new THREE.Mesh(hGeo, hMat);

      const baseAngle = (idx / declaredIds.length) * Math.PI * 2;
      pMesh.position.set(Math.cos(baseAngle) * dist, 0, Math.sin(baseAngle) * dist);
      hMesh.position.copy(pMesh.position);

      worldGroup.add(pMesh);
      worldGroup.add(hMesh);

      planetMeshesRef.current[id] = {
        mesh: pMesh,
        halo: hMesh,
        baseAngle,
        dist,
      };
    });

    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.015;

      worldGroup.rotation.y = rotRef.current.y + clock * 0.15;
      worldGroup.rotation.x = rotRef.current.x;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [declaredIds]);

  // Update 3D sphere scales in real-time as sliders move
  useEffect(() => {
    declaredIds.forEach(id => {
      const node = planetMeshesRef.current[id];
      if (!node) return;

      const val = mode === 'time' ? timeAllocations[id] || 0 : moneyAllocations[id] || 0;
      const maxVal = mode === 'time' ? 160 : 1200;
      // Scale between 0.6x and 2.1x based on allocated resources
      const targetScale = Math.max(0.6, Math.min(2.2, 0.6 + (val / maxVal) * 1.5));

      node.mesh.scale.set(targetScale, targetScale, targetScale);
      node.halo.scale.set(targetScale * 1.25, targetScale * 1.25, targetScale * 1.25);
    });
  }, [timeAllocations, moneyAllocations, mode, declaredIds]);

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

  const handleTimeChange = (id: string, val: number) => {
    sound.playTick();
    setTimeAllocations(prev => ({ ...prev, [id]: val }));
  };

  const handleMoneyChange = (id: string, val: number) => {
    sound.playTick();
    setMoneyAllocations(prev => ({ ...prev, [id]: val }));
  };

  const currentHours = timeAllocations[selectedTargetId] || 0;
  const initialHours = defaultMonthlyHours[selectedTargetId] || 0;
  const deltaHours = currentHours - initialHours;
  const weeklyHours = (deltaHours / 4.33).toFixed(1);
  const yearlyHours = deltaHours * 12;

  const currentSpend = moneyAllocations[selectedTargetId] || 0;
  const initialSpend = defaultMonthlySpend[selectedTargetId] || 0;
  const deltaSpend = currentSpend - initialSpend;
  const yearlySpend = deltaSpend * 12;

  const targetItem = getPriorityById(selectedTargetId);

  const handleCreateExperiment = () => {
    if (!targetItem) return;
    sound.playAchievement();

    const isTime = mode === 'time';
    const deltaDesc = isTime
      ? `${deltaHours >= 0 ? '+' : ''}${deltaHours} hrs/month (≈ ${weeklyHours} hrs/week, ${yearlyHours} hrs/yr)`
      : `${deltaSpend >= 0 ? '+' : ''}$${deltaSpend}/month ($${yearlySpend.toLocaleString()}/yr)`;

    const actionText = isTime
      ? `Dedicate approx ${weeklyHours} hrs every week to intentional ${targetItem.name}.`
      : `Rebalance $${Math.abs(deltaSpend)}/month toward ${targetItem.name}.`;

    const exp: LifeExperiment = {
      id: `exp_${Date.now()}`,
      priorityId: targetItem.id,
      priorityName: targetItem.name,
      priorityEmoji: targetItem.emoji,
      title: `30-Day ${targetItem.name} Rebalance`,
      action: actionText,
      resource: isTime ? 'TIME' : 'MONEY',
      deltaDescription: deltaDesc,
      durationDays: 30,
      startDate: new Date().toISOString(),
      status: 'ACTIVE',
      notes: 'Sandbox experiment committed from What-If 3D Simulator.',
    };

    onCommitExperiment(exp);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1">
          <Sliders className="w-3.5 h-3.5" />
          <span>Real-time 3D Gravitational Sandbox</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-100">
          THE WHAT-IF SIMULATOR
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
          Adjust monthly hours or capital. Watch celestial body masses physically morph in real-time 3D space.
        </p>
      </div>

      {/* 3D Real-time Visualizer Canvas */}
      <div className="w-full rounded-2xl border border-slate-800 bg-[#060911] shadow-2xl overflow-hidden mb-6 relative">
        <div className="flex items-center justify-between p-3 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
          <div className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>3D GRAVITATIONAL MASS SIMULATION</span>
          </div>
          <span className="text-[11px] text-slate-400">Drag to rotate 3D life balance</span>
        </div>

        <div
          ref={canvasContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-[240px] cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6">
        <button
          type="button"
          onClick={() => {
            setMode('time');
            sound.playTick();
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'time'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Time Rebalance (Hours)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('money');
            sound.playTick();
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'money'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Capital Rebalance ($)</span>
        </button>
      </div>

      {/* Interactive Sliders */}
      <div className="w-full space-y-3.5 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>Priority & Current Allocation</span>
          <span>Adjust Monthly {mode === 'time' ? 'Hours' : 'Dollars'}</span>
        </div>

        {declaredIds.map(id => {
          const item = getPriorityById(id);
          if (!item) return null;
          const val = mode === 'time' ? timeAllocations[id] || 0 : moneyAllocations[id] || 0;
          const isSelected = selectedTargetId === id;

          return (
            <div
              key={id}
              onClick={() => setSelectedTargetId(id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-amber-400/80 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="font-semibold text-sm text-slate-100">{item.name}</span>
                </div>
                <div className="font-mono text-sm font-bold text-amber-400">
                  {mode === 'time' ? `${val} hrs/mo` : `$${val}/mo`}
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={mode === 'time' ? 200 : 2000}
                step={mode === 'time' ? 5 : 25}
                value={val}
                onChange={e => {
                  const num = parseInt(e.target.value, 10);
                  if (mode === 'time') handleTimeChange(id, num);
                  else handleMoneyChange(id, num);
                }}
                className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          );
        })}
      </div>

      {/* Impact Calculation Callout */}
      {targetItem && (
        <div className="w-full mt-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-xl bg-slate-950 border border-slate-800">
              {targetItem.emoji}
            </span>
            <div>
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compound Mathematics</span>
              </div>
              <h4 className="font-display font-bold text-base text-slate-100">
                {targetItem.name}:{' '}
                {mode === 'time'
                  ? `${deltaHours >= 0 ? '+' : ''}${deltaHours} hrs/month`
                  : `${deltaSpend >= 0 ? '+' : ''}$${deltaSpend}/month`}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'time' ? (
                  <>
                    ≈ <strong className="text-slate-200">{weeklyHours} hours/week</strong> · ≈{' '}
                    <strong className="text-slate-200">{yearlyHours} hours/year</strong>
                  </>
                ) : (
                  <>
                    ≈ <strong className="text-slate-200">${(deltaSpend / 4.33).toFixed(1)}/week</strong> · ≈{' '}
                    <strong className="text-slate-200">${yearlySpend.toLocaleString()}/year</strong>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateExperiment}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-300 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Turn Into 30-Day Experiment</span>
          </button>
        </div>
      )}
    </div>
  );
};
