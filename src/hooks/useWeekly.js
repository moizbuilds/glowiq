import { useCallback, useEffect, useState } from 'react'
import { listReports, saveReportRow } from '../utils/db'
import { daysBetween, todayKey } from '../utils/dates'

// Build a human-readable digest of a day window for Claude.
function buildDigest(logs, products, fromDiff, toDiff) {
  const today = todayKey()
  const productName = (id) => {
    const p = products.find((x) => x.id === id)
    if (!p) return id
    return p.brand ? `${p.name} (${p.brand})` : p.name
  }
  const inWindow = logs
    .filter((l) => {
      const d = daysBetween(l.day, today)
      return d >= fromDiff && d <= toDiff
    })
    .sort((a, b) => a.day.localeCompare(b.day))

  return inWindow.map((l) => {
    const score = typeof l.analysis?.overall_score === 'number' ? `${l.analysis.overall_score}/10` : 'not analysed'
    const prods = (l.products || []).map(productName).join(', ') || 'none'
    const obs = l.analysis?.key_observation ? ` Observation: ${l.analysis.key_observation}` : ''
    const pq = l.analysis?.photo_quality_note ? ` Photo note: ${l.analysis.photo_quality_note}` : ''
    return `• ${l.day}: score ${score}; felt ${l.skinFeel || 'not noted'}; products: ${prods}.${obs}${pq}`
  })
}

function averageScore(logs, fromDiff, toDiff) {
  const today = todayKey()
  const scores = logs
    .filter((l) => {
      const d = daysBetween(l.day, today)
      return d >= fromDiff && d <= toDiff && typeof l.analysis?.overall_score === 'number'
    })
    .map((l) => l.analysis.overall_score)
  if (scores.length === 0) return null
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
}

export function useWeekly(profile, logs, products) {
  const [reports, setList] = useState([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    listReports(profile.id).then((rows) => {
      if (active) setList(rows)
    })
    return () => {
      active = false
    }
  }, [profile.id])

  // Entries with an analysis in the past 7 days — what a report needs.
  const thisWeekCount = logs.filter(
    (l) => daysBetween(l.day, todayKey()) <= 6 && l.analysis,
  ).length

  const lastReport = reports[0] || null
  const daysSinceLast = lastReport ? daysBetween(lastReport.weekEndDay, todayKey()) : null
  const eligible = thisWeekCount >= 2
  const due = eligible && (!lastReport || daysSinceLast >= 7)

  const generate = useCallback(async () => {
    setError(null)
    setGenerating(true)
    try {
      const digestLines = buildDigest(logs, products, 0, 6)
      const body = {
        profileName: profile.name,
        profileRole: profile.role,
        isMama: profile.id === 'mama',
        openingLine: profile.weeklyOpening,
        digest: digestLines.join('\n'),
        lastWeekAvg: averageScore(logs, 7, 13),
      }
      const res = await fetch('/api/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        let message = `Report failed (${res.status}).`
        try {
          const d = await res.json()
          if (d?.error) message = d.error
        } catch { /* keep generic */ }
        throw new Error(message)
      }
      const { report } = await res.json()
      const entry = {
        id: `wk_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        weekStartDay: digestLines.length ? logsWindowStart(logs) : todayKey(),
        weekEndDay: todayKey(),
        report,
      }
      setList((prev) => [entry, ...prev])
      saveReportRow(profile.id, entry)
      return entry
    } catch (err) {
      setError(err.message || 'Could not generate the report.')
      return null
    } finally {
      setGenerating(false)
    }
  }, [logs, products, profile, reports])

  return { reports, lastReport, generate, generating, error, eligible, due, thisWeekCount }
}

function logsWindowStart(logs) {
  const today = todayKey()
  const recent = logs
    .filter((l) => daysBetween(l.day, today) <= 6)
    .sort((a, b) => a.day.localeCompare(b.day))
  return recent[0]?.day || today
}
