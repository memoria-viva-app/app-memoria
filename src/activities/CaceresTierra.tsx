import { useState, useEffect, useRef } from 'react'
import { sound } from '../services/sound'
import { speech } from '../services/speech'
import { SuccessCelebration } from '../components/SuccessCelebration'
import { pickRandom, GENERAL_RETRIES } from '../services/voiceFeedback'

interface Props {
  onComplete: () => void
  onExit: () => void
}

type RoundCategory =
  | 'foto-caceres'
  | 'foto-comarca'
  | 'habla'
  | 'tradiciones'
  | 'recetas'

interface TierraQuestion {
  id: string
  category: RoundCategory
  prompt: string
  clue: string
  photo?: string
  emoji?: string
  correct: string
  wrongs: string[]
}

const STORAGE_KEY = 'memoria_viva_recent_caceres_tierra'

const TIERRA_PRAISES = [
  '¡Qué bien conoces nuestra tierra!',
  '¡Eso es! De pura cepa cacereña.',
  '¡Exacto! Qué buenos recuerdos.',
  '¡Muy bien dicho, sí señor!',
  '¡Clavado! Conoces cada rincón.',
  '¡Bravo! Así se conoce lo nuestro.',
]

function getRecentIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentIds(newIds: string[]) {
  try {
    const current = getRecentIds()
    // Guardamos las últimas 65 preguntas jugadas para ofrecer muchísimas partidas distintas sin repetir
    const combined = Array.from(new Set([...newIds, ...current])).slice(0, 65)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
  } catch {
    // ignorar errores de almacenamiento
  }
}

function pickFreshQuestion(pool: TierraQuestion[], recent: string[]): TierraQuestion {
  const unplayed = pool.filter((q) => !recent.includes(q.id))
  const candidates = unplayed.length > 0 ? unplayed : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// ============================================================================
// RONDA 1: FOTOS REALES DE CÁCERES CAPITAL (12 rincones emblemáticos)
// ============================================================================
const CACERES_PHOTO_ITEMS: TierraQuestion[] = [
  {
    id: 'cc-plaza-mayor',
    category: 'foto-caceres',
    prompt: '¿Qué lugar de Cáceres vemos en la foto?',
    clue: 'El gran punto de encuentro con sus soportales frente a la muralla',
    photo: './tierra/plaza-mayor.jpg',
    correct: 'La Plaza Mayor',
    wrongs: ['La Plaza de San Mateo', 'El Paseo de Cánovas', 'La Plaza de Colón'],
  },
  {
    id: 'cc-torre-bujaco',
    category: 'foto-caceres',
    prompt: '¿Qué monumento cacereño aparece aquí?',
    clue: 'La célebre torre almohade junto a la Ermita de la Paz',
    photo: './tierra/torre-bujaco.jpg',
    correct: 'La Torre de Bujaco',
    wrongs: ['La Torre de los Púlpitos', 'El Palacio de Godoy', 'La Cruz de los Caídos'],
  },
  {
    id: 'cc-arco-estrella',
    category: 'foto-caceres',
    prompt: '¿Cómo se llama esta entrada a la Parte Antigua?',
    clue: 'Su arco ancho en esviaje dejaba pasar los antiguos carruajes',
    photo: './tierra/arco-estrella.jpg',
    correct: 'El Arco de la Estrella',
    wrongs: ['El Arco del Cristo', 'La Puerta de Mérida', 'El Arco de Santa Ana'],
  },
  {
    id: 'cc-san-jorge',
    category: 'foto-caceres',
    prompt: '¿Qué plaza monumental de Cáceres es esta?',
    clue: 'Su iglesia blanca de dos torres vigila la hornacina del patrón',
    photo: './tierra/plaza-san-jorge.jpg',
    correct: 'La Plaza de San Jorge',
    wrongs: ['La Plaza de las Veletas', 'La Plaza de Santiago', 'La Plaza de San Juan'],
  },
  {
    id: 'cc-santa-maria',
    category: 'foto-caceres',
    prompt: '¿Qué templo principal de la Parte Antigua vemos?',
    clue: 'Guarda en su interior al venerado Cristo Negro de Cáceres',
    photo: './tierra/santa-maria.jpg',
    correct: 'Concatedral de Santa María',
    wrongs: ['Iglesia de San Mateo', 'Ermita de la Paz', 'Convento de San Pablo'],
  },
  {
    id: 'cc-paseo-canovas',
    category: 'foto-caceres',
    prompt: '¿Por qué paseo tan querido de Cáceres caminamos aquí?',
    clue: 'El bulevar arbolado de los paseos de tarde donde está El Bombo',
    photo: './tierra/paseo-canovas.jpg',
    correct: 'El Paseo de Cánovas',
    wrongs: ['La Avenida de España', 'Ronda del Carmen', 'Calle San Pedro'],
  },
  {
    id: 'cc-virgen-montana',
    category: 'foto-caceres',
    prompt: '¿Qué santuario tan querido domina toda la ciudad?',
    clue: 'En lo alto de la sierra cuida de todos los cacereños nuestra Patrona',
    photo: './tierra/virgen-montana.jpg',
    correct: 'Santuario de la Montaña',
    wrongs: ['Ermita del Vaquero', 'Ermita de San Vito', 'Convento del Palancar'],
  },
  {
    id: 'cc-golfines',
    category: 'foto-caceres',
    prompt: '¿Qué palacio señorial de Cáceres muestra esta fachada?',
    clue: 'Aquí se alojaron los Reyes Católicos cuando visitaban la ciudad',
    photo: './tierra/golfines-abajo.jpg',
    correct: 'Palacio de los Golfines',
    wrongs: ['Palacio de Carvajal', 'Casa del Sol', 'Palacio de Moctezuma'],
  },
  {
    id: 'cc-torre-ciguenas',
    category: 'foto-caceres',
    prompt: '¿Qué palacio con torre alta preside San Mateo?',
    clue: 'Fue la única torre noble de Cáceres que se libró de ser desmochada',
    photo: './tierra/torre-ciguenas.jpg',
    correct: 'Palacio de las Cigüeñas',
    wrongs: ['Casa de los Becerra', 'Torre del Horno', 'Palacio Episcopal'],
  },
  {
    id: 'cc-aljibe-veletas',
    category: 'foto-caceres',
    prompt: '¿Qué joya subterránea de Cáceres vemos en la imagen?',
    clue: 'Antiguo depósito de agua con arcos de herradura bajo el Museo',
    photo: './tierra/aljibe-veletas.jpg',
    correct: 'El Aljibe de las Veletas',
    wrongs: ['Los Baños Romanos', 'La Cueva de Maltravieso', 'La Mina de Valdeflores'],
  },
  {
    id: 'cc-calle-pintores',
    category: 'foto-caceres',
    prompt: '¿Qué calle céntrica de Cáceres reconoces aquí?',
    clue: 'La calle peatonal de tiendas que une San Juan con la Plaza Mayor',
    photo: './tierra/calle-pintores.jpg',
    correct: 'La Calle Pintores',
    wrongs: ['La Calle Moret', 'La Calle Gran Vía', 'La Calle Sancti Espíritu'],
  },
  {
    id: 'cc-parque-principe',
    category: 'foto-caceres',
    prompt: '¿Qué gran parque verde de Cáceres aparece en la foto?',
    clue: 'Famoso por sus arboledas, fuentes, esculturas al aire libre y estanques',
    photo: './tierra/parque-principe.jpg',
    correct: 'El Parque del Príncipe',
    wrongs: ['El Parque del Rodeo', 'El Olivar Chico', 'Paseo Alto'],
  },
]

// ============================================================================
// RONDA 2: FOTOS DE HERRERA DE ALCÁNTARA Y ALREDEDORES (15 lugares)
// ============================================================================
const COMARCA_PHOTO_ITEMS: TierraQuestion[] = [
  {
    id: 'ha-iglesia',
    category: 'foto-comarca',
    prompt: '¿De qué pueblo nuestro es esta Iglesia de San Sebastián?',
    clue: 'Su campanario de piedra preside el caserío junto al Tajo Internacional',
    photo: './tierra/herrera-pueblo.jpg',
    correct: 'Herrera de Alcántara',
    wrongs: ['Brozas', 'Casar de Cáceres', 'Arroyo de la Luz', 'Montánchez'],
  },
  {
    id: 'ha-ayuntamiento',
    category: 'foto-comarca',
    prompt: '¿En qué querido pueblo rayano está este Ayuntamiento en fiestas?',
    clue: 'Banderines de colores alegran la plaza de este balcón natural del Tajo',
    photo: './tierra/herrera-calle.jpg',
    correct: 'Herrera de Alcántara',
    wrongs: ['Miajadas', 'Jaraíz de la Vera', 'Logrosán', 'Navalmoral'],
  },
  {
    id: 'ha-tajo',
    category: 'foto-comarca',
    prompt: '¿Qué río y paraje natural fronterizo vemos aquí?',
    clue: 'Sus aguas y riberos separan España y Portugal junto a Herrera y Cedillo',
    photo: './tierra/tajo-internacional.jpg',
    correct: 'El Tajo Internacional',
    wrongs: ['El Río Jerte', 'La Garganta la Olla', 'El Río Ambroz', 'El Guadiana'],
  },
  {
    id: 'ha-puente-alcantara',
    category: 'foto-comarca',
    prompt: '¿Qué puente milenario cruza el Tajo en nuestra comarca?',
    clue: 'Obra maestra romana de seis grandes arcos con arco triunfal en el centro',
    photo: './tierra/puente-alcantara.jpg',
    correct: 'Puente de Alcántara',
    wrongs: ['Puente de Almaraz', 'Puente de Coria', 'Acueducto de Mérida', 'Puente del Cardenal'],
  },
  {
    id: 'ha-san-benito',
    category: 'foto-comarca',
    prompt: '¿Qué histórico monumento de la comarca de Alcántara es?',
    clue: 'Sede mayor de la Orden Militar de Alcántara, muy cerca de Herrera',
    photo: './tierra/san-benito-alcantara.jpg',
    correct: 'Convento de San Benito',
    wrongs: ['Monasterio de Yuste', 'Castillo de Belvís', 'Abadía de Sotofermoso', 'Convento del Palancar'],
  },
  {
    id: 'pr-barruecos',
    category: 'foto-comarca',
    prompt: '¿Cómo se llama este paraje natural a un paso de Cáceres?',
    clue: 'En Malpartida de Cáceres, famoso por sus charcas, bolos de granito y cigüeñas',
    photo: './tierra/barruecos.jpg',
    correct: 'Los Barruecos',
    wrongs: ['Los Llanos de Trujillo', 'La Garganta de los Infiernos', 'Sierra de Gata', 'Cornalvo'],
  },
  {
    id: 'pr-garrovillas',
    category: 'foto-comarca',
    prompt: '¿De qué pueblo cercano a Cáceres es esta famosa Plaza Mayor?',
    clue: 'Una de las plazas porticadas con arcos y columnas más bonitas de España',
    photo: './tierra/garrovillas.jpg',
    correct: 'Garrovillas de Alconétar',
    wrongs: [' Pasarón de la Vera', 'Cabezuela del Valle', 'Guadalupe', 'Hervás'],
  },
  {
    id: 'pr-monfrague',
    category: 'foto-comarca',
    prompt: '¿Qué mirador natural tan famoso de nuestra provincia es?',
    clue: 'Peñón imponente en Monfragüe donde vuelan buitres y cigüeñas negras',
    photo: './tierra/monfrague.jpg',
    correct: 'El Salto del Gitano',
    wrongs: ['El Pico Villuercas', 'El Chorro de la Meancera', 'Puerto de Tornavacas', 'Peña de Francia'],
  },
  {
    id: 'pr-trujillo',
    category: 'foto-comarca',
    prompt: '¿De qué ciudad histórica vecina de Cáceres es esta Plaza Mayor?',
    clue: 'Rodeada de palacios renacentistas y presidida por la estatua ecuestre de Pizarro',
    photo: './tierra/trujillo.jpg',
    correct: 'Trujillo',
    wrongs: ['Plasencia', 'Coria', 'Valencia de Alcántara', 'Zafra'],
  },
  {
    id: 'pr-caparra',
    category: 'foto-comarca',
    prompt: '¿Qué monumento romano único en España vemos en la foto?',
    clue: 'Arco de cuatro caras situado en plena calzada romana de la Vía de la Plata',
    photo: './tierra/caparra.jpg',
    correct: 'El Arco de Cáparra',
    wrongs: ['El Templo de Augustóbriga', 'Ruinas de Regina', 'Puente de Segura', 'Teatro de Medellín'],
  },
  {
    id: 'pr-guadalupe',
    category: 'foto-comarca',
    prompt: '¿Qué gran santuario de la provincia de Cáceres vemos aquí?',
    clue: 'En las Villuercas guarda la talla morena de la Patrona de Extremadura',
    photo: './tierra/guadalupe.jpg',
    correct: 'Monasterio de Guadalupe',
    wrongs: ['Catedral de Coria', 'Monasterio de Yuste', 'Iglesia de Brozas', 'Castillo de Jarandilla'],
  },
  {
    id: 'pr-plasencia',
    category: 'foto-comarca',
    prompt: '¿En qué ciudad del norte cacereño se alza esta Catedral?',
    clue: 'Conocida como la Perla del Valle, tiene Catedral Vieja y Catedral Nueva unidas',
    photo: './tierra/plasencia.jpg',
    correct: 'Plasencia',
    wrongs: ['Navalmoral de la Mata', 'Miajadas', 'Valencia de Alcántara', 'Moraleja'],
  },
  {
    id: 'pr-coria',
    category: 'foto-comarca',
    prompt: '¿De qué ciudad amurallada junto al río Alagón es esta Catedral?',
    clue: 'Célebre también por sus fiestas taurinas de San Juan en el casco histórico',
    photo: './tierra/coria.jpg',
    correct: 'Coria',
    wrongs: ['Trujillo', 'Montánchez', 'Alcántara', 'Jaraíz de la Vera'],
  },
  {
    id: 'pr-jerte',
    category: 'foto-comarca',
    prompt: '¿Qué valle cacereño se viste así de blanco cada primavera?',
    clue: 'Más de un millón de cerezos florecen a la vez en sus bancales',
    photo: './tierra/valle-jerte.jpg',
    correct: 'El Valle del Jerte',
    wrongs: ['Los Ibores', 'La Campiña de Alcántara', 'Llanos de Cáceres', 'Las Hurdes'],
  },
  {
    id: 'pr-hervas',
    category: 'foto-comarca',
    prompt: '¿En qué pueblo cacereño del Valle del Ambroz está este barrio?',
    clue: 'Calles estrechas de entramado de madera de castaño y adobe en su Barrio Judío',
    photo: './tierra/hervas.jpg',
    correct: 'Hervás',
    wrongs: ['Casar de Cáceres', 'Aliseda', 'Ceclavín', 'Zorita'],
  },
]

// ============================================================================
// RONDA 3: ASÍ HABLAMOS AQUÍ — Expresiones cacereñas, castúo y La Raya (24)
// ============================================================================
const HABLA_ITEMS: TierraQuestion[] = [
  {
    id: 'hb-arrecio',
    category: 'habla',
    emoji: '🥶',
    prompt: '«¡Cierra la puerta que vengo arrecío!»',
    clue: '¿Qué quiere decir estar "arrecío" en Cáceres?',
    correct: 'Estar muerto de frío, helado',
    wrongs: ['Estar muy enfadado', 'Venir con mucha hambre', 'Tener mucho sueño'],
  },
  {
    id: 'hb-entrillar',
    category: 'habla',
    emoji: '🚪',
    prompt: '«¡Ay, me he entrillado el dedo con el cajón!»',
    clue: '¿Qué significa "entrillarse" en nuestra tierra?',
    correct: 'Pillarse un dedo con puerta o cajón',
    wrongs: ['Mancharse de barro', 'Olvidarse las llaves dentro', 'Cortarse el pelo corto'],
  },
  {
    id: 'hb-achiperres',
    category: 'habla',
    emoji: '🧰',
    prompt: '«Recoge del patio todos esos achiperres»',
    clue: '¿Qué son los "achiperres"?',
    correct: 'Trastos, cachivaches o herramientas',
    wrongs: ['Dulces recién horneados', 'Pájaros del tejado', 'Macetas con geranios'],
  },
  {
    id: 'hb-ajilar',
    category: 'habla',
    emoji: '🚶‍♂️',
    prompt: '«¡Ajila p’alante, que perdemos el autobús!»',
    clue: '¿Qué nos piden cuando dicen "¡ajila!"?',
    correct: 'Darse prisa y caminar ligero',
    wrongs: ['Sentarse a descansar', 'Hablar más bajito', 'Ponerse el abrigo'],
  },
  {
    id: 'hb-farraguas',
    category: 'habla',
    emoji: '👕',
    prompt: '«¡Muchacho, qué farraguas vas hoy!»',
    clue: '¿Cómo va vestido alguien "farraguas"?',
    correct: 'Desaliñado, con la ropa mal puesta',
    wrongs: ['De punta en blanco de boda', 'Con ropa demasiado pequeña', 'Vestido de carnaval'],
  },
  {
    id: 'hb-agaligarse',
    category: 'habla',
    emoji: '👔',
    prompt: '«¡Agalígate bien esa camisa antes de salir!»',
    clue: '¿Qué es "agaligarse"?',
    correct: 'Meterse bien la camisa y arreglarse',
    wrongs: ['Quitarse los zapatos', 'Lavarse la cara con agua fría', 'Subirse el cuello por el viento'],
  },
  {
    id: 'hb-barruntar',
    category: 'habla',
    emoji: '🌩️',
    prompt: '«Barrunto que esta tarde cae tormenta»',
    clue: '¿Qué significa "barruntar"?',
    correct: 'Presentir o notar señales de algo',
    wrongs: ['Desechar una idea', 'Barrer la puerta de la calle', 'Discutir con el vecino'],
  },
  {
    id: 'hb-escusao',
    category: 'habla',
    emoji: '👀',
    prompt: '«¡No seas tan escusao, que todo lo quieres saber!»',
    clue: '¿Cómo es una persona "escusá" o "escusao"?',
    correct: 'Muy curiosa, cotilla o entrometida',
    wrongs: ['Muy tímida y callada', 'Demasiado despistada', 'Muy generosa invitando'],
  },
  {
    id: 'hb-pitera',
    category: 'habla',
    emoji: '🤕',
    prompt: '«Jugando en la calle se cayó y se hizo una pitera»',
    clue: '¿Qué es hacerse una "pitera"?',
    correct: 'Una brecha o herida en la cabeza',
    wrongs: ['Un agujero en el pantalón', 'Una cabaña con ramas', 'Una flauta de caña'],
  },
  {
    id: 'hb-lambuzo',
    category: 'habla',
    emoji: '🍰',
    prompt: '«¡Qué lambuzo eres cuando ves perrunillas!»',
    clue: '¿Qué significa ser un "lambuzo"?',
    correct: 'Ser muy goloso o glotón',
    wrongs: ['Ser mal cocinero', 'Comer muy despacio', 'No querer probar nada nuevo'],
  },
  {
    id: 'hb-choncho',
    category: 'habla',
    emoji: '🍈',
    prompt: '«No partas aún ese melón, que está choncho»',
    clue: '¿Cómo está la fruta cuando está "choncha"?',
    correct: 'Todavía verde, dura o sin sabor',
    wrongs: ['Demasiado dulce y pasada', 'Recién traída del pozo fría', 'Sin pepitas dentro'],
  },
  {
    id: 'hb-feje',
    category: 'habla',
    emoji: '🪵',
    prompt: '«Trajo un buen feje de leña para la lumbre»',
    clue: '¿Qué es un "feje"?',
    correct: 'Un haz o montón atado de leña',
    wrongs: ['Un carro tirado por mulas', 'Un hacha pequeña de mano', 'Una chispa del brasero'],
  },
  {
    id: 'hb-catovi',
    category: 'habla',
    emoji: '🏰',
    prompt: '«Mi vecino presume de ser un auténtico Catovi»',
    clue: '¿Qué significa en Cáceres la palabra "Catovi"?',
    correct: 'Cacereño de Toda la Vida',
    wrongs: ['Cantante de coplas antiguas', 'Caminante de la Vía de la Plata', 'Capitán de la Torre Vieja'],
  },
  {
    id: 'hb-deto',
    category: 'habla',
    emoji: '🍽️',
    prompt: '«En el convite pusieron jamón, queso, dulces y de tó»',
    clue: '¿Qué expresa esa coletilla tan cacereña de "…y de tó"?',
    correct: 'Que hubo gran abundancia de todo',
    wrongs: ['Que faltó comida en la mesa', 'Que terminó muy temprano', 'Que cada uno pagó lo suyo'],
  },
  {
    id: 'hb-fala-herrera',
    category: 'habla',
    emoji: '🇵🇹',
    prompt: '«En Herrera de Alcántara y Cedillo los mayores aún recordaban el portugués»',
    clue: '¿Por qué se conservó ese habla tan especial en Herrera de Alcántara?',
    correct: 'Por ser pueblo rayano junto a Portugal',
    wrongs: ['Porque allí veraneaban marineros del norte', 'Por un antiguo mercado francés', 'Por los pastores trashumantes sorianos'],
  },
  {
    id: 'hb-pelona',
    category: 'habla',
    emoji: '❄️',
    prompt: '«¡Vaya pelona ha caído esta mañana en la dehesa!»',
    clue: '¿Qué es caer una buena "pelona"?',
    correct: 'Una helada muy fuerte al amanecer',
    wrongs: ['Una tarde de mucho bochorno', 'Una bandada de estorninos', 'Quedarse sin hojas en verano'],
  },
  {
    id: 'hb-esmorecio',
    category: 'habla',
    emoji: '😮‍💨',
    prompt: '«Después de subir la cuesta llego esmorecío»',
    clue: '¿Qué significa estar "esmorecío"?',
    correct: 'Agotado, sin aliento o desfallecido',
    wrongs: ['Muy ilusionado y contento', 'Manchado de polvo blanco', 'Con ganas de bailar'],
  },
  {
    id: 'hb-traspuesto',
    category: 'habla',
    emoji: '😴',
    prompt: '«Con el calorcito del brasero me quedé traspuesto»',
    clue: '¿Qué es quedarse "traspuesto"?',
    correct: 'Quedarse adormilado echando un sueñecito',
    wrongs: ['Equivocarse de calle al volver', 'Cambiar los muebles de sitio', 'Perder el turno en la tienda'],
  },
  {
    id: 'hb-fresco',
    category: 'habla',
    emoji: '🪑',
    prompt: '«En verano sacábamos las sillas para tomar el fresco»',
    clue: '¿En qué consistía esta costumbre tan nuestra?',
    correct: 'Sentarse a la puerta al anochecer a charlar',
    wrongs: ['Bañarse en el pilón a mediodía', 'Ir a comprar hielo a la plaza', 'Abrir todas las alacenas'],
  },
  {
    id: 'hb-chupa',
    category: 'habla',
    emoji: '☔',
    prompt: '«Volviendo por Cánovas nos cayó una buena chupa»',
    clue: '¿Qué es pillarte una "chupa de agua"?',
    correct: 'Un chaparrón fuerte que te cala entero',
    wrongs: ['Una ráfaga de viento seco', 'Beber agua fresca de la fuente', 'Un charco pequeño en la acera'],
  },
  {
    id: 'hb-esconchao',
    category: 'habla',
    emoji: '🧱',
    prompt: '«Hay que dar cal, que el zócalo está esconchao»',
    clue: '¿Qué significa que una pared o plato esté "esconchao"?',
    correct: 'Que le ha saltado un trozo de cal o esmalte',
    wrongs: ['Que brilla como recién pintado', 'Que está torcido hacia un lado', 'Que tiene humedad del río'],
  },
  {
    id: 'hb-acho',
    category: 'habla',
    emoji: '👋',
    prompt: '«¡Chacho, qué alegría encontrarte por aquí!»',
    clue: '¿De dónde viene nuestro saludo "¡chacho!" o "¡acho!"?',
    correct: 'De acortar con cariño la palabra muchacho',
    wrongs: ['Del nombre de un antiguo alcalde', 'De llamar a las ovejas en el monte', 'De una canción portuguesa'],
  },
  {
    id: 'hb-resol',
    category: 'habla',
    emoji: '☀️',
    prompt: '«Ponte a la sombra, que aquí pega mucho el resol»',
    clue: '¿Qué es el "resol"?',
    correct: 'El reflejo fuerte y caluroso del sol en las paredes',
    wrongs: ['La primera brisa fresca de la mañana', 'El canto de las chicharras en julio', 'La sombra alargada del campanario'],
  },
  {
    id: 'hb-rabudo',
    category: 'habla',
    emoji: '😠',
    prompt: '«Hoy se ha levantado un poco rabudo»',
    clue: '¿Qué quiere decir estar "rabudo" o con mal temple?',
    correct: 'Estar malhumorado o enfurruñado',
    wrongs: ['Estar con mucha prisa por salir', 'Estar muy elegante para ir a misa', 'Tener hipo después de comer'],
  },
]

// ============================================================================
// RONDA 4: CALLES, FIESTAS Y TRADICIONES DE CÁCERES Y HERRERA (24)
// ============================================================================
const TRADICIONES_ITEMS: TierraQuestion[] = [
  {
    id: 'tr-bombo',
    category: 'tradiciones',
    emoji: '🎺',
    prompt: '¿Cómo llamamos todos en Cáceres al quiosco blanco de la música del Paseo de Cánovas?',
    clue: 'Un icono redondo donde tocaba la banda municipal',
    correct: 'El Bombo',
    wrongs: ['La Glorieta', 'El Palomar', 'La Pérgola'],
  },
  {
    id: 'tr-mascarra',
    category: 'tradiciones',
    emoji: '🎭',
    prompt: '¿Cómo se llama el tradicional desfile de carnaval con disfraces rústicos de Herrera de Alcántara?',
    clue: 'Los vecinos se cubrían el rostro con pieles, sábanas y ropas antiguas',
    correct: 'La Mascarrá',
    wrongs: ['Los Empalaos', 'El Jarramplas', 'Las Carantoñas'],
  },
  {
    id: 'tr-dia-rosca',
    category: 'tradiciones',
    emoji: '🥨',
    prompt: '¿Qué fiesta tradicional celebra Herrera de Alcántara en febrero cerca de Las Candelas?',
    clue: 'Lleva el nombre de un dulce típico muy esperado por todo el pueblo',
    correct: 'El Día de la Rosca',
    wrongs: ['El Día del Hornazo', 'La Fiesta de la Bellota', 'El Martes Mayor'],
  },
  {
    id: 'tr-san-sebastian',
    category: 'tradiciones',
    emoji: '⛪',
    prompt: '¿Quién es el santo patrón de Herrera de Alcántara cuya fiesta celebramos el 20 de enero?',
    clue: 'También da nombre a la iglesia parroquial del pueblo',
    correct: 'San Sebastián',
    wrongs: ['San Isidro', 'San Roque', 'San Antón'],
  },
  {
    id: 'tr-san-juan-herrera',
    category: 'tradiciones',
    emoji: '🔥',
    prompt: '¿Qué fiestas mayores de verano celebra Herrera de Alcántara los días 23, 24 y 25 de junio?',
    clue: 'Días de convivencia vecinal, música y hogueras al empezar el verano',
    correct: 'Las Fiestas de San Juan',
    wrongs: ['Las Fiestas del Pilar', 'Las Ferias de Septiembre', 'San Miguel'],
  },
  {
    id: 'tr-fatima-herrera',
    category: 'tradiciones',
    emoji: '🌸',
    prompt: '¿En honor a qué Virgen sale de romería Herrera de Alcántara cada mes de mayo?',
    clue: 'Una romería primaveral muy querida en esta tierra fronteriza con Portugal',
    correct: 'La Virgen de Fátima',
    wrongs: ['La Virgen del Rocío', 'La Virgen del Puerto', 'La Virgen de Argeme'],
  },
  {
    id: 'tr-balcon-tajo',
    category: 'tradiciones',
    emoji: '⛴️',
    prompt: '¿Cómo se llama el barco turístico que navega por el río junto al embarcadero de Herrera de Alcántara?',
    clue: 'Recorre los impresionantes cortados entre España y Portugal',
    correct: 'El Balcón del Tajo',
    wrongs: ['La Estrella del Sur', 'El Crucero del Jerte', 'La Barca de Alconétar'],
  },
  {
    id: 'tr-dragon-sanjorge',
    category: 'tradiciones',
    emoji: '🐉',
    prompt: '¿Qué figura gigante se quema en la Plaza Mayor de Cáceres la víspera del 23 de abril?',
    clue: 'Tras el desfile de moros y cristianos en honor a San Jorge',
    correct: 'El Dragón de San Jorge',
    wrongs: ['La Tarasca', 'La Sardina de Carnaval', 'El Toro de Fuego'],
  },
  {
    id: 'tr-bajada-virgen',
    category: 'tradiciones',
    emoji: '👑',
    prompt: '¿A quién recibe todo Cáceres con flores y emoción cuando baja desde su santuario antes de mayo?',
    clue: 'Permanece en la Concatedral de Santa María durante su solemne Novenario',
    correct: 'A la Virgen de la Montaña',
    wrongs: ['A la Virgen de Guadalupe', 'A Santa Cecilia', 'A la Virgen de la Luz'],
  },
  {
    id: 'tr-lavanderas',
    category: 'tradiciones',
    emoji: '🧺',
    prompt: '¿Qué fiesta popular cacereña de febrero viste refajo tradicional y quema al Pelele?',
    clue: 'Recuerda a las mujeres que antiguamente iban a lavar la ropa con alegría',
    correct: 'Las Lavanderas',
    wrongs: ['Las Candelas de Mayo', 'Los Escobazos', 'Las Mayordomas'],
  },
  {
    id: 'tr-cruz-caidos',
    category: 'tradiciones',
    emoji: '⛲',
    prompt: '¿En qué céntrica plaza redonda al final de Cánovas quedaba siempre la gente en Cáceres?',
    clue: 'El punto de encuentro clásico para empezar el paseo o ir al cine',
    correct: 'La Cruz de los Caídos',
    wrongs: ['La Plaza de Italia', 'El Puente de San Francisco', 'La Ronda Norte'],
  },
  {
    id: 'tr-cristo-negro',
    category: 'tradiciones',
    emoji: '🕯️',
    prompt: '¿Qué sobrecogedora imagen procesiona en absoluto silencio la medianoche del Miércoles Santo en Cáceres?',
    clue: 'Sale únicamente por las callejuelas empedradas de la Ciudad Monumental',
    correct: 'El Cristo Negro',
    wrongs: ['La Borriquita', 'El Resucitado', 'El Cristo de la Victoria'],
  },
  {
    id: 'tr-feria-mayo',
    category: 'tradiciones',
    emoji: '🎡',
    prompt: '¿Por qué festividad se llena Cáceres de casetas, atracciones y paseo de caballos a finales de mayo?',
    clue: 'Las grandes Ferias de Mayo cacereñas en torno al día 30',
    correct: 'La Feria de San Fernando',
    wrongs: ['La Feria de San Mateo', 'La Feria de San Miguel', 'Las Fiestas de Agosto'],
  },
  {
    id: 'tr-ciguena-negra',
    category: 'tradiciones',
    emoji: '🦅',
    prompt: '¿Qué ave tan valiosa y protegida anida en los riberos del Tajo en Herrera de Alcántara?',
    clue: 'Prima esquiva de la cigüeña blanca de nuestras torres, joya de la Reserva de la Biosfera',
    correct: 'La Cigüeña Negra',
    wrongs: ['El Flamenco Rosado', 'El Urogallo', 'La Gaviota Plateada'],
  },
  {
    id: 'tr-puente-cabrioso',
    category: 'tradiciones',
    emoji: '🌉',
    prompt: '¿Cómo se llama el puente antiguo de piedra de las rutas camineras de Herrera de Alcántara?',
    clue: 'Un rincón con mucha historia entre dehesas y arroyos del término herrereño',
    correct: 'Puente Viejo de Cabrioso',
    wrongs: ['Puente de San Francisco', 'Puente Nuevo del Jerte', 'Puente de la Macarena'],
  },
  {
    id: 'tr-mirador-negrales',
    category: 'tradiciones',
    emoji: '🔭',
    prompt: '¿Qué conocido mirador de Herrera de Alcántara ofrece vistas espectaculares sobre el río Tajo?',
    clue: 'Desde allí se contemplan los cañones fluviales y la vecina orilla portuguesa',
    correct: 'El Mirador de Negrales',
    wrongs: ['El Balcón del Valle', 'El Mirador de la Peña', 'El Risco de San Blas'],
  },
  {
    id: 'tr-puerto-herrera',
    category: 'tradiciones',
    emoji: '⚓',
    prompt: 'Antiguamente, desde el puerto fluvial de Herrera de Alcántara salían barcos por el Tajo hasta…',
    clue: 'Navegaban río abajo cruzando Portugal hasta desembocar en el Atlántico',
    correct: 'Lisboa',
    wrongs: ['Sevilla', 'Oporto', 'Toledo'],
  },
  {
    id: 'tr-calle-amargura',
    category: 'tradiciones',
    emoji: '🏮',
    prompt: '¿Qué callejuela empinada y llena de leyendas sube por el corazón de la Parte Antigua de Cáceres?',
    clue: 'Su nombre suena a Semana Santa y a viejos romances entre palacios',
    correct: 'La Calle Amargura',
    wrongs: ['La Calle Ancha', 'La Avenida Virgen de Guadalupe', 'La Calle Gil Cordero'],
  },
  {
    id: 'tr-plaza-sanjuan',
    category: 'tradiciones',
    emoji: '☕',
    prompt: '¿Qué animada plaza al pie de la Calle Pintores ha sido siempre rincón de terrazas y recados en Cáceres?',
    clue: 'Presidida por la iglesia donde se casaron nobles y vecinos durante siglos',
    correct: 'La Plaza de San Juan',
    wrongs: ['La Plaza de Toros', 'La Plaza de Santiago', 'La Plaza de las Canterías'],
  },
  {
    id: 'tr-vostell',
    category: 'tradiciones',
    emoji: '🎨',
    prompt: '¿En qué antiguo lavadero de lanas junto a Cáceres está el original Museo Vostell?',
    clue: 'Rodeado por las charcas y peñascos graníticos de Los Barruecos',
    correct: 'En Malpartida de Cáceres',
    wrongs: ['En Casar de Cáceres', 'En Torreorgaz', 'En Sierra de Fuentes'],
  },
  {
    id: 'tr-dia-luz',
    category: 'tradiciones',
    emoji: '🐎',
    prompt: '¿En qué pueblo vecino de Cáceres son famosísimas las carreras de caballos del Día de la Luz?',
    clue: 'Se celebran cada Lunes de Pascua entre jinetes y romeros',
    correct: 'En Arroyo de la Luz',
    wrongs: ['En Montánchez', 'En Alcuéscar', 'En Cañaveral'],
  },
  {
    id: 'tr-jamon-montanchez',
    category: 'tradiciones',
    emoji: '🐖',
    prompt: '¿Qué pueblo serrano de la provincia de Cáceres con castillo en lo alto tiene fama mundial por sus jamones?',
    clue: 'Conocido como el Balcón de Extremadura por sus vistas y su curación al aire frío',
    correct: 'Montánchez',
    wrongs: ['Navalmoral de la Mata', 'Moraleja', 'Talayuela'],
  },
  {
    id: 'tr-la-raya',
    category: 'tradiciones',
    emoji: '🗺️',
    prompt: '¿Con qué nombre popular conocemos la frontera hispano-portuguesa de Herrera, Cedillo y Valencia de Alcántara?',
    clue: 'Tierra hermana de contrabando antiguo, cafés portugueses y buena vecindad',
    correct: 'La Raya',
    wrongs: ['La Muga', 'La Marca', 'El Lindero'],
  },
  {
    id: 'tr-foro-balbos',
    category: 'tradiciones',
    emoji: '🏛️',
    prompt: '¿Cómo se llama el rincón porticado junto al Ayuntamiento de Cáceres donde está el Pilar de San Francisco?',
    clue: 'Unido a la Plaza Mayor, guarda restos romanos y el antiguo abrevadero plateresco',
    correct: 'El Foro de los Balbos',
    wrongs: ['El Patio de los Naranjos', 'El Rincón de la Monja', 'La Corredera'],
  },
]

// ============================================================================
// RONDA 5: RECETAS TÍPICAS Y SABORES DE NUESTRA TIERRA (24 platos)
// ============================================================================
const RECETAS_ITEMS: TierraQuestion[] = [
  {
    id: 'rc-migas',
    category: 'recetas',
    emoji: '🍳',
    prompt: 'Pan asentado picado muy fino, agua con sal, ajos, pimentón de la Vera, aceite y torreznos…',
    clue: 'En muchas casas nuestras se toman hasta acompañadas con café con leche',
    correct: 'Las Migas Extremeñas',
    wrongs: ['Las Gachas Manchegas', 'El Pisto', 'La Pipirrana'],
  },
  {
    id: 'rc-torta-casar',
    category: 'recetas',
    emoji: '🧀',
    prompt: 'Queso cremoso de oveja cuajado con flor de cardo al que se le quita la «tapa» de arriba para untar:',
    clue: 'Joya gastronómica nacida a pocos kilómetros de Cáceres capital',
    correct: 'La Torta del Casar',
    wrongs: ['El Queso de Cabrales', 'El Queso de Burgos', 'El Requesón con Miel'],
  },
  {
    id: 'rc-patatera',
    category: 'recetas',
    emoji: '🥖',
    prompt: 'Embutido tierno de nuestra tierra hecho con cerdo ibérico, patata cocida, ajo y pimentón de la Vera:',
    clue: 'Riquísima untada en una buena rebanada de pan de pueblo',
    correct: 'La Patatera',
    wrongs: ['La Sobrasada', 'El Butifarrón', 'La Morcilla de Arroz'],
  },
  {
    id: 'rc-tencas',
    category: 'recetas',
    emoji: '🐟',
    prompt: 'Pescado de charca muy tradicional en toda la comarca de Cáceres y Tajo-Salor, delicioso frito o en escabeche:',
    clue: 'Incluso tiene su propia fiesta gastronómica en nuestros pueblos',
    correct: 'Las Tencas Fritas',
    wrongs: ['Los Boquerones', 'El Bacalao al Pil-Pil', 'Las Sardinas Espetadas'],
  },
  {
    id: 'rc-caldereta',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Guiso campero de romerías y fiestas con cordero, ajo, laurel, vino blanco, pimiento y su majado:',
    clue: 'Plato rey cuando nos juntamos toda la familia en el campo',
    correct: 'La Caldereta de Cordero',
    wrongs: ['La Fabada', 'El Cocido Madrileño', 'El Marmitako'],
  },
  {
    id: 'rc-chanfaina',
    category: 'recetas',
    emoji: '🥘',
    prompt: 'Guiso tradicional con asadura de cordero, laurel, ajo, pan frito, pimentón y huevo duro picado:',
    clue: 'Receta humilde de pastores con un sabor inconfundible',
    correct: 'La Chanfaina Extremeña',
    wrongs: ['La Ropa Vieja', 'El Salmorejo', 'Los Callos con Garbanzos'],
  },
  {
    id: 'rc-perrunillas',
    category: 'recetas',
    emoji: '🍪',
    prompt: 'Pastas redondas y arenosas de manteca de cerdo, harina, azúcar, canela y ralladura de limón:',
    clue: 'Nunca faltan en una bandeja con el café ni en las fiestas del pueblo',
    correct: 'Las Perrunillas',
    wrongs: ['Los Sobaos', 'Los Fartons', 'Las Ensaimadas'],
  },
  {
    id: 'rc-repapalos',
    category: 'recetas',
    emoji: '🥛',
    prompt: 'Bollitos esponjosos de miga de pan y huevo fritos en sartén y cocidos en leche con canela y limón:',
    clue: 'También se hacen salados en caldo, pero dulces en Semana Santa son gloria bendita',
    correct: 'Los Repápalos con Leche',
    wrongs: ['El Arroz con Leche', 'Los Buñuelos de Viento', 'La Leche Frita'],
  },
  {
    id: 'rc-zorongollo',
    category: 'recetas',
    emoji: '🫑',
    prompt: 'Ensalada jugosa de pimientos rojos asados a la lumbre en tiras con tomate, cebolla, ajo y aceite de oliva:',
    clue: 'Acompañamiento perfecto para carnes o con huevo duro por encima',
    correct: 'El Zorongollo Extremeño',
    wrongs: ['La Escalivada con Anchoas', 'El Rin-Ran', 'El Moje Manchego'],
  },
  {
    id: 'rc-perdiz-alcantara',
    category: 'recetas',
    emoji: '🐦',
    prompt: 'Receta histórica nacida en el Convento de San Benito de Alcántara que viajó hasta los fogones de Francia:',
    clue: 'Guisada con esmero según el famoso recetario monacal alcantarino',
    correct: 'La Perdiz al Modo de Alcántara',
    wrongs: ['El Pollo al Ajillo', 'El Pavo Trufado de Navidad', 'Las Codornices con Alubias'],
  },
  {
    id: 'rc-sopa-tomate',
    category: 'recetas',
    emoji: '🍅',
    prompt: 'Rebanadas muy finas de pan casero empapadas en un sofrito lento de tomate maduro, pimiento, cebolla y ajo:',
    clue: 'Qué rica está en verano servida con uvas o higos dulces al lado',
    correct: 'La Sopa de Tomate',
    wrongs: ['La Porrusalda', 'La Sopa Castellana', 'El Caldo Gallego'],
  },
  {
    id: 'rc-flores',
    category: 'recetas',
    emoji: '🌼',
    prompt: 'Dulce crujiente hecho mojando un molde de hierro caliente en masa de huevo y leche antes de freírlo:',
    clue: 'Bañadas con miel de la sierra o espolvoreadas con azúcar y canela',
    correct: 'Las Flores Extremeñas',
    wrongs: ['Los Pestiños Sevillanos', 'Los Churros de Feria', 'Las Orejas de Carnaval'],
  },
  {
    id: 'rc-gazpacho',
    category: 'recetas',
    emoji: '🥣',
    prompt: 'Majado tradicional de verano con ajo, miga de pan, tomate, pimiento, pepino, aceite de oliva y buen vinagre:',
    clue: 'Servido bien fresquito con tropezones picados por encima para aliviar la calor',
    correct: 'El Gazpacho Extremeño',
    wrongs: ['El Ajoblanco con Uvas', 'La Vichyssoise', 'La Sopa de Picadillo'],
  },
  {
    id: 'rc-cojondongo',
    category: 'recetas',
    emoji: '🫒',
    prompt: 'Plato campero majado en dornillo de madera con ajo, miga de pan, aceite, vinagre, tomate y pimiento:',
    clue: 'Primo espeso y lleno de fuerza del gazpacho que alimentaba en el campo',
    correct: 'El Cojondongo',
    wrongs: ['El Atascaburras', 'El Guirlache', 'La Mazamorra'],
  },
  {
    id: 'rc-rosca-candelas',
    category: 'recetas',
    emoji: '🍩',
    prompt: 'Dulce festivo en forma de rueda grande adornada que protagoniza febrero en Herrera de Alcántara:',
    clue: 'Da nombre al tradicional Día de la Rosca junto a Las Candelas',
    correct: 'La Rosca Tradicional',
    wrongs: ['El Roscón de Reyes', 'La Mona de Pascua', 'La Tarta de Santiago'],
  },
  {
    id: 'rc-prueba-cerdo',
    category: 'recetas',
    emoji: '🥩',
    prompt: 'Magro de cerdo ibérico picado y adobado con ajo, orégano, sal y pimentón de la Vera pasado por la sartén:',
    clue: 'Se hacía el día de la matanza para «probar» el aliño de los chorizos',
    correct: 'La Prueba de Matanza',
    wrongs: ['El Lacón con Grelos', 'El Cochifrito Segoviano', 'La Carne Mechada'],
  },
  {
    id: 'rc-esparragos',
    category: 'recetas',
    emoji: '🌿',
    prompt: 'Revuelto con huevos camperos y los tallos silvestres que salimos a coger junto a las paredes de piedra tras llover:',
    clue: 'Uno de los manjares más sabrosos de nuestras dehesas en primavera',
    correct: 'Revuelto de Espárragos Trigueros',
    wrongs: ['Tortilla de Habas', 'Menestra de Alcachofas', 'Acelgas Rehogadas'],
  },
  {
    id: 'rc-tecula-mecula',
    category: 'recetas',
    emoji: '🥧',
    prompt: 'Famoso postre antiguo de origen imperial con base de hojaldre, almendra molida y crema suave de yema:',
    clue: 'Una de las tartas más finas y tradicionales de la repostería extremeña',
    correct: 'La Técula Mécula',
    wrongs: ['El Tocino de Cielo', 'La Quesada Pasiega', 'El Brazo de Gitano'],
  },
  {
    id: 'rc-hornazo',
    category: 'recetas',
    emoji: '🥟',
    prompt: 'Bollo o empanada horneada con chorizo, lomo o huevo duro que llevábamos de merienda al campo en Pascua:',
    clue: 'Inseparable de las romerías primaverales y del Día de la Luz',
    correct: 'El Hornazo',
    wrongs: ['El Pan de Calatrava', 'La Coca de Verduras', 'El Mollete'],
  },
  {
    id: 'rc-sopa-ajo',
    category: 'recetas',
    emoji: '🧄',
    prompt: 'Caldo reconfortante de invierno con ajos dorados, pan del día anterior, pimentón de la Vera y huevo escalfado:',
    clue: 'Entona el cuerpo enseguida en las noches más frías de enero',
    correct: 'La Sopa de Ajo Extremeña',
    wrongs: ['La Sopa de Pescado', 'El Consomé al Jerez', 'Las Gachas Dulces'],
  },
  {
    id: 'rc-ensalada-naranja',
    category: 'recetas',
    emoji: '🍊',
    prompt: 'Plato fresco de invierno con rodajas de naranja aliñadas con aceite de oliva, huevo duro o bacalao y cebolla:',
    clue: 'Contraste delicioso entre lo dulce, lo salado y el buen aceite de la tierra',
    correct: 'Ensalada Hurdana de Naranja',
    wrongs: ['Macedonia en Almíbar', 'Salpicón de Marisco', 'Tomate Relleno'],
  },
  {
    id: 'rc-rosquillas-anis',
    category: 'recetas',
    emoji: '🥨',
    prompt: 'Rosquillas caseras amasadas con aceite frito con cáscara de naranja, aguardiente y granitos de matalahúva:',
    clue: 'Guardadas en lata en la despensa aguantaban tiernas semanas enteras',
    correct: 'Las Rosquillas de Anís',
    wrongs: ['Los Macarons', 'Las Palmeritas de Chocolate', 'Los Polvorones'],
  },
  {
    id: 'rc-caldillo-tajo',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'En los pueblos ribereños como Herrera de Alcántara y Alcántara, los peces del Tajo se preparaban con ajo, laurel, vinagre y pimentón en…',
    clue: 'Una forma tradicional de conservar y saborear la pesca del río varios días',
    correct: 'Escabeche Ribereño del Tajo',
    wrongs: ['Zarzuela de Marisco', 'Caldero del Mar Menor', 'Merluza a la Sidra'],
  },
  {
    id: 'rc-pimenton-vera',
    category: 'recetas',
    emoji: '🌶️',
    prompt: '¿Qué condimento rojo secado al humo de encina o roble da color y aroma único a casi todos nuestros guisos y matanzas?',
    clue: 'El auténtico «oro rojo» de la provincia de Cáceres',
    correct: 'El Pimentón de la Vera',
    wrongs: ['El Azafrán en Hebra', 'El Comino Molido', 'La Pimienta Blanca'],
  },
]

const ROUND_META: {
  badge: string
  optionCount: number
  borderColor: string
  badgeBg: string
  cardBg: string
}[] = [
  {
    badge: 'Ronda 1/5 · Cáceres Capital',
    optionCount: 2,
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 border-emerald-400 text-emerald-950',
    cardBg: 'bg-emerald-50 border-emerald-300',
  },
  {
    badge: 'Ronda 2/5 · Herrera y Provincia',
    optionCount: 3,
    borderColor: 'border-teal-500',
    badgeBg: 'bg-teal-100 border-teal-400 text-teal-950',
    cardBg: 'bg-teal-50 border-teal-300',
  },
  {
    badge: 'Ronda 3/5 · Nuestra Habla',
    optionCount: 3,
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-100 border-amber-400 text-amber-950',
    cardBg: 'bg-amber-50 border-amber-300',
  },
  {
    badge: 'Ronda 4/5 · Calles y Tradiciones',
    optionCount: 4,
    borderColor: 'border-rose-500',
    badgeBg: 'bg-rose-100 border-rose-400 text-rose-950',
    cardBg: 'bg-rose-50 border-rose-300',
  },
  {
    badge: 'Ronda 5/5 · Recetas Típicas',
    optionCount: 4,
    borderColor: 'border-orange-500',
    badgeBg: 'bg-orange-100 border-orange-400 text-orange-950',
    cardBg: 'bg-orange-50 border-orange-300',
  },
]

function buildSession(): TierraQuestion[] {
  const recent = getRecentIds()
  const q1 = pickFreshQuestion(CACERES_PHOTO_ITEMS, recent)
  const q2 = pickFreshQuestion(COMARCA_PHOTO_ITEMS, recent)
  const q3 = pickFreshQuestion(HABLA_ITEMS, recent)
  const q4 = pickFreshQuestion(TRADICIONES_ITEMS, recent)
  const q5 = pickFreshQuestion(RECETAS_ITEMS, recent)
  const session = [q1, q2, q3, q4, q5]
  saveRecentIds(session.map((q) => q.id))
  return session
}

function buildOptionsForRound(q: TierraQuestion, roundIdx: number): string[] {
  const count = ROUND_META[roundIdx]?.optionCount || 3
  const wrongs = [...q.wrongs].sort(() => 0.5 - Math.random()).slice(0, count - 1)
  return [q.correct, ...wrongs].sort(() => 0.5 - Math.random())
}

export function CaceresTierra({ onComplete, onExit }: Props) {
  const [sessionItems, setSessionItems] = useState<TierraQuestion[]>(() => buildSession())
  const [roundIdx, setRoundIdx] = useState(0)
  const [options, setOptions] = useState<string[]>(() =>
    buildOptionsForRound(sessionItems[0], 0),
  )
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [isSuccess, setIsSuccess] = useState(false)
  const isAdvancingRef = useRef(false)

  useEffect(() => {
    return () => {
      speech.stop()
    }
  }, [])

  const startNewSession = () => {
    const fresh = buildSession()
    setSessionItems(fresh)
    setRoundIdx(0)
    setOptions(buildOptionsForRound(fresh[0], 0))
    setSelectedAnswer(null)
    setFeedback('')
    setIsSuccess(false)
    isAdvancingRef.current = false
  }

  const currentItem = sessionItems[roundIdx] || sessionItems[0]
  const meta = ROUND_META[roundIdx] || ROUND_META[0]
  const isPhotoRound = Boolean(currentItem.photo)

  const handleSelectOption = (option: string) => {
    if (isAdvancingRef.current) return
    sound.playTap()
    setSelectedAnswer(option)

    if (option === currentItem.correct) {
      isAdvancingRef.current = true
      sound.playSuccess()
      const praise = pickRandom(TIERRA_PRAISES)
      setFeedback(`¡Exacto! ${currentItem.correct}.`)

      let hasAdv = false
      const advance = () => {
        if (hasAdv) return
        hasAdv = true
        setTimeout(() => {
          const nextIdx = roundIdx + 1
          if (nextIdx < sessionItems.length) {
            const nextQ = sessionItems[nextIdx]
            setRoundIdx(nextIdx)
            setOptions(buildOptionsForRound(nextQ, nextIdx))
            setSelectedAnswer(null)
            setFeedback('')
            isAdvancingRef.current = false
          } else {
            setIsSuccess(true)
            onComplete()
          }
        }, 450)
      }

      const dur = speech.estimateDurationMs(praise)
      speech.speak(praise, advance)
      setTimeout(advance, dur + 2200)
    } else {
      sound.playGentleRetry()
      setFeedback('Esa no es. Fíjate bien y prueba con otra opción.')
      speech.speak(pickRandom(GENERAL_RETRIES))
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto overflow-hidden h-full">
      <div
        className={`flex-1 flex flex-col justify-between bg-white border-3 sm:border-4 ${meta.borderColor} rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-md text-center min-h-0 overflow-hidden gap-1.5 sm:gap-2.5`}
      >
        {/* Barra superior de ronda */}
        <div className="flex items-center justify-between gap-2 px-1 shrink-0">
          <h3 className="text-base sm:text-2xl md:text-3xl font-black text-stone-950 text-left leading-tight truncate">
            {isPhotoRound ? currentItem.prompt : meta.badge.split('·')[1]?.trim()}
          </h3>
          <span
            className={`px-2.5 sm:px-4 py-1 sm:py-1.5 border-2 font-black rounded-xl sm:rounded-2xl text-sm sm:text-xl shrink-0 ${meta.badgeBg}`}
          >
            {roundIdx + 1}/5
          </span>
        </div>

        {/* Contenido central: Fotografía real (Rondas 1 y 2) o Tarjeta ilustrada (Rondas 3, 4 y 5) */}
        {isPhotoRound ? (
          <div className="flex-1 min-h-0 flex flex-col gap-1.5 sm:gap-2 overflow-hidden">
            <div className="relative flex-1 min-h-0 w-full rounded-2xl border-2 sm:border-3 border-stone-300 overflow-hidden bg-stone-900 shadow-inner">
              {/* Fondo difuminado de la propia imagen para no dejar huecos ni bandas vacías */}
              <img
                src={currentItem.photo}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110 select-none pointer-events-none"
              />
              <img
                src={currentItem.photo}
                alt={currentItem.clue}
                className="relative z-10 w-full h-full object-contain select-none"
              />
            </div>
            <p className="text-xs sm:text-lg md:text-xl font-bold text-stone-700 bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1 leading-snug shrink-0">
              💡 {currentItem.clue}
            </p>
          </div>
        ) : (
          <div
            className={`${meta.cardBg} border-2 sm:border-3 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 shrink-0`}
          >
            <span className="text-5xl sm:text-7xl leading-none shrink-0" aria-hidden="true">
              {currentItem.emoji}
            </span>
            <div className="text-center sm:text-left min-w-0">
              <p className="font-black text-stone-950 text-lg sm:text-3xl leading-snug">
                {currentItem.prompt}
              </p>
              <p className="font-bold text-stone-700 text-sm sm:text-xl mt-0.5 sm:mt-1 leading-snug">
                {currentItem.clue}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de respuesta */}
        {feedback && (
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-sm sm:text-xl shrink-0">
            {feedback}
          </div>
        )}

        {/* Botones de opciones */}
        <div
          className={`w-full grid gap-1.5 sm:gap-3 items-stretch ${
            isPhotoRound
              ? options.length === 2
                ? 'shrink-0 grid-cols-1 sm:grid-cols-2'
                : 'shrink-0 grid-cols-1 sm:grid-cols-3'
              : options.length === 3
              ? 'flex-1 min-h-0 grid-cols-1 grid-rows-3'
              : 'flex-1 min-h-0 grid-cols-2 grid-rows-2'
          }`}
        >
          {options.map((option) => {
            const isChosen = selectedAnswer === option
            const isCorrect = option === currentItem.correct

            let btnClasses =
              'bg-stone-50 hover:bg-emerald-50 border-stone-300 hover:border-emerald-500 text-stone-950'
            if (isChosen) {
              btnClasses = isCorrect
                ? 'bg-emerald-600 border-emerald-700 text-white ring-3 ring-emerald-300'
                : 'bg-amber-100 border-amber-400 text-amber-950 opacity-80'
            }

            return (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                className={`w-full h-full rounded-xl sm:rounded-2xl border-2 sm:border-3 px-3 sm:px-4 ${
                  isPhotoRound
                    ? 'py-2 sm:py-3.5 min-h-[44px] sm:min-h-[60px] text-lg sm:text-2xl'
                    : options.length === 3
                    ? 'py-2 px-3 text-lg sm:text-3xl min-h-0'
                    : 'py-2 px-2.5 text-base sm:text-3xl min-h-0'
                } flex items-center justify-center text-center font-black leading-tight cursor-pointer transition-all active:scale-95 shadow-xs ${btnClasses}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {isSuccess && (
        <SuccessCelebration
          title="¡Orgullo de nuestra tierra!"
          message="Has recorrido Cáceres, Herrera de Alcántara, nuestras palabras, tradiciones y recetas de toda la vida."
          onRestart={startNewSession}
          onHome={onExit}
        />
      )}
    </div>
  )
}
