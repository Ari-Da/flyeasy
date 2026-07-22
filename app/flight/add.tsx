import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TopBar } from '@/components/ui/TopBar';
import { VerifyBanner } from '@/components/ui/VerifyBanner';
import { AeroDataBoxError, lookupFlight, type FlightLookupResult } from '@/lib/aerodatabox';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme';

type Step = 'search' | 'pick' | 'confirm';

// Format a Date as YYYY-MM-DD from its LOCAL parts. Avoids toISOString(), which
// converts to UTC and can shift the day for users in negative-UTC offsets in the
// evening — making the default/earliest dates off by one. The date the user
// actively picks in the calendar is already a tz-agnostic string, so only these
// computed defaults need this.
function ymdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function tomorrowYmd(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return ymdLocal(d);
}

function todayYmd(): string {
  return ymdLocal(new Date());
}

function formatYmdPretty(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return ymd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function formatLocal(utcIso: string, timezone: string | null): string {
  try {
    return new Date(utcIso).toLocaleString('en-US', {
      timeZone: timezone ?? 'UTC',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return utcIso;
  }
}

function formatTime(utcIso: string, timezone: string | null): string {
  try {
    return new Date(utcIso).toLocaleTimeString('en-US', {
      timeZone: timezone ?? 'UTC',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return utcIso;
  }
}

export default function AddFlightScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const t = useTheme();

  const [step, setStep] = useState<Step>('search');
  const [flightInput, setFlightInput] = useState('');
  const [dateInput, setDateInput] = useState(tomorrowYmd());
  const [showCalendar, setShowCalendar] = useState(false);
  const [pnr, setPnr] = useState('');
  const [results, setResults] = useState<FlightLookupResult[]>([]);
  const [picked, setPicked] = useState<FlightLookupResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Non-error, informational message (e.g. the flight is already saved). Shown
  // in a neutral tone rather than the red error style.
  const [notice, setNotice] = useState<string | null>(null);

  const onLookup = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const matches = await lookupFlight(flightInput, dateInput);
      if (matches.length === 0) {
        setError('No flights found for that number and date. Double-check the flight code and try a date that matches the local departure.');
        return;
      }
      setResults(matches);
      if (matches.length === 1) {
        setPicked(matches[0]);
        setStep('confirm');
      } else {
        setStep('pick');
      }
    } catch (e) {
      setError(e instanceof AeroDataBoxError || e instanceof Error ? e.message : 'Lookup failed.');
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!picked || !session) return;
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const { error: insertErr } = await supabase.from('flights').insert({
        user_id: session.id,
        flight_number: picked.flightNumber,
        airline_iata: picked.airlineIata,
        airline_name: picked.airlineName,
        aircraft_model: picked.aircraftModel,
        origin_iata: picked.origin.iata,
        origin_name: picked.origin.name,
        origin_city: picked.origin.city,
        origin_country: picked.origin.country,
        origin_timezone: picked.origin.timezone,
        origin_lat: picked.origin.lat,
        origin_lon: picked.origin.lon,
        origin_terminal: picked.origin.terminal,
        destination_iata: picked.destination.iata,
        destination_name: picked.destination.name,
        destination_city: picked.destination.city,
        destination_country: picked.destination.country,
        destination_timezone: picked.destination.timezone,
        destination_lat: picked.destination.lat,
        destination_lon: picked.destination.lon,
        destination_terminal: picked.destination.terminal,
        scheduled_departure_utc: picked.scheduledDepartureUtc,
        scheduled_arrival_utc: picked.scheduledArrivalUtc,
        status: picked.status,
        pnr: pnr.trim() || null,
        verified: true,
        raw_response: picked.raw,
        flight_message: session.description ?? '',
      });
      if (insertErr) {
        // 23505 = unique-constraint violation on (user_id, flight_number,
        // scheduled_departure_utc): the user already has this exact flight.
        // Surface it as a neutral notice, not an error.
        if (insertErr.code === '23505') {
          setNotice('This flight is already in your profile.');
        } else {
          setError(insertErr.message);
        }
        return;
      }
      router.replace('/(app)/flights');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save flight.');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep('search');
    setResults([]);
    setPicked(null);
    setError(null);
    setNotice(null);
  };

  const headerTitle = useMemo(() => {
    if (step === 'pick') return 'Pick the flight';
    if (step === 'confirm') return 'Confirm flight';
    return 'Add flight';
  }, [step]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen scroll edges={['top', 'left', 'right', 'bottom']} contentStyle={{ paddingBottom: 40 }}>
        <TopBar
          title={headerTitle}
          leftIcon="close"
          onLeftPress={() => router.back()}
        />

        {step === 'search' && (
          <>
            <VerifyBanner>
              <Text style={{ fontWeight: '600' }}>We verify every flight.</Text> Enter your flight number and date — we'll pull the route, times, and aircraft straight from the airline schedule.
            </VerifyBanner>

            <View style={{ gap: 10 }}>
              <Input
                label="Flight number"
                placeholder="e.g. BA286"
                value={flightInput}
                onChangeText={setFlightInput}
                autoCapitalize="characters"
              />
              <Pressable onPress={() => setShowCalendar(true)}>
                <Input
                  label="Departure date"
                  placeholder="Tap to pick a date"
                  value={formatYmdPretty(dateInput)}
                  icon="calendar-outline"
                  editable={false}
                  pointerEvents="none"
                />
              </Pressable>
              <Input
                label="Booking ref (optional)"
                placeholder="ABC123"
                iconChar="#"
                value={pnr}
                onChangeText={setPnr}
                autoCapitalize="characters"
              />
            </View>

            {error && (
              <Text variant="caption" align="center" style={{ color: '#a04020' }}>
                {error}
              </Text>
            )}

            <View style={{ marginTop: 20 }}>
              <Button kind="primary" size="lg" full loading={busy} onPress={onLookup}>
                Look up flight
              </Button>
            </View>
          </>
        )}

        {step === 'pick' && (
          <>
            <Text variant="body" tone="soft">
              We found {results.length} matches for {flightInput.toUpperCase()}. Pick the one you're on.
            </Text>
            <View style={{ gap: 10 }}>
              {results.map((r, i) => (
                <Pressable
                  key={`${r.flightNumber}-${r.scheduledDepartureUtc}-${i}`}
                  onPress={() => {
                    setPicked(r);
                    setStep('confirm');
                  }}
                >
                  <Card flat>
                    <Text variant="h3">
                      {r.origin.iata} → {r.destination.iata}
                    </Text>
                    <Text variant="body" tone="soft">
                      Departs {formatLocal(r.scheduledDepartureUtc, r.origin.timezone)}
                    </Text>
                    <Text variant="caption" tone="mute">
                      {r.airlineName} · {r.aircraftModel ?? 'Aircraft TBD'}
                    </Text>
                  </Card>
                </Pressable>
              ))}
            </View>
            <View style={{ marginTop: 12 }}>
              <Button kind="ghost" full onPress={reset}>
                Search again
              </Button>
            </View>
          </>
        )}

        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <Pressable
            onPress={() => setShowCalendar(false)}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 }}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: t.colors.paper,
                borderRadius: t.radius.lg,
                overflow: 'hidden',
              }}
            >
              <Calendar
                current={dateInput}
                minDate={todayYmd()}
                markedDates={{
                  [dateInput]: { selected: true, selectedColor: t.colors.accent },
                }}
                onDayPress={(day) => {
                  setDateInput(day.dateString);
                  setShowCalendar(false);
                }}
                theme={{
                  backgroundColor: t.colors.paper,
                  calendarBackground: t.colors.paper,
                  textSectionTitleColor: t.colors.inkMute,
                  dayTextColor: t.colors.ink,
                  todayTextColor: t.colors.accent,
                  selectedDayTextColor: '#fff',
                  selectedDayBackgroundColor: t.colors.accent,
                  monthTextColor: t.colors.ink,
                  arrowColor: t.colors.accent,
                  textDisabledColor: t.colors.rule,
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {step === 'confirm' && picked && (
          <>
            <Card flat>
              <Text variant="h2">
                {picked.origin.iata} → {picked.destination.iata}
              </Text>
              <Text variant="body" tone="soft">
                {picked.airlineName} {picked.flightNumber}
              </Text>
              <View style={{ height: 12 }} />
              <Text variant="section" tone="mute">Departs</Text>
              <Text variant="body">
                {formatLocal(picked.scheduledDepartureUtc, picked.origin.timezone)}
              </Text>
              <Text variant="caption" tone="mute">
                {picked.origin.name}{picked.origin.terminal ? ` · Terminal ${picked.origin.terminal}` : ''}
              </Text>
              <View style={{ height: 12 }} />
              <Text variant="section" tone="mute">Arrives</Text>
              <Text variant="body">
                {formatLocal(picked.scheduledArrivalUtc, picked.destination.timezone)}
                {' · '}
                {formatTime(picked.scheduledArrivalUtc, picked.destination.timezone)} local
              </Text>
              <Text variant="caption" tone="mute">
                {picked.destination.name}{picked.destination.terminal ? ` · Terminal ${picked.destination.terminal}` : ''}
              </Text>
              {picked.aircraftModel && (
                <>
                  <View style={{ height: 12 }} />
                  <Text variant="section" tone="mute">Aircraft</Text>
                  <Text variant="body">{picked.aircraftModel}</Text>
                </>
              )}
            </Card>

            {error && (
              <Text variant="caption" align="center" style={{ color: '#a04020' }}>
                {error}
              </Text>
            )}

            {notice && (
              <Text variant="caption" align="center" style={{ color: t.colors.accent }}>
                {notice}
              </Text>
            )}

            <View style={{ gap: 10, marginTop: 16 }}>
              <Button kind="primary" size="lg" full loading={busy} onPress={onSave}>
                Add to my flights
              </Button>
              <Button kind="ghost" full onPress={reset} disabled={busy}>
                Search again
              </Button>
            </View>
          </>
        )}
      </Screen>
    </KeyboardAvoidingView>
  );
}
