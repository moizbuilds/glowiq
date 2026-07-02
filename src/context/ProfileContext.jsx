import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { PROFILES } from '../profiles'
import { getActiveProfile, setActiveProfile } from '../utils/storage'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [activeId, setActiveId] = useState(() => {
    const stored = getActiveProfile()
    return stored && PROFILES[stored] ? stored : null
  })

  // Apply the active profile's theme class to <body> so CSS variables cascade
  // (accent colours flow into buttons, graphs, borders, nav, confetti, etc.).
  useEffect(() => {
    const body = document.body
    Object.values(PROFILES).forEach((p) => body.classList.remove(p.themeClass))
    const meta = document.querySelector('meta[name="theme-color"]')
    if (activeId && PROFILES[activeId]) {
      body.classList.add(PROFILES[activeId].themeClass)
      if (meta) meta.setAttribute('content', PROFILES[activeId].accent)
    } else if (meta) {
      meta.setAttribute('content', '#fafaf8')
    }
  }, [activeId])

  const selectProfile = useCallback((id) => {
    if (!PROFILES[id]) return
    setActiveProfile(id)
    setActiveId(id)
  }, [])

  const clearProfile = useCallback(() => {
    setActiveProfile(null)
    setActiveId(null)
  }, [])

  const value = {
    activeId,
    profile: activeId ? PROFILES[activeId] : null,
    selectProfile,
    clearProfile,
  }

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}
