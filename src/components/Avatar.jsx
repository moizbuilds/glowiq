// Soft, illustrated avatar rendered purely from the profile's accent colours.
// No photographs, no clip-art, no cats — just a calm gradient face silhouette.

export default function Avatar({ profile, size = 64 }) {
  const id = `av-${profile.id}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bg`} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor={profile.accentSoft} />
          <stop offset="100%" stopColor={profile.accent} />
        </radialGradient>
        <linearGradient id={`${id}-face`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}-bg)`} />
      {/* shoulders */}
      <path
        d="M22 96 C22 74 36 66 50 66 C64 66 78 74 78 96 Z"
        fill={`url(#${id}-face)`}
        opacity="0.92"
      />
      {/* head */}
      <circle cx="50" cy="42" r="19" fill={`url(#${id}-face)`} />
      {/* soft cheek glow in accent */}
      <circle cx="43" cy="46" r="3.4" fill={profile.accentSoft} opacity="0.45" />
      <circle cx="57" cy="46" r="3.4" fill={profile.accentSoft} opacity="0.45" />
    </svg>
  )
}
