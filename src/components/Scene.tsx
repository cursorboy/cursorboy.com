"use client";

import Link from "next/link";
import { ViewTransition } from "@/lib/viewTransition";
import { SCENES, type Scene as SceneT } from "@/content/scenes";

/**
 * Full-screen scene shell. Wraps a section page in a directional
 * `<ViewTransition>` (slide + blur, keyed to the nav-forward / nav-back
 * transition types carried by the originating link) and renders the persistent
 * travel rail: back-to-home, prev / next, and a quiet position stamp.
 *
 * The chrome (wordmark, theme toggle) lives one level up in SiteChrome and is
 * anchored so it stays put while the scene slides underneath it.
 */
export default function Scene({
  id,
  children,
}: {
  id: SceneT["id"];
  children: React.ReactNode;
}) {
  const i = SCENES.findIndex((s) => s.id === id);
  const scene = SCENES[i];
  const prev = SCENES[(i - 1 + SCENES.length) % SCENES.length];
  const next = SCENES[(i + 1) % SCENES.length];

  return (
    <ViewTransition
      enter={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "scene-in",
      }}
      exit={{
        "nav-forward": "nav-forward",
        "nav-back": "nav-back",
        default: "none",
      }}
      default="none"
    >
      <main className={`scene scene-${id}`}>
        {children}

        <nav className="sceneRail" data-ui>
          <Link
            href={prev.href}
            className="railLink"
            transitionTypes={["nav-back"]}
          >
            <span className="railArrow" aria-hidden>
              ←
            </span>
            <span className="railLabel">{prev.label}</span>
          </Link>

          <span className="railPos">
            {String(i + 1).padStart(2, "0")}
            <span className="railSlash"> / </span>
            {String(SCENES.length).padStart(2, "0")}
          </span>

          <Link
            href={next.href}
            className="railLink railNext"
            transitionTypes={["nav-forward"]}
          >
            <span className="railLabel">{next.label}</span>
            <span className="railArrow" aria-hidden>
              →
            </span>
          </Link>
        </nav>

        <span className="sceneKicker" aria-hidden>
          {scene.kicker}
        </span>
      </main>
    </ViewTransition>
  );
}
