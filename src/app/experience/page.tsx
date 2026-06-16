"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import Scene from "@/components/Scene";
import { experience } from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

const stage: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

function endYear(span: string) {
  const m = span.match(/\d{4}/g);
  return m ? m[m.length - 1] : "";
}

export default function ExperiencePage() {
  const [active, setActive] = useState(0);
  const rows = useRef<(HTMLLIElement | null)[]>([]);

  // drive the featured role off overall scroll progress, so the very top is the
  // first role (Sigma Eta Pi) and the very bottom is the last — every role in
  // between gets its turn as you scroll.
  useEffect(() => {
    const n = experience.length;
    function onScroll() {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      setActive(Math.round(f * (n - 1)));
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const r = experience[active];
  const progress = (active + 1) / experience.length;

  return (
    <Scene id="experience">
      <section className="expScene">
        {/* ── left: the scrolling changelog ─────────────────────────────── */}
        <div className="expStream">
          <p className="eyebrow expEyebrow">changelog · experience</p>

          <div className="expTrack">
            <span className="expLine" aria-hidden />
            <motion.span
              className="expLineFill"
              aria-hidden
              animate={{ scaleY: progress }}
              transition={{ duration: 0.6, ease: EASE }}
            />

            <ol className="expList">
              {experience.map((role, i) => (
                <li
                  key={role.org + role.span}
                  ref={(el) => {
                    rows.current[i] = el;
                  }}
                  data-i={i}
                  className={`expItem ${i === active ? "is-active" : ""} ${
                    role.current ? "is-current" : ""
                  }`}
                  onClick={() =>
                    rows.current[i]?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    })
                  }
                >
                  <span className="expLogo" aria-hidden>
                    {role.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={role.logo} alt="" loading="lazy" />
                    ) : (
                      <span className="expMono">{role.mono ?? role.org[0]}</span>
                    )}
                  </span>
                  <div className="expBody">
                    <span className="expSpan">{role.span}</span>
                    <h2 className="expTitle">{role.title}</h2>
                    <span className="expOrg">{role.org}</span>
                    {role.note && <p className="expNote">{role.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── right: the immersive stage that reacts to the active role ──── */}
        <aside className="expStage" aria-hidden>
          <span className="stageRing stageRing1" />
          <span className="stageRing stageRing2" />
          <span className="stageGlow" />

          <AnimatePresence mode="popLayout">
            <motion.span
              key={`ghost-${active}`}
              className="stageGhost"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              {endYear(r.span)}
            </motion.span>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="stageCard"
              variants={stage}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.25 } }}
            >
              <motion.span className="stageLogo" variants={rise}>
                {r.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.logo} alt={r.org} />
                ) : (
                  <span className="stageMono">{r.mono ?? r.org[0]}</span>
                )}
              </motion.span>
              <motion.span className="stageSpan" variants={rise}>
                {r.span}
              </motion.span>
              <motion.h3 className="stageTitle" variants={rise}>
                {r.title}
              </motion.h3>
              <motion.span className="stageOrg" variants={rise}>
                {r.org}
              </motion.span>
              {r.bullets && r.bullets.length > 0 && (
                <motion.ul className="stageBullets" variants={rise}>
                  {r.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </motion.ul>
              )}
              {r.tags && (
                <motion.ul className="stageTags" variants={rise}>
                  {r.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </motion.ul>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="stageCount">
            <span className="stageCountNow">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="stageCountAll">
              / {String(experience.length).padStart(2, "0")}
            </span>
          </div>
        </aside>
      </section>
    </Scene>
  );
}
