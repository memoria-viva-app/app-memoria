import { useState, useEffect, useRef } from 'react'
import { Volume2 } from 'lucide-react'
import { sound } from '../services/sound'
import { speech } from '../services/speech'
import { SuccessCelebration } from '../components/SuccessCelebration'
import { pickRandom, GENERAL_RETRIES } from '../services/voiceFeedback'

interface Props {
  onComplete: () => void
  onExit: () => void
}

interface MelodyNote {
  freq: number
  dur: number
}

interface SongItem {
  title: string
  emoji: string
  verseStart: string
  correctWord: string
  distractors: string[]
  melody: MelodyNote[]
}

// Exact Equal-Temperament Note Frequencies (Hz)
const N = {
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  Gs4: 415.3,
  A4: 440.0,
  Bb4: 466.16,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.0,
}

// Beat length (seconds) used to build rhythms
const Q = 0.40 // negra
const E = Q / 2 // corchea
const H = Q * 2 // blanca
const DQ = Q * 1.5 // negra con puntillo

const SONG_CONGRATS = [
  '¡Muy bien! ¡Qué buena memoria musical!',
  '¡Eso es! ¡Te la sabes estupendamente!',
  '¡Bravo! ¡La has recordado muy bien!',
  '¡Excelente! ¡Qué bien cantado!',
  '¡Perfecto! ¡Te la sabes de memoria!',
  '¡Estupendo! ¡Muy bien hecho!',
]

// 7 canciones populares tradicionales de España con letras y melodías verificadas
const SONGS_POOL: SongItem[] = [
  {
    title: 'Cumpleaños Feliz',
    emoji: '🎂',
    verseStart: '«Cumpleaños feliz, cumpleaños feliz, te deseamos...»',
    correctWord: '...todos',
    distractors: ['...pocos', '...siempre', '...juntos', '...muchos'],
    melody: [
      { freq: N.G4, dur: DQ * 0.5 }, { freq: N.G4, dur: E * 0.5 }, { freq: N.A4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.C5, dur: Q }, { freq: N.B4, dur: H },
      { freq: N.G4, dur: DQ * 0.5 }, { freq: N.G4, dur: E * 0.5 }, { freq: N.A4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.D5, dur: Q }, { freq: N.C5, dur: H },
      { freq: N.G4, dur: DQ * 0.5 }, { freq: N.G4, dur: E * 0.5 }, { freq: N.G5, dur: Q }, { freq: N.E5, dur: Q }, { freq: N.C5, dur: Q }, { freq: N.B4, dur: Q }, { freq: N.A4, dur: H },
      { freq: N.F5, dur: DQ * 0.5 }, { freq: N.F5, dur: E * 0.5 }, { freq: N.E5, dur: Q }, { freq: N.C5, dur: Q }, { freq: N.D5, dur: Q }, { freq: N.C5, dur: H },
    ],
  },
  {
    title: 'Estrellita, ¿Dónde Estás?',
    emoji: '⭐',
    verseStart: '«Estrellita, ¿dónde estás? En el cielo o en el...»',
    correctWord: '...mar',
    distractors: ['...aire', '...bosque', '...viento', '...río'],
    melody: [
      { freq: N.C4, dur: Q }, { freq: N.C4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.A4, dur: Q }, { freq: N.A4, dur: Q }, { freq: N.G4, dur: H },
      { freq: N.F4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.C4, dur: H },
      { freq: N.G4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.D4, dur: H },
      { freq: N.C4, dur: Q }, { freq: N.C4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.A4, dur: Q }, { freq: N.A4, dur: Q }, { freq: N.G4, dur: H },
    ],
  },
  {
    title: 'Martinillo',
    emoji: '🔔',
    verseStart: '«Martinillo, el campanero, ¿duerme usted? ¿Duerme usted? Toca la campana: din, dan...»',
    correctWord: '...don',
    distractors: ['...dan', '...din', '...pam', '...clic'],
    melody: [
      { freq: N.C4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.C4, dur: Q },
      { freq: N.C4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.C4, dur: Q },
      { freq: N.E4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.G4, dur: H },
      { freq: N.E4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.G4, dur: H },
      { freq: N.G4, dur: E }, { freq: N.A4, dur: E }, { freq: N.G4, dur: E }, { freq: N.F4, dur: E }, { freq: N.E4, dur: Q }, { freq: N.C4, dur: Q },
      { freq: N.G4, dur: E }, { freq: N.A4, dur: E }, { freq: N.G4, dur: E }, { freq: N.F4, dur: E }, { freq: N.E4, dur: Q }, { freq: N.C4, dur: Q },
      { freq: N.C4, dur: Q }, { freq: N.G3, dur: Q }, { freq: N.C4, dur: H },
      { freq: N.C4, dur: Q }, { freq: N.G3, dur: Q }, { freq: N.C4, dur: H },
    ],
  },
  {
    title: 'La Cucaracha',
    emoji: '💃',
    verseStart: '«La cucaracha, la cucaracha, ya no puede caminar, porque no tiene, porque le falta las dos patitas de...»',
    correctWord: '...atrás',
    distractors: ['...delante', '...arriba', '...abajo', '...un lado'],
    melody: [
      { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.F4, dur: DQ }, { freq: N.A4, dur: Q },
      { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.F4, dur: DQ }, { freq: N.A4, dur: H },
      { freq: N.F4, dur: E }, { freq: N.F4, dur: E }, { freq: N.E4, dur: E }, { freq: N.E4, dur: E }, { freq: N.D4, dur: E }, { freq: N.D4, dur: E }, { freq: N.C4, dur: H },
      { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.E4, dur: DQ }, { freq: N.G4, dur: Q },
      { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.C4, dur: E * 0.7 }, { freq: N.E4, dur: DQ }, { freq: N.G4, dur: H },
      { freq: N.C5, dur: E }, { freq: N.D5, dur: E }, { freq: N.C5, dur: E }, { freq: N.Bb4, dur: E }, { freq: N.A4, dur: E }, { freq: N.G4, dur: E }, { freq: N.F4, dur: H },
    ],
  },
  {
    title: 'Himno de la Alegría',
    emoji: '🎶',
    verseStart: '«Escucha, hermano, la canción de la alegría, el canto alegre del que espera un nuevo...»',
    correctWord: '...día',
    distractors: ['...año', '...amor', '...sol', '...mes'],
    melody: [
      { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.G4, dur: Q },
      { freq: N.G4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.D4, dur: Q },
      { freq: N.C4, dur: Q }, { freq: N.C4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.E4, dur: Q },
      { freq: N.E4, dur: DQ }, { freq: N.D4, dur: E }, { freq: N.D4, dur: H },
      { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.G4, dur: Q },
      { freq: N.G4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.D4, dur: Q },
      { freq: N.C4, dur: Q }, { freq: N.C4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.E4, dur: Q },
      { freq: N.D4, dur: DQ }, { freq: N.C4, dur: E }, { freq: N.C4, dur: H },
    ],
  },
  {
    title: 'Noche de Paz',
    emoji: '🌟',
    verseStart: '«Noche de paz, noche de amor, todo duerme en...»',
    correctWord: '...derredor',
    distractors: ['...el salón', '...la ciudad', '...el rincón', '...su interior'],
    melody: [
      { freq: N.G4, dur: DQ }, { freq: N.A4, dur: E }, { freq: N.G4, dur: Q }, { freq: N.E4, dur: DQ * 2 },
      { freq: N.G4, dur: DQ }, { freq: N.A4, dur: E }, { freq: N.G4, dur: Q }, { freq: N.E4, dur: DQ * 2 },
      { freq: N.D5, dur: H }, { freq: N.D5, dur: Q }, { freq: N.B4, dur: DQ * 2 },
      { freq: N.C5, dur: H }, { freq: N.C5, dur: Q }, { freq: N.G4, dur: DQ * 2 },
    ],
  },
  {
    title: 'Dulce Navidad',
    emoji: '🎄',
    verseStart: '«Navidad, Navidad, dulce Navidad, la alegría de este día hay que...»',
    correctWord: '...celebrar',
    distractors: ['...olvidar', '...empezar', '...descansar', '...dibujar'],
    melody: [
      { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: H },
      { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: H },
      { freq: N.E4, dur: Q }, { freq: N.G4, dur: Q }, { freq: N.C4, dur: DQ }, { freq: N.D4, dur: E }, { freq: N.E4, dur: H * 1.5 },
      { freq: N.F4, dur: Q }, { freq: N.F4, dur: Q }, { freq: N.F4, dur: DQ }, { freq: N.F4, dur: E },
      { freq: N.F4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: Q }, { freq: N.E4, dur: E }, { freq: N.E4, dur: E },
      { freq: N.E4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.D4, dur: Q }, { freq: N.E4, dur: Q },
      { freq: N.D4, dur: H }, { freq: N.G4, dur: H },
    ],
  },
]

const ROUND_OPTION_COUNTS = [2, 3, 4, 4]

// Builds a 4-song session; all songs in the pool now have verified music
function buildSession(): SongItem[] {
  return [...SONGS_POOL].sort(() => 0.5 - Math.random()).slice(0, 4)
}

export function PopularSongs({ onComplete, onExit }: Props) {
  const [roundIdx, setRoundIdx] = useState(0)
  const [sessionSongs, setSessionSongs] = useState<SongItem[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null)
  const [isPlayingMelody, setIsPlayingMelody] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const isAdvancingRef = useRef(false)
  const timersRef = useRef<number[]>([])
  const melodyEndTimeRef = useRef<number>(0)
  const promptTimerRef = useRef<number | null>(null)

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current)
      promptTimerRef.current = null
    }
    sound.stopMelody()
    melodyEndTimeRef.current = 0
  }

  const initSession = () => {
    clearAllTimers()
    setSessionSongs(buildSession())
    setRoundIdx(0)
    setIsSuccess(false)
  }

  useEffect(() => {
    initSession()
    return () => {
      clearAllTimers()
      speech.stop()
      sound.stopMelody()
    }
  }, [])

  useEffect(() => {
    if (sessionSongs.length === 0) return
    clearAllTimers()
    const current = sessionSongs[roundIdx] || sessionSongs[0]
    const optCount = ROUND_OPTION_COUNTS[roundIdx] || 2
    const pickedDistractors = [...current.distractors]
      .sort(() => 0.5 - Math.random())
      .slice(0, optCount - 1)
    const allOpts = [current.correctWord, ...pickedDistractors].sort(() => 0.5 - Math.random())

    setOptions(allOpts)
    setSelectedOpt(null)
    setFeedback('')
    setIsPlayingMelody(false)
    isAdvancingRef.current = false

    const t1 = window.setTimeout(() => {
      // Play the full recognizable melody of the song
      setIsPlayingMelody(true)
      const melodyMs = sound.playMelody(current.melody)
      melodyEndTimeRef.current = Date.now() + melodyMs

      const tMelodyEnd = window.setTimeout(() => {
        setIsPlayingMelody(false)
      }, melodyMs)
      timersRef.current.push(tMelodyEnd)
    }, 200)
    timersRef.current.push(t1)

    return () => {
      clearAllTimers()
      speech.stop()
      sound.stopMelody()
    }
  }, [roundIdx, sessionSongs])

  if (sessionSongs.length === 0) return null
  const currentSong = sessionSongs[roundIdx] || sessionSongs[0]

  const handleListenMelody = () => {
    if (!currentSong.melody || isAdvancingRef.current) return
    clearAllTimers()
    speech.stop()
    setIsPlayingMelody(true)
    const ms = sound.playMelody(currentSong.melody)
    melodyEndTimeRef.current = Date.now() + ms
    const t = window.setTimeout(() => setIsPlayingMelody(false), ms)
    timersRef.current.push(t)
  }

  const handleSelect = (opt: string) => {
    if (isAdvancingRef.current) return
    setSelectedOpt(opt)

    // Si había un temporizador para recitar la pregunta de intro, lo cancelamos
    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current)
      promptTimerRef.current = null
    }

    if (opt === currentSong.correctWord) {
      isAdvancingRef.current = true
      speech.stop() // Detenemos la voz si estuviera hablando

      const cleanStart = currentSong.verseStart.replace(/[«»]/g, '').replace(/\.{3}/g, '').trim()
      const cleanEnd = currentSong.correctWord.replace(/\.{3}/g, '').trim()
      const praiseMsg = pickRandom(SONG_CONGRATS)
      setFeedback(`🎶 ¡Eso es! «${cleanStart} ${cleanEnd}»`)

      let hasAdv = false
      const advance = () => {
        if (hasAdv) return
        hasAdv = true
        setTimeout(() => {
          if (roundIdx + 1 < sessionSongs.length) {
            setRoundIdx((r) => r + 1)
          } else {
            setIsSuccess(true)
            onComplete()
          }
        }, 500)
      }

      const speakCongrats = () => {
        setIsPlayingMelody(false)
        const dur = speech.estimateDurationMs(praiseMsg)
        speech.speak(praiseMsg, advance)
        const fallback = window.setTimeout(advance, dur + 1500)
        timersRef.current.push(fallback)
      }

      // Verificamos si la canción sigue sonando actualmente y cuánto le queda
      const now = Date.now()
      const remainingMelodyMs = melodyEndTimeRef.current - now

      if (remainingMelodyMs > 100) {
        // La canción NO ha terminado: no la reiniciamos.
        // Esperamos a que termine su reproducción actual y damos la felicitación al final.
        const t = window.setTimeout(() => {
          speakCongrats()
        }, remainingMelodyMs + 150)
        timersRef.current.push(t)
      } else {
        // La canción YA ha terminado: no la empezamos de nuevo.
        // Reproducimos un breve sonido de éxito y damos el mensaje de felicitación de inmediato.
        sound.playSuccess()
        const t = window.setTimeout(speakCongrats, 400)
        timersRef.current.push(t)
      }
    } else {
      sound.playGentleRetry()
      const retry = pickRandom(GENERAL_RETRIES)
      setFeedback('Esa palabra no es de la canción. Prueba con otra.')
      speech.speak(retry)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto overflow-hidden h-full">
      <div className="flex-1 flex flex-col justify-between bg-white border-3 sm:border-4 border-fuchsia-400 rounded-2xl sm:rounded-3xl p-2 sm:p-5 shadow-md text-center min-h-0 overflow-hidden gap-2">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-1 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-5xl sm:text-7xl leading-none shrink-0">{currentSong.emoji}</span>
            <div className="text-left min-w-0">
              <h3 className="text-2xl sm:text-4xl font-black text-stone-950 leading-none">
                {currentSong.title}
              </h3>
              <p className="text-base sm:text-2xl font-bold text-fuchsia-800 mt-0.5">
                🎵 ¿Cómo sigue la canción?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentSong.melody && (
              <button
                onClick={handleListenMelody}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 sm:border-3 font-black text-base sm:text-2xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 ${
                  isPlayingMelody
                    ? 'bg-fuchsia-600 border-fuchsia-800 text-white animate-pulse'
                    : 'bg-amber-200 hover:bg-amber-300 border-amber-500 text-amber-950'
                }`}
                title="Escuchar la melodía de la canción"
              >
                <Volume2 className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2.5]" />
                <span>Melodía</span>
              </button>
            )}

            <span className="px-3 sm:px-5 py-1 sm:py-2 bg-fuchsia-100 border-2 sm:border-3 border-fuchsia-400 text-fuchsia-950 font-black rounded-xl sm:rounded-2xl text-xl sm:text-3xl">
              {roundIdx + 1}/4
            </span>
          </div>
        </div>

        {/* Verse Box */}
        <div className="bg-fuchsia-50 border-3 sm:border-4 border-fuchsia-300 rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex items-center justify-center shrink-0">
          <p className="font-black text-fuchsia-950 text-2xl sm:text-5xl leading-tight">
            {currentSong.verseStart}
          </p>
        </div>

        {feedback && (
          <div className="p-1.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-3xl shrink-0">
            {feedback}
          </div>
        )}

        {/* Options */}
        <div
          className={`flex-1 min-h-0 w-full grid gap-2.5 sm:gap-4 items-stretch ${
            options.length === 2
              ? 'grid-cols-1 grid-rows-2'
              : options.length === 3
              ? 'grid-cols-1 grid-rows-3'
              : 'grid-cols-2 grid-rows-2'
          }`}
        >
          {options.map((opt) => {
            const isChosen = selectedOpt === opt
            const isCorrect = opt === currentSong.correctWord

            let btnStyle =
              'bg-stone-50 hover:bg-fuchsia-50 border-stone-300 hover:border-fuchsia-400 text-stone-950'
            if (isChosen) {
              btnStyle = isCorrect
                ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-300'
                : 'bg-amber-100 border-amber-400 text-amber-950 opacity-75'
            }

            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 p-3 sm:p-6 flex items-center justify-center text-center font-black text-2xl sm:text-5xl transition-all active:scale-95 cursor-pointer shadow-sm ${btnStyle}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      </div>

      {isSuccess && (
        <SuccessCelebration
          title="¡Qué gran artista!"
          message="Te sabes de memoria las canciones de toda la vida."
          onRestart={initSession}
          onHome={onExit}
        />
      )}
    </div>
  )
}
