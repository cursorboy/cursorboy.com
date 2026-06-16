import WorkReel from "@/components/WorkReel";

/**
 * Work — "The Reel". A pinned horizontal film of every project: vertical scroll
 * scrubs the strip sideways past a persistent Three.js core, projects are
 * grouped into chapters (Main · Hackathon · Design), and hovering one cycles
 * its real screenshots while flooding the page with its accent. Builds morph
 * into their full case study at /work/[slug].
 */
export default function WorkPage() {
  return <WorkReel />;
}
