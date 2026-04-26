// Flyeasy screens part 2: Flights, Add flight, Connections, Chat, Profile

// Flights list — Variant A: detailed rows
const FlightRow = ({ code, airline, route, when, dur, status }) => (
  <div className="fe-card fe-card-flat" style={{ padding: 10, gap: 6 }}>
    <Row justify="space-between">
      <Row gap={8}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{code}</span>
        <span className="fe-mono">{airline}</span>
      </Row>
      <span className={`fe-badge s-${status.toLowerCase()}`}>{status}</span>
    </Row>
    <Row justify="space-between">
      <Row gap={6} style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        <span>{route[0]}</span><span>→</span><span>{route[1]}</span>
      </Row>
      <span className="fe-mono">{dur}</span>
    </Row>
    <Row justify="space-between">
      <span className="fe-mono" style={{ color: 'var(--ink-soft)' }}>{when}</span>
      <Row gap={8}>
        <span className="fe-p" style={{ textDecoration: 'underline' }}>Edit</span>
        <span className="fe-p" style={{ textDecoration: 'underline', color: '#8a2020' }}>Delete</span>
      </Row>
    </Row>
  </div>
);

const ScreenMyFlights = () => (
  <Phone width={320} height={680} note="A — detailed rows with filter chips + status badges">
    <StatusBar />
    <TopBar title="My Flights" right={<span style={{ fontSize: 18 }}>+</span>} />
    <Screen>
      <div className="fe-input-box" style={{ padding: '7px 10px' }}>
        <span className="fe-input-icon">⌕</span>
        <span className="fe-input-ph">Search flight # or city…</span>
      </div>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <span className="fe-chip on">All</span>
        <span className="fe-chip">Future</span>
        <span className="fe-chip">Ongoing</span>
        <span className="fe-chip">Past</span>
        <span className="fe-chip">⇅ Airline</span>
      </Row>
      <Stack gap={8}>
        <FlightRow code="AA 204" airline="American" route={['JFK','LHR']} when="JUN 12 · 9:20 PM" dur="7h 10m" status="New" />
        <FlightRow code="UA 88"  airline="United"   route={['SFO','NRT']} when="AUG 03 · 11:45 AM" dur="11h 5m" status="Delayed" />
        <FlightRow code="DL 42"  airline="Delta"    route={['ATL','CDG']} when="NOW"              dur="8h 20m" status="Ongoing" />
        <FlightRow code="BA 117" airline="British"  route={['LHR','BOS']} when="MAR 02 · 2:10 PM" dur="7h 40m" status="Complete" />
      </Stack>
    </Screen>
    <TabBar active="flights" />
  </Phone>
);

// Flights list — Variant B: timeline/grouped by date
const TimelineItem = ({ when, code, route, status, dur }) => (
  <div style={{ display: 'flex', gap: 10 }}>
    <Stack gap={2} style={{ width: 50, flexShrink: 0, alignItems: 'flex-end' }}>
      <div className="fe-mono" style={{ color: 'var(--ink)' }}>{when[0]}</div>
      <div className="fe-mono" style={{ fontSize: 9 }}>{when[1]}</div>
    </Stack>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 10, height: 10, border: '1.5px solid var(--line)', borderRadius: '50%', background: 'var(--accent)' }} />
      <div style={{ width: 2, flex: 1, background: 'var(--rule)', margin: '2px 0' }} />
    </div>
    <div className="fe-card fe-card-flat" style={{ flex: 1, padding: 9, gap: 4 }}>
      <Row justify="space-between">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{code}</span>
        <span className={`fe-badge s-${status.toLowerCase()}`}>{status}</span>
      </Row>
      <Row justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        <span>{route[0]} → {route[1]}</span>
        <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>{dur}</span>
      </Row>
    </div>
  </div>
);

const ScreenMyFlightsTimeline = () => (
  <Phone width={320} height={680} note="B — timeline grouped view. Chronological, more scannable.">
    <StatusBar />
    <TopBar title="My Flights" right={<span style={{ fontSize: 18 }}>+</span>} />
    <Screen>
      <Row justify="space-between" align="center">
        <div className="fe-seg">
          <div className="on">Upcoming</div>
          <div>Past</div>
        </div>
        <span className="fe-mono">4 TRIPS</span>
      </Row>
      <div className="fe-section">THIS MONTH</div>
      <Stack gap={6}>
        <TimelineItem when={['JUN 12','TUE']} code="AA 204" route={['JFK','LHR']} status="New" dur="7h 10m" />
      </Stack>
      <div className="fe-section">AUGUST</div>
      <Stack gap={6}>
        <TimelineItem when={['AUG 03','SAT']} code="UA 88" route={['SFO','NRT']} status="Delayed" dur="11h 5m" />
        <TimelineItem when={['AUG 19','MON']} code="NH 10" route={['NRT','SFO']} status="New" dur="9h 30m" />
      </Stack>
      <div className="fe-section">ONGOING</div>
      <Stack gap={6}>
        <TimelineItem when={['NOW','—']} code="DL 42" route={['ATL','CDG']} status="Ongoing" dur="8h 20m" />
      </Stack>
    </Screen>
    <TabBar active="flights" />
  </Phone>
);

// Add flight
const ScreenAddFlight = () => (
  <Phone width={300} height={620} note="Manual entry. Booking verified in background before matching.">
    <StatusBar />
    <TopBar title="Add flight" left={<span>✕</span>} right={<span className="fe-p">Save</span>} />
    <Screen>
      <div className="fe-verify">
        <span className="fe-verify-icon">✓</span>
        <div>
          <b>We verify every flight.</b> We'll confirm your booking with the airline in the background. You'll only appear to matches once it's confirmed.
        </div>
      </div>
      <Stack gap={10}>
        <Input label="Flight number" placeholder="e.g. AA 204" />
        <Row gap={8} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <Input label="From" placeholder="JFK" />
          <Input label="To" placeholder="LHR" />
        </Row>
        <Input label="Airline" placeholder="American Airlines" />
        <Row gap={8} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <Input label="Date" placeholder="Jun 12, 2026" icon="📅" />
          <Input label="Time" placeholder="9:20 PM" icon="◷" />
        </Row>
        <Input label="Duration" placeholder="7h 10m" />
        <Input label="Booking reference" placeholder="ABC123" icon="#" />
      </Stack>
      <div style={{ flex: 1 }} />
      <Btn kind="primary" full size="lg">Save & verify</Btn>
    </Screen>
  </Phone>
);

// Flight detail
const ScreenFlightDetail = () => (
  <Phone width={300} height={620} note="Tap a flight → see its details + people on it">
    <StatusBar />
    <TopBar title="" left={<span>←</span>} right={<span>⋯</span>} />
    <Screen>
      <Stack gap={6}>
        <Row justify="space-between">
          <div className="fe-h1" style={{ fontSize: 32 }}>AA 204</div>
          <span className="fe-badge s-new">New</span>
        </Row>
        <Row gap={6}>
          <span className="fe-verified-tag">✓ Verified</span>
          <span className="fe-mono">AMERICAN AIRLINES</span>
        </Row>
      </Stack>
      <div className="fe-card fe-card-flat">
        <div className="fe-route" style={{ fontSize: 20 }}>
          <span>JFK</span>
          <span className="fe-route-dash" />
          <span>LHR</span>
        </div>
        <Row justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
          <span>New York</span>
          <span>London</span>
        </Row>
        <Divider />
        <Row justify="space-between">
          <Stack gap={1}><div className="fe-mono">DEPARTS</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>Jun 12 · 9:20 PM</div></Stack>
          <Stack gap={1}><div className="fe-mono">DURATION</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>7h 10m</div></Stack>
        </Row>
      </div>
      <Row justify="space-between">
        <div className="fe-section">People on this flight</div>
        <span className="fe-p"><u>See all 8</u></span>
      </Row>
      <Row gap={8}>
        <Avatar size={40} initials="MO" />
        <Avatar size={40} initials="DP" />
        <Avatar size={40} initials="SR" />
        <Avatar size={40} initials="LT" />
        <Avatar size={40} initials="+4" />
      </Row>
      <div style={{ flex: 1 }} />
      <Btn kind="primary" full size="lg">Find people on this flight</Btn>
    </Screen>
  </Phone>
);

// Connection requests
const RequestRow = ({ initials, name, flight, desc }) => (
  <div className="fe-card">
    <Row gap={10}>
      <Avatar size={40} initials={initials} />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <div className="fe-h3">{name}</div>
        <span className="fe-mono">{flight}</span>
      </Stack>
    </Row>
    <div className="fe-p" style={{
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    }}>{desc}</div>
    <Row gap={8}>
      <Btn kind="primary" size="sm" style={{ flex: 1 }}>Accept</Btn>
      <Btn kind="ghost" size="sm" style={{ flex: 1 }}>Decline</Btn>
    </Row>
  </div>
);

const ScreenRequests = () => (
  <Phone width={320} height={680} note="Incoming connect requests — accept/decline">
    <StatusBar />
    <TopBar title="Connections" />
    <Screen>
      <Row gap={4}>
        <div className="fe-seg">
          <div className="on">Requests · 3</div>
          <div>Connected</div>
        </div>
      </Row>
      <Stack gap={10}>
        <RequestRow initials="DP" name="Dev P." flight="AA 204 · JFK→LHR · Jun 12"
          desc="Hey! Saw we're on the same flight. Down to grab coffee at the gate?" />
        <RequestRow initials="SR" name="Sana R." flight="AA 204 · JFK→LHR · Jun 12"
          desc="Nervous flyer here — would love a friendly face!" />
        <RequestRow initials="LT" name="Leo T." flight="UA 88 · SFO→NRT · Aug 3"
          desc="Heading to Tokyo for a wedding. Hi!" />
      </Stack>
    </Screen>
    <TabBar active="connections" />
  </Phone>
);

// My Connections (approved)
const ConnectionRow = ({ initials, name, flight, lastMsg, unread }) => (
  <Row gap={10} style={{ padding: '10px 0', borderBottom: '1px dashed var(--rule)' }}>
    <Avatar size={46} initials={initials} />
    <Stack gap={3} style={{ flex: 1, minWidth: 0 }}>
      <Row justify="space-between">
        <div className="fe-h3">{name}</div>
        {unread
          ? <Badge tone="accent">{unread}</Badge>
          : <span className="fe-mono" style={{ fontSize: 9 }}>2h</span>}
      </Row>
      <span className="fe-mono" style={{ fontSize: 9 }}>{flight}</span>
      <div className="fe-p" style={{
        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: 11
      }}>{lastMsg}</div>
    </Stack>
  </Row>
);

const ScreenConnections = () => (
  <Phone width={320} height={680} note="Approved connections — tap to chat">
    <StatusBar />
    <TopBar title="Connections" />
    <Screen>
      <div className="fe-seg">
        <div>Requests · 3</div>
        <div className="on">Connected · 5</div>
      </div>
      <Stack gap={0}>
        <ConnectionRow initials="MO" name="Maya O." flight="AA 204 · JUN 12" lastMsg="See you at gate 18!" unread="2" />
        <ConnectionRow initials="DP" name="Dev P." flight="AA 204 · JUN 12" lastMsg="Which terminal are you flying out of?" />
        <ConnectionRow initials="JH" name="Jordan H." flight="UA 88 · AUG 3" lastMsg="Booked the same hotel 😂" />
        <ConnectionRow initials="KN" name="Kira N." flight="BA 117 · MAR 2" lastMsg="Thanks, safe flight!" />
      </Stack>
    </Screen>
    <TabBar active="connections" />
  </Phone>
);

// Chat list (alternate primary for the Chat tab)
const ScreenChatList = () => (
  <Phone width={320} height={680} note="Chat inbox. Chats lock after flight lands (history stays).">
    <StatusBar />
    <TopBar title="Chats" right={<span>⌕</span>} />
    <Screen>
      <div className="fe-verify" style={{ fontSize: 10 }}>
        <span className="fe-verify-icon" style={{ width: 18, height: 18, fontSize: 11 }}>ⓘ</span>
        <div>Chats stay open until your shared flight lands. After that, history is read-only.</div>
      </div>
      <Stack gap={0}>
        <ConnectionRow initials="MO" name="Maya O." flight="AA 204 · departs in 2d" lastMsg="See you at gate 18!" unread="2" />
        <ConnectionRow initials="DP" name="Dev P." flight="AA 204 · departs in 2d" lastMsg="Which terminal are you flying out of?" />
        <ConnectionRow initials="KN" name="Kira N." flight="BA 117 · closed" lastMsg="Thanks, safe flight!" />
      </Stack>
    </Screen>
    <TabBar active="chat" />
  </Phone>
);

// Chat thread
const ScreenChatThread = () => (
  <Phone width={300} height={620} note="1:1 chat. Header shows countdown to flight close.">
    <StatusBar />
    <TopBar
      title={<Row gap={6}><Avatar size={22} initials="MO" /><span style={{ fontFamily: 'var(--font-hand)', fontSize: 18 }}>Maya O.</span></Row>}
      left={<span>←</span>}
      right={<span>ⓘ</span>}
      sub={<Row gap={6} justify="space-between">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>AA 204 · JFK→LHR</span>
        <span className="fe-verified-tag" style={{ fontSize: 8 }}>closes in 3d 4h</span>
      </Row>}
    />
    <Screen style={{ padding: '12px 14px', gap: 8, background: 'var(--paper-2)' }}>
      <div className="fe-chat-date">TODAY</div>
      <div className="fe-bubble them">Hey! Saw we're on the same flight 🙌</div>
      <div className="fe-bubble them">First time flying to London — any tips on terminal 8?</div>
      <div className="fe-bubble me">Hi! Yeah I've done this one a few times. Security line gets rough around 6, I usually hit the lounge by 5:30.</div>
      <div className="fe-bubble them">Oh nice. Want to grab a coffee before boarding?</div>
      <div className="fe-bubble me">Absolutely. See you at gate 18!</div>
      <div style={{ flex: 1 }} />
    </Screen>
    <div style={{
      display: 'flex', gap: 8, padding: '8px 12px', borderTop: '1.5px solid var(--line)',
      background: 'var(--paper)', alignItems: 'center'
    }}>
      <div className="fe-input-box" style={{ flex: 1, padding: '6px 10px' }}>
        <span className="fe-input-ph">Message…</span>
      </div>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)',
        border: '1.5px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 700
      }}>↑</div>
    </div>
  </Phone>
);

// Profile (self)
const ScreenProfile = () => (
  <Phone width={320} height={680} note="Self profile. Availability switch + bio.">
    <StatusBar />
    <TopBar title="Profile" right={<span className="fe-p"><u>Edit</u></span>} />
    <Screen>
      <Stack gap={8} style={{ alignItems: 'center', textAlign: 'center' }}>
        <Avatar size={80} initials="RT" />
        <span className="fe-p" style={{ textDecoration: 'underline' }}>Change photo</span>
        <div className="fe-h2">Riya Tanaka</div>
        <span className="fe-mono">riya@email.com</span>
      </Stack>
      <div className="fe-card fe-card-flat">
        <Row justify="space-between">
          <Stack gap={2}>
            <div className="fe-h3">Available to connect</div>
            <div className="fe-p">Others on your flights can send you requests.</div>
          </Stack>
          <div className="fe-toggle on"><div className="fe-toggle-dot" /></div>
        </Row>
      </div>
      <div>
        <div className="fe-section">About me</div>
        <div className="fe-card fe-card-flat" style={{ marginTop: 4 }}>
          <div className="fe-p">
            Design researcher flying a lot between NYC & Tokyo. Always up to chat about books, coffee, and random airport snacks. Nervous on takeoff, fine after that.
          </div>
        </div>
      </div>
      <div className="fe-card fe-card-flat">
        <Row justify="space-between">
          <Stack gap={2}>
            <div className="fe-h3">My Flights</div>
            <div className="fe-p">4 upcoming · 12 past</div>
          </Stack>
          <span className="fe-arrow">›</span>
        </Row>
      </div>
      <div className="fe-card fe-card-flat">
        <Row justify="space-between">
          <div className="fe-h3">Settings & privacy</div>
          <span className="fe-arrow">›</span>
        </Row>
      </div>
      <Btn kind="ghost" full>Sign out</Btn>
    </Screen>
    <TabBar active="profile" />
  </Phone>
);

Object.assign(window, {
  ScreenMyFlights, ScreenMyFlightsTimeline, ScreenAddFlight, ScreenFlightDetail,
  ScreenRequests, ScreenConnections, ScreenChatList, ScreenChatThread, ScreenProfile,
});
