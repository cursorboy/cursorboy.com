"use client";

import { useEffect, useRef } from "react";
import { sampleLines, type Pt } from "@/lib/textPoints";

/**
 * The name as one cohesive field of tiny cursor-arrows. Every arrow points at
 * the mouse. On load each arrow flies in from off-SCREEN (its own direction).
 * Drawn on a full-viewport canvas so the fly-in spans the whole page; an
 * in-flow placeholder reserves the name's layout box. Canvas-only.
 */
export default function NameLetters() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // first home visit of the session → fly in. Back-nav → appear in place.
    const entrance =
      !reduce && document.documentElement.classList.contains("intro-first");
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let pts: Pt[] = [];
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let flyX = new Float32Array(0); // start offset from target (viewport space)
    let flyY = new Float32Array(0);
    let delay = new Float32Array(0);
    let phase = new Float32Array(0);
    let bx = new Float32Array(0); // rave blast offset (springs back)
    let by = new Float32Array(0);
    let bvx = new Float32Array(0);
    let bvy = new Float32Array(0);
    let scx = new Float32Array(0); // ripple disturbance offset (springs home)
    let scy = new Float32Array(0);
    let scvx = new Float32Array(0); // its velocity → arrows visibly travel + wander
    let scvy = new Float32Array(0);
    let shapeX = new Float32Array(0); // idle shape-shift target (name-local)
    let shapeY = new Float32Array(0);
    let fromX = new Float32Array(0); // say-morph: where each cursor starts from
    let fromY = new Float32Array(0);
    let sayMp = new Float32Array(0); // say-morph progress per cursor (0→1)
    let curve = new Float32Array(0); // per-cursor arc magnitude for curved paths
    let curve2 = new Float32Array(0); // second arc axis → looping, non-linear
    let mp = new Float32Array(0); // per-cursor morph progress (independent)
    let speedMul = new Float32Array(0); // per-cursor travel speed (varied)
    let nameW = 0;
    let nameH = 0;
    let rgb = "22,19,15";
    let start = 0;
    let raf = 0;
    let raveT = 0; // ms remaining of rave glow
    // pond ripples: expanding rings that kick each cursor as the front reaches it
    let ripples: {
      x: number;
      y: number;
      start: number;
      strength: number;
      hit: Uint8Array;
    }[] = [];
    let morph = 0; // 0 = name, 1 = idle shape
    let morphTarget = 0;
    let idleState: "name" | "toShape" | "hold" | "toName" = "name";
    let holdStart = 0;
    let lastMove = 0;
    let saying = false; // cutout is speaking → cursors hold the spoken text
    let melting = false; // animating the spoken text back to the name
    let hushAt = 0;
    let shapeIdx = -1;
    const SHAPES = [
      "builder",
      "chess player",
      "math guy",
      "engineer",
      "eagle scout",
    ];
    const mouse = { x: 0, y: 0 };

    const glyph = document.createElement("canvas");
    const GS = 14;
    function makeGlyph() {
      glyph.width = GS * dpr;
      glyph.height = GS * dpr;
      const gg = glyph.getContext("2d");
      if (!gg) return;
      gg.setTransform(dpr, 0, 0, dpr, 0, 0);
      gg.clearRect(0, 0, GS, GS);
      gg.fillStyle = `rgb(${rgb})`;
      gg.translate(GS / 2, GS / 2);
      gg.beginPath();
      gg.moveTo(5.6, 0);
      gg.lineTo(-4.3, -3.9);
      gg.lineTo(-1.6, 0);
      gg.lineTo(-4.3, 3.9);
      gg.closePath();
      gg.fill();
    }
    function readColor() {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--particle")
        .trim();
      if (v) rgb = v;
      makeGlyph();
    }

    function build() {
      if (!wrap || !canvas) return;
      const boxW = wrap.clientWidth;
      const lines = boxW < 820 ? ["piam", "parekh"] : ["piam parekh"];
      const res = sampleLines(lines, boxW, {
        weight: 800,
        step: boxW < 820 ? 6 : 8,
        maxFont: 260,
        maxPoints: boxW < 820 ? 4000 : 6500,
      });
      pts = res.points.sort((a, b) => a.x - b.x);
      const n = pts.length;
      ox = new Float32Array(n);
      oy = new Float32Array(n);
      flyX = new Float32Array(n);
      flyY = new Float32Array(n);
      delay = new Float32Array(n);
      phase = new Float32Array(n);
      bx = new Float32Array(n);
      by = new Float32Array(n);
      bvx = new Float32Array(n);
      bvy = new Float32Array(n);
      shapeX = new Float32Array(n);
      shapeY = new Float32Array(n);
      curve = new Float32Array(n);
      curve2 = new Float32Array(n);
      mp = new Float32Array(n);
      speedMul = new Float32Array(n);
      fromX = new Float32Array(n);
      fromY = new Float32Array(n);
      sayMp = new Float32Array(n);
      scx = new Float32Array(n);
      scy = new Float32Array(n);
      scvx = new Float32Array(n);
      scvy = new Float32Array(n);
      nameW = res.w;
      nameH = res.h;

      // reserve the name's layout box
      wrap.style.height = `${res.h}px`;

      // full-viewport canvas so off-screen fly-in is visible the whole way
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeGlyph();

      // each arrow starts beyond the viewport edges, its own direction
      const wb = wrap.getBoundingClientRect();
      const diag = Math.hypot(vw, vh);
      for (let i = 0; i < n; i++) {
        const targetX = wb.left + pts[i].x;
        const targetY = wb.top + pts[i].y;
        const a = Math.random() * Math.PI * 2;
        const r = diag * 0.6 + Math.random() * diag * 0.5;
        const sx = vw / 2 + Math.cos(a) * r;
        const sy = vh / 2 + Math.sin(a) * r;
        flyX[i] = sx - targetX;
        flyY[i] = sy - targetY;
        delay[i] = Math.random() * 750;
        phase[i] = (pts[i].x + pts[i].y) * 0.02 + Math.random() * 6.28;
      }
      start = performance.now();
    }

    // sample an idle word into shapeX/shapeY, placed at a random spot anywhere
    // on the page (the cursors travel there to spell it)
    function loadShape(idx: number) {
      if (!wrap) return;
      const ch = SHAPES[((idx % SHAPES.length) + SHAPES.length) % SHAPES.length];
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const res = sampleLines([ch], Math.min(vw * 0.62, 820), {
        weight: 800,
        step: 6,
        maxFont: 320,
        maxPoints: pts.length,
      });
      if (!res.points.length) return;
      // pick a viewport anchor for the word's top-left, keeping it on screen
      const m = Math.min(vw, vh) * 0.07;
      const vx = m + Math.random() * Math.max(1, vw - res.w - m * 2);
      const vy = m + Math.random() * Math.max(1, vh - res.h - m * 2);
      const wb = wrap.getBoundingClientRect();
      const offX = vx - wb.left; // name-local → lands at the viewport anchor
      const offY = vy - wb.top;
      for (let i = 0; i < pts.length; i++) {
        const sp = res.points[i % res.points.length];
        shapeX[i] = sp.x + offX;
        shapeY[i] = sp.y + offY;
        // each cursor arcs by its own amount/side on two axes → loopy paths
        curve[i] = (Math.random() * 2 - 1) * (110 + Math.random() * 240);
        curve2[i] = (Math.random() * 2 - 1) * (55 + Math.random() * 130);
        // and travels at its own pace → arrive scattered, but close enough that
        // the word still forms and gets to sit
        speedMul[i] = 0.75 + Math.random() * 0.55;
      }
    }

    // morph the cursors into an arbitrary line, centered on the name's own box
    // so it reads "in place". Snappier than the idle drift. Reports the target
    // box so the speech bubble can wrap around the cursors.
    function loadText(text: string, withBubble = true) {
      if (!wrap) return;
      const boxW = wrap.clientWidth;
      const res = sampleLines([text], Math.min(boxW, 900), {
        weight: 800,
        step: boxW < 820 ? 6 : 8,
        maxFont: 190,
        maxPoints: pts.length,
      });
      if (!res.points.length) return;
      const offX = (nameW - res.w) / 2;
      const offY = (nameH - res.h) / 2;
      for (let i = 0; i < pts.length; i++) {
        const sp = res.points[i % res.points.length];
        shapeX[i] = sp.x + offX;
        shapeY[i] = sp.y + offY;
        curve[i] = (Math.random() * 2 - 1) * (28 + Math.random() * 60);
        curve2[i] = (Math.random() * 2 - 1) * (14 + Math.random() * 36);
        speedMul[i] = 2.2 + Math.random() * 1.6; // gentle travel
      }
      if (!withBubble) return;
      const wb = wrap.getBoundingClientRect();
      window.dispatchEvent(
        new CustomEvent("piam:bubble", {
          detail: {
            left: wb.left + offX,
            top: wb.top + offY,
            width: res.w,
            height: res.h,
          },
        })
      );
    }

    function frame(now: number) {
      if (!wrap || !canvas) return;
      const wb = wrap.getBoundingClientRect();
      const mx = mouse.x;
      const my = mouse.y;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);

      const t = now - start;
      const ENTER = 2300; // slower pull-in
      const R = 64; // repel radius (tight)
      const PUSH = 38;

      // the cutout drives the morph now. once the melt-back finishes, hand the
      // cursors back to the resting name path.
      if (saying && melting && now - hushAt > 2600) {
        saying = false;
        melting = false;
      }
      const settled = !entrance || t > ENTER + 800;
      if (!reduce && settled && !saying) {
        if (idleState === "name" && now - lastMove > 4500) {
          shapeIdx += 1;
          loadShape(shapeIdx);
          morphTarget = 1;
          idleState = "toShape";
        } else if (idleState === "toShape" && morph >= 1) {
          holdStart = now;
          idleState = "hold";
        } else if (idleState === "hold" && now - holdStart > 3500) {
          morphTarget = 0;
          idleState = "toName";
        } else if (idleState === "toName" && morph <= 0) {
          idleState = "name";
          lastMove = now; // wait a full idle window before the next shape
        }
      }
      // global morph drives the state machine — CONSTANT speed (no ease)
      const MSTEP = 0.0024; // slower

      const md = morphTarget - morph;
      morph = Math.abs(md) <= MSTEP ? morphTarget : morph + Math.sign(md) * MSTEP;
      if (raveT > 0) raveT -= 16;

      // keep each ripple alive long enough for its slow front to sweep the name
      for (let k = ripples.length - 1; k >= 0; k--) {
        if (now - ripples[k].start > 10000) ripples.splice(k, 1);
      }

      for (let i = 0; i < pts.length; i++) {
        // each cursor advances at its own CONSTANT slow pace (no ease, no
        // explode) → uniform speed the whole way, arriving scattered in time
        const md2 = morphTarget - mp[i];
        const st = MSTEP * (speedMul[i] || 1);
        mp[i] = Math.abs(md2) <= st ? morphTarget : mp[i] + Math.sign(md2) * st;
        const m = mp[i];

        let baseX: number;
        let baseY: number;
        if (saying) {
          // say-morph: each cursor travels from where it currently is (fromX/Y)
          // to its slot in the spoken text along one arc → it "moves" to the
          // next thing instead of snapping.
          sayMp[i] = Math.min(1, sayMp[i] + MSTEP * (speedMul[i] || 1) * 1.05);
          const sm = sayMp[i];
          const fx = fromX[i];
          const fy = fromY[i];
          const sxv = shapeX[i] - fx;
          const syv = shapeY[i] - fy;
          const bow = Math.sin(sm * Math.PI);
          const len = Math.hypot(sxv, syv) || 1;
          const off = curve[i] * bow;
          baseX = fx + sxv * sm + (-syv / len) * off;
          baseY = fy + syv * sm + (sxv / len) * off;
        } else {
          const p = pts[i];
          // travel from the name to the idle word along a looping path
          baseX = p.x;
          baseY = p.y;
          if (m > 0.001) {
            const sxv = shapeX[i] - p.x;
            const syv = shapeY[i] - p.y;
            const lx = p.x + sxv * m;
            const ly = p.y + syv * m;
            const bow = Math.sin(m * Math.PI);
            const bow2 = Math.sin(m * Math.PI * 2);
            const len = Math.hypot(sxv, syv) || 1;
            const perpX = -syv / len;
            const perpY = sxv / len;
            const off = curve[i] * bow + curve2[i] * bow2;
            const wobX =
              (Math.sin(now * 0.0016 + phase[i] * 2.1) +
                0.7 * Math.sin(now * 0.0037 + phase[i] * 5.3) +
                0.45 * Math.sin(now * 0.0071 + phase[i] * 9.1)) *
              34 *
              bow;
            const wobY =
              (Math.cos(now * 0.0014 + phase[i] * 1.7) +
                0.7 * Math.sin(now * 0.0031 + phase[i] * 3.9) +
                0.45 * Math.cos(now * 0.0066 + phase[i] * 7.7)) *
              34 *
              bow;
            baseX = lx + perpX * off + wobX;
            baseY = ly + perpY * off + wobY;
          }
        }
        const targetX = wb.left + baseX; // viewport space
        const targetY = wb.top + baseY;

        // pond ripple: when its wavefront reaches this cursor it gets SHOVED — a
        // velocity kick in a randomised outward direction, like items on a rug
        // when a wave rolls under it. The soft spring below then lets each arrow
        // travel out, jostle around, and wander slowly back into formation.
        for (let k = 0; k < ripples.length; k++) {
          const rp = ripples[k];
          if (rp.hit[i]) continue;
          const rdx = targetX - rp.x;
          const rdy = targetY - rp.y;
          const rd = Math.hypot(rdx, rdy) || 1;
          const front = ((now - rp.start) / 1000) * 150; // px/s — matches the bg
          if (rd > front) continue; // the wave hasn't reached this cursor yet
          rp.hit[i] = 1;
          const fall = Math.max(0.3, 1 - rd / 1700);
          const a2 = Math.atan2(rdy, rdx) + (Math.random() - 0.5) * 1.7;
          const kick = rp.strength * (3 + Math.random() * 4) * fall;
          scvx[i] += Math.cos(a2) * kick;
          scvy[i] += Math.sin(a2) * kick;
        }
        // gentle shove, very weak spring + friction → soft nudge, slow drift home
        scvx[i] += -scx[i] * 0.006;
        scvy[i] += -scy[i] * 0.006;
        scvx[i] *= 0.91;
        scvy[i] *= 0.91;
        scx[i] += scvx[i];
        scy[i] += scvy[i];

        // rave blast: spring the scatter offset back to zero
        bvx[i] += -bx[i] * 0.022;
        bvy[i] += -by[i] * 0.022;
        bvx[i] *= 0.9;
        bvy[i] *= 0.9;
        bx[i] += bvx[i];
        by[i] += bvy[i];

        let eased = 1;
        let alpha = 1;
        if (entrance) {
          const ep = Math.max(0, Math.min(1, (t - delay[i]) / ENTER));
          eased = 1 - Math.pow(1 - ep, 3);
          alpha = Math.min(1, ep * 1.5);
        }
        if (alpha <= 0) continue;
        const flo = 1 - eased;

        const ambX = reduce ? 0 : Math.sin(now * 0.0013 + phase[i]) * 1.8;
        const ambY = reduce ? 0 : Math.cos(now * 0.0011 + phase[i] * 1.3) * 1.8;
        const sway = reduce ? 0 : Math.sin(now * 0.0016 + phase[i]) * 0.1;

        const axv = targetX - mx;
        const ayv = targetY - my;
        const dist = Math.hypot(axv, ayv) || 1;
        let tox = 0;
        let toy = 0;
        if (dist < R) {
          const f = 1 - dist / R;
          const push = f * f * PUSH;
          tox = (axv / dist) * push;
          toy = (ayv / dist) * push;
        }
        // slow, unsuspicious drift toward the parted position (and back)
        ox[i] += (tox - ox[i]) * 0.06;
        oy[i] += (toy - oy[i]) * 0.06;

        const drawX = targetX + flyX[i] * flo + ox[i] + ambX + bx[i] + scx[i];
        const drawY = targetY + flyY[i] * flo + oy[i] + ambY + by[i] + scy[i];
        const ang = Math.atan2(my - drawY, mx - drawX) + sway;
        const rave = raveT > 0 ? raveT / 900 : 0; // brief pop during the rave
        const s = (0.4 + eased * 0.6) * (1 + rave * 0.7);
        ctx!.globalAlpha = alpha;
        ctx!.save();
        ctx!.translate(drawX, drawY);
        ctx!.rotate(ang);
        ctx!.drawImage(glyph, (-GS / 2) * s, (-GS / 2) * s, GS * s, GS * s);
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function onMove(e: PointerEvent) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      lastMove = e.timeStamp || performance.now();
      if (idleState !== "name" && !saying) {
        morphTarget = 0; // any movement melts the shape back to the name
        idleState = "toName";
      }
    }
    function onRave() {
      raveT = 900;
      for (let i = 0; i < pts.length; i++) {
        const a = Math.random() * Math.PI * 2;
        const power = 9 + Math.random() * 16;
        bvx[i] += Math.cos(a) * power;
        bvy[i] += Math.sin(a) * power;
      }
    }
    // capture each cursor's current on-screen base position as the new "from"
    function captureFrom() {
      for (let i = 0; i < pts.length; i++) {
        if (saying) {
          const sm = sayMp[i];
          fromX[i] = fromX[i] + (shapeX[i] - fromX[i]) * sm;
          fromY[i] = fromY[i] + (shapeY[i] - fromY[i]) * sm;
        } else {
          fromX[i] = pts[i].x;
          fromY[i] = pts[i].y;
        }
        sayMp[i] = 0;
      }
    }
    function addRipple(x: number, y: number, strength = 1) {
      ripples.push({
        x,
        y,
        start: performance.now(),
        strength,
        hit: new Uint8Array(pts.length),
      });
      if (ripples.length > 10) ripples.shift();
    }
    function onRipple(e: Event) {
      const d = (e as CustomEvent<{ x: number; y: number; strength?: number }>)
        .detail;
      if (d) addRipple(d.x, d.y, d.strength ?? 1);
    }
    function onSay(e: Event) {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      captureFrom(); // start from wherever the cursors are right now
      loadText(text); // sets shapeX/shapeY/curve/speedMul + reports the box
      saying = true;
      melting = false;
    }
    function onHush() {
      if (!saying) return;
      captureFrom();
      for (let i = 0; i < pts.length; i++) {
        shapeX[i] = pts[i].x; // melt back to the name
        shapeY[i] = pts[i].y;
        curve[i] = (Math.random() * 2 - 1) * 44;
      }
      melting = true;
      hushAt = performance.now();
    }
    // hovering a nav button spells that section — same morph, no speech bubble
    function onSpell(e: Event) {
      const text = (e as CustomEvent<{ text?: string }>).detail?.text;
      if (!text) return;
      captureFrom();
      loadText(text, false);
      saying = true;
      melting = false;
    }
    let rt = 0;
    function onResize() {
      window.clearTimeout(rt);
      rt = window.setTimeout(build, 180);
    }

    let cancelled = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (cancelled) return;
      readColor();
      mouse.x = window.innerWidth * 0.5;
      mouse.y = window.innerHeight * 0.42;
      lastMove = performance.now();
      build();
      raf = requestAnimationFrame(frame);
    });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("resize", onResize);
    window.addEventListener("theme:change", readColor);
    window.addEventListener("kinetic:burst", onRave);
    window.addEventListener("kinetic:ripple", onRipple);
    window.addEventListener("kinetic:spell", onSpell);
    window.addEventListener("kinetic:unspell", onHush);
    window.addEventListener("piam:say", onSay);
    window.addEventListener("piam:hush", onHush);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(rt);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("theme:change", readColor);
      window.removeEventListener("kinetic:burst", onRave);
      window.removeEventListener("kinetic:ripple", onRipple);
      window.removeEventListener("kinetic:spell", onSpell);
      window.removeEventListener("kinetic:unspell", onHush);
      window.removeEventListener("piam:say", onSay);
      window.removeEventListener("piam:hush", onHush);
    };
  }, []);

  return (
    <div ref={wrapRef} className="nameLetters">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}
