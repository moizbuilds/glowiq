import confetti from 'canvas-confetti'

// A short confetti burst in the active profile's accent colour.
export function celebrate(accent, accentSoft) {
  const colors = [accent, accentSoft || accent, '#ffffff']
  const fire = (opts) => confetti({ disableForReducedMotion: true, colors, ...opts })

  fire({ particleCount: 120, spread: 75, origin: { y: 0.6 }, startVelocity: 45 })
  setTimeout(() => fire({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.65 } }), 150)
  setTimeout(() => fire({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.65 } }), 300)
}

export const STREAK_MILESTONES = [7, 30, 90]

export function milestoneMessage(streak, name) {
  if (streak === 7) return `One week straight, ${name}! 🔥 Your consistency is showing.`
  if (streak === 30) return `30 days, ${name}! 🌟 A full month of caring for your skin.`
  if (streak === 90) return `90 days, ${name}! 👑 This is a real habit now — incredible.`
  return `${streak}-day streak, ${name}! Keep glowing ✨`
}
