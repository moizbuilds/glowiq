import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from 'recharts'
import { useProfile } from '../context/ProfileContext'
import { useLogs } from '../hooks/useLogs'
import { daysBetween, todayKey, relativeLabel } from '../utils/dates'

const RANGES = [
  { id: 7, label: '7d' },
  { id: 30, label: '30d' },
  { id: 90, label: '90d' },
  { id: 'all', label: 'All' },
]

// Photo-log count milestones worth celebrating on the strip.
const MILESTONES = new Set([7, 30, 90])

export default function TimelineScreen() {
  const { profile } = useProfile()
  const { logs } = useLogs(profile.id)
  const [range, setRange] = useState(30)

  const today = todayKey()
  const inRange = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.day.localeCompare(b.day))
    if (range === 'all') return sorted
    return sorted.filter((l) => daysBetween(l.day, today) <= range)
  }, [logs, range, today])

  const photos = useMemo(() => inRange.filter((l) => l.photo), [inRange])

  const scoreData = useMemo(
    () =>
      inRange
        .filter((l) => typeof l.analysis?.overall_score === 'number')
        .map((l) => ({
          day: l.day,
          short: l.day.slice(5), // MM-DD
          score: l.analysis.overall_score,
        })),
    [inRange],
  )

  const best = useMemo(() => {
    if (scoreData.length === 0) return null
    return scoreData.reduce((a, b) => (b.score > a.score ? b : a))
  }, [scoreData])

  if (logs.length === 0) {
    return (
      <div className="screen">
        <h1 style={{ fontSize: 25 }}>Timeline 📅</h1>
        <EmptyState name={profile.name} />
      </div>
    )
  }

  return (
    <div className="screen">
      <h1 style={{ fontSize: 25 }}>Timeline 📅</h1>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
        {logs.length} {logs.length === 1 ? 'entry' : 'entries'} so far {profile.emoji}
      </p>

      {/* Range filter */}
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        {RANGES.map((r) => {
          const active = r.id === range
          return (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              style={{
                flex: 1,
                padding: '9px 0',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 700,
                border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : 'transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
              }}
            >
              {r.label}
            </button>
          )
        })}
      </div>

      {/* Photo film strip */}
      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 10 }}>Progress photos</h3>
      {photos.length === 0 ? (
        <p className="muted" style={{ fontSize: 13.5 }}>No photos in this range yet.</p>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {photos.map((l, i) => {
            const milestone = MILESTONES.has(i + 1)
            return (
              <div key={l.day} style={{ flexShrink: 0, scrollSnapAlign: 'start', textAlign: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={l.photo}
                    alt={l.day}
                    style={{
                      width: 92,
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border)',
                    }}
                  />
                  {typeof l.analysis?.overall_score === 'number' && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        background: 'var(--accent)',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 999,
                      }}
                    >
                      {fmt(l.analysis.overall_score)}
                    </span>
                  )}
                  {milestone && (
                    <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 16 }}>🏆</span>
                  )}
                </div>
                <div className="muted" style={{ fontSize: 11, marginTop: 5 }}>{l.day.slice(5)}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Score graph */}
      <h3 style={{ fontSize: 15, marginTop: 24, marginBottom: 6 }}>Skin score</h3>
      {scoreData.length < 2 ? (
        <p className="muted" style={{ fontSize: 13.5 }}>
          Log at least two analysed days to see your trend line.
        </p>
      ) : (
        <div className="card" style={{ padding: '16px 10px 10px', marginTop: 6 }}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={scoreData} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="short" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 13 }}
                labelStyle={{ color: 'var(--text-secondary)' }}
                formatter={(v) => [`${fmt(v)}/10`, 'Score']}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={profile.accent}
                strokeWidth={2.5}
                dot={{ r: 3, fill: profile.accent }}
                activeDot={{ r: 5 }}
              />
              {best && (
                <ReferenceDot x={best.short} y={best.score} r={5} fill={profile.accentSoft} stroke={profile.accent} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
          {best && (
            <div className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              Best so far: <strong style={{ color: 'var(--accent)' }}>{fmt(best.score)}/10</strong> on {relativeLabel(best.day)?.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ name }) {
  return (
    <div className="card" style={{ marginTop: 22, padding: 26, textAlign: 'center' }}>
      <div style={{ fontSize: 38 }}>🎞️</div>
      <h3 style={{ marginTop: 10, fontSize: 17 }}>No timeline yet</h3>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
        Once you log a few days {name}, your photos and skin-score trend will appear here.
      </p>
    </div>
  )
}

function fmt(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '–'
  return Number.isInteger(x) ? String(x) : x.toFixed(1)
}
