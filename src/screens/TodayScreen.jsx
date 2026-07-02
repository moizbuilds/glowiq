import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { useLogs } from '../hooks/useLogs'
import { useProducts } from '../hooks/useProducts'
import { computeStreak, todayKey } from '../utils/dates'
import { tipForDay } from '../utils/tips'
import { analyzeSkin } from '../utils/claude'
import { celebrate, STREAK_MILESTONES, milestoneMessage } from '../utils/celebrate'
import { getMeta, setMeta } from '../utils/storage'
import GuidedPhotoFlow from '../components/photo/GuidedPhotoFlow'
import ProductSelector from '../components/ProductSelector'
import SkinFeelPicker from '../components/SkinFeelPicker'
import AnalysisCard from '../components/AnalysisCard'

export default function TodayScreen() {
  const { profile } = useProfile()
  const { logs, todaysLog, lastPhotoLog, saveLog } = useLogs(profile.id)
  const { products, addProduct } = useProducts(profile.id)

  const [showPhotoFlow, setShowPhotoFlow] = useState(false)
  const [draft, setDraft] = useState(null) // { photo, period, products[], skinFeel, note }
  const [analysing, setAnalysing] = useState(false)
  const [error, setError] = useState(null)
  const [celebration, setCelebration] = useState(null) // milestone toast text
  const streak = computeStreak(logs)

  // Fire confetti once when a streak milestone is first reached.
  const maybeCelebrate = () => {
    const wasLoggedToday = logs.some((l) => l.day === todayKey())
    const projected = wasLoggedToday ? logs : [...logs, { day: todayKey() }]
    const newStreak = computeStreak(projected)
    if (!STREAK_MILESTONES.includes(newStreak)) return
    const meta = getMeta(profile.id)
    const celebrated = meta.celebratedStreaks || []
    if (celebrated.includes(newStreak)) return
    celebrate(profile.accent, profile.accentSoft)
    setCelebration(milestoneMessage(newStreak, profile.name))
    setMeta(profile.id, { ...meta, celebratedStreaks: [...celebrated, newStreak] })
    setTimeout(() => setCelebration(null), 6000)
  }

  const startLog = () => setShowPhotoFlow(true)

  const onPhotoDone = (photo) => {
    setShowPhotoFlow(false)
    setDraft({
      photo,
      period: 'AM',
      products: [],
      skinFeel: null,
      note: '',
    })
  }

  const updateDraft = (patch) => setDraft((d) => ({ ...d, ...patch }))

  const handleAnalyse = async () => {
    setError(null)
    setAnalysing(true)
    const todayLog = { day: todayKey(), ...draft }
    try {
      const analysis = await analyzeSkin({
        profile,
        todayLog,
        yesterdayPhoto: lastPhotoLog?.photo || null,
        logs,
        products,
      })
      // Persist the log together with the analysis it produced.
      maybeCelebrate()
      saveLog({ ...todayLog, analysis })
      setDraft(null)
    } catch (err) {
      setError(err.message || 'Something went wrong analysing your skin.')
    } finally {
      setAnalysing(false)
    }
  }

  return (
    <div className="screen">
      <h1 style={{ fontSize: 25 }}>{profile.greeting}</h1>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          fontSize: 14,
          fontWeight: 700,
          color: 'var(--accent)',
          background: 'var(--accent-tint)',
          padding: '6px 13px',
          borderRadius: 999,
        }}
      >
        Day {streak} streak 🔥
      </div>

      {celebration && (
        <div
          className="card fade-in"
          style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'var(--accent-tint-strong)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            fontWeight: 700,
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          {celebration}
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{
            marginTop: 16,
            padding: 14,
            border: '1px solid #e0b4b4',
            background: '#fdf0f0',
            color: '#9a3b3b',
            fontSize: 13.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {error}
        </div>
      )}

      {/* If a draft is in progress, show the log form */}
      {draft ? (
        <LogForm
          profile={profile}
          draft={draft}
          products={products}
          analysing={analysing}
          onUpdate={updateDraft}
          onQuickAdd={addProduct}
          onAnalyse={handleAnalyse}
          onDiscard={() => setDraft(null)}
        />
      ) : todaysLog ? (
        <LoggedToday profile={profile} log={todaysLog} onRelog={startLog} />
      ) : (
        <NotLoggedYet profile={profile} onStart={startLog} />
      )}

      {showPhotoFlow && (
        <GuidedPhotoFlow
          tip={tipForDay(logs.length)}
          yesterdayPhoto={lastPhotoLog?.photo || null}
          onDone={onPhotoDone}
          onCancel={() => setShowPhotoFlow(false)}
        />
      )}
    </div>
  )
}

function NotLoggedYet({ profile, onStart }) {
  return (
    <div className="card" style={{ marginTop: 22, padding: 22, textAlign: 'center' }}>
      <div style={{ fontSize: 40 }}>📸</div>
      <h3 style={{ marginTop: 10, fontSize: 18 }}>Ready to log today?</h3>
      <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
        We’ll guide you through a consistent photo, then capture your routine and skin feel.
      </p>
      <button className="btn-primary" onClick={onStart} style={{ marginTop: 18 }}>
        Log Today 📸
      </button>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
        You haven’t logged today yet {profile.name} — your skin data is waiting ✨
      </p>
    </div>
  )
}

function LoggedToday({ profile, log, onRelog }) {
  return (
    <>
      <div className="card" style={{ marginTop: 22, padding: 18 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          {log.photo && (
            <img
              src={log.photo}
              alt="Today"
              style={{ width: 86, height: 110, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>✅ Logged today</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              {log.period} · {log.skinFeel ? capitalize(log.skinFeel) : 'No skin feel set'}
            </div>
            {!log.analysis && (
              <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>Saved — analysis pending.</div>
            )}
          </div>
        </div>
        <button className="btn-ghost" onClick={onRelog} style={{ marginTop: 14 }}>
          Re-take today’s photo
        </button>
      </div>

      {log.analysis && <AnalysisCard analysis={log.analysis} profile={profile} />}
    </>
  )
}

function LogForm({ profile, draft, products, analysing, onUpdate, onQuickAdd, onAnalyse, onDiscard }) {
  return (
    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <img
          src={draft.photo}
          alt="Today"
          style={{ width: '100%', borderRadius: 'var(--radius)', display: 'block' }}
        />
      </div>

      <Section title="Morning or evening?">
        <div style={{ display: 'flex', gap: 8 }}>
          {['AM', 'PM'].map((p) => {
            const active = draft.period === p
            return (
              <button
                key={p}
                onClick={() => onUpdate({ period: p })}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? '#fff' : 'var(--text)',
                }}
              >
                {p === 'AM' ? '🌅 Morning' : '🌙 Evening'}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Products used">
        <ProductSelector
          products={products}
          selected={draft.products}
          onChange={(ids) => onUpdate({ products: ids })}
          onQuickAdd={onQuickAdd}
        />
      </Section>

      <Section title="Skin feel today">
        <SkinFeelPicker value={draft.skinFeel} onChange={(v) => onUpdate({ skinFeel: v })} />
      </Section>

      <Section title="Note (optional)">
        <textarea
          value={draft.note}
          onChange={(e) => onUpdate({ note: e.target.value })}
          placeholder="Anything you noticed today…"
          rows={3}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: '#fff',
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </Section>

      <div>
        {analysing ? (
          <div
            className="card"
            style={{
              padding: 22,
              textAlign: 'center',
              animation: 'pulseGlow 1.6s ease-in-out infinite',
            }}
          >
            <div style={{ fontSize: 32 }}>✨</div>
            <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15 }}>
              Analysing your skin {profile.name}…
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
              Comparing today’s photo with your recent progress.
            </div>
          </div>
        ) : (
          <>
            <button className="btn-primary" onClick={onAnalyse} disabled={!draft.photo}>
              Analyse My Skin Today ✨
            </button>
            <button
              onClick={onDiscard}
              style={{ width: '100%', marginTop: 10, fontSize: 13.5, color: 'var(--text-secondary)', fontWeight: 600, padding: 8 }}
            >
              Discard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 style={{ fontSize: 15, marginBottom: 10 }}>{title}</h3>
      {children}
    </div>
  )
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}
