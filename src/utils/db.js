// Storage layer. When Supabase is configured (VITE_SUPABASE_URL +
// VITE_SUPABASE_ANON_KEY), all of a profile's data lives in Postgres so it
// syncs across every device and survives forever. When it isn't configured,
// everything falls back to the original localStorage layer so the app still
// runs locally with zero setup.
//
// Data shapes are identical in both modes — screens never know which backend
// is active. Photos are stored as base64 strings inside a jsonb column (no
// separate Storage bucket needed; well within the free tier for a few users).

import { createClient } from '@supabase/supabase-js'
import { PROFILE_ORDER } from '../profiles'
import {
  getLogs,
  setLogs,
  getProducts,
  setProducts,
  getReports,
  setReports,
} from './storage'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseReady = Boolean(url && anonKey)

const supabase = supabaseReady ? createClient(url, anonKey) : null

// ---- In-memory product cache ----
// findSharedUsers() needs synchronous, cross-profile product lookups ("Mama
// also uses this"). We can't hit the network synchronously, so every profile's
// products are cached here and refreshed whenever the products screen loads.
const productCache = new Map() // profileId -> product[]

export function getCachedProducts(profileId) {
  if (productCache.has(profileId)) return productCache.get(profileId)
  // Fall back to localStorage when nothing is primed yet (offline / no config).
  return getProducts(profileId)
}

function setCache(profileId, products) {
  productCache.set(profileId, products)
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------
export async function listLogs(profileId) {
  if (!supabaseReady) return getLogs(profileId)
  const { data, error } = await supabase
    .from('logs')
    .select('data')
    .eq('profile', profileId)
    .order('day', { ascending: true })
  if (error) {
    console.error('listLogs', error)
    return getLogs(profileId)
  }
  const logs = data.map((r) => r.data)
  setLogs(profileId, logs) // keep a local mirror for offline reads
  return logs
}

export async function saveLogRow(profileId, log) {
  if (!supabaseReady) return
  const { error } = await supabase
    .from('logs')
    .upsert({ profile: profileId, day: log.day, data: log }, { onConflict: 'profile,day' })
  if (error) console.error('saveLogRow', error)
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export async function listProducts(profileId) {
  if (!supabaseReady) {
    const local = getProducts(profileId)
    setCache(profileId, local)
    return local
  }
  const { data, error } = await supabase
    .from('products')
    .select('data')
    .eq('profile', profileId)
    .order('added_at', { ascending: true })
  if (error) {
    console.error('listProducts', error)
    const local = getProducts(profileId)
    setCache(profileId, local)
    return local
  }
  const products = data.map((r) => r.data)
  setCache(profileId, products)
  setProducts(profileId, products)
  return products
}

export async function saveProductRow(profileId, product) {
  // Keep the cache fresh immediately so shared-user tags update without a refetch.
  const current = getCachedProducts(profileId).filter((p) => p.id !== product.id)
  setCache(profileId, [...current, product])
  if (!supabaseReady) return
  const { error } = await supabase.from('products').upsert({
    id: product.id,
    profile: profileId,
    added_at: product.addedAt,
    data: product,
  })
  if (error) console.error('saveProductRow', error)
}

// Load every profile's products once so cross-profile "also uses this" tags work.
export async function primeAllProducts() {
  if (!supabaseReady) {
    PROFILE_ORDER.forEach((pid) => setCache(pid, getProducts(pid)))
    return
  }
  const { data, error } = await supabase.from('products').select('profile, data')
  if (error) {
    console.error('primeAllProducts', error)
    PROFILE_ORDER.forEach((pid) => setCache(pid, getProducts(pid)))
    return
  }
  const byProfile = new Map(PROFILE_ORDER.map((pid) => [pid, []]))
  data.forEach((r) => {
    if (!byProfile.has(r.profile)) byProfile.set(r.profile, [])
    byProfile.get(r.profile).push(r.data)
  })
  byProfile.forEach((products, pid) => setCache(pid, products))
}

// ---------------------------------------------------------------------------
// Weekly reports
// ---------------------------------------------------------------------------
export async function listReports(profileId) {
  if (!supabaseReady) return getReports(profileId)
  const { data, error } = await supabase
    .from('reports')
    .select('data')
    .eq('profile', profileId)
    .order('generated_at', { ascending: false })
  if (error) {
    console.error('listReports', error)
    return getReports(profileId)
  }
  const reports = data.map((r) => r.data)
  setReports(profileId, reports)
  return reports
}

export async function saveReportRow(profileId, report) {
  if (!supabaseReady) return
  const { error } = await supabase.from('reports').insert({
    id: report.id,
    profile: profileId,
    generated_at: report.generatedAt,
    data: report,
  })
  if (error) console.error('saveReportRow', error)
}
