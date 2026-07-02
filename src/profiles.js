// Single source of truth for the three GlowIQ profiles.
// Every colour, greeting, emoji and storage prefix lives here.

export const PROFILES = {
  maryam: {
    id: 'maryam',
    name: 'Maryam',
    role: 'Wife',
    emoji: '🌸',
    accent: '#4a6fa5',
    accentSoft: '#9b72cf',
    themeClass: 'theme-maryam',
    prefix: 'glowiq_maryam_',
    greeting: 'Good morning Maryam 🌸',
    alsoUsesTag: 'Maryam also uses this 🌸',
    weeklyOpening:
      "Here's your weekly skin report Maryam 🌸 Your skin has been on a journey this week.",
  },
  aneesa: {
    id: 'aneesa',
    name: 'Aneesa',
    role: 'Sister in Law',
    emoji: '🌿',
    accent: '#7a9e7e',
    accentSoft: '#a8c5a0',
    themeClass: 'theme-aneesa',
    prefix: 'glowiq_aneesa_',
    greeting: 'Good morning Aneesa 🌿',
    alsoUsesTag: 'Aneesa also uses this 🌿',
    weeklyOpening:
      "Aneesa's weekly glow report is ready 🌿 Here's what your skin has been telling us.",
  },
  mama: {
    id: 'mama',
    name: 'Mama',
    role: 'Mama',
    emoji: '❤️',
    accent: '#c0392b',
    accentSoft: '#e8a0b4',
    themeClass: 'theme-mama',
    prefix: 'glowiq_mama_',
    greeting: 'Good morning Mama ❤️',
    alsoUsesTag: 'Mama also uses this ❤️',
    weeklyOpening:
      "Mama's weekly skin review ❤️ Your consistency this week has been beautiful to track.",
  },
}

export const PROFILE_ORDER = ['maryam', 'aneesa', 'mama']

export function getProfile(id) {
  return PROFILES[id] || null
}
