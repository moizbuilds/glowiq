import { useEffect, useMemo, useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { useProducts } from '../hooks/useProducts'
import { primeAllProducts } from '../utils/db'
import ProductCard from '../components/ProductCard'
import ProductForm from '../components/ProductForm'
import Modal from '../components/Modal'

export default function ProductsScreen() {
  const { profile } = useProfile()
  const { products, addProduct, updateProduct, archiveProduct, restoreProduct } = useProducts(profile.id)
  const [showForm, setShowForm] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [query, setQuery] = useState('')
  const [, setPrimed] = useState(false)

  // Load every profile's products so "also uses this 🌸" tags can resolve.
  useEffect(() => {
    primeAllProducts().then(() => setPrimed(true))
  }, [products])

  const active = useMemo(() => products.filter((p) => !p.archived), [products])
  const archived = useMemo(() => products.filter((p) => p.archived), [products])

  const filtered = useMemo(() => {
    const list = showArchived ? archived : active
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q),
    )
  }, [showArchived, active, archived, query])

  return (
    <div className="screen">
      <h1>Products 🧴</h1>
      <p className="muted" style={{ marginTop: 4, fontSize: 14 }}>{profile.name}'s routine</p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        style={{
          width: '100%',
          marginTop: 16,
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: '#fff',
          outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button
          onClick={() => setShowArchived(false)}
          style={tabStyle(!showArchived)}
        >
          Active ({active.length})
        </button>
        <button
          onClick={() => setShowArchived(true)}
          style={tabStyle(showArchived)}
        >
          Archived ({archived.length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        {filtered.length === 0 ? (
          <EmptyState showArchived={showArchived} onAdd={() => setShowForm(true)} />
        ) : (
          filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              profileId={profile.id}
              onRate={(id, rating) => updateProduct(id, { rating })}
              onArchive={archiveProduct}
              onRestore={restoreProduct}
            />
          ))
        )}
      </div>

      {/* Add button lives at the bottom so it never sits under the profile pill. */}
      <button
        className="btn-primary"
        onClick={() => setShowForm(true)}
        style={{ marginTop: 22 }}
      >
        + Add a product 🧴
      </button>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add a product">
        <ProductForm
          onSubmit={(data) => {
            addProduct(data)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      </Modal>
    </div>
  )
}

function tabStyle(active) {
  return {
    flex: 1,
    padding: '9px 0',
    borderRadius: 999,
    fontSize: 13.5,
    fontWeight: 600,
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-tint)' : 'transparent',
    border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
    transition: 'all 0.15s ease',
  }
}

function EmptyState({ showArchived, onAdd }) {
  if (showArchived) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: 34 }}>🗄️</div>
        <p style={{ marginTop: 10 }}>No archived products.</p>
      </div>
    )
  }
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 38 }}>🧴</div>
      <p style={{ marginTop: 10, color: 'var(--text-secondary)' }}>
        No products yet. Add the items in your routine so Claude can correlate them with your skin.
      </p>
      <button className="btn-ghost" onClick={onAdd} style={{ marginTop: 16, maxWidth: 220, marginInline: 'auto' }}>
        + Add your first product
      </button>
    </div>
  )
}
