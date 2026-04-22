'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ---- Types ---- */
type Kind = 'proj' | 'life'
interface Item {
  id: string
  title: string
  date: string
  year: number
  kind: Kind
  status?: string
  tags: string[]
  blurb: string
  long: string
  bullets?: string[]
  url?: string
  role?: string
  company?: string
}

/* ---- Data ---- */
const PROJECTS: Item[] = [
  {
    id: 'connection', kind: 'proj',
    title: 'Connection Finder',
    date: 'Feb 2025 — Present', year: 2025.15, status: 'inprog',
    tags: ['AI', 'D3.js', 'Vite', 'React'],
    blurb: 'AI-powered professional network discovery platform.',
    long: 'An AI-powered tool that analyzes social media connections using advanced search algorithms to surface hidden relationships and suggest warm introduction paths between any two people.',
    bullets: [
      'Interactive network graphs with D3.js, deployed via Vercel',
      'Modern stack — Vite, React, Node.js',
      'Backend pipelines improved data-refresh speed by 35%',
    ],
    role: 'Developer',
  },
  {
    id: 'sleepcam', kind: 'proj',
    title: 'Sleep Camera Vision System',
    date: 'Dec 2024', year: 2024.95,
    tags: ['PyTorch', 'FFmpeg', 'LLM', 'Apple Watch'],
    blurb: 'Apple Watch HR + real-time video to analyze sleep patterns.',
    long: "Integrated Apple Watch heart data and a live camera feed to analyze and monitor personalized sleep patterns. An LLM compares each night's data to published research and generates plain-language feedback the next morning.",
    bullets: [
      'Synchronized biometric data and camera stream via timestamp alignment with <100ms delay',
      'PyTorch + FFmpeg pipeline for real-time video parsing, feature extraction, and activity classification',
      'LLM-generated nightly feedback referenced against sleep-science literature',
    ],
    role: 'Personal project',
  },
]

const EXPERIENCES: Item[] = [
  {
    id: 'doordash', kind: 'life',
    title: 'Software Engineer Intern', company: 'DoorDash',
    date: 'Jun 2025 — Sep 2025', year: 2025.6,
    tags: ['Python', 'Go', 'PostgreSQL', 'Microservices'],
    blurb: 'Backend APIs for real-estate purchasing across 5 cities.',
    long: 'Worked on the real-estate purchasing platform at DoorDash — the systems that let the company acquire and manage physical locations. Shipped backend features in Python and Go, tightened service reliability, and cleaned up legacy components.',
    bullets: [
      'Built and optimized backend APIs in Python and Go supporting real-estate purchasing in 5 cities',
      'Refactored legacy microservices, improving service reliability',
      'Improved database query performance by 30% via SQL tuning and index optimization in PostgreSQL',
      'Wrote unit + integration tests with pytest and Postman, raising coverage across 15 services',
    ],
  },
  {
    id: 'ucsb-research', kind: 'life',
    title: 'Research Assistant', company: 'UCSB Mathematics Department',
    date: 'Sep 2024 — Feb 2025', year: 2024.7,
    tags: ['Python', 'R', 'LaTeX', 'Git'],
    blurb: 'Risk & probability modeling with a 6-person research group.',
    long: 'Collaborated with faculty and grad students on risk and probability modeling, building simulation and visualization pipelines in Python and R. Presented findings at the department poster session.',
    bullets: [
      'Analyzed 15+ models in risk and probability using NumPy, ggplot2, and dplyr — achieved 92% accuracy',
      'Built pipelines to clean, process, and visualize 500K+ records; data throughput improved by 30%',
      'Collaborated with 3 faculty and 5 grad students on simulations and theorem testing',
      'Wrote research documentation in LaTeX and coordinated Git across the 6-person group',
    ],
  },
  {
    id: 'neuraniche', kind: 'life',
    title: 'Software Engineering Intern', company: 'NeuraNiche',
    date: 'Jun 2024 — Aug 2024', year: 2024.4,
    tags: ['GraphRAG', 'LLM', 'Networking'],
    blurb: 'GraphRAG + LLM tooling for faster knowledge retrieval.',
    long: 'Built retrieval tooling on top of GraphRAG and a trained LLM to auto-generate neural-network insights, collapsing what had been manual research-report work into a faster, cheaper loop.',
    bullets: [
      'GraphRAG-based retrieval increased query resolution speed by 45%',
      'Trained LLM to auto-generate neural-network insights — report generation 60% more efficient',
      'Hybrid GraphRAG + LLM architecture reduced computational cost by 50%',
      'Configured secure client-server protocols for encrypted data transmission',
    ],
  },
  {
    id: 'zscalar', kind: 'life',
    title: 'Software Engineering Intern', company: 'ZScalar',
    date: 'Jun 2023 — Aug 2023', year: 2023.5,
    tags: ['Security', 'Python', 'Slack API'],
    blurb: 'Security app for leaked SSH keys + real-time Slack alerting.',
    long: 'Built a scanner that iterated through company servers hunting for leaked SSH keys and other sensitive data, plus a Slack bot that pushed the findings in real time so the security team could respond before anything got exploited.',
    bullets: [
      'Security application to detect leaked SSH keys and private data across company servers',
      'Algorithmic optimizations improved run-time performance by 21%, enabling faster threat detection',
      'Automated Slack Bot for real-time reports — alert response time improved by 34%',
    ],
  },
  {
    id: 'ucsb', kind: 'life',
    title: 'B.S. Mathematics', company: 'UC Santa Barbara',
    date: '2023 — 2027', year: 2023.1,
    tags: ['Math', 'Language Systems', 'Analysis'],
    blurb: 'Advanced language systems, OOP, discrete math, real analysis.',
    long: 'Math major at UCSB — picked it because I want to understand why algorithms work, not just that they do. Coursework: Advanced Language Systems and Theory, Object-Oriented Programming, Discrete Math, Advanced Real Analysis.',
    bullets: ['Graduating June 2027', 'Eagle Scout · AWS AI Practitioner · Red Cross CPR'],
  },
]

/* ---- Hook: scroll-triggered reveal ---- */
function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.18 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, visible }
}

/* ---- Cursor glow ---- */
function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const pos = { x: -250, y: -250, cx: -250, cy: -250 }
    const onMove = (e: MouseEvent) => { pos.x = e.clientX; pos.y = e.clientY }
    let animId: number
    const tick = () => {
      pos.cx += (pos.x - pos.cx) * 0.055
      pos.cy += (pos.y - pos.cy) * 0.055
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.cx - 240}px, ${pos.cy - 240}px)`
      }
      animId = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove)
    tick()
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(animId) }
  }, [])
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />
}

/* ---- Nav ---- */
function TopNav() {
  return (
    <nav className="cb-nav">
      <a href="#hero" className="brand">p<em>.</em>parekh</a>
      <div className="links">
        <a href="#intro">About</a>
        <a href="#map">Timeline</a>
        <a href="#hobbies">Off-hours</a>
        <a href="#contact">Contact</a>
      </div>
    </nav>
  )
}

/* ---- Hero ---- */
function Hero() {
  const portraitRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (portraitRef.current) {
        portraitRef.current.style.transform = `translateY(${window.scrollY * 0.13}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <section id="hero" className="cb-hero cb-container">
      <div className="col-left">
        <div className="eyebrow">
          <span className="dot" />
          Santa Barbara · april 2026 · currently at UCSB
        </div>
        <h1>
          <span className="line-wrap">
            <span className="line-reveal" style={{ animationDelay: '0.2s' }}>
              Piam Parekh,
            </span>
          </span>
          <span className="line-wrap">
            <span className="line-reveal" style={{ animationDelay: '0.42s' }}>
              a <em>small</em> <span className="und">cartographer</span>
            </span>
          </span>
          <span className="line-wrap">
            <span className="line-reveal" style={{ animationDelay: '0.64s' }}>
              of <span className="mark">things built.</span>
            </span>
          </span>
        </h1>
        <p className="sub">
          Software developer and math student at UCSB. I build browser simulators, vision systems,
          and interfaces that try to feel made by a person. Bay Area kid, now in SB.
        </p>
        <div className="meta">
          <span>Math @ UCSB</span>
          <span>Coding since age 10</span>
          <span>Chess, climbing, hiking</span>
        </div>
      </div>
      <div className="col-right">
        <div ref={portraitRef} className="cb-portrait">
          <svg viewBox="0 0 200 240" preserveAspectRatio="none">
            <path d="M0 200 Q 50 150 100 200 T 200 200 L 200 240 L 0 240 Z" fill="currentColor" opacity=".1" />
            <circle cx="100" cy="110" r="45" stroke="currentColor" strokeWidth="1" fill="none" opacity=".3" />
          </svg>
        </div>
        <div className="portrait-caption">~ swap me in ~</div>
      </div>
      <div className="scroll-hint">
        <span>scroll</span>
        <span className="line" />
      </div>
    </section>
  )
}

/* ---- Intro ---- */
function Intro() {
  const { ref, visible } = useReveal()
  return (
    <section id="intro" className="cb-intro">
      <div className="cb-container">
        <div ref={ref} className={`grid reveal${visible ? ' in' : ''}`}>
          <div className="label">§ 01 · the gist</div>
          <div>
            <p>
              I&apos;ve been building on the web since I was <em>ten</em> — a single{' '}
              <code style={{ fontFamily: 'var(--f-mono)', fontSize: '.85em', background: 'var(--paper-2)', padding: '2px 6px', borderRadius: 3 }}>
                &lt;marquee&gt;
              </code>{' '}
              tag hooked me for life.
            </p>
            <p>
              Now I study math at UCSB, because I want to understand <em>why</em> algorithms work,
              not just <em>that</em> they do. I ship weird, useful little things in my spare time.
            </p>
            <div className="facts">
              <div className="fact">
                <div className="k">Born</div>
                <div className="v">Bay Area</div>
              </div>
              <div className="fact">
                <div className="k">Studying</div>
                <div className="v">Math · UCSB</div>
              </div>
              <div className="fact">
                <div className="k">Most recent</div>
                <div className="v">DoorDash SWE</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- Timeline entry row ---- */
function EntryRow({ it, side, visible, onOpen }: {
  it: Item; side: 'left' | 'right'; visible: boolean; onOpen: (item: Item) => void
}) {
  const content = (
    <div className={`entry ${it.kind}`} onClick={() => onOpen(it)}>
      <div className="kind">
        {it.kind === 'proj' ? '● project' : '○ experience'}
        {it.status === 'inprog' ? ' · ongoing' : ''}
      </div>
      <h3>{it.title}</h3>
      <div className="where">{it.date}{it.company ? ` — ${it.company}` : ''}</div>
      <p>{it.blurb}</p>
      {it.tags && <div className="tagrow">{it.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>}
      <div className="expand">read more</div>
    </div>
  )
  return (
    <div className={`entry-row ${side}${visible ? ' in' : ''}`} data-rowid={it.id}>
      {side === 'left' ? content : <div />}
      <div className="gutter">
        <span className="tick" />
        <span className={`node${it.kind === 'proj' ? ' proj' : ''}${it.status === 'inprog' ? ' now' : ''}`} />
      </div>
      {side === 'right' ? content : <div />}
    </div>
  )
}

/* ---- Timeline Map ---- */
function TimelineMap({ onOpen }: { onOpen: (item: Item) => void }) {
  const all: Item[] = [...PROJECTS, ...EXPERIENCES].sort((a, b) => b.year - a.year)

  const byYear: Record<number, Item[]> = {}
  all.forEach(it => {
    const y = Math.floor(it.year)
    ;(byYear[y] = byYear[y] || []).push(it)
  })
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)

  const railRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const [draw, setDraw] = useState(0)
  const [headVisible, setHeadVisible] = useState(false)
  const [visible, setVisible] = useState(new Set<string>())

  useEffect(() => {
    const el = railRef.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      setDraw(Math.max(0, Math.min(100, ((vh - rect.top) / (rect.height + vh)) * 100)))
    }

    const io = new IntersectionObserver(
      (entries) => setVisible(prev => {
        const next = new Set(prev)
        entries.forEach(en => {
          if (en.isIntersecting) {
            const id = (en.target as HTMLElement).dataset.rowid
            if (id) next.add(id)
          }
        })
        return next
      }),
      { threshold: 0.15, rootMargin: '-5% 0px -5% 0px' }
    )

    const headIo = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setHeadVisible(true); headIo.disconnect() } },
      { threshold: 0.2 }
    )
    if (headRef.current) headIo.observe(headRef.current)

    el.querySelectorAll<HTMLElement>('[data-rowid]').forEach(n => io.observe(n))
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => { window.removeEventListener('scroll', onScroll); io.disconnect(); headIo.disconnect() }
  }, [])

  const rows: React.ReactNode[] = []
  let entryIdx = 0
  years.forEach(y => {
    rows.push(
      <div key={`y-${y}`} className={`year-stamp${visible.has(`y-${y}`) ? ' in' : ''}`} data-rowid={`y-${y}`}>
        {y === 2026 && <span className="badge-now">currently</span>}
        <span className="chip">{y}</span>
      </div>
    )
    byYear[y].forEach(it => {
      const side = entryIdx % 2 === 0 ? 'left' : 'right'
      entryIdx++
      rows.push(
        <EntryRow key={it.id} it={it} side={side as 'left' | 'right'} visible={visible.has(it.id)} onOpen={onOpen} />
      )
    })
  })

  return (
    <section id="map" className="cb-map">
      <div className="cb-container">
        <div ref={headRef} className={`map-head reveal${headVisible ? ' in' : ''}`}>
          <h2>A <em>map</em> of<br />things built<br />&amp; lived.</h2>
          <div className="blurb">
            <p>
              Two tracks along one line — <strong>projects</strong> in clay,{' '}
              <strong>work &amp; school</strong> in cream.
              Top is newest. Click anything to read more.
            </p>
            <div className="map-legend">
              <span className="l"><span className="swatch proj" />Projects</span>
              <span className="l"><span className="swatch life" />Work &amp; school</span>
            </div>
          </div>
        </div>
        <div className="map-rail" ref={railRef}>
          <div className="spine" style={{ '--draw-h': `${draw}%` } as React.CSSProperties} />
          {rows}
          <div className="map-cap">
            <span className="hand">~ the start ~</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---- Modal ---- */
function Modal({ item, onClose }: { item: Item; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <button className="close" onClick={onClose} aria-label="close">×</button>
          <div className="date">
            <span className="chip">{item.kind === 'proj' ? 'project' : 'life'}</span>
            {item.date}
          </div>
          <h3>{item.title}</h3>
          {item.company && <div className="co">at {item.company}</div>}
        </div>
        <div className="modal-body">
          <div className="main">
            <p>{item.long}</p>
            {item.bullets && <ul>{item.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
          </div>
          <div className="side">
            <dl>
              {item.role && <><dt>Role</dt><dd>{item.role}</dd></>}
              {item.company && <><dt>Where</dt><dd>{item.company}</dd></>}
              <dt>When</dt><dd>{item.date}</dd>
              {item.status === 'inprog' && <><dt>Status</dt><dd style={{ color: 'var(--accent)' }}>● in progress</dd></>}
              <dt>Tagged</dt>
              <dd><div className="chips">{item.tags.map(t => <span key={t}>{t}</span>)}</div></dd>
              {item.url && <><dt>Link</dt><dd className="linkline"><a href={`https://${item.url}`} target="_blank" rel="noopener noreferrer">{item.url} ↗</a></dd></>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- 3D Tilt Postcard ---- */
function Postcard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(700px) rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateY(-6px)`
    el.style.transition = 'transform 0.08s ease'
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.transition = 'transform 0.55s cubic-bezier(.2,.8,.2,1), box-shadow 0.3s ease'
  }

  return (
    <div ref={ref} className="postcard" onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  )
}

/* ---- Hobbies ---- */
function Hobbies() {
  const { ref, visible } = useReveal()
  return (
    <section id="hobbies" className="cb-hobbies">
      <div className="cb-container">
        <div ref={ref} className={`head reveal${visible ? ' in' : ''}`}>
          <h2>off the <em>keyboard</em>.</h2>
          <div className="note">the things that keep my brain from over-compiling.</div>
        </div>
        <div className="postcards">
          <Postcard>
            <div className="visual v-climb">
              <div className="hold" style={{ left: '18%', top: '72%' }} />
              <div className="hold a" style={{ left: '38%', top: '52%' }} />
              <div className="hold b" style={{ left: '28%', top: '28%' }} />
              <div className="hold" style={{ left: '62%', top: '40%' }} />
              <div className="hold a" style={{ left: '72%', top: '62%' }} />
              <div className="hold b" style={{ left: '52%', top: '18%' }} />
              <svg viewBox="0 0 300 220" preserveAspectRatio="none">
                <path d="M55 175 Q 110 140, 85 85 T 165 55" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 6" opacity=".4" />
              </svg>
            </div>
            <div className="body">
              <div className="num">01 — climbing</div>
              <h3>on the wall.</h3>
              <p>Projecting V4s, occasionally humbled by a V2. Indoor most weeks, real rock when I can drive to it.</p>
            </div>
          </Postcard>

          <Postcard>
            <div className="visual v-chess">
              <div className="board">
                {Array.from({ length: 64 }, (_, i) => {
                  const r = Math.floor(i / 8), c = i % 8
                  return <div key={i} className={`sq ${(r + c) % 2 === 1 ? 'd' : 'l'}`} />
                })}
              </div>
            </div>
            <div className="body">
              <div className="num">02 — chess</div>
              <h3>e4. always.</h3>
              <p>Play for the UCSB team. Romantic openings, tactical middlegames, premature resignations.</p>
            </div>
          </Postcard>

          <Postcard>
            <div className="visual v-hike">
              <div className="contour" />
              <div className="sun" />
              <svg viewBox="0 0 200 150" style={{ position: 'absolute', bottom: 14, left: 38, width: 44, height: 36 }}>
                <circle cx="20" cy="18" r="8" fill="currentColor" />
                <rect x="15" y="26" width="10" height="18" fill="currentColor" />
                <line x1="15" y1="44" x2="8" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="25" y1="44" x2="32" y2="58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="28" y1="30" x2="42" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div className="body">
              <div className="num">03 — hiking</div>
              <h3>santa ynez.</h3>
              <p>Channel Islands, Inspiration Point, any ridge with ocean view. I take too many photos of shrubs.</p>
            </div>
          </Postcard>
        </div>
      </div>
    </section>
  )
}

/* ---- Contact ---- */
function Contact() {
  const { ref, visible } = useReveal()
  return (
    <section id="contact" className="cb-contact">
      <div className="cb-container">
        <div ref={ref} className={`grid reveal${visible ? ' in' : ''}`}>
          <div>
            <h2>say <em>hi</em>.</h2>
            <a className="email" href="mailto:piamparekh17@gmail.com">piamparekh17@gmail.com →</a>
          </div>
          <div className="socials">
            <a href="https://linkedin.com/in/piamparekh" target="_blank" rel="noopener noreferrer">
              LinkedIn <span className="arrow">↗</span>
            </a>
            <a href="mailto:piamparekh17@gmail.com">
              piamparekh17@gmail.com <span className="arrow">↗</span>
            </a>
            <a href="tel:+15105098139">
              (510) 509-8139 <span className="arrow">↗</span>
            </a>
          </div>
        </div>
        <div className="cb-footer">
          <span>© 2026 Piam Parekh</span>
          <span>hand-coded in santa barbara</span>
          <span>↑↑↓↓←→←→BA</span>
        </div>
      </div>
    </section>
  )
}

/* ---- Chaos Canvas ---- */
function ChaosCanvas({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!active) return
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const colors = ['#FF3DA6', '#2E5BFF', '#FFD23F', '#3DDC97', '#C9A8FF', '#FFB199']
    const parts = Array.from({ length: 140 }, () => ({
      x: Math.random() * innerWidth,
      y: -20 - Math.random() * innerHeight,
      vx: (Math.random() - .5) * 6,
      vy: 2 + Math.random() * 5,
      r: 6 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .2,
      c: colors[Math.floor(Math.random() * colors.length)],
      rect: Math.random() < .5,
    }))
    let animId: number
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.05
        if (p.y > innerHeight + 30) { p.y = -20; p.x = Math.random() * innerWidth; p.vy = 2 + Math.random() * 5 }
        ctx.save()
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c
        if (p.rect) ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      })
      animId = requestAnimationFrame(tick)
    }
    tick()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [active])

  if (!active) return null
  return <canvas ref={ref} id="chaos-canvas" />
}

/* ---- App ---- */
export default function Home() {
  const [openItem, setOpenItem] = useState<Item | null>(null)
  const [chaosActive, setChaosActive] = useState(false)

  useEffect(() => {
    document.body.dataset.mode = chaosActive ? 'chaos' : ''
    if (!chaosActive) delete document.body.dataset.mode
  }, [chaosActive])

  useEffect(() => {
    if (!chaosActive) return
    const t = setTimeout(() => setChaosActive(false), 8000)
    return () => clearTimeout(t)
  }, [chaosActive])

  const toggleChaos = useCallback(() => setChaosActive(p => !p), [])

  useEffect(() => {
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
    let buf: string[] = []
    const onKey = (e: KeyboardEvent) => {
      buf.push(e.code)
      if (buf.length > KONAMI.length) buf.shift()
      if (buf.join() === KONAMI.join()) { toggleChaos(); buf = [] }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleChaos])

  return (
    <>
      <CursorGlow />
      <TopNav />
      <Hero />
      <Intro />
      <TimelineMap onOpen={setOpenItem} />
      <Hobbies />
      <Contact />
      {openItem && <Modal item={openItem} onClose={() => setOpenItem(null)} />}
      <ChaosCanvas active={chaosActive} />
    </>
  )
}
