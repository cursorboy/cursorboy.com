"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useSpring } from "motion/react";
import Scene from "@/components/Scene";
import { chapters, appendix, type CatalogEntry } from "@/content/catalog";

/**
 * THE INDEX — /work as a depth-first entry point.
 *
 * Leads with the full builds: each one is its own emphasized chapter, with a
 * stat teaser so its breadth reads before you even click through. Everything
 * else collects into a tighter "also built" appendix. The single flourish is
 * on-brand for cursorboy: a screenshot peeks out and trails your cursor.
 */

const MotionLink = motion.create(Link);

type Peek = { shots: string[]; title: string } | null;

export default function WorkIndex() {
  // The floating preview that trails the cursor.
  const [peek, setPeek] = useState<Peek>(null);
  const [shot, setShot] = useState(0);
  // Soft springs → the peek eases toward the cursor instead of snapping.
  const px = useSpring(0, { stiffness: 220, damping: 26, mass: 0.6 });
  const py = useSpring(0, { stiffness: 220, damping: 26, mass: 0.6 });
  const visible = useRef(false);

  // Track the pointer globally while a row is active; offset so the frame sits
  // up-and-right of the caret, never under it.
  useEffect(() => {
    function onMove(e: PointerEvent) {
      if (!visible.current) return;
      px.set(e.clientX + 26);
      py.set(e.clientY - 150);
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);

  // Cycle the screenshots while a multi-shot entry is hovered.
  useEffect(() => {
    if (!peek || peek.shots.length < 2) return;
    const id = window.setInterval(
      () => setShot((s) => (s + 1) % peek.shots.length),
      1100
    );
    return () => window.clearInterval(id);
  }, [peek]);

  function wake(entry: CatalogEntry, e: React.PointerEvent) {
    if (entry.shots.length === 0 || e.pointerType !== "mouse") return;
    visible.current = true;
    setShot(0);
    setPeek({ shots: entry.shots, title: entry.project.title });
    // Seed the spring at the current cursor so it doesn't fly in from 0,0.
    px.jump(e.clientX + 26);
    py.jump(e.clientY - 150);
  }
  function sleep() {
    visible.current = false;
    setPeek(null);
  }

  return (
    <Scene id="work">
      <div className="ixWrap">
        <header className="ixHead">
          <p className="eyebrow">selected work</p>
          <h1 className="ixTitle">The Index</h1>
          <p className="ixLede">
            The builds come first — each one is its own chapter: what it is, how
            it works, and the numbers behind it. Read one all the way through
            before the next. Everything else lives below.
          </p>
        </header>

        {/* Chapters — the full builds, each an immersive case study. */}
        <section className="ixSection ixSection--lead">
          <div className="ixSectionHead">
            <span className="ixKicker">builds</span>
            <h2 className="ixSectionTitle">Chapters</h2>
            <span className="ixSectionNote">
              Full products — each its own read.
            </span>
          </div>
          <ul className="ixList ixList--lead">
            {chapters.map((entry) => (
              <Row
                key={entry.project.slug}
                entry={entry}
                lead
                onWake={wake}
                onSleep={sleep}
              />
            ))}
          </ul>
        </section>

        {/* Appendix — everything else, tighter. */}
        {appendix.length > 0 && (
          <section className="ixSection ixSection--appendix">
            <div className="ixSectionHead">
              <span className="ixKicker">also built</span>
              <h2 className="ixSectionTitle">Hackathons, orgs &amp; interfaces</h2>
              <span className="ixSectionNote">
                Shipped fast, founded, or designed.
              </span>
            </div>
            <ul className="ixList">
              {appendix.map((entry) => (
                <Row
                  key={entry.project.slug}
                  entry={entry}
                  onWake={wake}
                  onSleep={sleep}
                />
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* The cursor peek — one shared frame, trailing the pointer. */}
      <motion.div
        className="ixPeek"
        data-ui
        aria-hidden
        style={{ x: px, y: py }}
        data-on={peek ? "" : undefined}
      >
        {peek && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={peek.shots[shot]}
              src={peek.shots[shot]}
              alt=""
              className="ixPeekImg"
              draggable={false}
            />
            <span className="ixPeekTag">{peek.title}</span>
          </>
        )}
      </motion.div>
    </Scene>
  );
}

function Row({
  entry,
  lead = false,
  onWake,
  onSleep,
}: {
  entry: CatalogEntry;
  lead?: boolean;
  onWake: (e: CatalogEntry, ev: React.PointerEvent) => void;
  onSleep: () => void;
}) {
  const { project: p, isBuild, role, blurb } = entry;
  const [hot, setHot] = useState(false);
  const href = isBuild ? `/work/${p.slug}` : p.href;
  const external = !isBuild && !!p.href;
  const desc = blurb ?? p.tagline;
  const right = role ?? p.year;
  const action = isBuild ? "Read chapter" : external ? p.cta ?? "Visit" : "—";
  // Lead rows surface a stat teaser so breadth reads before the click.
  const stats = lead ? p.metrics?.slice(0, 3) ?? [] : [];

  const inner = (
    <>
      <span className="ixIndex">{p.index}</span>
      <span className="ixBody">
        <span className="ixNameRow">
          <span className="ixName">{p.title}</span>
          <span className="ixRight">{right}</span>
        </span>
        <span className="ixDesc">{desc}</span>
        {stats.length > 0 && (
          <span className="ixStats" aria-hidden>
            {stats.map((m) => (
              <span className="ixStat" key={m.label}>
                <span className="ixStatVal">{m.value}</span>
                <span className="ixStatLbl">{m.label}</span>
              </span>
            ))}
          </span>
        )}
      </span>
      <span className="ixAction">
        <span className="ixActionLabel">{action}</span>
        <span className="ixArrow" aria-hidden>
          {external ? "↗" : "→"}
        </span>
      </span>
    </>
  );

  const shared = {
    className: `ixRow${lead ? " ixRow--lead" : ""}`,
    onPointerEnter: (e: React.PointerEvent) => {
      setHot(true);
      onWake(entry, e);
    },
    onPointerLeave: () => {
      setHot(false);
      onSleep();
    },
  };

  // Builds → internal case study; the hovered row carries `project-hero` so its
  // title morphs into the case-study hero (same shared name WorkGallery uses —
  // only one row is hot at a time, so the name is unique on the page).
  if (isBuild) {
    return (
      <li>
        <MotionLink
          href={href!}
          transitionTypes={["nav-forward"]}
          style={hot ? { viewTransitionName: "project-hero" } : undefined}
          {...shared}
        >
          {inner}
        </MotionLink>
      </li>
    );
  }
  // External link (orgs / hackathons / interfaces with a live site).
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noreferrer" {...shared}>
          {inner}
        </a>
      </li>
    );
  }
  // No link yet — a static row.
  return (
    <li>
      <div {...shared} data-static>
        {inner}
      </div>
    </li>
  );
}
