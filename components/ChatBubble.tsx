import { View } from 'react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/ui/Text';

export function ChatBubble({ fromMe, text }: { fromMe: boolean; text: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        maxWidth: '78%',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        alignSelf: fromMe ? 'flex-end' : 'flex-start',
        backgroundColor: fromMe ? t.colors.accent : t.colors.paper2,
        borderBottomRightRadius: fromMe ? 4 : 16,
        borderBottomLeftRadius: fromMe ? 16 : 4,
      }}
    >
      <Text
        style={{
          color: fromMe ? t.colors.accentOn : t.colors.ink,
          fontFamily: t.fontFamily.ui,
          fontSize: t.fontSize.body,
          lineHeight: t.fontSize.body * 1.4,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
