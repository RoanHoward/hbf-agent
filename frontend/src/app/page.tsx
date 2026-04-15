'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherData } from '@/hooks/useWeatherData';
import { getWeatherState } from '@/lib/weatherState';
import KodaFigure from '@/components/KodaFigure';
import ChatPanel from '@/components/ChatPanel';
import WeatherParticles from '@/components/WeatherParticles';

// ─── Color tokens ────────────────────────────────────────────────────────────
const TEAL = '#3a6f74';
const ORANGE = '#B85230';
const DARK = '#333333';
const OFF_WHITE = '#f7f5f1';

// ─── Weather label helpers ────────────────────────────────────────────────────
const STATE_LABELS: Record<string, string> = {
  idle: 'Calm',
  rain: 'Rain',
  heavyRain: 'Heavy Rain',
  wind: 'Windy',
  cold: 'Cold',
  snow: 'Snow',
  sunny: 'Sunny',
};

function ConditionBadge({
  airtemp,
  stateName,
}: {
  airtemp: number | null;
  stateName: string;
}) {
  return (
    <div
      className="absolute top-5 left-6 z-10 flex items-center gap-2 px-3 py-2 rounded-full text-white text-xs font-medium backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ background: '#4ade80' }}
      />
      <span>Live: {STATE_LABELS[stateName] ?? 'Loading…'}</span>
      {airtemp !== null && (
        <span className="text-white/60">· {airtemp.toFixed(1)}°C</span>
      )}
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <nav
      className="w-full flex items-center justify-between px-8 py-4 shrink-0 z-20 relative"
      style={{ background: TEAL }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ background: ORANGE }}
        >
          HB
        </div>
        <span className="text-white font-semibold tracking-wide text-sm">
          Hubbard Brook Ecosystem Study
        </span>
      </div>
      <ul className="hidden md:flex items-center gap-7 text-white/80 text-base">
        {['Research', 'Data', 'Publications', 'Education', 'About'].map((item) => (
          <li key={item}>
            <a href="#" className="hover:text-white transition-colors">
              {item}
            </a>
          </li>
        ))}
      </ul>
      <a
        href="#"
        className="hidden md:block px-4 py-2 rounded-full text-white text-xs font-semibold transition-colors"
        style={{ background: ORANGE }}
      >
        Support Us
      </a>
    </nav>
  );
}

// ─── Three-column section ─────────────────────────────────────────────────────
const THREE_COLS = [
  {
    title: 'Long-Term Research',
    body: 'Over 60 years of continuous watershed monitoring provides unparalleled data on forest-stream ecosystem dynamics, nutrient cycling, and climate change responses.',
  },
  {
    title: 'Open Data',
    body: 'Stream chemistry, precipitation, meteorology, vegetation, and soil datasets are freely available through the Environmental Data Initiative (EDI).',
  },
  {
    title: 'Education & Outreach',
    body: "Hubbard Brook welcomes graduate researchers, K–12 educators, and citizen scientists to engage with one of North America's most studied forest ecosystems.",
  },
];

function ThreeColSection() {
  return (
    <section className="w-full py-16 px-8" style={{ background: '#ffffff' }}>
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {THREE_COLS.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="font-semibold text-base" style={{ color: DARK }}>
              {col.title}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">{col.body}</p>
            <a
              href="#"
              className="text-xs font-semibold mt-1 hover:underline"
              style={{ color: TEAL }}
            >
              Learn more →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Welcome section ──────────────────────────────────────────────────────────
function WelcomeSection() {
  return (
    <section className="w-full py-20 px-8" style={{ background: OFF_WHITE }}>
      <div className="max-w-3xl mx-auto text-center flex flex-col gap-5">
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: DARK }}>
          Where Science Meets the Forest
        </h2>
        <p className="text-sm leading-7 text-gray-600">
          Established in 1955 in New Hampshire's White Mountains, the Hubbard Brook Experimental
          Forest is a landmark of ecological science. Here, researchers first documented the
          devastating reach of acid rain in North America, linking industrial emissions to forest
          die-off hundreds of miles away. Today, our scientists continue to investigate how northern
          hardwood forests respond to climate change, invasive species, and shifting precipitation
          patterns — generating data that informs policy from Washington to Geneva.
        </p>
        <a
          href="#"
          className="self-center px-6 py-3 rounded-full text-white text-sm font-semibold transition-colors"
          style={{ background: TEAL }}
        >
          Explore Our Science
        </a>
      </div>
    </section>
  );
}

// ─── Partners section ─────────────────────────────────────────────────────────
const PARTNERS = [
  { name: 'USDA Forest Service', sub: 'Northern Research Station' },
  { name: 'NSF LTER Network', sub: 'Long-Term Ecological Research' },
  { name: 'NSF LTREB', sub: 'Long-Term Research in Environmental Biology' },
  { name: 'Hubbard Brook\nResearch Foundation', sub: 'Connecting science & society' },
];

function PartnersSection() {
  return (
    <section className="w-full py-16 px-8" style={{ background: '#ffffff' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-10">
        <h2 className="text-center text-xl font-semibold" style={{ color: DARK }}>
          Institutional Partners
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center text-center gap-2 py-5 px-3 rounded-xl"
              style={{ background: OFF_WHITE }}
            >
              <span
                className="text-xs font-bold leading-snug whitespace-pre-line"
                style={{ color: TEAL }}
              >
                {p.name}
              </span>
              <span className="text-xs text-gray-500">{p.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Events section ───────────────────────────────────────────────────────────
const EVENTS = [
  {
    date: 'May 12, 2026',
    title: 'Spring Watershed Tour',
    desc: 'Guided field tour of monitored catchments during snowmelt season.',
  },
  {
    date: 'Jun 3–5, 2026',
    title: 'Annual Science Symposium',
    desc: 'Researchers and partners present findings from the past field season.',
  },
  {
    date: 'Jul 19, 2026',
    title: 'Teacher Naturalist Workshop',
    desc: 'K–12 educators explore forest ecology and field data collection methods.',
  },
];

function EventsSection() {
  return (
    <section className="w-full py-16 px-8" style={{ background: OFF_WHITE }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        <h2 className="text-xl font-semibold" style={{ color: DARK }}>
          Upcoming Events
        </h2>
        <div className="flex flex-col gap-4">
          {EVENTS.map((e) => (
            <div
              key={e.title}
              className="flex gap-5 items-start p-5 rounded-xl"
              style={{ background: '#ffffff' }}
            >
              <div
                className="shrink-0 w-20 text-center py-2 rounded-lg text-xs font-bold leading-snug"
                style={{ background: TEAL, color: '#fff' }}
              >
                {e.date.split(',')[0]}
                <br />
                <span className="font-normal opacity-80">{e.date.split(',')[1]}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm" style={{ color: DARK }}>
                  {e.title}
                </span>
                <span className="text-xs text-gray-500">{e.desc}</span>
              </div>
              <a
                href="#"
                className="ml-auto shrink-0 self-center text-xs font-semibold hover:underline"
                style={{ color: ORANGE }}
              >
                Details →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="w-full py-8 px-8" style={{ background: TEAL }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-white/70 text-xs">
        <span>© 2026 Hubbard Brook Ecosystem Study. All rights reserved.</span>
        <div className="flex gap-6">
          {['Privacy', 'Contact', 'Data Policy', 'Accessibility'].map((l) => (
            <a key={l} href="#" className="hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Dev weather override ─────────────────────────────────────────────────────
const WEATHER_STATES = ['live', 'idle', 'rain', 'heavyRain', 'wind', 'cold', 'snow', 'sunny'] as const;
type OverrideState = typeof WEATHER_STATES[number];

function DevWeatherToggle({
  override,
  setOverride,
}: {
  override: OverrideState;
  setOverride: (s: OverrideState) => void;
}) {
  return (
    <div
      className="fixed bottom-6 left-6 z-[100] flex items-center gap-2 px-3 py-2 rounded-full text-xs font-mono"
      style={{
        background: 'rgba(0,0,0,0.75)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        color: '#4ade80',
      }}
    >
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>🛠 weather:</span>
      <select
        value={override}
        onChange={e => setOverride(e.target.value as OverrideState)}
        style={{
          background: 'transparent',
          color: '#4ade80',
          border: 'none',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontSize: '12px',
        }}
      >
        {WEATHER_STATES.map(s => (
          <option key={s} value={s} style={{ background: '#111', color: '#4ade80' }}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const weatherData = useWeatherData();
  const liveWeather = getWeatherState(weatherData);
  const [weatherOverride, setWeatherOverride] = useState<OverrideState>('live');
  const weather = weatherOverride === 'live' ? liveWeather : weatherOverride;
  const [chatOpen, setChatOpen] = useState(false);

  // Track whether Koda's figure is visible in the viewport
  const kodaRef = useRef<HTMLDivElement>(null);
  const [isKodaVisible, setIsKodaVisible] = useState(true);
  useEffect(() => {
    const el = kodaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsKodaVisible(entry.isIntersecting),
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col min-h-screen" style={{ color: DARK }}>
      <Nav />

      {/* Hero */}
      <section
        className="relative w-full"
        style={{
          height: '82vh',
          backgroundImage:
            'url(https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(10,20,15,0.52)' }} />

        {/* Weather particles */}
        <WeatherParticles weather={weather} />

        {/* Live conditions badge */}
        <ConditionBadge
          airtemp={weatherData ? weatherData.airtemp : null}
          stateName={weather}
        />

        {/* Hero text */}
        <div className="absolute inset-0 flex flex-col items-start justify-center px-10 md:px-20 gap-4 pointer-events-none">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-4xl md:text-5xl font-bold text-white leading-tight max-w-xl"
          >
            Sixty Years of Listening<br />to a Forest
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-white/75 text-base max-w-sm leading-relaxed"
          >
            Long-term ecological research in New Hampshire's White Mountains since 1955.
          </motion.p>
          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="pointer-events-auto mt-2 px-6 py-3 rounded-full text-white text-sm font-semibold transition-colors"
            style={{ background: ORANGE }}
          >
            Explore Research
          </motion.a>
        </div>

        {/* Koda + click hint — fixed-width container so Koda never shifts */}
        <div
          ref={kodaRef}
          className="absolute bottom-0 right-6 pb-2"
          style={{ width: '110px' }}
        >
          {/* Click hint bubble — absolutely positioned above Koda, out of layout flow */}
          {!chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,           // align right edge to container — never overflows screen
                marginBottom: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Single cohesive SVG: pill body + tail shifted right to point toward Koda */}
              <svg width="192" height="48" viewBox="0 0 192 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 18,0 L 174,0 Q 192,0 192,18 Q 192,36 174,36 L 150,36 L 140,48 L 130,36 L 18,36 Q 0,36 0,18 Q 0,0 18,0 Z"
                  fill="rgba(58,111,116,0.85)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <text
                  x="96" y="19"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.9)"
                  fontSize="12"
                  fontFamily="Arial, sans-serif"
                  fontWeight="500"
                >
                  Ask Koda about the forest
                </text>
              </svg>
            </motion.div>
          )}
          <KodaFigure
            weather={weather}
            onClick={() => setChatOpen((v) => !v)}
          />

          {/* Chat panel lives INSIDE the Koda container so it is always
              positioned relative to Koda — never affected by viewport height. */}
          <ChatPanel
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            weatherData={weatherData}
            isKodaVisible={isKodaVisible}
          />
        </div>
      </section>

      <ThreeColSection />
      <WelcomeSection />
      <PartnersSection />
      <EventsSection />
      <Footer />

      {/* ── Dev weather override toggle ── remove before submission */}
      <DevWeatherToggle override={weatherOverride} setOverride={setWeatherOverride} />

      {/* ── Koda Orb ── floats bottom-right when Koda figure has scrolled off screen */}
      <AnimatePresence>
        {!isKodaVisible && (
          <motion.button
            key="koda-orb"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              if (!chatOpen) setChatOpen(true);
            }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
            style={{
              background: 'rgba(18, 36, 30, 0.92)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: '0 0 28px rgba(58,111,116,0.65), 0 0 56px rgba(58,111,116,0.3)',
            }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.93 }}
            aria-label="Open Koda chat"
          >
            {/* Pulsing inner orb */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-4 h-4 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.88)',
                boxShadow: '0 0 10px rgba(255,255,255,0.55)',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
