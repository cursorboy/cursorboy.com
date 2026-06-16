// ───────────────────────────────────────────────────────────────────────────
//  THE REEL — data for the /work experience.
//  This augments the projects in portfolio.ts without touching them, so the
//  case-study pages (/work/[slug]) keep working. Edit THIS file to:
//   • move a project between chapters (Main · Hackathon · Design)
//   • give a project its colour-wash accent
//  Everything else (title, tagline, screenshots, links) is read from the
//  Project records in portfolio.ts.
// ───────────────────────────────────────────────────────────────────────────

import {
  projects,
  projectCategories,
  type Project,
  type ProjectCategory,
} from "./portfolio";

// The three chapters of the reel, in scroll order.
export type WorkGroupId = "main" | "hackathon" | "design";

export const workGroups: {
  id: WorkGroupId;
  label: string;
  blurb: string;
  color: string;
}[] = [
  {
    id: "main",
    label: "Main",
    blurb: "Full products — designed, built, and shipped end to end.",
    color: projectCategories.build.color, // warm terracotta
  },
  {
    id: "hackathon",
    label: "Hackathon",
    blurb: "Built fast, under the clock — one sitting, one sharp idea.",
    color: projectCategories.mini.color, // muted teal
  },
  {
    id: "design",
    label: "Design",
    blurb: "Interfaces, motion, and visual studies.",
    color: projectCategories.design.color, // dusty violet
  },
];

// Default chapter per portfolio category. Override per-slug in GROUP_OVERRIDE.
const GROUP_OF: Record<ProjectCategory, WorkGroupId> = {
  build: "main",
  mini: "hackathon",
  design: "design",
};
const GROUP_OVERRIDE: Partial<Record<string, WorkGroupId>> = {
  // "ai-vs-ai": "hackathon",
};

export type ReelItem = {
  project: Project;
  group: WorkGroupId;
  accent: string;
  shots: string[]; // screenshot srcs to cycle on hover
  isBuild: boolean;
};

function shotsFor(p: Project): string[] {
  const out: string[] = [];
  for (const s of p.images ?? []) {
    const src = typeof s === "string" ? s : s.src;
    if (src && !out.includes(src)) out.push(src);
  }
  if (out.length === 0 && p.image) out.push(p.image);
  return out;
}

function groupFor(p: Project): WorkGroupId {
  return GROUP_OVERRIDE[p.slug] ?? GROUP_OF[p.category];
}

// All projects, decorated for the reel and kept in portfolio order.
// Colour is a TRACK identity, not a per-project value: every project inherits
// its chapter's colour, so the wash/3D core read "which track am I in" rather
// than flickering a new hue per card.
export const reelItems: ReelItem[] = projects.map((project) => {
  const group = groupFor(project);
  return {
    project,
    group,
    accent: workGroups.find((g) => g.id === group)!.color,
    shots: shotsFor(project),
    isBuild: project.category === "build",
  };
});

// Items bucketed by chapter, in chapter order — what the reel actually renders.
export const reelChapters = workGroups.map((g) => ({
  ...g,
  items: reelItems.filter((it) => it.group === g.id),
}));
