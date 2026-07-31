import { Redirect, Tabs } from 'expo-router';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/auth/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export default function AppTabsLayout() {
  const t = useTheme();
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.colors.paper,
          borderTopColor: t.colors.rule,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 8,
          paddingBottom: 16,
        },
        tabBarLabelStyle: {
          fontFamily: t.fontFamily.uiMedium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarActiveTintColor: t.colors.ink,
        tabBarInactiveTintColor: t.colors.inkMute,
      }}
    >
      <Tabs.Screen
        name="find"
        options={{
          title: 'Find',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="search" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: 'Flights',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="airplane" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="connections"
        options={{
          title: 'Connect',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="people" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="chatbubble" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: 'Me',
          tabBarIcon: ({ focused, color }) => (
            <MeTabIcon focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// The "Me" tab shows the user's profile photo when they have one, falling back
// to the person icon. A focused avatar gets an accent ring instead of the
// accent-filled circle, since you can't tint a photo.
function MeTabIcon({ focused, color }: { focused: boolean; color: string }) {
  const t = useTheme();
  const { session } = useAuth();
  const BOX = 32;

  if (!session?.avatarUrl) {
    return <TabIcon name="person" focused={focused} color={color} />;
  }

  const initials = `${session.firstName[0] ?? ''}${session.lastName[0] ?? ''}`.toUpperCase();
  return (
    <View
      style={{
        width: BOX,
        height: BOX,
        borderRadius: BOX / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: focused ? t.colors.accent : 'transparent',
      }}
    >
      <Avatar size={BOX - 6} initials={initials} uri={session.avatarUrl} />
    </View>
  );
}

function TabIcon({ name, focused, color }: { name: IconName; focused: boolean; color: string }) {
  const t = useTheme();
  const ICON_SIZE = 20;
  const PAD = 6;
  const BOX = ICON_SIZE + PAD * 2;
  return (
    <View
      style={{
        width: BOX,
        height: BOX,
        borderRadius: BOX / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? t.colors.accent : 'transparent',
      }}
    >
      <Ionicons
        name={name}
        size={ICON_SIZE}
        color={focused ? t.colors.accentOn : color}
      />
    </View>
  );
}
