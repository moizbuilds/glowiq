import { useState } from 'react'
import { CATEGORIES, SCHEDULES } from '../utils/products'

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: '#fbfbfa',
  outline: 'none',
  marginTop: 6,
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }

// Quick add new product: Name, brand, category, AM/PM/Both.
export default function ProductForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('serum')
  const [schedule, setSchedule] = useState('Both')

  const canSave = name.trim().length > 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!canSave) return
        onSubmit({ name, brand, category, schedule })
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <label>
        <span style={labelStyle}>Product name *</span>
        <input
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Niacinamide 10% Serum"
          autoFocus
        />
      </label>

      <label>
        <span style={labelStyle}>Brand</span>
        <input
          style={inputStyle}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g. The Ordinary"
        />
      </label>

      <div>
        <span style={labelStyle}>Category</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          {CATEGORIES.map((c) => {
            const active = c.id === category
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${active ? c.color : 'var(--border)'}`,
                  color: active ? '#fff' : c.color,
                  background: active ? c.color : `${c.color}10`,
                  transition: 'all 0.15s ease',
                }}
              >
                {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <span style={labelStyle}>When used</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {SCHEDULES.map((s) => {
            const active = s === schedule
            return (
              <button
                type="button"
                key={s}
                onClick={() => setSchedule(s)}
                style={{
                  flex: 1,
                  padding: '11px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: 14,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  color: active ? '#fff' : 'var(--text)',
                  background: active ? 'var(--accent)' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button type="button" className="btn-ghost" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!canSave} style={{ flex: 1.6 }}>
          Save product
        </button>
      </div>
    </form>
  )
}
