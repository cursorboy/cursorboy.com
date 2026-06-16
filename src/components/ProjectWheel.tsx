"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import {
  projects,
  projectCategories,
  type Project,
  type ProjectCategory,
} from "@/content/portfolio";

/* The work wheel — a 3D Rolodex of project cards on a vertical cylinder. Spin it
   by dragging, scrolling over it, clicking a card, or the ▲▼ keys; the front
   card is "active" and its story shows alongside. Category chips colour-code and
   filter the wheel so builds, minis, and design work share one object. */

const STEP = 40; // scroll units between adjacent cards in the drawer

type Filter = "all" | ProjectCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "build", label: projectCategories.build.label },
  { key: "mini", label: projectCategories.mini.label },
  { key: "design", label: projectCategories.design.label },
];

// staggered tab columns so every tab pokes out and stays visible, like the
// cut tabs in a real card index / filing drawer. colour still encodes category.
const TAB_COLS = ["8%", "30.5%", "53%", "75.5%"];

export default function ProjectWheel() {
  const [filter, setFilter] = useState<Filter>("all");
  const items = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const ringRot = useMotionValue(0); // scrub; front card index = -ringRot/STEP
  const [active, setActive] = useState(0);

  // responsive card geometry, measured from the stage width
  const [dim, setDim] = useState({ cardW: 380, cardH: 228 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      // tall file-card stock
      const cardW = Math.min(400, Math.max(228, w * 0.78));
      const cardH = Math.round(cardW * 0.6);
      setDim({ cardW: Math.round(cardW), cardH });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const N = items.length;
  const minRot = -(N - 1) * STEP;
  const clampRot = (v: number) => Math.min(0, Math.max(minRot, v));

  // keep `active` in lockstep with the wheel as it turns
  useEffect(() => {
    const unsub = ringRot.on("change", (v) => {
      const idx = Math.min(N - 1, Math.max(0, Math.round(-v / STEP)));
      setActive((cur) => (cur === idx ? cur : idx));
    });
    return unsub;
  }, [ringRot, N]);

  function snap() {
    const idx = Math.min(N - 1, Math.max(0, Math.round(-ringRot.get() / STEP)));
    animate(ringRot, -idx * STEP, { type: "spring", stiffness: 130, damping: 18 });
  }
  function goTo(idx: number) {
    const clamped = Math.min(N - 1, Math.max(0, idx));
    animate(ringRot, -clamped * STEP, { type: "spring", stiffness: 150, damping: 19 });
  }

  // scroll-to-spin (non-passive so we can keep the page still while over the wheel)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let t: ReturnType<typeof setTimeout>;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      ringRot.set(clampRot(ringRot.get() - e.deltaY * 0.16));
      clearTimeout(t);
      t = setTimeout(snap, 110);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // drag-to-spin
  const dragging = useRef(false);
  const lastY = useRef(0);
  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastY.current = e.clientY;
    ringRot.stop();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dy = e.clientY - lastY.current;
    lastY.current = e.clientY;
    ringRot.set(clampRot(ringRot.get() + dy * 0.34));
  }
  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    snap();
  }

  function pickFilter(f: Filter) {
    if (f === filter) return;
    setFilter(f);
    setActive(0);
    ringRot.set(0);
  }

  const current = items[Math.min(active, N - 1)];

  return (
    <div className="wheel">
      <header className="wheelHead">
        <p className="eyebrow">selected work</p>
        <div className="wheelFilters" role="tablist" aria-label="Filter projects">
          {FILTERS.map((f) => {
            const color =
              f.key === "all" ? undefined : projectCategories[f.key].color;
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                className={`wheelChip${on ? " is-on" : ""}`}
                onClick={() => pickFilter(f.key)}
                style={color ? ({ ["--cat"]: color } as React.CSSProperties) : undefined}
              >
                {f.key !== "all" && <span className="wheelChipDot" aria-hidden />}
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="wheelBody">
        {/* the spinning cylinder */}
        <div
          className="wheelStage"
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          tabIndex={0}
          role="listbox"
          aria-label="Project wheel"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowRight") {
              e.preventDefault();
              goTo(active + 1);
            } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
        >
          <div className="wheelRing">
            {items.map((p, i) => (
              <Card
                key={p.slug}
                p={p}
                i={i}
                dim={dim}
                ringRot={ringRot}
                active={i === active}
                onSelect={() => goTo(i)}
              />
            ))}
          </div>

          <span className="wheelHint" aria-hidden>
            drag · scroll · tap a tab
          </span>
        </div>

        {/* the active project, read out alongside the wheel */}
        <div className="wheelDetail">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              className="wheelDetailInner"
              initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Detail p={current} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── one card on the cylinder ─────────────────────────────────────────────── */
function Card({
  p,
  i,
  dim,
  ringRot,
  active,
  onSelect,
}: {
  p: Project;
  i: number;
  dim: { cardW: number; cardH: number };
  ringRot: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const cat = projectCategories[p.category];

  // a leaning filing drawer: cards sit parallel at a fixed lean, stepping up &
  // back (later) / down & back (earlier). The centred card pulls forward and
  // stands upright — the folder you've drawn out to read.
  const GAP_Y = dim.cardH * 0.16; // vertical step between cards
  const GAP_Z = dim.cardH * 0.16; // depth step between cards
  const LIFT = dim.cardH * 0.55; // how far the open card pulls forward
  const LEAN = 24; // resting lean of the drawer (degrees)

  const dist = useTransform(ringRot, (r) => Math.abs(i + r / STEP));
  const opacity = useTransform(dist, (d) => Math.max(0.18, 1 - d * 0.12));
  const transform = useTransform(ringRot, (r) => {
    const rel = i + r / STEP; // 0 = drawn-out front card
    const k = Math.max(0, 1 - Math.abs(rel)); // 1 at front, 0 once a card away
    const ty = -rel * GAP_Y - k * dim.cardH * 0.04;
    const tz = -Math.abs(rel) * GAP_Z + k * LIFT;
    const rx = LEAN * (1 - k); // front card stands upright (0°), rest lean back
    return `translate(-50%, -50%) translateY(${ty}px) translateZ(${tz}px) rotateX(${rx}deg)`;
  });

  return (
    <motion.button
      type="button"
      className={`wheelCard${active ? " is-active" : ""}`}
      onClick={onSelect}
      aria-label={p.title}
      style={
        {
          width: dim.cardW,
          height: dim.cardH,
          opacity,
          transform,
          ["--cat"]: cat.color,
        } as MotionStyle
      }
    >
      <span className="wheelTab" style={{ left: TAB_COLS[i % TAB_COLS.length] }}>
        {p.index}
      </span>
      <span className="wheelCardInner">
        {active && (
          <>
            <span className="wheelCardName">{p.title}</span>
            <span className="wheelCardCat">
              <span className="wheelCardDot" aria-hidden />
              {cat.label}
            </span>
          </>
        )}
      </span>
    </motion.button>
  );
}

/* ── the active project, written out beside the wheel ─────────────────────── */
function Detail({ p }: { p: Project }) {
  const cat = projectCategories[p.category];
  const isBuild = p.category === "build";
  const href = `/work/${p.slug}`;

  function morph() {
    const t = document.querySelector<HTMLElement>(".wheelDetailTitle");
    if (t) t.style.viewTransitionName = "project-hero";
  }

  return (
    <div style={{ ["--cat"]: cat.color } as React.CSSProperties}>
      <p className="wheelDetailKicker">
        <span className="wheelCardDot" aria-hidden />
        {cat.label}
        <span className="wheelDetailMeta">
          {p.index} · {p.year}
        </span>
      </p>

      <h2 className="pjTitle wheelDetailTitle">
        {isBuild ? (
          <Link href={href} transitionTypes={["nav-forward"]} onClick={morph}>
            {p.title}
          </Link>
        ) : (
          p.title
        )}
      </h2>

      <p className="wheelDetailTagline">{p.tagline}</p>

      {p.overview && <p className="wheelDetailOverview">{p.overview}</p>}

      {p.metrics && p.metrics.length > 0 && (
        <dl className="wheelDetailMetrics">
          {p.metrics.map((m) => (
            <div key={m.label}>
              <dt>{m.value}</dt>
              <dd>{m.label}</dd>
            </div>
          ))}
        </dl>
      )}

      {p.stack && p.stack.length > 0 && (
        <ul className="wheelDetailStack">
          {p.stack.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      <div className="wheelDetailActions">
        {p.href && (
          <a
            className="showOpen"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open {p.cta ?? "project"} <span aria-hidden>↗</span>
          </a>
        )}
        {isBuild && (
          <Link
            href={href}
            className="showBreakdown"
            transitionTypes={["nav-forward"]}
            onClick={morph}
          >
            Breakdown <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </div>
  );
}
