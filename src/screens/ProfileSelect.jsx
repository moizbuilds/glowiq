import { PROFILE_ORDER, PROFILES } from '../profiles'
import { useProfile } from '../context/ProfileContext'
import { getLogs } from '../utils/storage'
import { computeStreak, loggedToday, relativeLabel } from '../utils/dates'
import Avatar from '../components/Avatar'

function summaryFor(profileId) {
  const logs = getLogs(profileId)
  const streak = computeStreak(logs)
  const logged = loggedToday(logs)
  const last = logs.length ? logs[logs.length - 1].day : null
  return { streak, logged, last }
}

function ProfileCard({ profile, onSelect }) {
  const { streak, logged, last } = summaryFor(profile.id)

  return (
    <button
      onClick={() => onSelect(profile.id)}
      className="card"
      style={{
        textAlign: 'left',
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        borderLeft: `5px solid ${profile.accent}`,
        boxShadow: 'var(--shadow-md)',
        transition: 'transform 0.14s ease, box-shadow 0.2s ease',
      }}
      onPointerDown={(e) => (e.currentTarget.style.transform = 'scale(0.985)')}
      onPointerUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      onPointerLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <span
        style={{
          flexShrink: 0,
          display: 'flex',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: `0 6px 18px ${profile.accent}33`,
        }}
      >
        <Avatar profile={profile} size={62} />
      </span>

      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 19, fontWeight: 700 }}>{profile.name}</span>
          <span style={{ fontSize: 17 }}>{profile.emoji}</span>
        </span>
        <span style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>
          {profile.role === profile.name ? 'Mum' : profile.role}
        </span>

        <span style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: profile.accent,
              background: `${profile.accent}14`,
              padding: '4px 10px',
              borderRadius: 999,
            }}
          >
            Day {streak} streak 🔥
          </span>
        </span>

        <span
          style={{
            display: 'block',
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            marginTop: 8,
          }}
        >
          {logged
            ? '✅ Logged today'
            : last
              ? `Last logged: ${relativeLabel(last)} · Hasn't logged today yet ⏰`
              : "Hasn't logged today yet ⏰"}
        </span>
      </span>
    </button>
  )
}

export default function ProfileSelect() {
  const { selectProfile } = useProfile()

  return (
    <div className="screen" style={{ paddingTop: 'max(48px, env(safe-area-inset-top))', paddingBottom: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 26 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-secondary)' }}>
          GLOW<span style={{ color: '#9b72cf' }}>IQ</span> ✨
        </div>
        <h1 style={{ fontSize: 27, marginTop: 12 }}>Who's tracking today? ✨</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {PROFILE_ORDER.map((id) => (
          <ProfileCard key={id} profile={PROFILES[id]} onSelect={selectProfile} />
        ))}
      </div>

      <div
        style={{
          marginTop: 28,
          textAlign: 'center',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '16px 18px',
        }}
      >
        Your data is saved on this device 📱
        <br />
        Always open GlowIQ on the same phone
        <br />
        to see your history
      </div>
    </div>
  )
}
