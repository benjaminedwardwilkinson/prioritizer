import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CalculatedDeltas } from '../services/insightEngine';
import { getPriorityById } from '../data/ontology';
import { sound } from '../services/sound';
import { Sparkles, ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, Play, Pause, Layers, Compass, X } from 'lucide-react';

interface Props {
  deltas: CalculatedDeltas[];
  onSelectPriority: (priorityId: string) => void;
  selectedPriorityId: string | null;
  onExploreFriction: (priorityId: string) => void;
}

// Procedural Canvas Texture Generator for distinct planet biospheres
function generatePlanetTexture(colorHex: string, patternType: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const baseCol = colorHex;
  ctx.fillStyle = baseCol;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Surface bands and atmospheric patterns
  for (let i = 0; i < 16; i++) {
    const y = (i / 16) * canvas.height;
    const bandH = Math.random() * 24 + 10;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, y + bandH / 2, canvas.width / 2, bandH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Continental / swirling storms
  ctx.fillStyle = patternType % 2 === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(245, 158, 11, 0.2)';
  for (let j = 0; j < 25; j++) {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * canvas.height;
    const cr = Math.random() * 35 + 10;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Sprite for Billboard Labels in 3D
function createLabelSprite(emoji: string, name: string): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.roundRect(10, 10, 236, 60, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '28px sans-serif';
  ctx.fillText(emoji, 24, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(name.length > 14 ? name.substring(0, 13) + '…' : name, 64, 48);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(4.2, 1.4, 1);
  return sprite;
}

export const UniverseScene: React.FC<Props> = ({
  deltas,
  onSelectPriority,
  selectedPriorityId,
  onExploreFriction,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredPriority, setHoveredPriority] = useState<string | null>(null);

  const activeItem = selectedPriorityId ? getPriorityById(selectedPriorityId) : null;
  const activeDelta = selectedPriorityId ? deltas.find(d => d.priorityId === selectedPriorityId) : null;

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetsGroupRef = useRef<THREE.Group | null>(null);
  const raysGroupRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mousePosRef = useRef<THREE.Vector2>(new THREE.Vector2());

  // Interactive interaction states
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotRef = useRef({ x: 0.35, y: 0 });
  const targetCamDistRef = useRef(34);
  const currentCamDistRef = useRef(34);

  const planetNodesRef = useRef<{
    id: string;
    mesh: THREE.Mesh;
    halo: THREE.Mesh;
    sprite: THREE.Sprite;
    moons: THREE.Mesh[];
    baseAngle: number;
    radius: number;
    speed: number;
  }[]>([]);

  // Setup Three.js scene
  useEffect(() => {
    if (!containerRef.current || viewMode !== '3d') return;

    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        setViewMode('2d');
        return;
      }
    } catch {
      setWebGLSupported(false);
      setViewMode('2d');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);
    scene.fog = new THREE.FogExp2(0x060911, 0.012);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 26, 44);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const centralSunLight = new THREE.PointLight(0xfbbf24, 3.5, 90, 1.2);
    centralSunLight.position.set(0, 0, 0);
    scene.add(centralSunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(20, 40, 20);
    scene.add(rimLight);

    // Central Stellar Core (Declared Center of Gravity)
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    const coreGeo = new THREE.SphereGeometry(2.6, 36, 36);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      roughness: 0.15,
      metalness: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    sunGroup.add(coreMesh);

    // Glowing Corona Halo around Core
    const coronaGeo = new THREE.SphereGeometry(3.3, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunGroup.add(coronaMesh);

    // Cosmic Dust & Stellar Particle Clouds (350 stars + dust field)
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160;
      starPos[i + 1] = (Math.random() - 0.5) * 160;
      starPos[i + 2] = (Math.random() - 0.5) * 160;

      // Color variation between cyan, amber, and indigo
      const rnd = Math.random();
      if (rnd < 0.33) {
        starCols[i] = 0.96; starCols[i + 1] = 0.75; starCols[i + 2] = 0.25; // amber
      } else if (rnd < 0.66) {
        starCols[i] = 0.25; starCols[i + 1] = 0.85; starCols[i + 2] = 0.95; // cyan
      } else {
        starCols[i] = 0.75; starCols[i + 1] = 0.65; starCols[i + 2] = 0.95; // violet
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));
    const starMat = new THREE.PointsMaterial({ size: 0.85, vertexColors: true, transparent: true, opacity: 0.75 });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Planets Group & Resource Vector Rays Group
    const planetsGroup = new THREE.Group();
    planetsGroupRef.current = planetsGroup;
    scene.add(planetsGroup);

    const raysGroup = new THREE.Group();
    raysGroupRef.current = raysGroup;
    scene.add(raysGroup);

    planetNodesRef.current = [];

    // Construct 3D Celestial Bodies & Orbital System
    deltas.forEach((d, idx) => {
      const radius = 5.0 + idx * 2.2;

      // 1. Orbital Ring
      const orbitCurve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
      const points = orbitCurve.getPoints(80);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(
        points.map(p => new THREE.Vector3(p.x, 0, p.y))
      );
      const isHighGap = d.totalDivergence >= 4;
      const orbitMat = new THREE.LineBasicMaterial({
        color: isHighGap ? 0xf43f5e : 0x334155,
        transparent: true,
        opacity: isHighGap ? 0.65 : 0.35,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      planetsGroup.add(orbitLine);

      // 2. Planet Mesh with Procedural Surface Texture
      const planetSize = Math.max(0.75, 1.3 - idx * 0.05);
      const planetGeo = new THREE.SphereGeometry(planetSize, 32, 32);
      const planetTexture = generatePlanetTexture(d.color, idx);
      const planetMat = new THREE.MeshStandardMaterial({
        map: planetTexture,
        roughness: 0.35,
        metalness: 0.25,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);
      planetMesh.userData = { id: d.priorityId, name: d.name, emoji: d.emoji };

      const baseAngle = (idx / deltas.length) * Math.PI * 2;
      planetMesh.position.set(Math.cos(baseAngle) * radius, 0, Math.sin(baseAngle) * radius);
      planetsGroup.add(planetMesh);

      // 3. Atmospheric Glow Ring / Corona
      const haloGeo = new THREE.SphereGeometry(planetSize * 1.25, 24, 24);
      const haloMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(d.color),
        transparent: true,
        opacity: 0.22,
        side: THREE.BackSide,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.copy(planetMesh.position);
      planetsGroup.add(haloMesh);

      // 4. Saturn-like Planetary Rings if Priority Gap exists
      if (isHighGap) {
        const ringGeo = new THREE.RingGeometry(planetSize * 1.4, planetSize * 2.1, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        });
        const disc = new THREE.Mesh(ringGeo, ringMat);
        disc.rotation.x = Math.PI / 2.4;
        planetMesh.add(disc);
      }

      // 5. Orbiting Sub-Priority Miniature Moons
      const item = getPriorityById(d.priorityId);
      const moons: THREE.Mesh[] = [];
      const subCount = item?.subPriorities?.length || 2;
      for (let m = 0; m < subCount; m++) {
        const moonGeo = new THREE.SphereGeometry(0.24, 16, 16);
        const moonMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          roughness: 0.5,
        });
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.userData = { moonDist: planetSize + 0.8 + m * 0.45, moonSpeed: 0.025 + m * 0.015, moonAngle: m * 1.8 };
        planetMesh.add(moonMesh);
        moons.push(moonMesh);
      }

      // 6. Floating 3D Billboard Label
      const sprite = createLabelSprite(d.emoji, d.name);
      sprite.position.set(planetMesh.position.x, planetMesh.position.y + planetSize + 1.2, planetMesh.position.z);
      planetsGroup.add(sprite);

      planetNodesRef.current.push({
        id: d.priorityId,
        mesh: planetMesh,
        halo: haloMesh,
        sprite,
        moons,
        baseAngle,
        radius,
        speed: 0.0028 / (idx + 1),
      });
    });

    // 7. Volumetric Resource Vector Beams Connecting Center to Planets
    // Gold: Declared, Emerald: Money, Cyan: Time, Violet: Attention
    deltas.forEach(d => {
      const node = planetNodesRef.current.find(n => n.id === d.priorityId);
      if (!node) return;

      const beamCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(node.mesh.position.x * 0.5, 0.5, node.mesh.position.z * 0.5),
        new THREE.Vector3(node.mesh.position.x, 0, node.mesh.position.z),
      ]);
      const tubeGeo = new THREE.TubeGeometry(beamCurve, 20, 0.04, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(d.color),
        transparent: true,
        opacity: 0.35,
      });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      raysGroup.add(tube);
    });

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.015;

      // Pulse central core
      const pulse = 1 + Math.sin(clock * 2) * 0.05;
      coreMesh.scale.set(pulse, pulse, pulse);
      coronaMesh.scale.set(pulse * 1.05, pulse * 1.05, pulse * 1.05);

      // Auto-rotation if enabled and not actively dragging
      if (autoRotate && !isDraggingRef.current) {
        rotRef.current.y += 0.0018;
      }

      // Smooth camera distance interpolation (zoom smoothing)
      currentCamDistRef.current += (targetCamDistRef.current - currentCamDistRef.current) * 0.08;
      if (cameraRef.current) {
        const ratio = currentCamDistRef.current / 34;
        cameraRef.current.position.set(0, 18 * ratio, 34 * ratio);
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Planetary orbits and rotations
      planetNodesRef.current.forEach(item => {
        item.baseAngle += item.speed;
        const px = Math.cos(item.baseAngle) * item.radius;
        const pz = Math.sin(item.baseAngle) * item.radius;

        item.mesh.position.x = px;
        item.mesh.position.z = pz;
        item.mesh.rotation.y += 0.012;

        item.halo.position.x = px;
        item.halo.position.z = pz;

        item.sprite.position.x = px;
        item.sprite.position.z = pz;

        // Animate sub-priority moons orbiting planet
        item.moons.forEach(m => {
          const ud = m.userData;
          ud.moonAngle += ud.moonSpeed;
          m.position.set(Math.cos(ud.moonAngle) * ud.moonDist, Math.sin(ud.moonAngle * 0.5) * 0.3, Math.sin(ud.moonAngle) * ud.moonDist);
        });
      });

      // Apply rotation to world group
      if (planetsGroupRef.current) {
        planetsGroupRef.current.rotation.y = rotRef.current.y;
        planetsGroupRef.current.rotation.x = rotRef.current.x;
      }
      if (raysGroupRef.current) {
        raysGroupRef.current.rotation.y = rotRef.current.y;
        raysGroupRef.current.rotation.x = rotRef.current.x;
      }

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
  }, [deltas, viewMode, isFullscreen, autoRotate]);

  // Raycasting for direct 3D Click & Hover on Planets
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mousePosRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isDraggingRef.current) {
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;
      rotRef.current.y += dx * 0.007;
      rotRef.current.x = Math.max(-0.2, Math.min(1.15, rotRef.current.x + dy * 0.007));
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Hover detection
      raycasterRef.current.setFromCamera(mousePosRef.current, cameraRef.current);
      const meshes = planetNodesRef.current.map(p => p.mesh);
      const intersects = raycasterRef.current.intersectObjects(meshes, false);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.id;
        if (hitId !== hoveredPriority) {
          setHoveredPriority(hitId);
          sound.playTick();
        }
      } else {
        if (hoveredPriority) setHoveredPriority(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // Check if it was a quick click rather than a long drag
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const meshes = planetNodesRef.current.map(p => p.mesh);
    const intersects = raycasterRef.current.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const selectedId = intersects[0].object.userData.id;
      sound.playChime(500, 'sine', 0.25);
      onSelectPriority(selectedId);
    }
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    targetCamDistRef.current = Math.max(16, Math.min(55, targetCamDistRef.current + e.deltaY * 0.03));
  };

  const zoomIn = () => {
    sound.playTick();
    targetCamDistRef.current = Math.max(16, targetCamDistRef.current - 6);
  };

  const zoomOut = () => {
    sound.playTick();
    targetCamDistRef.current = Math.min(55, targetCamDistRef.current + 6);
  };

  const resetView = () => {
    sound.playChime(440, 'sine', 0.2);
    rotRef.current = { x: 0.35, y: 0 };
    targetCamDistRef.current = 34;
  };

  return (
    <div
      className={`relative w-full flex flex-col items-center select-none overflow-hidden rounded-2xl border border-slate-800 bg-[#060911] shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      {/* Top 3D Control HUD Bar */}
      <div className="w-full flex items-center justify-between p-3.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-display font-extrabold text-sm tracking-wide text-slate-100">
            YOUR PRIORITY UNIVERSE
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            · 3D Volumetric Orbits & Celestial Vector Rays
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Cinema Orbit Auto-Rotate toggle */}
          {viewMode === '3d' && (
            <button
              type="button"
              onClick={() => {
                sound.playTick();
                setAutoRotate(!autoRotate);
              }}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                autoRotate
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={autoRotate ? 'Pause Cinema Rotation' : 'Enable Cinema Orbit'}
            >
              {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{autoRotate ? 'Orbiting' : 'Paused'}</span>
            </button>
          )}

          {/* 3D vs 2D Switcher */}
          {webGLSupported && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode('3d');
                  sound.playTick();
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === '3d'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                3D World
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('2d');
                  sound.playTick();
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  viewMode === '2d'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2D Radar
              </button>
            </div>
          )}

          {/* Zoom & Reset Controls */}
          {viewMode === '3d' && (
            <>
              <button
                type="button"
                onClick={zoomIn}
                title="Zoom In"
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={zoomOut}
                title="Zoom Out"
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={resetView}
                title="Reset Camera Angle"
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Cinema View' : 'Cinema Fullscreen View'}
                className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main 3D Canvas / 2D Viewport */}
      {viewMode === '3d' ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className={`w-full relative cursor-grab active:cursor-grabbing ${
            isFullscreen ? 'flex-1' : 'h-[440px] sm:h-[520px]'
          }`}
        >
          {/* Interactive Navigation HUD Overlay */}
          <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 pointer-events-none flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80 backdrop-blur z-10 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Drag to rotate · Scroll to zoom · Tap 3D planet directly to inspect moons & stats</span>
          </div>

          {/* Hover Indicator Card in 3D */}
          {hoveredPriority && (
            <div className="absolute top-3 left-3 pointer-events-none bg-slate-950/90 border border-amber-400/50 p-2 rounded-xl backdrop-blur text-xs flex items-center gap-2 shadow-xl animate-in fade-in duration-150 z-10">
              <span className="text-xl">{getPriorityById(hoveredPriority)?.emoji}</span>
              <div>
                <div className="font-bold text-slate-100">{getPriorityById(hoveredPriority)?.name}</div>
                <div className="text-[10px] text-amber-400 font-mono">Tap planet to inspect</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2D Accessible Constellation Radar Fallback */
        <div className="w-full p-4 flex flex-col items-center">
          <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center my-2">
            <div className="absolute w-[92%] h-[92%] rounded-full border border-dashed border-slate-800" />
            <div className="absolute w-[74%] h-[74%] rounded-full border border-dashed border-slate-800" />
            <div className="absolute w-[56%] h-[56%] rounded-full border border-dashed border-slate-800" />
            <div className="absolute w-[38%] h-[38%] rounded-full border border-dashed border-slate-800" />

            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-xl font-bold">
              ☀️
            </div>

            {deltas.map((d, idx) => {
              const angle = (idx / deltas.length) * Math.PI * 2 - Math.PI / 2;
              const dist = 32 + idx * 13;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;
              const isSelected = selectedPriorityId === d.priorityId;

              return (
                <button
                  key={d.priorityId}
                  type="button"
                  onClick={() => {
                    sound.playChime(d.declaredRank * 110 + 220, 'sine', 0.25);
                    onSelectPriority(d.priorityId);
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    borderColor: d.color,
                  }}
                  className={`absolute z-20 flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all ${
                    isSelected
                      ? 'scale-125 ring-4 ring-amber-400/50 shadow-lg shadow-cyan-500/30'
                      : 'hover:scale-110 shadow-md'
                  } bg-slate-900`}
                >
                  <span className="text-xl">{d.emoji}</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs text-slate-400">Radar projection: #1 innermost, #5 outermost orbit</span>
        </div>
      )}

      {/* Quick Priority Selector Strip */}
      <div className="w-full px-3 py-2 bg-slate-950/85 border-t border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar z-20">
        {deltas.map(d => {
          const isSelected = selectedPriorityId === d.priorityId;
          return (
            <button
              key={d.priorityId}
              type="button"
              onClick={() => {
                sound.playChime(220 + d.declaredRank * 80, 'sine', 0.25);
                onSelectPriority(d.priorityId);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-amber-400 text-white font-bold shadow'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className="text-base">{d.emoji}</span>
              <span className="text-xs font-semibold">{d.name}</span>
              <span className="text-[10px] text-amber-400 font-mono">#{d.declaredRank}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Detail Drawer when Priority is Selected */}
      {activeItem && activeDelta && (
        <div className="w-full p-5 bg-slate-900 border-t border-amber-400/30 transition-all z-20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl p-2.5 rounded-2xl bg-slate-950 border border-slate-700">
                {activeItem.emoji}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-extrabold text-lg text-white">{activeItem.name}</h4>
                  <span className="text-xs text-slate-400">· {activeItem.domainName}</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 max-w-xl">{activeItem.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectPriority('')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4 Signals Bar Chart (No Pills!) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-slate-800">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>❤️ Declared Priority</span>
                <span className="text-amber-400 font-bold font-mono">#{activeDelta.declaredRank}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full"
                  style={{ width: `${(6 - activeDelta.declaredRank) * 20}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>💰 Money Allocation</span>
                <span className="text-emerald-400 font-bold font-mono">#{activeDelta.moneyRank}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${(6 - activeDelta.moneyRank) * 20}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>⏱️ Calendar Hours</span>
                <span className="text-cyan-400 font-bold font-mono">#{activeDelta.timeRank}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${(6 - activeDelta.timeRank) * 20}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
                <span>🧠 Mind Attention</span>
                <span className="text-violet-400 font-bold font-mono">#{activeDelta.attentionRank}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-violet-400 h-full rounded-full"
                  style={{ width: `${(6 - activeDelta.attentionRank) * 20}%` }}
                />
              </div>
            </div>
          </div>

          {/* Hierarchical Sub-Priorities (3D Orbiting Moons Breakdown) */}
          {activeItem.subPriorities && (
            <div className="mt-4">
              <div className="text-xs font-bold text-slate-200 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Orbiting Sub-Priority Satellites ({activeItem.subPriorities.length} Moons in 3D Space):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                {activeItem.subPriorities.map(sub => (
                  <div
                    key={sub.id}
                    className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start gap-2"
                  >
                    <span className="text-xl p-1 rounded bg-slate-900 border border-slate-800">{sub.emoji}</span>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 leading-snug">{sub.name}</div>
                      <div className="text-[10px] text-slate-400 leading-normal mt-0.5">{sub.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Total Divergence Index: {activeDelta.totalDivergence} points
            </span>
            <button
              type="button"
              onClick={() => onExploreFriction(activeItem.id)}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-display font-extrabold text-xs hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <span>Explore Friction & Blocker Analysis</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
