// STEP 3 — side-by-side review of yesterday vs today before accepting.
export default function PhotoReview({ todayPhoto, yesterdayPhoto, onAccept, onRetake }) {
  return (
    <div style={{ padding: '24px 20px calc(120px + env(safe-area-inset-bottom))' }} className="fade-in">
      <h1 style={{ fontSize: 23 }}>Do these match in lighting and angle?</h1>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <Frame label="Yesterday" photo={yesterdayPhoto} muted />
        <Frame label="Today" photo={todayPhoto} />
      </div>

      <p className="muted" style={{ fontSize: 13.5, marginTop: 14, textAlign: 'center' }}>
        Matching light and angle makes Claude’s comparison far more accurate.
      </p>

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
          display: 'flex',
          gap: 10,
        }}
      >
        <button className="btn-ghost" onClick={onRetake} style={{ flex: 1 }}>
          🔄 Retake
        </button>
        <button className="btn-primary" onClick={onAccept} style={{ flex: 1.6 }}>
          ✅ Yes — use this photo
        </button>
      </div>
    </div>
  )
}

function Frame({ label, photo, muted }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: muted ? 'var(--text-secondary)' : 'var(--accent)',
          marginBottom: 6,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          aspectRatio: '3 / 4',
          background: '#f3f3f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {photo ? (
          <img src={photo} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', padding: 12, textAlign: 'center' }}>
            No photo from {label.toLowerCase()}
          </span>
        )}
      </div>
    </div>
  )
}
