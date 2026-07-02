// Date helpers. We key logs by local calendar day (YYYY-MM-DD) so that
// "today" / "yesterday" / streaks behave the way a human expects.

export function dayKey(date = new Date()) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey() {
  return dayKey(new Date())
}

export function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dayKey(d)
}

function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function daysBetween(aKey, bKey) {
  const ms = parseKey(bKey).getTime() - parseKey(aKey).getTime()
  return Math.round(ms / 86400000)
}

// Friendly relative label for the most recent log.
export function relativeLabel(key) {
  if (!key) return null
  const diff = daysBetween(key, todayKey())
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 14) return 'Last week'
  return `${Math.floor(diff / 7)} weeks ago`
}

// Current consecutive-day streak based on an array of logs (each has .day).
export function computeStreak(logs) {
  if (!logs || logs.length === 0) return 0
  const days = new Set(logs.map((l) => l.day))
  let streak = 0
  let cursor = new Date()
  // If today isn't logged yet, the streak is whatever ran up to yesterday.
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
  }
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function loggedToday(logs) {
  const t = todayKey()
  return !!logs?.some((l) => l.day === t)
}
