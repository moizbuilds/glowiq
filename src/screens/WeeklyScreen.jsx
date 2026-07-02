import { useProfile } from '../context/ProfileContext'
import { useLogs } from '../hooks/useLogs'
import { useProducts } from '../hooks/useProducts'
import { useWeekly } from '../hooks/useWeekly'
import { relativeLabel } from '../utils/dates'

export default function WeeklyScreen() {
  const { profile } = useProfile()
  const { logs } = useLogs(profile.id)
  const { products } = useProducts(profile.id)
  const { reports, generate, generating, error, eligible, due, thisWeekCount } = useWeekly(
    profile,
    logs,
    products,
  )

  return (
    <div className="screen">
      <h1 style={{ fontSize: 25 }}>Weekly report 📊</h1>
      <p className="muted" style={{ fontSize: 13.5, marginTop: 6 }}>
        A warm summary of your week {profile.emoji}
      </p>

      {due && (
        <div
          className="pill"
          style={{ marginTop: 14, background: 'var(--accent-tint-strong)' }}
        >
          ✨ A fresh report is ready to generate
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{ marginTop: 14, padding: 13, border: '1px solid #e0b4b4', background: '#fdf0f0', color: '#9a3b3b', fontSize: 13.5 }}
        >
          {error}
        </div>
      )}

      {generating ? (
        <div
          className="card"
          style={{ marginTop: 18, padding: 24, textAlign: 'center', animation: 'pulseGlow 1.6s ease-in-out infinite' }}
        >
          <div style={{ fontSize: 30 }}>📊</div>
          <div style={{ marginTop: 8, fontWeight: 700 }}>Writing your weekly report…</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            Reading {thisWeekCount} {thisWeekCount === 1 ? 'entry' : 'entries'} from this week.
          </div>
        </div>
      ) : (
        <button
          className={due ? 'btn-primary' : 'btn-ghost'}
          onClick={generate}
          disabled={!eligible}
          style={{ marginTop: 16, opacity: eligible ? 1 : 0.5 }}
        >
          {reports.length === 0 ? 'Generate my first report ✨' : 'Generate this week’s report ✨'}
        </button>
      )}

      {!eligible && (
        <p className="muted" style={{ fontSize: 12.5, marginTop: 10 }}>
          Log and analyse at least 2 days this week to unlock your report.
        </p>
      )}

      {reports.map((entry, i) => (
        <ReportCard key={entry.id} entry={entry} profile={profile} latest={i === 0} />
      ))}
    </div>
  )
}

function ReportCard({ entry, profile, latest }) {
  const r = entry.report
  const consistency = clampPct(r.photo_consistency_score)
  return (
    <div className="card fade-in" style={{ marginTop: 18, padding: 22, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="muted" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Week of {entry.weekStartDay.slice(5)}–{entry.weekEndDay.slice(5)}
        </span>
        {latest && (
          <span className="pill" style={{ fontSize: 11, padding: '3px 9px' }}>Latest</span>
        )}
      </div>

      <p style={{ fontSize: 15.5, fontWeight: 600, marginTop: 10, color: 'var(--accent)' }}>{r.opening}</p>
      {r.summary && <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.55 }}>{r.summary}</p>}

      {r.week_vs_last_week && (
        <div style={{ marginTop: 14, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-tint)', fontSize: 13.5 }}>
          📈 {r.week_vs_last_week}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
        <Stat label="⭐ Star product" value={r.star_product} />
        <Stat label="🤔 Reconsider" value={r.reconsider_product} />
      </div>

      {/* Photo consistency meter */}
      {typeof r.photo_consistency_score === 'number' && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
            <span style={{ fontWeight: 600 }}>📷 Photo consistency</span>
            <span className="muted" style={{ fontWeight: 600 }}>{consistency}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 999, background: 'var(--accent-tint)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${consistency}%`, borderRadius: 999, background: 'var(--accent)' }} />
          </div>
        </div>
      )}

      {r.recommendation && (
        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-tint)', borderLeft: '3px solid var(--accent)' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>This week’s recommendation</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{r.recommendation}</div>
        </div>
      )}

      {r.highlight && (
        <p style={{ fontSize: 13.5, marginTop: 14, fontStyle: 'italic', color: 'var(--text-secondary)' }}>
          ✨ {r.highlight}
        </p>
      )}

      <div className="muted" style={{ fontSize: 11, marginTop: 14 }}>
        Generated {relativeLabel(entry.weekEndDay)?.toLowerCase()}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={{ padding: '11px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
      <div className="muted" style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{value || '—'}</div>
    </div>
  )
}

function clampPct(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return 0
  return Math.max(0, Math.min(100, Math.round(x)))
}
