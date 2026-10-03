import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getCurrentMonthOrbit } from '../data/seasonalData';
import { sound } from '../services/sound';
import { Globe, Calendar, Sparkles, Check, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onRecordSeasonalSnapshot: (seasonName: string, selectedIds: string[]) => void;
}

export const OrbitSeasonView: React.FC<Props> = ({ onRecordSeasonalSnapshot }) => {
  // STRICTLY Current Month Only as requested by user
  const currentMonth = getCurrentMonthOrbit();
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // 3D Canvas Refs
  const orbitContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.55, y: 0 });

  const getSeasonColor = (season: string): number => {
    switch (season) {
      case 'WINTER': return 0x38bdf8; // ice cyan
      case 'SPRING': return 0x34d399; // emerald
      case 'SUMMER': return 0xfbbf24; // gold
      case 'AUTUMN': return 0xf97316; // amber/orange
      default: return 0x94a3b8;
    }
  };

  useEffect(() => {
    if (!orbitContainerRef.current) return;
    const container = orbitContainerRef.current;
    const width = container.clientWidth || 360;
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

    // Ambient & Point Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xf59e0b, 3, 60);
    scene.add(sunLight);

    // Central Annual Sun
    const sunGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    // Ecliptic Orbit Path Ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, 10, 8, 0, Math.PI * 2, false, 0);
    const pts = orbitCurve.getPoints(100);
    const oGeo = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, 0, p.y)));
    const oMat = new THREE.LineBasicMaterial({ color: 0x475569, transparent: true, opacity: 0.6 });
    const eclipticRing = new THREE.Line(oGeo, oMat);
    scene.add(eclipticRing);

    // Earth at CURRENT MONTH Station Only
    const angle = (currentMonth.monthIndex / 12) * Math.PI * 2;
    const x = Math.cos(angle) * 10;
    const z = Math.sin(angle) * 8;
    const seasonColor = getSeasonColor(currentMonth.season);

    const earthGeo = new THREE.SphereGeometry(1.2, 28, 28);
    const earthMat = new THREE.MeshStandardMaterial({
      color: seasonColor,
      roughness: 0.3,
      metalness: 0.2,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(x, 0, z);
    scene.add(earthMesh);

    // Active Station Glowing Halo Beacon
    const haloGeo = new THREE.SphereGeometry(1.8, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: seasonColor,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.copy(earthMesh.position);
    scene.add(haloMesh);

    // Stardust
    const starCount = 200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.75 });
    scene.add(new THREE.Points(starGeo, starMat));

    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.02;

      // Pulse beacon
      haloMesh.scale.setScalar(1.0 + Math.sin(clock * 3) * 0.15);

      // Rotate camera by drag
      const curX = rotRef.current.x;
      const curY = rotRef.current.y;
      camera.position.x = Math.sin(curY) * 26 * Math.cos(curX);
      camera.position.z = Math.cos(curY) * 26 * Math.cos(curX);
      camera.position.y = Math.sin(curX) * 24 + 4;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [currentMonth.monthIndex, currentMonth.season]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - prevMouseRef.current.x;
    const dy = e.clientY - prevMouseRef.current.y;
    rotRef.current.y += dx * 0.008;
    rotRef.current.x = Math.max(0.15, Math.min(1.1, rotRef.current.x + dy * 0.008));
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleSelectOption = (qIdx: number, priorityId: string) => {
    sound.playLcarsBeep();
    setQuizAnswers(prev => ({ ...prev, [qIdx]: priorityId }));
  };

  const handleCompleteSeasonalPulse = () => {
    sound.playLcarsConfirm();
    setIsCompleted(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}

    const pickedIds = Object.values(quizAnswers);
    onRecordSeasonalSnapshot(
      `${currentMonth.fullName} (${currentMonth.theme})`,
      pickedIds
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center font-sans">
      
      {/* Seasonal Station Banner */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-10 bg-amber-500 rounded-l-lg flex items-center justify-center text-black font-mono font-black text-xs">
            {currentMonth.shortName}
          </div>
          <div>
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider block">
              ANNUAL CYCLE // ACTIVE SEASONAL STATION: {currentMonth.fullName.toUpperCase()} ({currentMonth.season})
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight">
              {currentMonth.headline} — {currentMonth.theme}
            </h2>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
          CURRENT MONTH
        </span>
      </div>

      {/* 3D Solar Ecliptic Orbit Canvas for Current Month */}
      <div className="w-full rounded-2xl border-2 border-amber-500/60 bg-black shadow-2xl overflow-hidden mb-6 relative">
        <div className="flex items-center justify-between p-3.5 border-b border-amber-500/30 bg-slate-950/80 backdrop-blur">
          <div className="text-xs sm:text-sm font-mono text-amber-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
            <span>SOLAR POSITION: {currentMonth.fullName.toUpperCase()} (ORBITAL STATION #{currentMonth.monthIndex + 1})</span>
          </div>
          <span className="text-xs text-slate-300 font-mono">
            Drag to inspect planetary alignment
          </span>
        </div>

        <div
          ref={orbitContainerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-[240px] cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Current Month Active Card & Inquiry */}
      <div className="w-full p-5 sm:p-7 rounded-2xl bg-black border-2 border-slate-800 space-y-6 shadow-xl">
        
        {/* Seasonal Prompt */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{currentMonth.fullName} Seasonal Reflection</span>
          </div>
          <p className="text-white text-base sm:text-lg font-bold leading-snug">
            "{currentMonth.prompt}"
          </p>
        </div>

        {/* Current Month Mini-Pulse Questions */}
        <div className="space-y-5">
          <h3 className="font-mono font-bold text-xs sm:text-sm text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span>
            <span>{currentMonth.fullName} Priority Pulse (Quick Check-in)</span>
          </h3>

          {currentMonth.miniQuiz.map((q, qIdx) => (
            <div key={qIdx} className="space-y-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <h4 className="font-bold text-sm sm:text-base text-slate-100 leading-snug">
                {q.question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = quizAnswers[qIdx] === opt.priorityId;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(qIdx, opt.priorityId)}
                      className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 text-white font-bold ring-2 ring-amber-400/30'
                          : 'bg-black border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {opt.emoji}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA: Record Seasonal Snapshot for Current Month */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs sm:text-sm text-slate-400 font-mono">
            {isCompleted
              ? '✨ Snapshot recorded to your History Timeline'
              : 'Record this month\'s pulse to track seasonal shifts'}
          </div>

          <button
            type="button"
            disabled={Object.keys(quizAnswers).length < currentMonth.miniQuiz.length || isCompleted}
            onClick={handleCompleteSeasonalPulse}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              Object.keys(quizAnswers).length >= currentMonth.miniQuiz.length && !isCompleted
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/30'
                : isCompleted
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Current Month Logged</span>
              </>
            ) : (
              <>
                <span>Record {currentMonth.fullName} Snapshot</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
