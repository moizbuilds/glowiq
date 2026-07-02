import { useMemo, useState } from 'react'
import { categoryMeta } from '../utils/products'
import Modal from './Modal'
import ProductForm from './ProductForm'

// Search + select from the profile's saved products. Selected items show as
// pill tags in the profile accent. Includes quick-add of a new product.
export default function ProductSelector({ products, selected, onChange, onQuickAdd }) {
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)

  const active = useMemo(() => products.filter((p) => !p.archived), [products])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return active
    return active.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q),
    )
  }, [active, query])

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  const selectedProducts = active.filter((p) => selected.includes(p.id))

  return (
    <div>
      {selectedProducts.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {selectedProducts.map((p) => (
            <span key={p.id} className="pill" onClick={() => toggle(p.id)} style={{ cursor: 'pointer' }}>
              {p.name} ✕
            </span>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your products…"
        style={{
          width: '100%',
          padding: '11px 13px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: '#fff',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 10 }}>
        {results.map((p) => {
          const on = selected.includes(p.id)
          const cat = categoryMeta(p.category)
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
                background: on ? 'var(--accent-tint)' : 'var(--card)',
                textAlign: 'left',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                {p.brand && (
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)' }}>{p.brand}</span>
                )}
              </span>
              <span style={{ fontSize: 16, color: on ? 'var(--accent)' : 'var(--border)' }}>{on ? '✓' : '+'}</span>
            </button>
          )
        })}

        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '11px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px dashed var(--border)',
            color: 'var(--accent)',
            fontWeight: 600,
            fontSize: 14,
            background: 'transparent',
          }}
        >
          + Quick add new product
        </button>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Quick add product">
        <ProductForm
          onSubmit={(data) => {
            const created = onQuickAdd(data)
            if (created?.id) onChange([...selected, created.id])
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
