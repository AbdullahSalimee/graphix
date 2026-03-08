// components/ChartMorph.tsx
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const BAR_COLORS = [
  0x292524, 0x44403c, 0x57534e, 0x78716c, 0xa8a29e, 0xc4bfbb, 0xd6d3d1,
];
const DATA = [0.38, 0.71, 0.52, 0.89, 0.61, 0.95, 0.44];
const SPACING = 0.82;

export default function ChartMorph({ className = "" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0xfaf9f7, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      el.clientWidth / el.clientHeight,
      0.1,
      100,
    );
    camera.position.set(5, 4, 7);
    camera.lookAt(0, 1, 0);

    // ── Fog ───────────────────────────────────────────────────────────────────
    scene.fog = new THREE.Fog(0xfaf9f7, 14, 28);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));

    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(7, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -10;
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    scene.add(
      Object.assign(new THREE.DirectionalLight(0xfff5e0, 0.5), {
        position: new THREE.Vector3(-5, 3, -5),
      }),
    );

    // ── Ground ────────────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xf5f3f0,
        roughness: 1,
        metalness: 0,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines
    const grid = new THREE.GridHelper(12, 24, 0xe2deda, 0xe2deda);
    (grid.material as THREE.LineBasicMaterial).transparent = true;
    (grid.material as THREE.LineBasicMaterial).opacity = 0.7;
    grid.position.y = 0.001;
    scene.add(grid);

    // ── Bar columns ───────────────────────────────────────────────────────────
    const barGroup = new THREE.Group();
    scene.add(barGroup);
    const totalW = (DATA.length - 1) * SPACING;

    type BarMesh = THREE.Mesh & { _targetH: number };

    const bars: BarMesh[] = DATA.map((h, i) => {
      const targetH = h * 3.4;
      const geo = new THREE.BoxGeometry(0.52, 1, 0.52);
      // Offset geometry so it grows from bottom
      geo.translate(0, 0.5, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: BAR_COLORS[i],
        roughness: 0.5,
        metalness: 0.04,
      });
      const mesh = new THREE.Mesh(geo, mat) as BarMesh;
      mesh._targetH = targetH;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.position.x = i * SPACING - totalW / 2;
      mesh.scale.y = 0.001;
      barGroup.add(mesh);
      return mesh;
    });

    // ── Wireframe sphere ──────────────────────────────────────────────────────
    const sphereGeo = new THREE.IcosahedronGeometry(1.3, 4);
    const sphereWire = new THREE.WireframeGeometry(sphereGeo);
    const sphereMat = new THREE.LineBasicMaterial({
      color: 0x44403c,
      transparent: true,
      opacity: 0,
    });
    const sphere = new THREE.LineSegments(sphereWire, sphereMat);
    sphere.position.set(0, 1.8, 0);
    scene.add(sphere);

    // Solid inner sphere
    const innerSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshStandardMaterial({
        color: 0xf0ede9,
        roughness: 0.9,
        metalness: 0,
      }),
    );
    innerSphere.position.copy(sphere.position);
    innerSphere.scale.setScalar(0);
    scene.add(innerSphere);

    // ── Line chart dots + tube ────────────────────────────────────────────────
    const lineGroup = new THREE.Group();
    scene.add(lineGroup);
    lineGroup.visible = false;

    const linePts = DATA.map(
      (h, i) =>
        new THREE.Vector3(i * SPACING - totalW / 2, h * 2.6 + 0.15, -0.8),
    );

    const dotMeshes = linePts.map((pt) => {
      const d = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 14, 14),
        new THREE.MeshStandardMaterial({
          color: 0x1c1917,
          roughness: 0.3,
          metalness: 0.1,
        }),
      );
      d.position.copy(pt);
      d.castShadow = true;
      d.scale.setScalar(0);
      lineGroup.add(d);
      return d;
    });

    const curve = new THREE.CatmullRomCurve3(linePts);
    const tubeGeo = new THREE.TubeGeometry(curve, 80, 0.035, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.4,
      transparent: true,
      opacity: 0,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    lineGroup.add(tube);

    // Vertical drop lines from dots to ground
    const dropLines = linePts.map((pt) => {
      const pts2 = [
        new THREE.Vector3(pt.x, 0, pt.z),
        new THREE.Vector3(pt.x, pt.y, pt.z),
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(pts2);
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: 0xc4bfbb,
          transparent: true,
          opacity: 0,
        }),
      );
      lineGroup.add(line);
      return line.material as THREE.LineBasicMaterial;
    });

    // ── Phase engine ──────────────────────────────────────────────────────────
    // 0: bars grow  1: bars idle  2: bars→line  3: line idle  4: line→sphere  5: sphere spin  6: sphere→bars
    const PHASES = [1.2, 1.8, 1.0, 1.8, 1.0, 2.2, 1.0];
    let phase = 0;
    let phaseT = 0;

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      phaseT += delta / PHASES[phase];
      if (phaseT >= 1) {
        phaseT = 0;
        phase = (phase + 1) % PHASES.length;
      }

      const t = easeInOut(Math.min(phaseT, 1));

      // Slow camera drift
      camera.position.x = 5 + Math.sin(time * 0.09) * 1.5;
      camera.position.z = 7 + Math.cos(time * 0.07) * 1.0;
      camera.lookAt(0, 1.2, 0);

      // ── Phase 0: Bars grow ────────────────────────────────────────────────
      if (phase === 0) {
        barGroup.visible = true;
        lineGroup.visible = false;
        sphere.visible = false;
        innerSphere.visible = false;
        bars.forEach((b) => {
          b.scale.y = Math.max(0.001, t * b._targetH);
        });
        sphereMat.opacity = 0;
      }

      // ── Phase 1: Bars idle ────────────────────────────────────────────────
      if (phase === 1) {
        barGroup.visible = true;
        lineGroup.visible = false;
        sphere.visible = false;
        innerSphere.visible = false;
        bars.forEach((b, i) => {
          const bob = 1 + Math.sin(time * 1.4 + i * 0.8) * 0.025;
          b.scale.y = b._targetH * bob;
        });
      }

      // ── Phase 2: Bars → Line ──────────────────────────────────────────────
      if (phase === 2) {
        barGroup.visible = true;
        lineGroup.visible = true;
        sphere.visible = false;
        innerSphere.visible = false;
        bars.forEach((b) => {
          b.scale.y = Math.max(0.001, b._targetH * (1 - t));
        });
        dotMeshes.forEach((d) => {
          d.scale.setScalar(t);
        });
        tubeMat.opacity = Math.max(0, (t - 0.3) / 0.7);
        dropLines.forEach((l) => {
          l.opacity = Math.max(0, (t - 0.5) / 0.5);
        });
      }

      // ── Phase 3: Line idle ────────────────────────────────────────────────
      if (phase === 3) {
        barGroup.visible = false;
        lineGroup.visible = true;
        sphere.visible = false;
        innerSphere.visible = false;
        dotMeshes.forEach((d, i) => {
          d.scale.setScalar(1);
          d.position.y = linePts[i].y + Math.sin(time * 1.1 + i * 0.7) * 0.06;
        });
        tubeMat.opacity = 1;
        dropLines.forEach((l) => {
          l.opacity = 0.35;
        });
      }

      // ── Phase 4: Line → Sphere ────────────────────────────────────────────
      if (phase === 4) {
        barGroup.visible = false;
        lineGroup.visible = true;
        sphere.visible = true;
        innerSphere.visible = true;
        dotMeshes.forEach((d) => {
          d.scale.setScalar(Math.max(0, 1 - t * 2));
        });
        tubeMat.opacity = Math.max(0, 1 - t);
        dropLines.forEach((l) => {
          l.opacity = Math.max(0, 0.35 * (1 - t));
        });
        sphereMat.opacity = t * 0.9;
        innerSphere.scale.setScalar(t * 0.85);
      }

      // ── Phase 5: Sphere spin ──────────────────────────────────────────────
      if (phase === 5) {
        barGroup.visible = false;
        lineGroup.visible = false;
        sphere.visible = true;
        innerSphere.visible = true;
        sphereMat.opacity = 0.88;
        sphere.rotation.y = time * 0.65;
        sphere.rotation.x = Math.sin(time * 0.25) * 0.4;
        innerSphere.rotation.y = -time * 0.3;
        const pulse = 1 + Math.sin(time * 1.5) * 0.05;
        sphere.scale.setScalar(pulse);
        innerSphere.scale.setScalar(0.85 * pulse);
      }

      // ── Phase 6: Sphere → Bars ────────────────────────────────────────────
      if (phase === 6) {
        barGroup.visible = true;
        lineGroup.visible = false;
        sphere.visible = true;
        innerSphere.visible = true;
        sphereMat.opacity = Math.max(0, (1 - t) * 0.88);
        innerSphere.scale.setScalar(Math.max(0, 0.85 * (1 - t)));
        bars.forEach((b) => {
          b.scale.y = Math.max(0.001, t * b._targetH);
        });
      }

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const rafId = requestAnimationFrame(animate);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 w-full ${className}`}
    >
      {/* Heading */}
      <div className="text-center px-4">
        <h1
          className="font-black text-4xl md:text-5xl lg:text-6xl text-neutral-900 leading-none"
          style={{ letterSpacing: "-0.035em" }}
        >
          AI-Powered
          <br />
          <span className="text-neutral-400">Data Visualization</span>
        </h1>
        <p className="mt-3 text-neutral-500 text-base font-medium">
          Describe your data in plain English.{" "}
          <span className="text-neutral-800 font-semibold">
            Get beautiful charts instantly.
          </span>
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5 justify-center">
          {[
            ["▬", "Bar & Line"],
            ["◕", "Pie & Donut"],
            ["▦", "Heatmaps"],
            ["◈", "3D Charts"],
            ["⊞", "Upload CSV"],
          ].map(([icon, label]) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono bg-white border border-neutral-200 text-neutral-500 shadow-sm"
            >
              <span className="text-neutral-400 text-[10px]">{icon}</span>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Three.js canvas */}
      <div className="relative w-full max-w-[500px] mx-auto">
        {/* Corner ticks */}
        {[
          "top-0 left-0 border-t-2 border-l-2",
          "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 border-neutral-400 z-10 ${cls}`}
          />
        ))}

        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-neutral-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-neutral-200" />
            ))}
            <span className="ml-auto font-mono text-[8px] text-neutral-300 uppercase tracking-widest">
              3D Preview
            </span>
          </div>
          {/* Mount */}
          <div ref={mountRef} className="w-full" style={{ height: "300px" }} />
        </div>
      </div>
    </div>
  );
}
