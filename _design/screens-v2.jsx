// Flyeasy v2 — refined wireframe components (no sketchy, two color schemes via root class)

const V2Phone = ({ children }) => (
  <div className="fe2-phone">
    <div className="fe2-phone-inner">{children}</div>
  </div>
);

const V2StatusBar = () => (
  <div className="fe2-statusbar">
    <span>9:41</span>
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      <span>●●●</span><span style={{ marginLeft: 4 }}>▮▮▯</span>
    </span>
  </div>
);

const V2TopBar = ({ title, left, right, sub }) => (
  <div className="fe2-topbar">
    <div className="fe2-topbar-row">
      <div className="fe2-topbar-side">{left}</div>
      <div className="fe2-topbar-title">{title}</div>
      <div className="fe2-topbar-side fe2-right">{right}</div>
    </div>
    {sub && <div className="fe2-topbar-sub">{sub}</div>}
  </div>
);

const V2TabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home', label: 'Find', icon: '⌕' },
    { id: 'flights', label: 'Flights', icon: '✈' },
    { id: 'connections', label: 'Connect', icon: '◉' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'profile', label: 'Me', icon: '◯' },
  ];
  return (
    <div className="fe2-tabbar">
      {tabs.map(t => (
        <div key={t.id} className={`fe2-tab ${active === t.id ? 'on' : ''}`}>
          <div className="fe2-tab-icon">{t.icon}</div>
          <div>{t.label}</div>
        </div>
      ))}
    </div>
  );
};

const V2Avatar = ({ size = 44, initials, style }) => (
  <div className="fe2-avatar" style={{ width: size, height: size, fontSize: size * 0.36, ...style }}>
    {initials}
  </div>
);

const V2Btn = ({ children, kind = 'primary', full, size = 'md', style }) => (
  <div className={`fe2-btn fe2-btn-${kind} ${full ? 'fe2-btn-full' : ''} fe2-btn-${size}`} style={style}>
    {children}
  </div>
);

const V2Input = ({ label, placeholder, value, icon }) => (
  <div className="fe2-input">
    {label && <div className="fe2-input-label">{label}</div>}
    <div className="fe2-input-box">
      {icon && <span className="fe2-input-icon">{icon}</span>}
      <span className={value ? 'fe2-input-val' : 'fe2-input-ph'}>{value || placeholder}</span>
    </div>
  </div>
);

const Stk = ({ gap = 10, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>{children}</div>
);
const Rw = ({ gap = 8, children, style, align = 'center', justify = 'flex-start' }) => (
  <div style={{ display: 'flex', gap, alignItems: align, justifyContent: justify, ...style }}>{children}</div>
);

// ======================== SCREENS ========================

const V2Splash = () => (
  <V2Phone>
    <V2StatusBar />
    <div className="fe2-screen" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 22, padding: 28 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center' }}>
        <span>F</span>
        <svg viewBox="0 0 20 64" width="0.32em" height="1em" style={{ margin: '0 0.02em', alignSelf: 'flex-end', transform: 'translateY(0.02em)' }} aria-label="l">
          {/* vertical airplane silhouette as lowercase 'l' — slim fuselage with small mid-wings and tail */}
          <g fill="#1f2420">
            <path d="
              M10 2
              C 11.2 2 11.7 4 11.7 7
              L 11.7 27
              L 18 33
              L 18 35.5
              L 11.7 33.5
              L 11.7 50
              L 14.5 53
              L 14.5 54.5
              L 10 53.2
              L 5.5 54.5
              L 5.5 53
              L 8.3 50
              L 8.3 33.5
              L 2 35.5
              L 2 33
              L 8.3 27
              L 8.3 7
              C 8.3 4 8.8 2 10 2
              Z
            " />
          </g>
        </svg>
        <span>yeasy</span>
      </div>
      <svg viewBox="0 0 240 170" width="220" height="156" style={{ display: 'block' }} aria-label="two travelers waving hello">
        {/* ground shadows */}
        <ellipse cx="80" cy="158" rx="22" ry="2.5" fill="#1f2420" opacity="0.16" />
        <ellipse cx="170" cy="158" rx="22" ry="2.5" fill="#1f2420" opacity="0.16" />

        <g stroke="#1f2420" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">

          {/* ===== ROLLING CARRY-ON — standing on the ground next to left figure ===== */}
          <g fill="#1f2420">
            <rect x="36" y="108" width="20" height="40" rx="3" stroke="#1f2420" strokeWidth="2" />
            <rect x="40" y="114" width="12" height="14" rx="1.5" fill="#f5f1e8" stroke="none" opacity="0.55" />
            <line x1="46" y1="78" x2="46" y2="108" stroke="#1f2420" strokeWidth="2" />
            <rect x="40" y="76" width="12" height="3" rx="1.5" stroke="#1f2420" strokeWidth="0" />
            {/* feet of suitcase */}
            <rect x="36" y="148" width="6" height="3" rx="1" stroke="none" />
            <rect x="50" y="148" width="6" height="3" rx="1" stroke="none" />
          </g>

          {/* ===== LEFT TRAVELER (slim) ===== */}
          <g>
            {/* head */}
            <circle cx="78" cy="32" r="9" fill="#1f2420" stroke="none" />
            {/* hair tuft */}
            <path d="M70 28 q1 -9 8 -10 q9 -1 10 7" fill="#1f2420" stroke="none" />
            {/* neck */}
            <line x1="78" y1="41" x2="78" y2="46" />

            {/* TORSO — straight rectangle, no curves on chest */}
            <path d="
              M 68 48
              L 88 48
              L 88 100
              q 0 3 -4 3
              l -12 0
              q -4 0 -4 -3
              z
            " fill="#1f2420" stroke="none" />

            {/* WAVING ARM — up and out beside head */}
            {/* shoulder → elbow */}
            <line x1="86" y1="50" x2="96" y2="40" />
            {/* elbow → wrist (raised up) */}
            <line x1="96" y1="40" x2="100" y2="22" />
            {/* hand */}
            <circle cx="100" cy="20" r="3.5" fill="#1f2420" stroke="none" />

            {/* RESTING ARM — hand on suitcase telescoping handle */}
            <line x1="70" y1="50" x2="62" y2="62" />
            <line x1="62" y1="62" x2="50" y2="76" />
            <circle cx="48" cy="78" r="3" fill="#1f2420" stroke="none" />

            {/* LEGS */}
            <line x1="74" y1="100" x2="71" y2="142" />
            <line x1="82" y1="100" x2="85" y2="142" />
            {/* shoes */}
            <ellipse cx="69" cy="146" rx="6" ry="2.5" fill="#1f2420" stroke="none" />
            <ellipse cx="87" cy="146" rx="6" ry="2.5" fill="#1f2420" stroke="none" />
          </g>

          {/* ===== RIGHT TRAVELER ===== */}
          <g>
            {/* backpack — clean rectangle on back, peeks from behind shoulders */}
            <g>
              {/* main body — squared corners */}
              <rect x="172" y="50" width="16" height="44" rx="1.5" fill="#1f2420" stroke="none" />
              {/* top grab handle */}
              <rect x="178" y="46" width="4" height="4" rx="0.5" fill="#1f2420" stroke="none" />
              {/* strap loops at top corners */}
              <rect x="172" y="50" width="3" height="3" fill="#f5f1e8" stroke="none" opacity="0.55" />
              <rect x="185" y="50" width="3" height="3" fill="#f5f1e8" stroke="none" opacity="0.55" />
              {/* divider line */}
              <line x1="172" y1="66" x2="188" y2="66" stroke="#f5f1e8" strokeWidth="1.4" opacity="0.55" />
              {/* front pocket — also rectangular */}
              <rect x="174" y="72" width="12" height="14" fill="#f5f1e8" stroke="none" opacity="0.3" />
              <line x1="174" y1="80" x2="186" y2="80" stroke="#f5f1e8" strokeWidth="1" opacity="0.6" />
            </g>

            {/* head */}
            <circle cx="168" cy="32" r="9" fill="#1f2420" stroke="none" />
            <path d="M160 28 q1 -9 8 -10 q9 -1 10 7" fill="#1f2420" stroke="none" />
            <line x1="168" y1="41" x2="168" y2="46" />

            {/* TORSO — straight rectangle */}
            <path d="
              M 158 48
              L 178 48
              L 178 100
              q 0 3 -4 3
              l -12 0
              q -4 0 -4 -3
              z
            " fill="#1f2420" stroke="none" />

            {/* backpack strap visible across chest */}
            <line x1="163" y1="50" x2="167" y2="86" stroke="#f5f1e8" strokeWidth="2.4" opacity="0.4" />
            <line x1="173" y1="50" x2="169" y2="86" stroke="#f5f1e8" strokeWidth="2.4" opacity="0.4" />

            {/* WAVING ARM — mirror of left figure, raised toward inside */}
            <line x1="160" y1="50" x2="150" y2="40" />
            <line x1="150" y1="40" x2="146" y2="22" />
            <circle cx="146" cy="20" r="3.5" fill="#1f2420" stroke="none" />

            {/* RESTING ARM — at side gripping backpack strap */}
            <line x1="176" y1="50" x2="180" y2="64" />
            <line x1="180" y1="64" x2="178" y2="84" />
            <circle cx="178" cy="86" r="3" fill="#1f2420" stroke="none" />

            {/* LEGS */}
            <line x1="164" y1="100" x2="161" y2="142" />
            <line x1="172" y1="100" x2="175" y2="142" />
            <ellipse cx="159" cy="146" rx="6" ry="2.5" fill="#1f2420" stroke="none" />
            <ellipse cx="177" cy="146" rx="6" ry="2.5" fill="#1f2420" stroke="none" />
          </g>
        </g>
      </svg>
      <Stk gap={10} style={{ alignItems: 'center' }}>
        <div className="fe2-h2" style={{ maxWidth: 240 }}>Fly together, even when alone.</div>
        <div className="fe2-p" style={{ maxWidth: 230 }}>Meet people on your exact flight before you take off.</div>
      </Stk>
      <Stk gap={10} style={{ width: '100%', alignSelf: 'center' }}>
        <V2Btn kind="primary" full size="lg">Create account</V2Btn>
        <V2Btn kind="ghost" full>I already have one</V2Btn>
      </Stk>
    </div>
  </V2Phone>
);

const V2SignUp = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Sign up" left={<span style={{ fontSize: 18 }}>←</span>} />
    <div className="fe2-screen">
      <div className="fe2-h2">Create your account</div>
      <div className="fe2-p">Just the basics to get you flying.</div>
      <Stk gap={10}>
        <V2Input label="First name" placeholder="Maya" />
        <V2Input label="Last name" placeholder="Okafor" />
        <V2Input label="Email" placeholder="you@email.com" icon="@" />
        <V2Input label="Password" placeholder="••••••••" icon="•" />
      </Stk>
      <Rw gap={8}>
        <span className="fe2-check on">✓</span>
        <span className="fe2-p">I agree to terms & privacy</span>
      </Rw>
      <div style={{ flex: 1 }} />
      <V2Btn kind="primary" full size="lg">Create account</V2Btn>
      <div className="fe2-p" style={{ textAlign: 'center' }}>Already have an account? <u>Log in</u></div>
    </div>
  </V2Phone>
);

const V2LogIn = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Log in" left={<span style={{ fontSize: 18 }}>←</span>} />
    <div className="fe2-screen">
      <div className="fe2-h2">Welcome back</div>
      <Stk gap={10}>
        <V2Input label="Email" placeholder="you@email.com" icon="@" />
        <V2Input label="Password" placeholder="••••••••" icon="•" />
      </Stk>
      <Rw justify="space-between">
        <Rw gap={8}><span className="fe2-check" /><span className="fe2-p">Remember me</span></Rw>
        <span className="fe2-p" style={{ textDecoration: 'underline' }}>Forgot?</span>
      </Rw>
      <div style={{ flex: 1 }} />
      <V2Btn kind="primary" full size="lg">Log in</V2Btn>
      <div className="fe2-p" style={{ textAlign: 'center' }}>New here? <u>Create an account</u></div>
    </div>
  </V2Phone>
);

const V2PersonCard = ({ name, initials, code, from, to, when, desc, sent }) => (
  <div className="fe2-card">
    <Rw gap={10}>
      <V2Avatar size={44} initials={initials} />
      <Stk gap={3} style={{ flex: 1, minWidth: 0 }}>
        <Rw justify="space-between">
          <div className="fe2-h3">{name}</div>
          <span className="fe2-verified">✓ verified</span>
        </Rw>
        <Rw gap={6} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span style={{ fontWeight: 700 }}>{code}</span>
          <span>·</span>
          <span>{from} → {to}</span>
          <span style={{ color: 'var(--ink-mute)' }}>· {when}</span>
        </Rw>
      </Stk>
    </Rw>
    <div className="fe2-p" style={{
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    }}>{desc}</div>
    <Rw justify="flex-end">
      {sent
        ? <span className="fe2-connect sent">Requested</span>
        : <span className="fe2-connect">+ Connect</span>}
    </Rw>
  </div>
);

const V2FindPeople = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar
      title="Find People"
      right={<span className="fe2-topbar-icon">⌕</span>}
      sub={<span><span style={{ color: 'var(--ink-mute)' }}>FLIGHT</span> · <b>AA 204 · JFK→LHR · Jun 12</b></span>}
    />
    <div className="fe2-screen">
      <Rw gap={6} style={{ flexWrap: 'wrap' }}>
        <span className="fe2-chip on">Same flight · 8</span>
        <span className="fe2-chip">Nearby</span>
        <span className="fe2-chip">⇅</span>
      </Rw>
      <Stk gap={10}>
        <V2PersonCard name="Maya Okafor" initials="MO" code="AA 204" from="JFK" to="LHR" when="9:20p"
          desc="First solo transatlantic — happy to share a coffee pre-boarding if anyone else is nervous." />
        <V2PersonCard name="Dev Patel" initials="DP" code="AA 204" from="JFK" to="LHR" when="9:20p"
          desc="Heading to a design conf, down to chat about anything creative on the plane." sent />
        <V2PersonCard name="Sana Reyes" initials="SR" code="AA 204" from="JFK" to="LHR" when="9:20p"
          desc="Nervous flyer. Looking for a friendly face at the gate!" />
      </Stk>
    </div>
    <V2TabBar active="home" />
  </V2Phone>
);

const V2UserDetail = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="" left={<span className="fe2-topbar-icon">←</span>} right={<span className="fe2-topbar-icon">⋯</span>} />
    <div className="fe2-screen">
      <Stk gap={10} style={{ alignItems: 'center', textAlign: 'center' }}>
        <V2Avatar size={84} initials="MO" />
        <div className="fe2-h2">Maya Okafor</div>
        <span className="fe2-verified">✓ Flight verified</span>
      </Stk>
      <div className="fe2-card fe2-card-flat">
        <Rw justify="space-between">
          <div className="fe2-section">Their flight</div>
          <span className="fe2-badge">American</span>
        </Rw>
        <div className="fe2-route">
          <span>JFK</span>
          <span className="fe2-route-dash" />
          <span>LHR</span>
        </div>
        <Rw justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>AA 204 · Jun 12 · 9:20p</span>
          <span>7h 10m</span>
        </Rw>
      </div>
      <Stk gap={6}>
        <div className="fe2-section">About Maya</div>
        <div className="fe2-p">First solo transatlantic. Bit nervous but excited! If anyone wants to grab a coffee at the gate, I'm in T8 by 7pm. Reading a novel & open to chat.</div>
      </Stk>
      <div style={{ flex: 1 }} />
      <Stk gap={8}>
        <V2Btn kind="primary" full size="lg">+ Send connect request</V2Btn>
        <V2Btn kind="link" full>Report or block</V2Btn>
      </Stk>
    </div>
  </V2Phone>
);

const V2EmptyMatches = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Find People" sub={<span>FLIGHT · <b>UA 88 · SFO→NRT</b></span>} />
    <div className="fe2-screen">
      <div className="fe2-empty">
        <div className="fe2-empty-ill">◯</div>
        <div className="fe2-h2">You're first!</div>
        <div className="fe2-p" style={{ maxWidth: 230 }}>
          No one else on UA 88 has joined yet. We'll notify you as soon as someone matches.
        </div>
        <Rw gap={8}>
          <V2Btn kind="ghost">Notify me</V2Btn>
          <V2Btn kind="primary">Invite a friend</V2Btn>
        </Rw>
      </div>
    </div>
    <V2TabBar active="home" />
  </V2Phone>
);

const V2EmptyFlights = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="My Flights" right={<span className="fe2-topbar-icon">+</span>} />
    <div className="fe2-screen">
      <div className="fe2-empty">
        <div className="fe2-empty-ill">✈</div>
        <div className="fe2-h2">No flights yet</div>
        <div className="fe2-p" style={{ maxWidth: 230 }}>
          Add a flight to start meeting people who are taking the same one as you.
        </div>
        <V2Btn kind="primary" size="lg">+ Add your first flight</V2Btn>
        <div className="fe2-p" style={{ fontStyle: 'italic', maxWidth: 220 }}>We'll verify your booking in the background.</div>
      </div>
    </div>
    <V2TabBar active="flights" />
  </V2Phone>
);

const V2FlightRow = ({ code, airline, route, when, dur, status }) => (
  <div className="fe2-card fe2-card-tight">
    <Rw justify="space-between">
      <Rw gap={8}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{code}</span>
        <span className="fe2-mono">{airline}</span>
      </Rw>
      <span className={`fe2-badge s-${status.toLowerCase()}`}>{status}</span>
    </Rw>
    <Rw justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
      <span>{route[0]} → {route[1]}</span>
      <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>{dur}</span>
    </Rw>
    <Rw justify="space-between">
      <span className="fe2-mono">{when}</span>
      <Rw gap={10}>
        <span className="fe2-p" style={{ textDecoration: 'underline' }}>Edit</span>
        <span className="fe2-p" style={{ textDecoration: 'underline' }}>Delete</span>
      </Rw>
    </Rw>
  </div>
);

const V2MyFlights = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="My Flights" right={<span className="fe2-topbar-icon">+</span>} />
    <div className="fe2-screen">
      <div className="fe2-input-box dense">
        <span className="fe2-input-icon">⌕</span>
        <span className="fe2-input-ph">Search flight # or city…</span>
      </div>
      <Rw gap={6} style={{ flexWrap: 'wrap' }}>
        <span className="fe2-chip on">All</span>
        <span className="fe2-chip">Future</span>
        <span className="fe2-chip">Ongoing</span>
        <span className="fe2-chip">Past</span>
      </Rw>
      <Stk gap={8}>
        <V2FlightRow code="AA 204" airline="American" route={['JFK','LHR']} when="JUN 12 · 9:20p" dur="7h 10m" status="New" />
        <V2FlightRow code="UA 88"  airline="United"   route={['SFO','NRT']} when="AUG 03 · 11:45a" dur="11h 5m" status="Delayed" />
        <V2FlightRow code="DL 42"  airline="Delta"    route={['ATL','CDG']} when="NOW"             dur="8h 20m" status="Ongoing" />
        <V2FlightRow code="BA 117" airline="British"  route={['LHR','BOS']} when="MAR 02 · 2:10p" dur="7h 40m" status="Complete" />
      </Stk>
    </div>
    <V2TabBar active="flights" />
  </V2Phone>
);

const V2TimelineItem = ({ when, code, route, status, dur }) => (
  <div style={{ display: 'flex', gap: 10 }}>
    <Stk gap={1} style={{ width: 50, flexShrink: 0, alignItems: 'flex-end' }}>
      <div className="fe2-mono" style={{ color: 'var(--ink)', fontSize: 11 }}>{when[0]}</div>
      <div className="fe2-mono" style={{ fontSize: 9 }}>{when[1]}</div>
    </Stk>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />
      <div style={{ width: 1.5, flex: 1, background: 'var(--rule)', margin: '2px 0' }} />
    </div>
    <div className="fe2-card fe2-card-tight" style={{ flex: 1, padding: 9, gap: 4 }}>
      <Rw justify="space-between">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{code}</span>
        <span className={`fe2-badge s-${status.toLowerCase()}`}>{status}</span>
      </Rw>
      <Rw justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
        <span>{route[0]} → {route[1]}</span>
        <span style={{ color: 'var(--ink-mute)', fontSize: 10 }}>{dur}</span>
      </Rw>
    </div>
  </div>
);

const V2MyFlightsTimeline = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="My Flights" right={<span className="fe2-topbar-icon">+</span>} />
    <div className="fe2-screen">
      <Rw justify="space-between">
        <div className="fe2-seg">
          <div className="on">Upcoming</div>
          <div>Past</div>
        </div>
        <span className="fe2-mono">4 trips</span>
      </Rw>
      <div className="fe2-section">This month</div>
      <V2TimelineItem when={['JUN 12','TUE']} code="AA 204" route={['JFK','LHR']} status="New" dur="7h 10m" />
      <div className="fe2-section">August</div>
      <Stk gap={6}>
        <V2TimelineItem when={['AUG 03','SAT']} code="UA 88" route={['SFO','NRT']} status="Delayed" dur="11h 5m" />
        <V2TimelineItem when={['AUG 19','MON']} code="NH 10" route={['NRT','SFO']} status="New" dur="9h 30m" />
      </Stk>
      <div className="fe2-section">Ongoing</div>
      <V2TimelineItem when={['NOW','—']} code="DL 42" route={['ATL','CDG']} status="Ongoing" dur="8h 20m" />
    </div>
    <V2TabBar active="flights" />
  </V2Phone>
);

const V2AddFlight = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Add flight" left={<span className="fe2-topbar-icon">✕</span>} right={<span className="fe2-p" style={{ fontWeight: 600 }}>Save</span>} />
    <div className="fe2-screen">
      <div className="fe2-verify">
        <span className="fe2-verify-icon">✓</span>
        <div><b>We verify every flight.</b> We'll confirm your booking with the airline in the background — you'll only appear to matches once it's confirmed.</div>
      </div>
      <Stk gap={10}>
        <V2Input label="Flight number" placeholder="e.g. AA 204" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <V2Input label="From" placeholder="JFK" />
          <V2Input label="To" placeholder="LHR" />
        </div>
        <V2Input label="Airline" placeholder="American Airlines" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <V2Input label="Date" placeholder="Jun 12, 2026" icon="📅" />
          <V2Input label="Time" placeholder="9:20 PM" icon="◷" />
        </div>
        <V2Input label="Booking ref" placeholder="ABC123" icon="#" />
      </Stk>
      <div style={{ flex: 1 }} />
      <V2Btn kind="primary" full size="lg">Save & verify</V2Btn>
    </div>
  </V2Phone>
);

const V2FlightDetail = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="" left={<span className="fe2-topbar-icon">←</span>} right={<span className="fe2-topbar-icon">⋯</span>} />
    <div className="fe2-screen">
      <Stk gap={6}>
        <Rw justify="space-between" align="flex-start">
          <Stk gap={3}>
            <div className="fe2-h1">AA 204</div>
            <Rw gap={6}>
              <span className="fe2-verified">✓ Verified</span>
              <span className="fe2-mono">American Airlines</span>
            </Rw>
          </Stk>
          <span className="fe2-badge s-new">New</span>
        </Rw>
      </Stk>
      <div className="fe2-card fe2-card-flat">
        <div className="fe2-route">
          <span>JFK</span>
          <span className="fe2-route-dash" />
          <span>LHR</span>
        </div>
        <Rw justify="space-between" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <span>New York</span>
          <span>London</span>
        </Rw>
        <div className="fe2-divider" />
        <Rw justify="space-between">
          <Stk gap={2}><div className="fe2-mono">Departs</div><div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}>Jun 12 · 9:20 PM</div></Stk>
          <Stk gap={2}><div className="fe2-mono">Duration</div><div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}>7h 10m</div></Stk>
        </Rw>
      </div>
      <Rw justify="space-between">
        <div className="fe2-section">People on this flight</div>
        <span className="fe2-p" style={{ textDecoration: 'underline' }}>See all 8</span>
      </Rw>
      <Rw gap={8}>
        <V2Avatar size={40} initials="MO" />
        <V2Avatar size={40} initials="DP" />
        <V2Avatar size={40} initials="SR" />
        <V2Avatar size={40} initials="LT" />
        <V2Avatar size={40} initials="+4" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }} />
      </Rw>
      <div style={{ flex: 1 }} />
      <V2Btn kind="primary" full size="lg">Find people on this flight</V2Btn>
    </div>
  </V2Phone>
);

const V2RequestRow = ({ initials, name, flight, desc }) => (
  <div className="fe2-card">
    <Rw gap={10}>
      <V2Avatar size={42} initials={initials} />
      <Stk gap={2} style={{ flex: 1, minWidth: 0 }}>
        <div className="fe2-h3">{name}</div>
        <span className="fe2-mono">{flight}</span>
      </Stk>
    </Rw>
    <div className="fe2-p" style={{
      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
    }}>{desc}</div>
    <Rw gap={8}>
      <V2Btn kind="primary" size="sm" style={{ flex: 1 }}>Accept</V2Btn>
      <V2Btn kind="ghost" size="sm" style={{ flex: 1 }}>Decline</V2Btn>
    </Rw>
  </div>
);

const V2Requests = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Connections" />
    <div className="fe2-screen">
      <div className="fe2-seg">
        <div className="on">Requests · 3</div>
        <div>Connected</div>
      </div>
      <Stk gap={10}>
        <V2RequestRow initials="DP" name="Dev Patel" flight="AA 204 · JFK→LHR · Jun 12"
          desc="Hey! Saw we're on the same flight. Down to grab coffee at the gate?" />
        <V2RequestRow initials="SR" name="Sana Reyes" flight="AA 204 · JFK→LHR · Jun 12"
          desc="Nervous flyer here — would love a friendly face!" />
        <V2RequestRow initials="LT" name="Leo Tan" flight="UA 88 · SFO→NRT · Aug 3"
          desc="Heading to Tokyo for a wedding. Hi!" />
      </Stk>
    </div>
    <V2TabBar active="connections" />
  </V2Phone>
);

const V2ConnectionRow = ({ initials, name, flight, lastMsg, unread, time }) => (
  <Rw gap={10} style={{ padding: '12px 0', borderBottom: '1px solid var(--rule)' }}>
    <V2Avatar size={46} initials={initials} />
    <Stk gap={3} style={{ flex: 1, minWidth: 0 }}>
      <Rw justify="space-between">
        <div className="fe2-h3">{name}</div>
        {unread
          ? <span className="fe2-badge fe2-badge-solid">{unread}</span>
          : <span className="fe2-mono" style={{ fontSize: 9 }}>{time}</span>}
      </Rw>
      <span className="fe2-mono" style={{ fontSize: 9 }}>{flight}</span>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg}</div>
    </Stk>
  </Rw>
);

const V2Connections = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Connections" />
    <div className="fe2-screen">
      <div className="fe2-seg">
        <div>Requests · 3</div>
        <div className="on">Connected · 5</div>
      </div>
      <Stk gap={0}>
        <V2ConnectionRow initials="MO" name="Maya O." flight="AA 204 · Jun 12" lastMsg="See you at gate 18!" unread="2" />
        <V2ConnectionRow initials="DP" name="Dev P." flight="AA 204 · Jun 12" lastMsg="Which terminal are you flying out of?" time="2h" />
        <V2ConnectionRow initials="JH" name="Jordan H." flight="UA 88 · Aug 3" lastMsg="Booked the same hotel 😂" time="1d" />
        <V2ConnectionRow initials="KN" name="Kira N." flight="BA 117 · Mar 2" lastMsg="Thanks, safe flight!" time="14d" />
      </Stk>
    </div>
    <V2TabBar active="connections" />
  </V2Phone>
);

const V2ChatList = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Chats" right={<span className="fe2-topbar-icon">⌕</span>} />
    <div className="fe2-screen">
      <div className="fe2-verify" style={{ fontSize: 11 }}>
        <span className="fe2-verify-icon" style={{ width: 20, height: 20, fontSize: 12 }}>i</span>
        <div>Chats stay open until your shared flight lands. After that, history is read-only.</div>
      </div>
      <Stk gap={0}>
        <V2ConnectionRow initials="MO" name="Maya O." flight="AA 204 · Departs in 2d" lastMsg="See you at gate 18!" unread="2" />
        <V2ConnectionRow initials="DP" name="Dev P." flight="AA 204 · Departs in 2d" lastMsg="Which terminal are you flying out of?" time="2h" />
        <V2ConnectionRow initials="KN" name="Kira N." flight="BA 117 · Closed" lastMsg="Thanks, safe flight!" time="14d" />
      </Stk>
    </div>
    <V2TabBar active="chat" />
  </V2Phone>
);

const V2ChatThread = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar
      title={<Rw gap={8}><V2Avatar size={26} initials="MO" /><span>Maya O.</span></Rw>}
      left={<span className="fe2-topbar-icon">←</span>}
      right={<span className="fe2-topbar-icon">i</span>}
      sub={<Rw gap={6} justify="space-between"><span><b>AA 204</b> · JFK→LHR</span><span className="fe2-verified" style={{ fontSize: 8 }}>closes in 3d 4h</span></Rw>}
    />
    <div className="fe2-screen" style={{ background: 'var(--paper-2)', padding: '12px 14px', gap: 8 }}>
      <div className="fe2-chat-date">Today</div>
      <div className="fe2-bubble them">Hey! Saw we're on the same flight 🙌</div>
      <div className="fe2-bubble them">First time flying to London — any tips on terminal 8?</div>
      <div className="fe2-bubble me">Hi! Yeah I've done this one a few times. Security gets rough around 6, I usually hit the lounge by 5:30.</div>
      <div className="fe2-bubble them">Want to grab a coffee before boarding?</div>
      <div className="fe2-bubble me">Absolutely. See you at gate 18!</div>
      <div style={{ flex: 1 }} />
    </div>
    <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderTop: '1px solid var(--rule)', background: 'var(--paper)', alignItems: 'center' }}>
      <div className="fe2-input-box dense" style={{ flex: 1 }}>
        <span className="fe2-input-ph">Message…</span>
      </div>
      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-on)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>↑</div>
    </div>
  </V2Phone>
);

const V2Profile = () => (
  <V2Phone>
    <V2StatusBar />
    <V2TopBar title="Profile" right={<span className="fe2-p" style={{ fontWeight: 600, textDecoration: 'underline' }}>Edit</span>} />
    <div className="fe2-screen">
      <Stk gap={8} style={{ alignItems: 'center', textAlign: 'center' }}>
        <V2Avatar size={80} initials="RT" />
        <span className="fe2-p" style={{ textDecoration: 'underline' }}>Change photo</span>
        <div className="fe2-h2">Riya Tanaka</div>
        <span className="fe2-mono">riya@email.com</span>
      </Stk>
      <div className="fe2-card fe2-card-flat">
        <Rw justify="space-between">
          <Stk gap={2}>
            <div className="fe2-h3">Available to connect</div>
            <div className="fe2-p">Others on your flights can send you requests.</div>
          </Stk>
          <div className="fe2-toggle on"><div className="fe2-toggle-dot" /></div>
        </Rw>
      </div>
      <Stk gap={6}>
        <div className="fe2-section">About me</div>
        <div className="fe2-card fe2-card-flat">
          <div className="fe2-p">Design researcher flying a lot between NYC & Tokyo. Always up to chat about books, coffee, and random airport snacks.</div>
        </div>
      </Stk>
      <div className="fe2-card fe2-card-flat">
        <Rw justify="space-between">
          <Stk gap={2}><div className="fe2-h3">My Flights</div><div className="fe2-p">4 upcoming · 12 past</div></Stk>
          <span style={{ color: 'var(--ink-mute)', fontSize: 18 }}>›</span>
        </Rw>
      </div>
      <V2Btn kind="ghost" full>Sign out</V2Btn>
    </div>
    <V2TabBar active="profile" />
  </V2Phone>
);

Object.assign(window, {
  V2Splash, V2SignUp, V2LogIn, V2FindPeople, V2UserDetail,
  V2EmptyMatches, V2EmptyFlights, V2MyFlights, V2MyFlightsTimeline,
  V2AddFlight, V2FlightDetail, V2Requests, V2Connections,
  V2ChatList, V2ChatThread, V2Profile,
});
