// ───────────────────────────────────────────────────────────────────────────
//  EDIT ME — this is the only file you need to touch to make the site "yours".
//  Everything on the page is driven by the data below. Swap the placeholder
//  copy for your real projects, roles, and links. Keep the shapes intact.
// ───────────────────────────────────────────────────────────────────────────

export const person = {
  first: "Piam",
  last: "Parekh",
  // One concrete line. Avoid buzzwords. Say what you actually do.
  role: "Engineer · security · math @ UCSB",
  // The hero sub-line, shown small under the giant name.
  pitch: "I've been breaking into things since I was twelve — now I mostly build them.",
  location: "San Francisco Bay Area",
  email: "piamparekh17@gmail.com",
} as const;

// Short paragraph for the About block. Two or three sentences, plain-spoken.
export const about = [
  "I won my first capture-the-flag at twelve — HackTheBox, well past midnight — and I've been hooked on taking systems apart ever since. The name cursorboy is left over from that era.",
  "These days I point the same instinct at building: an iMessage AI that remembers everything you watch, a neural net that reads media bias, an arcade where frontier models fight. I like turning rough ideas into things people can actually use.",
  "I'm at my best in client-facing rooms — hearing what someone actually needs, sitting with them, and turning it into something real.",
  "I care about motion that means something, interfaces you can feel, and the small secret details that reward people for paying attention. A few are hiding on this page.",
];

// Photos of you for the About page. Drop files in /public/me/ and list the paths
// here. Up to three show in the floating collage; leave empty for placeholders.
export const photos: string[] = [
  "/me/me-surf.jpg",
  "/me/me-market.jpg",
  "/me/me-sunset.jpg",
];

// ── Projects ────────────────────────────────────────────────────────────────
// Order matters: top of the list reads as your strongest work. Each project is
// its own immersive page at /work/[slug] — the richer the fields, the more
// welcoming the scene reads.
export type ProjectStatus = "shipped" | "building" | "concept";

// Which arc of the work wheel a project lives on. Each is colour-coded so the
// big builds, the quick one-sitting minis, and the pure design work read as
// distinct families while still spinning on the same wheel.
export type ProjectCategory = "build" | "mini" | "design";

export const projectCategories: Record<
  ProjectCategory,
  { label: string; blurb: string; color: string }
> = {
  build: {
    label: "Builds",
    blurb: "Full products, shipped end to end.",
    color: "#c2703d", // warm terracotta
  },
  mini: {
    label: "Mini",
    blurb: "Small, sharp, one-sitting builds.",
    color: "#4f8a7b", // muted teal
  },
  design: {
    label: "Design",
    blurb: "Interfaces & visual work.",
    color: "#9b6bb0", // dusty violet
  },
};

export type Metric = { value: string; label: string };

export type Project = {
  slug: string; // url segment — /work/[slug] (only `build` gets a case study)
  index: string; // "01", "02" — purely visual
  title: string;
  tagline: string; // the welcoming one-liner, shown big
  year: string;
  category: ProjectCategory; // build · mini · design — drives colour + the wheel
  // Everything below is required for a `build` (it earns a full case study) but
  // optional for `mini` / `design` cards, which just live on the wheel.
  role?: string; // "Solo developer", "Personal project"…
  status?: ProjectStatus; // drives the badge — building shows a live pulse
  overview?: string; // a short paragraph that sets the scene
  highlights?: string[]; // the concrete wins (numbers read best)
  // ordered "how it works" — a real technical breakdown shown on the project page
  breakdown?: { step: string; detail: string }[];
  metrics?: Metric[]; // 2–3 punchy stats shown big on the showcase
  stack?: string[]; // tools, 3–6
  // Primary screenshot (gallery thumbnail). Drop files in /public/work/.
  image?: string;
  // Example screens shown as an immersive scroll on the project page. Each can
  // be a bare path or {src, caption}. Falls back to `image` when omitted.
  images?: (string | { src: string; caption?: string })[];
  href?: string; // optional live link
  cta?: string; // label for that link, e.g. "yourvault.live"
  event?: string; // e.g. a hackathon name — "SB Hacks XII"
  // extra links shown on the reel card (demo video, Devpost, GitHub…)
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "yourvault",
    index: "01",
    category: "build",
    title: "yourvault",
    tagline: "An iMessage AI that turns every video you share into a searchable memory.",
    year: "2026",
    role: "Solo developer",
    status: "shipped",
    overview:
      "Text yourvault a TikTok, Reel, or YouTube link and it transcribes the video, watches it, and files it into a category it invents — searchable in seconds, all inside iMessage. Ask it anything later and an AI agent answers straight from your own library.",
    highlights: [
      "18-tool Claude agent runs your library straight from iMessage — semantic search, reminders, memory, category edits",
      "Staged worker: yt-dlp + ffmpeg → Whisper transcription → Claude vision on 4 keyframes → structured synthesis",
      "Recursive webhook rebuilds TikTok/IG/YouTube links even when iMessage strips the preview",
      "1536-dim OpenAI embeddings in Postgres pgvector; a nightly job consolidates near-duplicate memories",
      "Per-user “taste graph” of creator/topic/format/mood entities, rendered force-directed",
    ],
    breakdown: [
      {
        step: "Ingest",
        detail:
          "An inbound iMessage hits a FastAPI webhook that recursively digs the video URL out of the payload — even rebuilding TikTok / Instagram / YouTube links from CDN hosts when iMessage strips the preview — then drops a job on a Redis (RQ) queue.",
      },
      {
        step: "Understand",
        detail:
          "A staged worker runs the pipeline: yt-dlp + ffmpeg pull and trim the audio, OpenAI Whisper transcribes it, and Claude vision describes four evenly-spaced keyframes (or every image, for photo carousels).",
      },
      {
        step: "Synthesize",
        detail:
          "Claude Sonnet returns structured JSON — title, summary, tags, action items, and a category slug it invents on the fly, biased toward reusing your existing buckets.",
      },
      {
        step: "Remember",
        detail:
          "Everything is embedded with text-embedding-3-small (1536-dim) into Postgres pgvector and clustered; a nightly job consolidates near-duplicate memories, and per-save entities (creator / topic / format / mood) accrue into a force-directed taste graph.",
      },
      {
        step: "Converse",
        detail:
          "Back in the thread, an 18-tool Claude Haiku agent runs a bounded tool-use loop — semantic search, reminders, memory, category CRUD — and replies inline under the original reel.",
      },
    ],
    metrics: [
      { value: "1,100+", label: "waitlist signups" },
      { value: "<30s", label: "to save & index" },
      { value: "18", label: "iMessage agent tools" },
    ],
    stack: ["FastAPI", "Next.js", "Claude", "Whisper", "pgvector", "Redis / RQ"],
    image: "/work/yourvault-1.png",
    images: [
      { src: "/work/yourvault-1.png", caption: "yourvault.live — a smart home for every reel you forgot you saved." },
      { src: "/work/yourvault-app-1.png", caption: "Your collection — every saved reel auto-shelved, with what Vault has picked up about you on the right." },
      { src: "/work/yourvault-app-3.png", caption: "Ask your vault — it answers from your own library and the context it's saved." },
      { src: "/work/yourvault-app-2.png", caption: "Every save opens to its transcript, an AI summary, and tags." },
      { src: "/work/yourvault-3.png", caption: "And it lives in your texts — drop a link in iMessage, no app to download." },
    ],
    href: "https://yourvault.live",
    cta: "yourvault.live",
  },
  {
    slug: "ai-vs-ai",
    index: "02",
    category: "build",
    title: "AI vs AI",
    tagline: "A neon arcade where real frontier models fight — debate, chess, poker, CTF, live.",
    year: "2026",
    role: "Solo developer",
    status: "shipped",
    overview:
      "A neon arcade where real frontier models fight — GPT-5, Claude, Grok, Gemini, DeepSeek — across ~17 games like chess, poker, debate, and sandboxed CTF duels. Every move is a live model call, with a HUD tracking real cost and latency.",
    highlights: [
      "Real model-vs-model play via OpenRouter: GPT-5, Claude Sonnet 4.5, Grok 4.3, Gemini, DeepSeek + a Wildcard router",
      "~17 game modes — chess, poker (real Texas Hold'em engine), debate, Imposter, pitch-deck duels, and more",
      "CTF Duel runs each model's guard program in a true sandbox; wins are checked on real stdout, not the model's claim",
      "Live HUD aggregates per-model OpenRouter cost, tokens, and latency on every response",
      "Hand-built arcade: CRT/SVG filters, Web-Audio SFX + a 136-BPM soundtrack, announcer clips — one authored file",
    ],
    breakdown: [
      {
        step: "Insert coin",
        detail:
          "A video + CSS arcade intro (no WebGL) powers on a CRT cabinet and expands to a mode-select grid — all React 18 authored in a single file, minified with a custom esbuild step.",
      },
      {
        step: "Pick fighters",
        detail:
          "Each fighter maps to a real OpenRouter model slug — GPT-5, Claude Sonnet 4.5, Grok 4.3, Gemini 2.5, DeepSeek v3.1 — plus a Wildcard that routes to a random one each call.",
      },
      {
        step: "Play",
        detail:
          "Every move is a live model call through serverless endpoints (single completion + SSE streaming) with Anthropic prompt caching and provider routing. Some games run real engines — a unit-tested Texas Hold'em engine, a chess library.",
      },
      {
        step: "CTF duel",
        detail:
          "Models write real guard programs and attack each other; every crack is a true sandbox execution and the win is checked on real stdout, not the model's claim.",
      },
      {
        step: "Telemetry & sound",
        detail:
          "A live HUD aggregates per-model OpenRouter cost, tokens, and latency, while a Web-Audio engine synthesizes SFX and a 136-BPM soundtrack with per-model announcer clips.",
      },
    ],
    metrics: [
      { value: "6", label: "frontier models in the ring" },
      { value: "~17", label: "game modes" },
      { value: "live", label: "real model calls" },
    ],
    stack: ["React", "OpenRouter", "Web Audio", "Vercel", "TypeScript"],
    image: "/work/letaivsai-1.png",
    images: [
      { src: "/work/letaivsai-1.png", caption: "Insert a coin — the AI vs AI cabinet, CRT glow and all." },
      { src: "/work/aivsai-1.png", caption: "The mode-select grid: ~17 ways to pit models against each other." },
      { src: "/work/aivsai-2.png", caption: "Chat Battle — ChatGPT vs Grok, blind, with you (or another model) as judge." },
      { src: "/work/aivsai-3.png", caption: "Poker Night — a real Texas Hold'em engine, you against the models." },
      { src: "/work/aivsai-4.png", caption: "Chess — live model moves on a real board." },
      { src: "/work/aivsai-5.png", caption: "Code Duel — models write and run real code in a sandbox." },
    ],
    href: "https://letaivsai.com",
    cta: "letaivsai.com",
  },
  {
    slug: "program-design",
    index: "03",
    category: "build",
    title: "program-design",
    tagline: "See what your AI actually built — a verifiable map of any codebase.",
    year: "2026",
    role: "Solo developer",
    status: "shipped",
    overview:
      "A free tool that reads any AI-built app and draws a live map of it from the real code. When your agent says “done, I added login,” it checks that claim against the source and answers CONFIRMED, ABSENT, or UNDETERMINED — with a file:line receipt, never a guess.",
    highlights: [
      "Deterministic facts-graph extractor (ts-morph) — every node carries a file:line receipt and a confidence tier",
      "Three verdicts computed in code, not a second AI; a “no false ABSENT” invariant degrades to UNDETERMINED",
      "Narrator LLM fenced to fact-bound statements with a fail-closed lint — it can't fabricate",
      "Live SVG structure map over a 127.0.0.1-only, token-guarded daemon that re-extracts on change",
      "Installs as a Claude Code plugin in two lines; no API keys, no telemetry, runs locally",
    ],
    breakdown: [
      {
        step: "Extract",
        detail:
          "A deterministic extractor walks the repo with ts-morph and builds a facts graph — routes, server actions, middleware, env vars, Prisma models, frontend→route wiring — each node tagged with a file:line and a confidence tier. A file that won't parse becomes a ParseFailure and leaks no partial facts.",
      },
      {
        step: "Check",
        detail:
          "checkClaims() takes a structured claim manifest plus the graph and computes CONFIRMED / ABSENT / UNDETERMINED purely from code. ABSENT requires provable absence — an allowlisted pattern, evidence the rule actually ran, and no parse failure — otherwise it degrades to UNDETERMINED.",
      },
      {
        step: "Narrate",
        detail:
          "One LLM surface translates the claim in and narrates the facts out, fenced to fact-ID-bound statements with a fail-closed lint. It can phrase the verdict but never render or alter it.",
      },
      {
        step: "Map",
        detail:
          "`npx program-design live` starts a 127.0.0.1-only, token-guarded Node daemon that draws a live SVG structure map and re-extracts on every save (chokidar), long-polling the browser.",
      },
      {
        step: "Plug in",
        detail:
          "Ships as a Claude Code plugin: a SessionStart hook offers the live map, a Stop hook verifies the agent's “I added X” claims — two lines to install, fetched by npx, no config.",
      },
    ],
    metrics: [
      { value: "3", label: "verdicts, computed in code" },
      { value: "file:line", label: "receipt per claim" },
      { value: "0", label: "API keys or telemetry" },
    ],
    stack: ["TypeScript", "ts-morph", "Node", "Claude Code", "npm"],
    image: "/work/program-design-4.png",
    images: [
      { src: "/work/program-design-4.png", caption: "The live map — your app drawn from the real code: what people see, the servers, where data lives." },
      { src: "/work/program-design-2.png", caption: "Every box is drawn from the facts graph and carries a file:line receipt." },
      { src: "/work/program-design-3.png", caption: "Claim time: the agent says \"done\" and each statement is checked against the code." },
      { src: "/work/program-design-1.png", caption: "See what your AI actually built — the pitch." },
    ],
    href: "https://cursorboy.github.io/program-design/",
    cta: "program-design",
  },
  {
    slug: "bias-graph",
    index: "04",
    category: "build",
    title: "The Bias Graph",
    tagline: "A custom neural network that reads media bias the way an editor would — relative to everyone else.",
    year: "2026",
    role: "Solo developer",
    status: "shipped",
    overview:
      "Type a topic and The Bias Graph plots every outlet on a left-to-right spectrum, scored by a custom neural network trained on 1.2M article pairs. A distilled version runs live in your browser, and four games let you play against the model.",
    highlights: [
      "DeBERTa-v3, 8 heads + an adversarial outlet-invariance branch, trained on 1.2M cross-outlet article pairs",
      "94.6% concordance with AllSides across 312 outlets (88 GPU-hours on 4×A100s)",
      "A 67M-param distilled student runs in-browser — watch it vote and highlight the loaded words",
      "Four games: Bias Detective, Guess the Source, Compare Two Takes, Headline Rewrite",
    ],
    metrics: [
      { value: "94.6%", label: "AllSides concordance" },
      { value: "1.2M", label: "article pairs" },
      { value: "312", label: "outlets covered" },
    ],
    stack: ["PyTorch", "DeBERTa-v3", "transformers.js", "React", "FastAPI"],
    image: "/work/biasgraph-1.png",
    images: [
      { src: "/work/biasgraph-1.png", caption: "Type a topic — every outlet on one left-to-right spectrum, scored live." },
      { src: "/work/biasgraph-2.png", caption: "Play against the model: four short games that test how well you read framing." },
      { src: "/work/biasgraph-3.png", caption: "Run the model live in your tab — a real classifier downloads to the browser." },
      { src: "/work/biasgraph-4.png", caption: "The note: how the network was built, trained, and distilled." },
    ],
    href: "https://thebiasgraph.vercel.app",
    cta: "thebiasgraph.vercel.app",
  },
  {
    slug: "sleep-vision",
    index: "05",
    category: "build",
    title: "Sleep Vision",
    tagline: "A bedside camera that learns how you actually sleep.",
    year: "2024",
    role: "Personal project",
    status: "shipped",
    overview:
      "Apple Watch biometrics and a live video feed, fused on a sub-100ms timeline, with an LLM that compares each night to published sleep research and tells you what changed.",
    highlights: [
      "Apple Watch heart data synced to video within 100ms",
      "PyTorch + FFmpeg pipeline for real-time feature extraction",
      "LLM-generated nightly feedback grounded in research",
    ],
    breakdown: [
      {
        step: "Capture",
        detail:
          "An overhead camera and Apple Watch stream in parallel; heart-rate and motion are fused with the video on a sub-100ms shared timeline.",
      },
      {
        step: "Extract",
        detail:
          "A PyTorch + FFmpeg pipeline pulls real-time features from the feed — movement, position, restlessness — frame by frame.",
      },
      {
        step: "Explain",
        detail:
          "An LLM compares each night against published sleep research and writes plain-language feedback on what actually changed.",
      },
    ],
    metrics: [
      { value: "<100ms", label: "video ⇄ watch sync" },
      { value: "100%", label: "on-device" },
    ],
    stack: ["PyTorch", "FFmpeg", "Swift"],
    // image: "/work/sleep-vision.png",
  },

  // ── Hackathon track (category: "mini") ────────────────────────────────────
  // Built fast, one sharp idea each. These live only on the reel (no full
  // case-study page) — a tagline, stack, live link, and a screenshot or two.
  {
    slug: "hold-that-thought",
    index: "H1",
    category: "mini",
    title: "Hold That Thought",
    tagline:
      "A real-time fact-checker that listens to a conversation, transcribes it live, and surfaces facts about it on an iOS Live Activity — never breaking the flow.",
    year: "2026",
    status: "shipped",
    event: "SB Hacks XII",
    stack: ["React Native", "Deepgram", "Gemini", "Perplexity", "Swift"],
    href: "https://devpost.com/software/hold-that-thought",
    cta: "Devpost",
    links: [
      { label: "Watch demo", href: "https://www.youtube.com/watch?v=G25P_YxFZFk" },
      { label: "GitHub", href: "https://github.com/cursorboy/HoldThatThought" },
    ],
  },
  {
    slug: "paragon",
    index: "H2",
    category: "mini",
    title: "Paragon · Catalog Match",
    tagline:
      "Type industrial fastener shorthand like “SHCS 7/16 x 2-1/2” and a hand-rolled parser returns the right catalog row with calibrated confidence — no embeddings.",
    year: "2026",
    status: "shipped",
    stack: ["TypeScript", "Bun", "Custom parser", "Next.js"],
    image: "/work/paragon-1.png",
    href: "https://paragon-smoky.vercel.app",
    cta: "paragon",
  },
  {
    slug: "legaleval",
    index: "H3",
    category: "mini",
    title: "LegalEval",
    tagline:
      "An accuracy harness that grades frontier models on legal-clause extraction against lawyer-labeled contracts (CUAD), re-grading live in the browser.",
    year: "2026",
    status: "shipped",
    stack: ["Python", "CUAD", "OpenRouter", "Vanilla JS"],
    image: "/work/legaleval-1.png",
    href: "https://august-sigma.vercel.app",
    cta: "legaleval",
  },

  // ── Design track (category: "design") ─────────────────────────────────────
  // Interface, brand, and visual work.
  {
    slug: "ucsb-sep",
    index: "D1",
    category: "design",
    title: "UCSB Sigma Eta Pi",
    tagline:
      "The site for UCSB's premier business & entrepreneurship fraternity — recruitment, alumni, and chapter life. Designed and built it as co-founder.",
    year: "2025",
    status: "shipped",
    stack: ["Next.js", "Tailwind", "Vercel"],
    image: "/work/ucsbsep-1.png",
    href: "https://ucsbsep.com",
    cta: "ucsbsep.com",
  },
  {
    slug: "consult-your-community",
    index: "D2",
    category: "design",
    title: "Consult Your Community",
    tagline:
      "A clean marketing site for CYC, a student consulting org — built to recruit students and land clients.",
    year: "2026",
    status: "shipped",
    stack: ["Next.js", "Tailwind"],
    image: "/work/cyc-1.png",
    href: "https://cyc-website-sepia.vercel.app",
    cta: "cyc",
  },
  {
    slug: "collabboard",
    index: "D3",
    category: "design",
    title: "CollabBoard",
    tagline:
      "A real-time collaborative whiteboard interface — infinite canvas, live cursors, and PDF annotation, synced with CRDTs.",
    year: "2025",
    status: "shipped",
    stack: ["SolidJS", "HTML Canvas", "Yjs", "PDF.js"],
    image: "/work/collabboard-1.png",
    href: "https://whiteboard-gamma-umber.vercel.app",
    cta: "collabboard",
  },
];

export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);

// ── Experience ──────────────────────────────────────────────────────────────
export type Role = {
  org: string;
  title: string;
  span: string; // "2024 — Now"
  note?: string; // optional one-liner
  bullets?: string[]; // the full points, shown on the stage when this role is active
  logo?: string; // /logos/<x>.(png|svg) — falls back to a monogram when absent
  mono?: string; // monogram text used when there is no logo
  current?: boolean; // pulses the node for active / incoming roles
  tags?: string[]; // shown on the immersive stage (right side)
};

export const experience: Role[] = [
  {
    org: "UCSB Sigma Eta Pi",
    title: "President & Co-Founder",
    span: "Nov 2025 – Now",
    note: "Brought back the biggest society of student entrepreneurs on campus, and now lead it as president.",
    bullets: [
      "Co-founded and brought back the biggest society of student entrepreneurs on campus.",
      "Lead the chapter as president — recruiting, events, and the founder community.",
    ],
    logo: "/logos/sigma-eta-pi.svg",
    current: true,
    tags: ["Leadership", "Community", "Entrepreneurship"],
  },
  {
    org: "Consult Your Community · UCSB",
    title: "Business Analyst",
    span: "Sep 2025 – Now",
    note: "Pro-bono strategy and analysis for local small businesses through UCSB's chapter of Consult Your Community.",
    bullets: [
      "Pro-bono consulting for local small businesses through UCSB's chapter of Consult Your Community.",
      "Scope problems, analyze data, and deliver recommendations as part of a student team.",
    ],
    logo: "/logos/cyc.svg",
    current: true,
    tags: ["Consulting", "Strategy", "Analytics"],
  },
  {
    org: "TeachShare",
    title: "Founding Engineer",
    span: "2025 – 2026",
    note: "Shipped full-stack features to a platform serving 100K+ educators.",
    bullets: [
      "Shipped full-stack features in Next.js / React to a platform serving 100K+ educators.",
      "Built a classroom planner used by thousands on Node.js, PostgreSQL, and SolidJS.",
    ],
    logo: "/logos/teachshare.png",
    tags: ["Next.js", "React", "Node.js", "PostgreSQL", "SolidJS"],
  },
  {
    org: "DoorDash",
    title: "Software Engineer Intern",
    span: "Summer 2025",
    note: "Backend APIs in Python & Go for real-time delivery.",
    bullets: [
      "Built backend APIs in Python & Go for real-time delivery.",
      "Cut query times ~30% with SQL tuning and raised test coverage across services.",
    ],
    logo: "/logos/doordash.png",
    tags: ["Python", "Go", "PostgreSQL", "Microservices"],
  },
  {
    org: "UC Santa Barbara",
    title: "ML/AI Graduate Researcher",
    span: "Mar 2025 – Jun 2025",
    note: "Graduate-level neuroimaging ML research in Python and MATLAB.",
    bullets: [
      "Worked on graduate-level research publications.",
      "Processed high-dimensional neuroimaging datasets in Python and MATLAB.",
      "Extracted features using PCA, ICA, and wavelet transforms.",
      "Trained classifiers (SVM, CNNs) to detect patterns in diseased vs. healthy brains.",
      "Validated findings with statistical tests like permutation testing.",
    ],
    logo: "/logos/ucsb.png",
    tags: ["Python", "MATLAB", "PyTorch", "PCA / ICA"],
  },
  {
    org: "UC Santa Barbara",
    title: "Undergraduate Researcher",
    span: "Sep 2024 – Mar 2025",
    note: "Risk & probability modeling and data pipelines in Python and R.",
    bullets: [
      "Analyzed mathematical models of risk and probability using Python and R.",
      "Developed data pipelines to clean, process, and visualize large research datasets.",
      "Collaborated with faculty and grad students on statistical simulations and theorem testing.",
      "Contributed research documentation using LaTeX and Git.",
    ],
    logo: "/logos/ucsb.png",
    tags: ["Python", "R", "Statistics", "Data pipelines"],
  },
  {
    org: "NeuraNiche",
    title: "Software Engineer Intern",
    span: "Jun 2024 – Sep 2024",
    note: "GraphRAG retrieval over a PACMAN orchestration layer.",
    bullets: [
      "Enhanced knowledge retrieval using GraphRAG, increasing query resolution speed by 45%.",
      "Built around the RAG-based orchestration layer, PACMAN, to increase odds by 67%.",
      "Integrated LLM software to auto-generate neural-network insights, improving report generation efficiency by 60%.",
    ],
    logo: "/logos/neuraniche.svg",
    tags: ["GraphRAG", "LLMs", "RAG"],
  },
  {
    org: "Brains & Motion Education",
    title: "Camp Manager & Assistant Manager",
    span: "Aug 2022 – Aug 2023",
    note: "Ran a STEM summer camp end to end.",
    bullets: [
      "Orchestrated a STEM-focused summer camp — logistics, curriculum, and staff — for children aged 6–14.",
      "Managed a team of 40+ students and staff members.",
      "Rose from assistant manager over the prior year.",
    ],
    logo: "/logos/brains-motion.svg",
    tags: ["Leadership", "Curriculum", "STEM"],
  },
  {
    org: "Brains & Motion Education",
    title: "Computer Science Tutor",
    span: "Jun 2022 – Sep 2022",
    note: "Hands-on CS, robotics, and math curriculum.",
    bullets: [
      "Designed a hands-on curriculum across coding, robotics, math, and PE/sports.",
      "Coded and designed a Rubik's Cube-solving machine from scratch (C++, Arduino, Python).",
    ],
    logo: "/logos/brains-motion.svg",
    tags: ["C++", "Arduino", "Python", "Robotics"],
  },
];

// ── Skills ───────────────────────────────────────────────────────────────────
// Grouped for the Skills scene. `featured` flows through the kinetic marquee.
export type SkillGroup = { label: string; items: string[] };

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "Go", "Java", "C", "R", "SQL", "Swift", "Scala"],
  },
  {
    label: "Frameworks & Libraries",
    items: ["React", "Next.js", "Node.js", "SolidJS", "FastAPI", "Flask", "PyTorch"],
  },
  {
    label: "Tools & Infrastructure",
    items: ["Docker", "Git", "PostgreSQL", "pgvector", "AWS", "REST APIs", "FFmpeg"],
  },
  {
    label: "AI / ML",
    items: ["LLMs", "GraphRAG", "OpenAI", "Embeddings", "CNNs", "PCA / ICA"],
  },
  {
    label: "Working with people",
    items: ["Client-facing", "Leadership", "Mentorship", "Public speaking", "Product sense", "Cross-functional collaboration"],
  },
  {
    label: "Certifications",
    items: ["AWS AI Practitioner", "Eagle Scout", "Red Cross CPR"],
  },
];

// Curated set that scrolls through the kinetic marquee at the top of the scene.
export const skillsMarquee: string[] = [
  "TypeScript", "React", "Next.js", "Python", "Go", "PyTorch", "Node.js",
  "PostgreSQL", "LLMs", "GraphRAG", "AWS", "Docker", "FastAPI", "SQL",
];

// ── Links ───────────────────────────────────────────────────────────────────
export const links = [
  { label: "GitHub", href: "https://github.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "Email", href: "mailto:piamparekh17@gmail.com" },
];

// ── Easter eggs (copy only — the behavior lives in the components) ────────────
export const secrets = {
  // Logged to the browser console on load.
  console: "you found the console. type konami ↑↑↓↓←→←→ B A, or just say hi.",
  // Revealed when the Konami code is entered.
  konami: "secret unlocked. built with too much care by Piam Parekh.",
};
