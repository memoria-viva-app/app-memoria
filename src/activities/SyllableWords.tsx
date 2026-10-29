import { useState, useEffect, useRef } from 'react'
import { sound } from '../services/sound'
import { speech } from '../services/speech'
import { SuccessCelebration } from '../components/SuccessCelebration'
import { pickRandom, LANGUAGE_PRAISES } from '../services/voiceFeedback'

interface Props {
  onComplete: () => void
  onExit: () => void
}

// ---------------------------------------------------------------------------
// DATOS DE LAS 4 RONDAS
// ---------------------------------------------------------------------------

// RONDA 1: Completar la palabra partida (falta la última sílaba)
interface MissingSyllableItem {
  word: string
  emoji: string
  clue: string
  shownPart: string
  missingSyllable: string
  distractors: string[]
}

const ROUND_1_ITEMS: MissingSyllableItem[] = [
  {
    word: 'QUESO',
    emoji: '🧀',
    clue: 'Alimento sabroso que se elabora con leche',
    shownPart: 'QUE',
    missingSyllable: 'SO',
    distractors: ['TA', 'RRO', 'MA'],
  },
  {
    word: 'CAFÉ',
    emoji: '☕',
    clue: 'Bebida caliente y aromática para el desayuno',
    shownPart: 'CA',
    missingSyllable: 'FÉ',
    distractors: ['SA', 'TO', 'LLO'],
  },
  {
    word: 'PERRO',
    emoji: '🐶',
    clue: 'Animal fiel y cariñoso, el mejor amigo de la casa',
    shownPart: 'PE',
    missingSyllable: 'RRO',
    distractors: ['LO', 'TO', 'SO'],
  },
  {
    word: 'CASA',
    emoji: '🏠',
    clue: 'Lugar donde vivimos con la familia bajo un mismo techo',
    shownPart: 'CA',
    missingSyllable: 'SA',
    distractors: ['MA', 'PA', 'TE'],
  },
  {
    word: 'MANZANA',
    emoji: '🍎',
    clue: 'Fruta dulce y crujiente de color rojo o verde',
    shownPart: 'MAN - ZA',
    missingSyllable: 'NA',
    distractors: ['TA', 'TE', 'RA'],
  },
  {
    word: 'PERA',
    emoji: '🍐',
    clue: 'Fruta jugosa con forma de campana y piel fina',
    shownPart: 'PE',
    missingSyllable: 'RA',
    distractors: ['LA', 'SO', 'CHE'],
  },
  {
    word: 'LUNA',
    emoji: '🌙',
    clue: 'Brilla en el cielo oscuro durante la noche',
    shownPart: 'LU',
    missingSyllable: 'NA',
    distractors: ['PA', 'ZON', 'ZAS'],
  },
  {
    word: 'UVAS',
    emoji: '🍇',
    clue: 'Fruta en racimos para las doce campanadas de Nochevieja',
    shownPart: 'U',
    missingSyllable: 'VAS',
    distractors: ['ÑAS', 'GAS', 'NAS'],
  },
  {
    word: 'LLAVE',
    emoji: '🔑',
    clue: 'Objeto metálico que sirve para abrir y cerrar la puerta',
    shownPart: 'LLA',
    missingSyllable: 'VE',
    distractors: ['MA', 'NA', 'TA'],
  },
  {
    word: 'ROSA',
    emoji: '🌹',
    clue: 'Flor hermosa y perfumada que tiene espinas en el tallo',
    shownPart: 'RO',
    missingSyllable: 'SA',
    distractors: ['PA', 'NA', 'TE'],
  },
  {
    word: 'ZAPATO',
    emoji: '👞',
    clue: 'Calzado cómodo que nos ponemos para salir a pasear',
    shownPart: 'ZA - PA',
    missingSyllable: 'TO',
    distractors: ['TE', 'NO', 'RO'],
  },
  {
    word: 'TOMATE',
    emoji: '🍅',
    clue: 'Hortaliza roja indispensable para una buena ensalada',
    shownPart: 'TO - MA',
    missingSyllable: 'TE',
    distractors: ['NA', 'SO', 'TO'],
  },
]

// RONDA 2: Palabras compuestas tradicionales partidas en 2
interface CompoundItem {
  fullWord: string
  emoji: string
  clue: string
  firstHalf: string
  secondHalf: string
  distractors: string[]
}

const ROUND_2_ITEMS: CompoundItem[] = [
  {
    fullWord: 'GIRASOL',
    emoji: '🌻',
    clue: 'Flor alta y amarilla que gira buscando la luz del sol',
    firstHalf: 'GIRA',
    secondHalf: 'SOL',
    distractors: ['LUNA', 'MAR'],
  },
  {
    fullWord: 'PARAGUAS',
    emoji: '☂️',
    clue: 'Lo abrimos al salir cuando llueve para no mojarnos',
    firstHalf: 'PARA',
    secondHalf: 'GUAS',
    distractors: ['NIEVE', 'VIENTO'],
  },
  {
    fullWord: 'ABRELATAS',
    emoji: '🥫',
    clue: 'Herramienta de cocina para abrir latas de conserva',
    firstHalf: 'ABRE',
    secondHalf: 'LATAS',
    distractors: ['BOTES', 'BOCAS'],
  },
  {
    fullWord: 'SACACORCHOS',
    emoji: '🍾',
    clue: 'Utensilio para descorchar las botellas de buen vino',
    firstHalf: 'SACA',
    secondHalf: 'CORCHOS',
    distractors: ['TAPAS', 'VASOS'],
  },
  {
    fullWord: 'ESPANTAPÁJAROS',
    emoji: '🌾',
    clue: 'Muñeco de paja en el huerto para ahuyentar las aves',
    firstHalf: 'ESPANTA',
    secondHalf: 'PÁJAROS',
    distractors: ['MOSCAS', 'GATOS'],
  },
  {
    fullWord: 'ROMPECABEZAS',
    emoji: '🧩',
    clue: 'Juego de encajar piezas para formar una imagen completa',
    firstHalf: 'ROMPE',
    secondHalf: 'CABEZAS',
    distractors: ['OLAS', 'VIDRIOS'],
  },
  {
    fullWord: 'CORTAUÑAS',
    emoji: '✂️',
    clue: 'Pequeño instrumento para recortarse y cuidar las uñas',
    firstHalf: 'CORTA',
    secondHalf: 'UÑAS',
    distractors: ['PELOS', 'HILOS'],
  },
  {
    fullWord: 'CUMPLEAÑOS',
    emoji: '🎂',
    clue: 'Fiesta especial donde se soplan las velas un año más',
    firstHalf: 'CUMPLE',
    secondHalf: 'AÑOS',
    distractors: ['DÍAS', 'MESES'],
  },
]

// RONDA 3: Dos palabras partidas a la vez (4 fichas desordenadas, sin distractores)
interface DoubleWordItem {
  clue: string
  word1: {
    name: string
    emoji: string
    parts: [string, string]
  }
  word2: {
    name: string
    emoji: string
    parts: [string, string]
  }
}

const ROUND_3_ITEMS: DoubleWordItem[] = [
  {
    clue: 'Junta las mitades de estos dos animales de compañía',
    word1: { name: 'GATO', emoji: '🐱', parts: ['GA', 'TO'] },
    word2: { name: 'PERRO', emoji: '🐶', parts: ['PE', 'RRO'] },
  },
  {
    clue: 'Junta las mitades de estas dos frutas de la frutería',
    word1: { name: 'MANZANA', emoji: '🍎', parts: ['MAN', 'ZANA'] },
    word2: { name: 'PERA', emoji: '🍐', parts: ['PE', 'RA'] },
  },
  {
    clue: 'Junta las mitades del desayuno tradicional',
    word1: { name: 'CAFÉ', emoji: '☕', parts: ['CA', 'FÉ'] },
    word2: { name: 'LECHE', emoji: '🥛', parts: ['LE', 'CHE'] },
  },
  {
    clue: 'Junta las mitades de dos cosas que brillan en el cielo',
    word1: { name: 'LUNA', emoji: '🌙', parts: ['LU', 'NA'] },
    word2: { name: 'ESTRELLA', emoji: '⭐', parts: ['ES', 'TRELLA'] },
  },
  {
    clue: 'Junta las mitades de estas dos prendas para vestir',
    word1: { name: 'CAMISA', emoji: '👔', parts: ['CA', 'MISA'] },
    word2: { name: 'ZAPATO', emoji: '👞', parts: ['ZA', 'PATO'] },
  },
  {
    clue: 'Junta las mitades de dos cosas ricas de la comida',
    word1: { name: 'PESCADO', emoji: '🐟', parts: ['PES', 'CADO'] },
    word2: { name: 'POLLO', emoji: '🍗', parts: ['PO', 'LLO'] },
  },
]

// RONDA 4: Adivinanza silábica (4 sílabas + 2 intrusos)
interface RiddleWordItem {
  word: string
  emoji: string
  clue: string
  syllables: string[]
  distractors: string[]
}

const ROUND_4_ITEMS: RiddleWordItem[] = [
  {
    word: 'MARIPOSA',
    emoji: '🦋',
    clue: 'Vuela alegre en primavera agitando sus alas de hermosos colores',
    syllables: ['MA', 'RI', 'PO', 'SA'],
    distractors: ['TE', 'LU'],
  },
  {
    word: 'CHOCOLATE',
    emoji: '🍫',
    clue: 'Dulce tradicional hecho con cacao que se derrite en la boca',
    syllables: ['CHO', 'CO', 'LA', 'TE'],
    distractors: ['PA', 'SU'],
  },
  {
    word: 'BICICLETA',
    emoji: '🚲',
    clue: 'Vehículo de dos ruedas con timbre que avanza pedaleando',
    syllables: ['BI', 'CI', 'CLE', 'TA'],
    distractors: ['MO', 'RA'],
  },
  {
    word: 'ELEFANTE',
    emoji: '🐘',
    clue: 'Gran animal pacífico con orejas gigantescas y larga trompa',
    syllables: ['E', 'LE', 'FAN', 'TE'],
    distractors: ['CA', 'SO'],
  },
  {
    word: 'ZANAHORIA',
    emoji: '🥕',
    clue: 'Hortaliza alargada de color naranja muy saludable para la vista',
    syllables: ['ZA', 'NA', 'HO', 'RIA'],
    distractors: ['ME', 'PI'],
  },
  {
    word: 'CALABAZA',
    emoji: '🎃',
    clue: 'Fruto grande y redondo de piel naranja típico del otoño',
    syllables: ['CA', 'LA', 'BA', 'ZA'],
    distractors: ['TI', 'NO'],
  },
  {
    word: 'CAMISETA',
    emoji: '👕',
    clue: 'Prenda ligera de algodón con manga corta para el buen tiempo',
    syllables: ['CA', 'MI', 'SE', 'TA'],
    distractors: ['PO', 'LU'],
  },
  {
    word: 'CARAMELO',
    emoji: '🍬',
    clue: 'Golosina dulce envuelta en papel que se saborea despacio',
    syllables: ['CA', 'RA', 'ME', 'LO'],
    distractors: ['TU', 'FI'],
  },
]

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------

export function SyllableWords({ onComplete, onExit }: Props) {
  const [roundIdx, setRoundIdx] = useState(0) // 0..3

  // Datos de la sesión
  const [r1Item, setR1Item] = useState<MissingSyllableItem>(ROUND_1_ITEMS[0])
  const [r1Options, setR1Options] = useState<string[]>([])
  const [r1Selected, setR1Selected] = useState<string | null>(null)

  const [r2Item, setR2Item] = useState<CompoundItem>(ROUND_2_ITEMS[0])
  const [r2Options, setR2Options] = useState<string[]>([])
  const [r2Selected, setR2Selected] = useState<string[]>([])

  const [r3Item, setR3Item] = useState<DoubleWordItem>(ROUND_3_ITEMS[0])
  const [r3Tiles, setR3Tiles] = useState<{ id: string; text: string; wordTarget: 1 | 2; partIdx: 0 | 1 }[]>([])
  const [r3CompletedWord1, setR3CompletedWord1] = useState(false)
  const [r3CompletedWord2, setR3CompletedWord2] = useState(false)
  const [r3SelectedTileId, setR3SelectedTileId] = useState<string | null>(null)

  const [r4Item, setR4Item] = useState<RiddleWordItem>(ROUND_4_ITEMS[0])
  const [r4Tiles, setR4Tiles] = useState<{ id: string; text: string }[]>([])
  const [r4PickedIds, setR4PickedIds] = useState<string[]>([])

  const [feedback, setFeedback] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const isAdvancingRef = useRef(false)

  // Inicializar toda la sesión
  const initSession = () => {
    setR1Item(pickRandom(ROUND_1_ITEMS))
    setR2Item(pickRandom(ROUND_2_ITEMS))
    setR3Item(pickRandom(ROUND_3_ITEMS))
    setR4Item(pickRandom(ROUND_4_ITEMS))
    setRoundIdx(0)
    setIsSuccess(false)
    setFeedback('')
  }

  useEffect(() => {
    initSession()
    return () => speech.stop()
  }, [])

  // Configuración de cada ronda al cambiar `roundIdx`
  useEffect(() => {
    speech.stop()
    setFeedback('')
    isAdvancingRef.current = false

    if (roundIdx === 0) {
      // Ronda 1: La sílaba que falta
      const opts = [r1Item.missingSyllable, ...r1Item.distractors].sort(() => 0.5 - Math.random())
      setR1Options(opts)
      setR1Selected(null)
    } else if (roundIdx === 1) {
      // Ronda 2: Palabra compuesta
      const opts = [r2Item.firstHalf, r2Item.secondHalf, ...r2Item.distractors].sort(() => 0.5 - Math.random())
      setR2Options(opts)
      setR2Selected([])
    } else if (roundIdx === 2) {
      // Ronda 3: Dos palabras partidas a la vez
      const tiles = [
        { id: 'w1-p1', text: r3Item.word1.parts[0], wordTarget: 1 as const, partIdx: 0 as const },
        { id: 'w1-p2', text: r3Item.word1.parts[1], wordTarget: 1 as const, partIdx: 1 as const },
        { id: 'w2-p1', text: r3Item.word2.parts[0], wordTarget: 2 as const, partIdx: 0 as const },
        { id: 'w2-p2', text: r3Item.word2.parts[1], wordTarget: 2 as const, partIdx: 1 as const },
      ].sort(() => 0.5 - Math.random())
      setR3Tiles(tiles)
      setR3CompletedWord1(false)
      setR3CompletedWord2(false)
      setR3SelectedTileId(null)
    } else if (roundIdx === 3) {
      // Ronda 4: Adivinanza silábica con intrusos
      const all = [...r4Item.syllables, ...r4Item.distractors].map((s, idx) => ({
        id: `r4-${idx}-${s}`,
        text: s,
      }))
      for (let attempt = 0; attempt < 8; attempt++) {
        all.sort(() => 0.5 - Math.random())
        const matchesOrder = r4Item.syllables.every((syl, i) => all[i]?.text === syl)
        if (!matchesOrder) break
      }
      setR4Tiles(all)
      setR4PickedIds([])
    }

    return () => {
      speech.stop()
    }
  }, [roundIdx, r1Item, r2Item, r3Item, r4Item])

  // Función de avance genérica
  const advanceToNext = (congratsMsg: string) => {
    isAdvancingRef.current = true
    sound.playSuccess()
    const praise = pickRandom(LANGUAGE_PRAISES)
    setFeedback(`✨ ${congratsMsg}`)

    let hasAdv = false
    const advance = () => {
      if (hasAdv) return
      hasAdv = true
      setTimeout(() => {
        if (roundIdx + 1 < 4) {
          setRoundIdx((r) => r + 1)
        } else {
          setIsSuccess(true)
          onComplete()
        }
      }, 500)
    }

    // Solo locución de elogio breve sin leer los textos
    const dur = speech.estimateDurationMs(praise)
    speech.speak(praise, advance)
    setTimeout(advance, dur + 2200)
  }

  // ---------------------------------------------------------------------------
  // MANEJADORES DE CADA RONDA
  // ---------------------------------------------------------------------------

  // RONDA 1
  const handleR1Select = (opt: string) => {
    if (isAdvancingRef.current) return
    sound.playTap()
    setR1Selected(opt)

    if (opt === r1Item.missingSyllable) {
      advanceToNext(`¡Correcto! ${r1Item.shownPart} - ${opt} forma la palabra ${r1Item.word}.`)
    } else {
      sound.playGentleRetry()
      setFeedback(`«${opt}» no completa esta palabra. Prueba con otra sílaba.`)
      speech.speak('Esa sílaba no encaja. Prueba con otra opción.')
    }
  }

  // RONDA 2
  const handleR2Select = (half: string) => {
    if (isAdvancingRef.current) return
    sound.playTap()

    if (r2Selected.length === 0) {
      // Debe ser la primera mitad de la palabra
      if (half === r2Item.firstHalf) {
        setR2Selected([half])
        setFeedback(`Muy bien: «${half}». Ahora elige con qué parte termina.`)
        speech.speak('¡Bien!')
      } else if (half === r2Item.secondHalf) {
        sound.playGentleRetry()
        setFeedback(`«${half}» es el final. Busca primero la parte con la que empieza.`)
        speech.speak('Busca primero cómo empieza.')
      } else {
        sound.playGentleRetry()
        setFeedback(`«${half}» no forma parte de esta palabra. Prueba con otra.`)
        speech.speak('Esa no encaja.')
      }
    } else if (r2Selected.length === 1) {
      // Debe ser la segunda mitad
      if (half === r2Item.secondHalf) {
        setR2Selected([r2Item.firstHalf, half])
        advanceToNext(`¡Perfecto! ${r2Item.firstHalf} más ${half} forman ${r2Item.fullWord}.`)
      } else {
        sound.playGentleRetry()
        setFeedback(`«${half}» no completa la palabra. Prueba con otra ficha.`)
        speech.speak('Esa no encaja.')
      }
    }
  }

  // RONDA 3
  const handleR3Select = (tile: { id: string; text: string; wordTarget: 1 | 2; partIdx: 0 | 1 }) => {
    if (isAdvancingRef.current) return
    sound.playTap()

    // Si la palabra ya está completada, ignoramos sus fichas
    if ((tile.wordTarget === 1 && r3CompletedWord1) || (tile.wordTarget === 2 && r3CompletedWord2)) {
      return
    }

    if (!r3SelectedTileId) {
      // Primer clic de una pareja: debe ser la primera mitad (partIdx === 0)
      if (tile.partIdx === 0) {
        setR3SelectedTileId(tile.id)
        const targetWord = tile.wordTarget === 1 ? r3Item.word1 : r3Item.word2
        setFeedback(`Bien: «${tile.text}». Ahora busca la otra mitad de ${targetWord.emoji}.`)
      } else {
        sound.playGentleRetry()
        setFeedback(`«${tile.text}» es el final de la palabra. Empieza por la primera mitad.`)
        speech.speak('Busca primero cómo empieza.')
      }
    } else {
      // Segundo clic: verificar si completa la palabra seleccionada
      const firstTile = r3Tiles.find((t) => t.id === r3SelectedTileId)
      if (!firstTile) return

      if (tile.id === r3SelectedTileId) {
        // Deseleccionar
        setR3SelectedTileId(null)
        setFeedback('')
        return
      }

      if (tile.wordTarget === firstTile.wordTarget && tile.partIdx === 1) {
        // ¡Pareja completada con éxito!
        sound.playSuccess()
        const wordName = tile.wordTarget === 1 ? r3Item.word1.name : r3Item.word2.name
        const nextW1 = firstTile.wordTarget === 1 ? true : r3CompletedWord1
        const nextW2 = firstTile.wordTarget === 2 ? true : r3CompletedWord2
        setR3CompletedWord1(nextW1)
        setR3CompletedWord2(nextW2)
        setR3SelectedTileId(null)

        if (nextW1 && nextW2) {
          advanceToNext(`¡Estupendo! Has completado ${r3Item.word1.name} y ${r3Item.word2.name}.`)
        } else {
          setFeedback(`¡Eso es! «${wordName}» completado. Ahora junta la otra palabra.`)
          speech.speak('¡Muy bien!')
        }
      } else {
        sound.playGentleRetry()
        setFeedback('Esas dos mitades no forman la misma palabra. Vuelve a intentarlo.')
        speech.speak('Esas dos mitades no encajan.')
        setR3SelectedTileId(null)
      }
    }
  }

  // RONDA 4
  const handleR4Select = (tile: { id: string; text: string }) => {
    if (isAdvancingRef.current || r4PickedIds.includes(tile.id)) return
    sound.playTap()

    const expectedIdx = r4PickedIds.length
    const expectedSyllable = r4Item.syllables[expectedIdx]

    if (tile.text === expectedSyllable) {
      sound.playSuccess()
      const nextPicked = [...r4PickedIds, tile.id]
      setR4PickedIds(nextPicked)
      setFeedback('')

      if (nextPicked.length === r4Item.syllables.length) {
        advanceToNext(`¡Excelente! Las sílabas forman ${r4Item.word}.`)
      }
    } else {
      sound.playGentleRetry()
      setFeedback(`«${tile.text}» no va ahora. Piensa en cómo continúa la palabra.`)
      speech.speak('Esa sílaba no encaja.')
    }
  }

  // ---------------------------------------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------------------------------------

  const roundTitles = [
    'Ronda 1: ¿Qué sílaba falta?',
    'Ronda 2: Palabra compuesta',
    'Ronda 3: Dos palabras a la vez',
    'Ronda 4: Adivina y monta la palabra',
  ]

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto overflow-hidden h-full">
      <div className="flex-1 flex flex-col justify-between bg-white border-3 sm:border-4 border-indigo-400 rounded-2xl sm:rounded-3xl p-2 sm:p-5 shadow-md text-center min-h-0 overflow-hidden gap-2">
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-2 px-1 shrink-0">
          <h3 className="text-xl sm:text-3xl font-black text-stone-950 truncate text-left">
            {roundTitles[roundIdx]}
          </h3>
          <span className="px-3 sm:px-5 py-1 sm:py-2 bg-indigo-100 border-2 sm:border-3 border-indigo-400 text-indigo-950 font-black rounded-xl sm:rounded-2xl text-xl sm:text-3xl shrink-0">
            {roundIdx + 1}/4
          </span>
        </div>

        {/* ----------------- VISTA RONDA 1 ----------------- */}
        {roundIdx === 0 && (
          <>
            <div className="bg-indigo-50 border-3 sm:border-4 border-indigo-300 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 shrink-0">
              <span className="text-6xl sm:text-8xl leading-none shrink-0">{r1Item.emoji}</span>
              <div className="text-center sm:text-left">
                <p className="font-bold text-indigo-900 text-lg sm:text-2xl mb-1">
                  💡 {r1Item.clue}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-indigo-400 rounded-2xl shadow-inner">
                  <span className="font-black text-3xl sm:text-5xl text-stone-950">
                    {r1Item.shownPart}
                  </span>
                  <span className="font-black text-3xl sm:text-5xl text-indigo-400">-</span>
                  <span className="font-black text-3xl sm:text-5xl text-indigo-600 bg-amber-100 border-2 border-amber-400 border-dashed px-4 py-0.5 rounded-xl">
                    {r1Selected && r1Selected === r1Item.missingSyllable ? r1Selected : '?'}
                  </span>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl shrink-0">
                {feedback}
              </div>
            )}

            <div className="flex-1 min-h-0 w-full grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4 items-stretch">
              {r1Options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleR1Select(opt)}
                  className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 flex items-center justify-center font-black text-4xl sm:text-6xl cursor-pointer transition-all active:scale-95 shadow-sm ${
                    r1Selected === opt && opt === r1Item.missingSyllable
                      ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-300'
                      : 'bg-amber-100 hover:bg-amber-200 border-amber-500 text-stone-950'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ----------------- VISTA RONDA 2 ----------------- */}
        {roundIdx === 1 && (
          <>
            <div className="bg-amber-50 border-3 sm:border-4 border-amber-300 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 shrink-0">
              <span className="text-6xl sm:text-8xl leading-none shrink-0">{r2Item.emoji}</span>
              <div className="text-center sm:text-left">
                <p className="font-bold text-amber-950 text-lg sm:text-2xl mb-1.5">
                  💡 {r2Item.clue}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <div className="min-w-28 sm:min-w-40 h-14 sm:h-18 px-3 rounded-2xl border-3 border-amber-500 flex items-center justify-center font-black text-2xl sm:text-4xl bg-white text-stone-950 shadow-inner">
                    {r2Selected[0] || '1ª parte'}
                  </div>
                  <span className="font-black text-3xl sm:text-5xl text-amber-600">+</span>
                  <div className="min-w-28 sm:min-w-40 h-14 sm:h-18 px-3 rounded-2xl border-3 border-amber-500 flex items-center justify-center font-black text-2xl sm:text-4xl bg-white text-stone-950 shadow-inner">
                    {r2Selected[1] || '2ª parte'}
                  </div>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl shrink-0">
                {feedback}
              </div>
            )}

            <div className="flex-1 min-h-0 w-full grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4 items-stretch">
              {r2Options.map((half) => {
                const isSelected = r2Selected.includes(half)
                return (
                  <button
                    key={half}
                    disabled={isSelected}
                    onClick={() => handleR2Select(half)}
                    className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 flex items-center justify-center font-black text-3xl sm:text-5xl cursor-pointer transition-all active:scale-95 shadow-sm ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-700 text-white opacity-80 cursor-default'
                        : 'bg-indigo-100 hover:bg-indigo-200 border-indigo-400 text-stone-950'
                    }`}
                  >
                    {half}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ----------------- VISTA RONDA 3 ----------------- */}
        {roundIdx === 2 && (
          <>
            <div className="bg-indigo-50 border-3 sm:border-4 border-indigo-300 rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shrink-0">
              <p className="font-bold text-indigo-950 text-base sm:text-2xl mb-2">
                🧩 {r3Item.clue}
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                <div
                  className={`p-2 rounded-2xl border-3 flex items-center justify-center gap-2 ${
                    r3CompletedWord1
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : 'bg-white border-stone-300 text-stone-700'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{r3Item.word1.emoji}</span>
                  <span className="font-black text-xl sm:text-3xl">
                    {r3CompletedWord1 ? r3Item.word1.name : `${r3Item.word1.parts[0]} - ?`}
                  </span>
                </div>
                <div
                  className={`p-2 rounded-2xl border-3 flex items-center justify-center gap-2 ${
                    r3CompletedWord2
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : 'bg-white border-stone-300 text-stone-700'
                  }`}
                >
                  <span className="text-3xl sm:text-4xl">{r3Item.word2.emoji}</span>
                  <span className="font-black text-xl sm:text-3xl">
                    {r3CompletedWord2 ? r3Item.word2.name : `${r3Item.word2.parts[0]} - ?`}
                  </span>
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl shrink-0">
                {feedback}
              </div>
            )}

            <div className="flex-1 min-h-0 w-full grid grid-cols-2 grid-rows-2 gap-2.5 sm:gap-4 items-stretch">
              {r3Tiles.map((tile) => {
                const isCompleted =
                  (tile.wordTarget === 1 && r3CompletedWord1) ||
                  (tile.wordTarget === 2 && r3CompletedWord2)
                const isSelected = r3SelectedTileId === tile.id
                return (
                  <button
                    key={tile.id}
                    disabled={isCompleted}
                    onClick={() => handleR3Select(tile)}
                    className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 flex items-center justify-center font-black text-4xl sm:text-6xl cursor-pointer transition-all active:scale-95 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800 opacity-60 cursor-default'
                        : isSelected
                        ? 'bg-amber-300 border-amber-600 text-stone-950 ring-4 ring-amber-400 scale-[1.02]'
                        : 'bg-stone-50 hover:bg-indigo-50 border-indigo-400 text-stone-950'
                    }`}
                  >
                    {tile.text}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {/* ----------------- VISTA RONDA 4 ----------------- */}
        {roundIdx === 3 && (
          <>
            <div className="bg-indigo-50 border-3 sm:border-4 border-indigo-300 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-center gap-2 sm:gap-3 shrink-0">
              <span className="text-6xl sm:text-8xl leading-none">{r4Item.emoji}</span>
              <p className="font-bold text-indigo-950 text-base sm:text-2xl text-center max-w-2xl">
                💡 {r4Item.clue}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {r4Item.syllables.map((syl, idx) => {
                  const filled = idx < r4PickedIds.length
                  const isCurrent = idx === r4PickedIds.length
                  return (
                    <div
                      key={idx}
                      className={`min-w-18 sm:min-w-24 h-12 sm:h-16 px-3 rounded-2xl border-3 sm:border-4 flex items-center justify-center font-black text-2xl sm:text-4xl ${
                        filled
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-sm'
                          : isCurrent
                          ? 'bg-amber-100 border-amber-500 text-amber-900 border-dashed'
                          : 'bg-white border-indigo-300 text-indigo-300 border-dashed'
                      }`}
                    >
                      {filled ? syl : '?'}
                    </div>
                  )
                })}
              </div>
            </div>

            {feedback && (
              <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl shrink-0">
                {feedback}
              </div>
            )}

            <div className="flex-1 min-h-0 w-full grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3 items-stretch">
              {r4Tiles.map((tile) => {
                const isUsed = r4PickedIds.includes(tile.id)
                return (
                  <button
                    key={tile.id}
                    disabled={isUsed}
                    onClick={() => handleR4Select(tile)}
                    className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 flex items-center justify-center font-black text-3xl sm:text-5xl transition-all cursor-pointer active:scale-95 shadow-sm ${
                      isUsed
                        ? 'bg-stone-100 border-stone-300 text-stone-300 opacity-50 cursor-default'
                        : 'bg-amber-100 hover:bg-amber-200 border-amber-500 text-stone-950'
                    }`}
                  >
                    {tile.text}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {isSuccess && (
        <SuccessCelebration
          title="¡Maestro de las palabras!"
          message="Has superado los cuatro retos de palabras partidas con una destreza lingüística magnífica."
          onRestart={initSession}
          onHome={onExit}
        />
      )}
    </div>
  )
}
