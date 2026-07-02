import { useState } from 'react'

const ITEMS = [
  {
    title: 'Natural light only — face a window',
    detail: 'No lamps, overhead light, or bathroom light. Best time: morning, same time as yesterday.',
  },
  {
    title: 'No makeup or skincare on face yet',
    detail: 'Take the photo before your morning routine.',
  },
  {
    title: 'Hair completely pulled back',
    detail: 'No hair touching face or forehead.',
  },
  {
    title: 'Phone at arm’s length or propped up',
    detail: 'Same distance as yesterday.',
  },
  {
    title: 'Neutral expression',
    detail: 'Relax your face — no smiling, mouth gently closed, look straight ahead.',
  },
]

// STEP 1 — full-screen preparation checklist + rotating tip + yesterday's photo.
export default function PhotoChecklist({ tip, yesterdayPhoto, onReady, onCancel }) {
  const [checked, setChecked] = useState({})
  const toggle = (i) => setChecked((c) => ({ ...c, [i]: !c[i] }))

  return (
    <div style={{ padding: '24px 20px calc(120px + env(safe-area-inset-bottom))' }} className="fade-in">
      <button onClick={onCancel} style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 24, marginTop: 14 }}>📸 Before you take your photo:</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
        {ITEMS.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className="card"
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
              padding: 14,
              textAlign: 'left',
              borderColor: checked[i] ? 'var(--accent)' : 'var(--border)',
              background: checked[i] ? 'var(--accent-tint)' : 'var(--card)',
              transition: 'all 0.15s ease',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                width: 24,
                height: 24,
                borderRadius: 7,
                border: `2px solid ${checked[i] ? 'var(--accent)' : 'var(--border)'}`,
                background: checked[i] ? 'var(--accent)' : 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                marginTop: 1,
              }}
            >
              {checked[i] ? '✓' : ''}
            </span>
            <span>
              <span style={{ display: 'block', fontWeight: 600, fontSize: 15 }}>{item.title}</span>
              <span style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {item.detail}
              </span>
            </span>
          </button>
        ))}

        {/* Match yesterday's angle */}
        <div className="card" style={{ padding: 14 }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Match yesterday’s angle</span>
          {yesterdayPhoto ? (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>Match this 👇</div>
              <img
                src={yesterdayPhoto}
                alt="Yesterday"
                style={{ width: '100%', borderRadius: 'var(--radius-sm)', display: 'block' }}
              />
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
              No previous photo yet — this one sets your baseline. Pick a spot you can repeat tomorrow.
            </div>
          )}
        </div>

        {/* Rotating daily tip */}
        <div
          style={{
            marginTop: 4,
            padding: '14px 16px',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-tint)',
            border: '1px solid var(--accent-tint-strong)',
            fontSize: 13.5,
            color: 'var(--text)',
          }}
        >
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>💡 Tip · </span>
          {tip}
        </div>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 520,
          padding: '14px 20px calc(16px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
        }}
      >
        <button className="btn-primary" onClick={onReady}>
          I’m ready — take my photo 📸
        </button>
      </div>
    </div>
  )
}
