// 1–5 star rating tinted in the profile accent. Read-only when onChange omitted.
export default function StarRating({ value = 0, onChange, size = 20 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value
        return (
          <span
            key={n}
            role={onChange ? 'button' : undefined}
            onClick={onChange ? () => onChange(n === value ? 0 : n) : undefined}
            style={{
              fontSize: size,
              lineHeight: 1,
              cursor: onChange ? 'pointer' : 'default',
              color: filled ? 'var(--accent)' : 'var(--border)',
              transition: 'color 0.15s ease, transform 0.1s ease',
            }}
          >
            {filled ? '★' : '☆'}
          </span>
        )
      })}
    </span>
  )
}
