import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type CardProps = ViewProps & {
  flat?: boolean;
  tight?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ flat, tight, style, children, ...rest }: CardProps) {
  const t = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: flat ? t.colors.paper2 : t.colors.paper,
          borderColor: flat ? 'transparent' : t.colors.rule,
          borderWidth: flat ? 0 : 1,
          borderRadius: t.radius.xl,
          padding: tight ? 10 : 12,
          gap: tight ? 8 : 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
