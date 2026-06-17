"use client";

import { useEffect, useRef } from "react";

/**
 * A liquid background for the home page, rendered in WebGL. The whole surface is
 * a textured "fluid" that gently undulates on its own; clicks (and nav-hover
 * ripples, via the shared `kinetic:ripple` event) drop expanding waves that
 * refract — warp — the surface like real water. Falls back silently to the CSS
 * background if WebGL is unavailable.
 */
const MAX = 16;

const VERT = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;          // ms
uniform int uCount;
uniform vec4 uRipples[${MAX}]; // x, y (px, top-left origin), startMs, strength

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int k=0;k<5;k++){ v += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return v;
}

// height of the liquid surface at p: a slow base swell + every active ripple
float height(vec2 p){
  float t = uTime * 0.001;
  // perpetual, very gentle undulation so the surface reads as still water
  float h = 1.6 * (fbm(p * 0.0015 + vec2(t * 0.045, -t * 0.035)) - 0.5);
  h += 0.9 * (fbm(p * 0.0036 - vec2(t * 0.028, t * 0.045)) - 0.5);
  for(int k=0;k<${MAX};k++){
    if(k >= uCount) break;
    vec4 r = uRipples[k];
    float age = (uTime - r.z) * 0.001;
    if(age < 0.0) continue;
    float d = distance(p, r.xy);
    float front = age * 150.0;    // px/s — the expanding wavefront (slow)
    float x = front - d;          // distance behind the front
    if(x < 0.0) continue;         // ahead of the front: undisturbed
    // a short packet: 1–2 oscillations that decay inward and fade over ~2s,
    // i.e. a stone dropped in the pond rather than a continuous wave train
    // amplitude fades as the ring SPREADS (by radius), not by time — so the wave
    // never dies mid-screen; it travels until it has rolled off the edges
    float env = exp(-x * 0.013) * exp(-front * 0.0011);
    h += r.w * 13.0 * sin(x * 0.058) * env;
  }
  return h;
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y); // top-left origin

  // sample the height field around p → a true 3D surface normal
  float e = 1.5;
  float hR = height(p + vec2(e, 0.0));
  float hL = height(p - vec2(e, 0.0));
  float hU = height(p + vec2(0.0, e));
  float hD = height(p - vec2(0.0, e));
  // the z term sets how steeply the waves stand up (smaller = more dramatic 3D)
  vec3 N = normalize(vec3(hL - hR, hD - hU, 2.4));

  // refraction: the textured floor seen *through* the tilted surface → it warps
  vec2 tp = p + N.xy * 32.0;
  // clean, tight cream range → subtle tone, never muddy
  float n = fbm(tp * 0.0042) * 0.6 + fbm(tp * 0.015) * 0.4;
  vec3 light = vec3(0.905, 0.874, 0.800);
  vec3 dark  = vec3(0.848, 0.816, 0.738);
  vec3 col = mix(dark, light, n);

  // 3D water shading: gentle diffuse relief + a crisp specular glint on crests
  vec3 Ld = normalize(vec3(-0.45, -0.62, 0.66)); // light from the upper-left
  vec3 Vd = vec3(0.0, 0.0, 1.0);                  // top-down view
  float diff = max(dot(N, Ld), 0.0);
  float spec = pow(max(dot(reflect(-Ld, N), Vd), 0.0), 44.0);

  col *= (0.955 + 0.085 * diff);
  col += vec3(1.0, 0.99, 0.95) * spec * 0.32;

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function RippleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      premultipliedAlpha: false,
    });
    if (!gl) return; // graceful fallback → CSS background remains

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.error("[ripple] shader compile failed:", gl!.getShaderInfoLog(s));
      }
      return s;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      // eslint-disable-next-line no-console
      console.error("[ripple] program link failed:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uCount = gl.getUniformLocation(prog, "uCount");
    const uRipples = gl.getUniformLocation(prog, "uRipples[0]");

    let W = 0;
    let H = 0;
    function size() {
      // render at 1x — a soft background doesn't need retina, and it keeps the
      // per-pixel shader cheap
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W;
      canvas!.height = H;
      canvas!.style.width = `${W}px`;
      canvas!.style.height = `${H}px`;
      gl!.viewport(0, 0, W, H);
    }
    size();

    const ripples: { x: number; y: number; start: number; strength: number }[] =
      [];
    const data = new Float32Array(MAX * 4);

    function spawn(x: number, y: number, strength = 1) {
      ripples.push({ x, y, start: performance.now(), strength });
      if (ripples.length > MAX) ripples.shift();
    }
    function onRipple(e: Event) {
      const d = (e as CustomEvent<{ x: number; y: number; strength?: number }>)
        .detail;
      if (d) spawn(d.x, d.y, d.strength ?? 1);
    }
    function onClick(e: MouseEvent) {
      const el = e.target as HTMLElement | null;
      if (el && el.closest(".piamPeek, .themeToggle, [data-no-ripple]")) return;
      window.dispatchEvent(
        new CustomEvent("kinetic:ripple", {
          detail: { x: e.clientX, y: e.clientY, strength: 1.6 },
        })
      );
    }

    let raf = 0;
    function frame(now: number) {
      // drop fully-decayed ripples (age > ~7s)
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].start > 13000) ripples.splice(i, 1);
      }
      data.fill(0);
      const n = Math.min(ripples.length, MAX);
      for (let i = 0; i < n; i++) {
        const r = ripples[i];
        data[i * 4] = r.x;
        data[i * 4 + 1] = r.y;
        data[i * 4 + 2] = r.start;
        data[i * 4 + 3] = r.strength;
      }
      gl!.uniform2f(uRes, W, H);
      gl!.uniform1f(uTime, now);
      gl!.uniform1i(uCount, n);
      gl!.uniform4fv(uRipples, data);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      // reduced-motion → render one static frame, no perpetual undulation
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    window.addEventListener("resize", size);
    window.addEventListener("click", onClick);
    window.addEventListener("kinetic:ripple", onRipple);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("click", onClick);
      window.removeEventListener("kinetic:ripple", onRipple);
    };
  }, []);

  return <canvas ref={canvasRef} className="rippleBg" aria-hidden="true" />;
}
