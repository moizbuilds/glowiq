// All persistence flows through here. Keys are ALWAYS prefixed with
// glowiq_<profile>_ so GlowIQ can never read or overwrite data from
// any other app on the same device.

import { PROFILES } from '../profiles'

const ACTIVE_PROFILE_KEY = 'glowiq_active_profile'

function keyFor(profileId, suffix) {
  const profile = PROFILES[profileId]
  if (!profile) throw new Error(`Unknown profile: ${profileId}`)
  return `${profile.prefix}${suffix}` // e.g. glowiq_maryam_logs
}

function safeParse(raw, fallback) {
  if (raw == null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function read(profileId, suffix, fallback) {
  try {
    return safeParse(localStorage.getItem(keyFor(profileId, suffix)), fallback)
  } catch {
    return fallback
  }
}

export function write(profileId, suffix, value) {
  try {
    localStorage.setItem(keyFor(profileId, suffix), JSON.stringify(value))
    return true
  } catch (err) {
    // Most likely the localStorage quota was exceeded (too many photos).
    return false
  }
}

// ---- Active profile selection (not profile-scoped) ----
export function getActiveProfile() {
  try {
    return localStorage.getItem(ACTIVE_PROFILE_KEY)
  } catch {
    return null
  }
}

export function setActiveProfile(profileId) {
  try {
    if (profileId) localStorage.setItem(ACTIVE_PROFILE_KEY, profileId)
    else localStorage.removeItem(ACTIVE_PROFILE_KEY)
  } catch {
    /* ignore */
  }
}

// ---- Convenience accessors for the three core collections ----
export const getLogs = (p) => read(p, 'logs', [])
export const setLogs = (p, v) => write(p, 'logs', v)

export const getProducts = (p) => read(p, 'products', [])
export const setProducts = (p, v) => write(p, 'products', v)

export const getMeta = (p) => read(p, 'meta', {})
export const setMeta = (p, v) => write(p, 'meta', v)

export const getReports = (p) => read(p, 'reports', [])
export const setReports = (p, v) => write(p, 'reports', v)
