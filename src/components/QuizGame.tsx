import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { INITIAL_QUIZ_QUESTIONS } from '../data/quizQuestions';
import { PRIORITIES } from '../data/ontology';
import { sound } from '../services/sound';
import { Terminal, Check, ArrowRight, Sparkles, ChevronRight, Gamepad2, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Props {
  onComplete: (topPriorityIds: string[]) => void;
}

const BUTTON_PROMPTS = ['[ 1 ]', '[ 2 ]', '[ 3 ]', '[ 4 ]'];
const GAMEPAD_ICONS = ['Ⓐ', 'Ⓧ', 'Ⓨ', 'Ⓑ'];

export const QuizGame: React.FC<Props> = ({ onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isCinematicWarping, setIsCinematicWarping] = useState(false);

  // 3D Canvas Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const holographicRingsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const nodeMeshesRef = useRef<THREE.Mesh[]>([]);

  const question = INITIAL_QUIZ_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / INITIAL_QUIZ_QUESTIONS.length) * 100);

  // Initialize Three.js 3D Cinematic Decision Chamber
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    const container = canvasContainerRef.current;
    const width = container.clientWidth || 600;
    const height = 240;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040711);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4.5, 14);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const spotlight = new THREE.SpotLight(0xf59e0b, 4, 30, Math.PI / 4, 0.3);
    spotlight.position.set(0, 10, 8);
    scene.add(spotlight);

    const rimLight = new THREE.PointLight(0x06b6d4, 3, 20);
    rimLight.position.set(-6, -2, 4);
    scene.add(rimLight);

    // 1. Central Holographic Projector Pedestal (AAA Dialogue Platform)
    const pedestalGeo = new THREE.CylinderGeometry(4.5, 5.2, 0.4, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.25,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -1.8, 0);
    scene.add(pedestal);

    // Neon Accent Ring on Pedestal
    const ringGeo = new THREE.TorusGeometry(4.7, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, -1.6, 0);
    scene.add(ring);

    // 2. Rotating Holographic Concentric Decision Rings
    const ringsGroup = new THREE.Group();
    holographicRingsGroupRef.current = ringsGroup;
    scene.add(ringsGroup);

    for (let i = 0; i < 3; i++) {
      const radius = 2.2 + i * 1.1;
      const hRingGeo = new THREE.TorusGeometry(radius, 0.03, 8, 48);
      const hRingMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.45 - i * 0.1,
      });
      const hRing = new THREE.Mesh(hRingGeo, hRingMat);
      hRing.rotation.x = Math.PI / 2 + (i * 0.1);
      hRing.position.set(0, -0.6 + i * 0.2, 0);
      ringsGroup.add(hRing);
    }

    // 3. 4 Interactive 3D Holographic Choice Beacons in 3D Space
    const nodeMeshes: THREE.Mesh[] = [];
    const choicePositions = [
      new THREE.Vector3(-4.2, 0.2, -0.5),
      new THREE.Vector3(-1.4, 0.5, 1.2),
      new THREE.Vector3(1.4, 0.5, 1.2),
      new THREE.Vector3(4.2, 0.2, -0.5),
    ];

    choicePositions.forEach((pos, idx) => {
      const beaconGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.8, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(pos);
      scene.add(beacon);
      nodeMeshes.push(beacon);

      // Glow halo
      const haloGeo = new THREE.RingGeometry(0.7, 0.85, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(pos.x, pos.y - 0.35, pos.z);
      scene.add(halo);
    });
    nodeMeshesRef.current = nodeMeshes;

    // 4. Volumetric Stardust Particles
    const pCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 20;
      pPos[i + 1] = Math.random() * 8 - 2;
      pPos[i + 2] = (Math.random() - 0.5) * 16;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfbbf24,
      size: 0.12,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    particlesRef.current = particles;

    // Render Animation Loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.018;

      if (holographicRingsGroupRef.current) {
        holographicRingsGroupRef.current.rotation.y = clock * 0.4;
      }

      if (particlesRef.current) {
        particlesRef.current.rotation.y = clock * 0.08;
      }

      // Camera subtle breathing motion
      if (cameraRef.current) {
        cameraRef.current.position.y = 4.5 + Math.sin(clock * 1.5) * 0.12;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 600;
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
  }, []);

  // Sync 3D node highlights when selection changes
  useEffect(() => {
    nodeMeshesRef.current.forEach((mesh, idx) => {
      const isSel = selectedOptionIdx === idx;
      if (mesh.material instanceof THREE.MeshStandardMaterial) {
        mesh.material.color.setHex(isSel ? 0xf59e0b : 0x1e293b);
        mesh.material.emissive.setHex(isSel ? 0xd97706 : 0x000000);
        mesh.material.emissiveIntensity = isSel ? 0.8 : 0;
      }
      mesh.position.y = isSel ? 0.9 : 0.4;
    });

    // Camera zooms closer to selected option
    if (cameraRef.current) {
      if (selectedOptionIdx !== null) {
        cameraRef.current.position.z = 12.8;
      } else {
        cameraRef.current.position.z = 14;
      }
    }
  }, [selectedOptionIdx]);

  const handleSelectOption = useCallback((index: number) => {
    sound.enableAudioOnFirstTouch();
    sound.playCardSelect();
    sound.haptic(20);
    setSelectedOptionIdx(index);
  }, []);

  const handleConfirmNext = useCallback(() => {
    if (selectedOptionIdx === null) return;
    const option = question.options[selectedOptionIdx];

    sound.playStampLock();
    sound.haptic(35);
    setIsCinematicWarping(true);

    // Accumulate weights
    const nextScores = { ...scores };
    Object.entries(option.weights).forEach(([priorityId, weight]) => {
      nextScores[priorityId] = (nextScores[priorityId] || 0) + weight;
    });
    setScores(nextScores);

    setTimeout(() => {
      setIsCinematicWarping(false);
      setSelectedOptionIdx(null);

      if (currentIdx + 1 < INITIAL_QUIZ_QUESTIONS.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Calculate top 10 highest scored priorities
        const sortedPriorities = [...PRIORITIES].sort((a, b) => {
          const scoreB = nextScores[b.id] || 0;
          const scoreA = nextScores[a.id] || 0;
          return scoreB - scoreA;
        });

        const top10Ids = sortedPriorities.slice(0, 10).map(p => p.id);
        sound.playBigReveal();
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#06b6d4', '#10b981', '#ec4899', '#8b5cf6'],
          });
        } catch {}
        onComplete(top10Ids);
      }
    }, 280);
  }, [selectedOptionIdx, question, scores, currentIdx, onComplete]);

  // Keyboard Quick-Time Event Controls (1, 2, 3, 4, Enter, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleSelectOption(0);
      else if (e.key === '2') handleSelectOption(1);
      else if (e.key === '3') handleSelectOption(2);
      else if (e.key === '4') handleSelectOption(3);
      else if (e.key === 'Enter' || e.key === ' ') {
        if (selectedOptionIdx !== null) {
          e.preventDefault();
          handleConfirmNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handleConfirmNext, selectedOptionIdx]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center font-sans select-none">
      
      {/* HUD Telemetry Top Bar */}
      <div className="w-full flex items-center justify-between mb-2 text-xs sm:text-sm font-mono text-amber-400 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>COGNITIVE TRADEOFF MATRIX // [{question.kicker}]</span>
        </div>
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-cyan-400 hidden sm:inline" />
          <span>
            DILEMMA {currentIdx + 1} / {INITIAL_QUIZ_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-3 bg-black rounded-lg mb-4 overflow-hidden border-2 border-amber-500/60 p-0.5 flex">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-[#FFCC66] rounded-md transition-all duration-300 shadow-sm shadow-amber-500/50"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Holographic Chamber Stage */}
      <div className="w-full rounded-2xl border-2 border-amber-500/80 bg-black shadow-2xl overflow-hidden mb-5 relative">
        <div className="flex items-center justify-between p-3 border-b border-amber-500/40 bg-slate-950/90 backdrop-blur z-10">
          <div className="text-xs font-mono text-amber-400 font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
            <span>3D DECISION CHAMBER // QUICK-TIME CHOICE EVENT</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Press keys 1-4 or tap nodes to lock response
          </span>
        </div>

        {/* WebGL 3D Canvas */}
        <div
          ref={canvasContainerRef}
          className={`w-full h-[220px] transition-transform duration-300 ${
            isCinematicWarping ? 'scale-105 opacity-80 filter brightness-125' : 'scale-100 opacity-100'
          }`}
        />

        {/* Holographic Question Overlay in 3D Stage */}
        <div className="absolute inset-x-4 bottom-4 p-4 sm:p-5 rounded-2xl bg-black/85 border border-amber-500/60 backdrop-blur-md shadow-2xl text-center">
          <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-mono font-black text-[10px] sm:text-xs uppercase tracking-widest inline-block mb-1.5">
            MOMENT OF CHOICE {currentIdx + 1}
          </span>
          <h2 className="font-display font-black text-base sm:text-xl text-white leading-snug">
            {question.scenario}
          </h2>
        </div>
      </div>

      {/* 3D Tactical Choice Nodes (AAA Dialogue Cards) */}
      <div className="w-full space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionIdx === idx;
          const keyLabel = BUTTON_PROMPTS[idx];
          const gpLabel = GAMEPAD_ICONS[idx];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 group relative overflow-hidden active:translate-y-0.5 ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-2xl shadow-amber-500/30 scale-[1.01]'
                  : 'bg-black border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 text-slate-200'
              }`}
            >
              {/* Tactical Quick-Key Badge */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono font-black text-xs shrink-0 transition-colors shadow-inner ${
                    isSelected
                      ? 'bg-amber-500 text-black border-white'
                      : 'bg-slate-900 border-slate-700 text-amber-400 group-hover:border-amber-400'
                  }`}
                >
                  <span className="text-[11px] leading-none">{keyLabel}</span>
                  <span className="text-[9px] opacity-75 leading-none mt-0.5">{gpLabel}</span>
                </div>

                <span className="text-2xl p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                  {option.emoji || '✨'}
                </span>

                <div className="min-w-0">
                  <div className="font-bold text-white text-sm sm:text-base leading-snug">
                    {option.text}
                  </div>
                  {option.subtext && (
                    <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {option.subtext}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Indicator */}
              <div className="shrink-0 pl-2">
                <div
                  className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400 text-black shadow-lg shadow-amber-500/40 rotate-0'
                      : 'border-slate-800 bg-slate-900 text-slate-500 group-hover:border-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 3D Tactical Confirm Trigger Button */}
      <div className="w-full mt-6 flex flex-col items-center">
        <button
          type="button"
          disabled={selectedOptionIdx === null}
          onClick={handleConfirmNext}
          className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-2xl ${
            selectedOptionIdx !== null
              ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-[#FFCC66] text-black border-2 border-white hover:scale-105 active:scale-95 shadow-amber-500/30 cursor-pointer animate-pulse'
              : 'bg-slate-950 text-slate-600 border-2 border-slate-800 cursor-not-allowed opacity-50'
          }`}
        >
          <span>
            {currentIdx + 1 < INITIAL_QUIZ_QUESTIONS.length
              ? 'CONFIRM DECISION // ADVANCE [ENTER]'
              : 'LOCK IN TRADEOFF AUDIT [ENTER]'}
          </span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
        <span className="text-[11px] text-slate-500 font-mono mt-2">
          Use Keyboard [1-4] to select, [SPACE / ENTER] to confirm
        </span>
      </div>
    </div>
  );
};
