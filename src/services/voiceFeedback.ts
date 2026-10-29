/**
 * Voice feedback phrases catalog for all activities in the app.
 * Provides abundant, varied, and natural Spanish phrases to keep every game fresh and engaging.
 */

// Helper: randomly pick a phrase, avoiding immediate repetitions when a lastRef is provided
export function pickRandom<T>(items: T[], lastPicked?: T): T {
  if (items.length === 0) throw new Error('Empty pool')
  if (items.length === 1) return items[0]

  const eligible = lastPicked !== undefined ? items.filter((x) => x !== lastPicked) : items
  const pool = eligible.length > 0 ? eligible : items
  return pool[Math.floor(Math.random() * pool.length)]
}

// -------------------------------------------------------------
// PRAISES ADAPTADOS POR TIPO DE JUEGO (Memoria, Agudeza Visual, Lenguaje, etc.)
// -------------------------------------------------------------

/** 1. MEMORIA: Juegos de retención visual, espacial, auditiva o semántica (Parejas, ¿Dónde estaba?, La Compra, El Teléfono, Caras y Nombres) */
export const MEMORY_PRAISES = [
  '¡Qué memoria tan despierta tienes!',
  '¡Memoria fantástica! Te acordaste perfectamente.',
  '¡Impresionante! Tienes una memoria maravillosa.',
  '¡Exacto! Lo has recordado a la perfección.',
  '¡Qué gran retención! No se te escapa un detalle.',
  '¡Bravo! Tu memoria funciona como un reloj suizo.',
  '¡Estupendo! Te has acordado sin dudarlo.',
  '¡Memoria prodigiosa! Lo recordaste enseguida.',
  '¡Genial! Tienes la cabeza despejada y muy despierta.',
  '¡Qué bien te acuerdas! Da gusto ver tu memoria.',
]

/** 2. AGUDEZA VISUAL Y ATENCIÓN: Rastreo visual, discriminación de formas y puntos, seguimiento de movimiento (El Trilero, Buscar Objeto, El Dominó) */
export const VISUAL_PRAISES = [
  '¡Qué vista de lince tienes!',
  '¡Qué buen ojo! Lo has visto al instante.',
  '¡Atención de primera! No se te escapa nada.',
  '¡En el blanco! Qué agudeza visual tan buena.',
  '¡Magnífico! Has seguido el movimiento con gran precisión.',
  '¡Excelente reflejo visual! Muy bien localizado.',
  '¡Bravo! Tienes una concentración visual impecable.',
  '¡Bien visto! Tus ojos no fallan una.',
  '¡Qué rapidez para localizarlo con la mirada!',
  '¡Impecable! Tienes un ojo clínico para los detalles.',
]

/** 3. LENGUAJE Y VOCABULARIO: Formación de palabras, sílabas, refranes y coplas (Palabras Partidas, Refranes, Canciones) */
export const LANGUAGE_PRAISES = [
  '¡Qué riqueza de vocabulario tienes!',
  '¡Qué sabiduría de palabras! Muy bien formado.',
  '¡Excelente dominio del lenguaje!',
  '¡Perfecto! Qué gran agilidad con las letras.',
  '¡Qué bien te sabes las palabras y expresiones!',
  '¡Bravo! Has encontrado la palabra con gran soltura.',
  '¡Estupendo! Se nota que disfrutas con el lenguaje.',
  '¡Impecable! Qué buen manejo de las palabras.',
  '¡Qué destreza con las letras y el vocabulario!',
  '¡Fantástico! Se nota tu amor por las palabras bien dichas.',
]

/** 4. LÓGICA, DÍA A DÍA Y RAZONAMIENTO: Categorización, resolución de situaciones cotidianas (El Intruso, Primero y Después) */
export const LOGIC_PRAISES = [
  '¡Muy bien pensado! Razonamiento de primera.',
  '¡Lógica impecable! Todo encaja como debe ser.',
  '¡Qué gran sentido común y buen juicio!',
  '¡Exacto! Bien pensado y bien deducido.',
  '¡Impecable! Da gusto ver qué bien razonas.',
  '¡Qué mente tan clara y ordenada!',
  '¡Perfecto! Has resuelto la situación con gran acierto.',
  '¡Excelente deducción! Todo en su sitio.',
  '¡Brillante! Has razonado a las mil maravillas.',
  '¡Qué buena cabeza! Todo tiene sentido.',
]

/** 5. ORIENTACIÓN TEMPORAL Y ESTACIONES: Comprensión del calendario, ciclos y estaciones (Las Estaciones) */
export const ORIENTATION_PRAISES = [
  '¡Conoces el calendario y las estaciones al dedillo!',
  '¡Excelente! Sabes perfectamente el ritmo del año.',
  '¡Muy bien orientado! Cada estación en su momento.',
  '¡Perfecto! Qué bien conoces los meses y sus costumbres.',
  '¡Qué buena orientación en el calendario de toda la vida!',
  '¡Exacto! No se te despista ni un mes ni una fiesta.',
  '¡Estupendo! El paso de las estaciones no tiene secretos para ti.',
]

/** 6. EL RELOJ Y LA HORA: Lectura de agujas y cálculo de horas (El Reloj) */
export const TIME_PRAISES = [
  '¡Hora clavada! Lees las agujas del reloj de maravilla.',
  '¡Qué precisión con el reloj! Orientación en el tiempo impecable.',
  '¡Exacto! El reloj de agujas no tiene secretos para ti.',
  '¡Excelente cálculo de la hora!',
  '¡Perfecto! Qué bien dominas las horas y los cuartos.',
  '¡Puntualidad suiza! Has clavado la hora a la primera.',
  '¡Muy bien visto en la esfera del reloj!',
]

/** 7. ORGANIZACIÓN Y ORDEN DEL HOGAR: Guardar y ordenar espacios y maletas (Ordenar la Casa, La Maleta) */
export const ORGANIZATION_PRAISES = [
  '¡Todo en su sitio! Qué orden tan estupendo.',
  '¡Qué sentido del orden! La casa queda impecable.',
  '¡Muy bien organizado! Cada cosa en su lugar adecuado.',
  '¡Excelente criterio de organización!',
  '¡Qué gusto da verlo todo tan bien recogido!',
  '¡Organización de diez! Nada fuera de su sitio.',
  '¡Perfectamente ordenado! Cada objeto en su rincón.',
]

/** 8. CÁLCULO NUMÉRICO Y MONEDAS: Manejo de dinero y sumas (Las Monedas) */
export const CALCULATION_PRAISES = [
  '¡Cuenta perfecta! Clavado al céntimo.',
  '¡Qué agilidad para el cálculo mental!',
  '¡Impecable! Tu monedero no falla una cuenta.',
  '¡Excelente cálculo! Justo el precio exacto.',
  '¡Qué bien hechas las cuentas! Ni un céntimo de más ni de menos.',
  '¡Manejo del dinero impecable!',
]

/** 9. CONOCIMIENTO Y MEMORIA CULTURAL DE ESPAÑA (Viaje por España) */
export const SPAIN_PRAISES = [
  '¡Qué gran conocimiento y memoria de España tienes!',
  '¡Conoces nuestros pueblos y ciudades como la palma de la mano!',
  '¡Qué sabiduría de nuestras costumbres y tradiciones!',
  '¡Viajero de primera! No se te escapa un rincón de España.',
  '¡Excelente! Sabes de dónde es típico cada rincón y plato.',
  '¡Qué orgullo de memoria geográfica y cultural!',
]

// -------------------------------------------------------------
// GENERAL PRAISE & CELEBRATION (Used across activities)
// -------------------------------------------------------------
export const GENERAL_PRAISES = [
  '¡Excelente! Lo has hecho de maravilla.',
  '¡Muy bien! Tienes una memoria fantástica.',
  '¡Exacto! Qué agilidad mental tienes.',
  '¡Bravo! Lo has clavado a la primera.',
  '¡Estupendo! Da gusto ver qué bien lo haces.',
  '¡Perfecto! Tienes una atención excelente.',
  '¡Magnífico! Has acertado de pleno.',
  '¡Qué buen ojo tienes! Seguimos adelante.',
  '¡Fenomenal! Te ha salido redondo.',
  '¡Muy bien pensado! Todo en su sitio.',
  '¡Impresionante! Qué memoria tan despierta.',
  '¡Genial! Se nota que estás concentrado.',
]

// -------------------------------------------------------------
// REINTENTOS ADAPTADOS POR TIPO DE JUEGO
// -------------------------------------------------------------

export const MEMORY_RETRIES = [
  'Tómate tu tiempo. Haz memoria con calma y elige de nuevo.',
  'Sin prisa. Recuerda la imagen con tranquilidad y vuelve a probar.',
  'No te preocupes. Con calma se recuerda mejor, prueba otra vez.',
  'Casi casi. Piensa en dónde lo viste y vuelve a intentarlo.',
]

export const VISUAL_RETRIES = [
  'Abre bien los ojos. Mira con atención y tranquilidad.',
  'Sin prisa. Observa cada detalle y vuelve a probar.',
  'Casi lo tienes. Fíjate despacio en las diferencias.',
  'No pasa nada. Mira con calma toda la mesa y elige de nuevo.',
]

export const LOGIC_RETRIES = [
  'Piénsalo con tranquilidad. Seguro que encuentras la relación.',
  'Sin prisa. Fíjate en cómo encaja cada cosa y vuelve a probar.',
  'Casi lo tienes. Reflexiona un instante y elige otra opción.',
]

// -------------------------------------------------------------
// GENERAL GENTLE ENCOURAGEMENT (Used on mistakes)
// -------------------------------------------------------------
export const GENERAL_RETRIES = [
  'No pasa nada, tómate tu tiempo y prueba con otra.',
  'Casi casi. Mira con calma y elige de nuevo.',
  'No te preocupes. Con tranquilidad se llega lejos, prueba otra vez.',
  'Esa no era, pero vas muy bien. Elige otra opción.',
  'Sin prisa. Busca con calma, seguro que la encuentras.',
  'Un pequeño despiste no es nada. ¡Inténtalo de nuevo!',
  'Tranquilo, observa con atención y vuelve a probar.',
  '¡Ánimo! Seguro que la próxima es la buena.',
  'Casi lo tienes. Respira y prueba con otra opción.',
  'No pasa nada, aquí no hay prisa. Sigue buscando.',
]

// -------------------------------------------------------------
// SPOT OBJECT (Buscar objeto diferente)
// -------------------------------------------------------------
export const SPOT_OBJECT_VOICES = {
  intro: [
    (count: number) => `Fíjate con atención en estas ${count} tarjetas y encuentra el dibujo diferente.`,
    (count: number) => `Abre bien los ojos. Entre estas ${count} tarjetas hay una que no es igual.`,
    (count: number) => `Vamos allá: busca qué tarjeta tiene el dibujo distinto entre las ${count}.`,
    (count: number) => `Concéntrate bien. Hay ${count} tarjetas en la mesa y una es diferente.`,
  ],
  guessing: [
    '¿Dónde estaba el objeto diferente? Toca su carta.',
    '¿Te acuerdas de cuál era el dibujo distinto? Señálalo.',
    '¿En qué tarjeta estaba el que no era igual? Toca la casilla.',
    'A ver qué buena vista tienes: ¿dónde estaba el dibujo diferente?',
  ],
  correct: [
    '¡Lo viste enseguida! Ahí estaba el diferente.',
    '¡Exacto! Ese era el que no cuadraba con los demás.',
    '¡Muy bien visto! Tienes una vista de lince.',
    '¡Perfecto! Has encontrado el dibujo diferente.',
    '¡En el blanco! Te diste cuenta al instante.',
  ],
  wrong: [
    'Esa carta no era la diferente. Prueba con otra.',
    'Ahí no estaba el distinto. Mira con tranquilidad.',
    'Casi, pero esa es igual que las otras. Sigue buscando.',
    'Ese dibujo se repite. Toca otra tarjeta.',
  ],
}

// -------------------------------------------------------------
// WHERE WAS IT (¿Dónde estaba?)
// -------------------------------------------------------------
export const WHERE_WAS_IT_VOICES = {
  intro: [
    (total: number, flipped: number) =>
      `Fíjate bien. Hay ${total} tarjetas en la mesa. Voltearemos ${flipped} con distintos objetos. Pulsa cuando estés listo.`,
    (total: number, flipped: number) =>
      `Vamos a jugar con ${total} tarjetas. Descubriremos ${flipped} objetos diferentes. Toca el botón cuando quieras empezar.`,
    (total: number, flipped: number) =>
      `Atención a la mesa: de las ${total} tarjetas, voltearemos ${flipped} con objetos. Pulsa cuando quieras.`,
  ],
  showing: [
    (flipped: number) => `Fíjate bien en estos ${flipped} objetos y recuerda dónde está cada uno.`,
    (flipped: number) => `Mira con atención los ${flipped} objetos y grábate su posición en la mesa.`,
    (flipped: number) => `¡Atento! Memoriza qué objeto hay en cada una de las ${flipped} casillas.`,
  ],
  guessing: [
    (estaba: string, name: string) => `¿Dónde ${estaba} ${name}? Toca la tarjeta.`,
    (estaba: string, name: string) => `¿Te acuerdas de en qué casilla ${estaba} ${name}? Señálala.`,
    (estaba: string, name: string) => `A ver esa memoria: ¿dónde ${estaba} ${name}?`,
  ],
  correct: [
    (estaba: string, name: string) => `¡Exacto! Ahí ${estaba} ${name}.`,
    (estaba: string, name: string) => `¡Qué memoria tan buena! Justo ahí ${estaba} ${name}.`,
    (estaba: string, name: string) => `¡En el clavo! Recordaste dónde ${estaba} ${name}.`,
    (estaba: string, name: string) => `¡Maravilloso! Ahí ${estaba} ${name}. No se te escapa una.`,
  ],
  wrong: [
    (estaba: string) => `Ahí no ${estaba}. Prueba en otra tarjeta.`,
    (estaba: string) => `En esa casilla no ${estaba}. Busca con calma.`,
    (estaba: string) => `Casi, pero ahí no ${estaba}. Toca otra tarjeta.`,
    (estaba: string) => `Por ahí no ${estaba}. Tómate tu tiempo y elige otra.`,
  ],
}

// -------------------------------------------------------------
// FACES AND NAMES (Caras y nombres)
// -------------------------------------------------------------
export const FACES_AND_NAMES_VOICES = {
  intro: [
    (name: string) => `${name}. ¡Fíjate bien en sus rasgos!`,
    (name: string) => `Aquí tenemos a ${name}. ¡Recuerda su cara!`,
    (name: string) => `Mira con atención a ${name}. ¡Grábate su rostro!`,
    (name: string) => `Te presento a ${name}. ¡Mírale bien a los ojos!`,
  ],
  playPrompt: [
    'Pulsa jugar para adivinar su cara.',
    'Cuando estés listo, pulsa el botón de jugar.',
    'Toca jugar para encontrar su rostro en el tablero.',
    'Dale al botón de jugar para buscar su cara.',
  ],
  guessing: [
    (name: string) => `¿Quién es ${name}? Toca su cara.`,
    (name: string) => `¿Dónde está la cara de ${name}? Señálala.`,
    (name: string) => `¿Reconoces a ${name} entre estas personas? Toca su foto.`,
    (name: string) => `Busca la cara de ${name} en el tablero.`,
  ],
  correct: [
    (name: string) => `¡Exacto! Esa es la cara de ${name}.`,
    (name: string) => `¡Muy bien! Reconociste a ${name} enseguida.`,
    (name: string) => `¡Qué memoria para las caras! Esa persona es ${name}.`,
    (name: string) => `¡Perfecto! Reconociste a ${name}. No se te olvida una cara.`,
  ],
  wrong: [
    (personName: string, targetName: string) =>
      `Esa cara es de ${personName}. Busca a ${targetName}.`,
    (personName: string, targetName: string) =>
      `Esa persona es ${personName}. Con calma, busca el rostro de ${targetName}.`,
    (personName: string, targetName: string) =>
      `No es ${personName}, queremos encontrar a ${targetName}. Prueba otra vez.`,
  ],
}

// -------------------------------------------------------------
// ODD ONE OUT (El Intruso)
// -------------------------------------------------------------
export const ODD_ONE_OUT_VOICES = {
  intro: [
    (category: string) => `Toca el dibujo que no pertenece a ${category}.`,
    (category: string) => `En esta familia hay un intruso. Señala el que no encaja con ${category}.`,
    (category: string) => `Mira bien estos dibujos. ¿Cuál de ellos no tiene nada que ver con ${category}?`,
    (category: string) => `Busca el elemento que se ha colado entre ${category}.`,
  ],
  correct: [
    (name: string, category: string) => `¡Correcto! ${name} no pertenece a ${category}.`,
    (name: string, category: string) => `¡Bien visto! ${name} era el intruso en ${category}.`,
    (name: string, category: string) => `¡Exacto! ${name} no tiene nada que ver con ${category}.`,
    (name: string) => `¡Lo cazaste! ${name} no encajaba con el resto.`,
  ],
  wrong: [
    (category: string) => `Ese dibujo sí pertenece a ${category}. Prueba con otro.`,
    (category: string) => `Ese es de la misma familia de ${category}. Busca el que sobra.`,
    (category: string) => `Ese sí encaja en ${category}. Tómate tu tiempo y busca el intruso.`,
  ],
}

// -------------------------------------------------------------
// SAYINGS (Refranes populares)
// -------------------------------------------------------------
export const SAYINGS_VOICES = {
  intro: [
    (start: string) => `Completa este refrán: "${start}"`,
    (start: string) => `A ver si te suena este refrán de siempre: "${start}"`,
    (start: string) => `Un dicho popular de toda la vida: "${start}". ¿Cómo sigue?`,
    (start: string) => `Seguro que lo has oído muchas veces: "${start}"`,
  ],
  correctPraise: [
    '¡Qué sabiduría popular!',
    '¡Te lo sabes al dedillo!',
    '¡Un refrán lleno de razón!',
    '¡Exactamente así se dice!',
    '¡Qué bien dicho está!',
  ],
  wrong: [
    'Ese final no rima con este refrán. Prueba la otra opción.',
    'Casi, pero la tradición dice otra cosa. Toca la otra frase.',
    'Ese no es el final de este dicho. Prueba con la otra opción.',
  ],
}

// -------------------------------------------------------------
// DAILY COINS (Monedas del día / Monedero)
// -------------------------------------------------------------
export const DAILY_COINS_VOICES = {
  overLimit: [
    'Te has pasado de precio. Quita alguna moneda de arriba para corregir.',
    'Suma más de la cuenta. Toca una moneda de la bandeja para retirarla.',
    'Nos hemos pasado del total. Quita una moneda y vuelve a probar.',
  ],
  wrongSum: [
    'Tienes las monedas pedidas pero no dan el precio justo. Prueba otra combinación.',
    'Esa suma no coincide exactamente con el precio. Cambia alguna moneda.',
    'Casi lo tienes, pero el total no es el exacto. Prueba otra combinación de monedas.',
  ],
  coinsReset: [
    'Monedas retiradas. Elige de nuevo entre las 10 monedas.',
    'Bandeja limpia. Vuelve a elegir las monedas con calma.',
    'Empezamos de nuevo con este producto. Elige tus monedas.',
  ],
  correct: [
    (price: string) => `¡Importe exacto! Has pagado justo los ${price}.`,
    (price: string) => `¡Perfecto! El precio de ${price} está clavado al céntimo.`,
    (price: string) => `¡Muy bien calculado! Ya tenemos los ${price} preparados.`,
    () => `¡Excelente cuenta! Tu monedero funciona a las mil maravillas.`,
  ],
}

// -------------------------------------------------------------
// STEP ORDER (Paso a paso)
// -------------------------------------------------------------
export const STEP_ORDER_VOICES = {
  firstStep: [
    (title: string) => `${title}. ¿Qué hacemos en primer lugar?`,
    (title: string) => `Vamos a ordenar: ${title}. ¿Cuál es el primer paso?`,
    (title: string) => `Organizando ${title}: ¿con qué empezamos?`,
  ],
  nextStep: [
    (stepNum: number) => `¿Y qué hacemos en el paso número ${stepNum}?`,
    (stepNum: number) => `¿Cuál es el paso ${stepNum} que viene ahora?`,
    () => `¿Qué paso toca hacer a continuación?`,
    () => `¿Y después de eso, qué hacemos?`,
  ],
  completed: [
    '¡Muy bien ordenado! Todo en su orden natural.',
    '¡Perfecto! Los pasos han quedado perfectamente organizados.',
    '¡Magnífico trabajo! Da gusto ver las cosas bien hechas.',
    '¡Excelente! Así es exactamente como se hace.',
  ],
  wrong: [
    'Ese paso va después. Piensa qué tenemos que hacer antes.',
    'Aún no toca ese paso. Busca qué se hace primero.',
    'Ese va más adelante. Tómate tu tiempo y busca el paso previo.',
  ],
}

// -------------------------------------------------------------
// SWEET PIANO (El Piano de Colores)
// -------------------------------------------------------------
export const SWEET_PIANO_VOICES = {
  turn: [
    '¡Ahora te toca a ti! Repite las notas.',
    '¡Tu turno! Toca las teclas en el mismo orden.',
    'A ver cómo suena: repite la melodía.',
    '¡Te toca! Pulsa las notas que han sonado.',
  ],
  success: [
    '¡Música para los oídos! Qué bien lo has tocado.',
    '¡Bravo! Has repetido las notas a la perfección.',
    '¡Qué buen oído musical tienes! Estupendo.',
    '¡Maravilloso! Te ha salido con mucho ritmo.',
  ],
  gentleRetry: [
    'No pasa nada. Escucha con calma la melodía otra vez.',
    'Casi sale. Vuelve a escuchar las notas con tranquilidad.',
    'Sin prisa. Afina el oído y escucha de nuevo la canción.',
  ],
}

// -------------------------------------------------------------
// MEMORY PAIRS (Parejas de memoria)
// -------------------------------------------------------------
export const MEMORY_PAIRS_VOICES = {
  intro: [
    'Toca dos cartas para descubrir los dibujos y buscar las parejas iguales.',
    'Pon a prueba tu memoria: voltea dos cartas para encontrar parejas.',
    'Busca las parejas que tienen el mismo dibujo dándoles la vuelta.',
  ],
  pairFound: [
    (name: string) => `¡Muy bien! Pareja de ${name} encontrada.`,
    (name: string) => `¡Eso es! Ya tienes las dos cartas de ${name}.`,
    () => `¡Estupendo! Una pareja más para el marcador.`,
    () => `¡Qué buena memoria! Dos cartas iguales descubiertas.`,
    () => `¡Excelente! Ya tenemos otra pareja lista.`,
  ],
  noMatch: [
    'Esas dos no son iguales. Fíjate bien en dónde están.',
    'Distintos dibujos. Recuerda sus posiciones para luego.',
    'Casi, pero no hacen pareja. Con calma, prueba otra vez.',
  ],
  allCompleted: [
    '¡Enhorabuena! Has encontrado todas las parejas con gran memoria.',
    '¡Fantástico! Has emparejado todo el tablero a la perfección.',
    '¡Qué memoria visual tan magnífica! Todas las parejas reunidas.',
  ],
}
