import { useCallback, useEffect, useState } from 'react'

/* ---------------------------------- assets -------------------------------- */

const img = {
  cover:
    'https://images.unsplash.com/photo-1761244960606-627770ffed79?w=1600&h=1800&fit=crop&auto=format',
  night:
    'https://images.unsplash.com/photo-1695114584354-13e1910d491b?w=1200&h=1600&fit=crop&auto=format',
  macro:
    'https://images.unsplash.com/photo-1535540878298-a155c6d065ef?w=1400&h=1600&fit=crop&auto=format',
  hands:
    'https://images.unsplash.com/photo-1616702451070-5c41fc0264c9?w=1000&h=1600&fit=crop&auto=format',
  viewfinder:
    'https://images.unsplash.com/photo-1662237625945-d7a10ce582de?w=1800&h=1400&fit=crop&auto=format',
  lens:
    'https://images.unsplash.com/photo-1631724618122-4f36ea2c7511?w=1000&h=1600&fit=crop&auto=format',
}

/* ---------------------------------- data ---------------------------------- */

const features = [
  { title: 'Full-frame 6K sensor', detail: '24.6MP · 6K/60 · 12-bit RAW · 14 stops of latitude.' },
  { title: 'Pocketable body', detail: 'Machined aluminium · 214g · smaller than a deck of cards.' },
  { title: 'All-day power', detail: '140 min of 6K per cell · 0–80% charge in 22 minutes.' },
  { title: 'Native ProRes', detail: 'Record ProRes 422 HQ straight to CFexpress. No recorder.' },
]

const usps = [
  { kicker: 'Speed', metric: '0.9s', title: 'Ready before the moment is gone', detail: 'The fastest wake time of any cinema body.' },
  { kicker: 'Range', metric: '14', title: 'Grade with room to spare', detail: 'Latitude no rival in this class can match.' },
  { kicker: 'Weight', metric: '214g', title: 'A camera you forget', detail: 'Lives on a gimbal, a drone, or in a pocket.' },
]

const tiers = [
  { name: 'ONE Body', price: '$1,899', note: 'Camera + one battery', items: ['6K/60 RAW', '1× cell', '256GB CFexpress', '1-yr warranty'], featured: false },
  { name: 'ONE Rig', price: '$2,449', note: 'Most popular', items: ['Everything in Body', '3× cells', 'Cage + handle', '512GB CFexpress'], featured: true },
  { name: 'ONE Studio', price: '$3,299', note: 'For teams', items: ['Everything in Rig', 'Charger dock', 'ND filter set', 'Priority support'], featured: false },
]

/* -------------------------------- fragments ------------------------------- */

const Ghost = ({ children }: { children: React.ReactNode }) => (
  <span className="pointer-events-none absolute select-none font-display font-extrabold leading-none tracking-tighter text-[#f1f1f1]">
    {children}
  </span>
)

const VLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
    {children}
  </span>
)

/* ---------------------------------- slides -------------------------------- */

// 01 — full-bleed cover
const SlideCover = () => (
  <div className="relative h-full w-full overflow-hidden bg-black">
    <img src={img.cover} alt="Cinematographer filming at golden hour" className="absolute inset-0 h-full w-full object-cover opacity-80" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
    <div className="relative flex h-full flex-col justify-between p-8 text-white md:p-14">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-white/70">
        <span>Aperture Instruments</span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" /> Now shipping
        </span>
      </div>
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Model 01 / Vermilion</span>
        <h1 className="mt-4 font-display text-6xl font-extrabold leading-[0.85] tracking-tight md:text-[9rem]">
          Cinema,
          <br />
          pocket-sized.
        </h1>
        <p className="mt-6 max-w-md font-body text-base leading-relaxed text-white/70 md:text-lg">
          A full-frame cinema sensor in a body you forget you're carrying. Shoot 6K RAW anywhere.
        </p>
      </div>
    </div>
  </div>
)

// 02 — problem: image column + oversized ghost
const SlideProblem = () => (
  <div className="relative grid h-full grid-cols-1 overflow-hidden lg:grid-cols-12">
    <Ghost>
      <span className="bottom-[-3rem] right-[-1rem] text-[22rem] hidden lg:block absolute">NO</span>
    </Ghost>
    <div className="relative hidden bg-[#f4f4f4] lg:col-span-4 lg:block">
      <img src={img.night} alt="Filmmaker at night" className="h-full w-full object-cover grayscale" />
      <span className="absolute bottom-6 left-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white">The old way</span>
    </div>
    <div className="relative z-10 flex flex-col justify-center p-8 lg:col-span-8 md:p-14">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">The problem</span>
      <h2 className="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
        Great cameras are still a burden to carry.
      </h2>
      <div className="mt-10 max-w-2xl divide-y divide-border border-y border-border">
        {[
          { n: '01', t: 'Too heavy to travel', d: 'Pro bodies with lenses cross 2kg — they stay home when it matters.' },
          { n: '02', t: 'A rig for everything', d: 'Recorders, cages and cables turn a shot into a setup.' },
          { n: '03', t: 'Slow to the moment', d: 'Boot times and buffering mean the frame is already gone.' },
        ].map((p) => (
          <div key={p.n} className="group grid grid-cols-[auto_1fr] gap-x-6 py-5 transition-colors hover:bg-[#fafafa]">
            <span className="font-mono text-sm text-accent">{p.n}</span>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">{p.t}</h3>
              <p className="font-body text-[13px] leading-relaxed text-muted-foreground sm:max-w-xs sm:text-right">{p.d}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// 03 — product: full-bleed macro left, spec strip right
const SlideProduct = () => (
  <div className="grid h-full grid-cols-1 lg:grid-cols-2">
    <div className="relative bg-[#f4f4f4]">
      <img src={img.macro} alt="Macro detail of the APERTURE ONE body" className="h-full min-h-[240px] w-full object-cover" />
      <span className="absolute left-6 top-6 bg-background/90 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] backdrop-blur">
        Machined aluminium · IP54
      </span>
    </div>
    <div className="relative flex flex-col justify-center p-8 md:p-14">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">The product</span>
      <h2 className="mt-4 font-display text-5xl font-extrabold leading-[0.9] tracking-tight md:text-7xl">
        One body.
        <br />
        Every format.
      </h2>
      <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-muted-foreground">
        Records true full-frame 6K RAW internally — no external recorder, no compromise. Built for
        the shot you didn't plan for.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-px border border-border bg-border">
        {[
          { m: '0.9s', l: 'Cold start' },
          { m: '14', l: 'Stops DR' },
          { m: '214g', l: 'Body weight' },
          { m: '140m', l: '6K runtime' },
        ].map((s) => (
          <div key={s.l} className="bg-background p-5">
            <div className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{s.m}</div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// 04 — features: image strip + big numbered list filling space
const SlideFeatures = () => (
  <div className="grid h-full grid-cols-1 lg:grid-cols-12">
    <div className="relative hidden bg-[#f4f4f4] lg:col-span-3 lg:block">
      <img src={img.hands} alt="Hands holding the camera" className="h-full w-full object-cover" />
      <div className="absolute inset-0 flex items-end p-6">
        <span className="[writing-mode:vertical-rl] rotate-180 font-mono text-[11px] uppercase tracking-[0.3em] text-white">
          On board — everything you need
        </span>
      </div>
    </div>
    <div className="flex flex-col justify-center p-8 lg:col-span-9 md:p-14">
      <div className="flex items-end justify-between border-b-2 border-foreground pb-4">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Key features</span>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-6xl">Everything, on board.</h2>
        </div>
        <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">04 / features</span>
      </div>
      <ul>
        {features.map((f, i) => (
          <li
            key={f.title}
            className="group grid grid-cols-[auto_1fr_auto] items-center gap-x-6 border-b border-border py-6 transition-colors hover:pl-3 hover:bg-[#fafafa]"
          >
            <span className="font-display text-3xl font-extrabold text-[#e4e4e4] transition-colors group-hover:text-accent md:text-5xl">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">{f.title}</h3>
            <p className="hidden max-w-xs text-right font-body text-[13px] leading-relaxed text-muted-foreground md:block">
              {f.detail}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

// 05 — USP: full-bleed dark image with overlaid columns
const SlideUsp = () => (
  <div className="relative h-full w-full overflow-hidden bg-black text-white">
    <img src={img.viewfinder} alt="Operator looking through the viewfinder" className="absolute inset-0 h-full w-full object-cover opacity-40" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
    <div className="relative flex h-full flex-col justify-center p-8 md:p-14">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Why it wins</span>
      <h2 className="mt-4 max-w-2xl font-display text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
        Three reasons it earns its place.
      </h2>
      <div className="mt-12 grid grid-cols-1 gap-px bg-white/15 sm:grid-cols-3">
        {usps.map((u, i) => (
          <div key={u.title} className="bg-black/40 p-6 backdrop-blur-sm md:p-7">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{u.kicker}</span>
              <span className="font-mono text-[11px] text-white/40">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <div className="mt-4 font-display text-5xl font-extrabold tracking-tight md:text-6xl">{u.metric}</div>
            <h3 className="mt-4 font-display text-lg font-bold leading-tight tracking-tight">{u.title}</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-white/60">{u.detail}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// 06 — pricing: vertical image rail + tiers
const SlidePricing = () => (
  <div className="grid h-full grid-cols-1 lg:grid-cols-12">
    <div className="relative hidden bg-[#f4f4f4] lg:col-span-3 lg:block">
      <img src={img.lens} alt="Camera lens close-up" className="h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-8 left-6 text-white">
        <div className="font-display text-5xl font-extrabold tracking-tight">Ship it.</div>
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70">Free delivery worldwide</div>
      </div>
    </div>
    <div className="flex flex-col justify-center p-8 lg:col-span-9 md:p-14">
      <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Get yours</span>
      <h2 className="mt-4 font-display text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">Pick a configuration.</h2>
      <div className="mt-8 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t.name} className={`flex flex-col p-6 ${t.featured ? 'bg-foreground text-background' : 'bg-background'}`}>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-lg font-bold tracking-tight">{t.name}</h3>
              <span className={`font-mono text-[10px] uppercase tracking-[0.15em] ${t.featured ? 'text-accent' : 'text-muted-foreground'}`}>{t.note}</span>
            </div>
            <div className="mt-4 font-display text-4xl font-extrabold tracking-tight">{t.price}</div>
            <ul className="mt-5 flex-1 space-y-2">
              {t.items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 font-body text-sm">
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 bg-accent" />
                  <span className={t.featured ? 'text-white/80' : 'text-muted-foreground'}>{item}</span>
                </li>
              ))}
            </ul>
            <button
              className={`mt-6 py-3 font-display text-sm font-semibold tracking-tight transition-transform hover:-translate-y-0.5 ${
                t.featured ? 'bg-accent text-white' : 'border border-foreground text-foreground hover:bg-foreground hover:text-background'
              }`}
            >
              Reserve →
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const slides = [
  { id: 'cover', label: 'Cover', render: SlideCover },
  { id: 'problem', label: 'Problem', render: SlideProblem },
  { id: 'product', label: 'Product', render: SlideProduct },
  { id: 'features', label: 'Features', render: SlideFeatures },
  { id: 'usp', label: 'Why it wins', render: SlideUsp },
  { id: 'pricing', label: 'Pricing', render: SlidePricing },
]

/* ---------------------------------- shell --------------------------------- */

export default function App() {
  const [index, setIndex] = useState(0)
  const total = slides.length

  const go = useCallback(
    (next: number) => setIndex((i) => Math.min(total - 1, Math.max(0, next))),
    [total],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(index + 1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(index - 1)
      if (e.key === 'Home') go(0)
      if (e.key === 'End') go(total - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, go, total])

  const Current = slides[index].render

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      {/* Top rail */}
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3.5 md:px-12">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-lg font-extrabold tracking-tight">APERTURE</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:inline">
            Pocket Cinema · Product Deck
          </span>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </header>

      {/* Progress bar */}
      <div className="h-[3px] w-full shrink-0 bg-border">
        <div className="h-full bg-accent transition-[width] duration-500 ease-out" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      {/* Stage — full bleed */}
      <section className="relative flex-1 overflow-hidden">
        <div key={index} className="slide-enter h-full overflow-y-auto">
          <Current />
        </div>
      </section>

      {/* Bottom rail */}
      <footer className="flex shrink-0 items-center justify-between border-t border-border px-6 py-3 md:px-12">
        <div className="flex items-center gap-3">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => go(i)} aria-label={`Go to ${s.label}`} aria-current={i === index} className="group flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-accent' : 'bg-border group-hover:bg-muted-foreground'}`} />
              <span className={`hidden font-mono text-[10px] uppercase tracking-[0.15em] transition-colors lg:inline ${i === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide" className="flex h-9 w-9 items-center justify-center border border-border font-display text-base transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30">
            ←
          </button>
          <button onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Next slide" className="flex h-9 w-9 items-center justify-center border border-border font-display text-base transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30">
            →
          </button>
        </div>
      </footer>
    </main>
  )
}
