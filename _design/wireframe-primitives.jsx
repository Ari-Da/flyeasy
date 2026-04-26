// Shared sketchy wireframe primitives for Flyeasy
// Exposes components via window for cross-script use

const Phone = ({ label, children, note, width = 320, height = 680 }) => {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('fe-ctx-change', h);
    return () => window.removeEventListener('fe-ctx-change', h);
  }, []);
  const { sketchy, annotate } = window.__fe_ctx || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div
        className={`fe-phone ${sketchy ? 'sk' : ''}`}
        style={{ width, height }}
      >
        <div className="fe-phone-inner">{children}</div>
      </div>
      {annotate && note && (
        <div className="fe-annot" style={{ maxWidth: width + 40 }}>{note}</div>
      )}
    </div>
  );
};

const StatusBar = () => (
  <div className="fe-statusbar">
    <span>9:41</span>
    <span className="fe-sb-right">
      <span className="fe-sb-dot" /><span className="fe-sb-dot" /><span className="fe-sb-dot" />
      <span style={{ marginLeft: 6 }}>▮▮▯</span>
    </span>
  </div>
);

const TopBar = ({ title, left, right, sub }) => (
  <div className="fe-topbar">
    <div className="fe-topbar-row">
      <div className="fe-topbar-side">{left}</div>
      <div className="fe-topbar-title">{title}</div>
      <div className="fe-topbar-side fe-right">{right}</div>
    </div>
    {sub && <div className="fe-topbar-sub">{sub}</div>}
  </div>
);

const TabBar = ({ active = 'home' }) => {
  const tabs = [
    { id: 'home', label: 'Find', icon: '⌕' },
    { id: 'flights', label: 'Flights', icon: '✈' },
    { id: 'connections', label: 'Connections', icon: '◉◉' },
    { id: 'chat', label: 'Chat', icon: '▭' },
    { id: 'profile', label: 'Me', icon: '◯' },
  ];
  return (
    <div className="fe-tabbar">
      {tabs.map(t => (
        <div key={t.id} className={`fe-tab ${active === t.id ? 'on' : ''}`}>
          <div className="fe-tab-icon">{t.icon}</div>
          <div className="fe-tab-label">{t.label}</div>
        </div>
      ))}
    </div>
  );
};

const Btn = ({ children, kind = 'primary', full, size = 'md', style, ...rest }) => (
  <div
    className={`fe-btn fe-btn-${kind} ${full ? 'fe-btn-full' : ''} fe-btn-${size}`}
    style={style}
    {...rest}
  >
    {children}
  </div>
);

const Input = ({ label, placeholder, value, icon, type }) => (
  <div className="fe-input">
    {label && <div className="fe-input-label">{label}</div>}
    <div className="fe-input-box">
      {icon && <span className="fe-input-icon">{icon}</span>}
      <span className={value ? 'fe-input-val' : 'fe-input-ph'}>
        {value || placeholder}
      </span>
    </div>
  </div>
);

const Avatar = ({ size = 44, initials, style }) => (
  <div className="fe-avatar" style={{ width: size, height: size, ...style }}>
    {initials ? <span>{initials}</span> : <span className="fe-avatar-ph">◯</span>}
  </div>
);

const Badge = ({ children, tone = 'neutral' }) => (
  <span className={`fe-badge fe-badge-${tone}`}>{children}</span>
);

const Sq = ({ w = '100%', h = 12, r = 4, style, tone = 'line' }) => (
  <div className={`fe-sq fe-sq-${tone}`} style={{ width: w, height: h, borderRadius: r, ...style }} />
);

// Scribble placeholder block — e.g. for photos / maps
const Scribble = ({ w = '100%', h = 80, label, style }) => (
  <div className="fe-scribble" style={{ width: w, height: h, ...style }}>
    {label && <span className="fe-scribble-label">{label}</span>}
  </div>
);

const Divider = () => <div className="fe-divider" />;

const Stack = ({ gap = 10, children, style, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }} {...rest}>{children}</div>
);
const Row = ({ gap = 8, children, style, align = 'center', justify = 'flex-start' }) => (
  <div style={{ display: 'flex', gap, alignItems: align, justifyContent: justify, ...style }}>{children}</div>
);

// Content area inside phone (scroll-like but static)
const Screen = ({ children, style, bg = 'paper' }) => (
  <div className={`fe-screen fe-bg-${bg}`} style={style}>{children}</div>
);

// Note sticker — overlay annotation
const Sticker = ({ children, style }) => (
  <div className="fe-sticker" style={style}>{children}</div>
);

Object.assign(window, {
  Phone, StatusBar, TopBar, TabBar, Btn, Input, Avatar, Badge,
  Sq, Scribble, Divider, Stack, Row, Screen, Sticker,
});
