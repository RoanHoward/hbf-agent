'use client';

import { useMemo } from 'react';
import type { WeatherState } from '@/lib/weatherState';

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

interface Props {
  weather: WeatherState;
}

function useParticles(count: number): Particle[] {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 3000),
        duration: 600 + Math.round(Math.random() * 800),
        size: 1 + Math.round(Math.random() * 2),
      })),
    [count],
  );
}

export default function WeatherParticles({ weather }: Props) {
  const isRain = weather === 'rain' || weather === 'heavyRain';
  const isSnow = weather === 'snow';

  const count = weather === 'heavyRain' ? 80 : weather === 'rain' ? 40 : weather === 'snow' ? 35 : 0;
  const particles = useParticles(count);

  if (!isRain && !isSnow) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) =>
        isRain ? (
          <span
            key={p.id}
            className="absolute block rounded-full bg-blue-200/50"
            style={{
              left: `${p.left}%`,
              top: '-4px',
              width: `${p.size}px`,
              height: `${p.size * 8}px`,
              animation: `rain-fall ${p.duration}ms linear ${p.delay}ms infinite backwards`,
            }}
          />
        ) : (
          <span
            key={p.id}
            className="absolute block rounded-full bg-white/60"
            style={{
              left: `${p.left}%`,
              top: '-8px',
              width: `${p.size + 3}px`,
              height: `${p.size + 3}px`,
              animation: `snow-fall ${p.duration * 3}ms linear ${p.delay}ms infinite backwards`,
            }}
          />
        ),
      )}
    </div>
  );
}
