import type { Palette } from './palettes';

/**
 * Semantic tones for actions. Everything that needs a green / red / blue button
 * resolves its colors here so the shades stay identical across the app — change
 * a tone once and every button, pill and label follows.
 *
 *   accent  — the user's chosen theme accent (primary actions)
 *   ok      — positive / confirm (accept, connected)
 *   danger  — destructive / negative (decline, withdraw, delete)
 *   info    — retry / informational (re-connect)
 *   warn    — waiting / pending (requested)
 *   neutral — inert, no semantic weight
 */
export type Tone = 'accent' | 'ok' | 'danger' | 'info' | 'warn' | 'neutral';

export type ToneColors = {
  /** Opaque background for a `solid` fill. */
  solid: string;
  /** Text/icon color on top of `solid`. */
  on: string;
  /** Translucent background for a `tint` fill — the soft look. */
  tint: string;
  /** Text/icon color on top of `tint`, and the color for `outline`. */
  ink: string;
};

export function toneColors(c: Palette, tone: Tone): ToneColors {
  switch (tone) {
    case 'ok':
      return { solid: c.ok, on: c.okOn, tint: c.okTint, ink: c.okInk };
    case 'danger':
      return { solid: c.danger, on: c.dangerOn, tint: c.dangerTint, ink: c.dangerInk };
    case 'info':
      return { solid: c.info, on: c.infoOn, tint: c.infoTint, ink: c.infoInk };
    case 'warn':
      return { solid: c.delayedFg, on: c.paper, tint: c.warnTint, ink: c.delayedFg };
    case 'neutral':
      return { solid: c.paper2, on: c.ink, tint: c.paper2, ink: c.inkMute };
    case 'accent':
    default:
      return { solid: c.accent, on: c.accentOn, tint: c.accentTint, ink: c.accentInk };
  }
}
