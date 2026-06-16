"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { skills } from "@/content/portfolio";

// Skill name → Simple Icons slug. Anything not listed renders as a clean word
// tile instead of a logo, so every skill is still in the field.
const ICON: Record<string, string> = {
  TypeScript: "typescript",
  JavaScript: "javascript",
  Python: "python",
  Go: "go",
  C: "c",
  R: "r",
  Swift: "swift",
  Scala: "scala",
  React: "react",
  "Next.js": "nextdotjs",
  "Node.js": "nodedotjs",
  SolidJS: "solid",
  FastAPI: "fastapi",
  Flask: "flask",
  PyTorch: "pytorch",
  Docker: "docker",
  Git: "git",
  PostgreSQL: "postgresql",
  FFmpeg: "ffmpeg",
  OpenAI: "openai",
  Java: "openjdk",
  // Local marks for brands Simple Icons no longer carries (trademark takedowns).
  AWS: "/logos/aws.svg",
  "AWS AI Practitioner": "/logos/aws.svg",
  "Eagle Scout": "/logos/eagle-scout.svg",
  "Red Cross CPR": "/logos/red-cross.svg",
};

const INK = "16130f"; // matches --ink

type Item = { name: string; group: string; slug?: string };

const ALL: Item[] = skills.flatMap((g) =>
  g.items.map((name) => ({ name, group: g.label, slug: ICON[name] }))
);
const GROUPS = ["All", ...skills.map((g) => g.label)];

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.018 } },
};
const pop: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

function Tile({ item }: { item: Item }) {
  const ref = useRef<HTMLLIElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [broke, setBroke] = useState(false);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 18, ry: px * 18 });
  }
  function reset() {
    setTilt({ rx: 0, ry: 0 });
  }

  const hasLogo = !!item.slug && !broke;
  const isLocal = !!item.slug?.startsWith("/");

  return (
    <motion.li
      ref={ref}
      layout
      variants={pop}
      className={`skillTile${hasLogo ? "" : " is-word"}`}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={
        {
          transform: `perspective(620px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        } as React.CSSProperties
      }
      data-group={item.group}
    >
      {hasLogo ? (
        <span className="skillTileMark" aria-hidden>
          {isLocal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="skillLogoLocal"
              src={item.slug}
              alt=""
              loading="lazy"
              onError={() => setBroke(true)}
            />
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="skillLogoMono"
                src={`https://cdn.simpleicons.org/${item.slug}/${INK}`}
                alt=""
                loading="lazy"
                onError={() => setBroke(true)}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="skillLogoColor"
                src={`https://cdn.simpleicons.org/${item.slug}`}
                alt=""
                loading="lazy"
              />
            </>
          )}
        </span>
      ) : null}
      <span className="skillTileName">{item.name}</span>
    </motion.li>
  );
}

export default function SkillConstellation() {
  const [active, setActive] = useState("All");
  const shown = active === "All" ? ALL : ALL.filter((i) => i.group === active);

  return (
    <div className="skillCloud">
      <div className="skillFilter" role="tablist" aria-label="Filter skills">
        {GROUPS.map((g) => (
          <button
            key={g}
            role="tab"
            aria-selected={active === g}
            className={`skillPill${active === g ? " is-on" : ""}`}
            onClick={() => setActive(g)}
          >
            {g}
            <span className="skillPillCount">
              {g === "All" ? ALL.length : ALL.filter((i) => i.group === g).length}
            </span>
          </button>
        ))}
      </div>

      <motion.ul
        className="skillField"
        variants={grid}
        initial="hidden"
        animate="show"
        key={active /* restagger on filter change */}
      >
        <AnimatePresence mode="popLayout">
          {shown.map((item) => (
            <Tile key={item.name} item={item} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
