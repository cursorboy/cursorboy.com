"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import Scene from "@/components/Scene";
import { reelChapters } from "@/content/work";
import type { ReelItem } from "@/content/work";

const EASE = [0.16, 1, 0.3, 1] as const;

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/**
 * Work — a calm, themed gallery. Projects are grouped into three parallel
 * categories (Main · Hackathon · Design) so nothing reads as one timeline.
 * Each card cycles its real screenshots on hover and carries its track colour;
 * builds open their full case study (with the title → hero morph) at /work/[slug].
 */
export default function WorkGallery() {
  // one project "awake" at a time — drives screenshot cycling + the hero morph
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Scene id="work">
      <div className="gWrap">
        <header className="gHead">
          <p className="eyebrow">selected work · shipped</p>
          <h1 className="gTitle">The work</h1>
          <p className="gLede">
            Things I&apos;ve designed and built — full products, hackathon
            sprints, and pure interface work. Three kinds of work, not one
            timeline.
          </p>
        </header>

        {reelChapters.map((chapter) => (
          <section
            key={chapter.id}
            className="gChapter"
            style={{ ["--g" as string]: chapter.color }}
          >
            <div className="gChapterHead">
              <span className="gDot" aria-hidden />
              <h2 className="gChapterTitle">{chapter.label}</h2>
              <span className="gChapterBlurb">{chapter.blurb}</span>
              <span className="gChapterCount">
                {String(chapter.items.length).padStart(2, "0")}
              </span>
            </div>

            <motion.div
              className="gGrid"
              variants={group}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              {chapter.items.map((item) => (
                <Card
                  key={item.project.slug}
                  item={item}
                  awake={hover === item.project.slug}
                  onWake={() => setHover(item.project.slug)}
                  onSleep={() =>
                    setHover((h) => (h === item.project.slug ? null : h))
                  }
                />
              ))}
            </motion.div>
          </section>
        ))}
      </div>
    </Scene>
  );
}

function Card({
  item,
  awake,
  onWake,
  onSleep,
}: {
  item: ReelItem;
  awake: boolean;
  onWake: () => void;
  onSleep: () => void;
}) {
  const { project: p, shots, isBuild } = item;
  const [frame, setFrame] = useState(0);

  // cycle screenshots only while awake and only if there's more than one;
  // the cleanup (which runs the moment the card sleeps) resets to the first shot
  useEffect(() => {
    if (!awake || shots.length < 2) return;
    const id = setInterval(
      () => setFrame((f) => (f + 1) % shots.length),
      1100
    );
    return () => {
      clearInterval(id);
      setFrame(0);
    };
  }, [awake, shots.length]);

  const Inner = (
    <>
      <div className="gShot" data-empty={shots.length === 0 ? "" : undefined}>
        {shots.length > 0 ? (
          shots.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="gShotImg"
              data-on={i === frame ? "" : undefined}
            />
          ))
        ) : (
          <span className="gShotMark" aria-hidden>
            {p.index}
          </span>
        )}
        {shots.length > 1 && (
          <span className="gShotDots" aria-hidden>
            {shots.map((_, i) => (
              <i key={i} data-on={i === frame ? "" : undefined} />
            ))}
          </span>
        )}
      </div>

      <div className="gMeta">
        <span className="gIndex">{p.index}</span>
        <span className="gYear">{p.year}</span>
      </div>

      <h3
        className="gName"
        style={awake && isBuild ? { viewTransitionName: "project-hero" } : undefined}
      >
        {p.title}
      </h3>
      <p className="gTagline">{p.tagline}</p>

      {p.stack && p.stack.length > 0 && (
        <ul className="gStack">
          {p.stack.slice(0, 4).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      <span className="gAction">
        {isBuild ? "Open breakdown" : p.cta ?? "Visit"}
        <span className="gArrow" aria-hidden>
          →
        </span>
      </span>
    </>
  );

  const shared = {
    className: "gCard",
    onMouseEnter: onWake,
    onMouseLeave: onSleep,
    onFocus: onWake,
    onBlur: onSleep,
    "data-awake": awake ? "" : undefined,
  };

  // builds → internal case study (keeps the scene transition + hero morph)
  if (isBuild) {
    return (
      <motion.div variants={card}>
        <Link href={`/work/${p.slug}`} transitionTypes={["nav-forward"]} {...shared}>
          {Inner}
        </Link>
      </motion.div>
    );
  }

  // everyone else → live link (or a static card if there's no link)
  return (
    <motion.div variants={card}>
      {p.href ? (
        <a href={p.href} target="_blank" rel="noreferrer" {...shared}>
          {Inner}
        </a>
      ) : (
        <div {...shared} data-static="">
          {Inner}
        </div>
      )}
    </motion.div>
  );
}
