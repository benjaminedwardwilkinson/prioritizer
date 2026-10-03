import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Sparkles, Sliders, X, RotateCcw, Eye } from 'lucide-react';
import { sound } from '../services/sound';

export const DeepSpaceBackground3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);

  // Initialize to Hyper mode defaults
  const [strength] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('prioritizer_bloom_strength');
      return saved !== null ? parseFloat(saved) : 2.3;
    } catch {
      return 2.3;
    }
  });

  const [threshold] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('prioritizer_bloom_threshold');
      return saved !== null ? parseFloat(saved) : 0.08;
    } catch {
      return 0.08;
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) return;
    } catch {
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.0035);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 80);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // --- NINTENDO-STYLE DEEP SPACE PARTICLE LAYERS ---

    // 1. Distant Micro Stars (Deep backdrop field)
    const microCount = 1200;
    const microGeo = new THREE.BufferGeometry();
    const microPos = new Float32Array(microCount * 3);
    const microCols = new Float32Array(microCount * 3);

    for (let i = 0; i < microCount * 3; i += 3) {
      microPos[i] = (Math.random() - 0.5) * 400;
      microPos[i + 1] = (Math.random() - 0.5) * 400;
      microPos[i + 2] = (Math.random() - 0.5) * 400;

      const r = Math.random();
      if (r < 0.25) {
        microCols[i] = 0.98; microCols[i + 1] = 0.82; microCols[i + 2] = 0.35; // gold
      } else if (r < 0.5) {
        microCols[i] = 0.35; microCols[i + 1] = 0.85; microCols[i + 2] = 0.98; // cyan
      } else if (r < 0.75) {
        microCols[i] = 0.78; microCols[i + 1] = 0.55; microCols[i + 2] = 0.98; // violet
      } else {
        microCols[i] = 0.95; microCols[i + 1] = 0.95; microCols[i + 2] = 1.0;  // star white
      }
    }
    microGeo.setAttribute('position', new THREE.BufferAttribute(microPos, 3));
    microGeo.setAttribute('color', new THREE.BufferAttribute(microCols, 3));
    const microMat = new THREE.PointsMaterial({
      size: 0.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const microStars = new THREE.Points(microGeo, microMat);
    scene.add(microStars);

    // 2. Foreground Floating Star Gems / Mario Galaxy Star Bits
    const bitCount = 90;
    const bitGeo = new THREE.BufferGeometry();
    const bitPos = new Float32Array(bitCount * 3);
    const bitCols = new Float32Array(bitCount * 3);

    for (let j = 0; j < bitCount * 3; j += 3) {
      bitPos[j] = (Math.random() - 0.5) * 200;
      bitPos[j + 1] = (Math.random() - 0.5) * 200;
      bitPos[j + 2] = (Math.random() - 0.5) * 140;

      const pick = Math.random();
      if (pick < 0.33) {
        bitCols[j] = 0.96; bitCols[j + 1] = 0.75; bitCols[j + 2] = 0.20; // shiny amber gold
      } else if (pick < 0.66) {
        bitCols[j] = 0.20; bitCols[j + 1] = 0.90; bitCols[j + 2] = 0.85; // emerald/cyan bit
      } else {
        bitCols[j] = 0.98; bitCols[j + 1] = 0.35; bitCols[j + 2] = 0.55; // cherry magenta bit
      }
    }
    bitGeo.setAttribute('position', new THREE.BufferAttribute(bitPos, 3));
    bitGeo.setAttribute('color', new THREE.BufferAttribute(bitCols, 3));
    const bitMat = new THREE.PointsMaterial({
      size: 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starBits = new THREE.Points(bitGeo, bitMat);
    scene.add(starBits);

    // 3. Gentle Stylized Floating Star Crystals (Low-poly octahedrons)
    const crystalsGroup = new THREE.Group();
    scene.add(crystalsGroup);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45,
    });

    const crystalMeshes: THREE.Mesh[] = [];
    for (let c = 0; c < 14; c++) {
      const cGeo = new THREE.OctahedronGeometry(Math.random() * 1.5 + 0.8);
      const mesh = new THREE.Mesh(cGeo, crystalMat);
      mesh.position.set(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 120,
        (Math.random() - 0.5) * 80 - 20
      );
      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatY: mesh.position.y,
        speed: Math.random() * 0.01 + 0.005,
      };
      crystalsGroup.add(mesh);
      crystalMeshes.push(mesh);
    }

    // Soft Ambient Light for Star Crystals
    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xfbbf24, 1.2);
    dirLight.position.set(30, 50, 40);
    scene.add(dirLight);

    // --- POSTPROCESSING: UNREAL ENGINE-STYLE BLOOM PASS ---
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Instantiate Bloom Pass with current strength and threshold values
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      strength,
      0.65, // radius
      threshold
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;

    // Interactive Mouse / Gyro Parallax
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      targetX = ((e.clientX / window.innerWidth) - 0.5) * 12;
      targetY = -(((e.clientY / window.innerHeight) - 0.5) * 12);
    };
    window.addEventListener('mousemove', handlePointerMove);

    // Render / Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.01;

      // Smooth camera parallax
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      camera.position.x = currentX;
      camera.position.y = currentY;
      camera.lookAt(0, 0, 0);

      // Slow majestic cosmic rotation
      microStars.rotation.y += 0.0003;
      microStars.rotation.x += 0.0001;

      starBits.rotation.y -= 0.0006;
      starBits.rotation.z += 0.0003;

      // Twinkle pulsation
      const twinkle = 0.7 + Math.sin(clock * 2) * 0.15;
      starBits.material.opacity = twinkle;

      // Floating star crystals
      crystalMeshes.forEach(mesh => {
        mesh.rotation.x += mesh.userData.rotSpeedX;
        mesh.rotation.y += mesh.userData.rotSpeedY;
        mesh.position.y = mesh.userData.floatY + Math.sin(clock * 1.5 + mesh.position.x) * 2.0;
      });

      // Post-processing bloom render
      composer.render();
    };
    animate();

    const handleResize = () => {
      if (!renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      composer.dispose();
      renderer.dispose();
      bloomPassRef.current = null;
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update bloom pass in real-time when slider values change
  const handleStrengthChange = (val: number) => {
    setStrength(val);
    if (bloomPassRef.current) {
      bloomPassRef.current.strength = val;
    }
    try {
      localStorage.setItem('prioritizer_bloom_strength', val.toString());
    } catch {
      // ignore
    }
  };

  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    if (bloomPassRef.current) {
      bloomPassRef.current.threshold = val;
    }
    try {
      localStorage.setItem('prioritizer_bloom_threshold', val.toString());
    } catch {
      // ignore
    }
  };

  const applyPreset = (presetStrength: number, presetThreshold: number) => {
    sound.playCoin();
    handleStrengthChange(presetStrength);
    handleThresholdChange(presetThreshold);
  };

  return (
    <>
      {/* Three.js Background Canvas with Hyper Bloom Glow */}
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-gradient-to-b from-[#050811] via-[#090d1c] to-[#04060d]"
        aria-hidden="true"
      />
    </>
  );
};
