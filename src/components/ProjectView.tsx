"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ViewTransition } from "@/lib/viewTransition";
import MagneticLink from "@/components/MagneticLink";
import { projects, projectBySlug } from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

// Transform/opacity-only reveals — no animated blur, so scroll stays smooth.
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.22 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
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

  // Every way to actually try / dig into the project, in one row. The live site
  // is primary; demo videos, source, and Devpost follow as secondary actions.
  const actions: { label: string; href: string; primary: boolean }[] = [];
  if (p.href) actions.push({ label: p.cta ?? "Visit live", href: p.href, primary: true });
  for (const l of p.links ?? []) actions.push({ label: l.label, href: l.href, primary: false });

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
                {[p.role, p.year, p.status].filter(Boolean).join(" · ")}
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

              {/* actions — try it live, watch the demo, read the source */}
              {actions.length > 0 && (
                <motion.div className="pjActions" variants={item}>
                  {actions.map((a) =>
                    a.primary ? (
                      <MagneticLink
                        key={a.href}
                        href={a.href}
                        className="pjVisit"
                        strength={0.3}
                        external
                      >
                        {a.label} <span aria-hidden>↗</span>
                      </MagneticLink>
                    ) : (
                      <a
                        key={a.href}
                        href={a.href}
                        target="_blank"
                        rel="noreferrer"
                        className="pjLink"
                      >
                        {a.label} <span aria-hidden>↗</span>
                      </a>
                    )
                  )}
                </motion.div>
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

            {p.stack && p.stack.length > 0 && (
              <motion.div
                className="pjDetailFoot"
                variants={item}
                initial="hidden"
                animate="show"
              >
                <ul className="pjStackChips">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </motion.div>
            )}
          </article>

          {hero && (
            <motion.figure
              className="pjHeroShot"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: EASE }}
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

        {/* the numbers — punchy stats, finally on the page */}
        {p.metrics && p.metrics.length > 0 && (
          <section className="pjMetrics" aria-label="By the numbers">
            {p.metrics.map((m, idx) => (
              <motion.div
                className="pjMetric"
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.55, delay: idx * 0.07, ease: EASE }}
              >
                <span className="pjMetricVal">{m.value}</span>
                <span className="pjMetricLbl">{m.label}</span>
              </motion.div>
            ))}
          </section>
        )}

        {/* technical breakdown — how it actually works */}
        {p.breakdown && p.breakdown.length > 0 && (
          <section className="pjHow" aria-label="How it works">
            <motion.p
              className="eyebrow pjHowEyebrow"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              how it works
            </motion.p>
            <ol className="pjSteps">
              {p.breakdown.map((b, idx) => (
                <motion.li
                  className="pjStep"
                  key={b.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-12% 0px" }}
                  transition={{ duration: 0.5, delay: idx * 0.04, ease: EASE }}
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
                initial={{ opacity: 0, y: 56, scale: 0.975 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-18% 0px -12% 0px" }}
                transition={{ duration: 0.7, ease: EASE }}
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

        {/* up next — a deliberate step to the next chapter */}
        <motion.section
          className="pjNext"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          <Link
            href={`/work/${next.slug}`}
            className="pjNextLink"
            transitionTypes={["nav-forward"]}
          >
            <span className="pjNextKick">up next · chapter {next.index}</span>
            <span className="pjNextTitle">{next.title}</span>
            <span className="pjNextTagline">{next.tagline}</span>
            <span className="pjNextArrow" aria-hidden>
              →
            </span>
          </Link>
        </motion.section>

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
        </nav>

        <span className="sceneKicker" aria-hidden>
          project
        </span>
      </main>
    </ViewTransition>
  );
}
