"use client";

import {
  useCallback,
  useEffect,
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

// track → wash colour. Colour is a TRACK identity, so the page + 3D core lock
// to the active lane's colour as you scroll (not a per-project hue).
const COLOR_BY_GROUP = new Map(reelChapters.map((c) => [c.id, c.color]));

/**
 * THE WORK — three tracks, played one at a time.
 *
 * Three horizontal lanes (Main · Hackathon · Design) share a pinned 100vh
 * stage, but they DON'T move in lockstep. Each lane owns its own segment of
 * the scroll: as you scroll down you move THROUGH the tracks — the active lane
 * lifts into focus and scrubs its projects edge-to-edge under a fixed playhead,
 * while the others park (start/end) and recede. So a lane is a self-contained
 * journey, never a slice of one global timeline. Whatever sits under the
 * playhead in the active lane wakes up and cycles its real screenshots; hover
 * floods the page + the Three.js core with that project's accent. The track
 * buttons (top) and lane rails jump straight to a track.
 *
 * Narrow / touch screens get a vertical fallback (no pin) below.
 */

const PLAYHEAD = 0.4; // fraction of lane width where the playhead sits

// hydration-safe gates (no setState-in-effect): server snapshots are false, so
// the heavy client desk only mounts after hydration and matches the viewport.
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
   DESKTOP — the multitrack mixing desk
   ───────────────────────────────────────────────────────────────────────── */
type ArmedMap = Record<WorkGroupId, string | null>;
const EMPTY_ARMED: ArmedMap = { main: null, hackathon: null, design: null };

function DeskReel() {
  const coreState = useRef<ReelCoreState>({ progress: 0, accent: null });

  const mainSel = useRef<HTMLElement | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const laneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const introRef = useRef<HTMLDivElement>(null);
  const outroRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // per-lane scroll segments (start px / end-of-scrub px) + total scroll, in px
  const segStartRef = useRef<number[]>([]);
  const scrubEndRef = useRef<number[]>([]);
  const vScrollRef = useRef(0);

  // which project sits under the playhead in the ACTIVE lane (ambient)
  const [armed, setArmed] = useState<ArmedMap>(EMPTY_ARMED);
  const armedRef = useRef<ArmedMap>(EMPTY_ARMED);
  // which project the pointer is on (deliberate — drives the page flood)
  const [hover, setHover] = useState<string | null>(null);
  // which lane is currently in focus (for nav highlight) — updated on change only
  const [active, setActive] = useState<WorkGroupId | null>(null);
  const activeRef = useRef<WorkGroupId | null>(null);

  // the colour wash + 3D core follow the EFFECTIVE accent: the hovered project
  // wins (deliberate), otherwise whatever is armed under the playhead (ambient).
  // Both are kept in refs so the scroll loop and pointer handlers share one
  // source of truth; applyWashRef is the live implementation, set inside the
  // scroll effect so it can read mainSel without dependency churn.
  const hoverAccentRef = useRef<string | null>(null);
  const armedAccentRef = useRef<string | null>(null);
  const applyWashRef = useRef<() => void>(() => {});

  useEffect(() => {
    mainSel.current = outerRef.current?.closest("main") ?? null;
  }, []);

  // set true while a sideways drag is in progress, so a drag-release doesn't
  // also fire a card's click-to-skip.
  const dragMovedRef = useRef(false);

  // jump straight to a track's segment (track buttons + lane rails)
  const jumpTo = useCallback((li: number) => {
    const outer = outerRef.current;
    const start = segStartRef.current[li];
    if (!outer || start == null) return;
    window.scrollTo({ top: outer.offsetTop + start, behavior: "smooth" });
  }, []);

  // click-to-skip: scroll so the clicked card lands centred under the playhead
  // in its own lane. Solving cardCenter + tx = playX for the lane's scrub gives
  // the exact vertical scroll offset within that lane's segment.
  const skipTo = useCallback((li: number, slug: string) => {
    if (dragMovedRef.current) return; // ignore the click that ends a drag
    const outer = outerRef.current;
    const lane = laneRefs.current[li];
    if (!outer || !lane) return;
    const strip = lane.firstElementChild as HTMLElement | null;
    const card = strip?.querySelector<HTMLElement>(`[data-slug="${slug}"]`);
    if (!card) return;
    const laneMax = Number(lane.dataset.max ?? 0);
    const first = Number(lane.dataset.first ?? 0);
    const start = segStartRef.current[li] ?? 0;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const scrub =
      laneMax > 0 ? Math.min(1, Math.max(0, (cardCenter - first) / laneMax)) : 0;
    window.scrollTo({ top: outer.offsetTop + start + scrub * laneMax, behavior: "smooth" });
  }, []);

  // pin + sequential-focus mechanics: each lane owns a scroll segment. Within
  // its segment a lane scrubs its full width; outside it the lane is parked
  // (at start or end) and recedes. A HOLD gap between segments cross-fades the
  // focus from one track to the next.
  useEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;

    const lanes = () => laneRefs.current.filter(Boolean) as HTMLDivElement[];

    // flood the stage + core with the effective accent (hover wins, else armed)
    const applyWash = () => {
      const accent = hoverAccentRef.current ?? armedAccentRef.current;
      const m = mainSel.current;
      if (m) {
        if (accent) m.style.setProperty("--wash", accent);
        m.dataset.washing = accent ? "on" : "off";
      }
      coreState.current.accent = accent;
    };
    applyWashRef.current = applyWash;

    const measure = () => {
      const viewW = lanesRef.current?.clientWidth ?? window.innerWidth;
      const HOLD = window.innerHeight * 0.55; // focus handoff between tracks
      const LEAD = window.innerHeight * 0.5; // intro dwell before track 1
      // after the scrub completes (last card centred under the playhead) the
      // lane HOLDS that last card, active & highlighted, for TAIL px before it
      // hands off — otherwise the final card only lands on the playhead at the
      // very handoff instant and never gets a resting, highlighted beat. This
      // also gives short / no-scrub lanes a real dwell.
      const TAIL = window.innerHeight * 0.7;
      const starts: number[] = [];
      const scrubEnds: number[] = [];
      let acc = LEAD;
      lanes().forEach((lane, i) => {
        const strip = lane.firstElementChild as HTMLElement | null;
        const cards = strip
          ? Array.from(strip.querySelectorAll<HTMLElement>("[data-slug]"))
          : [];
        const playX = lane.clientWidth * PLAYHEAD;
        // scrub from the FIRST card centred under the playhead to the LAST card
        // centred under it — so EVERY card is reachable before the lane hands
        // off (not "until the strip's right edge hits the viewport edge",
        // which left the trailing cards unreachable past the 40% playhead).
        let first = playX;
        let laneMax = 0;
        if (cards.length) {
          const c0 = cards[0];
          const cl = cards[cards.length - 1];
          first = c0.offsetLeft + c0.offsetWidth / 2;
          laneMax = Math.max(0, cl.offsetLeft + cl.offsetWidth / 2 - first);
        }
        lane.dataset.max = String(laneMax);
        lane.dataset.first = String(first);
        // active window = scrub distance + a tail hold on the last card
        const segLen = laneMax + TAIL;
        starts[i] = acc;
        scrubEnds[i] = acc + segLen;
        acc = scrubEnds[i] + HOLD;
      });
      segStartRef.current = starts;
      scrubEndRef.current = scrubEnds;
      vScrollRef.current = acc + window.innerHeight * 0.15; // trailing outro
      outer.style.height = `${window.innerHeight + vScrollRef.current}px`;
    };

    let ticking = false;
    const update = () => {
      ticking = false;
      const vScroll = vScrollRef.current;
      const top = Math.max(0, -outer.getBoundingClientRect().top);
      const p = vScroll > 0 ? Math.min(1, top / vScroll) : 0;
      coreState.current.progress = p;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;

      const LEAD = window.innerHeight * 0.5;
      const RAMP = window.innerHeight * 0.55;
      // intro fades over the first LEAD px; the lanes reveal in lockstep so they
      // never bleed through the title card at scroll-0.
      const introOp = Math.max(0, 1 - top / LEAD);
      const reveal = Math.min(1, top / LEAD);
      if (introRef.current) introRef.current.style.opacity = String(introOp);
      if (lanesRef.current) {
        lanesRef.current.style.setProperty("--reveal", reveal.toFixed(3));
        // keep lanes inert until they're meaningfully visible
        lanesRef.current.style.setProperty("--lanes-pe", reveal < 0.15 ? "none" : "auto");
      }
      if (outroRef.current)
        outroRef.current.style.opacity = String(Math.max(0, (p - 0.92) / 0.08));

      const starts = segStartRef.current;
      const scrubEnds = scrubEndRef.current;
      const next: ArmedMap = { ...EMPTY_ARMED };
      let bestFocus = -1;
      let activeIdx = -1;

      const ls = lanes();
      // first pass: scrub each strip + compute focus, find the active lane
      const focuses: number[] = [];
      ls.forEach((lane, i) => {
        const strip = lane.firstElementChild as HTMLElement | null;
        const laneMax = Number(lane.dataset.max ?? 0);
        const first = Number(lane.dataset.first ?? 0);
        const tx0 = lane.clientWidth * PLAYHEAD - first; // first card → playhead
        const start = starts[i] ?? 0;
        const scrubEnd = scrubEnds[i] ?? 0;
        const scrub = laneMax > 0
          ? Math.min(1, Math.max(0, (top - start) / laneMax))
          : top >= start
            ? 1
            : 0;
        if (strip) strip.style.transform = `translate3d(${tx0 - scrub * laneMax}px,0,0)`;

        let focus: number;
        if (top < start) focus = Math.max(0, 1 - (start - top) / RAMP);
        else if (top <= scrubEnd) focus = 1;
        else focus = Math.max(0, 1 - (top - scrubEnd) / RAMP);
        focuses[i] = focus;
        lane.style.setProperty("--focus", focus.toFixed(3));
        lane.dataset.state =
          top < start ? "upcoming" : top > scrubEnd ? "past" : "active";

        if (focus > bestFocus) {
          bestFocus = focus;
          activeIdx = i;
        }
      });

      // second pass: only the focused lane arms a project under the playhead
      ls.forEach((lane, i) => {
        const strip = lane.firstElementChild as HTMLElement | null;
        const group = lane.dataset.lane as WorkGroupId;
        if (!strip) return;
        const cards = strip.querySelectorAll<HTMLElement>("[data-slug]");
        if (i !== activeIdx) {
          cards.forEach((c) => (c.dataset.armed = "off"));
          next[group] = null;
          return;
        }
        const laneMax = Number(lane.dataset.max ?? 0);
        const first = Number(lane.dataset.first ?? 0);
        const start = starts[i] ?? 0;
        const scrub = laneMax > 0
          ? Math.min(1, Math.max(0, (top - start) / laneMax))
          : 0;
        const playX = lane.clientWidth * PLAYHEAD;
        const tx = playX - first - scrub * laneMax;
        let best: string | null = null;
        let bestD = Infinity;
        cards.forEach((card) => {
          const cx = card.offsetLeft + card.offsetWidth / 2 + tx;
          const d = Math.abs(cx - playX);
          card.dataset.armed = d < card.offsetWidth * 0.62 ? "on" : "off";
          if (d < bestD) {
            bestD = d;
            best = card.dataset.slug ?? null;
          }
        });
        next[group] = best;
      });

      const pa = armedRef.current;
      if (pa.main !== next.main || pa.hackathon !== next.hackathon || pa.design !== next.design) {
        armedRef.current = next;
        setArmed(next);
      }
      const activeId = (ls[activeIdx]?.dataset.lane as WorkGroupId) ?? null;
      if (activeRef.current !== activeId) {
        activeRef.current = activeId;
        setActive(activeId);
      }

      // colour-follow the ACTIVE TRACK as you scroll: the whole lane shares one
      // colour, so the wash + core stay locked to it (and lit through the lane)
      // instead of flickering a new hue per project under the playhead.
      const trackAccent = activeId ? COLOR_BY_GROUP.get(activeId) ?? null : null;
      if (armedAccentRef.current !== trackAccent) {
        armedAccentRef.current = trackAccent;
        applyWash();
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    // horizontal trackpad / shift-wheel: a sideways gesture advances the reel,
    // mapped straight onto the same vertical scroll position everything reads.
    const stage = stageRef.current;
    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaX;
      if (Math.abs(dx) > Math.abs(e.deltaY) && dx !== 0) {
        e.preventDefault();
        window.scrollBy({ top: dx });
      }
    };

    // click-and-drag the lanes sideways (grab to scrub). Drag-left pulls the
    // film forward; we translate pointer dx into the shared scroll position.
    const lanesEl = lanesRef.current;
    let dragging = false;
    let lastX = 0;
    let startX = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("a")) return; // let links work
      dragging = true;
      lastX = e.clientX;
      startX = e.clientX;
      dragMovedRef.current = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      if (!dragMovedRef.current && Math.abs(e.clientX - startX) > 5) {
        dragMovedRef.current = true;
        lanesEl?.classList.add("is-dragging");
      }
      if (dragMovedRef.current) window.scrollBy({ top: -dx });
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      lanesEl?.classList.remove("is-dragging");
      // keep the flag through the click that immediately follows, then clear it
      if (dragMovedRef.current) window.setTimeout(() => (dragMovedRef.current = false), 0);
    };

    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    if (stageRef.current) ro.observe(stageRef.current);
    measure();
    update();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    stage?.addEventListener("wheel", onWheel, { passive: false });
    lanesEl?.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      stage?.removeEventListener("wheel", onWheel);
      lanesEl?.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const onEnter = useCallback((item: ReelItem) => {
    setHover(item.project.slug);
    hoverAccentRef.current = item.accent;
    applyWashRef.current();
  }, []);
  const onLeave = useCallback(() => {
    setHover(null);
    hoverAccentRef.current = null;
    applyWashRef.current();
  }, []);

  return (
    <>
      <div className="deskTop" data-ui>
        <div className="deskSolos" role="group" aria-label="Jump to a track">
          {reelChapters.map((c, li) => (
            <button
              key={c.id}
              className={`deskSolo${active === c.id ? " is-solo" : ""}`}
              style={{ ["--accent"]: c.color } as React.CSSProperties}
              aria-current={active === c.id ? "true" : undefined}
              onClick={() => jumpTo(li)}
            >
              <span className="deskSoloDot" aria-hidden />
              {c.label}
              <span className="deskSoloCount">{c.items.length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="reelProgress" aria-hidden>
        <div className="reelProgressFill" ref={fillRef} />
      </div>

      <div className="reelOuter" ref={outerRef}>
        <div className="deskStage" ref={stageRef}>
          <div className="reelCanvasWrap">
            <ReelCore stateRef={coreState} />
          </div>
          <div className="reelWash" aria-hidden />

          {/* the playhead — a fixed vertical read line for the active lane */}
          <div className="deskPlayhead" aria-hidden>
            <span className="deskPlayheadCap" />
          </div>

          {/* intro overlay — fades out as you start scrubbing */}
          <div className="deskIntro" ref={introRef}>
            <p className="eyebrow">selected work — 2024 ··· 2026</p>
            <h1 className="reelTitle">
              The
              <br />
              Work
            </h1>
            <p className="reelLede">
              Three tracks — Main, Hackathon, Design — each played on its own.
              Scroll to move through a track; it scrubs edge to edge under the
              playhead, then hands off to the next. Hover any project to flood
              the room with its colour.
            </p>
            <span className="reelScrollHint" aria-hidden>
              scroll · swipe · drag <span className="reelScrollArrow">→</span>
            </span>
          </div>

          {/* the three lanes — only the active one scrubs; others recede */}
          <div className="deskLanes" ref={lanesRef}>
            {reelChapters.map((c, li) => (
              <div
                key={c.id}
                className="lane"
                data-lane={c.id}
                ref={(el) => {
                  laneRefs.current[li] = el;
                }}
                style={{ ["--accent"]: c.color } as React.CSSProperties}
              >
                <div className="laneStrip">
                  <span className="laneLead" aria-hidden />
                  {c.items.map((item) => (
                    <DeskCard
                      key={item.project.slug}
                      item={item}
                      live={armed[c.id] === item.project.slug || hover === item.project.slug}
                      hot={hover === item.project.slug}
                      onEnter={onEnter}
                      onLeave={onLeave}
                      onSkip={() => skipTo(li, item.project.slug)}
                    />
                  ))}
                  <span className="laneEnd" aria-hidden />
                </div>

                {/* persistent channel label — jumps to this track */}
                <button
                  className="laneRail"
                  onClick={() => jumpTo(li)}
                  aria-label={`Jump to ${c.label}`}
                  aria-current={active === c.id ? "true" : undefined}
                >
                  <span className="laneRailNum">{String(li + 1).padStart(2, "0")}</span>
                  <span className="laneRailLabel">{c.label}</span>
                  <span className="laneRailCount">{c.items.length}</span>
                </button>
              </div>
            ))}
          </div>

          {/* outro — fades in at the end of the desk */}
          <div className="deskOutro" ref={outroRef}>
            <p className="eyebrow">end of reel</p>
            <h2 className="outroTitle">Let&apos;s build the next one.</h2>
            <Link href="/contact" className="outroCta" transitionTypes={["nav-forward"]}>
              Start a conversation <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── one card in a lane — a framed, cycling screen + read-out ─────────────── */
function DeskCard({
  item,
  live,
  hot,
  onEnter,
  onLeave,
  onSkip,
}: {
  item: ReelItem;
  live: boolean;
  hot: boolean;
  onEnter: (item: ReelItem) => void;
  onLeave: () => void;
  onSkip: () => void;
}) {
  const { project: p, accent, shots, isBuild } = item;
  const [idx, setIdx] = useState(0);

  // cycle screenshots while live (armed under the playhead or hovered); hover
  // cycles a touch faster. When the clip goes cold the cleanup rewinds it.
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
      className={`deskCard${live ? " is-live" : ""}${hot ? " is-hot" : ""}`}
      data-slug={p.slug}
      tabIndex={0}
      onMouseEnter={() => onEnter(item)}
      onMouseLeave={onLeave}
      onFocus={() => onEnter(item)}
      onBlur={onLeave}
      style={{ ["--accent"]: accent } as React.CSSProperties}
    >
      <div
        className="deskCardScreen"
        role="button"
        tabIndex={-1}
        aria-label={`Bring ${p.title} under the playhead`}
        onClick={onSkip}
      >
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
