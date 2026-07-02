import StarRating from './StarRating'
import { categoryMeta, daysUsed, findSharedUsers } from '../utils/products'

const ASSESSMENTS = {
  helping: { label: 'Helping', icon: '✅', color: '#3aa675', bg: 'rgba(58,166,117,0.10)' },
  neutral: { label: 'Neutral', icon: '➡️', color: '#888888', bg: 'rgba(136,136,136,0.10)' },
  watch: { label: 'Watch this', icon: '⚠️', color: '#e8743b', bg: 'rgba(232,116,59,0.12)' },
}

export default function ProductCard({ product, profileId, onRate, onArchive, onRestore }) {
  const cat = categoryMeta(product.category)
  const assess = ASSESSMENTS[product.assessment] || ASSESSMENTS.neutral
  const shared = findSharedUsers(product.name, product.brand, profileId)
  const days = daysUsed(product)

  return (
    <div
      className="card"
      style={{
        padding: 16,
        opacity: product.archived ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#fff',
                background: cat.color,
                padding: '3px 9px',
                borderRadius: 999,
                letterSpacing: '0.02em',
              }}
            >
              {cat.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {product.schedule}
            </span>
          </div>
          <h3 style={{ fontSize: 16, marginTop: 8 }}>{product.name}</h3>
          {product.brand && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>{product.brand}</div>
          )}
        </div>

        <span
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 12,
            fontWeight: 700,
            color: assess.color,
            background: assess.bg,
            padding: '5px 10px',
            borderRadius: 999,
          }}
        >
          {assess.icon} {assess.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
        <StarRating value={product.rating} onChange={product.archived ? undefined : (n) => onRate(product.id, n)} />
        <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
          {days === 0 ? 'Added today' : `${days} day${days === 1 ? '' : 's'} used`}
        </span>
      </div>

      {shared.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
          {shared.map((p) => (
            <span
              key={p.id}
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: p.accent,
                background: `${p.accent}14`,
                border: `1px solid ${p.accent}33`,
                padding: '3px 9px',
                borderRadius: 999,
              }}
            >
              {p.alsoUsesTag}
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10, textAlign: 'right' }}>
        {product.archived ? (
          <button onClick={() => onRestore(product.id)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
            Restore
          </button>
        ) : (
          <button onClick={() => onArchive(product.id)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Archive
          </button>
        )}
      </div>
    </div>
  )
}
