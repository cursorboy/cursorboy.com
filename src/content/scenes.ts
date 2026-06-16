// ── Scene manifest ───────────────────────────────────────────────────────────
// One source of truth for the immersive pages. Drives the Home index, the
// keyboard travel order, and each scene's prev/next links. Order = travel order.

export type Scene = {
  id: "about" | "work" | "experience" | "contact";
  label: string;
  kicker: string;
  href: string;
};

export const SCENES: Scene[] = [
  { id: "about", label: "About", kicker: "readme", href: "/about" },
  { id: "work", label: "Work", kicker: "shipped", href: "/work" },
  { id: "experience", label: "Experience", kicker: "changelog", href: "/experience" },
  { id: "contact", label: "Let's talk", kicker: "ping", href: "/contact" },
];
