// Bottom navigation. Active icon/label is tinted with the profile accent.
const TABS = [
  { id: 'today', icon: '📸', label: 'Today' },
  { id: 'timeline', icon: '📅', label: 'Timeline' },
  { id: 'products', icon: '🧴', label: 'Products' },
  { id: 'weekly', icon: '📊', label: 'Weekly' },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        justifyContent: 'space-around',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'saturate(180%) blur(14px)',
        WebkitBackdropFilter: 'saturate(180%) blur(14px)',
        borderTop: '1px solid var(--border)',
        padding: '8px 6px calc(8px + env(safe-area-inset-bottom))',
        zIndex: 40,
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '6px 0',
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s ease, transform 0.12s ease',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
          >
            <span style={{ fontSize: 21, filter: isActive ? 'none' : 'grayscale(0.4)', opacity: isActive ? 1 : 0.7 }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500 }}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
