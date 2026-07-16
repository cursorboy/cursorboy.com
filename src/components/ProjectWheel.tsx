"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  projects,
  projectCategories,
  type Project,
  type ProjectCategory,
} from "@/content/portfolio";

/* The work rail — a horizontal filmstrip of project cards. Scroll sideways at
   native speed (trackpad swipe, or the mouse wheel translated 1:1), or click any
   card to center it. The centred card is "active": it pops forward, colours up,
   and its full story reads in the panel below. Category chips colour-code and
   filter the strip. */

type Filter = "all" | ProjectCategory;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "build", label: projectCategories.build.label },
  { key: "mini", label: projectCategories.mini.label },
  { key: "design", label: projectCategories.design.label },
];

export default function ProjectWheel() {
  const [filter, setFilter] = useState<Filter>("all");
  const items = useMemo(
    () =>
      filter === "all"
        ? projects
        : projects.filter((p) => p.category === filter),
    [filter],
  );

  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const N = items.length;

  // active = the card whose centre is nearest the rail's centre, updated as you
  // scroll so the highlight always tracks the strip.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    let raf = 0;
    const update = () => {
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < cardRefs.current.length; i++) {
        const c = cardRefs.current[i];
        if (!c) continue;
        const center = c.offsetLeft + c.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      setActive((cur) => (cur === best ? cur : best));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      rail.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [N, filter]);

  // mouse wheel → horizontal scroll at normal (1:1) speed; release at either end
  // so the page keeps scrolling instead of trapping the wheel.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const atStart = rail.scrollLeft <= 0;
      const atEnd =
        rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      rail.scrollLeft += delta;
    };
    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, [N, filter]);

  function goTo(idx: number) {
    const i = Math.min(N - 1, Math.max(0, idx));
    setActive(i);
    cardRefs.current[i]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }

  function pickFilter(f: Filter) {
    if (f === filter) return;
    setFilter(f);
    setActive(0);
    requestAnimationFrame(() =>
      railRef.current?.scrollTo({ left: 0, behavior: "auto" }),
    );
  }

  const current = items[Math.min(active, N - 1)];

  return (
    <div className="wheel">
      <header className="wheelHead">
        <p className="eyebrow">selected work</p>
        <div
          className="wheelFilters"
          role="tablist"
          aria-label="Filter projects"
        >
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
                style={
                  color ? ({ ["--cat"]: color } as React.CSSProperties) : undefined
                }
              >
                {f.key !== "all" && <span className="wheelChipDot" aria-hidden />}
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* the horizontal strip */}
      <div className="wheelRailWrap">
        <div
          className="wheelRail"
          ref={railRef}
          role="listbox"
          aria-label="Projects"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown") {
              e.preventDefault();
              goTo(active + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
              e.preventDefault();
              goTo(active - 1);
            }
          }}
        >
          {items.map((p, i) => {
            const cat = projectCategories[p.category];
            const on = i === active;
            return (
              <button
                key={p.slug}
                type="button"
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className={`railCard${on ? " is-active" : ""}`}
                role="option"
                aria-selected={on}
                aria-label={p.title}
                onClick={() => goTo(i)}
                style={{ ["--cat"]: cat.color } as React.CSSProperties}
              >
                <span className="railCardBar" aria-hidden />
                <span className="railCardTop">
                  <span className="railCardIdx">{p.index}</span>
                  <span className="railCardYear">{p.year}</span>
                </span>
                <span className="railCardName">{p.title}</span>
                <span className="railCardCat">
                  <span className="wheelCardDot" aria-hidden />
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
        <span className="wheelHint" aria-hidden>
          scroll sideways · click a project
        </span>
      </div>

      {/* the active project, written out in full below the strip */}
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
