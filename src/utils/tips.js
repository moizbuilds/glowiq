// Rotating photo-consistency tip shown during the guided capture flow.
// Days 1–5 are fixed teaching moments; day 7+ rotates randomly.
const FIXED = {
  1: 'Consistency is everything — same time, same light, same angle makes AI comparison accurate',
  2: 'Morning photos work best — your skin tells the truth before products',
  3: 'Bad lighting = inaccurate analysis. Move closer to your window',
  4: 'Even small angle changes affect accuracy — the AI compares pixel by pixel',
  5: "You're building a skin data set. Consistency = powerful insights",
}

const POOL = [
  FIXED[1], FIXED[2], FIXED[3], FIXED[4], FIXED[5],
  'Cloudy days give the softest, most even light — great for photos',
  'Prop your phone at the same height each day for a true comparison',
  'Hold your breath for a second to keep the shot sharp',
]

// logCount = how many logs the profile already has (so day = logCount + 1).
export function tipForDay(logCount) {
  const day = (logCount || 0) + 1
  if (FIXED[day]) return FIXED[day]
  return POOL[Math.floor(Math.random() * POOL.length)]
}
