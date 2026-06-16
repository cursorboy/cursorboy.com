"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring } from "motion/react";
import Link from "next/link";
import { SCENES } from "@/content/scenes";

const MotionLink = motion.create(Link);

/** A section label that drifts toward the cursor when it's near — softly. */
function Item({
  href,
  kicker,
  label,
}: {
  href: string;
  kicker: string;
  label: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  // soft springs → the pull eases in and out, never snaps
  const x = useSpring(0, { stiffness: 90, damping: 16, mass: 0.8 });
  const y = useSpring(0, { stiffness: 90, damping: 16, mass: 0.8 });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const R = 130; // how close the cursor must be to attract
    function onMove(e: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < R) {
        const f = 1 - dist / R;
        x.set(dx * 0.32 * f);
        y.set(dy * 0.32 * f);
      } else {
        x.set(0);
        y.set(0);
      }
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  // hovering a label tells the cursor field to spell that section
  function onEnter() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    window.dispatchEvent(
      new CustomEvent("kinetic:spell", { detail: { text: label.toLowerCase() } })
    );
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      className="indexLink"
      transitionTypes={["nav-forward"]}
      style={{ x, y }}
      onPointerEnter={onEnter}
    >
      <span className="indexKicker">{kicker}</span>
      <span className="indexLabel">{label}</span>
      <span className="indexArrow" aria-hidden>
        →
      </span>
    </MotionLink>
  );
}

export default function MagneticIndex() {
  // leaving the whole nav (not just moving between buttons) melts back to the name
  function onLeave() {
    window.dispatchEvent(new CustomEvent("kinetic:unspell"));
  }
  return (
    <nav className="homeIndex" aria-label="Sections" onPointerLeave={onLeave}>
      {SCENES.map((s) => (
        <Item key={s.id} href={s.href} kicker={s.kicker} label={s.label} />
      ))}
    </nav>
  );
}
