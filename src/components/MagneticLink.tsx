"use client";

import { useRef } from "react";
import { motion, useSpring } from "motion/react";

/**
 * A link/button that pulls toward the cursor. Pure motion values — no state.
 */
export default function MagneticLink({
  children,
  href,
  className,
  strength = 0.4,
  external,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  strength?: number;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </motion.a>
  );
}
