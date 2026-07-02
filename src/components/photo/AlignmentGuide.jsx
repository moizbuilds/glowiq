// Reusable oval face-alignment overlay (centre dot + corner markers).
// Drawn in the profile accent via currentColor on the wrapping element.
export default function AlignmentGuide({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', color: 'var(--accent)' }}>
      {children}
      <svg
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        {/* oval face outline */}
        <ellipse
          cx="150"
          cy="180"
          rx="92"
          ry="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="8 7"
          opacity="0.9"
        />
        {/* centre dot */}
        <circle cx="150" cy="180" r="4" fill="currentColor" />
        <circle cx="150" cy="180" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
        {/* corner markers */}
        {[
          [16, 16, 1, 1],
          [284, 16, -1, 1],
          [16, 384, 1, -1],
          [284, 384, -1, -1],
        ].map(([x, y, sx, sy], i) => (
          <path
            key={i}
            d={`M ${x} ${y + sy * 26} L ${x} ${y} L ${x + sx * 26} ${y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
        ))}
      </svg>
    </div>
  )
}
