"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Scene from "@/components/Scene";
import {
  inspirations,
  inspirationKinds,
  type InspoKind,
} from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

const wall: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } },
};
const tileV: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

type Filter = "all" | InspoKind;

export default function InspirationPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = useMemo(
    () =>
      filter === "all"
        ? inspirations
        : inspirations.filter((it) => it.kind === filter),
    [filter]
  );

  return (
    <Scene id="inspiration">
      <section className="inspoScene">
        <header className="inspoHead">
          <p className="eyebrow inspoEyebrow">moodboard · what moves me</p>
          <h1 className="inspoTitle">The wall I steal from.</h1>
          <p className="inspoLede">
            Art and design that rewires how I build — the studios, pieces, and
            subcultures I keep coming back to.
          </p>
        </header>

        <nav className="inspoFilters" aria-label="Filter the wall">
          <button
            type="button"
            className={`inspoPill ${filter === "all" ? "is-on" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          {inspirationKinds.map((k) => (
            <button
              key={k.id}
              type="button"
              className={`inspoPill ${filter === k.id ? "is-on" : ""}`}
              onClick={() => setFilter(k.id)}
            >
              {k.label}
            </button>
          ))}
        </nav>

        <motion.div
          className="inspoWall"
          variants={wall}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="popLayout">
            {items.map((it) => (
              <motion.div
                key={it.title}
                layout
                variants={tileV}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  filter: "blur(6px)",
                  transition: { duration: 0.22, ease: EASE },
                }}
                className={`inspoTile ${it.span === 2 ? "is-wide" : ""}`}
                data-kind={it.kind}
              >
                {it.href ? (
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inspoCard"
                  >
                    <TileBody it={it} />
                  </a>
                ) : (
                  <div className="inspoCard">
                    <TileBody it={it} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>
    </Scene>
  );
}

function TileBody({ it }: { it: (typeof inspirations)[number] }) {
  return (
    <>
      <span className="inspoMedia" aria-hidden>
        {it.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={it.image} alt="" loading="lazy" />
        ) : (
          <span className="inspoMono">{it.title[0]}</span>
        )}
      </span>
      <span className="inspoMeta">
        <span className="inspoKind">{it.kind}</span>
        <span className="inspoName">{it.title}</span>
        {it.by && <span className="inspoBy">{it.by}</span>}
        {it.note && <span className="inspoNote">{it.note}</span>}
        {it.href && (
          <span className="inspoLink" aria-hidden>
            visit →
          </span>
        )}
      </span>
    </>
  );
}
