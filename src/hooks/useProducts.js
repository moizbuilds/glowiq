import { useCallback, useEffect, useState } from 'react'
import { listProducts, saveProductRow } from '../utils/db'
import { newProductId } from '../utils/products'

// Reactive access to the active profile's product list. Writes update local
// state optimistically and persist to Supabase in the background.
export function useProducts(profileId) {
  const [products, setList] = useState([])

  useEffect(() => {
    let active = true
    listProducts(profileId).then((rows) => {
      if (active) setList(rows)
    })
    return () => {
      active = false
    }
  }, [profileId])

  // Returns the created product synchronously (callers use created.id).
  const addProduct = useCallback(
    ({ name, brand, category, schedule }) => {
      const product = {
        id: newProductId(),
        name: name.trim(),
        brand: (brand || '').trim(),
        category: category || 'other',
        schedule: schedule || 'Both',
        rating: 0,
        assessment: 'neutral', // 'helping' | 'neutral' | 'watch'
        archived: false,
        addedAt: new Date().toISOString(),
      }
      setList((prev) => [...prev, product])
      saveProductRow(profileId, product)
      return product
    },
    [profileId],
  )

  const updateProduct = useCallback(
    (id, patch) => {
      setList((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
        const changed = next.find((p) => p.id === id)
        if (changed) saveProductRow(profileId, changed)
        return next
      })
    },
    [profileId],
  )

  const archiveProduct = useCallback(
    (id) => updateProduct(id, { archived: true }),
    [updateProduct],
  )

  const restoreProduct = useCallback(
    (id) => updateProduct(id, { archived: false }),
    [updateProduct],
  )

  return { products, addProduct, updateProduct, archiveProduct, restoreProduct }
}
