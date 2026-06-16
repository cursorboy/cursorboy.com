"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import Scene from "@/components/Scene";
import SkillConstellation from "@/components/SkillConstellation";
import { about, person, photos } from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.25 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(7px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: EASE },
  },
};
const meta: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.9, ease: EASE },
  },
};

export default function AboutPage() {
  // floating collage; fill from `photos`, placeholder otherwise
  const frames = [photos[0], photos[1], photos[2]];

  return (
    <Scene id="about">
      <div className="aboutTop">
        {/* ── left: the bio ───────────────────────────────────────────────── */}
        <section className="aboutWrap">
          <p className="eyebrow aboutEyebrow">readme · about</p>

          <motion.div
            className="aboutBody"
            variants={group}
            initial="hidden"
            animate="show"
          >
            {about.map((para, pi) => (
              <p key={pi} className="aboutPara">
                {para.split(" ").map((w, wi) => (
                  <Fragment key={wi}>
                    <motion.span className="aboutWord" variants={word}>
                      {w}
                    </motion.span>{" "}
                  </Fragment>
                ))}
              </p>
            ))}
          </motion.div>

          <motion.dl
            className="aboutMeta"
            variants={meta}
            initial="hidden"
            animate="show"
          >
            <div>
              <dt>based</dt>
              <dd>{person.location}</dd>
            </div>
            <div>
              <dt>doing</dt>
              <dd>{person.role}</dd>
            </div>
            <div>
              <dt>reach</dt>
              <dd>
                <a href={`mailto:${person.email}`} className="aboutMail">
                  {person.email}
                </a>
              </dd>
            </div>
          </motion.dl>
        </section>

        {/* ── right: photos of me, a floating collage ─────────────────────── */}
        <div className="aboutPhotos">
          {frames.map((src, i) => (
            <figure key={i} className={`aboutPhoto aboutPhoto${i + 1}`}>
              <div className="aboutPhotoInner">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${person.first} ${person.last}`} />
                ) : (
                  <span className="aboutPhotoEmpty" aria-hidden>
                    portrait
                  </span>
                )}
              </div>
            </figure>
          ))}
        </div>
      </div>

      {/* ── below: the toolkit ────────────────────────────────────────────── */}
      <section className="aboutSkills">
        <p className="eyebrow aboutSkillsEyebrow">toolkit · what I work with</p>
        <SkillConstellation />
      </section>
    </Scene>
  );
}
