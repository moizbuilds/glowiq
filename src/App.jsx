import { useState, lazy, Suspense } from 'react'
import { ProfileProvider, useProfile } from './context/ProfileContext'
import ProfileSelect from './screens/ProfileSelect'
import TodayScreen from './screens/TodayScreen'
import ProductsScreen from './screens/ProductsScreen'
import BottomNav from './components/BottomNav'
import ProfilePill from './components/ProfilePill'

// Timeline (Recharts) and Weekly are split into their own chunks so the
// initial load stays light — they only download when first opened.
const TimelineScreen = lazy(() => import('./screens/TimelineScreen'))
const WeeklyScreen = lazy(() => import('./screens/WeeklyScreen'))

function ScreenFallback() {
  return (
    <div className="screen">
      <div className="muted" style={{ marginTop: 40, textAlign: 'center', fontSize: 14 }}>Loading…</div>
    </div>
  )
}

function Shell() {
  const { profile, clearProfile } = useProfile()
  const [tab, setTab] = useState('today')

  if (!profile) {
    return <ProfileSelect />
  }

  return (
    <>
      <ProfilePill profile={profile} onSwitch={clearProfile} />
      <main key={tab}>
        <Suspense fallback={<ScreenFallback />}>
          {tab === 'today' && <TodayScreen />}
          {tab === 'timeline' && <TimelineScreen />}
          {tab === 'products' && <ProductsScreen />}
          {tab === 'weekly' && <WeeklyScreen />}
        </Suspense>
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </>
  )
}

export default function App() {
  return (
    <ProfileProvider>
      <Shell />
    </ProfileProvider>
  )
}
