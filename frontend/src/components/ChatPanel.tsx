'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherData } from '@/lib/weatherState';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const DEFAULT_W = 280;
const DEFAULT_H = 300;
const MIN_W = 220, MIN_H = 180, MAX_W = 500, MAX_H = 600;

// Tail geometry
const TAIL_H = 20;   // how far the tail tip extends below the bubble body
const TAIL_R = 18;   // tail tip x from panel right edge
const TAIL_BR = 30;  // tail base RIGHT edge x from panel right  (right side moved left)
const TAIL_BL = 52;  // tail base LEFT edge x from panel right  (narrow: 52-30 = 22px wide)
const R = 16;        // bubble corner radius

/**
 * Builds a single SVG path for a rounded-rect speech bubble with the tail at
 * the bottom-right corner. All coordinates are local to the element (0,0 = top-left).
 *
 * The path traces clockwise: top-left → top-right → bottom-right corner →
 * tail right base → tail tip → tail left base → bottom-left corner → close.
 *
 * w, h = bubble body dimensions.
 * Tail extends from y=h to y=h+TAIL_H.
 */
function bubblePath(w: number, h: number): string {
  const tR  = w - TAIL_R;   // tail tip x
  const tbR = w - TAIL_BR;  // tail right base x
  const tbL = w - TAIL_BL;  // tail left base x
  return [
    `M ${R},0`,
    `L ${w - R},0  Q ${w},0  ${w},${R}`,          // top-right corner
    `L ${w},${h - R}  Q ${w},${h}  ${w - R},${h}`,// bottom-right corner
    `L ${tbR},${h}`,                               // right side of tail base
    `L ${tR},${h + TAIL_H}`,                       // tail tip  ← single point
    `L ${tbL},${h}`,                               // left side of tail base
    `L ${R},${h}  Q 0,${h}  0,${h - R}`,          // bottom-left corner
    `L 0,${R}  Q 0,0  ${R},0  Z`,                  // top-left corner → close
  ].join(' ');
}

interface Message { role: 'user' | 'assistant'; content: string; }
interface Props {
  open: boolean;
  onClose: () => void;
  weatherData: WeatherData | null;
  isKodaVisible: boolean;
}

export default function ChatPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll the messages container itself — never the page
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function onResizeDown(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX, sy = e.clientY, sw = size.w, sh = size.h;
    const move = (ev: MouseEvent) => setSize({
      w: Math.min(MAX_W, Math.max(MIN_W, sw - (ev.clientX - sx))),
      h: Math.min(MAX_H, Math.max(MIN_H, sh - (ev.clientY - sy))),
    });
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(p => [...p, { role: 'user', content: text }]);
    setInput(''); setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, message: text }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setMessages(p => [...p, { role: 'assistant', content: json.response ?? '(no response)' }]);
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'The forest spirit is silent for now. Try again in a moment.' }]);
    } finally { setLoading(false); }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const totalH = size.h + TAIL_H;
  const path = bubblePath(size.w, size.h);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="chat-panel"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          // Positioned relative to the Koda container div (110 px wide).
          // right: 100px  → shifts the whole panel further left from Koda container.
          //                  Tail tip (28 px from panel right) lands near Koda's head.
          // bottom: 220px → panel body clears Koda's full height (~220 px SVG + pb-2).
          className="absolute z-20"
          style={{ bottom: '220px', right: '65px', transformOrigin: 'bottom right' }}
        >
          {/*
           * The drop-shadow filter traces the SVG path boundary → unified glow.
           * Because the element is position:absolute (not fixed) the filter is safe.
           */}
          <div
            style={{
              filter:
                'drop-shadow(0 0 1px rgba(255,255,255,0.18)) ' +
                'drop-shadow(0 16px 32px rgba(0,0,0,0.65))',
            }}
          >
            {/*
             * SHAPE CONTAINER — sized to include the tail.
             * The SVG draws the entire bubble+tail as ONE path fill.
             * No separate tail element, no border — zero seam possible.
             */}
            <div style={{ position: 'relative', width: `${size.w}px`, height: `${totalH}px` }}>

              {/* ─── SVG background: single path = zero seam ─── */}
              <svg
                width={size.w}
                height={totalH}
                viewBox={`0 0 ${size.w} ${totalH}`}
                style={{ position: 'absolute', top: 0, left: 0, display: 'block', overflow: 'visible' }}
                aria-hidden
              >
                <path
                  d={path}
                  fill="rgba(12,22,17,0.97)"
                />
              </svg>

              {/*
               * ─── Content layer ───
               * Positioned over the bubble body only (height: size.h, not totalH).
               * overflow:hidden + border-radius clips content at the rounded corners.
               * No background — the SVG fill shows through, keeping colour consistent.
               */}
              <div
                className="relative flex flex-col z-10"
                style={{
                  width: `${size.w}px`,
                  height: `${size.h}px`,
                  overflow: 'hidden',
                  borderRadius: `${R}px`,
                }}
              >
                {/* TOP-LEFT resize handle */}
                <div
                  onMouseDown={onResizeDown}
                  className="absolute top-0 left-0 z-20 w-6 h-6 flex items-end justify-end pr-1 pb-1"
                  style={{ cursor: 'nwse-resize' }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="2" cy="8" r="1.2" fill="rgba(255,255,255,0.28)" />
                    <circle cx="5" cy="5" r="1.2" fill="rgba(255,255,255,0.18)" />
                    <circle cx="8" cy="2" r="1.2" fill="rgba(255,255,255,0.10)" />
                  </svg>
                </div>

                {/* HEADER */}
                <div
                  className="shrink-0 flex items-center justify-between pl-8 pr-4 py-2.5"
                  style={{
                    background: 'rgba(58,111,116,0.90)',
                    borderBottom: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">Koda</span>
                    <span className="text-white/40 text-xs">· forest spirit</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="z-10 text-white/40 hover:text-white transition-colors text-lg leading-none ml-4"
                    style={{ pointerEvents: 'auto' }}
                    aria-label="Close"
                  >×</button>
                </div>

                {/* MESSAGES */}
                <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5">
                  {messages.length === 0 && (
                    <p className="text-white/35 italic text-center mt-6 text-xs leading-relaxed">
                      I am Koda, spirit of this forest.<br />Ask me anything about Hubbard Brook.
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          m.role === 'user' ? 'text-white rounded-br-sm' : 'text-white/90 rounded-bl-sm'
                        }`}
                        style={{
                          background:
                            m.role === 'user'
                              ? 'rgba(58,111,116,0.75)'
                              : 'rgba(255,255,255,0.09)',
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div
                        className="px-3 py-2 rounded-xl rounded-bl-sm text-xs inline-flex gap-1"
                        style={{ background: 'rgba(255,255,255,0.09)' }}
                      >
                        {[0, 1, 2].map(i => (
                          <span
                            key={i}
                            className="text-white/60 animate-bounce"
                            style={{ animationDelay: `${i * 120}ms` }}
                          >·</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* INPUT */}
                <div
                  className="shrink-0 px-3 py-2.5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-2">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKey}
                      placeholder="Ask Koda…"
                      rows={1}
                      className="flex-1 resize-none text-white placeholder-white/25 text-xs rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-teal-500/40"
                      style={{ background: 'rgba(255,255,255,0.06)' }}
                    />
                    <button
                      onClick={send}
                      disabled={loading || !input.trim()}
                      className="shrink-0 px-3 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-25"
                      style={{ background: '#3a6f74' }}
                    >Send</button>
                  </div>
                </div>
              </div>
              {/* end content layer */}

            </div>
            {/* end shape container */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
