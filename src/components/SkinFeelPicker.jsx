const FEELS = [
  { id: 'oily', label: 'Oily', emoji: '💧' },
  { id: 'balanced', label: 'Balanced', emoji: '☺️' },
  { id: 'dry', label: 'Dry', emoji: '🏜️' },
  { id: 'irritated', label: 'Irritated', emoji: '🔴' },
  { id: 'glowing', label: 'Glowing', emoji: '✨' },
]

export { FEELS }

// Quick-tap skin feel selector.
export default function SkinFeelPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {FEELS.map((f) => {
        const active = f.id === value
        return (
          <button
            key={f.id}
            onClick={() => onChange(active ? null : f.id)}
            style={{
              flex: '1 0 28%',
              minWidth: 88,
              padding: '12px 8px',
              borderRadius: 'var(--radius-sm)',
              border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent-tint)' : 'var(--card)',
              color: active ? 'var(--accent)' : 'var(--text)',
              fontWeight: 600,
              fontSize: 13.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: 20 }}>{f.emoji}</span>
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
