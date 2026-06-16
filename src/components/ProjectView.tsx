"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ViewTransition } from "@/lib/viewTransition";
import MagneticLink from "@/components/MagneticLink";
import { projects, projectBySlug } from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(5px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE },
  },
};

export default function ProjectView({ slug }: { slug: string }) {
  const p = projectBySlug(slug);
  if (!p) return null;

  // prev / next cycle within the case-study builds only
  const builds = projects.filter((x) => x.category === "build");
  const bi = builds.findIndex((x) => x.slug === slug);
  const next = builds[(bi + 1) % builds.length];

  // normalize example screens → [{src, caption}]
  const shots = (p.images?.length ? p.images : p.image ? [p.image] : []).map(
    (s) => (typeof s === "string" ? { src: s, caption: undefined } : s)
  );
  const hero = shots[0];
  const rest = shots.slice(1);

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
      <main className="scene pjScene">
        {/* two-column hero: the story on the left, the first screen on the right */}
        <div className={`pjHero ${hero ? "" : "pjHero--solo"}`}>
          <article className="pjDetail">
            <motion.div variants={group} initial="hidden" animate="show">
              <motion.p className="eyebrow pjDetailEyebrow" variants={item}>
                {p.role} · {p.year}
              </motion.p>
              <motion.h1
                className="pjTitle pjDetailTitle"
                variants={item}
                style={{ viewTransitionName: "project-hero" }}
              >
                {p.title}
              </motion.h1>
              <motion.p className="pjDetailTagline" variants={item}>
                {p.tagline}
              </motion.p>
              {p.overview && (
                <motion.p className="pjDetailOverview" variants={item}>
                  {p.overview}
                </motion.p>
              )}
            </motion.div>

            {p.highlights && p.highlights.length > 0 && (
              <motion.ul
                className="pjHighlights"
                variants={group}
                initial="hidden"
                animate="show"
              >
                {p.highlights.map((h, idx) => (
                  <motion.li key={idx} className="pjHighlight" variants={item}>
                    <span className="pjHiMark" aria-hidden />
                    {h}
                  </motion.li>
                ))}
              </motion.ul>
            )}

            <motion.div
              className="pjDetailFoot"
              variants={item}
              initial="hidden"
              animate="show"
            >
              <ul className="pjStackChips">
                {p.stack?.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {p.href && (
                <MagneticLink
                  href={p.href}
                  className="pjVisit"
                  strength={0.3}
                  external
                >
                  {p.cta ?? "Visit"} <span aria-hidden>↗</span>
                </MagneticLink>
              )}
            </motion.div>
          </article>

          {hero && (
            <motion.figure
              className="pjHeroShot"
              initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
            >
              <div className="pjShotBar" aria-hidden>
                <i />
                <i />
                <i />
                <span className="pjShotUrl">{p.cta ?? p.slug}</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hero.src} alt={`${p.title} — screen 1`} />
              {hero.caption && <figcaption className="pjShotCap">{hero.caption}</figcaption>}
            </motion.figure>
          )}
        </div>

        {/* technical breakdown — how it actually works */}
        {p.breakdown && p.breakdown.length > 0 && (
          <section className="pjHow" aria-label="How it works">
            <motion.p
              className="eyebrow pjHowEyebrow"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              how it works
            </motion.p>
            <ol className="pjSteps">
              {p.breakdown.map((b, idx) => (
                <motion.li
                  className="pjStep"
                  key={b.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-12% 0px" }}
                  transition={{ duration: 0.6, delay: idx * 0.05, ease: EASE }}
                >
                  <span className="pjStepNum">{String(idx + 1).padStart(2, "0")}</span>
                  <div className="pjStepBody">
                    <h3 className="pjStepTitle">{b.step}</h3>
                    <p className="pjStepDetail">{b.detail}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>
        )}

        {/* the remaining screens, an immersive scroll-through */}
        {rest.length > 0 && (
          <section className="pjShots" aria-label={`${p.title} screens`}>
            <span className="pjShotsLine" aria-hidden />
            {rest.map((s, idx) => (
              <motion.figure
                className="pjShot"
                key={s.src}
                initial={{ opacity: 0, y: 70, scale: 0.965, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-18% 0px -12% 0px" }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <div className="pjShotBar" aria-hidden>
                  <i />
                  <i />
                  <i />
                  <span className="pjShotUrl">{p.cta ?? p.slug}</span>
                  <span className="pjShotIdx">
                    {String(idx + 2).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
                  </span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={`${p.title} — screen ${idx + 2}`} loading="lazy" />
                {s.caption && <figcaption className="pjShotCap">{s.caption}</figcaption>}
              </motion.figure>
            ))}
          </section>
        )}

        <nav className="sceneRail" data-ui>
          <Link href="/work" className="railLink" transitionTypes={["nav-back"]}>
            <span className="railArrow" aria-hidden>
              ←
            </span>
            <span className="railLabel">All work</span>
          </Link>

          <span className="railPos">
            {p.index}
            <span className="railSlash"> / </span>
            {String(builds.length).padStart(2, "0")}
          </span>

          <Link
            href={`/work/${next.slug}`}
            className="railLink railNext"
            transitionTypes={["nav-forward"]}
          >
            <span className="railLabel">{next.title}</span>
            <span className="railArrow" aria-hidden>
              →
            </span>
          </Link>
        </nav>

        <span className="sceneKicker" aria-hidden>
          project
        </span>
      </main>
    </ViewTransition>
  );
}
