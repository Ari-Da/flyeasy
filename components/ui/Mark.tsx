import { useTheme } from '@/theme';
import { brandColors } from '@/brand/brand';
import Svg, { Circle, G, Path } from 'react-native-svg';

/**
 * The Flyeasy mark — two paper planes on converging paths meeting nose-to-nose.
 * Ported from brand_designs/flyeasy-logo.svg (viewBox 0 0 200 176), the same
 * geometry the app icon and splash are rasterized from, so the in-app mark and
 * the launcher icon stay identical.
 *
 * The RIGHT (green) plane is theme-driven: `planeColor` defaults to the user's
 * selected accent, so dropping <Mark /> into a top bar makes the plane follow
 * the accent chosen in settings. Pass an explicit `planeColor` for contexts
 * that must stay fixed. The left plane is a fixed brand slate by design.
 */
const PLANE_BODY = 'M0,-46 L26,34 L0,18 L-26,34 Z';
const PLANE_FOLD = 'M0,-46 L0,18 L-26,34 Z';
const RATIO = 200 / 176;

/**
 * Darken a hex color toward a shadow shade by scaling each channel. At 0.6 the
 * brand green (#5a8a4d) yields a deep green (#365430) — clearly darker than the
 * body but still the accent hue, so the fold never reads as flat black. Lower
 * the factor for a darker fold, raise it toward 1 for a lighter one.
 */
function darken(hex: string, factor = 0.6): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function Mark({
  size = 32,
  /** Right ("green") plane — defaults to the selected accent. */
  planeColor,
  /** Right plane's fold shadow — defaults to a darkened shade of the accent. */
  planeFoldColor,
  /** Left plane body / fold — fixed brand slate + ink unless overridden. */
  leftColor = brandColors.slate,
  leftFoldColor = brandColors.ink,
  dotColor = brandColors.ink,
}: {
  size?: number;
  planeColor?: string;
  planeFoldColor?: string;
  leftColor?: string;
  leftFoldColor?: string;
  dotColor?: string;
}) {
  const t = useTheme();
  const rightColor = planeColor ?? t.colors.accent;
  const rightFold = planeFoldColor ?? darken(rightColor);

  return (
    <Svg width={size * RATIO} height={size} viewBox="0 0 200 176">
      <G transform="translate(96.6,74) rotate(-42)">
        <Path d={PLANE_BODY} fill={leftColor} />
        <Path d={PLANE_FOLD} fill={leftFoldColor} opacity={0.85} />
      </G>
      <G transform="translate(103.4,74) rotate(42) scale(-1,1)">
        <Path d={PLANE_BODY} fill={rightColor} />
        <Path d={PLANE_FOLD} fill={rightFold} />
      </G>
      <Circle cx={100} cy={26} r={4.5} fill={dotColor} />
    </Svg>
  );
}
