"use client";

import { Fragment } from "react";
import { motion, type Variants } from "motion/react";
import Scene from "@/components/Scene";
import MagneticLink from "@/components/MagneticLink";
import { person, links } from "@/content/portfolio";

const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};
const char: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  show: {
    opacity: 1,
    y: "0em",
    transition: { duration: 0.55, ease: EASE },
  },
};
const fade: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.85, ease: EASE },
  },
};

const HEADLINE = "let's make\nsomething.";

export default function ContactPage() {
  return (
    <Scene id="contact">
      <section className="contactWrap">
        <motion.span className="contactStatus" variants={fade} initial="hidden" animate="show">
          <span className="statusDot" aria-hidden />
          available for new work
        </motion.span>

        <motion.h1
          className="contactHeadline"
          variants={group}
          initial="hidden"
          animate="show"
          aria-label={HEADLINE.replace("\n", " ")}
        >
          {HEADLINE.split("\n").map((line, li) => (
            <span className="contactLine" key={li}>
              {[...line].map((c, ci) => (
                <Fragment key={ci}>
                  <motion.span
                    className="contactChar"
                    variants={char}
                    aria-hidden
                  >
                    {c === " " ? " " : c}
                  </motion.span>
                </Fragment>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.div className="contactReach" variants={fade} initial="hidden" animate="show">
          <MagneticLink
            href={`mailto:${person.email}`}
            className="contactEmail"
            strength={0.22}
          >
            {person.email}
          </MagneticLink>

          <ul className="contactSocials">
            {links.map((l) => (
              <li key={l.label}>
                <MagneticLink
                  href={l.href}
                  className="contactSocial"
                  strength={0.45}
                  external={l.href.startsWith("http")}
                >
                  {l.label}
                </MagneticLink>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </Scene>
  );
}
