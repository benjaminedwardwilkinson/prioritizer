import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 24);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);
    const sunLight = new THREE.PointLight(0xf59e0b, 3.5, 60);
    scene.add(sunLight);

    // Glowing core
    const coreGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Corona aura
    const coronaGeo = new THREE.SphereGeometry(2.8, 24, 24);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(coronaGeo, coronaMat));

    // Three Gyroscopic Resource Rings (Money = Emerald, Time = Cyan, Attention = Violet)
    // 1. Money Ring (Emerald)
    const ring1Geo = new THREE.TorusGeometry(5.2, 0.08, 16, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.85 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    // 2. Time Ring (Cyan)
    const ring2Geo = new THREE.TorusGeometry(6.6, 0.08, 16, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    // 3. Attention Ring (Violet)
    const ring3Geo = new THREE.TorusGeometry(8.0, 0.08, 16, 80);
    const ring3Mat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.85 });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.y = Math.PI / 3;
    scene.add(ring3);

    // Cosmic Dust Starfield
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.85 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    container.addEventListener('mousemove', onMouseMove);

    // Animation Loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.015;

      // Pulse core
      const pulse = 1 + Math.sin(clock * 2.5) * 0.06;
      core.scale.set(pulse, pulse, pulse);

      // Gyroscopic rotations of the three resource rings
      ring1.rotation.z += 0.012;
      ring1.rotation.y += 0.008;

      ring2.rotation.x += 0.01;
      ring2.rotation.z += 0.014;

      ring3.rotation.y += 0.015;
      ring3.rotation.x += 0.009;

      // Parallax tilt
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.05;
      camera.position.y += (10 + mouseY * 3 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-lg mx-auto h-[260px] sm:h-[300px] rounded-2xl overflow-hidden my-4 relative shadow-2xl border border-slate-800/80 bg-[#060911]"
    />
  );
};
