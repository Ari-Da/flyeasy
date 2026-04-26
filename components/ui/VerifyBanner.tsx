import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { Text } from './Text';

type IconName = keyof typeof Ionicons.glyphMap;

export function VerifyBanner({
  icon = 'checkmark',
  children,
}: {
  icon?: IconName;
  children: React.ReactNode;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        padding: 12,
        borderRadius: t.radius.lg,
        backgroundColor: t.colors.okSoft,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: t.colors.ok,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={14} color={t.colors.okOn} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.colors.okInk, fontFamily: t.fontFamily.ui, fontSize: 12, lineHeight: 17 }}>
          {children}
        </Text>
      </View>
    </View>
  );
}
