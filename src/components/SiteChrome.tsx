"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { person } from "@/content/portfolio";
import { SCENES } from "@/content/scenes";

/**
 * Persistent chrome that survives every route change: the wordmark (home),
 * the theme toggle, the footer stamp, and global keyboard navigation.
 *
 * It is anchored during view transitions (see `view-transition-name: chrome`
 * in scenes.css) so it never slides — it is the one fixed reference point while
 * the scenes move underneath it.
 */
// The cursor museum — click the "." in cursorboy.com to cycle these.
const ARROW =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cpath d='M4 3 L4 19 L8.5 14.5 L11.5 20 L14 19 L11 13.5 L17 13.5 Z' fill='white' stroke='black' stroke-width='1.4' stroke-linejoin='round'/%3E%3C/svg%3E\") 4 3, auto";
const HOURGLASS =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Cg fill='black'%3E%3Crect x='5' y='3' width='14' height='2'/%3E%3Crect x='5' y='19' width='14' height='2'/%3E%3Cpath d='M6 5 H18 L12 12 Z'/%3E%3Cpath d='M12 12 L18 19 H6 Z'/%3E%3C/g%3E%3C/svg%3E\") 12 12, wait";
const CURSORS: { label: string; css: string }[] = [
  { label: "system", css: "auto" },
  { label: "arrow", css: ARROW },
  { label: "hourglass", css: HOURGLASS },
  { label: "hand", css: "pointer" },
  { label: "crosshair", css: "crosshair" },
  { label: "grab", css: "grabbing" },
  { label: "help", css: "help" },
];

export default function SiteChrome() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [cursorIdx, setCursorIdx] = useState(0);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";

  const cycleCursor = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCursorIdx((prev) => {
      const next = (prev + 1) % CURSORS.length;
      const c = CURSORS[next];
      document.documentElement.style.cursor = c.css === "auto" ? "" : c.css;
      setCursorLabel(c.label);
      window.clearTimeout((window as unknown as { __ct?: number }).__ct);
      (window as unknown as { __ct?: number }).__ct = window.setTimeout(
        () => setCursorLabel(null),
        1400
      );
      return next;
    });
  }, []);

  // ── theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const saved =
      (localStorage.getItem("theme") as "light" | "dark" | null) ?? "light";
    setTheme(saved);
    if (saved === "dark")
      document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    window.dispatchEvent(new Event("theme:change"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      if (next === "dark")
        document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", next);
      window.dispatchEvent(new Event("theme:change"));
      return next;
    });
  }, []);

  // ── keyboard travel: esc → home, ← → between scenes ───────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape" && !onHome) {
        router.push("/", { transitionTypes: ["nav-back"] });
        return;
      }
      if (onHome) return;
      const i = SCENES.findIndex((s) => s.href === pathname);
      if (i === -1) return;
      if (e.key === "ArrowRight") {
        const next = SCENES[(i + 1) % SCENES.length];
        router.push(next.href, { transitionTypes: ["nav-forward"] });
      } else if (e.key === "ArrowLeft") {
        const prev = SCENES[(i - 1 + SCENES.length) % SCENES.length];
        router.push(prev.href, { transitionTypes: ["nav-back"] });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onHome, pathname, router]);

  return (
    <>
      <header className="chrome chromeTop" data-vt="chrome">
        <Link
          href="/"
          className="markWrap"
          transitionTypes={["nav-back"]}
          aria-label="Home"
        >
          <span className="mark">
            cursorboy
            <span
              className="markDot"
              role="button"
              tabIndex={0}
              aria-label="Cycle cursor"
              title="click me"
              onClick={cycleCursor}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  cycleCursor(e as unknown as React.MouseEvent);
              }}
            >
              .
            </span>
            <span className="markDim">com</span>
            {cursorLabel && <span className="markCursorTag">{cursorLabel}</span>}
          </span>
          <span className="markNote">
            (not based off of cursor, this was my xbox360 username back in
            2012.)
          </span>
        </Link>
        <button className="themeToggle" onClick={toggleTheme} data-ui>
          <span className="themeDot" />
          {theme === "light" ? "light" : "dark"}
        </button>
      </header>

      <span className="chrome chromeStamp">est · 2026 · {person.location}</span>
    </>
  );
}
