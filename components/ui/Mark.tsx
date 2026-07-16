import { useTheme } from '@/theme';
import { brandColors } from '@/brand/brand';
import { Animated } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

/** Extra rotation applied to a plane (degrees). Number for static, or an
 * Animated interpolation to drive the splash wave. */
type Rotation = number | Animated.AnimatedInterpolation<number>;

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
  /** Extra rotation on each plane, pivoting at its root — drives the splash
   * wave. Default 0 (static). Positive = clockwise. */
  leftRotation = 0,
  rightRotation = 0,
}: {
  size?: number;
  planeColor?: string;
  planeFoldColor?: string;
  leftColor?: string;
  leftFoldColor?: string;
  dotColor?: string;
  leftRotation?: Rotation;
  rightRotation?: Rotation;
}) {
  const t = useTheme();
  const rightColor = planeColor ?? t.colors.accent;
  const rightFold = planeFoldColor ?? darken(rightColor);

  // Rotate each plane around its own centroid so it spins IN PLACE (no drift).
  // react-native-svg ignores originX/originY on an animated <G>, so we pivot via
  // nested groups instead: translate the origin to the centroid, rotate around
  // (0,0), then draw the plane offset back to its normal spot. At rotation 0
  // this is identical to the static mark.
  return (
    <Svg width={size * RATIO} height={size} viewBox="0 0 200 176">
      <G transform="translate(97.9,75.5)">
        <AnimatedG rotation={leftRotation}>
          <G transform="translate(-1.3,-1.5) rotate(-42)">
            <Path d={PLANE_BODY} fill={leftColor} />
            <Path d={PLANE_FOLD} fill={leftFoldColor} opacity={0.85} />
          </G>
        </AnimatedG>
      </G>
      <G transform="translate(102.1,75.5)">
        <AnimatedG rotation={rightRotation}>
          <G transform="translate(1.3,-1.5) rotate(42) scale(-1,1)">
            <Path d={PLANE_BODY} fill={rightColor} />
            <Path d={PLANE_FOLD} fill={rightFold} />
          </G>
        </AnimatedG>
      </G>
      <Circle cx={100} cy={26} r={4.5} fill={dotColor} />
    </Svg>
  );
}
