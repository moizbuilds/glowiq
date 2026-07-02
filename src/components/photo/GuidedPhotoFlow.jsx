import { useState } from 'react'
import PhotoChecklist from './PhotoChecklist'
import PhotoCapture from './PhotoCapture'
import PhotoReview from './PhotoReview'

// Orchestrates the 3-step guided capture: checklist → align → review.
// Renders as a full-screen overlay above the daily log.
export default function GuidedPhotoFlow({ tip, yesterdayPhoto, onDone, onCancel }) {
  const [stage, setStage] = useState('checklist') // checklist | capture | review
  const [photo, setPhoto] = useState(null)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 90,
        background: 'var(--bg)',
        maxWidth: 520,
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      {stage === 'checklist' && (
        <PhotoChecklist
          tip={tip}
          yesterdayPhoto={yesterdayPhoto}
          onReady={() => setStage('capture')}
          onCancel={onCancel}
        />
      )}
      {stage === 'capture' && (
        <PhotoCapture
          onCaptured={(p) => {
            setPhoto(p)
            setStage('review')
          }}
          onCancel={() => setStage('checklist')}
        />
      )}
      {stage === 'review' && (
        <PhotoReview
          todayPhoto={photo}
          yesterdayPhoto={yesterdayPhoto}
          onAccept={() => onDone(photo)}
          onRetake={() => setStage('capture')}
        />
      )}
    </div>
  )
}
