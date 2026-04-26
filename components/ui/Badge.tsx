import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { FLIGHT_STATUS, type FlightStatus } from '@/lib/flights';
import { Text } from './Text';

type Variant = 'default' | 'accent' | 'solid' | 'ok';

export type BadgeProps = {
  children: string;
  variant?: Variant;
  status?: FlightStatus;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ children, variant = 'default', status, style }: BadgeProps) {
  const t = useTheme();

  let bg = t.colors.paper2;
  let fg = t.colors.inkSoft;
  let borderColor: string = t.colors.rule;

  if (status === FLIGHT_STATUS.NEW) {
    bg = t.colors.accentSoft;
    fg = t.colors.accentInk;
    borderColor = 'transparent';
  } else if (status === FLIGHT_STATUS.ONGOING) {
    bg = t.colors.ok;
    fg = '#fff';
    borderColor = 'transparent';
  } else if (status === FLIGHT_STATUS.DELAYED) {
    bg = t.colors.delayedBg;
    fg = t.colors.delayedFg;
    borderColor = 'transparent';
  } else if (status === FLIGHT_STATUS.COMPLETE) {
    bg = t.colors.paper2;
    fg = t.colors.inkMute;
    borderColor = t.colors.rule;
  } else if (variant === 'accent') {
    bg = t.colors.accentSoft;
    fg = t.colors.accentInk;
    borderColor = 'transparent';
  } else if (variant === 'solid') {
    bg = t.colors.accent;
    fg = t.colors.accentOn;
    borderColor = 'transparent';
  } else if (variant === 'ok') {
    bg = t.colors.okSoft;
    fg = t.colors.okInk;
    borderColor = 'transparent';
  }

  const isStatus = !!status;
  const text = isStatus ? children.charAt(0).toUpperCase() + children.slice(1) : children;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
          paddingHorizontal: 7,
          paddingVertical: 3,
          borderRadius: t.radius.sm,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.monoSemibold,
          fontSize: t.fontSize.micro,
          letterSpacing: t.letterSpacing.caps,
          textTransform: 'uppercase',
          color: fg,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
