import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  BACKGROUND_PALETTES,
  DEFAULT_BACKGROUND,
  DEFAULT_PALETTE,
  PALETTES,
  type BackgroundName,
  type Palette,
  type PaletteName,
} from './palettes';
import { fontFamily, fontSize, fontWeight, letterSpacing, radius, spacing } from './tokens';

export type Theme = {
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  fontFamily: typeof fontFamily;
  letterSpacing: typeof letterSpacing;
};

type ThemeContextValue = {
  theme: Theme;
  paletteName: PaletteName;
  setPalette: (name: PaletteName) => void;
  backgroundName: BackgroundName;
  setBackground: (name: BackgroundName) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialPalette = DEFAULT_PALETTE,
  initialBackground = DEFAULT_BACKGROUND,
}: {
  children: ReactNode;
  initialPalette?: PaletteName;
  initialBackground?: BackgroundName;
}) {
  const [paletteName, setPalette] = useState<PaletteName>(initialPalette);
  const [backgroundName, setBackground] = useState<BackgroundName>(initialBackground);

  const value = useMemo<ThemeContextValue>(
    () => ({
      paletteName,
      setPalette,
      backgroundName,
      setBackground,
      theme: {
        colors: { ...PALETTES[paletteName], ...BACKGROUND_PALETTES[backgroundName] },
        spacing,
        radius,
        fontSize,
        fontWeight,
        fontFamily,
        letterSpacing,
      },
    }),
    [paletteName, backgroundName],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx.theme;
}

export function useThemeControls() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeControls must be used inside ThemeProvider');
  return {
    paletteName: ctx.paletteName,
    setPalette: ctx.setPalette,
    backgroundName: ctx.backgroundName,
    setBackground: ctx.setBackground,
  };
}
