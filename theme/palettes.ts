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

  // Status badges (semantic — always the same color regardless of accent palette)
  newBg: string;
  newFg: string;
  delayedBg: string;
  delayedFg: string;

  // Semantic — informational / retry actions (always blue, not theme-driven)
  info: string;
  infoOn: string;
  infoInk: string;

  // Semantic — destructive / declined (always red, not theme-driven)
  danger: string;
  dangerSoft: string;
  dangerOn: string;
  dangerInk: string;

  // Tonal fills — translucent tints for softer filled actions (accept/decline).
  // Alpha-based so they sit gently on whatever surface they land on.
  okTint: string;
  dangerTint: string;
  infoTint: string;
  warnTint: string;
  accentTint: string;

  // Outside-phone / web background (frame color in wireframes)
  canvas: string;
};

const surfaces = {
  paper: '#f5f1e8', // brand cream — app background
  paper2: '#efeadd',
  paper3: '#e6dfce',
  ink: '#1f2420',
  inkSoft: '#4a5560', // brand slate — secondary text
  inkMute: '#8a8d83',
  rule: '#e0d9c8', // brand line — borders / dividers
  ruleSoft: '#ebe5d6',
  line: '#2a2f28',
  ok: '#5a8a4d',
  okSoft: '#c8dcb8',
  okInk: '#1d3318',
  okOn: '#ffffff',
  newBg: '#cfe2ee',
  newFg: '#1d3a4f',
  delayedBg: '#f6e3d4',
  delayedFg: '#6e3a13',
  info: '#4f86b0',
  infoOn: '#ffffff',
  infoInk: '#1d3a4f',
  danger: '#c83e2e',
  dangerSoft: '#f4d9d3',
  dangerOn: '#ffffff',
  dangerInk: '#8f2b1f',
  okTint: 'rgba(90, 138, 77, 0.16)',
  dangerTint: 'rgba(200, 62, 46, 0.14)',
  infoTint: 'rgba(79, 134, 176, 0.16)',
  warnTint: 'rgba(184, 106, 44, 0.16)',
  canvas: '#e1dbc9',
} as const;

export const PALETTES = {
  blue: {
    ...surfaces,
    accent: '#6fa3c7',
    accentSoft: '#cfe2ee',
    accentInk: '#1d3a4f',
    accentOn: '#ffffff',
    accentTint: 'rgba(111, 163, 199, 0.16)',
  },
  green: {
    ...surfaces,
    accent: '#5a8a4d',
    accentSoft: '#c8dcb8',
    accentInk: '#1d3318',
    accentOn: '#ffffff',
    accentTint: 'rgba(90, 138, 77, 0.16)',
  },
  orange: {
    ...surfaces,
    accent: '#d97a4a',
    accentSoft: '#f4d8c5',
    accentInk: '#5a2912',
    accentOn: '#ffffff',
    accentTint: 'rgba(217, 122, 74, 0.16)',
  },
  pink: {
    ...surfaces,
    accent: '#c97090',
    accentSoft: '#f0d4dd',
    accentInk: '#4d1f30',
    accentOn: '#ffffff',
    accentTint: 'rgba(201, 112, 144, 0.16)',
  },
  purple: {
    ...surfaces,
    accent: '#8c6bb1',
    accentSoft: '#ddcfee',
    accentInk: '#2e1a4a',
    accentOn: '#ffffff',
    accentTint: 'rgba(140, 107, 177, 0.16)',
  },
  slate: {
    ...surfaces,
    accent: '#7a8590',
    accentSoft: '#d8dde2',
    accentInk: '#2a3035',
    accentOn: '#ffffff',
    accentTint: 'rgba(122, 133, 144, 0.16)',
  },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;

export const DEFAULT_PALETTE: PaletteName = 'green';

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
    paper: '#f5f1e8', // brand cream
    paper2: '#efeadd',
    paper3: '#e6dfce',
    ink: '#1f2420',
    inkSoft: '#4a5560', // brand slate
    inkMute: '#8a8d83',
    rule: '#e0d9c8', // brand line
    ruleSoft: '#ebe5d6',
    line: '#2a2f28',
    canvas: '#e1dbc9',
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
