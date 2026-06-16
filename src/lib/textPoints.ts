// Samples rendered text into a list of points — used to make particles/cursors
// assemble into words and to build the name out of tiny cursor glyphs.

export type Pt = { x: number; y: number };

let cachedFamily = "";

/** Resolve the real (hashed) font family behind the --font-display variable. */
function displayFamily(): string {
  if (cachedFamily) return cachedFamily;
  const probe = document.createElement("span");
  probe.style.cssText =
    "position:absolute;visibility:hidden;font-family:var(--font-display)";
  document.body.appendChild(probe);
  cachedFamily = getComputedStyle(probe).fontFamily || "sans-serif";
  probe.remove();
  return cachedFamily;
}

export function sampleLines(
  lines: string[],
  boxW: number,
  opts: {
    weight?: number;
    step?: number;
    maxFont?: number;
    lineRatio?: number;
    maxPoints?: number;
  } = {}
): { points: Pt[]; w: number; h: number; font: number } {
  const {
    weight = 800,
    step = 6,
    maxFont = Infinity,
    lineRatio = 0.94,
    maxPoints = Infinity,
  } = opts;

  const family = displayFamily();
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  if (!g) return { points: [], w: 0, h: 0, font: 0 };

  const base = 100;
  g.font = `${weight} ${base}px ${family}`;
  let widest = 1;
  for (const ln of lines) widest = Math.max(widest, g.measureText(ln).width);
  const font = Math.min((boxW / widest) * base, maxFont);

  g.font = `${weight} ${font}px ${family}`;
  const lineH = font * lineRatio;
  const w = Math.ceil(Math.max(...lines.map((ln) => g.measureText(ln).width)));
  const h = Math.ceil(lineH * lines.length + font * 0.3);

  c.width = w;
  c.height = h;
  const g2 = c.getContext("2d");
  if (!g2) return { points: [], w, h, font };
  g2.font = `${weight} ${font}px ${family}`;
  g2.textBaseline = "alphabetic";
  g2.fillStyle = "#000";
  lines.forEach((ln, i) => {
    const lw = g2.measureText(ln).width;
    g2.fillText(ln, (w - lw) / 2, font * 0.82 + i * lineH);
  });

  const data = g2.getImageData(0, 0, w, h).data;
  let points: Pt[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) points.push({ x, y });
    }
  }
  if (points.length > maxPoints) {
    const stride = Math.ceil(points.length / maxPoints);
    points = points.filter((_, i) => i % stride === 0);
  }
  return { points, w, h, font };
}

/** Sample a single string at a fixed font size (keeps it inline-sized). */
export function sampleAtFont(
  text: string,
  fontPx: number,
  opts: { weight?: number; step?: number; maxPoints?: number } = {}
): { points: Pt[]; w: number; h: number; ascent: number } {
  const { weight = 800, step = 4, maxPoints = Infinity } = opts;
  const family = displayFamily();
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  if (!g) return { points: [], w: 0, h: 0, ascent: 0 };
  g.font = `${weight} ${fontPx}px ${family}`;
  const m = g.measureText(text);
  const ascent = m.actualBoundingBoxAscent || fontPx * 0.78;
  const descent = m.actualBoundingBoxDescent || fontPx * 0.22;
  const pad = 3;
  const w = Math.ceil(m.width) + pad * 2;
  const h = Math.ceil(ascent + descent) + pad * 2;
  c.width = w;
  c.height = h;
  const g2 = c.getContext("2d");
  if (!g2) return { points: [], w, h, ascent };
  g2.font = `${weight} ${fontPx}px ${family}`;
  g2.textBaseline = "alphabetic";
  g2.fillStyle = "#000";
  g2.fillText(text, pad, ascent + pad);
  const data = g2.getImageData(0, 0, w, h).data;
  let points: Pt[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 128) points.push({ x, y });
    }
  }
  if (points.length > maxPoints) {
    const stride = Math.ceil(points.length / maxPoints);
    points = points.filter((_, i) => i % stride === 0);
  }
  return { points, w, h, ascent };
}
