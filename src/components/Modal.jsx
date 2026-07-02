import { useEffect } from 'react'

// Bottom-sheet style modal, mobile-first. Backdrop tap closes.
export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(20,20,20,0.42)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeUp 0.2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--card)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          padding: '20px 20px calc(24px + env(safe-area-inset-bottom))',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
          animation: 'sheetUp 0.28s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <span style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--border)' }} />
        </div>
        {title && <h2 style={{ fontSize: 19, marginBottom: 16 }}>{title}</h2>}
        {children}
      </div>
      <style>{`@keyframes sheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
