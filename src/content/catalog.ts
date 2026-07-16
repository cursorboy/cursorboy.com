// ───────────────────────────────────────────────────────────────────────────
//  THE INDEX — data for the /work page.
//  A flat, readable catalog of everything Piam has made, grouped into honest
//  sections. This re-buckets the projects in portfolio.ts WITHOUT touching them
//  (so the /work/[slug] case studies keep working) and gives the organizations
//  a real home + their actual role, instead of being filed under "design".
//
//  Edit THIS file to move an entry between sections, reorder, or add a role.
//  Title / tagline / screenshots / links are all read from portfolio.ts.
// ───────────────────────────────────────────────────────────────────────────

import { projects, projectBySlug, type Project } from "./portfolio";

export type CatalogSectionId =
  | "products"
  | "hackathons"
  | "organizations"
  | "interfaces";

export type CatalogEntry = {
  project: Project;
  shots: string[]; // screenshots, for the cursor peek
  isBuild: boolean; // builds get a /work/[slug] breakdown
  role?: string; // overrides for the org entries (their real title)
  blurb?: string; // optional descriptor override
};

export type CatalogSection = {
  id: CatalogSectionId;
  label: string;
  kicker: string; // small mono label above the section
  note: string; // one honest line on what lives here
  entries: CatalogEntry[];
};

// Which section each project lives in, by slug. Anything not listed falls back
// to its portfolio category mapping below.
const SECTION_OF_SLUG: Record<string, CatalogSectionId> = {
  // Products — full builds, shipped end to end
  yourvault: "products",
  "ai-vs-ai": "products",
  "program-design": "products",
  "bias-graph": "products",
  "sleep-vision": "products",
  "cyber-sim-lab": "products",
  // Hackathons — one sitting, one sharp idea
  "hold-that-thought": "hackathons",
  paragon: "hackathons",
  legaleval: "hackathons",
  // Organizations — things founded / run, beyond a single app
  "ucsb-sep": "organizations",
  "consult-your-community": "organizations",
  // Interfaces — pure interface / design work
  collabboard: "interfaces",
};

// The real role/title for the org entries (from experience.ts), so they read as
// things Piam built or runs — not just websites he designed.
const ROLE_OF_SLUG: Record<string, string> = {
  "ucsb-sep": "Co-founder & President",
  "consult-your-community": "Business Analyst",
};

// A tighter descriptor where the case-study tagline is too long for one line.
const BLURB_OF_SLUG: Record<string, string> = {
  "ucsb-sep":
    "Co-founded and built UCSB's premier business & entrepreneurship fraternity from the ground up — site, brand, and chapter.",
  "consult-your-community":
    "Pro-bono strategy for local businesses through UCSB's chapter — and the marketing site that recruits for it.",
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

function entryFor(slug: string): CatalogEntry | null {
  const project = projectBySlug(slug);
  if (!project) return null;
  return {
    project,
    shots: shotsFor(project),
    isBuild: project.category === "build",
    role: ROLE_OF_SLUG[slug],
    blurb: BLURB_OF_SLUG[slug],
  };
}

// Section definitions, in page order. Entries are pulled in portfolio order so
// the strongest work stays on top within each section.
const SECTION_DEFS: Omit<CatalogSection, "entries">[] = [
  {
    id: "products",
    label: "Products",
    kicker: "shipped",
    note: "Full products — designed, built, and shipped end to end.",
  },
  {
    id: "hackathons",
    label: "Hackathons",
    kicker: "under the clock",
    note: "Built fast, one sitting, one sharp idea.",
  },
  {
    id: "organizations",
    label: "Organizations",
    kicker: "from the ground up",
    note: "Things I've founded and run — not just code.",
  },
  {
    id: "interfaces",
    label: "Interfaces",
    kicker: "design",
    note: "Interface, motion, and visual work.",
  },
];

function sectionIdOf(p: Project): CatalogSectionId {
  return (
    SECTION_OF_SLUG[p.slug] ??
    (p.category === "build"
      ? "products"
      : p.category === "mini"
        ? "hackathons"
        : "interfaces")
  );
}

export const catalog: CatalogSection[] = SECTION_DEFS.map((def) => ({
  ...def,
  entries: projects
    .filter((p) => sectionIdOf(p) === def.id)
    .map((p) => entryFor(p.slug))
    .filter((e): e is CatalogEntry => e !== null),
})).filter((s) => s.entries.length > 0);

export const catalogCount = catalog.reduce((n, s) => n + s.entries.length, 0);

// ── Chapters vs appendix ─────────────────────────────────────────────────────
// The index leads with the full builds — each one earns its own immersive
// chapter at /work/[slug]. Everything else (hackathons, organizations, and
// interface work) collects into a single tighter "also built" appendix, so the
// page reads as depth-first, not a tally.
export const chapters: CatalogEntry[] = catalog
  .filter((s) => s.id === "products")
  .flatMap((s) => s.entries);

export const appendix: CatalogEntry[] = catalog
  .filter((s) => s.id !== "products")
  .flatMap((s) => s.entries);
