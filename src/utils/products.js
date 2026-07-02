import { PROFILE_ORDER, PROFILES } from '../profiles'
import { getCachedProducts } from './db'

// Product categories with their own colour tag (independent of profile accent).
export const CATEGORIES = [
  { id: 'cleanser', label: 'Cleanser', color: '#5b8def' },
  { id: 'toner', label: 'Toner', color: '#11b3a3' },
  { id: 'serum', label: 'Serum', color: '#9b72cf' },
  { id: 'moisturiser', label: 'Moisturiser', color: '#3aa675' },
  { id: 'spf', label: 'SPF', color: '#f0a92e' },
  { id: 'exfoliant', label: 'Exfoliant', color: '#e8743b' },
  { id: 'mask', label: 'Mask', color: '#d75a9c' },
  { id: 'eye', label: 'Eye Care', color: '#7a8cff' },
  { id: 'treatment', label: 'Treatment', color: '#c0392b' },
  { id: 'oil', label: 'Face Oil', color: '#cf9b3a' },
  { id: 'other', label: 'Other', color: '#888888' },
]

export const SCHEDULES = ['AM', 'PM', 'Both']

export function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]
}

// Normalise a product name for matching across profiles.
function norm(name, brand) {
  return `${(brand || '').trim().toLowerCase()}|${(name || '').trim().toLowerCase()}`
}

// Returns the list of OTHER profiles who also use a given product (by name+brand).
// Used to render "Maryam also uses this 🌸" style tags.
export function findSharedUsers(name, brand, excludeProfileId) {
  const key = norm(name, brand)
  const result = []
  for (const pid of PROFILE_ORDER) {
    if (pid === excludeProfileId) continue
    const theirs = getCachedProducts(pid)
    const match = theirs.some((p) => !p.archived && norm(p.name, p.brand) === key)
    if (match) result.push(PROFILES[pid])
  }
  return result
}

// Days a product has been in use (since added).
export function daysUsed(product) {
  if (!product.addedAt) return 0
  const ms = Date.now() - new Date(product.addedAt).getTime()
  return Math.max(0, Math.floor(ms / 86400000))
}

export function newProductId() {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
