import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;
type Tone = 'verify' | 'info';

export function VerifyBanner({
  icon = 'checkmark',
  tone = 'verify',
  children,
}: {
  icon?: IconName;
  tone?: Tone;
  children: React.ReactNode;
}) {
  const t = useTheme();

  const palette =
    tone === 'info'
      ? {
          bg: t.colors.paper2,
          iconBg: t.colors.inkMute,
          iconFg: t.colors.paper,
          textColor: t.colors.inkSoft,
        }
      : {
          bg: t.colors.okSoft,
          iconBg: t.colors.ok,
          iconFg: t.colors.okOn,
          textColor: t.colors.okInk,
        };

  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: t.radius.lg,
        backgroundColor: palette.bg,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: palette.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={14} color={palette.iconFg} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: palette.textColor, fontFamily: t.fontFamily.ui, fontSize: 12, lineHeight: 17 }}>
          {children}
        </Text>
      </View>
    </View>
  );
}
