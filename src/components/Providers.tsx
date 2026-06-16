"use client";

import { MotionConfig } from "motion/react";

/**
 * Honors the OS "reduce motion" setting across every Framer animation:
 * transforms/layout animations are dropped, opacity fades are kept.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
