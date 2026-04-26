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
  orange: {
    ...surfaces,
    accent: '#d97a4a',
    accentSoft: '#f4d8c5',
    accentInk: '#5a2912',
    accentOn: '#ffffff',
  },
  pink: {
    ...surfaces,
    accent: '#c97090',
    accentSoft: '#f0d4dd',
    accentInk: '#4d1f30',
    accentOn: '#ffffff',
  },
  purple: {
    ...surfaces,
    accent: '#8c6bb1',
    accentSoft: '#ddcfee',
    accentInk: '#2e1a4a',
    accentOn: '#ffffff',
  },
  slate: {
    ...surfaces,
    accent: '#7a8590',
    accentSoft: '#d8dde2',
    accentInk: '#2a3035',
    accentOn: '#ffffff',
  },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

export const DEFAULT_PALETTE: PaletteName = 'blue';

/**
 * Background palettes — override the surface tokens (paper / paper2 / paper3, ink shades,
 * rule colors, canvas) on top of an accent palette. Semantic colors (ok*, delayed*) and
 * the accent itself are untouched.
 */
export type BackgroundPalette = Pick<
  Palette,
  'paper' | 'paper2' | 'paper3' | 'ink' | 'inkSoft' | 'inkMute' | 'rule' | 'ruleSoft' | 'line' | 'canvas'
>;

export const BACKGROUND_PALETTES = {
  warm: {
    paper: '#f5f1e8',
    paper2: '#ebe6d7',
    paper3: '#e0d9c4',
    ink: '#1f2420',
    inkSoft: '#4a4f48',
    inkMute: '#8a8d83',
    rule: '#c8c2ad',
    ruleSoft: '#d8d2bd',
    line: '#2a2f28',
    canvas: '#d9d0b8',
  },
  white: {
    paper: '#ffffff',
    paper2: '#f6f6f4',
    paper3: '#ececea',
    ink: '#1a1a1a',
    inkSoft: '#555555',
    inkMute: '#8e8e8e',
    rule: '#e2e2e2',
    ruleSoft: '#eeeeee',
    line: '#222222',
    canvas: '#e8e8e8',
  },
} as const satisfies Record<string, BackgroundPalette>;

export type BackgroundName = keyof typeof BACKGROUND_PALETTES;

export const DEFAULT_BACKGROUND: BackgroundName = 'warm';
