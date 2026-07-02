import { useRef, useState } from 'react'
import AlignmentGuide from './AlignmentGuide'
import { compressImage } from '../../utils/image'

// STEP 2 — alignment guide. Uses the device camera (capture="user") with an
// oval overlay; once a file is chosen it is compressed and handed back.
export default function PhotoCapture({ onCaptured, onCancel }) {
  const cameraRef = useRef(null)
  const libraryRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const dataUrl = await compressImage(file)
      onCaptured(dataUrl)
    } catch (err) {
      setError(err.message || 'Could not use that photo. Please try again.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <div style={{ padding: '24px 20px calc(120px + env(safe-area-inset-bottom))' }} className="fade-in">
      <button onClick={onCancel} style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 23, marginTop: 14 }}>Align your face here</h1>
      <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>Fill the oval with your face.</p>

      <div
        className="card"
        style={{ marginTop: 18, padding: 10, background: '#f3f3f1', overflow: 'hidden' }}
      >
        <AlignmentGuide>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'var(--radius-sm)',
              background:
                'repeating-linear-gradient(135deg,#ededeb,#ededeb 14px,#e6e6e3 14px,#e6e6e3 28px)',
            }}
          />
        </AlignmentGuide>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
          Look straight at the camera · centre dot on your nose
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(232,116,59,0.10)',
            color: '#c45a26',
            fontSize: 13.5,
          }}
        >
          {error}
        </div>
      )}

      {/* Camera input — opens the device camera on phones. */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      {/* Library input — no capture attribute, so it opens the photo gallery / file picker. */}
      <input
        ref={libraryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 520,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '14px 20px calc(16px + env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
        }}
      >
        <button className="btn-primary" disabled={busy} onClick={() => cameraRef.current?.click()}>
          {busy ? 'Processing…' : 'Take Photo 📸'}
        </button>
        <button
          disabled={busy}
          onClick={() => libraryRef.current?.click()}
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 600,
            fontSize: 15,
            border: '1.5px solid var(--accent)',
            background: 'transparent',
            color: 'var(--accent)',
          }}
        >
          Choose from Library 🖼️
        </button>
      </div>
    </div>
  )
}
