// The skin-analysis report card. Renders the rich JSON Claude returns in the
// active profile's accent colour. Every section degrades gracefully if a field
// is missing. Colour cues are intentionally soft — never red or alarming.

const TREND = {
  improving: { label: 'Improving', emoji: '📈', color: '#3a8a5a', bg: 'rgba(58,138,90,0.10)' },
  stable: { label: 'Stable', emoji: '➡️', color: '#5a6b8a', bg: 'rgba(90,107,138,0.10)' },
  declining: { label: 'Needs a little care', emoji: '🌱', color: '#8a6a3a', bg: 'rgba(138,106,58,0.10)' },
}

// Soft sentiment cue for each breakdown dimension, inferred from the wording.
// green = looking good · amber = gentle watch · blue-grey = needs attention.
// Never red, never alarming.
const CUE = {
  good: { dot: '#3a8a5a', label: 'looking good' },
  watch: { dot: '#c79a3a', label: 'keep an eye' },
  attention: { dot: '#6b7a99', label: 'a little care' },
  neutral: { dot: '#b7b7b2', label: '' },
}

const ATTENTION = /\b(irritat|inflam|sensitiv|flak|tight|over[- ]?exfoli|persistent|painful|spreading|raw|sore)/i
const WATCH = /\b(slight|some|a few|several|mild|minor|congest|uneven|shine|oily|dry|clogged|redness|spots?|marks?)/i
const GOOD = /\b(even|smooth|hydrated|healthy|balanced|calm|clear|bright|radian|glow|fading|improv|well|nice|good|soft|plump)/i

function cueFor(text) {
  if (!text) return CUE.neutral
  if (ATTENTION.test(text)) return CUE.attention
  if (GOOD.test(text) && !WATCH.test(text)) return CUE.good
  if (WATCH.test(text)) return CUE.watch
  if (GOOD.test(text)) return CUE.good
  return CUE.neutral
}

export default function AnalysisCard({ analysis, profile }) {
  if (!analysis) return null
  const trend = TREND[analysis.trend] || TREND.stable
  const emoji = profile?.emoji || ''

  const clarityText =
    analysis.clarity?.summary ||
    (analysis.clarity?.areas?.length ? `Activity around ${analysis.clarity.areas.join(', ')}` : null)

  const dimensions = [
    { label: 'Clarity', value: clarityText, extra: analysis.clarity?.activity_level },
    { label: 'Texture', value: analysis.texture },
    { label: 'Tone', value: analysis.tone },
    { label: 'Hydration', value: analysis.hydration },
    { label: 'Oil Balance', value: analysis.oil_balance },
    { label: 'Radiance', value: analysis.radiance },
  ].filter((d) => d.value)

  return (
    <div className="card fade-in" style={{ marginTop: 18, padding: 20, overflow: 'hidden' }}>
      {/* Encouragement opener in profile colour */}
      {analysis.encouragement_opener && (
        <p style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.5, color: 'var(--accent)' }}>
          {analysis.encouragement_opener}
        </p>
      )}

      {/* Score + trend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: analysis.encouragement_opener ? 14 : 0,
        }}
      >
        <div>
          <div
            className="muted"
            style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            Skin report {emoji}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
            <span style={{ fontSize: 44, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>
              {fmt(analysis.overall_score)}
            </span>
            <span className="muted" style={{ fontSize: 18, fontWeight: 600 }}>/10</span>
          </div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '7px 12px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 700,
            color: trend.color,
            background: trend.bg,
            whiteSpace: 'nowrap',
          }}
        >
          {trend.emoji} {trend.label}
        </span>
      </div>

      {/* Photo quality note — soft amber banner */}
      {analysis.photo_quality_note && (
        <div
          style={{
            marginTop: 16,
            padding: '11px 13px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(199,154,58,0.10)',
            border: '1px solid rgba(199,154,58,0.28)',
            color: '#7a5e1a',
            fontSize: 12.5,
            display: 'flex',
            gap: 8,
          }}
        >
          <span>📷</span>
          <span>{analysis.photo_quality_note}</span>
        </div>
      )}

      {/* Breakdown grid */}
      {dimensions.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <h4 style={{ fontSize: 13.5, marginBottom: 10 }}>Today's breakdown</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {dimensions.map((d) => (
              <Dimension key={d.label} label={d.label} value={d.value} extra={d.extra} />
            ))}
          </div>
        </div>
      )}

      {/* What's working — positive callout */}
      {analysis.whats_working && (
        <div
          style={{
            marginTop: 16,
            padding: '13px 15px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(58,138,90,0.09)',
            border: '1px solid rgba(58,138,90,0.22)',
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2f7a4d', marginBottom: 4 }}>
            ✨ What's working
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{analysis.whats_working}</div>
        </div>
      )}

      {/* Targeted tips — friendly checklist */}
      {analysis.targeted_tips?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: 13.5, marginBottom: 8 }}>Tips for today</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {analysis.targeted_tips.map((tip, i) => (
              <li key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, lineHeight: 1.45 }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 18,
                    height: 18,
                    borderRadius: 6,
                    background: 'var(--accent-tint)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 1,
                  }}
                >
                  ✓
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingredient note — small "learn" card */}
      {analysis.ingredient_note && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-tint)',
            display: 'flex',
            gap: 9,
          }}
        >
          <span style={{ fontSize: 15 }}>💡</span>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>Learn</div>
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{analysis.ingredient_note}</div>
          </div>
        </div>
      )}

      {/* Watch this — gentle note */}
      {analysis.watch_this && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(90,107,138,0.08)',
            borderLeft: '3px solid #6b7a99',
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4f5d7a', marginBottom: 3 }}>👀 Keep an eye on</div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{analysis.watch_this}</div>
        </div>
      )}

      {/* See a pro — soft, caring card (only when warranted) */}
      {analysis.see_a_pro && (
        <div
          style={{
            marginTop: 14,
            padding: '13px 15px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(107,122,153,0.10)',
            border: '1px solid rgba(107,122,153,0.28)',
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4f5d7a', marginBottom: 4 }}>
            🤍 A gentle suggestion
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{analysis.see_a_pro}</div>
        </div>
      )}

      {/* Closing encouragement */}
      {analysis.closing && (
        <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: 'var(--accent)', marginTop: 18 }}>
          {analysis.closing}
        </p>
      )}

      {/* Disclaimer — always visible */}
      {analysis.disclaimer && (
        <p className="muted" style={{ fontSize: 11.5, marginTop: 14, lineHeight: 1.5, fontStyle: 'italic' }}>
          {analysis.disclaimer}
        </p>
      )}
    </div>
  )
}

function Dimension({ label, value, extra }) {
  const cue = cueFor(`${value} ${extra || ''}`)
  return (
    <div
      style={{
        padding: '11px 12px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--card-2, #faf9f7)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
        <span
          style={{ flexShrink: 0, width: 8, height: 8, borderRadius: 999, background: cue.dot }}
          title={cue.label}
        />
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--text)' }}>{value}</div>
    </div>
  )
}

function fmt(n) {
  const x = Number(n)
  if (Number.isNaN(x)) return '–'
  return Number.isInteger(x) ? String(x) : x.toFixed(1)
}
