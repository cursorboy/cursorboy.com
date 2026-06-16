"use client";

import { useEffect, useRef } from "react";

/**
 * The reel's 3D centerpiece. A low-poly ink icosahedron (solid + edge cage)
 * sitting in a slow particle field. It scrubs its rotation with the reel's
 * scroll progress and lerps its colour toward the hovered project's accent —
 * the colour wash, extended into WebGL.
 *
 * State is passed by ref so the parent can update progress/accent every frame
 * without re-rendering this component. Three.js is loaded with a browser-only
 * dynamic import, so it never runs on the server and is fully code-split.
 */
export type ReelCoreState = { progress: number; accent: string | null };

export default function ReelCore({
  stateRef,
}: {
  stateRef: React.MutableRefObject<ReelCoreState>;
}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed || !mountRef.current) return;

      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(0, 0, 6.4);

      // Bail gracefully if WebGL is unavailable (no GPU, blocked context, etc.)
      // so the rest of the page renders without console noise or a dead canvas.
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
        });
      } catch {
        return;
      }
      renderer.setClearColor(0x000000, 0);
      el.appendChild(renderer.domElement);

      // pull the current ink colour out of the theme so we match light/dark
      const readInk = () =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--ink")
          .trim() || "#16130f";
      let inkHex = readInk();

      const cur = new THREE.Color(inkHex);
      const target = new THREE.Color(inkHex);

      const group = new THREE.Group();
      scene.add(group);

      const solidGeo = new THREE.IcosahedronGeometry(1.7, 1);
      const solidMat = new THREE.MeshStandardMaterial({
        color: cur,
        roughness: 0.4,
        metalness: 0.12,
        flatShading: true,
        transparent: true,
        opacity: 0.9,
      });
      const solid = new THREE.Mesh(solidGeo, solidMat);
      group.add(solid);

      const cageGeo = new THREE.EdgesGeometry(
        new THREE.IcosahedronGeometry(1.78, 1),
      );
      const cageMat = new THREE.LineBasicMaterial({
        color: cur,
        transparent: true,
        opacity: 0.28,
      });
      const cage = new THREE.LineSegments(cageGeo, cageMat);
      group.add(cage);

      // particle field — fewer on small canvases
      const compact = el.clientWidth < 720;
      const COUNT = reduce ? 0 : compact ? 520 : 1500;
      let pointsMat: import("three").PointsMaterial | null = null;
      let points: import("three").Points | null = null;
      if (COUNT > 0) {
        const pos = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
          const r = 4 + Math.random() * 7;
          const th = Math.random() * Math.PI * 2;
          const ph = Math.acos(2 * Math.random() - 1);
          pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
          pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
          pos[i * 3 + 2] = r * Math.cos(ph);
        }
        const pg = new THREE.BufferGeometry();
        pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        pointsMat = new THREE.PointsMaterial({
          color: cur,
          size: compact ? 0.03 : 0.024,
          transparent: true,
          opacity: 0.5,
          sizeAttenuation: true,
        });
        points = new THREE.Points(pg, pointsMat);
        scene.add(points);
      }

      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(5, 6, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.7);
      rim.position.set(-6, -3, -4);
      scene.add(rim);

      const resize = () => {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      // re-read ink when the site theme toggles
      const onTheme = () => {
        inkHex = readInk();
      };
      window.addEventListener("theme:change", onTheme);

      let visible = !document.hidden;
      const onVis = () => {
        visible = !document.hidden;
      };
      document.addEventListener("visibilitychange", onVis);

      const clock = new THREE.Clock();
      let raf = 0;
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const t = clock.getElapsedTime();
        const { progress: p, accent } = stateRef.current;

        group.rotation.y = p * Math.PI * 4 + t * 0.12;
        group.rotation.x = Math.sin(p * Math.PI * 2) * 0.5 + t * 0.04;
        const s = 1 + Math.sin(t * 0.8) * 0.015;
        group.scale.setScalar(s);
        if (points) points.rotation.y = -t * 0.02;

        target.set(accent ?? inkHex);
        cur.lerp(target, 0.07);
        solidMat.color.copy(cur);
        cageMat.color.copy(cur);
        if (pointsMat) pointsMat.color.copy(cur);

        camera.position.x = Math.sin(p * Math.PI) * 0.6;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };

      if (reduce) {
        renderer.render(scene, camera);
      } else {
        frame();
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        window.removeEventListener("theme:change", onTheme);
        document.removeEventListener("visibilitychange", onVis);
        solidGeo.dispose();
        solidMat.dispose();
        cageGeo.dispose();
        cageMat.dispose();
        if (points) {
          points.geometry.dispose();
          (points.material as import("three").Material).dispose();
        }
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [stateRef]);

  return <div className="reelCanvas" ref={mountRef} aria-hidden />;
}
