import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, View } from 'react-native';
import { useAuth } from '@/auth/AuthContext';
import { SUPPORT_EMAIL } from '@/brand/brand';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const { session, loading, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  // Deleting only makes sense while signed in.
  if (loading) return null;
  if (!session) return <Redirect href="/" />;

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your profile, flights, connections, and messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              router.replace('/');
            } catch (e) {
              Alert.alert('Could not delete account', e instanceof Error ? e.message : 'Please try again.');
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const emailSupport = async () => {
    // openURL (not canOpenURL) so we don't need `mailto` in iOS
    // LSApplicationQueriesSchemes; it rejects when there's no mail app.
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Account deletion request')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('No mail app found', `Email us at ${SUPPORT_EMAIL} to request deletion.`);
    }
  };

  return (
    <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 40 }}>
      <TopBar back title="Delete account" />

      <Text variant="h2">Delete your account</Text>
      <Text variant="body" tone="soft" style={{ lineHeight: 20 }}>
        Deleting your account is permanent. We will remove your profile, saved flights, connections,
        and messages. You will be signed out and this cannot be undone.
      </Text>

      <Card flat>
        <Text variant="body" tone="soft" style={{ lineHeight: 20 }}>
          Prefer to have us handle it, or have a question first? Email {SUPPORT_EMAIL} and our team
          will help with your deletion request.
        </Text>
      </Card>

      <View style={{ gap: 10, marginTop: 8 }}>
        <Button kind="primary" size="lg" full loading={deleting} onPress={confirmDelete} textColor="#ffffff" style={{ backgroundColor: '#c83e2e', borderColor: '#c83e2e' }}>
          Delete my account
        </Button>
        <Button kind="ghost" full onPress={emailSupport} disabled={deleting}>
          Email support instead
        </Button>
      </View>
    </Screen>
  );
}
