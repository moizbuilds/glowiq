import { useCallback, useEffect, useState } from 'react'
import { listLogs, saveLogRow } from '../utils/db'
import { todayKey, yesterdayKey } from '../utils/dates'

// Reactive access to the active profile's daily logs.
// A "log" = one day's entry: { day, photo, period, products[], skinFeel,
// note, createdAt, analysis? }. State updates optimistically so the UI is
// instant; the Supabase write happens in the background.
export function useLogs(profileId) {
  const [logs, setList] = useState([])

  useEffect(() => {
    let active = true
    listLogs(profileId).then((rows) => {
      if (active) setList(rows)
    })
    return () => {
      active = false
    }
  }, [profileId])

  const logForDay = useCallback((day) => logs.find((l) => l.day === day) || null, [logs])

  const todaysLog = logForDay(todayKey())
  const yesterdaysLog = logForDay(yesterdayKey())
  // Most recent log that has a photo, for "match yesterday's angle".
  const lastPhotoLog = [...logs].reverse().find((l) => l.photo) || null

  // Insert or replace today's log. Returns the record synchronously; the
  // database write is fire-and-forget so callers don't need to await.
  const saveLog = useCallback(
    (entry) => {
      const day = entry.day || todayKey()
      const existingIdx = logs.findIndex((l) => l.day === day)
      const record = {
        day,
        createdAt: new Date().toISOString(),
        ...(existingIdx >= 0 ? logs[existingIdx] : {}),
        ...entry,
      }
      let next
      if (existingIdx >= 0) {
        next = logs.slice()
        next[existingIdx] = record
      } else {
        next = [...logs, record].sort((a, b) => a.day.localeCompare(b.day))
      }
      setList(next)
      saveLogRow(profileId, record)
      return record
    },
    [logs, profileId],
  )

  return {
    logs,
    todaysLog,
    yesterdaysLog,
    lastPhotoLog,
    logForDay,
    saveLog,
  }
}
