import { useState, useEffect, useRef } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { ActivityId, ActivityMeta } from './types'
import { ACTIVITIES } from './data/activities'
import { recordActivityCompletion } from './services/storage'
import { resetMistakes } from './services/sessionStats'
import { sound } from './services/sound'
import { speech } from './services/speech'
import { Header } from './components/Header'
import { ActivityCard } from './components/ActivityCard'

// Import Primera Tanda (1-10)
import { ShoppingList } from './activities/ShoppingList'
import { MemoryPairs } from './activities/MemoryPairs'
import { Sayings } from './activities/Sayings'
import { SpotObject } from './activities/SpotObject'
import { OddOneOut } from './activities/OddOneOut'
import { WhereWasIt } from './activities/WhereWasIt'
import { SweetPiano } from './activities/SweetPiano'
import { StepOrder } from './activities/StepOrder'
import { FacesAndNames } from './activities/FacesAndNames'
import { DailyCoins } from './activities/DailyCoins'

// Import Segunda Tanda (11-20)
import { ShellGame } from './activities/ShellGame'
import { WallClock } from './activities/WallClock'
import { PopularSongs } from './activities/PopularSongs'
import { PackSuitcase } from './activities/PackSuitcase'
import { HomePhone } from './activities/HomePhone'
import { FourSeasons } from './activities/FourSeasons'
import { DominoMatch } from './activities/DominoMatch'
import { SpainJourney } from './activities/SpainJourney'
import { SyllableWords } from './activities/SyllableWords'
import { TidyHome } from './activities/TidyHome'
import { CaceresTierra } from './activities/CaceresTierra'

const LAST_HOME_GAMES_KEY = 'memoria_viva_last_home_games'

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Always keep 'caceres-tierra' first (#1) and rotate the remaining 9 games every time the app opens
function pickRandomActivities(count = 10): ActivityMeta[] {
  const pinned = ACTIVITIES.find((a) => a.id === 'caceres-tierra')
  const pool = ACTIVITIES.filter((a) => a.id !== 'caceres-tierra')
  const needed = pinned ? count - 1 : count

  let lastIds: string[] = []
  try {
    const raw = localStorage.getItem(LAST_HOME_GAMES_KEY)
    if (raw) lastIds = JSON.parse(raw)
  } catch {
    // ignore storage errors
  }

  // Prioritize games that were NOT shown on the previous open so every open feels genuinely different
  const freshPool = shuffleArray(pool.filter((a) => !lastIds.includes(a.id)))
  const prevPool = shuffleArray(pool.filter((a) => lastIds.includes(a.id)))
  const pickedRest = shuffleArray([...freshPool, ...prevPool].slice(0, needed))

  try {
    localStorage.setItem(
      LAST_HOME_GAMES_KEY,
      JSON.stringify(pickedRest.map((a) => a.id)),
    )
  } catch {
    // ignore storage errors
  }

  return pinned ? [pinned, ...pickedRest] : pickedRest
}

function getActivityMaxWidth(id: ActivityId | null): string {
  switch (id) {
    case 'faces-and-names':
    case 'odd-one-out':
    case 'sayings':
    case 'spot-object':
    case 'step-order':
    case 'sweet-piano':
      return 'max-w-2xl'
    case 'memory-pairs':
    case 'where-was-it':
      return 'max-w-2xl sm:max-w-3xl'
    case 'shopping-list':
      return 'max-w-3xl'
    default:
      return 'max-w-4xl'
  }
}

export function App() {
  const params = new URLSearchParams(window.location.search)
  const initialActivity = (params.get('activity') as ActivityId) || null
  const [currentActivity, setCurrentActivity] = useState<ActivityId | null>(initialActivity)
  const [dailyActivities, setDailyActivities] = useState<ActivityMeta[]>(() =>
    pickRandomActivities(10),
  )
  const currentActivityRef = useRef<ActivityId | null>(initialActivity)
  currentActivityRef.current = currentActivity

  // Refresh the 9 accompanying games whenever the app is reopened from background / BFCache on mobile
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted && !currentActivityRef.current) {
        setDailyActivities(pickRandomActivities(10))
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !currentActivityRef.current) {
        setDailyActivities(pickRandomActivities(10))
      }
    }

    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleSelectActivity = (id: ActivityId) => {
    resetMistakes()
    setCurrentActivity(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCompleteActivity = (id: ActivityId) => {
    recordActivityCompletion(id, 1)
  }

  const handleBackToMenu = () => {
    sound.playTap()
    speech.stop()
    setCurrentActivity(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeActivityMeta = ACTIVITIES.find((a) => a.id === currentActivity)

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FDFBF7] text-stone-900 overflow-hidden select-none">
      {/* Compact Top Title Header */}
      <Header
        title={activeActivityMeta ? activeActivityMeta.title : undefined}
        subtitle={activeActivityMeta ? activeActivityMeta.subtitle : undefined}
      />

      {/* Main Container - 100% full height zero-scroll on mobile, tightly fitted with minimal empty gaps */}
      <main
        className={`flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full px-2 sm:px-6 overflow-hidden sm:overflow-y-auto ${
          currentActivity ? 'pt-1 pb-1 sm:pt-2 sm:pb-1.5' : 'py-1.5 sm:py-4'
        }`}
      >
        {!currentActivity ? (
          /* Catalog View - Super Clean, 100% full screen on mobile without scroll */
          <div className="flex-1 flex flex-col min-h-0 gap-2 sm:gap-3 overflow-hidden">
            {/* Direct Greeting Banner */}
            <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-emerald-50 rounded-xl sm:rounded-3xl py-2 px-3 sm:p-4 border-2 sm:border-3 border-amber-300 shadow-xs sm:shadow-md flex items-center justify-center text-center shrink-0">
              <h2 className="text-lg sm:text-3xl md:text-4xl font-black text-stone-950 leading-tight">
                ¿A qué jugamos hoy? 🌸
              </h2>
            </div>

            {/* Activities Grid - 2 columns, 5 rows, fills available screen space with 10 random games */}
            <div className="grid grid-cols-2 grid-rows-5 gap-2 sm:gap-3.5 flex-1 min-h-0 w-full">
              {dailyActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onSelect={() => handleSelectActivity(activity.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Active Activity View - Fills viewport with zero scroll */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full h-full">
            {currentActivity === 'shopping-list' && (
              <ShoppingList
                onComplete={() => handleCompleteActivity('shopping-list')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'memory-pairs' && (
              <MemoryPairs
                onComplete={() => handleCompleteActivity('memory-pairs')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'sayings' && (
              <Sayings
                onComplete={() => handleCompleteActivity('sayings')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'spot-object' && (
              <SpotObject
                onComplete={() => handleCompleteActivity('spot-object')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'odd-one-out' && (
              <OddOneOut
                onComplete={() => handleCompleteActivity('odd-one-out')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'where-was-it' && (
              <WhereWasIt
                onComplete={() => handleCompleteActivity('where-was-it')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'sweet-piano' && (
              <SweetPiano
                onComplete={() => handleCompleteActivity('sweet-piano')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'step-order' && (
              <StepOrder
                onComplete={() => handleCompleteActivity('step-order')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'faces-and-names' && (
              <FacesAndNames
                onComplete={() => handleCompleteActivity('faces-and-names')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'daily-coins' && (
              <DailyCoins
                onComplete={() => handleCompleteActivity('daily-coins')}
                onExit={handleBackToMenu}
              />
            )}

            {/* Segunda Tanda (11-20) */}
            {currentActivity === 'shell-game' && (
              <ShellGame
                onComplete={() => handleCompleteActivity('shell-game')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'wall-clock' && (
              <WallClock
                onComplete={() => handleCompleteActivity('wall-clock')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'popular-songs' && (
              <PopularSongs
                onComplete={() => handleCompleteActivity('popular-songs')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'pack-suitcase' && (
              <PackSuitcase
                onComplete={() => handleCompleteActivity('pack-suitcase')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'home-phone' && (
              <HomePhone
                onComplete={() => handleCompleteActivity('home-phone')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'four-seasons' && (
              <FourSeasons
                onComplete={() => handleCompleteActivity('four-seasons')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'domino-match' && (
              <DominoMatch
                onComplete={() => handleCompleteActivity('domino-match')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'spain-journey' && (
              <SpainJourney
                onComplete={() => handleCompleteActivity('spain-journey')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'syllable-words' && (
              <SyllableWords
                onComplete={() => handleCompleteActivity('syllable-words')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'tidy-home' && (
              <TidyHome
                onComplete={() => handleCompleteActivity('tidy-home')}
                onExit={handleBackToMenu}
              />
            )}
            {currentActivity === 'caceres-tierra' && (
              <CaceresTierra
                onComplete={() => handleCompleteActivity('caceres-tierra')}
                onExit={handleBackToMenu}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Back Button Bar — aligned with active game width, zero empty side gaps */}
      {currentActivity && (
        <footer className="shrink-0 z-30 bg-[#FDFBF7] px-2.5 sm:px-6 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pt-1.5 sm:pb-3">
          <div className="max-w-4xl mx-auto w-full">
            <div className={`${getActivityMaxWidth(currentActivity)} mx-auto w-full px-0.5`}>
              <button
                onClick={handleBackToMenu}
                className="animate-back-glow w-full flex items-center justify-center gap-2 sm:gap-3 px-5 py-2 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xl sm:text-2xl border-2 sm:border-3 border-red-700 transition-colors cursor-pointer min-h-[48px] sm:min-h-[56px]"
                aria-label="Volver al menú principal"
              >
                <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[3]" />
                <span>Volver</span>
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
