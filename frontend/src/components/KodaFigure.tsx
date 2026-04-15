'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import type { WeatherState } from '@/lib/weatherState';

interface Props {
  weather: WeatherState;
  onClick: () => void;
}

// Each weather state has a pair of arm paths [leftArm, rightArm]
const ARM_PATHS: Record<WeatherState, [string, string]> = {
  idle: [
    'M 40,62 Q 28,82 26,102',
    'M 70,62 Q 82,82 84,102',
  ],
  rain: [
    'M 40,62 Q 34,42 50,32',
    'M 70,62 Q 82,82 84,102',
  ],
  heavyRain: [
    'M 40,62 Q 28,42 34,26',
    'M 70,62 Q 82,42 76,26',
  ],
  wind: [
    'M 40,62 Q 20,74 16,94',
    'M 70,62 Q 90,70 94,88',
  ],
  cold: [
    'M 40,62 Q 54,74 64,78',
    'M 70,62 Q 56,74 46,78',
  ],
  snow: [
    'M 40,62 Q 54,74 64,78',
    'M 70,62 Q 56,74 46,78',
  ],
  sunny: [
    'M 40,62 Q 18,50 6,54',
    'M 70,62 Q 92,50 104,54',
  ],
};

// Body animation per weather state
const BODY_VARIANTS: Record<WeatherState, TargetAndTransition> = {
  idle: {
    rotate: [0, 1.5, 0, -1.5, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
  rain: {
    y: [0, 2, 0],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  heavyRain: {
    x: [-0.8, 0.8, -0.8, 0],
    transition: { duration: 0.5, repeat: Infinity, ease: 'linear' },
  },
  wind: {
    rotate: [0, 7, 5, 7, 5, 0],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  cold: {
    x: [-1, 1, -1, 1, 0],
    transition: { duration: 0.28, repeat: Infinity, ease: 'linear' },
  },
  snow: {
    x: [-1, 1, -1, 1, 0],
    transition: { duration: 0.28, repeat: Infinity, ease: 'linear' },
  },
  sunny: {
    scale: [1, 1.03, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

const WHITE_FILL = 'rgba(255,255,255,0.05)';
const WHITE_STROKE = 'rgba(255,255,255,0.9)';
const STROKE_W = 1.5;

export default function KodaFigure({ weather, onClick }: Props) {
  const [leftArm, rightArm] = ARM_PATHS[weather];
  const bodyAnim = BODY_VARIANTS[weather];

  return (
    <motion.div
      className="cursor-pointer select-none"
      style={{ opacity: 0.85, originX: '50%', originY: '100%' }}
      animate={bodyAnim}
      onClick={onClick}
      whileHover={{ opacity: 1, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}
    >
      <svg
        width="110"
        height="220"
        viewBox="0 0 110 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === FEATHER === */}
        <path
          d="M 62,14 C 68,6 74,2 71,8 C 76,2 78,0 74,7 C 78,3 77,10 70,14 Z"
          fill="rgba(255,255,255,0.15)"
          stroke={WHITE_STROKE}
          strokeWidth={1}
        />
        <line x1="66" y1="14" x2="61" y2="26" stroke={WHITE_STROKE} strokeWidth={1} />

        {/* === HEAD === */}
        <circle
          cx="55"
          cy="28"
          r="16"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />

        {/* === HAIR / BRAIDS === */}
        {/* Left braid */}
        <path
          d="M 42,24 Q 38,40 36,58 Q 34,76 36,92"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />
        <path
          d="M 39,30 Q 35,46 33,64"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {/* Right braid */}
        <path
          d="M 68,24 Q 72,40 74,58 Q 76,76 74,92"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />
        <path
          d="M 71,30 Q 75,46 77,64"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={1}
          strokeDasharray="3 3"
        />

        {/* === NECK === */}
        <rect
          x="50"
          y="43"
          width="10"
          height="10"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={1}
        />

        {/* === TUNIC (body) === */}
        <path
          d="M 38,52 L 72,52 L 78,135 L 32,135 Z"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />

        {/* Geometric patterns on tunic — horizontal band with triangles */}
        <path
          d="M 36,80 L 44,68 L 52,80 L 60,68 L 68,80 L 74,72"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={1}
          opacity={0.6}
        />
        <line x1="34" y1="95" x2="76" y2="95" stroke={WHITE_STROKE} strokeWidth={0.8} opacity={0.5} />
        <path
          d="M 37,110 L 43,103 L 49,110 L 55,103 L 61,110 L 67,103 L 73,110"
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={0.8}
          opacity={0.5}
        />

        {/* === ARMS === */}
        <motion.path
          d={leftArm}
          animate={{ d: leftArm }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W + 0.5}
          strokeLinecap="round"
        />
        <motion.path
          d={rightArm}
          animate={{ d: rightArm }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          fill="none"
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W + 0.5}
          strokeLinecap="round"
        />
        {/* Hand nubs */}
        <motion.circle
          animate={{ cx: parseHandX(leftArm), cy: parseHandY(leftArm) }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          r="3"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={1}
        />
        <motion.circle
          animate={{ cx: parseHandX(rightArm), cy: parseHandY(rightArm) }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          r="3"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={1}
        />

        {/* === LEGS === */}
        <line x1="46" y1="135" x2="43" y2="178" stroke={WHITE_STROKE} strokeWidth={STROKE_W + 0.5} strokeLinecap="round" />
        <line x1="64" y1="135" x2="67" y2="178" stroke={WHITE_STROKE} strokeWidth={STROKE_W + 0.5} strokeLinecap="round" />

        {/* === MOCCASINS === */}
        <ellipse
          cx="41"
          cy="179"
          rx="9"
          ry="4"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />
        <ellipse
          cx="69"
          cy="179"
          rx="9"
          ry="4"
          fill={WHITE_FILL}
          stroke={WHITE_STROKE}
          strokeWidth={STROKE_W}
        />
      </svg>
    </motion.div>
  );
}

// Parse the endpoint of a cubic/quadratic path for hand positioning
function parseHandX(d: string): number {
  const nums = d.split(/[MQC\s,]+/).filter(Boolean).map(Number);
  return nums[nums.length - 2] ?? 55;
}
function parseHandY(d: string): number {
  const nums = d.split(/[MQC\s,]+/).filter(Boolean).map(Number);
  return nums[nums.length - 1] ?? 100;
}
