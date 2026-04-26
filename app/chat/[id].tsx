import { useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { ChatBubble } from '@/components/ChatBubble';
import { CHAT_MESSAGES, getConnection, getFlight, getPerson, type ChatMessage } from '@/data/mock';

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();

  const connection = id ? getConnection(id) : undefined;
  const person = connection ? getPerson(connection.personId) : undefined;
  const flight = connection ? getFlight(connection.flightId) : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>(
    () => (id ? (CHAT_MESSAGES[id] ?? []) : []),
  );
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  if (!connection || !person || !flight) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.paper }}>
        <TopBar back />
        <Text style={{ padding: 18 }}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const closed = connection.closed;

  const send = () => {
    const text = draft.trim();
    if (!text || closed) return;
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, threadId: connection.id, fromMe: true, text },
    ]);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const subtitle = (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 6, paddingHorizontal: 18 }}>
      <Text variant="mono">
        <Text variant="mono" weight="semibold" tone="default">
          {flight.code}
        </Text>
        {' · '}
        {flight.from}→{flight.to}
      </Text>
      <Text variant="mono" tone={closed ? 'mute' : 'okInk'} style={closed ? undefined : { color: t.colors.okInk }}>
        {closed ? 'Closed' : connection.closesIn ? `closes in ${connection.closesIn}` : 'open'}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.paper }}>
        <TopBar
          back
          rightIcon="information-circle-outline"
          title={
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Avatar size={26} initials={person.initials} />
              <Text variant="h3">{person.shortName}</Text>
            </View>
          }
          subtitle={subtitle}
        />

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: t.colors.paper2 }}
          contentContainerStyle={{ padding: 14, gap: 8 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <Text variant="monoSm" align="center" tone="mute" style={{ marginVertical: 6 }}>
            Today
          </Text>
          {messages.map((m) => (
            <ChatBubble key={m.id} fromMe={m.fromMe} text={m.text} />
          ))}
        </ScrollView>

        <SafeAreaView edges={['bottom']} style={{ backgroundColor: t.colors.paper }}>
          <View
            style={{
              flexDirection: 'row',
              gap: 8,
              padding: 14,
              borderTopWidth: 1,
              borderTopColor: t.colors.rule,
              backgroundColor: t.colors.paper,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: t.colors.rule,
                borderRadius: t.radius.md,
                paddingHorizontal: 10,
                paddingVertical: 8,
                backgroundColor: t.colors.paper,
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={closed ? 'Chat closed' : 'Message…'}
                placeholderTextColor={t.colors.inkMute}
                editable={!closed}
                onSubmitEditing={send}
                style={{
                  color: t.colors.ink,
                  fontFamily: t.fontFamily.ui,
                  fontSize: t.fontSize.body,
                  padding: 0,
                }}
              />
            </View>
            <Pressable
              onPress={send}
              disabled={closed || !draft.trim()}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: closed || !draft.trim() ? t.colors.paper3 : t.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={closed || !draft.trim() ? t.colors.inkMute : t.colors.accentOn}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
