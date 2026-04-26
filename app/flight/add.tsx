import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { Text } from '@/components/ui/Text';
import { VerifyBanner } from '@/components/ui/VerifyBanner';

export default function AddFlightScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [airline, setAirline] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  const save = () => {
    // Mock save — in production this would POST to /flights then verify async.
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 40 }}>
        <TopBar
          title="Add flight"
          leftIcon="close"
          onLeftPress={() => router.back()}
          rightLabel="Save"
          onRightPress={save}
        />

        <VerifyBanner>
          <Text style={{ fontWeight: '600' }}>We verify every flight.</Text> We'll confirm your booking with the airline in the background — you'll only appear to matches once it's confirmed.
        </VerifyBanner>

        <View style={{ gap: 10 }}>
          <Input label="Flight number" placeholder="e.g. AA 204" value={code} onChangeText={setCode} autoCapitalize="characters" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Input
              label="From"
              placeholder="JFK"
              value={from}
              onChangeText={setFrom}
              containerStyle={{ flex: 1 }}
              autoCapitalize="characters"
              maxLength={3}
            />
            <Input
              label="To"
              placeholder="LHR"
              value={to}
              onChangeText={setTo}
              containerStyle={{ flex: 1 }}
              autoCapitalize="characters"
              maxLength={3}
            />
          </View>
          <Input label="Airline" placeholder="American Airlines" value={airline} onChangeText={setAirline} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Input
              label="Date"
              placeholder="Jun 12, 2026"
              value={date}
              onChangeText={setDate}
              icon="calendar-outline"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Time"
              placeholder="9:20 PM"
              value={time}
              onChangeText={setTime}
              icon="time-outline"
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Input
            label="Booking ref"
            placeholder="ABC123"
            iconChar="#"
            value={bookingRef}
            onChangeText={setBookingRef}
            autoCapitalize="characters"
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Button kind="primary" size="lg" full onPress={save}>
            Save & verify
          </Button>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
