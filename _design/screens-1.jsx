// Flyeasy screens part 1: Onboarding, Auth, Home/Find, Card detail, Empty states

const ScreenSplash = () => (
  <Phone width={300} height={620} note="First time — hook + value prop">
    <StatusBar />
    <Screen style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20, padding: 26 }}>
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 44, fontWeight: 700, lineHeight: 1 }}>Flyeasy</div>
      <Scribble h={140} w={200} label="hero illustration — two people meeting at gate" />
      <Stack gap={6} style={{ alignItems: 'center' }}>
        <div className="fe-h2" style={{ maxWidth: 230 }}>Fly together, even alone.</div>
        <div className="fe-p" style={{ maxWidth: 230 }}>Meet people on your exact flight before you take off.</div>
      </Stack>
      <Stack gap={10} style={{ width: '100%' }}>
        <Btn kind="primary" full size="lg">Create account</Btn>
        <Btn kind="ghost" full>I already have one</Btn>
      </Stack>
    </Screen>
  </Phone>
);

const ScreenSignUp = () => (
  <Phone width={300} height={620} note="Email + password. Verify email on submit.">
    <StatusBar />
    <TopBar title="Sign up" left={<span>←</span>} />
    <Screen>
      <div className="fe-h2">Create your account</div>
      <div className="fe-p">Just the basics to get you flying.</div>
      <Stack gap={10}>
        <Input label="First name" placeholder="Maya" />
        <Input label="Last name" placeholder="Okafor" />
        <Input label="Email" placeholder="you@email.com" icon="@" />
        <Input label="Password" placeholder="••••••••" icon="⚿" />
      </Stack>
      <Row gap={6}>
        <span className="fe-check on">✓</span>
        <span className="fe-p">I agree to the terms & privacy policy</span>
      </Row>
      <div style={{ flex: 1 }} />
      <Btn kind="primary" full size="lg">Create account</Btn>
      <div className="fe-p" style={{ textAlign: 'center' }}>Already have an account? <u>Log in</u></div>
    </Screen>
  </Phone>
);

const ScreenLogIn = () => (
  <Phone width={300} height={620} note="Email + password login">
    <StatusBar />
    <TopBar title="Log in" left={<span>←</span>} />
    <Screen>
      <div className="fe-h2">Welcome back</div>
      <Stack gap={10}>
        <Input label="Email" placeholder="you@email.com" icon="@" />
        <Input label="Password" placeholder="••••••••" icon="⚿" />
      </Stack>
      <Row justify="space-between">
        <Row gap={6}><span className="fe-check" /> <span className="fe-p">Remember me</span></Row>
        <span className="fe-p"><u>Forgot?</u></span>
      </Row>
      <div style={{ flex: 1 }} />
      <Btn kind="primary" full size="lg">Log in</Btn>
      <div className="fe-p" style={{ textAlign: 'center' }}>New here? <u>Create an account</u></div>
    </Screen>
  </Phone>
);

// Landing / Find People — variant A: vertical cards stacked
const PersonCardVertical = ({ name, initials, code, from, to, when, desc, connected }) => (
  <div className="fe-card">
    <Row gap={10}>
      <Avatar size={44} initials={initials} />
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Row justify="space-between">
          <div className="fe-h3">{name}</div>
          <Badge tone="muted">{code}</Badge>
        </Row>
        <Row gap={6} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)' }}>
          <span>{from}</span><span>→</span><span>{to}</span><span style={{ color: 'var(--ink-mute)' }}>· {when}</span>
        </Row>
      </Stack>
    </Row>
    <div className="fe-p" style={{
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    }}>{desc}</div>
    <Row justify="space-between">
      <span className="fe-mono">Verified ✓</span>
      {connected
        ? <Btn kind="ghost" size="sm">Requested</Btn>
        : <span className="fe-connect">+ Connect</span>}
    </Row>
  </div>
);

const ScreenFindPeople = () => (
  <Phone width={320} height={680} note="A — vertical cards. One per row. More breathing room.">
    <StatusBar />
    <TopBar
      title="Find People"
      sub={<Row gap={6}><span className="fe-mono">FLIGHT</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>AA 204 · JFK→LHR · Jun 12</span></Row>}
      right={<span>⌕</span>}
    />
    <Screen>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <span className="fe-chip on">Same flight · 8</span>
        <span className="fe-chip">Nearby dates</span>
        <span className="fe-chip">⇅ Sort</span>
      </Row>
      <Stack gap={10} style={{ overflow: 'hidden' }}>
        <PersonCardVertical name="Maya O." initials="MO" code="AA 204" from="JFK" to="LHR" when="Jun 12 · 9:20p" desc="First solo transatlantic — happy to share a coffee pre-boarding if anyone else is nervous." />
        <PersonCardVertical name="Dev P." initials="DP" code="AA 204" from="JFK" to="LHR" when="Jun 12 · 9:20p" desc="Heading to a design conf, down to chat about anything creative on the plane." connected />
        <PersonCardVertical name="Sana R." initials="SR" code="AA 204" from="JFK" to="LHR" when="Jun 12 · 9:20p" desc="Nervous flyer. Looking for a friendly face at the gate!" />
      </Stack>
    </Screen>
    <TabBar active="home" />
  </Phone>
);

// Variant B: 2-column grid of compact cards
const PersonCardGrid = ({ initials, name, tag, connected }) => (
  <div className="fe-card" style={{ padding: 8, gap: 6, alignItems: 'center', textAlign: 'center' }}>
    <Avatar size={44} initials={initials} style={{ margin: '2px auto 0' }} />
    <div className="fe-h3" style={{ fontSize: 12 }}>{name}</div>
    <div className="fe-mono" style={{ fontSize: 9 }}>{tag}</div>
    <div style={{ width: '100%', height: 1, background: 'var(--rule)', margin: '2px 0' }} />
    {connected
      ? <Btn kind="ghost" size="sm" style={{ padding: '3px 8px', fontSize: 10 }}>Sent ✓</Btn>
      : <span className="fe-connect" style={{ fontSize: 10, padding: '3px 9px' }}>+ Connect</span>}
  </div>
);

const ScreenFindPeopleGrid = () => (
  <Phone width={320} height={680} note="B — 2-col grid. Skim faster, more people visible.">
    <StatusBar />
    <TopBar
      title="Find People"
      sub={<Row gap={6}><span className="fe-mono">FLIGHT</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink)' }}>AA 204 · JFK→LHR · Jun 12</span></Row>}
      right={<span>⌕</span>}
    />
    <Screen>
      <Row gap={6} style={{ flexWrap: 'wrap' }}>
        <span className="fe-chip on">Same flight · 8</span>
        <span className="fe-chip">Nearby dates</span>
      </Row>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <PersonCardGrid initials="MO" name="Maya O." tag="AA 204 · 9:20p" />
        <PersonCardGrid initials="DP" name="Dev P." tag="AA 204 · 9:20p" connected />
        <PersonCardGrid initials="SR" name="Sana R." tag="AA 204 · 9:20p" />
        <PersonCardGrid initials="LT" name="Leo T." tag="AA 204 · 9:20p" />
        <PersonCardGrid initials="KN" name="Kira N." tag="AA 204 · 9:20p" />
        <PersonCardGrid initials="JH" name="Jordan H." tag="AA 204 · 9:20p" />
      </div>
    </Screen>
    <TabBar active="home" />
  </Phone>
);

// User card detail
const ScreenUserDetail = () => (
  <Phone width={300} height={620} note="Tapping a card → full detail with description + connect">
    <StatusBar />
    <TopBar title="" left={<span>←</span>} right={<span>⋯</span>} />
    <Screen style={{ padding: 0 }}>
      <Stack gap={10} style={{ padding: '8px 16px 14px', alignItems: 'center' }}>
        <Avatar size={78} initials="MO" />
        <div className="fe-h2">Maya Okafor</div>
        <Row gap={6}>
          <span className="fe-verified-tag">✓ Flight verified</span>
        </Row>
      </Stack>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="fe-card fe-card-flat">
          <div className="fe-section">Their flight</div>
          <Row gap={8} justify="space-between">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>AA 204</div>
            <Badge tone="muted">American</Badge>
          </Row>
          <div className="fe-route">
            <span>JFK</span>
            <span className="fe-route-dash" />
            <span>LHR</span>
          </div>
          <Row justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)' }}>
            <span>JUN 12 · 9:20 PM</span>
            <span>7h 10m</span>
          </Row>
        </div>
        <div>
          <div className="fe-section">About Maya</div>
          <div className="fe-p" style={{ marginTop: 4 }}>
            First solo transatlantic. Bit nervous but excited! If anyone wants to grab a coffee at the gate, I'm in T8 by 7pm. Reading a novel & open to chat.
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <Stack gap={8} style={{ padding: '0 16px 14px' }}>
        <Btn kind="primary" full size="lg">+ Send Connect request</Btn>
        <Btn kind="ghost" full>Report / Block</Btn>
      </Stack>
    </Screen>
  </Phone>
);

// Empty state — no flights yet
const ScreenEmptyFlights = () => (
  <Phone width={300} height={620} note="Before adding any flights — nudges to add one">
    <StatusBar />
    <TopBar title="My Flights" right={<span>+</span>} />
    <Screen>
      <div className="fe-empty">
        <div className="fe-empty-ill">✈</div>
        <div className="fe-h2">No flights yet</div>
        <div className="fe-p" style={{ maxWidth: 220 }}>
          Add a flight to start meeting people who are taking the same one as you.
        </div>
        <Btn kind="primary" size="lg">+ Add your first flight</Btn>
        <span className="fe-p" style={{ fontStyle: 'italic' }}>we'll verify your booking in the background</span>
      </div>
    </Screen>
    <TabBar active="flights" />
  </Phone>
);

// Empty state — no matches on a flight
const ScreenEmptyMatches = () => (
  <Phone width={300} height={620} note="On a flight but no one else yet — nudges sharing">
    <StatusBar />
    <TopBar
      title="Find People"
      sub={<Row gap={6}><span className="fe-mono">FLIGHT</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>UA 88 · SFO→NRT · Aug 3</span></Row>}
    />
    <Screen>
      <div className="fe-empty">
        <div className="fe-empty-ill">◯ ◯</div>
        <div className="fe-h2">You're first!</div>
        <div className="fe-p" style={{ maxWidth: 230 }}>
          No one else on UA 88 has joined yet. We'll notify you as soon as someone matches.
        </div>
        <Row gap={8}>
          <Btn kind="ghost">Notify me</Btn>
          <Btn kind="primary">Invite a friend</Btn>
        </Row>
      </div>
    </Screen>
    <TabBar active="home" />
  </Phone>
);

Object.assign(window, {
  ScreenSplash, ScreenSignUp, ScreenLogIn,
  ScreenFindPeople, ScreenFindPeopleGrid, ScreenUserDetail,
  ScreenEmptyFlights, ScreenEmptyMatches,
});
