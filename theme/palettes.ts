/**
 * Color palettes for Flyeasy.
 *
 * The wireframes ship 3 swappable accent variants on top of a shared warm-paper
 * surface palette. Add a new palette by appending to PALETTES — every screen
 * pulls colors from useTheme() so the swap is one line.
 */

export type Palette = {
  // Surfaces
  paper: string;
  paper2: string;
  paper3: string;

  // Text
  ink: string;
  inkSoft: string;
  inkMute: string;

  // Borders & lines
  rule: string;
  ruleSoft: string;
  line: string;

  // Accent (theme-driven)
  accent: string;
  accentSoft: string;
  accentInk: string;
  accentOn: string;

  // Semantic — verified / available (always sage green, not theme-driven)
  ok: string;
  okSoft: string;
  okInk: string;
  okOn: string;

  // Status badges
  delayedBg: string;
  delayedFg: string;

  // Outside-phone / web background (frame color in wireframes)
  canvas: string;
};

const surfaces = {
  paper: '#f5f1e8',
  paper2: '#ebe6d7',
  paper3: '#e0d9c4',
  ink: '#1f2420',
  inkSoft: '#4a4f48',
  inkMute: '#8a8d83',
  rule: '#c8c2ad',
  ruleSoft: '#d8d2bd',
  line: '#2a2f28',
  ok: '#5a8a4d',
  okSoft: '#c8dcb8',
  okInk: '#1d3318',
  okOn: '#ffffff',
  delayedBg: '#f6e3d4',
  delayedFg: '#6e3a13',
  canvas: '#d9d0b8',
} as const;

export const PALETTES = {
  blue: {
    ...surfaces,
    accent: '#6fa3c7',
    accentSoft: '#cfe2ee',
    accentInk: '#1d3a4f',
    accentOn: '#ffffff',
  },
  green: {
    ...surfaces,
    accent: '#5a8a4d',
    accentSoft: '#c8dcb8',
    accentInk: '#1d3318',
    accentOn: '#ffffff',
  },
  slate: {
    ...surfaces,
    accent: '#4a5560',
    accentSoft: '#c8cdd4',
    accentInk: '#1a1f25',
    accentOn: '#ffffff',
  },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

export const DEFAULT_PALETTE: PaletteName = 'blue';
