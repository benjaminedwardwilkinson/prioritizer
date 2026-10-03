import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CalculatedDeltas } from '../services/insightEngine';
import { PRIORITIES, getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Compass, X, ChevronUp, ChevronDown, RefreshCw, CheckCircle2, ChevronRight, Layers, Clock, DollarSign, Brain, History } from 'lucide-react';

interface Props {
  deltas: CalculatedDeltas[];
  declaredIds: string[];
  moneyRanks: string[];
  timeRanks: string[];
  attentionRanks: string[];
  onSelectPriority: (priorityId: string) => void;
  selectedPriorityId: string | null;
  onExploreFriction: (priorityId: string) => void;
  onUpdatePriorities: (
    updatedDeclared: string[],
    updatedMoney?: string[],
    updatedTime?: string[],
    updatedAttention?: string[],
    changeDesc?: string
  ) => void;
}

// Procedural Sprite for Billboard Labels in 3D
function createArcadeLabel(emoji: string, name: string, rank: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 90;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.roundRect(8, 8, 284, 74, 16);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Rank badge
  ctx.fillStyle = '#f59e0b';
  ctx.roundRect(14, 16, 44, 56, 10);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`#${rank}`, 36, 52);

  // Emoji
  ctx.textAlign = 'left';
  ctx.font = '34px sans-serif';
  ctx.fillText(emoji, 68, 56);

  // Name
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(name.length > 12 ? name.substring(0, 11) + '…' : name, 115, 52);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.8, 1.45, 1);
  return sprite;
}

export const PriorityDiorama3D: React.FC<Props> = ({
  deltas,
  declaredIds,
  moneyRanks,
  timeRanks,
  attentionRanks,
  onSelectPriority,
  selectedPriorityId,
  onExploreFriction,
  onUpdatePriorities,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastRecorded, setLastRecorded] = useState<{ timestamp: string; message: string } | null>(null);
  const [swapModalIdx, setSwapModalIdx] = useState<number | null>(null);

  const activeItem = selectedPriorityId ? getPriorityById(selectedPriorityId) : null;
  const activeDelta = selectedPriorityId ? deltas.find(d => d.priorityId === selectedPriorityId) : null;
  const activeIndex = selectedPriorityId ? declaredIds.indexOf(selectedPriorityId) : -1;

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const dioramaGroupRef = useRef<THREE.Group | null>(null);
  const totemObjectsRef = useRef<{
    id: string;
    group: THREE.Group;
    targetY: number;
    bounceVelocity: number;
    declaredCol: THREE.Mesh;
    moneyCol: THREE.Mesh;
    timeCol: THREE.Mesh;
    attCol: THREE.Mesh;
    sprite: THREE.Sprite;
  }[]>([]);

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.42, y: 0.2 });
  const zoomDistRef = useRef(32);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.015);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 16, 32);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Studio / Nintendo Stage Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const mainKeyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    mainKeyLight.position.set(15, 30, 20);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const fillCyan = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillCyan.position.set(-20, 15, -15);
    scene.add(fillCyan);

    const rimPink = new THREE.PointLight(0xf43f5e, 1.2, 50);
    rimPink.position.set(0, -5, 15);
    scene.add(rimPink);

    // --- NINTENDO FLOATING GAME ISLAND DIORAMA ---
    const dioramaGroup = new THREE.Group();
    dioramaGroupRef.current = dioramaGroup;
    scene.add(dioramaGroup);

    // 1. Chunky Rounded Island Platform Base
    const islandGeo = new THREE.CylinderGeometry(15, 13.5, 2.2, 48);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.1,
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.position.y = -1.1;
    island.receiveShadow = true;
    dioramaGroup.add(island);

    // 2. Playful Grid Rim (Golden arcade game rim)
    const rimGeo = new THREE.TorusGeometry(15.1, 0.28, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.05;
    dioramaGroup.add(rim);

    // Decorative floating stage clouds / gems
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    for (let c = 0; c < 8; c++) {
      const cGeo = new THREE.DodecahedronGeometry(Math.random() * 0.8 + 0.5);
      const cMesh = new THREE.Mesh(cGeo, cloudMat);
      const angle = (c / 8) * Math.PI * 2;
      cMesh.position.set(Math.cos(angle) * 18, (Math.random() - 0.5) * 4 - 2, Math.sin(angle) * 18);
      dioramaGroup.add(cMesh);
    }

    // --- BUILD THE 5 INTERACTIVE DATA TOTEMS ---
    totemObjectsRef.current = [];

    const spacing = 5.2;
    const startX = -((deltas.length - 1) * spacing) / 2;

    deltas.forEach((d, idx) => {
      const posX = startX + idx * spacing;
      const posZ = Math.sin((idx / 4) * Math.PI) * 2.2 - 1.0;

      const totemGroup = new THREE.Group();
      totemGroup.position.set(posX, 0, posZ);
      totemGroup.userData = { id: d.priorityId, name: d.name, emoji: d.emoji };
      dioramaGroup.add(totemGroup);

      const getHeight = (rank: number) => Math.max(1.5, (6 - rank) * 1.9);

      const hDeclared = getHeight(d.declaredRank);
      const hMoney = getHeight(d.moneyRank);
      const hTime = getHeight(d.timeRank);
      const hAttention = getHeight(d.attentionRank);

      // Pedestal Base (Stone Plinth)
      const baseGeo = new THREE.BoxGeometry(4.2, 0.6, 4.2);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.3;
      baseMesh.receiveShadow = true;
      totemGroup.add(baseMesh);

      // BAR 1: 👑 Declared Importance Tower (Gold / Amber)
      const colDeclaredGeo = new THREE.BoxGeometry(0.85, hDeclared, 0.85);
      const colDeclaredMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      const colDeclared = new THREE.Mesh(colDeclaredGeo, colDeclaredMat);
      colDeclared.position.set(-1.1, hDeclared / 2 + 0.6, -1.1);
      colDeclared.castShadow = true;
      colDeclared.receiveShadow = true;
      totemGroup.add(colDeclared);

      // BAR 2: 💰 Money Stack (Emerald / Green Cash Stack)
      const colMoneyGeo = new THREE.CylinderGeometry(0.48, 0.48, hMoney, 16);
      const colMoneyMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.3,
        roughness: 0.3,
      });
      const colMoney = new THREE.Mesh(colMoneyGeo, colMoneyMat);
      colMoney.position.set(1.1, hMoney / 2 + 0.6, -1.1);
      colMoney.castShadow = true;
      totemGroup.add(colMoney);

      // BAR 3: ⏱️ Time Pillar (Electric Cyan Glass Column)
      const colTimeGeo = new THREE.BoxGeometry(0.85, hTime, 0.85);
      const colTimeMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.4,
        roughness: 0.2,
      });
      const colTime = new THREE.Mesh(colTimeGeo, colTimeMat);
      colTime.position.set(-1.1, hTime / 2 + 0.6, 1.1);
      colTime.castShadow = true;
      totemGroup.add(colTime);

      // BAR 4: 🧠 Attention Gem (Vivid Violet Obelisk)
      const colAttGeo = new THREE.CylinderGeometry(0.1, 0.5, hAttention, 6);
      const colAttMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x7c3aed,
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      const colAtt = new THREE.Mesh(colAttGeo, colAttMat);
      colAtt.position.set(1.1, hAttention / 2 + 0.6, 1.1);
      colAtt.castShadow = true;
      totemGroup.add(colAtt);

      // PHYSICAL 3D FRICTION / GAP BEACON:
      const hasGap = d.declaredRank <= 2 && (d.timeRank >= 4 || d.moneyRank >= 4);
      if (hasGap) {
        const bridgeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
        const bridgeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
        bridge.position.set(-1.1, hTime + 0.8, 0);
        bridge.rotation.x = Math.PI / 2;
        totemGroup.add(bridge);

        const boulderGeo = new THREE.DodecahedronGeometry(0.48);
        const boulderMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.8 });
        const boulder = new THREE.Mesh(boulderGeo, boulderMat);
        boulder.position.set(-1.1, hTime + 0.6 + 0.45, 1.1);
        totemGroup.add(boulder);
      }

      // If perfectly Aligned: Golden Crown Arch
      if (d.totalDivergence <= 2) {
        const archGeo = new THREE.RingGeometry(0.8, 1.4, 24);
        const archMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, side: THREE.DoubleSide });
        const arch = new THREE.Mesh(archGeo, archMat);
        arch.position.set(0, hDeclared + 1.2, 0);
        arch.rotation.x = Math.PI / 2;
        totemGroup.add(arch);
      }

      // 3D Floating Emoji Icon
      const emojiCanvas = document.createElement('canvas');
      emojiCanvas.width = 128;
      emojiCanvas.height = 128;
      const eCtx = emojiCanvas.getContext('2d')!;
      eCtx.font = '72px sans-serif';
      eCtx.textAlign = 'center';
      eCtx.textBaseline = 'middle';
      eCtx.fillText(d.emoji, 64, 64);
      const eTex = new THREE.CanvasTexture(emojiCanvas);
      const eSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: eTex, depthWrite: false }));
      eSprite.position.set(-1.1, hDeclared + 1.2, -1.1);
      eSprite.scale.set(2.2, 2.2, 1);
      totemGroup.add(eSprite);

      // 3D Arcade Text Label Sprite
      const sprite = createArcadeLabel(d.emoji, d.name, d.declaredRank);
      sprite.position.set(0, Math.max(hDeclared, hMoney, hTime) + 2.8, 0);
      totemGroup.add(sprite);

      totemObjectsRef.current.push({
        id: d.priorityId,
        group: totemGroup,
        targetY: 0,
        bounceVelocity: 0,
        declaredCol: colDeclared,
        moneyCol: colMoney,
        timeCol: colTime,
        attCol: colAtt,
        sprite,
      });
    });

    // Animation Loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.02;

      dioramaGroup.rotation.y = rotRef.current.y;
      dioramaGroup.rotation.x = rotRef.current.x;

      if (cameraRef.current) {
        cameraRef.current.position.z = zoomDistRef.current;
      }

      totemObjectsRef.current.forEach((t, i) => {
        const bob = Math.sin(clock * 2 + i * 1.2) * 0.08;
        t.sprite.position.y = (t.sprite.userData.baseY || t.sprite.position.y) + bob * 0.05;

        if (t.bounceVelocity !== 0 || t.group.position.y > 0) {
          t.group.position.y += t.bounceVelocity;
          t.bounceVelocity -= 0.08;
          if (t.group.position.y <= 0) {
            t.group.position.y = 0;
            t.bounceVelocity = 0;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [deltas]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      rotRef.current.y += dx * 0.008;
      rotRef.current.x = Math.max(0.15, Math.min(0.85, rotRef.current.x + dy * 0.008));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const groups = totemObjectsRef.current.map(t => t.group);
    const hits = raycaster.intersectObjects(groups, true);

    if (hits.length > 0) {
      let parent: THREE.Object3D | null = hits[0].object;
      while (parent && !parent.userData?.id) {
        parent = parent.parent;
      }
      if (parent && parent.userData?.id) {
        triggerTotemHop(parent.userData.id);
        onSelectPriority(parent.userData.id);
      }
    }
  };

  const triggerTotemHop = (id: string) => {
    sound.playBoing();
    const totem = totemObjectsRef.current.find(t => t.id === id);
    if (totem) {
      totem.bounceVelocity = 0.65;
    }
  };

  // --- REAL-TIME 3D REORDERING & RECORDING HANDLERS ---

  const handlePromote = (index: number) => {
    if (index <= 0) return;
    sound.playCoin();

    const updated = [...declaredIds];
    const targetId = updated[index];
    const swapTargetId = updated[index - 1];
    updated[index] = swapTargetId;
    updated[index - 1] = targetId;

    const item = getPriorityById(targetId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logMsg = `Promoted ${item?.name || 'Priority'} to Declared #${index} (was #${index + 1})`;

    setLastRecorded({ timestamp: timeStr, message: logMsg });
    triggerTotemHop(targetId);

    onUpdatePriorities(updated, undefined, undefined, undefined, logMsg);
  };

  const handleDemote = (index: number) => {
    if (index >= declaredIds.length - 1) return;
    sound.playStampLock();

    const updated = [...declaredIds];
    const targetId = updated[index];
    const swapTargetId = updated[index + 1];
    updated[index] = swapTargetId;
    updated[index + 1] = targetId;

    const item = getPriorityById(targetId);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logMsg = `Demoted ${item?.name || 'Priority'} to Declared #${index + 2} (was #${index + 1})`;

    setLastRecorded({ timestamp: timeStr, message: logMsg });
    triggerTotemHop(targetId);

    onUpdatePriorities(updated, undefined, undefined, undefined, logMsg);
  };

  const handleSwapPriority = (newPriorityId: string) => {
    if (swapModalIdx === null) return;
    sound.playCoin();

    const updated = [...declaredIds];
    const oldId = updated[swapModalIdx];
    const oldItem = getPriorityById(oldId);
    const newItem = getPriorityById(newPriorityId);

    updated[swapModalIdx] = newPriorityId;
    setSwapModalIdx(null);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logMsg = `Replaced #${swapModalIdx + 1} ${oldItem?.name} with ${newItem?.name}`;

    setLastRecorded({ timestamp: timeStr, message: logMsg });
    onSelectPriority(newPriorityId);
    triggerTotemHop(newPriorityId);

    onUpdatePriorities(updated, undefined, undefined, undefined, logMsg);
  };

  const handleAdjustResourceRank = (
    type: 'money' | 'time' | 'attention',
    priorityId: string,
    direction: 'up' | 'down'
  ) => {
    sound.playCoin();
    const currentList =
      type === 'money' ? [...moneyRanks] : type === 'time' ? [...timeRanks] : [...attentionRanks];

    const idx = currentList.indexOf(priorityId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const temp = currentList[idx];
      currentList[idx] = currentList[idx - 1];
      currentList[idx - 1] = temp;
    } else if (direction === 'down' && idx < currentList.length - 1) {
      const temp = currentList[idx];
      currentList[idx] = currentList[idx + 1];
      currentList[idx + 1] = temp;
    } else {
      return;
    }

    const item = getPriorityById(priorityId);
    const newRank = currentList.indexOf(priorityId) + 1;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const typeLabel = type === 'money' ? 'Money Capital' : type === 'time' ? 'Calendar Hours' : 'Mind Attention';
    const logMsg = `Shifted ${item?.name} ${typeLabel} to #${newRank}`;

    setLastRecorded({ timestamp: timeStr, message: logMsg });
    triggerTotemHop(priorityId);

    if (type === 'money') {
      onUpdatePriorities(declaredIds, currentList, undefined, undefined, logMsg);
    } else if (type === 'time') {
      onUpdatePriorities(declaredIds, undefined, currentList, undefined, logMsg);
    } else {
      onUpdatePriorities(declaredIds, undefined, undefined, currentList, logMsg);
    }
  };

  const zoomIn = () => {
    sound.playTick();
    zoomDistRef.current = Math.max(18, zoomDistRef.current - 5);
  };

  const zoomOut = () => {
    sound.playTick();
    zoomDistRef.current = Math.min(48, zoomDistRef.current + 5);
  };

  const resetDiorama = () => {
    sound.playCoin();
    rotRef.current = { x: 0.42, y: 0.2 };
    zoomDistRef.current = 32;
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-hidden rounded-3xl border-4 border-slate-800 bg-[#0a0f1d] shadow-2xl">
      {/* Real-time System Recording Status Banner */}
      {lastRecorded && (
        <div className="w-full bg-emerald-950/90 border-b-2 border-emerald-500/60 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 z-30 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono font-bold text-emerald-400">⚡ RECORDED IN REAL TIME:</span>
            <span className="font-semibold text-slate-100">{lastRecorded.message}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90">
            <Clock className="w-3.5 h-3.5" />
            <span>{lastRecorded.timestamp}</span>
            <span className="hidden sm:inline">· Saved to History Snapshot</span>
          </div>
        </div>
      )}

      {/* Nintendo Game HUD Bar */}
      <div className="w-full flex items-center justify-between p-3.5 border-b-2 border-slate-800 bg-slate-900/90 backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-amber-300 flex items-center justify-center text-slate-950 font-black shadow text-sm">
            3D
          </div>
          <div>
            <div className="font-display font-black text-sm tracking-wide text-white uppercase flex items-center gap-1.5">
              <span>PRIORITY DIORAMA STAGE</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
                LIVE REAL-TIME ADJUSTMENTS
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Adjust priorities directly in 3D · The system automatically records and timestamps every change
            </div>
          </div>
        </div>

        {/* 3D Stage Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={zoomIn}
            className="p-2 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-200 hover:text-white hover:border-amber-400 active:translate-y-0.5 transition-all shadow"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="p-2 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-200 hover:text-white hover:border-amber-400 active:translate-y-0.5 transition-all shadow"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetDiorama}
            className="p-2 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-200 hover:text-white hover:border-amber-400 active:translate-y-0.5 transition-all shadow"
            title="Reset Stage View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-[440px] sm:h-[500px] cursor-grab active:cursor-grabbing relative"
      >
        {/* Visual 3D Legend Pill-less Key */}
        <div className="absolute top-3 left-3 bg-slate-950/85 border-2 border-slate-800 p-2.5 rounded-2xl backdrop-blur text-xs flex flex-col gap-1.5 shadow-xl pointer-events-none z-10">
          <span className="font-bold text-[11px] text-slate-300 font-mono uppercase tracking-wider">
            3D Column Key:
          </span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-sm bg-amber-400 shadow-sm" />
            <span className="text-slate-200 font-medium">Declared Tower</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-sm bg-emerald-400 shadow-sm" />
            <span className="text-slate-200 font-medium">Money Stack ($)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-sm bg-cyan-400 shadow-sm" />
            <span className="text-slate-200 font-medium">Time Pillar (Hours)</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-3 h-3 rounded-sm bg-violet-400 shadow-sm" />
            <span className="text-slate-200 font-medium">Attention Gem (Mind)</span>
          </div>
        </div>

        {/* Live Rebalance Callout in Top-Right */}
        {activeItem && activeIndex !== -1 && (
          <div className="absolute top-3 right-3 bg-slate-950/90 border-2 border-amber-400/80 p-3 rounded-2xl backdrop-blur text-xs flex flex-col gap-2 shadow-2xl z-10 max-w-[200px]">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeItem.emoji}</span>
              <div>
                <div className="font-bold text-slate-100">{activeItem.name}</div>
                <div className="text-[10px] text-amber-400 font-mono">Rank #{activeIndex + 1}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
              <button
                type="button"
                disabled={activeIndex === 0}
                onClick={e => {
                  e.stopPropagation();
                  handlePromote(activeIndex);
                }}
                className="flex-1 py-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-300 flex items-center justify-center gap-1 active:translate-y-0.5"
                title="Promote priority higher"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>▲ UP</span>
              </button>
              <button
                type="button"
                disabled={activeIndex === declaredIds.length - 1}
                onClick={e => {
                  e.stopPropagation();
                  handleDemote(activeIndex);
                }}
                className="flex-1 py-1 rounded-lg bg-slate-800 text-slate-200 font-black text-[11px] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 flex items-center justify-center gap-1 active:translate-y-0.5"
                title="Demote priority lower"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>▼ DOWN</span>
              </button>
            </div>
          </div>
        )}

        {/* Tactile Gesture Instruction */}
        <div className="absolute bottom-3 left-3 pointer-events-none bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 backdrop-blur z-10">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Tap 3D totem to select · Use ▲/▼ buttons to rebalance in real time</span>
        </div>
      </div>

      {/* Chunky Arcade Totem Selector Strip */}
      <div className="w-full px-3 py-2.5 bg-slate-900 border-t-2 border-slate-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar z-20">
        {deltas.map(d => {
          const isSelected = selectedPriorityId === d.priorityId;
          const hasGap = d.declaredRank <= 2 && (d.timeRank >= 4 || d.moneyRank >= 4);

          return (
            <button
              key={d.priorityId}
              type="button"
              onClick={() => {
                triggerTotemHop(d.priorityId);
                onSelectPriority(d.priorityId);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all shrink-0 active:translate-y-1 ${
                isSelected
                  ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600 shadow'
              }`}
            >
              <span className="text-xl">{d.emoji}</span>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">{d.name}</div>
                <div className="text-[10px] font-mono opacity-80">Declared #{d.declaredRank}</div>
              </div>
              {hasGap && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" title="Priority Gap Detected" />
              )}
            </button>
          );
        })}
      </div>

      {/* Arcade Comic Inspector Card (When a 3D Totem is Selected) */}
      {activeItem && activeDelta && activeIndex !== -1 && (
        <div className="w-full p-5 bg-slate-900/95 border-t-2 border-amber-400 transition-all z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2.5 rounded-2xl bg-slate-950 border-2 border-slate-700 shadow-inner">
                {activeItem.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-black text-xl text-white tracking-tight">{activeItem.name}</h4>
                  <span className="text-xs text-slate-400 font-medium">· {activeItem.domainName}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{activeItem.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectPriority('')}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* REAL-TIME 3D REBALANCE CONTROLLER */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Adjust in 3D (Recorded Live)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                Changes update the 3D diorama instantly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Declared Rank Adjuster */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-2">
                  <span>👑 Declared</span>
                  <span className="font-mono text-base">#{activeIndex + 1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={activeIndex === 0}
                    onClick={() => handlePromote(activeIndex)}
                    className="flex-1 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-black text-xs disabled:opacity-30 hover:bg-amber-300 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Promote</span>
                  </button>
                  <button
                    type="button"
                    disabled={activeIndex === declaredIds.length - 1}
                    onClick={() => handleDemote(activeIndex)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-black text-xs disabled:opacity-30 hover:bg-slate-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Demote</span>
                  </button>
                </div>
              </div>

              {/* Money Stack Adjuster */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2">
                  <span>💰 Money Stack</span>
                  <span className="font-mono text-base">#{activeDelta.moneyRank}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('money', activeItem.id, 'up')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Allocate more money rank"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>+ More $</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('money', activeItem.id, 'down')}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-black text-xs hover:bg-slate-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Allocate less money rank"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>- Less $</span>
                  </button>
                </div>
              </div>

              {/* Time Pillar Adjuster */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                  <span>⏱️ Time Pillar</span>
                  <span className="font-mono text-base">#{activeDelta.timeRank}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('time', activeItem.id, 'up')}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs hover:bg-cyan-300 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Allocate more calendar time"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>+ Hours</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('time', activeItem.id, 'down')}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-black text-xs hover:bg-slate-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Allocate fewer calendar hours"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>- Hours</span>
                  </button>
                </div>
              </div>

              {/* Attention Gem Adjuster */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-bold text-violet-400 mb-2">
                  <span>🧠 Mind Gem</span>
                  <span className="font-mono text-base">#{activeDelta.attentionRank}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('attention', activeItem.id, 'up')}
                    className="flex-1 py-1.5 rounded-lg bg-violet-400 text-slate-950 font-black text-xs hover:bg-violet-300 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Increase attention rank"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>+ Focus</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustResourceRank('attention', activeItem.id, 'down')}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-black text-xs hover:bg-slate-700 active:translate-y-0.5 transition-all flex items-center justify-center gap-1"
                    title="Decrease attention rank"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>- Focus</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setSwapModalIdx(activeIndex)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:text-white hover:border-amber-400 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                <span>Swap {activeItem.name} with another Priority</span>
              </button>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autosaved to Lifetime Trajectory</span>
              </span>
            </div>
          </div>

          {/* Sub-Priorities Drill-In */}
          {activeItem.subPriorities && (
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Hierarchical Sub-Priorities ({activeItem.subPriorities.length} Blocks):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {activeItem.subPriorities.map(sub => (
                  <div key={sub.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="text-xl p-1 rounded bg-slate-900 border border-slate-800">{sub.emoji}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{sub.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Signal Delta Distance: {activeDelta.totalDivergence} units
            </span>
            <button
              type="button"
              onClick={() => onExploreFriction(activeItem.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-400 border-b-4 border-amber-600 text-slate-950 font-display font-black text-xs hover:bg-amber-300 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-1.5 shadow-lg"
            >
              <span>Inspect Friction & Bust Blockers</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

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
                const isAlreadySelected = declaredIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isAlreadySelected}
                    onClick={() => handleSwapPriority(item.id)}
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
                      <span className="text-[11px] text-slate-500 font-mono">In Top 5</span>
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
    </div>
  );
};
