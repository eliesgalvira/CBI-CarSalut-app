/**
 * Midnight Forge — Premium Automotive Design System
 *
 * Deep navy-black canvas with warm copper accents,
 * teal health indicators, and generous rounded shapes.
 */

export const T = {
  // ── Background layers ─────────────────────────────────────
  bg: '#0B0F19',
  bgCard: '#141929',
  bgElevated: '#1C2237',
  bgInput: '#0F1322',
  bgOverlay: 'rgba(11, 15, 25, 0.92)',

  // ── Brand accent — warm copper ────────────────────────────
  accent: '#D4956B',
  accentLight: '#E8B896',
  accentDim: 'rgba(212, 149, 107, 0.14)',
  accentBorder: 'rgba(212, 149, 107, 0.28)',

  // ── Status colours ────────────────────────────────────────
  ok: '#2DD4BF',
  okDim: 'rgba(45, 212, 191, 0.12)',
  warn: '#FBBF24',
  warnDim: 'rgba(251, 191, 36, 0.12)',
  bad: '#F87171',
  badDim: 'rgba(248, 113, 113, 0.12)',
  info: '#60A5FA',

  // ── Text ──────────────────────────────────────────────────
  text: '#E8ECF4',
  textSoft: '#94A0B8',
  textMuted: '#566175',

  // ── Borders ───────────────────────────────────────────────
  border: 'rgba(255, 255, 255, 0.06)',
  borderLight: 'rgba(255, 255, 255, 0.10)',

  // ── Radius tokens ────────────────────────────────────────
  r: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 999,
  },
} as const;

/** Return status colour for a health percentage. */
export function healthColor(pct: number) {
  if (pct >= 70) return T.ok;
  if (pct >= 50) return T.warn;
  return T.bad;
}

/** Dimmed version of the status colour. */
export function healthColorDim(pct: number) {
  if (pct >= 70) return T.okDim;
  if (pct >= 50) return T.warnDim;
  return T.badDim;
}
