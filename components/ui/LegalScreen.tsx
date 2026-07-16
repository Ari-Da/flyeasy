import type { ReactNode } from 'react';
import { View } from 'react-native';
import { LEGAL_LAST_UPDATED } from '@/brand/brand';
import { Screen } from './Screen';
import { Text } from './Text';
import { TopBar } from './TopBar';

/** Page chrome for a legal / long-form document: back bar, title, and a
 * "last updated" line, over scrollable content. */
export function LegalScreen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 48 }}>
      <TopBar back title={title} />
      <Text variant="h2">{title}</Text>
      <Text variant="caption" tone="mute">
        Last updated: {LEGAL_LAST_UPDATED}
      </Text>
      <View style={{ gap: 14, marginTop: 8 }}>{children}</View>
    </Screen>
  );
}

/** A numbered/titled section within a legal document. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="h3">{heading}</Text>
      {children}
    </View>
  );
}

/** A body paragraph within a legal document. */
export function LegalP({ children }: { children: ReactNode }) {
  return (
    <Text variant="body" tone="soft" style={{ lineHeight: 20 }}>
      {children}
    </Text>
  );
}
