import { useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/auth/AuthContext';
import { useTheme } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { Toggle } from '@/components/ui/Toggle';
import { TopBar } from '@/components/ui/TopBar';
import { VerifyBanner } from '@/components/ui/VerifyBanner';
import { ChatBubble } from '@/components/ChatBubble';
import {
  fetchChatThreads,
  fetchMessages,
  markChatRead,
  sendMessage,
  setChatPaused,
  type ChatThread,
  type Message,
} from '@/lib/chat';
import { fetchFlight } from '@/lib/flights';
import type { Flight } from '@/types/models';

// INTERIM-POLLING: how often the open thread refetches messages. Remove when
// Supabase Realtime lands (see README "Chat delivery — interim polling").
const POLL_MS = 5000;

export default function ChatThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const { session } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [thread, setThread] = useState<ChatThread | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const [threads, msgs] = await Promise.all([fetchChatThreads(), fetchMessages(id)]);
      const th = threads.find((x) => x.id === id) ?? null;
      if (!th) {
        setNotFound(true);
        return;
      }
      setThread(th);
      setMessages(msgs);
      // Fetch flight for header context (may be a past flight — that's fine).
      fetchFlight(th.myFlightId).then(setFlight).catch(() => {});
      // Opening the thread clears unread for this side.
      markChatRead(id).catch(() => {});
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Lightweight refresh used by polling: pulls new messages + pause state and
  // marks read, WITHOUT the loading spinner or not-found handling (a transient
  // network blip during a poll must not blank the screen).
  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const [threads, msgs] = await Promise.all([fetchChatThreads(), fetchMessages(id)]);
      const th = threads.find((x) => x.id === id);
      if (th) setThread(th);
      setMessages(msgs);
      markChatRead(id).catch(() => {});
    } catch {
      // Ignore transient poll errors.
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // INTERIM-POLLING: auto-refresh the open thread on a timer while visible.
  // Pauses when the app backgrounds and stops on blur. Replace with a Supabase
  // Realtime subscription on `messages` (see README). Remove this whole block then.
  useFocusEffect(
    useCallback(() => {
      let timer: ReturnType<typeof setInterval> | undefined;
      const start = () => {
        if (!timer) timer = setInterval(refresh, POLL_MS);
      };
      const stop = () => {
        if (timer) {
          clearInterval(timer);
          timer = undefined;
        }
      };
      start();
      const sub = AppState.addEventListener('change', (s) => (s === 'active' ? start() : stop()));
      return () => {
        stop();
        sub.remove();
      };
    }, [refresh]),
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.paper }}>
        <TopBar back />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={t.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound || !thread) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.paper }}>
        <TopBar back />
        <Text style={{ padding: 18 }}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  const shortName = thread.firstName || `${thread.firstName} ${thread.lastName}`.trim() || 'Traveler';
  const initials =
    `${thread.firstName[0] ?? ''}${thread.lastName[0] ?? ''}`.toUpperCase() || '?';
  const writable = !thread.iPaused && !thread.otherPaused;

  // The toggle already conveys "I paused", so the banner only speaks to the
  // OTHER side pausing (which the toggle can't show).
  const pauseNotice = thread.otherPaused
    ? thread.iPaused
      ? 'Chatting is paused on both sides. It resumes when you both turn it back on.'
      : `${shortName} paused chatting. You can't send messages until they resume.`
    : null;

  const send = async () => {
    const text = draft.trim();
    if (!text || !writable || sending) return;
    setSending(true);
    setDraft('');
    try {
      const msg = await sendMessage(thread.id, text);
      setMessages((prev) => [...prev, msg]);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch (e) {
      setDraft(text); // restore so the text isn't lost
      // Most likely the other side paused mid-conversation — re-sync state.
      await load();
    } finally {
      setSending(false);
    }
  };

  const togglePause = async (next: boolean) => {
    if (pausing) return;
    setPausing(true);
    try {
      await setChatPaused(thread.id, next);
      await load();
    } finally {
      setPausing(false);
    }
  };

  const subtitle = flight ? (
    <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 18 }}>
      <Text variant="mono" weight="semibold">{flight.code}</Text>
      <Text variant="mono" tone="mute">{flight.from}→{flight.to}</Text>
      <Text variant="mono" tone="mute">· {flight.dateLong}</Text>
    </View>
  ) : undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.colors.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: t.colors.paper }}>
        <TopBar
          back
          title={
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Avatar size={26} initials={initials} uri={thread.avatarUrl} />
              <Text variant="h3">{shortName}</Text>
            </View>
          }
          subtitle={subtitle}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: t.colors.rule,
          }}
        >
          <View style={{ flex: 1, gap: 1 }}>
            <Text variant="body" style={{ fontFamily: t.fontFamily.uiMedium }}>
              Pause chat
            </Text>
            <Text variant="caption" tone="mute">
              When on, neither of you can send — history stays readable.
            </Text>
          </View>
          <Toggle value={thread.iPaused} onChange={togglePause} />
        </View>

        {pauseNotice && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 6 }}>
            <VerifyBanner icon="pause" tone="info">
              {pauseNotice}
            </VerifyBanner>
          </View>
        )}

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1, backgroundColor: t.colors.paper }}
          contentContainerStyle={{ padding: 14, gap: 8 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <Text variant="monoSm" align="center" tone="mute" style={{ marginVertical: 12 }}>
              No messages yet — say hello 👋
            </Text>
          ) : (
            messages.map((m) => (
              <ChatBubble key={m.id} fromMe={m.senderId === session?.id} text={m.body} />
            ))
          )}
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
                backgroundColor: writable ? t.colors.paper : t.colors.paper2,
              }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder={writable ? 'Message…' : 'Chatting is paused'}
                placeholderTextColor={t.colors.inkMute}
                editable={writable && !sending}
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
              disabled={!writable || !draft.trim() || sending}
              style={({ pressed }) => ({
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: !writable || !draft.trim() ? t.colors.paper3 : t.colors.accent,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={!writable || !draft.trim() ? t.colors.inkMute : t.colors.accentOn}
              />
            </Pressable>
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
