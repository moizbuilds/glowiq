import { daysBetween, todayKey } from './dates'

// The client NO LONGER talks to Anthropic directly — it posts the skin-log
// data to our own /api/analyze endpoint, which holds the API key server-side.
// This keeps the key out of the browser bundle entirely.

// Build a short, readable summary of the last 7 days of products + skin feel.
function recentContext(logs, products) {
  const today = todayKey()
  const productName = (id) => {
    const p = products.find((x) => x.id === id)
    if (!p) return id
    return p.brand ? `${p.name} (${p.brand})` : p.name
  }

  const recent = (logs || [])
    .filter((l) => {
      const diff = daysBetween(l.day, today)
      return diff >= 0 && diff <= 7
    })
    .sort((a, b) => (a.day < b.day ? 1 : -1))

  if (recent.length === 0) return 'No prior logs in the past 7 days.'

  return recent
    .map((l) => {
      const prods = (l.products || []).map(productName).join(', ') || 'none recorded'
      const feel = l.skinFeel || 'not noted'
      return `• ${l.day} (${l.period || '—'}): skin felt ${feel}; products: ${prods}`
    })
    .join('\n')
}

// Pull the previous analysis so Claude can stay consistent with what it said.
function previousSummary(logs) {
  const withAnalysis = (logs || [])
    .filter((l) => l.analysis)
    .sort((a, b) => (a.day < b.day ? 1 : -1))
  const last = withAnalysis[0]
  if (!last) return 'No previous analysis on record — this is an early entry.'
  const a = last.analysis
  // Support both the new structure and any older saved logs.
  const note =
    a.clarity?.summary || a.key_observation || a.watch_this || a.closing || 'no note recorded'
  return `Previous analysis (${last.day}): overall ${a.overall_score}/10, trend "${a.trend}". Note: ${note}`
}

export async function analyzeSkin({ profile, todayLog, yesterdayPhoto, logs, products }) {
  const body = {
    profileName: profile.name,
    profileRole: profile.role,
    isMama: profile.id === 'mama',
    todayPhoto: todayLog.photo,
    yesterdayPhoto: yesterdayPhoto || null,
    skinFeel: todayLog.skinFeel || null,
    note: todayLog.note || null,
    recentContext: recentContext(logs, products),
    previousSummary: previousSummary(logs),
  }

  let res
  try {
    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the analysis service. Is the dev server running?')
  }

  if (!res.ok) {
    let message = `Analysis failed (${res.status}).`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new Error(message)
  }

  const data = await res.json()
  return data.analysis
}
