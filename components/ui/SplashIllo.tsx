import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { useTheme } from '@/theme';

/**
 * Two travelers waving — ported verbatim from the wireframe SVG so the splash
 * look matches the design exactly.
 */
export function SplashIllo({ width = 220 }: { width?: number }) {
  const t = useTheme();
  const ink = t.colors.ink;
  const paper = t.colors.paper;
  const height = (width * 170) / 240;

  return (
    <Svg viewBox="0 0 240 170" width={width} height={height}>
      <Ellipse cx="80" cy="158" rx="22" ry="2.5" fill={ink} opacity={0.16} />
      <Ellipse cx="170" cy="158" rx="22" ry="2.5" fill={ink} opacity={0.16} />

      <G stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* suitcase */}
        <G fill={ink}>
          <Rect x="36" y="108" width="20" height="40" rx={3} stroke={ink} strokeWidth={2} />
          <Rect x="40" y="114" width="12" height="14" rx={1.5} fill={paper} stroke="none" opacity={0.55} />
          <Line x1="46" y1="78" x2="46" y2="108" stroke={ink} strokeWidth={2} />
          <Rect x="40" y="76" width="12" height="3" rx={1.5} stroke={ink} strokeWidth={0} />
          <Rect x="36" y="148" width="6" height="3" rx={1} stroke="none" />
          <Rect x="50" y="148" width="6" height="3" rx={1} stroke="none" />
        </G>

        {/* left traveler */}
        <G>
          <Circle cx="78" cy="32" r="9" fill={ink} stroke="none" />
          <Path d="M70 28 q1 -9 8 -10 q9 -1 10 7" fill={ink} stroke="none" />
          <Line x1="78" y1="41" x2="78" y2="46" />
          <Path
            d="M 68 48 L 88 48 L 88 100 q 0 3 -4 3 l -12 0 q -4 0 -4 -3 z"
            fill={ink}
            stroke="none"
          />
          <Line x1="86" y1="50" x2="96" y2="40" />
          <Line x1="96" y1="40" x2="100" y2="22" />
          <Circle cx="100" cy="20" r="3.5" fill={ink} stroke="none" />
          <Line x1="70" y1="50" x2="62" y2="62" />
          <Line x1="62" y1="62" x2="50" y2="76" />
          <Circle cx="48" cy="78" r="3" fill={ink} stroke="none" />
          <Line x1="74" y1="100" x2="71" y2="142" />
          <Line x1="82" y1="100" x2="85" y2="142" />
          <Ellipse cx="69" cy="146" rx="6" ry="2.5" fill={ink} stroke="none" />
          <Ellipse cx="87" cy="146" rx="6" ry="2.5" fill={ink} stroke="none" />
        </G>

        {/* right traveler with backpack */}
        <G>
          <Rect x="172" y="50" width="16" height="44" rx={1.5} fill={ink} stroke="none" />
          <Rect x="178" y="46" width="4" height="4" rx={0.5} fill={ink} stroke="none" />
          <Rect x="172" y="50" width="3" height="3" fill={paper} stroke="none" opacity={0.55} />
          <Rect x="185" y="50" width="3" height="3" fill={paper} stroke="none" opacity={0.55} />
          <Line x1="172" y1="66" x2="188" y2="66" stroke={paper} strokeWidth={1.4} opacity={0.55} />
          <Rect x="174" y="72" width="12" height="14" fill={paper} stroke="none" opacity={0.3} />
          <Line x1="174" y1="80" x2="186" y2="80" stroke={paper} strokeWidth={1} opacity={0.6} />

          <Circle cx="168" cy="32" r="9" fill={ink} stroke="none" />
          <Path d="M160 28 q1 -9 8 -10 q9 -1 10 7" fill={ink} stroke="none" />
          <Line x1="168" y1="41" x2="168" y2="46" />
          <Path
            d="M 158 48 L 178 48 L 178 100 q 0 3 -4 3 l -12 0 q -4 0 -4 -3 z"
            fill={ink}
            stroke="none"
          />
          <Line x1="163" y1="50" x2="167" y2="86" stroke={paper} strokeWidth={2.4} opacity={0.4} />
          <Line x1="173" y1="50" x2="169" y2="86" stroke={paper} strokeWidth={2.4} opacity={0.4} />
          <Line x1="160" y1="50" x2="150" y2="40" />
          <Line x1="150" y1="40" x2="146" y2="22" />
          <Circle cx="146" cy="20" r="3.5" fill={ink} stroke="none" />
          <Line x1="176" y1="50" x2="180" y2="64" />
          <Line x1="180" y1="64" x2="178" y2="84" />
          <Circle cx="178" cy="86" r="3" fill={ink} stroke="none" />
          <Line x1="164" y1="100" x2="161" y2="142" />
          <Line x1="172" y1="100" x2="175" y2="142" />
          <Ellipse cx="159" cy="146" rx="6" ry="2.5" fill={ink} stroke="none" />
          <Ellipse cx="177" cy="146" rx="6" ry="2.5" fill={ink} stroke="none" />
        </G>
      </G>
    </Svg>
  );
}
