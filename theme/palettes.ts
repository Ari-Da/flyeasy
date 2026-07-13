export type Palette = {
  paper: string;
  paper2: string;
  paper3: string;
  ink: string;
  inkSoft: string;
  inkMute: string;
  rule: string;
  ruleSoft: string;
  line: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  accentOn: string;
  ok: string;
  okSoft: string;
  okInk: string;
  okOn: string;
  newBg: string;
  newFg: string;
  delayedBg: string;
  delayedFg: string;
  canvas: string;
};

const surfaces = {
  paper: '#f8f6f0',
  paper2: '#f0ede4',
  paper3: '#e6e1d4',
  ink: '#1f2420',
  inkSoft: '#4a4f48',
  inkMute: '#8a8d83',
  rule: '#d2cdbe',
  ruleSoft: '#dfdbcd',
  line: '#2a2f28',
  ok: '#5a8a4d',
  okSoft: '#c8dcb8',
  okInk: '#1d3318',
  okOn: '#ffffff',
  newBg: '#cfe2ee',
  newFg: '#1d3a4f',
  delayedBg: '#f6e3d4',
  delayedFg: '#6e3a13',
  canvas: '#e1dbc9',
} as const;

export const PALETTES = {
  blue: { ...surfaces, accent: '#6fa3c7', accentSoft: '#cfe2ee', accentInk: '#1d3a4f', accentOn: '#ffffff' },
  green: { ...surfaces, accent: '#5a8a4d', accentSoft: '#c8dcb8', accentInk: '#1d3318', accentOn: '#ffffff' },
  orange: { ...surfaces, accent: '#d97a4a', accentSoft: '#f4d8c5', accentInk: '#5a2912', accentOn: '#ffffff' },
  pink: { ...surfaces, accent: '#c97090', accentSoft: '#f0d4dd', accentInk: '#4d1f30', accentOn: '#ffffff' },
  purple: { ...surfaces, accent: '#8c6bb1', accentSoft: '#ddcfee', accentInk: '#2e1a4a', accentOn: '#ffffff' },
  slate: { ...surfaces, accent: '#7a8590', accentSoft: '#d8dde2', accentInk: '#2a3035', accentOn: '#ffffff' },
} as const satisfies Record<string, Palette>;

export type PaletteName = keyof typeof PALETTES;
export const DEFAULT_PALETTE: PaletteName = 'blue';

export type BackgroundPalette = Pick<
  Palette,
  'paper' | 'paper2' | 'paper3' | 'ink' | 'inkSoft' | 'inkMute' | 'rule' | 'ruleSoft' | 'line' | 'canvas'
>;

export const BACKGROUND_PALETTES = {
  warm: {
    paper: '#f8f6f0',
    paper2: '#f0ede4',
    paper3: '#e6e1d4',
    ink: '#1f2420',
    inkSoft: '#4a4f48',
    inkMute: '#8a8d83',
    rule: '#d2cdbe',
    ruleSoft: '#dfdbcd',
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
