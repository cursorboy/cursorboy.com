"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { ViewTransition } from "@/lib/viewTransition";
import { SCENES } from "@/content/scenes";
import {
  reelChapters,
  type ReelItem,
  type WorkGroupId,
} from "@/content/work";
import ReelCore, { type ReelCoreState } from "./ReelCore";

/**
 * THE WORK — a horizontal filmstrip.
 *
 * Every project is a card on one strip you scroll sideways at native speed
 * (trackpad swipe, mouse wheel mapped 1:1, or click-and-drag). Cards snap to
 * centre; whatever lands in the middle is the ACTIVE project — it pops forward,
 * colours up, and cycles its real screenshots while the rest of the strip dims
 * back. Click any card to glide it to centre. Chapter labels (Main · Hackathon
 * · Design) divide the strip and the track buttons jump to one. A persistent
 * Three.js core sits behind it all and takes the active project's colour.
 *
 * Narrow / touch screens get a vertical fallback (no rail) below.
 */

const NARROW_Q = "(max-width: 940px), (pointer: coarse)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(NARROW_Q);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const noopSubscribe = () => () => {};

export default function WorkReel() {
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW_Q).matches,
    () => false,
  );

  const i = SCENES.findIndex((s) => s.id === "work");
  const prev = SCENES[(i - 1 + SCENES.length) % SCENES.length];
  const next = SCENES[(i + 1) % SCENES.length];

  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "scene-in",
      }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="reelMain scene-work">
        {mounted && !narrow ? <DeskReel /> : null}
        {mounted && narrow ? <MobileReel /> : null}
        {!mounted ? <ReelSkeleton /> : null}

        <nav className="sceneRail" data-ui>
          <Link href={prev.href} className="railLink" transitionTypes={["nav-back"]}>
            <span className="railArrow" aria-hidden>←</span>
            <span className="railLabel">{prev.label}</span>
          </Link>
          <span className="railPos">
            {String(i + 1).padStart(2, "0")}
            <span className="railSlash"> / </span>
            {String(SCENES.length).padStart(2, "0")}
          </span>
          <Link href={next.href} className="railLink railNext" transitionTypes={["nav-forward"]}>
            <span className="railLabel">{next.label}</span>
            <span className="railArrow" aria-hidden>→</span>
          </Link>
        </nav>

        <span className="sceneKicker" aria-hidden>shipped</span>
      </main>
    </ViewTransition>
  );
}

/* ── pre-hydration / first paint: a quiet title so the page isn't blank ───── */
function ReelSkeleton() {
  return (
    <div className="reelSkeleton">
      <p className="eyebrow">selected work</p>
      <h1 className="reelTitle">The Work</h1>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   DESKTOP — the horizontal filmstrip
   ───────────────────────────────────────────────────────────────────────── */
function DeskReel() {
  const coreState = useRef<ReelCoreState>({ progress: 0, accent: null });
  const mainSel = useRef<HTMLElement | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<Map<string, HTMLElement>>(new Map());

  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<WorkGroupId | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const hoverRef = useRef<string | null>(null);
  const activeColorRef = useRef<string | null>(null);
  const dragMovedRef = useRef(false);

  // flat list of items in strip order, with their chapter group + colour
  const flat = useMemo(
    () =>
      reelChapters.flatMap((c) =>
        c.items.map((it) => ({ it, group: c.id, color: c.color })),
      ),
    [],
  );
  const slugOrder = useMemo(() => flat.map((f) => f.it.project.slug), [flat]);

  useEffect(() => {
    mainSel.current = outerRef.current?.closest("main") ?? null;
  }, []);

  // flood the stage + 3D core with an accent (hovered project wins, else the
  // active project's chapter colour)
  const applyWash = useCallback((accent: string | null) => {
    const m = mainSel.current;
    if (m) {
      if (accent) m.style.setProperty("--wash", accent);
      m.dataset.washing = accent ? "on" : "off";
    }
    coreState.current.accent = accent;
  }, []);

  // active = the card nearest the strip's centre; recomputed as you scroll, and
  // it drives the highlight, the wash, and the core's colour + progress.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const update = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best: string | null = null;
      let bestD = Infinity;
      let bestColor: string | null = null;
      let bestGroup: WorkGroupId | null = null;
      for (const { it, group, color } of flat) {
        const el = cardEls.current.get(it.project.slug);
        if (!el) continue;
        const c = el.offsetLeft + el.offsetWidth / 2;
        const d = Math.abs(c - mid);
        if (d < bestD) {
          bestD = d;
          best = it.project.slug;
          bestColor = color;
          bestGroup = group;
        }
      }
      setActiveSlug((p) => (p === best ? p : best));
      setActiveGroup((p) => (p === bestGroup ? p : bestGroup));
      activeColorRef.current = bestColor;
      const max = track.scrollWidth - track.clientWidth;
      coreState.current.progress = max > 0 ? track.scrollLeft / max : 0;
      if (!hoverRef.current) applyWash(bestColor);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(track);
    return () => {
      track.removeEventListener("scroll", onScroll);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [flat, applyWash]);

  // mouse wheel → horizontal scroll at normal (1:1) speed; release at the ends
  // so the page keeps scrolling instead of trapping the wheel.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (e: WheelEvent) => {
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (!delta) return;
      const atStart = track.scrollLeft <= 0;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return;
      e.preventDefault();
      track.scrollLeft += delta;
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, []);

  // click-and-drag the strip sideways
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let dragging = false;
    let lastX = 0;
    let startX = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a")) return;
      dragging = true;
      lastX = e.clientX;
      startX = e.clientX;
      dragMovedRef.current = false;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (!dragMovedRef.current && Math.abs(e.clientX - startX) > 5) {
        dragMovedRef.current = true;
        track.classList.add("is-dragging");
      }
      if (dragMovedRef.current) track.scrollLeft -= dx;
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (dragMovedRef.current) window.setTimeout(() => (dragMovedRef.current = false), 0);
    };
    track.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    return () => {
      track.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const centerSlug = useCallback((slug: string) => {
    cardEls.current.get(slug)?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  // click a card → glide it to centre (ignore the click that ends a drag)
  const selectSlug = useCallback(
    (slug: string) => {
      if (dragMovedRef.current) return;
      centerSlug(slug);
    },
    [centerSlug],
  );

  const jumpToGroup = useCallback(
    (gid: WorkGroupId) => {
      const c = reelChapters.find((ch) => ch.id === gid);
      const first = c?.items[0]?.project.slug;
      if (first) centerSlug(first);
    },
    [centerSlug],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = activeSlug ? slugOrder.indexOf(activeSlug) : 0;
      const n = Math.min(slugOrder.length - 1, Math.max(0, i + dir));
      centerSlug(slugOrder[n]);
    },
    [activeSlug, slugOrder, centerSlug],
  );

  const onEnter = useCallback(
    (item: ReelItem) => {
      setHover(item.project.slug);
      hoverRef.current = item.project.slug;
      applyWash(item.accent);
    },
    [applyWash],
  );
  const onLeave = useCallback(() => {
    setHover(null);
    hoverRef.current = null;
    applyWash(activeColorRef.current);
  }, [applyWash]);

  return (
    <div className="reelOuter reelOuter--rail" ref={outerRef}>
      <div className="reelCanvasWrap" aria-hidden>
        <ReelCore stateRef={coreState} />
      </div>
      <div className="reelWash" aria-hidden />

      <header className="reelRailHead" data-ui>
        <div className="reelRailTitleWrap">
          <p className="eyebrow">selected work — 2024 ··· 2026</p>
          <h1 className="reelTitle reelRailTitle">The Work</h1>
        </div>
        <div className="deskSolos" role="group" aria-label="Jump to a track">
          {reelChapters.map((c) => (
            <button
              key={c.id}
              className={`deskSolo${activeGroup === c.id ? " is-solo" : ""}`}
              style={{ ["--accent"]: c.color } as React.CSSProperties}
              aria-current={activeGroup === c.id ? "true" : undefined}
              onClick={() => jumpToGroup(c.id)}
            >
              <span className="deskSoloDot" aria-hidden />
              {c.label}
              <span className="deskSoloCount">{c.items.length}</span>
            </button>
          ))}
        </div>
      </header>

      <div
        className="reelTrack"
        ref={trackRef}
        role="listbox"
        aria-label="Projects"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            step(1);
          } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {reelChapters.map((c, li) => (
          <Fragment key={c.id}>
            <div
              className="reelDivider"
              style={{ ["--accent"]: c.color } as React.CSSProperties}
              aria-hidden
            >
              <span className="reelDividerNum">{String(li + 1).padStart(2, "0")}</span>
              <span className="reelDividerLabel">{c.label}</span>
              <span className="reelDividerCount">{c.items.length} projects</span>
            </div>
            {c.items.map((item) => (
              <DeskCard
                key={item.project.slug}
                item={item}
                live={activeSlug === item.project.slug || hover === item.project.slug}
                hot={hover === item.project.slug}
                onEnter={onEnter}
                onLeave={onLeave}
                onSelect={() => selectSlug(item.project.slug)}
                setEl={(el) => {
                  if (el) cardEls.current.set(item.project.slug, el);
                  else cardEls.current.delete(item.project.slug);
                }}
              />
            ))}
          </Fragment>
        ))}
        <span className="reelTrackEnd" aria-hidden />
      </div>

      <span className="reelRailHint" aria-hidden>
        scroll sideways · click a project
      </span>
    </div>
  );
}

/* ── one card on the strip — a framed, cycling screen + read-out ──────────── */
function DeskCard({
  item,
  live,
  hot,
  onEnter,
  onLeave,
  onSelect,
  setEl,
}: {
  item: ReelItem;
  live: boolean;
  hot: boolean;
  onEnter: (item: ReelItem) => void;
  onLeave: () => void;
  onSelect: () => void;
  setEl: (el: HTMLElement | null) => void;
}) {
  const { project: p, accent, shots, isBuild } = item;
  const [idx, setIdx] = useState(0);

  // cycle screenshots while live (centred or hovered); hover cycles faster
  useEffect(() => {
    if (!live || shots.length < 2) return;
    const id = window.setInterval(
      () => setIdx((n) => (n + 1) % shots.length),
      hot ? 880 : 1500,
    );
    return () => {
      window.clearInterval(id);
      setIdx(0);
    };
  }, [live, hot, shots.length]);

  const href = `/work/${p.slug}`;
  const morph = () => {
    const t = document.getElementById(`reel-title-${p.slug}`);
    if (t) t.style.viewTransitionName = "project-hero";
  };

  return (
    <article
      ref={setEl}
      className={`deskCard${live ? " is-live" : ""}${hot ? " is-hot" : ""}`}
      data-slug={p.slug}
      tabIndex={0}
      onMouseEnter={() => onEnter(item)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(item)}
      onBlur={onLeave}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest("a")) onSelect();
      }}
      style={{ ["--accent"]: accent } as React.CSSProperties}
    >
      <div className="deskCardScreen">
        <div className="screenBar">
          <span className="screenDots" aria-hidden>
            <i /><i /><i />
          </span>
          <span className="screenUrl">{p.cta ?? "preview"}</span>
          {shots.length > 1 && (
            <span className="screenIdx">{`${idx + 1}/${shots.length}`}</span>
          )}
        </div>
        <div className="screenViewport">
          {shots.length > 0 ? (
            shots.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className={`screenImg${i === idx ? " is-on" : ""}`}
              />
            ))
          ) : (
            <div className="screenEmpty">{p.title}</div>
          )}
          {shots.length > 1 && (
            <span className="screenPlay" data-on={live ? "on" : "off"} aria-hidden>
              ● live
            </span>
          )}
        </div>
      </div>

      <div className="deskCardBody">
        <p className="projKicker">
          <span className="projDot" aria-hidden />
          {p.index} · {p.year}
          {p.event && <span className="projEvent">{p.event}</span>}
          {p.status && <span className={`projStatus is-${p.status}`}>{p.status}</span>}
        </p>
        <h3 className="deskCardTitle" id={`reel-title-${p.slug}`}>
          {isBuild ? (
            <Link href={href} transitionTypes={["nav-forward"]} onClick={morph}>
              {p.title}
            </Link>
          ) : (
            p.title
          )}
        </h3>
        <p className="deskCardTagline">{p.tagline}</p>

        <div className="deskCardMeta">
          {p.stack && p.stack.length > 0 && (
            <ul className="deskCardStack">
              {p.stack.slice(0, 3).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}
          <div className="projActions">
            {isBuild && (
              <Link href={href} className="projOpen" transitionTypes={["nav-forward"]} onClick={morph}>
                Open breakdown <span aria-hidden>→</span>
              </Link>
            )}
            {p.href && (
              <a className="projLive" href={p.href} target="_blank" rel="noopener noreferrer">
                Visit {p.cta ?? "site"} <span aria-hidden>↗</span>
              </a>
            )}
            {p.links?.map((l) => (
              <a
                key={l.href}
                className="projLive"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MOBILE — vertical fallback (no pin). Tracks stack as chapters.
   ───────────────────────────────────────────────────────────────────────── */
function MobileReel() {
  const coreState = useRef<ReelCoreState>({ progress: 0, accent: null });

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const max = document.body.scrollHeight - window.innerHeight;
        coreState.current.progress = max > 0 ? window.scrollY / max : 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="reelMobile">
      <header className="mReelHero">
        <div className="mReelCore">
          <ReelCore stateRef={coreState} />
        </div>
        <p className="eyebrow">selected work</p>
        <h1 className="reelTitle">The Work</h1>
        <p className="reelLede">
          Three tracks of what I&apos;ve built. Tap a card to flip through its
          screens.
        </p>
      </header>

      {reelChapters.map((c) => (
        <section key={c.id} className="mChapter" style={{ ["--accent"]: c.color } as React.CSSProperties}>
          <div className="mChapterHead">
            <span className="mChapterDot" aria-hidden />
            <h2>{c.label}</h2>
            <span className="mChapterCount">{String(c.items.length).padStart(2, "0")}</span>
          </div>
          <p className="mChapterBlurb">{c.blurb}</p>
          <div className="mCards">
            {c.items.map((it) => (
              <MobileCard key={it.project.slug} item={it} />
            ))}
          </div>
        </section>
      ))}

      <footer className="mOutro">
        <h2 className="outroTitle">Let&apos;s build the next one.</h2>
        <Link href="/contact" className="outroCta" transitionTypes={["nav-forward"]}>
          Start a conversation <span aria-hidden>→</span>
        </Link>
      </footer>
    </div>
  );
}

function MobileCard({ item }: { item: ReelItem }) {
  const { project: p, accent, shots, isBuild } = item;
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio > 0.45),
      { threshold: [0, 0.45, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || shots.length < 2) return;
    const id = window.setInterval(() => setIdx((n) => (n + 1) % shots.length), 1100);
    return () => window.clearInterval(id);
  }, [inView, shots.length]);

  const href = `/work/${p.slug}`;
  return (
    <article
      ref={ref}
      className={`mCard${inView ? " is-live" : ""}`}
      style={{ ["--accent"]: accent } as React.CSSProperties}
      onClick={() => shots.length > 1 && setIdx((n) => (n + 1) % shots.length)}
    >
      <div className="mCardScreen">
        {shots.length > 0 ? (
          shots.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className={`screenImg${i === idx ? " is-on" : ""}`}
            />
          ))
        ) : (
          <div className="screenEmpty">{p.title}</div>
        )}
      </div>
      <div className="mCardBody">
        <p className="projKicker">
          <span className="projDot" aria-hidden />
          {p.index} · {p.year}
          {p.event && <span className="projEvent">{p.event}</span>}
        </p>
        <h3 className="projTitle">
          {isBuild ? (
            <Link href={href} transitionTypes={["nav-forward"]}>
              {p.title}
            </Link>
          ) : (
            p.title
          )}
        </h3>
        <p className="projTagline">{p.tagline}</p>
        <div className="projActions">
          {isBuild && (
            <Link href={href} className="projOpen" transitionTypes={["nav-forward"]} onClick={(e) => e.stopPropagation()}>
              Open breakdown <span aria-hidden>→</span>
            </Link>
          )}
          {p.href && (
            <a className="projLive" href={p.href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
              Visit {p.cta ?? "site"} <span aria-hidden>↗</span>
            </a>
          )}
          {p.links?.map((l) => (
            <a
              key={l.href}
              className="projLive"
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {l.label} <span aria-hidden>↗</span>
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
