import Avatar from './Avatar'

// Small avatar pill, top-right on every in-app screen. Tap to switch profile
// without losing any data (each profile's data stays under its own prefix).
export default function ProfilePill({ profile, onSwitch }) {
  return (
    <button
      onClick={onSwitch}
      aria-label="Switch profile"
      style={{
        position: 'fixed',
        top: 'max(14px, env(safe-area-inset-top))',
        right: 14,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 12px 5px 5px',
        background: 'var(--card)',
        borderRadius: 999,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ display: 'flex', borderRadius: 999, overflow: 'hidden' }}>
        <Avatar profile={profile} size={30} />
      </span>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{profile.emoji}</span>
    </button>
  )
}
