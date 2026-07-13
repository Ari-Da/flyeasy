import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

export type ScreenProps = {
  children: React.ReactNode;
  scroll?: boolean;
  /** Render with no horizontal padding — for full-bleed lists / chat */
  noPadding?: boolean;
  /** Override background — defaults to theme paper */
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /** Footer rendered below scrollable content (e.g., chat composer) */
  footer?: React.ReactNode;
  /** Skips the SafeAreaView's bottom inset (useful when followed by a tab bar). */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function Screen({
  children,
  scroll = true,
  noPadding,
  background,
  contentStyle,
  footer,
  edges = ['top', 'left', 'right'],
}: ScreenProps) {
  const t = useTheme();
  const bg = background ?? t.colors.paper;

  const innerPadding = noPadding ? 0 : 18;

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[
        {
          paddingHorizontal: innerPadding,
          paddingBottom: 24,
          paddingTop: 6,
          gap: 12,
        },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        {
          flex: 1,
          paddingHorizontal: innerPadding,
          paddingTop: 6,
          paddingBottom: 12,
          gap: 12,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: bg }}>
      {content}
      {footer}
    </SafeAreaView>
  );
}
