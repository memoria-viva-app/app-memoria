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
  '¡Qué memoria tan estupenda tienes!',
  '¡Olé! Ni un detalle se te escapa.',
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
    // Guardamos las últimas 140 preguntas jugadas para ofrecer decenas de partidas distintas sin repetir
    const combined = Array.from(new Set([...newIds, ...current])).slice(0, 140)
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
// RONDA 1: FOTOS REALES DE CÁCERES CAPITAL (24 rincones emblemáticos)
// ============================================================================
const CACERES_PHOTO_ITEMS: TierraQuestion[] = [
  {
    id: 'cc-plaza-mayor',
    category: 'foto-caceres',
    prompt: '¿Qué lugar de Cáceres vemos en la foto?',
    clue: 'El gran punto de encuentro con sus soportales frente a la muralla',
    photo: './tierra/plaza-mayor.jpg',
    correct: 'La Plaza Mayor',
    wrongs: ['La Plaza de San Mateo', 'El Paseo de Cánovas', 'La Plaza de Colón', 'La Plaza de Italia', 'El Paseo Alto'],
  },
  {
    id: 'cc-torre-bujaco',
    category: 'foto-caceres',
    prompt: '¿Qué monumento cacereño aparece aquí?',
    clue: 'La célebre torre almohade junto a la Ermita de la Paz',
    photo: './tierra/torre-bujaco.jpg',
    correct: 'La Torre de Bujaco',
    wrongs: ['El Palacio de Godoy', 'La Cruz de los Caídos', 'La Casa del Mono', 'La Torre de Sande', 'El Palacio de Abrantes'],
  },
  {
    id: 'cc-arco-estrella',
    category: 'foto-caceres',
    prompt: '¿Cómo se llama esta entrada a la Parte Antigua?',
    clue: 'Su arco ancho en esviaje dejaba pasar los antiguos carruajes',
    photo: './tierra/arco-estrella.jpg',
    correct: 'El Arco de la Estrella',
    wrongs: ['El Arco del Cristo', 'La Puerta de Mérida', 'El Arco de Santa Ana', 'El Arco del Socorro', 'La Puerta de Coria'],
  },
  {
    id: 'cc-san-jorge',
    category: 'foto-caceres',
    prompt: '¿En qué plaza monumental de Cáceres está esta escultura?',
    clue: 'La famosa hornacina de bronce del patrón venciendo al dragón en su escalinata',
    photo: './tierra/plaza-san-jorge.jpg',
    correct: 'La Plaza de San Jorge',
    wrongs: ['La Plaza de las Veletas', 'La Plaza de Santiago', 'La Plaza de San Juan', 'La Plaza de las Canterías', 'La Plaza del Duque'],
  },
  {
    id: 'cc-santa-maria',
    category: 'foto-caceres',
    prompt: '¿Qué templo principal de la Parte Antigua vemos?',
    clue: 'Guarda en su interior al venerado Cristo Negro de Cáceres',
    photo: './tierra/santa-maria.jpg',
    correct: 'Concatedral de Santa María',
    wrongs: ['Iglesia de San Mateo', 'Ermita de la Paz', 'Convento de San Pablo', 'Iglesia de Santo Domingo', 'Ermita de San Antonio'],
  },
  {
    id: 'cc-paseo-canovas',
    category: 'foto-caceres',
    prompt: '¿Por qué paseo tan querido de Cáceres caminamos aquí?',
    clue: 'El bulevar arbolado de los paseos de tarde donde está El Bombo',
    photo: './tierra/paseo-canovas.jpg',
    correct: 'El Paseo de Cánovas',
    wrongs: ['La Ronda del Carmen', 'La Calle San Pedro', 'La Avenida de la Montaña', 'La Calle Margallo', 'El Camino Llano'],
  },
  {
    id: 'cc-virgen-montana',
    category: 'foto-caceres',
    prompt: '¿Qué santuario tan querido domina toda la ciudad?',
    clue: 'En lo alto de la sierra cuida de todos los cacereños nuestra Patrona',
    photo: './tierra/virgen-montana.jpg',
    correct: 'Santuario de la Montaña',
    wrongs: ['Ermita del Vaquero', 'Ermita de San Vito', 'Convento del Palancar', 'Ermita del Calvario', 'Ermita de las Candelas'],
  },
  {
    id: 'cc-golfines',
    category: 'foto-caceres',
    prompt: '¿Qué palacio señorial de Cáceres muestra esta fachada?',
    clue: 'Aquí se alojaron los Reyes Católicos cuando visitaban la ciudad',
    photo: './tierra/golfines-abajo.jpg',
    correct: 'Palacio de los Golfines',
    wrongs: ['Palacio de la Isla', 'Casa de los Trucos', 'Palacio de Ovando', 'Casa Mudéjar', 'Palacio de Mayoralgo'],
  },
  {
    id: 'cc-torre-ciguenas',
    category: 'foto-caceres',
    prompt: '¿Qué palacio con torre alta preside San Mateo?',
    clue: 'Fue la única torre noble de Cáceres que se libró de ser desmochada',
    photo: './tierra/torre-ciguenas.jpg',
    correct: 'Palacio de las Cigüeñas',
    wrongs: ['Casa de los Becerra', 'Torre del Horno', 'Palacio Episcopal', 'Casa del Águila', 'Torre de Espaderos'],
  },
  {
    id: 'cc-aljibe-veletas',
    category: 'foto-caceres',
    prompt: '¿Qué joya subterránea de Cáceres vemos en la imagen?',
    clue: 'Antiguo depósito hispanomusulmán con arcos de herradura bajo el Museo',
    photo: './tierra/aljibe-veletas.jpg',
    correct: 'El Aljibe de las Veletas',
    wrongs: ['Los Baños Romanos', 'La Cueva de Maltravieso', 'La Mina de Valdeflores', 'La Cripta de San Francisco', 'El Pozo del Rey'],
  },
  {
    id: 'cc-calle-pintores',
    category: 'foto-caceres',
    prompt: '¿Qué calle céntrica de Cáceres reconoces aquí?',
    clue: 'La calle peatonal de tiendas que une San Juan con la Plaza Mayor',
    photo: './tierra/calle-pintores.jpg',
    correct: 'La Calle Pintores',
    wrongs: ['La Calle Moret', 'La Calle Pizarro', 'La Calle Sancti Espíritu', 'La Calle Parras', 'La Avenida de Alemania'],
  },
  {
    id: 'cc-parque-principe',
    category: 'foto-caceres',
    prompt: '¿Qué gran parque verde de Cáceres aparece en la foto?',
    clue: 'Famoso por sus arboledas, fuentes, esculturas al aire libre y estanques',
    photo: './tierra/parque-principe.jpg',
    correct: 'El Parque del Príncipe',
    wrongs: ['El Parque del Rodeo', 'El Olivar Chico', 'El Parque de Cánovas', 'El Parque del Padre Pacífico', 'La Ribera del Marco'],
  },
  {
    id: 'cc-carvajal',
    category: 'foto-caceres',
    prompt: '¿Qué palacio cacereño tiene esta famosa Torre Redonda?',
    clue: 'Situado junto a Santa María, tiene un precioso jardín con una gran higuera',
    photo: './tierra/carvajal.jpg',
    correct: 'El Palacio de Carvajal',
    wrongs: ['El Palacio de Godoy', 'La Casa de los Caballos', 'El Palacio de Ulloa', 'La Casa de Aldana', 'El Palacio de Pereros'],
  },
  {
    id: 'cc-casa-sol',
    category: 'foto-caceres',
    prompt: '¿Cómo conocemos popularmente este palacio con matacán?',
    clue: 'De la familia Solís, luce un sol con rostro humano en su escudo de piedra',
    photo: './tierra/casa-del-sol.jpg',
    correct: 'La Casa del Sol',
    wrongs: ['La Casa de la Luna', 'La Casa de las Veletas', 'La Casa del Mono', 'La Casa de los Ribera', 'El Palacio de Generala'],
  },
  {
    id: 'cc-moctezuma',
    category: 'foto-caceres',
    prompt: '¿Qué palacio con cúpula se alza junto a la muralla norte?',
    clue: 'Mandado edificar con rentas de los descendientes del emperador azteca',
    photo: './tierra/moctezuma.jpg',
    correct: 'Palacio de Toledo-Moctezuma',
    wrongs: ['Palacio de la Diputación', 'Casa de Ovando Mogollón', 'Palacio de los Duques de Valencia', 'Convento de Santa Clara', 'Casa de Moragas'],
  },
  {
    id: 'cc-san-francisco-javier',
    category: 'foto-caceres',
    prompt: '¿Qué iglesia blanca de dos torres preside la Plaza de San Jorge?',
    clue: 'Templo barroco jesuita conocido también como Iglesia de la Preciosa Sangre',
    photo: './tierra/san-francisco-javier.jpg',
    correct: 'Iglesia de San Francisco Javier',
    wrongs: ['Iglesia de Santo Domingo', 'Ermita del Espíritu Santo', 'Convento de San Pedro', 'Iglesia de Fátima', 'Ermita del Amparo'],
  },
  {
    id: 'cc-san-mateo',
    category: 'foto-caceres',
    prompt: '¿Qué iglesia preside la parte más alta de la Ciudad Monumental?',
    clue: 'Levantada donde estuvo la antigua mezquita, junto al Convento de San Pablo',
    photo: './tierra/san-mateo.jpg',
    correct: 'La Iglesia de San Mateo',
    wrongs: ['La Iglesia de San Blas', 'La Ermita de las Candelas', 'La Iglesia del Buen Pastor', 'El Convento de los Padres Franciscanos', 'Santa María'],
  },
  {
    id: 'cc-san-juan',
    category: 'foto-caceres',
    prompt: '¿Qué iglesia da nombre a esta animada plaza al pie de Pintores?',
    clue: 'Llamada antiguamente San Juan de los Ovejeros por las ferias de ganado',
    photo: './tierra/san-juan.jpg',
    correct: 'Iglesia de San Juan',
    wrongs: ['Iglesia de Santiago', 'Ermita de la Soledad', 'Iglesia de San Eugenio', 'Convento de Santa Clara', 'Ermita del Calvario'],
  },
  {
    id: 'cc-santiago',
    category: 'foto-caceres',
    prompt: '¿Qué templo extramuros guarda un gran retablo de Berruguete?',
    clue: 'Cuna de la Orden de los Fratres de Cáceres y sede del Nazareno',
    photo: './tierra/santiago.jpg',
    correct: 'La Iglesia de Santiago',
    wrongs: ['La Ermita de San Marquino', 'La Iglesia de San Juan Macías', 'El Convento de San Francisco', 'La Ermita de la Paz', 'San Mateo'],
  },
  {
    id: 'cc-torre-pulpitos',
    category: 'foto-caceres',
    prompt: '¿Qué torre cristiana se asoma al lienzo de muralla de la Plaza Mayor?',
    clue: 'Única torre nueva abierta en la muralla en el siglo XV, junto al Arco de la Estrella',
    photo: './tierra/torre-pulpitos.jpg',
    correct: 'La Torre de los Púlpitos',
    wrongs: ['La Torre del Postigo', 'La Torre Redonda', 'La Torre de la Hierba', 'La Torre del Rey', 'La Torre Mocha'],
  },
  {
    id: 'cc-arco-cristo',
    category: 'foto-caceres',
    prompt: '¿Qué puerta milenaria baja hacia la Ribera del Marco?',
    clue: 'Conocida también como Puerta del Río, es la única puerta romana conservada',
    photo: './tierra/arco-cristo.jpg',
    correct: 'El Arco del Cristo',
    wrongs: ['El Arco de Santa Ana', 'El Arco del Socorro', 'La Puerta de Coria', 'El Postigo de Santa María', 'El Arco de San Pedro'],
  },
  {
    id: 'cc-torre-pozos',
    category: 'foto-caceres',
    prompt: '¿Qué torre defensiva vigila el Barrio de San Antonio?',
    clue: 'Torre albarrana almohade sobre la roca que protegía el abastecimiento de agua',
    photo: './tierra/torre-pozos.jpg',
    correct: 'La Torre de los Pozos',
    wrongs: ['La Torre de los Espaderos', 'El Baluarte del Sol', 'La Torre de Carvajal', 'La Torre Desmochada', 'La Torre del Aire'],
  },
  {
    id: 'cc-plaza-toros',
    category: 'foto-caceres',
    prompt: '¿Qué edificio histórico de 1846 vemos junto a la Era de los Mártires?',
    clue: 'Una de las plazas taurinas más antiguas y con más solera de Extremadura',
    photo: './tierra/plaza-toros.jpg',
    correct: 'La Plaza de Toros de Cáceres',
    wrongs: ['El Antiguo Cuartel Infanta Isabel', 'El Gran Teatro', 'El Mercado de Abastos', 'El Hospital Provincial', 'La Estación Vieja'],
  },
  {
    id: 'cc-foro-balbos',
    category: 'foto-caceres',
    prompt: '¿Cómo se llama este atrio junto al Ayuntamiento de Cáceres?',
    clue: 'Allí lucen el Pilar de San Francisco y la estatua del Genio Andrógino',
    photo: './tierra/foro-balbos.jpg',
    correct: 'El Foro de los Balbos',
    wrongs: ['La Plaza de las Canterías', 'El Rincón de la Monja', 'El Adarve del Padre Rosalío', 'La Plaza de Publio Hurtado', 'El Campillo'],
  },
]

// ============================================================================
// RONDA 2: FOTOS DE HERRERA DE ALCÁNTARA, LA RAYA Y PROVINCIA (28 lugares)
// ============================================================================
const COMARCA_PHOTO_ITEMS: TierraQuestion[] = [
  {
    id: 'ha-iglesia',
    category: 'foto-comarca',
    prompt: '¿De qué pueblo nuestro es esta Iglesia de San Sebastián?',
    clue: 'Su campanario de piedra preside el caserío junto al Tajo Internacional',
    photo: './tierra/herrera-pueblo.jpg',
    correct: 'Herrera de Alcántara',
    wrongs: ['Brozas', 'Casar de Cáceres', 'Arroyo de la Luz', 'Montánchez', 'Torrejoncillo'],
  },
  {
    id: 'ha-ayuntamiento',
    category: 'foto-comarca',
    prompt: '¿En qué querido pueblo rayano está este Ayuntamiento en fiestas?',
    clue: 'Banderines de colores alegran la plaza de este balcón natural del Tajo',
    photo: './tierra/herrera-calle.jpg',
    correct: 'Herrera de Alcántara',
    wrongs: ['Miajadas', 'Jaraíz de la Vera', 'Logrosán', 'Navalmoral de la Mata', 'Caminomorisco'],
  },
  {
    id: 'ha-tajo',
    category: 'foto-comarca',
    prompt: '¿Qué río y paraje natural fronterizo vemos aquí?',
    clue: 'Sus aguas y riberos separan España y Portugal junto a Herrera y Cedillo',
    photo: './tierra/tajo-internacional.jpg',
    correct: 'El Tajo Internacional',
    wrongs: ['El Río Jerte', 'La Garganta la Olla', 'El Río Ambroz', 'El Guadiana', 'El Río Tiétar'],
  },
  {
    id: 'ha-puente-alcantara',
    category: 'foto-comarca',
    prompt: '¿Qué puente milenario cruza el Tajo en nuestra comarca?',
    clue: 'Obra maestra romana de seis grandes arcos con arco triunfal en el centro',
    photo: './tierra/puente-alcantara.jpg',
    correct: 'Puente de Alcántara',
    wrongs: ['Puente de Almaraz', 'Puente de Coria', 'Acueducto de Mérida', 'Puente de la Bazagona', 'Puente de Segura'],
  },
  {
    id: 'ha-san-benito',
    category: 'foto-comarca',
    prompt: '¿Qué histórico monumento de la comarca de Alcántara es?',
    clue: 'Sede mayor de la Orden Militar de Alcántara, muy cerca de Herrera',
    photo: './tierra/san-benito-alcantara.jpg',
    correct: 'Convento de San Benito',
    wrongs: ['Castillo de Belvís', 'Abadía de Sotofermoso', 'Convento del Palancar', 'Castillo de Alburquerque', 'Iglesia de Hoyos'],
  },
  {
    id: 'ha-valencia-alcantara',
    category: 'foto-comarca',
    prompt: '¿Qué gran localidad rayana vecina de la comarca vemos entre olivares?',
    clue: 'Famosa por su Barrio Gótico-Judío, la Boda Regia y su cercanía con Portugal',
    photo: './tierra/valencia-alcantara.jpg',
    correct: 'Valencia de Alcántara',
    wrongs: ['Jaraíz de la Vera', 'Talayuela', 'Madrigal de la Vera', 'Baños de Montemayor', 'Guadalupe'],
  },
  {
    id: 'ha-dolmen-raya',
    category: 'foto-comarca',
    prompt: '¿Qué monumento prehistórico abunda entre Valencia y Herrera de Alcántara?',
    clue: 'Grandes losas de piedra milenarias como el dolmen de Las Tomasas o Tapada del Anta',
    photo: './tierra/dolmen-raya.jpg',
    correct: 'Un Dolmen de La Raya',
    wrongs: ['Un Miliario de la Plata', 'Una Fuente Romana', 'Un Horno de Cal', 'Una Noria Árabe', 'Un Chozo del Jerte'],
  },
  {
    id: 'ha-brozas',
    category: 'foto-comarca',
    prompt: '¿En qué villa histórica de la comarca de Alcántara está Santa María la Mayor?',
    clue: 'Cuna de El Brocense, declarada una de las iglesias más monumentales de Extremadura',
    photo: './tierra/brozas.jpg',
    correct: 'Brozas',
    wrongs: ['Pinofranqueado', 'Tornavacas', 'Castañar de Ibor', 'Aldeanueva del Camino', 'Valverde del Fresno'],
  },
  {
    id: 'pr-arroyo-luz',
    category: 'foto-comarca',
    prompt: '¿De qué pueblo vecino de Cáceres es esta Iglesia de la Asunción?',
    clue: 'Guarda el mayor conjunto de tablas pintadas por el Divino Morales',
    photo: './tierra/arroyo-luz.jpg',
    correct: 'Arroyo de la Luz',
    wrongs: ['Cuacos de Yuste', 'Cabezuela del Valle', 'Nuñomoral', 'Garganta la Olla', 'Deleitosa'],
  },
  {
    id: 'pr-vostell',
    category: 'foto-comarca',
    prompt: '¿Qué singular museo rodeado de charcas vemos junto a Cáceres?',
    clue: 'Antiguo lavadero de lanas convertido en museo de arte en Malpartida de Cáceres',
    photo: './tierra/vostell.jpg',
    correct: 'El Museo Vostell',
    wrongs: ['El Museo de las Hurdes', 'El Museo del Queso', 'El Museo del Pimentón', 'El Museo de Historia de Coria', 'El Museo Etnográfico'],
  },
  {
    id: 'pr-barruecos',
    category: 'foto-comarca',
    prompt: '¿Cómo se llama este paraje natural a un paso de Cáceres?',
    clue: 'En Malpartida de Cáceres, famoso por sus charcas, bolos de granito y cigüeñas',
    photo: './tierra/barruecos.jpg',
    correct: 'Los Barruecos',
    wrongs: ['Los Llanos de Trujillo', 'Sierra de Gata', 'Cornalvo', 'Valle del Ambroz', 'Desfiladero de Ruecas'],
  },
  {
    id: 'pr-garrovillas',
    category: 'foto-comarca',
    prompt: '¿De qué pueblo cercano a Cáceres es esta famosa Plaza Mayor?',
    clue: 'Una de las plazas porticadas con arcos y columnas más bonitas de España',
    photo: './tierra/garrovillas.jpg',
    correct: 'Garrovillas de Alconétar',
    wrongs: ['Pasarón de la Vera', 'Cabezuela del Valle', 'Guadalupe', 'Hervás', 'Valverde de la Vera'],
  },
  {
    id: 'pr-monfrague',
    category: 'foto-comarca',
    prompt: '¿Qué mirador natural tan famoso de nuestra provincia es?',
    clue: 'Peñón imponente en Monfragüe donde vuelan buitres y cigüeñas negras',
    photo: './tierra/monfrague.jpg',
    correct: 'El Salto del Gitano',
    wrongs: ['El Pico Villuercas', 'El Chorro de la Meancera', 'Puerto de Tornavacas', 'Puerto de Honduras', 'Risco de la Villuerca'],
  },
  {
    id: 'pr-trujillo',
    category: 'foto-comarca',
    prompt: '¿De qué ciudad histórica vecina de Cáceres es esta Plaza Mayor?',
    clue: 'Rodeada de palacios renacentistas y presidida por la estatua ecuestre de Pizarro',
    photo: './tierra/trujillo.jpg',
    correct: 'Trujillo',
    wrongs: ['Plasencia', 'Coria', 'Valencia de Alcántara', 'Moraleja', 'Miajadas'],
  },
  {
    id: 'pr-caparra',
    category: 'foto-comarca',
    prompt: '¿Qué monumento romano único en España vemos en la foto?',
    clue: 'Arco de cuatro caras situado en plena calzada romana de la Vía de la Plata',
    photo: './tierra/caparra.jpg',
    correct: 'El Arco de Cáparra',
    wrongs: ['El Templo de Augustóbriga', 'Puente de Alconétar', 'Puente de Segura', 'Teatro de Medellín', 'Ruinas de Nertobriga'],
  },
  {
    id: 'pr-guadalupe',
    category: 'foto-comarca',
    prompt: '¿Qué gran santuario de la provincia de Cáceres vemos aquí?',
    clue: 'En las Villuercas guarda la talla morena de la Patrona de Extremadura',
    photo: './tierra/guadalupe.jpg',
    correct: 'Monasterio de Guadalupe',
    wrongs: ['Catedral de Coria', 'Iglesia de Brozas', 'Castillo de Montánchez', 'Convento de San Benito', 'Ermita del Puerto'],
  },
  {
    id: 'pr-plasencia',
    category: 'foto-comarca',
    prompt: '¿En qué ciudad del norte cacereño se alza esta Catedral?',
    clue: 'Conocida como la Perla del Valle, tiene Catedral Vieja y Catedral Nueva unidas',
    photo: './tierra/plasencia.jpg',
    correct: 'Plasencia',
    wrongs: ['Navalmoral de la Mata', 'Miajadas', 'Valencia de Alcántara', 'Moraleja', 'Logrosán'],
  },
  {
    id: 'pr-coria',
    category: 'foto-comarca',
    prompt: '¿De qué ciudad amurallada junto al río Alagón es esta Catedral?',
    clue: 'Célebre también por sus fiestas taurinas de San Juan en el casco histórico',
    photo: './tierra/coria.jpg',
    correct: 'Coria',
    wrongs: ['Trujillo', 'Montánchez', 'Alcántara', 'Jaraíz de la Vera', 'Aliseda'],
  },
  {
    id: 'pr-jerte',
    category: 'foto-comarca',
    prompt: '¿Qué valle cacereño se viste así de blanco cada primavera?',
    clue: 'Más de un millón de cerezos florecen a la vez en sus bancales',
    photo: './tierra/valle-jerte.jpg',
    correct: 'El Valle del Jerte',
    wrongs: ['Los Ibores', 'La Campiña de Alcántara', 'Llanos de Cáceres', 'Sierra de San Pedro', 'Llanos de Brozas'],
  },
  {
    id: 'pr-hervas',
    category: 'foto-comarca',
    prompt: '¿En qué pueblo cacereño del Valle del Ambroz está este barrio?',
    clue: 'Calles estrechas de entramado de madera de castaño y adobe en su Barrio Judío',
    photo: './tierra/hervas.jpg',
    correct: 'Hervás',
    wrongs: ['Casar de Cáceres', 'Aliseda', 'Ceclavín', 'Zorita', 'Madroñera'],
  },
  {
    id: 'pr-montanchez',
    category: 'foto-comarca',
    prompt: '¿Qué castillo vigila desde lo alto esta sierra famosa por sus jamones?',
    clue: 'Llamado el Balcón de Extremadura, entre Cáceres y Mérida',
    photo: './tierra/montanchez.jpg',
    correct: 'El Castillo de Montánchez',
    wrongs: ['El Castillo de Almaraz', 'La Torre de Floripes', 'El Fuerte de Santa Lucía', 'El Castillo de Coria', 'La Alcazaba de Badajoz'],
  },
  {
    id: 'pr-yuste',
    category: 'foto-comarca',
    prompt: '¿En qué tranquilo monasterio de La Vera pasó sus últimos días Carlos V?',
    clue: 'Rodeado de robles, fuentes y huertos en Cuacos de Yuste',
    photo: './tierra/yuste.jpg',
    correct: 'El Monasterio de Yuste',
    wrongs: ['El Convento del Palancar', 'La Abadía de Granadilla', 'San Pedro de Alcántara', 'Santa María de Jesús', 'Convento de la Luz'],
  },
  {
    id: 'pr-pilones',
    category: 'foto-comarca',
    prompt: '¿Cómo se llaman estas pozas naturales talladas en granito en el Jerte?',
    clue: 'En la Reserva Natural de la Garganta de los Infiernos, de aguas cristalinas',
    photo: './tierra/pilones.jpg',
    correct: 'Los Pilones',
    wrongs: ['Las Charcas del Salor', 'Los Baños de Montemayor', 'Las Lagunas de Ruidera', 'El Embalse de Valdecañas', 'La Pesquera'],
  },
  {
    id: 'pr-granadilla',
    category: 'foto-comarca',
    prompt: '¿Qué villa amurallada cacereña asoma como una península sobre el embalse?',
    clue: 'Con su esbelto castillo de piedra junto al pantano de Gabriel y Galán',
    photo: './tierra/granadilla.jpg',
    correct: 'Granadilla',
    wrongs: ['Galisteo', 'Romangordo', 'Serrejón', 'Torrejón el Rubio', 'Membrío'],
  },
  {
    id: 'pr-trevejo',
    category: 'foto-comarca',
    prompt: '¿En qué aldea medieval de Sierra de Gata se alzan las ruinas de este castillo?',
    clue: 'Casas de piedra, tumbas antropomorfas y vistas infinitas hacia la Raya portuguesa',
    photo: './tierra/trevejo.jpg',
    correct: 'Trevejo (Sierra de Gata)',
    wrongs: ['Guijo de Santa Bárbara', 'Peraleda de la Mata', 'Torrequemada', 'Aldea del Cano', 'Santiago del Campo'],
  },
  {
    id: 'pr-melero',
    category: 'foto-comarca',
    prompt: '¿Qué espectacular curva dibuja el río Alagón en el norte de Cáceres?',
    clue: 'Uno de los paisajes más fotografiados de Las Hurdes desde el mirador de la Antigua',
    photo: './tierra/melero.jpg',
    correct: 'El Meandro del Melero',
    wrongs: ['Los Tajos del Sever', 'La Presa de Cedillo', 'La Desembocadura del Almonte', 'El Canal de Orellana', 'Los Canchos de Ramiro'],
  },
  {
    id: 'pr-jarandilla',
    category: 'foto-comarca',
    prompt: '¿En qué castillo de La Vera se alojó el Emperador antes de ir a Yuste?',
    clue: 'Hoy es un precioso Parador con torres y patio de armas en la comarca verata',
    photo: './tierra/jarandilla.jpg',
    correct: 'Castillo de Jarandilla de la Vera',
    wrongs: ['Castillo de las Arguijuelas', 'Palacio de Carvajal', 'Castillo de Monfragüe', 'Torre de Mayoralgo', 'Alcázar de Plasencia'],
  },
  {
    id: 'pr-robledillo',
    category: 'foto-comarca',
    prompt: '¿Qué pueblo de pizarra negra y balcones de madera se esconde en Sierra de Gata?',
    clue: 'Declarado Bien de Interés Cultural por su arquitectura serrana intacta',
    photo: './tierra/robledillo.jpg',
    correct: 'Robledillo de Gata',
    wrongs: ['Casar de Cáceres', 'Malpartida de Cáceres', 'Miajadas', 'Alcuéscar', 'Valdefuentes'],
  },
]

// ============================================================================
// RONDA 3: ASÍ HABLAMOS AQUÍ — Expresiones cacereñas, castúo y La Raya (50)
// ============================================================================
const HABLA_ITEMS: TierraQuestion[] = [
  {
    id: 'hb-arrecio',
    category: 'habla',
    emoji: '🥶',
    prompt: '«¡Cierra la puerta que vengo arrecío!»',
    clue: '¿Qué quiere decir estar "arrecío" en Cáceres?',
    correct: 'Estar muerto de frío, helado',
    wrongs: ['Estar muy enfadado', 'Venir con mucha hambre', 'Tener mucho sueño', 'Llegar empapado en sudor'],
  },
  {
    id: 'hb-entrillar',
    category: 'habla',
    emoji: '🚪',
    prompt: '«¡Ay, me he entrillado el dedo con el cajón!»',
    clue: '¿Qué significa "entrillarse" en nuestra tierra?',
    correct: 'Pillarse un dedo con puerta o cajón',
    wrongs: ['Mancharse de barro', 'Olvidarse las llaves dentro', 'Cortarse el pelo corto', 'Torcerse el tobillo andando'],
  },
  {
    id: 'hb-achiperres',
    category: 'habla',
    emoji: '🧰',
    prompt: '«Recoge del patio todos esos achiperres»',
    clue: '¿Qué son los "achiperres"?',
    correct: 'Trastos, cachivaches o herramientas',
    wrongs: ['Dulces recién horneados', 'Pájaros del tejado', 'Macetas con geranios', 'Sillas de enea nuevas'],
  },
  {
    id: 'hb-ajilar',
    category: 'habla',
    emoji: '🚶‍♂️',
    prompt: '«¡Ajila p’alante, que perdemos el autobús!»',
    clue: '¿Qué nos piden cuando dicen "¡ajila!"?',
    correct: 'Darse prisa y caminar ligero',
    wrongs: ['Sentarse a descansar', 'Hablar más bajito', 'Ponerse el abrigo', 'Mirar hacia atrás'],
  },
  {
    id: 'hb-farraguas',
    category: 'habla',
    emoji: '👕',
    prompt: '«¡Muchacho, qué farraguas vas hoy!»',
    clue: '¿Cómo va vestido alguien "farraguas"?',
    correct: 'Desaliñado, con la ropa mal puesta',
    wrongs: ['De punta en blanco de boda', 'Con ropa demasiado pequeña', 'Vestido de romano', 'Con abrigo en pleno agosto'],
  },
  {
    id: 'hb-agaligarse',
    category: 'habla',
    emoji: '👔',
    prompt: '«¡Agalígate bien esa camisa antes de salir!»',
    clue: '¿Qué es "agaligarse"?',
    correct: 'Meterse bien la camisa y arreglarse',
    wrongs: ['Quitarse los zapatos', 'Lavarse la cara con agua fría', 'Remangarse los pantalones', 'Quitarse el sombrero'],
  },
  {
    id: 'hb-barruntar',
    category: 'habla',
    emoji: '🌩️',
    prompt: '«Barrunto que esta tarde cae tormenta»',
    clue: '¿Qué significa "barruntar"?',
    correct: 'Presentir o notar señales de algo',
    wrongs: ['Desechar una idea', 'Barrer la puerta de la calle', 'Discutir con el vecino', 'Cerrar las contraventanas'],
  },
  {
    id: 'hb-escusao',
    category: 'habla',
    emoji: '👀',
    prompt: '«¡No seas tan escusao, que todo lo quieres saber!»',
    clue: '¿Cómo es una persona "escusá" o "escusao"?',
    correct: 'Muy curiosa, cotilla o entrometida',
    wrongs: ['Muy tímida y callada', 'Demasiado despistada', 'Muy generosa invitando', 'Que madruga mucho'],
  },
  {
    id: 'hb-pitera',
    category: 'habla',
    emoji: '🤕',
    prompt: '«Jugando en la calle se cayó y se hizo una pitera»',
    clue: '¿Qué es hacerse una "pitera"?',
    correct: 'Una brecha o herida en la cabeza',
    wrongs: ['Un agujero en el pantalón', 'Una cabaña con ramas', 'Una flauta de caña', 'Una mancha de mora'],
  },
  {
    id: 'hb-lambuzo',
    category: 'habla',
    emoji: '🍰',
    prompt: '«¡Qué lambuzo eres cuando ves perrunillas!»',
    clue: '¿Qué significa ser un "lambuzo"?',
    correct: 'Ser muy goloso o glotón',
    wrongs: ['Ser mal cocinero', 'Comer muy despacio', 'No querer probar nada nuevo', 'Dejar el plato lleno'],
  },
  {
    id: 'hb-choncho',
    category: 'habla',
    emoji: '🍈',
    prompt: '«No partas aún ese melón, que está choncho»',
    clue: '¿Cómo está la fruta cuando está "choncha"?',
    correct: 'Todavía verde, dura o sin sabor',
    wrongs: ['Demasiado dulce y pasada', 'Recién traída del pozo fría', 'Sin pepitas dentro', 'Partida en tajadas finas'],
  },
  {
    id: 'hb-feje',
    category: 'habla',
    emoji: '🪵',
    prompt: '«Trajo un buen feje de leña para la lumbre»',
    clue: '¿Qué es un "feje"?',
    correct: 'Un haz o montón atado de leña',
    wrongs: ['Un carro tirado por mulas', 'Un hacha pequeña de mano', 'Una chispa del brasero', 'Un trébede de hierro'],
  },
  {
    id: 'hb-catovi',
    category: 'habla',
    emoji: '🏰',
    prompt: '«Mi vecino presume de ser un auténtico Catovi»',
    clue: '¿Qué significa en Cáceres la palabra "Catovi"?',
    correct: 'Cacereño de Toda la Vida',
    wrongs: ['Cantante de coplas antiguas', 'Caminante de la Vía de la Plata', 'Capitán de la Torre Vieja', 'Catador de vino de pitarra'],
  },
  {
    id: 'hb-deto',
    category: 'habla',
    emoji: '🍽️',
    prompt: '«En el convite pusieron jamón, queso, dulces y de tó»',
    clue: '¿Qué expresa esa coletilla tan cacereña de "…y de tó"?',
    correct: 'Que hubo gran abundancia de todo',
    wrongs: ['Que faltó comida en la mesa', 'Que terminó muy temprano', 'Que cada uno pagó lo suyo', 'Que sobró toda la bebida'],
  },
  {
    id: 'hb-fala-herrera',
    category: 'habla',
    emoji: '🇵🇹',
    prompt: '«En Herrera de Alcántara y Cedillo los mayores aún recordaban el portugués»',
    clue: '¿Por qué se conservó ese habla tan especial en Herrera de Alcántara?',
    correct: 'Por ser pueblo rayano junto a Portugal',
    wrongs: ['Porque allí veraneaban marineros del norte', 'Por un antiguo mercado francés', 'Por los pastores trashumantes sorianos', 'Por comerciantes italianos'],
  },
  {
    id: 'hb-pelona',
    category: 'habla',
    emoji: '❄️',
    prompt: '«¡Vaya pelona ha caído esta mañana en la dehesa!»',
    clue: '¿Qué es caer una buena "pelona"?',
    correct: 'Una helada muy fuerte al amanecer',
    wrongs: ['Una tarde de mucho bochorno', 'Una bandada de estorninos', 'Quedarse sin hojas en verano', 'Esquilar todas las ovejas'],
  },
  {
    id: 'hb-esmorecio',
    category: 'habla',
    emoji: '😮‍💨',
    prompt: '«Después de subir la cuesta llego esmorecío»',
    clue: '¿Qué significa estar "esmorecío"?',
    correct: 'Agotado, sin aliento o desfallecido',
    wrongs: ['Muy ilusionado y contento', 'Manchado de polvo blanco', 'Con ganas de bailar', 'Con mucha prisa por volver'],
  },
  {
    id: 'hb-traspuesto',
    category: 'habla',
    emoji: '😴',
    prompt: '«Con el calorcito del brasero me quedé traspuesto»',
    clue: '¿Qué es quedarse "traspuesto"?',
    correct: 'Quedarse adormilado echando un sueñecito',
    wrongs: ['Equivocarse de calle al volver', 'Cambiar los muebles de sitio', 'Perder el turno en la tienda', 'Olvidar el paraguas en misa'],
  },
  {
    id: 'hb-fresco',
    category: 'habla',
    emoji: '🪑',
    prompt: '«En verano sacábamos las sillas para tomar el fresco»',
    clue: '¿En qué consistía esta costumbre tan nuestra?',
    correct: 'Sentarse a la puerta al anochecer a charlar',
    wrongs: ['Bañarse en el pilón a mediodía', 'Ir a comprar hielo a la plaza', 'Abrir todas las alacenas', 'Dormir en el pajar'],
  },
  {
    id: 'hb-chupa',
    category: 'habla',
    emoji: '☔',
    prompt: '«Volviendo por Cánovas nos cayó una buena chupa»',
    clue: '¿Qué es pillarte una "chupa de agua"?',
    correct: 'Un chaparrón fuerte que te cala entero',
    wrongs: ['Una ráfaga de viento seco', 'Beber agua fresca de la fuente', 'Un charco pequeño en la acera', 'Regar las macetas del balcón'],
  },
  {
    id: 'hb-esconchao',
    category: 'habla',
    emoji: '🧱',
    prompt: '«Hay que dar cal, que el zócalo está esconchao»',
    clue: '¿Qué significa que una pared o plato esté "esconchao"?',
    correct: 'Que le ha saltado un trozo de cal o esmalte',
    wrongs: ['Que brilla como recién pintado', 'Que está torcido hacia un lado', 'Que tiene nidos de golondrina', 'Que está pintado de azul'],
  },
  {
    id: 'hb-acho',
    category: 'habla',
    emoji: '👋',
    prompt: '«¡Chacho, qué alegría encontrarte por aquí!»',
    clue: '¿De dónde viene nuestro saludo "¡chacho!" o "¡acho!"?',
    correct: 'De acortar con cariño la palabra muchacho',
    wrongs: ['Del nombre de un antiguo alcalde', 'De llamar a las ovejas en el monte', 'De una canción portuguesa', 'Del toque de campanas'],
  },
  {
    id: 'hb-resol',
    category: 'habla',
    emoji: '☀️',
    prompt: '«Ponte a la sombra, que aquí pega mucho el resol»',
    clue: '¿Qué es el "resol"?',
    correct: 'El reflejo fuerte y caluroso del sol en las paredes',
    wrongs: ['La primera brisa fresca de la mañana', 'El canto de las chicharras en julio', 'La sombra alargada del campanario', 'El rocío sobre la hierba'],
  },
  {
    id: 'hb-rabudo',
    category: 'habla',
    emoji: '😠',
    prompt: '«Hoy se ha levantado un poco rabudo»',
    clue: '¿Qué quiere decir estar "rabudo"?',
    correct: 'Estar malhumorado o enfurruñado',
    wrongs: ['Estar con mucha prisa por salir', 'Estar muy elegante para ir a misa', 'Tener hipo después de comer', 'Tener muchas cosquillas'],
  },
  {
    id: 'hb-repapalo-habla',
    category: 'habla',
    emoji: '🛋️',
    prompt: '«No te quedes ahí repantigao toda la tarde»',
    clue: '¿Qué significa estar "repantigao" en el sillón?',
    correct: 'Estar tumbado o arrellanado a sus anchas',
    wrongs: ['Estar de pie mirando por el balcón', 'Estar cosiendo con mucha prisa', 'Estar buscando las gafas', 'Estar barriendo la entrada'],
  },
  {
    id: 'hb-chambra',
    category: 'habla',
    emoji: '🧥',
    prompt: '«Ponte una chambra encima, que refresca al caer la tarde»',
    clue: '¿Qué era antiguamente la "chambra" en nuestros pueblos?',
    correct: 'Una blusa o chaquetilla cómoda de casa',
    wrongs: ['Un sombrero de paja ancho', 'Unas botas de goma altas', 'Una manta para las caballerías', 'Un paraguas grande de tela'],
  },
  {
    id: 'hb-piporro',
    category: 'habla',
    emoji: '🏺',
    prompt: '«Pásame el piporro, que tengo mucha sed»',
    clue: '¿A qué recipiente tan nuestro llamamos "piporro" o "buche"?',
    correct: 'Al botijo de barro que mantiene fresca el agua',
    wrongs: ['Al caldero de cobre del pozo', 'A la sartén honda de las migas', 'A la aceitera de hojalata', 'Al mortero de madera'],
  },
  {
    id: 'hb-dornillo',
    category: 'habla',
    emoji: '🥣',
    prompt: '«Prepara el gazpacho en el dornillo como hacía la abuela»',
    clue: '¿Qué es un "dornillo" en Extremadura?',
    correct: 'Un cuenco grande y redondo de madera tallada',
    wrongs: ['Un horno pequeño de leña', 'Un colador metálico fino', 'Un mantel de cuadros blancos', 'Un cántaro estrecho de cristal'],
  },
  {
    id: 'hb-pitarra',
    category: 'habla',
    emoji: '🍷',
    prompt: '«Sacó un jarro de buen vino de pitarra»',
    clue: '¿Qué era originalmente la "pitarra" donde se hacía este vino casero?',
    correct: 'Una tinaja pequeña de barro cocido',
    wrongs: ['Una bota de cuero curtido', 'Una cesta de mimbre trenzado', 'Una prensa de piedra romana', 'Una viña en cuesta empinada'],
  },
  {
    id: 'hb-fusca',
    category: 'habla',
    emoji: '🍂',
    prompt: '«Hay que barrer toda esa fusca que ha traído el aire»',
    clue: '¿Qué es la "fusca"?',
    correct: 'Maleza seca, hojarasca o basurilla del suelo',
    wrongs: ['Niebla espesa de la ribera', 'Escarcha blanca de enero', 'Ceniza caliente de la lumbre', 'Espuma de lavar a mano'],
  },
  {
    id: 'hb-alacena',
    category: 'habla',
    emoji: '🚪',
    prompt: '«Guarda el queso y las rosquillas en la alacena»',
    clue: '¿Qué es la "alacena" de las casas tradicionales?',
    correct: 'Un armario empotrado en el muro con puertas para guardar comida o vajilla',
    wrongs: ['La buhardilla más alta del tejado', 'El poyo de piedra junto a la puerta', 'El corral trasero de las gallinas', 'La chimenea ancha de campana'],
  },
  {
    id: 'hb-doblao',
    category: 'habla',
    emoji: '🏠',
    prompt: '«Sube esos baúles viejos arriba al doblao»',
    clue: '¿Qué parte de la casa de pueblo es el "doblao" o "sobrao"?',
    correct: 'El desván bajo el tejado donde se guardaban grano, embutidos y enseres',
    wrongs: ['El sótano fresco de las tinajas', 'El patio empedrado con pozo', 'El balcón corrido de hierro', 'El zaguán de la entrada'],
  },
  {
    id: 'hb-resolana',
    category: 'habla',
    emoji: '👵',
    prompt: '«En enero da gusto sentarse un ratito a la resolana»',
    clue: '¿Qué es ponerse "a la resolana" en invierno?',
    correct: 'Al solcito templado y al abrigo del viento frío',
    wrongs: ['Debajo del paraguas cuando llovizna', 'Frente a la corriente del pasillo', 'A la sombra fresca de una higuera', 'Cerca de la campana de misa'],
  },
  {
    id: 'hb-enguachinar',
    category: 'habla',
    emoji: '🌱',
    prompt: '«No eches tanta agua a los tomates, que vas a enguachinar el huerto»',
    clue: '¿Qué significa "enguachinar" o "aguachinar"?',
    correct: 'Encharcar demasiado la tierra o el estómago con mucha agua',
    wrongs: ['Abonar la tierra con estiércol', 'Quitar las malas hierbas con azada', 'Atar las tomateras con cañas', 'Recoger la fruta antes de tiempo'],
  },
  {
    id: 'hb-churretes',
    category: 'habla',
    emoji: '🍫',
    prompt: '«Límpiate la cara con la servilleta, que llevas unos buenos churretes»',
    clue: '¿Qué son los "churretes"?',
    correct: 'Manchas de comida o suciedad en la cara o las manos',
    wrongs: ['Rizos rebeldes en el flequillo', 'Pendientes largos de fiesta', 'Cordones desatados de los zapatos', 'Bolsillos llenos de canicas'],
  },
  {
    id: 'hb-mijina',
    category: 'habla',
    emoji: '🤏',
    prompt: '«Échame solo una mijina más de caldo, por favor»',
    clue: '¿Cuánto es "una mijina" o "una miaja"?',
    correct: 'Una pizca o cantidad muy pequeñita',
    wrongs: ['Un cucharón lleno hasta el borde', 'Media olla entera', 'Dos platos hondos seguidos', 'Una fuente grande para todos'],
  },
  {
    id: 'hb-chancletas',
    category: 'habla',
    emoji: '🥿',
    prompt: '«No andes descalzo por las baldosas frías, ponte las chinelas»',
    clue: '¿Qué son las "chinelas" o "zapatillas de orillo"?',
    correct: 'Zapatillas cómodas y ligeras de estar por casa',
    wrongs: ['Botas fuertes de montar a caballo', 'Polainas de cuero para el monte', 'Alpargatas atadas hasta la rodilla', 'Zuecos altos de madera'],
  },
  {
    id: 'hb-esparramar',
    category: 'habla',
    emoji: '🌾',
    prompt: '«Se rompió el saco y se esparramaron todas las nueces por el suelo»',
    clue: '¿Qué significa "esparramar"?',
    correct: 'Desparramar o esparcir cosas por todas partes',
    wrongs: ['Guardar algo bajo llave', 'Pelar la cáscara con paciencia', 'Pesar la fruta en la romana', 'Poner las nueces en remojo'],
  },
  {
    id: 'hb-coscarse',
    category: 'habla',
    emoji: '👂',
    prompt: '«Pasó por su lado y ni se coscó»',
    clue: '¿Qué quiere decir "no coscarse"?',
    correct: 'No darse cuenta o no enterarse de algo',
    wrongs: ['No querer saludar por orgullo', 'No llevar dinero suelto encima', 'No acordarse del nombre', 'No tener apetito al mediodía'],
  },
  {
    id: 'hb-modorro',
    category: 'habla',
    emoji: '🌞',
    prompt: '«Con esta siesta de agosto me ha entrado una buena modorra»',
    clue: '¿Qué es tener "modorra"?',
    correct: 'Sopor o sueño pesado, sobre todo con el calor',
    wrongs: ['Muchas ganas de salir a correr', 'Un ataque repentino de risa', 'Dolor de muelas por el frío', 'Hambre a media mañana'],
  },
  {
    id: 'hb-trocha',
    category: 'habla',
    emoji: '🥾',
    prompt: '«Atajamos por una trocha entre las encinas para llegar antes al río»',
    clue: '¿Qué es ir "por la trocha"?',
    correct: 'Un sendero estrecho o atajo a través del campo',
    wrongs: ['La carretera general asfaltada', 'Un puente grande de piedra', 'La plaza principal del pueblo', 'Una huerta cerrada con tapia'],
  },
  {
    id: 'hb-badila',
    category: 'habla',
    emoji: '🔥',
    prompt: '«Pásame la badila para avivar el cisco del brasero»',
    clue: '¿Qué utensilio tan habitual en los inviernos cacereños es la "badila"?',
    correct: 'La paleta metálica para remover las brasas y la ceniza',
    wrongs: ['La falda gruesa de la mesa camilla', 'La rejilla de alambre protectora', 'El fuelle de cuero y madera', 'Las tenazas de sacar castañas'],
  },
  {
    id: 'hb-cisco',
    category: 'habla',
    emoji: '🪨',
    prompt: '«Antes pasaba el carbonero vendiendo sacos de cisco y picón»',
    clue: '¿Para qué se usaba el "picón" de encina en todas las casas?',
    correct: 'Para encender el brasero debajo de la mesa camilla',
    wrongs: ['Para blanquear las fachadas en primavera', 'Para alimentar a las gallinas del corral', 'Para fregar las ollas de barro', 'Para curtir pieles en el río'],
  },
  {
    id: 'hb-jato',
    category: 'habla',
    emoji: '🎒',
    prompt: '«Prepara el jato temprano, que mañana vamos al campo»',
    clue: '¿Qué es "el jato" (hato) en el habla extremeña?',
    correct: 'El atillo con la comida, la ropa y los avíos para el día',
    wrongs: ['El perro guardián del rebaño', 'El sombrero de ala ancha', 'La campana pequeña de las cabras', 'El arado de hierro antiguo'],
  },
  {
    id: 'hb-chiquinino',
    category: 'habla',
    emoji: '🐣',
    prompt: '«¡Mira qué perrito más chiquinino!»',
    clue: '¿Qué matiz dan en Extremadura las terminaciones "-ino / -ina" como "chiquinino" o "poquino"?',
    correct: 'Son el diminutivo cariñoso típico de nuestra tierra',
    wrongs: ['Indican que algo es muy grande', 'Significan que algo viene de lejos', 'Se usan solo cuando estamos enfadados', 'Son nombres de pueblos antiguos'],
  },
  {
    id: 'hb-relente',
    category: 'habla',
    emoji: '🌙',
    prompt: '«Entra ya pa dentro, que está cayendo mucho relente»',
    clue: '¿Qué es "el relente" de la noche?',
    correct: 'El frescor húmedo que cae al anochecer con cielo despejado',
    wrongs: ['El calor sofocante de las tres de la tarde', 'Un viento huracanado del sur', 'El humo de las chimeneas de leña', 'La luz de la luna llena'],
  },
  {
    id: 'hb-candil',
    category: 'habla',
    emoji: '🪔',
    prompt: '«Cuando se iba la luz encendíamos enseguida el candil»',
    clue: '¿Con qué funcionaba el antiguo "candil" de garabato?',
    correct: 'Con aceite y una torcida o mecha de algodón',
    wrongs: ['Con pilas redondas pequeñas', 'Con leña gruesa de roble', 'Con agua fría del pozo', 'Con carbón de piedra'],
  },
  {
    id: 'hb-rebanada',
    category: 'habla',
    emoji: '🍞',
    prompt: '«De merienda nos daban una buena rebaná con aceite y azúcar»',
    clue: '¿Qué era aquella merienda inolvidable de la infancia?',
    correct: 'Una tajada grande de pan casero con aceite de oliva y azúcar o pimentón',
    wrongs: ['Un bollo industrial relleno de crema', 'Una galleta salada con mantequilla', 'Un plato de arroz blanco hervido', 'Una manzana asada al horno'],
  },
  {
    id: 'hb-avios',
    category: 'habla',
    emoji: '🍲',
    prompt: '«Voy a la tienda a comprar los avíos del cocido»',
    clue: '¿Qué son "los avíos" cuando hablamos de cocinar?',
    correct: 'Todos los ingredientes necesarios para preparar el guiso',
    wrongs: ['Los platos llanos de porcelana fina', 'Las servilletas bordadas de hilo', 'Las sillas plegables del comedor', 'Los recibos de la compra'],
  },
  {
    id: 'hb-emperifollao',
    category: 'habla',
    emoji: '✨',
    prompt: '«¡Qué emperifollao vas hoy domingo para pasear por Pintores!»',
    clue: '¿Cómo va alguien "emperifollao"?',
    correct: 'Muy mudado, elegante y arreglado con sus mejores galas',
    wrongs: ['Despeinado por culpa del viento', 'Con ropa vieja de faenar en el huerto', 'Caminando descalzo por el río', 'Abrigándose con una manta'],
  },
]

// ============================================================================
// RONDA 4: CALLES, FIESTAS Y TRADICIONES DE CÁCERES Y HERRERA (52)
// ============================================================================
const TRADICIONES_ITEMS: TierraQuestion[] = [
  {
    id: 'tr-bombo',
    category: 'tradiciones',
    emoji: '🎺',
    prompt: '¿Cómo llamamos todos en Cáceres al quiosco blanco de la música del Paseo de Cánovas?',
    clue: 'Un icono redondo donde tocaba la banda municipal',
    correct: 'El Bombo',
    wrongs: ['La Glorieta', 'El Palomar', 'La Pérgola', 'El Mirador', 'La Rotonda'],
  },
  {
    id: 'tr-mascarra',
    category: 'tradiciones',
    emoji: '🎭',
    prompt: '¿Cómo se llama el tradicional desfile de carnaval con disfraces rústicos de Herrera de Alcántara?',
    clue: 'Los vecinos se cubrían el rostro con pieles, sábanas y ropas antiguas',
    correct: 'La Mascarrá',
    wrongs: ['Los Empalaos', 'El Jarramplas', 'Las Carantoñas', 'El Peropalo', 'Los Negritos'],
  },
  {
    id: 'tr-dia-rosca',
    category: 'tradiciones',
    emoji: '🥨',
    prompt: '¿Qué fiesta tradicional celebra Herrera de Alcántara en febrero cerca de Las Candelas?',
    clue: 'Lleva el nombre de un dulce típico muy esperado por todo el pueblo',
    correct: 'El Día de la Rosca',
    wrongs: ['El Día del Hornazo', 'La Fiesta de la Bellota', 'El Martes Mayor', 'La Enramá', 'Las Candelillas'],
  },
  {
    id: 'tr-san-sebastian',
    category: 'tradiciones',
    emoji: '⛪',
    prompt: '¿Quién es el santo patrón de Herrera de Alcántara cuya fiesta celebramos el 20 de enero?',
    clue: 'También da nombre a la iglesia parroquial del pueblo',
    correct: 'San Sebastián',
    wrongs: ['San Isidro', 'San Roque', 'San Antón', 'San Blas', 'San Marcos'],
  },
  {
    id: 'tr-san-juan-herrera',
    category: 'tradiciones',
    emoji: '🔥',
    prompt: '¿Qué fiestas mayores de verano celebra Herrera de Alcántara los días 23, 24 y 25 de junio?',
    clue: 'Días de convivencia vecinal, música y hogueras al empezar el verano',
    correct: 'Las Fiestas de San Juan',
    wrongs: ['Las Fiestas del Pilar', 'Las Ferias de Septiembre', 'San Miguel', 'Santa Ana', 'Santiago Apóstol'],
  },
  {
    id: 'tr-fatima-herrera',
    category: 'tradiciones',
    emoji: '🌸',
    prompt: '¿En honor a qué Virgen sale de romería Herrera de Alcántara cada mes de mayo?',
    clue: 'Una romería primaveral muy querida en esta tierra fronteriza con Portugal',
    correct: 'La Virgen de Fátima',
    wrongs: ['La Virgen del Rocío', 'La Virgen del Puerto', 'La Virgen de Argeme', 'La Virgen de Sopetrán', 'La Virgen del Ara'],
  },
  {
    id: 'tr-balcon-tajo',
    category: 'tradiciones',
    emoji: '⛴️',
    prompt: '¿Cómo se llama el barco turístico que navega por el río junto al embarcadero de Herrera de Alcántara?',
    clue: 'Recorre los impresionantes cortados entre España y Portugal',
    correct: 'El Balcón del Tajo',
    wrongs: ['La Estrella del Sur', 'El Crucero del Jerte', 'La Barca de Alconétar', 'El Vapor de Lisboa', 'La Reina del Alagón'],
  },
  {
    id: 'tr-dragon-sanjorge',
    category: 'tradiciones',
    emoji: '🐉',
    prompt: '¿Qué figura gigante se quema en la Plaza Mayor de Cáceres la víspera del 23 de abril?',
    clue: 'Tras el desfile de moros y cristianos en honor a San Jorge',
    correct: 'El Dragón de San Jorge',
    wrongs: ['La Tarasca', 'La Sardina de Carnaval', 'El Toro de Fuego', 'El Gigante de Piedra', 'La Culebra Mora'],
  },
  {
    id: 'tr-bajada-virgen',
    category: 'tradiciones',
    emoji: '👑',
    prompt: '¿A quién recibe todo Cáceres con flores y emoción cuando baja desde su santuario antes de mayo?',
    clue: 'Permanece en la Concatedral de Santa María durante su solemne Novenario',
    correct: 'A la Virgen de la Montaña',
    wrongs: ['A la Virgen de Guadalupe', 'A Santa Cecilia', 'A la Virgen de la Luz', 'A la Virgen de Hontanares', 'A Santa Eulalia'],
  },
  {
    id: 'tr-lavanderas',
    category: 'tradiciones',
    emoji: '🧺',
    prompt: '¿Qué fiesta popular cacereña de febrero viste refajo tradicional y quema al Pelele?',
    clue: 'Recuerda a las mujeres que antiguamente iban a lavar la ropa con alegría',
    correct: 'Las Lavanderas',
    wrongs: ['Las Candelas de Mayo', 'Los Escobazos', 'Las Mayordomas', 'Las Hilanderas', 'Las Espigadoras'],
  },
  {
    id: 'tr-cruz-caidos',
    category: 'tradiciones',
    emoji: '⛲',
    prompt: '¿En qué céntrica plaza redonda al final de Cánovas quedaba siempre la gente en Cáceres?',
    clue: 'El punto de encuentro clásico para empezar el paseo o ir al cine',
    correct: 'La Cruz de los Caídos',
    wrongs: ['La Plaza de Italia', 'El Puente de San Francisco', 'La Ronda Norte', 'El Cruce de Moctezuma', 'La Glorieta de Mérida'],
  },
  {
    id: 'tr-cristo-negro',
    category: 'tradiciones',
    emoji: '🕯️',
    prompt: '¿Qué sobrecogedora imagen procesiona en absoluto silencio la medianoche del Miércoles Santo en Cáceres?',
    clue: 'Sale únicamente por las callejuelas empedradas de la Ciudad Monumental',
    correct: 'El Cristo Negro',
    wrongs: ['La Borriquita', 'El Resucitado', 'El Cristo de la Victoria', 'El Cautivo Blanco', 'La Esperanza Macarena'],
  },
  {
    id: 'tr-feria-mayo',
    category: 'tradiciones',
    emoji: '🎡',
    prompt: '¿Por qué festividad se llena Cáceres de casetas, atracciones y paseo de caballos a finales de mayo?',
    clue: 'Las grandes Ferias de Mayo cacereñas en torno al día 30',
    correct: 'La Feria de San Fernando',
    wrongs: ['La Feria de San Mateo', 'La Feria de San Miguel', 'Las Fiestas de Agosto', 'La Feria de San Andrés', 'La Feria de Abril'],
  },
  {
    id: 'tr-ciguena-negra',
    category: 'tradiciones',
    emoji: '🦅',
    prompt: '¿Qué ave tan valiosa y protegida anida en los riberos del Tajo en Herrera de Alcántara?',
    clue: 'Prima esquiva de la cigüeña blanca de nuestras torres, joya de la Reserva de la Biosfera',
    correct: 'La Cigüeña Negra',
    wrongs: ['El Flamenco Rosado', 'El Urogallo', 'La Gaviota Plateada', 'El Cisne Blanco', 'El Pelícano'],
  },
  {
    id: 'tr-puente-cabrioso',
    category: 'tradiciones',
    emoji: '🌉',
    prompt: '¿Cómo se llama el puente antiguo de piedra de las rutas camineras de Herrera de Alcántara?',
    clue: 'Un rincón con mucha historia entre dehesas y arroyos del término herrereño',
    correct: 'Puente Viejo de Cabrioso',
    wrongs: ['Puente de San Francisco', 'Puente Nuevo del Jerte', 'Puente de la Macarena', 'Puente del Arzobispo', 'Puente de Plata'],
  },
  {
    id: 'tr-mirador-negrales',
    category: 'tradiciones',
    emoji: '🔭',
    prompt: '¿Qué conocido mirador de Herrera de Alcántara ofrece vistas espectaculares sobre el río Tajo?',
    clue: 'Desde allí se contemplan los cañones fluviales y la vecina orilla portuguesa',
    correct: 'El Mirador de Negrales',
    wrongs: ['El Balcón del Valle', 'El Mirador de la Peña', 'El Risco de San Blas', 'El Mirador del Jerte', 'La Atalaya Real'],
  },
  {
    id: 'tr-puerto-herrera',
    category: 'tradiciones',
    emoji: '⚓',
    prompt: 'Antiguamente, desde el puerto fluvial de Herrera de Alcántara salían barcos por el Tajo hasta…',
    clue: 'Navegaban río abajo cruzando Portugal hasta desembocar en el Atlántico',
    correct: 'Lisboa',
    wrongs: ['Sevilla', 'Oporto', 'Toledo', 'Cádiz', 'Coímbra'],
  },
  {
    id: 'tr-calle-amargura',
    category: 'tradiciones',
    emoji: '🏮',
    prompt: '¿Qué callejuela empinada y llena de leyendas sube por el corazón de la Parte Antigua de Cáceres?',
    clue: 'Su nombre suena a Semana Santa y a viejos romances entre palacios',
    correct: 'La Calle Amargura',
    wrongs: ['La Calle Ancha', 'La Avenida Virgen de Guadalupe', 'La Calle Gil Cordero', 'La Avenida de España', 'La Calle Gómez Becerra'],
  },
  {
    id: 'tr-plaza-sanjuan',
    category: 'tradiciones',
    emoji: '☕',
    prompt: '¿Qué animada plaza al pie de la Calle Pintores ha sido siempre rincón de terrazas y recados en Cáceres?',
    clue: 'Presidida por la iglesia donde se casaron nobles y vecinos durante siglos',
    correct: 'La Plaza de San Juan',
    wrongs: ['La Plaza de Toros', 'La Plaza de Santiago', 'La Plaza de las Canterías', 'La Plaza de Alconétar', 'La Plaza de América'],
  },
  {
    id: 'tr-vostell',
    category: 'tradiciones',
    emoji: '🎨',
    prompt: '¿En qué pueblo vecino a Cáceres se encuentra Los Barruecos y el original Museo Vostell?',
    clue: 'Famoso también por sus paraguas de colores y la fiesta de la Pedida de la Patatera',
    correct: 'En Malpartida de Cáceres',
    wrongs: ['En Casar de Cáceres', 'En Torreorgaz', 'En Sierra de Fuentes', 'En Aliseda', 'En Santiago del Campo'],
  },
  {
    id: 'tr-dia-luz',
    category: 'tradiciones',
    emoji: '🐎',
    prompt: '¿En qué pueblo vecino de Cáceres son famosísimas las carreras de caballos del Día de la Luz?',
    clue: 'Se celebran cada Lunes de Pascua entre jinetes y romeros',
    correct: 'En Arroyo de la Luz',
    wrongs: ['En Montánchez', 'En Alcuéscar', 'En Cañaveral', 'En Monroy', 'En Talaván'],
  },
  {
    id: 'tr-jamon-montanchez',
    category: 'tradiciones',
    emoji: '🐖',
    prompt: '¿Qué pueblo serrano de la provincia de Cáceres con castillo en lo alto tiene fama mundial por sus jamones?',
    clue: 'Conocido como el Balcón de Extremadura por sus vistas y su curación al aire frío',
    correct: 'Montánchez',
    wrongs: ['Navalmoral de la Mata', 'Moraleja', 'Talayuela', 'Miajadas', 'Rosalejo'],
  },
  {
    id: 'tr-la-raya',
    category: 'tradiciones',
    emoji: '🗺️',
    prompt: '¿Con qué nombre popular conocemos la frontera hispano-portuguesa de Herrera, Cedillo y Valencia de Alcántara?',
    clue: 'Tierra hermana de cafés portugueses, toallas y buena vecindad',
    correct: 'La Raya',
    wrongs: ['La Muga', 'La Marca', 'El Lindero', 'La Cuerda', 'La Vereda'],
  },
  {
    id: 'tr-foro-balbos-q',
    category: 'tradiciones',
    emoji: '🏛️',
    prompt: '¿Cómo se llama el rincón junto al Ayuntamiento de Cáceres donde está el Pilar de San Francisco?',
    clue: 'Unido a la Plaza Mayor, guarda restos romanos y el antiguo abrevadero plateresco',
    correct: 'El Foro de los Balbos',
    wrongs: ['El Patio de los Naranjos', 'El Rincón de la Monja', 'La Corredera', 'El Campillo', 'El Postigo'],
  },
  {
    id: 'tr-gran-teatro',
    category: 'tradiciones',
    emoji: '🎭',
    prompt: '¿Cómo se llama el teatro principal de Cáceres situado en la calle San Antón, cerca de San Juan?',
    clue: 'Escenario de obras de teatro, conciertos, zarzuelas y festivales de cine',
    correct: 'El Gran Teatro',
    wrongs: ['El Teatro Romano', 'El Teatro Principal de la Sierra', 'El Coliseo del Tajo', 'La Sala Imperial', 'El Liceo Cacereño'],
  },
  {
    id: 'tr-ribera-marco',
    category: 'tradiciones',
    emoji: '🌿',
    prompt: '¿Cómo se llama el arroyo de huertas, fuentes y antiguos molinos harineros que bordea Cáceres?',
    clue: 'Nace en la Fuente del Rey y dio vida durante siglos a las huertas y lavaderos cacereños',
    correct: 'La Ribera del Marco',
    wrongs: ['La Garganta Mayor', 'El Arroyo de la Vid', 'El Canal del Jerte', 'La Acequia Real', 'El Río Almonte'],
  },
  {
    id: 'tr-fuente-fría',
    category: 'tradiciones',
    emoji: '⛲',
    prompt: '¿Cómo se llamaba la famosa fuente tradicional a la que iban los cacereños con cántaros y garrafas a por agua?',
    clue: 'Lugares tan recordados como Fuente Concejo o Fuente Hinche en torno a la Ribera',
    correct: 'Fuente Concejo',
    wrongs: ['Fuente de Cibeles', 'Fuente de los Leones', 'Fuente del Maestro', 'Fuente de las Batallas', 'Fuente Dorada'],
  },
  {
    id: 'tr-romeria-salor',
    category: 'tradiciones',
    emoji: '🌾',
    prompt: '¿Qué río cercano a Cáceres da nombre a la comarca Tajo-Salor donde nos unen tantas dehesas y pueblos?',
    clue: 'Afluente del Tajo que pasa cerca de Cáceres, Aliseda, Arroyo y Alcántara',
    correct: 'El Río Salor',
    wrongs: ['El Río Zújar', 'El Río Matachel', 'El Río Ruecas', 'El Río Ardila', 'El Río Cuerpo de Hombre'],
  },
  {
    id: 'tr-sever-herrera',
    category: 'tradiciones',
    emoji: '🏞️',
    prompt: 'Además del río Tajo, ¿qué otro río fronterizo con Portugal baña el término de Herrera de Alcántara y Cedillo?',
    clue: 'Desemboca en el Tajo formando un paisaje natural virgen espectacular',
    correct: 'El Río Sever',
    wrongs: ['El Río Jerte', 'El Río Tiétar', 'El Río Ibor', 'El Río Ambroz', 'El Río Ortiga'],
  },
  {
    id: 'tr-mayos-herrera',
    category: 'tradiciones',
    emoji: '🌺',
    prompt: '¿Qué alegre tradición floral de primavera se celebra al empezar mayo en pueblos como Herrera de Alcántara?',
    clue: 'Exaltación de la primavera con flores, cantos populares o muñecos festivos',
    correct: 'Los Mayos (La Cruz de Mayo)',
    wrongs: ['Las Águedas', 'Los Santos Inocentes', 'La Noche de Ánimas', 'El Jueves de Comadres', 'San Antón'],
  },
  {
    id: 'tr-pesquiles',
    category: 'tradiciones',
    emoji: '🎣',
    prompt: 'En Herrera de Alcántara, ¿cómo se llamaban los puestos tradicionales de piedra junto al Tajo para pescar?',
    clue: 'Allí bajaban por veredas empinadas los antiguos pescadores del río',
    correct: 'Los Pesquiles',
    wrongs: ['Los Palomares', 'Los Lagares', 'Los Tinelos', 'Los Batanes', 'Los Sequeros'],
  },
  {
    id: 'tr-san-pedro-calle',
    category: 'tradiciones',
    emoji: '🛍️',
    prompt: '¿Qué otra calle muy comercial y concurrida de Cáceres baja desde San Juan hacia Cánovas?',
    clue: 'Hermana de paseo y escaparates de la calle Pintores en pleno centro',
    correct: 'La Calle San Pedro',
    wrongs: ['La Calle Caleros', 'La Cuesta de la Compañía', 'La Calle Tiendas', 'La Calle Orellana', 'El Callejón del Gallo'],
  },
  {
    id: 'tr-mercado-francos',
    category: 'tradiciones',
    emoji: '🧺',
    prompt: '¿Qué día de la semana ha sido tradicionalmente día de mercadillo semanal en Cáceres?',
    clue: 'La gente iba a mirar telas, fruta, calzado y plantas a los puestos',
    correct: 'Los Miércoles',
    wrongs: ['Los Domingos por la tarde', 'Los Lunes de madrugada', 'Los Viernes noche', 'Los Sábados de gloria', 'Los Jueves santos'],
  },
  {
    id: 'tr-mansabora',
    category: 'tradiciones',
    emoji: '👸',
    prompt: 'En la leyenda más famosa de Cáceres, ¿en qué animal quedó encantada la princesa mora por amor a un capitán cristiano?',
    clue: 'Dicen que aparece en la Noche de San Juan por los aljibes y callejas',
    correct: 'En una Gallina de plumas de oro',
    wrongs: ['En una Paloma blanca', 'En un Ciervo plateado', 'En una Mariposa azul', 'En un Pez del Tajo', 'En una Alondra'],
  },
  {
    id: 'tr-san-blas',
    category: 'tradiciones',
    emoji: '🎀',
    prompt: 'Cada 3 de febrero en Cáceres vamos a la ermita de San Blas a comprar roscas y ponernos…',
    clue: 'Para que el santo nos proteja la garganta de catarros todo el invierno',
    correct: 'Los Cordones bendecidos de San Blas',
    wrongs: ['Un sombrero de copa negro', 'Una rama de olivo seco', 'Un cascabel en el tobillo', 'Un pañuelo amarillo al hombro', 'Un anillo de cobre'],
  },
  {
    id: 'tr-candelas-caceres',
    category: 'tradiciones',
    emoji: '🕯️',
    prompt: 'Justo un día antes de San Blas, el 2 de febrero, ¿qué romería celebra Cáceres en la ermita alta del casco antiguo?',
    clue: 'Con mesa de ofrendas y roscas junto al barrio de San Mateo',
    correct: 'Las Candelas',
    wrongs: ['Santa Lucía', 'San Marcos', 'La Velá de Santiago', 'El Corpus Christi', 'San Roque'],
  },
  {
    id: 'tr-san-jorge-fecha',
    category: 'tradiciones',
    emoji: '⚔️',
    prompt: '¿Qué día del año es fiesta local en Cáceres capital en honor a su patrón San Jorge?',
    clue: 'Día primaveral en que tras quemar el dragón buscamos el huevo de oro',
    correct: 'El 23 de Abril',
    wrongs: ['El 15 de Agosto', 'El 12 de Octubre', 'El 24 de Diciembre', 'El 7 de Julio', 'El 19 de Marzo'],
  },
  {
    id: 'tr-virgen-septiembre',
    category: 'tradiciones',
    emoji: '🇪🇸',
    prompt: '¿Qué día celebramos el Día de Extremadura en honor a la Virgen de Guadalupe?',
    clue: 'Fiesta grande en toda nuestra región al terminar el verano',
    correct: 'El 8 de Septiembre',
    wrongs: ['El 2 de Mayo', 'El 28 de Febrero', 'El 11 de Noviembre', 'El 25 de Julio', 'El 6 de Enero'],
  },
  {
    id: 'tr-festival-clasico',
    category: 'tradiciones',
    emoji: '🎬',
    prompt: 'En las noches templadas de junio, las plazas de la Parte Antigua de Cáceres se llenan de capas y versos con el…',
    clue: 'Obras de Lope, Calderón y Cervantes al aire libre en San Jorge y Santa María',
    correct: 'Festival de Teatro Clásico',
    wrongs: ['Certamen de Habaneras Marinas', 'Concurso de Esquí Alpino', 'Feria del Marisco', 'Regata del Guadalquivir', 'Carnaval de Verano'],
  },
  {
    id: 'tr-festival-alcantara',
    category: 'tradiciones',
    emoji: '🌙',
    prompt: 'También en nuestra comarca, ¿qué famoso festival de teatro al aire libre se celebra cada verano bajo las galerías de San Benito?',
    clue: 'Una cita cultural preciosa en las noches estrelladas de Alcántara',
    correct: 'Festival de Teatro Clásico de Alcántara',
    wrongs: ['Festival de Jazz de San Sebastián', 'Ópera del Retiro', 'Muestra de Cine Mudo', 'Feria del Libro Antiguo', 'Gala Lírica del Norte'],
  },
  {
    id: 'tr-tesoro-aliseda',
    category: 'tradiciones',
    emoji: '👑',
    prompt: '¿En qué pueblo cercano a Cáceres, camino de la Sierra de San Pedro, apareció un famosísimo tesoro tartésico de oro?',
    clue: 'Con diademas, collares y pendientes milenarios hallados en 1920',
    correct: 'En Aliseda',
    wrongs: ['En Navalmoral de la Mata', 'En Jarandilla', 'En Baños de Montemayor', 'En Cabezuela del Valle', 'En Madrigal'],
  },
  {
    id: 'tr-encaje-acebo',
    category: 'tradiciones',
    emoji: '🪡',
    prompt: '¿Qué artesanía hecha con almohadilla y palillos de madera han bordado con maestría nuestras abuelas cacereñas (famosa en Acebo)?',
    clue: 'Un arte paciente de hilos finísimos que pasa de madres a hijas',
    correct: 'El Encaje de Bolillos',
    wrongs: ['El Soplado de Vidrio', 'La Forja de Espadas', 'El Tallado de Nácar', 'La Cestería de Bambú', 'El Repujado Naval'],
  },
  {
    id: 'tr-gorra-montehermoso',
    category: 'tradiciones',
    emoji: '👒',
    prompt: '¿Qué prenda del traje regional femenino cacereño, adornada con espejuelos, botones y lanas de colores, es conocida en toda España?',
    clue: 'Todo un símbolo de Extremadura tejido artesanalmente con paja de centeno',
    correct: 'La Gorra de Montehermoso',
    wrongs: ['La Boina Vasca', 'La Mantilla Blanca de Blonda', 'El Sombrero Cordobés', 'La Barretina Catalana', 'El Pañuelo Baturro'],
  },
  {
    id: 'tr-alfareria-casar',
    category: 'tradiciones',
    emoji: '🏺',
    prompt: '¿Qué pueblo alfarero de la provincia de Cáceres es célebre por sus cántaros y botijos decorados con chinitos blancos de cuarzo?',
    clue: 'Artesanía de barro rojo engastado con piedrecitas blancas en la comarca de Alcántara-Tajo',
    correct: 'Ceclavín (y Arroyo de la Luz)',
    wrongs: ['Manises', 'Talavera de la Reina', 'Sargadelos', 'Úbeda', 'La Rambla'],
  },
  {
    id: 'tr-paseo-alto',
    category: 'tradiciones',
    emoji: '🌲',
    prompt: '¿Cómo se llama el paseo arbolado sobre un cerro de Cáceres donde antiguamente se celebraba la feria de ganados?',
    clue: 'Con su templete, pinos, fuentes y preciosas vistas de toda la ciudad',
    correct: 'El Paseo Alto',
    wrongs: ['El Paseo Marítimo', 'La Dehesa de Abajo', 'El Prado Viejo', 'La Alameda del Sur', 'El Soto del Río'],
  },
  {
    id: 'tr-redoble',
    category: 'tradiciones',
    emoji: '💃',
    prompt: '¿Cómo se llama nuestra jota más representativa y alegre de Cáceres, inmortalizada con el estribillo «Redoble, redoble…»?',
    clue: 'Himno popular del folclore cacereño que suena en cada fiesta y romería',
    correct: 'El Redoble',
    wrongs: ['La Muñeira', 'El Chotis', 'La Sardana', 'El Aurresku', 'La Isa Canaria'],
  },
  {
    id: 'tr-boda-regia',
    category: 'tradiciones',
    emoji: '💍',
    prompt: 'En Valencia de Alcántara, muy cerca de Herrera, se conmemora cada verano la boda histórica entre la infanta Isabel (hija de los Reyes Católicos) y…',
    clue: 'Una gran fiesta renacentista de hermandad entre España y Portugal celebrada en La Raya',
    correct: 'El Rey Don Manuel I de Portugal',
    wrongs: ['El Emperador de Austria', 'El Duque de Alba', 'El Rey de Francia', 'El Conde de Barcelona', 'El Gran Capitán'],
  },
  {
    id: 'tr-puente-segura',
    category: 'tradiciones',
    emoji: '🌉',
    prompt: 'En la comarca de Alcántara sobre el río Erjas, ¿qué otro puente romano hace de frontera directa entre España y Portugal?',
    clue: 'Mitad español (Piedras Albas) y mitad portugués en plena Raya',
    correct: 'El Puente Romano de Segura',
    wrongs: ['El Puente Colgante de Portugalete', 'El Puente de Triana', 'El Puente de Piedra de Zaragoza', 'El Puente Nuevo de Ronda', 'El Puente del Mar'],
  },
  {
    id: 'tr-pañuelo-mil-colores',
    category: 'tradiciones',
    emoji: '🧣',
    prompt: 'En el traje tradicional cacereño y extremeño, ¿qué mantón o pañuelo alegre llevan las mujeres cruzado sobre el pecho?',
    clue: 'Lleno de flores vivas o de cachemir sobre el jubón negro y el refajo bordado',
    correct: 'El Pañuelo de Mil Colores (o de Cien Colores)',
    wrongs: ['La Capa Española de Terciopelo', 'El Chaleco de Cuero', 'La Banda Presidencial', 'La Bufanda de Lana Blanca', 'El Fular de Seda Azul'],
  },
  {
    id: 'tr-dehesa-encina',
    category: 'tradiciones',
    emoji: '🌳',
    prompt: '¿Qué dos árboles hermanos reinan en las dehesas que rodean Cáceres, Alcántara y Herrera dando bellota y corcho?',
    clue: 'Alma del paisaje extremeño y sustento de la montanera ibérica',
    correct: 'La Encina y el Alcornoque',
    wrongs: ['El Abeto y el Haya', 'La Palmera y el Drago', 'El Eucalipto y el Bambú', 'El Ciprés y el Abedul', 'El Naranjo y el Limonero'],
  },
  {
    id: 'tr-transhumancia',
    category: 'tradiciones',
    emoji: '🐑',
    prompt: 'En Malpartida de Cáceres y nuestros llanos, ¿qué antiguo oficio ganadero guiaba los rebaños merinos por las cañadas reales?',
    clue: 'Los pastores venían en otoño buscando los buenos pastos templados de Extremadura',
    correct: 'La Trashumancia',
    wrongs: ['La Almadraba', 'La Vendimia Tardía', 'La Molienda de Viento', 'La Zafra de Caña', 'La Esquila Marina'],
  },
  {
    id: 'tr-soportales-plaza',
    category: 'tradiciones',
    emoji: '🏛️',
    prompt: 'En la Plaza Mayor de Cáceres, ¿dónde nos resguardamos tanto del sol de julio como de la lluvia de invierno para tomar algo o charlar?',
    clue: 'Arcadas encaladas llenas de vida que rodean la plaza desde el siglo XVI',
    correct: 'Bajo los Soportales',
    wrongs: ['En los Miradores de Cristal', 'En las Galerías Subterráneas', 'En el Invernadero Real', 'En los Palcos del Río', 'En las Pérgolas del Puerto'],
  },
]

// ============================================================================
// RONDA 5: RECETAS TÍPICAS Y SABORES DE NUESTRA TIERRA (50 platos)
// ============================================================================
const RECETAS_ITEMS: TierraQuestion[] = [
  {
    id: 'rc-migas',
    category: 'recetas',
    emoji: '🍳',
    prompt: 'Pan asentado picado muy fino, agua con sal, ajos, pimentón de la Vera, aceite y torreznos…',
    clue: 'En muchas casas nuestras se toman hasta acompañadas con café con leche',
    correct: 'Las Migas Extremeñas',
    wrongs: ['Las Gachas Manchegas', 'El Pisto', 'La Pipirrana', 'El Arroz a Banda', 'La Fideuá'],
  },
  {
    id: 'rc-torta-casar',
    category: 'recetas',
    emoji: '🧀',
    prompt: 'Queso cremoso de oveja cuajado con flor de cardo al que se le quita la «tapa» de arriba para untar:',
    clue: 'Joya gastronómica nacida a pocos kilómetros de Cáceres capital',
    correct: 'La Torta del Casar',
    wrongs: ['El Queso de Cabrales', 'El Queso de Burgos', 'El Requesón con Miel', 'El Queso Idiazábal', 'El Queso Tetilla'],
  },
  {
    id: 'rc-patatera',
    category: 'recetas',
    emoji: '🥖',
    prompt: 'Embutido tierno de nuestra tierra hecho con cerdo ibérico, patata cocida, ajo y pimentón de la Vera:',
    clue: 'Riquísima untada en una buena rebanada de pan de pueblo',
    correct: 'La Patatera',
    wrongs: ['La Sobrasada', 'El Butifarrón', 'La Morcilla de Arroz', 'La Chistorra Navarra', 'El Fuet Catalán'],
  },
  {
    id: 'rc-tencas',
    category: 'recetas',
    emoji: '🐟',
    prompt: 'Pescado de charca muy tradicional en toda la comarca de Cáceres y Tajo-Salor, delicioso frito o en escabeche:',
    clue: 'Incluso tiene su propia fiesta gastronómica en nuestros pueblos',
    correct: 'Las Tencas Fritas',
    wrongs: ['Los Boquerones', 'El Bacalao al Pil-Pil', 'Las Sardinas Espetadas', 'El Bonito con Tomate', 'Los Chipirones'],
  },
  {
    id: 'rc-caldereta',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Guiso campero de romerías y fiestas con cordero, ajo, laurel, vino blanco, pimiento y su majado:',
    clue: 'Plato rey cuando nos juntamos toda la familia en el campo',
    correct: 'La Caldereta de Cordero',
    wrongs: ['La Fabada', 'El Cocido Madrileño', 'El Marmitako', 'El Pote Asturiano', 'La Olla Podrida'],
  },
  {
    id: 'rc-chanfaina',
    category: 'recetas',
    emoji: '🥘',
    prompt: 'Guiso tradicional con asadura de cordero, laurel, ajo, pan frito, pimentón y huevo duro picado:',
    clue: 'Receta humilde de pastores con un sabor inconfundible',
    correct: 'La Chanfaina Extremeña',
    wrongs: ['La Ropa Vieja', 'El Salmorejo', 'Los Callos con Garbanzos', 'El Chilindrón', 'El Picadillo'],
  },
  {
    id: 'rc-perrunillas',
    category: 'recetas',
    emoji: '🍪',
    prompt: 'Pastas redondas y arenosas de manteca de cerdo, harina, azúcar, canela y ralladura de limón:',
    clue: 'Nunca faltan en una bandeja con el café ni en las fiestas del pueblo',
    correct: 'Las Perrunillas',
    wrongs: ['Los Sobaos', 'Los Fartons', 'Las Ensaimadas', 'Los Piononos', 'Las Marañuelas'],
  },
  {
    id: 'rc-repapalos',
    category: 'recetas',
    emoji: '🥛',
    prompt: 'Bollitos esponjosos de miga de pan y huevo fritos en sartén y cocidos en leche con canela y limón:',
    clue: 'También se hacen salados en caldo, pero dulces en Semana Santa son gloria bendita',
    correct: 'Los Repápalos con Leche',
    wrongs: ['El Arroz con Leche', 'Los Buñuelos de Viento', 'La Leche Frita', 'La Crema Catalana', 'El Flan de Café'],
  },
  {
    id: 'rc-zorongollo',
    category: 'recetas',
    emoji: '🫑',
    prompt: 'Ensalada jugosa de pimientos rojos asados a la lumbre en tiras con tomate, cebolla, ajo y aceite de oliva:',
    clue: 'Acompañamiento perfecto para carnes o con huevo duro por encima',
    correct: 'El Zorongollo Extremeño',
    wrongs: ['La Escalivada con Anchoas', 'El Rin-Ran', 'El Moje Manchego', 'La Ensaladilla Rusa', 'El Trinxat'],
  },
  {
    id: 'rc-perdiz-alcantara',
    category: 'recetas',
    emoji: '🐦',
    prompt: 'Receta histórica nacida en el Convento de San Benito de Alcántara que viajó hasta los fogones de Francia:',
    clue: 'Guisada con esmero según el famoso recetario monacal alcantarino',
    correct: 'La Perdiz al Modo de Alcántara',
    wrongs: ['El Pollo al Ajillo', 'El Pavo Trufado de Navidad', 'Las Codornices con Alubias', 'El Pato a la Naranja', 'El Capón Relleno'],
  },
  {
    id: 'rc-sopa-tomate',
    category: 'recetas',
    emoji: '🍅',
    prompt: 'Rebanadas muy finas de pan casero empapadas en un sofrito lento de tomate maduro, pimiento, cebolla y ajo:',
    clue: 'Qué rica está en verano servida con uvas o higos dulces al lado',
    correct: 'La Sopa de Tomate',
    wrongs: ['La Porrusalda', 'La Sopa Castellana', 'El Caldo Gallego', 'La Sopa Bullabesa', 'La Crema de Calabaza'],
  },
  {
    id: 'rc-flores',
    category: 'recetas',
    emoji: '🌼',
    prompt: 'Dulce crujiente hecho mojando un molde de hierro caliente en masa de huevo y leche antes de freírlo:',
    clue: 'Bañadas con miel de la sierra o espolvoreadas con azúcar y canela',
    correct: 'Las Flores Extremeñas',
    wrongs: ['Los Pestiños Sevillanos', 'Los Churros de Feria', 'Las Orejas de Carnaval', 'Las Filloes', 'Los Bartolillos'],
  },
  {
    id: 'rc-gazpacho',
    category: 'recetas',
    emoji: '🥣',
    prompt: 'Majado tradicional de verano con ajo, miga de pan, tomate, pimiento, pepino, aceite de oliva y buen vinagre:',
    clue: 'Servido bien fresquito con tropezones picados por encima para aliviar la calor',
    correct: 'El Gazpacho Extremeño',
    wrongs: ['El Ajoblanco con Uvas', 'La Vichyssoise', 'La Sopa de Picadillo', 'El Caldo Verde', 'El Consomé Frío'],
  },
  {
    id: 'rc-cojondongo',
    category: 'recetas',
    emoji: '🫒',
    prompt: 'Plato campero majado en dornillo de madera con ajo, miga de pan, aceite, vinagre, tomate y pimiento:',
    clue: 'Primo espeso y lleno de fuerza del gazpacho que alimentaba en el campo',
    correct: 'El Cojondongo',
    wrongs: ['El Atascaburras', 'El Guirlache', 'La Mazamorra', 'El Morteruelo', 'El Tiznao'],
  },
  {
    id: 'rc-rosca-candelas',
    category: 'recetas',
    emoji: '🍩',
    prompt: 'Dulce festivo en forma de rueda grande adornada que protagoniza febrero en Herrera de Alcántara:',
    clue: 'Da nombre al tradicional Día de la Rosca junto a Las Candelas',
    correct: 'La Rosca Tradicional',
    wrongs: ['El Roscón de Reyes', 'La Mona de Pascua', 'La Tarta de Santiago', 'El Panettone', 'El Tronco de Navidad'],
  },
  {
    id: 'rc-prueba-cerdo',
    category: 'recetas',
    emoji: '🥩',
    prompt: 'Magro de cerdo ibérico picado y adobado con ajo, orégano, sal y pimentón de la Vera pasado por la sartén:',
    clue: 'Se hacía el día de la matanza para «probar» el aliño de los chorizos',
    correct: 'La Prueba de Matanza',
    wrongs: ['El Lacón con Grelos', 'El Cochifrito Segoviano', 'La Carne Mechada', 'El Rabo de Toro', 'El Ternasco Asado'],
  },
  {
    id: 'rc-esparragos',
    category: 'recetas',
    emoji: '🌿',
    prompt: 'Revuelto con huevos camperos y los tallos silvestres que salimos a coger junto a las paredes de piedra tras llover:',
    clue: 'Uno de los manjares más sabrosos de nuestras dehesas en primavera',
    correct: 'Revuelto de Espárragos Trigueros',
    wrongs: ['Tortilla de Habas', 'Menestra de Alcachofas', 'Acelgas Rehogadas', 'Espinacas con Garbanzos', 'Pochas a la Navarra'],
  },
  {
    id: 'rc-tecula-mecula',
    category: 'recetas',
    emoji: '🥧',
    prompt: 'Famoso postre antiguo de origen imperial con base de hojaldre, almendra molida y crema suave de yema:',
    clue: 'Una de las tartas más finas y tradicionales de la repostería extremeña',
    correct: 'La Técula Mécula',
    wrongs: ['El Tocino de Cielo', 'La Quesada Pasiega', 'El Brazo de Gitano', 'La Pantxineta', 'El Bienmesabe'],
  },
  {
    id: 'rc-hornazo',
    category: 'recetas',
    emoji: '🥟',
    prompt: 'Bollo o empanada horneada con chorizo, lomo o huevo duro que llevábamos de merienda al campo en Pascua:',
    clue: 'Inseparable de las romerías primaverales y del Día de la Luz',
    correct: 'El Hornazo',
    wrongs: ['El Pan de Calatrava', 'La Coca de Verduras', 'El Mollete', 'El Pan Preñao Asturiano', 'La Empanada de Zamburiñas'],
  },
  {
    id: 'rc-sopa-ajo',
    category: 'recetas',
    emoji: '🧄',
    prompt: 'Caldo reconfortante de invierno con ajos dorados, pan del día anterior, pimentón de la Vera y huevo escalfado:',
    clue: 'Entona el cuerpo enseguida en las noches más frías de enero',
    correct: 'La Sopa de Ajo Extremeña',
    wrongs: ['La Sopa de Pescado', 'El Consomé al Jerez', 'Las Gachas Dulces', 'La Sopa de Cebolla Gratinada', 'El Caldo de Pintada'],
  },
  {
    id: 'rc-ensalada-naranja',
    category: 'recetas',
    emoji: '🍊',
    prompt: 'Plato fresco de invierno con rodajas de naranja aliñadas con aceite de oliva, huevo duro o bacalao y cebolla:',
    clue: 'Contraste delicioso entre lo dulce, lo salado y el buen aceite de la tierra',
    correct: 'Ensalada Hurdana de Naranja',
    wrongs: ['Macedonia en Almíbar', 'Salpicón de Marisco', 'Tomate Relleno', 'Cogollos con Ventresca', 'Aguacates Rellenos'],
  },
  {
    id: 'rc-rosquillas-anis',
    category: 'recetas',
    emoji: '🥨',
    prompt: 'Rosquillas caseras amasadas con aceite frito con cáscara de naranja, aguardiente y granitos de matalahúva:',
    clue: 'Guardadas en lata en la despensa aguantaban tiernas semanas enteras',
    correct: 'Las Rosquillas de Anís',
    wrongs: ['Los Macarons', 'Las Palmeritas de Chocolate', 'Los Polvorones', 'Los Suspiros de Amante', 'Las Tejas de Tolosa'],
  },
  {
    id: 'rc-caldillo-tajo',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'En los pueblos ribereños como Herrera de Alcántara y Alcántara, los peces del Tajo se preparaban con ajo, laurel, vinagre y pimentón en…',
    clue: 'Una forma tradicional de conservar y saborear la pesca del río varios días',
    correct: 'Escabeche Ribereño del Tajo',
    wrongs: ['Zarzuela de Marisco', 'Caldero del Mar Menor', 'Merluza a la Sidra', 'Suquet de Pescado', 'Atún Encebollado'],
  },
  {
    id: 'rc-pimenton-vera',
    category: 'recetas',
    emoji: '🌶️',
    prompt: '¿Qué condimento rojo secado al humo de encina o roble da color y aroma único a casi todos nuestros guisos y matanzas?',
    clue: 'El auténtico «oro rojo» de la provincia de Cáceres',
    correct: 'El Pimentón de la Vera',
    wrongs: ['El Azafrán en Hebra', 'El Comino Molido', 'La Pimienta Blanca', 'El Curry Dulce', 'La Nuez Moscada'],
  },
  {
    id: 'rc-morcilla-calabaza',
    category: 'recetas',
    emoji: '🎃',
    prompt: 'Embutido jugoso y ligeramente dulzón típico de nuestras matanzas cacereñas elaborado con calabaza cocida, papada ibérica, ajo y pimentón:',
    clue: 'Exquisita pasada por la sartén con unos huevos fritos o en el cocido',
    correct: 'La Morcilla de Calabaza (Morcilla Lustre)',
    wrongs: ['La Morcilla de Burgos con Arroz', 'La Longaniza Blanca', 'El Salchichón de Vic', 'El Chorizo a la Sidra', 'La Butifarra Negra'],
  },
  {
    id: 'rc-frite-cordero',
    category: 'recetas',
    emoji: '🍖',
    prompt: 'Trozos tiernos de cabrito o cordero lechal fritos primero con ajos y guisados con majado de hígado, laurel y pimentón:',
    clue: 'Uno de los platos de domingo y celebraciones más queridos de Cáceres',
    correct: 'El Frite Extremeño',
    wrongs: ['El Lechazo al Horno de Barro', 'Las Chuletillas al Sarmiento', 'El Estofado de Buey', 'El Magret de Pato', 'El Conejo al Romero'],
  },
  {
    id: 'rc-bacalao-dorado',
    category: 'recetas',
    emoji: '🍳',
    prompt: 'Por la cercanía con Portugal en Herrera de Alcántara y Cáceres nos encanta este plato de bacalao desmigado con patatas paja y huevo jugoso:',
    clue: 'Receta vecina de La Raya que ya es como de casa en toda nuestra provincia',
    correct: 'El Bacalao Dorado (À Brás)',
    wrongs: ['La Merluza en Salsa Verde', 'El Pulpo a Feira', 'El Besugo al Horno', 'El Cazón en Adobo', 'Los Calamares en su Tinta'],
  },
  {
    id: 'rc-pestinos',
    category: 'recetas',
    emoji: '🍯',
    prompt: 'Masa fina con vino blanco y ajonjolí o anís doblada por las puntas, frita en buen aceite y bañada en miel de nuestras sierras:',
    clue: 'Dulce tradicional que perfuma toda la cocina en Cuaresma y Navidad',
    correct: 'Los Pestiños con Miel',
    wrongs: ['Los Croissants de Mantequilla', 'Las Napolitanas de Crema', 'Los Profiteroles', 'Los Merengues Secos', 'Las Tartaletas de Fresa'],
  },
  {
    id: 'rc-queso-ibores',
    category: 'recetas',
    emoji: '🐐',
    prompt: 'Queso artesano de leche cruda de cabra de nuestra provincia cuya corteza se frota tradicionalmente con aceite y pimentón:',
    clue: 'Con Denominación de Origen en las comarcas cacereñas de Ibores, Villuercas y Trujillo',
    correct: 'El Queso de los Ibores',
    wrongs: ['El Queso Manchego Añejo', 'El Queso Mahón', 'El Queso Majorero', 'El Queso Roncal', 'El Queso Azul'],
  },
  {
    id: 'rc-sopa-obispo',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Sopa tradicional de vigilia o fiesta en la provincia hecha con pan, caldo suave, huevos cocidos o escalfados y un majado aromático:',
    clue: 'Plato antiguo de cuchara de los pueblos cacereños con nombre eclesiástico',
    correct: 'La Sopa del Obispo (o Sopa Cano)',
    wrongs: ['La Sopa Juliana', 'El Ramen de Fideos', 'La Sopa Minestrone', 'El Gazpachuelo Malagueño', 'La Sopa de Aleta'],
  },
  {
    id: 'rc-sopa-cano',
    category: 'recetas',
    emoji: '🥛',
    prompt: 'Sopa humilde y riquísima de nuestros abuelos donde el refrito de ajo, cebolla, pimiento y pimentón se cuece con pan y un chorrito de leche:',
    clue: 'Blanquecina por la leche y rojiza por el pimentón, reconfortaba cuerpo y alma',
    correct: 'La Sopa Cano',
    wrongs: ['La Crema de Marisco', 'El Puré de Calabacín', 'La Sopa de Letras', 'El Caldo de Gallina Vieja', 'La Sopa de Miso'],
  },
  {
    id: 'rc-criadillas-tierra',
    category: 'recetas',
    emoji: '🍄',
    prompt: 'Hongo primaveral que brota bajo tierra en nuestras dehesas arenosas y está exquisito en revuelto o con arroz:',
    clue: 'Conocida como la «trufa blanca extremeña», un tesoro oculto del campo cacereño',
    correct: 'Las Criadillas de Tierra',
    wrongs: ['Los Champiñones Laminados', 'Las Setas de Cardo Secas', 'Los Níscalos en Vinagre', 'Las Colmenillas Rellenas', 'Las Trufas del Périgord'],
  },
  {
    id: 'rc-cardillos',
    category: 'recetas',
    emoji: '🥬',
    prompt: 'Verdura silvestre muy tierna de primavera que recogíamos en el campo para esparragarla o echarla al cocido y tortillas:',
    clue: 'Sus pencas limpias tienen un sabor suave y finísimo muy apreciado en Cáceres',
    correct: 'Los Cardillos Silvestres',
    wrongs: ['Las Coles de Bruselas', 'El Brócoli al Vapor', 'La Lombarda con Manzana', 'Los Grelos Gallegos', 'La Endivia Belga'],
  },
  {
    id: 'rc-escabeche-habas',
    category: 'recetas',
    emoji: '🫛',
    prompt: 'En Cuaresma y primavera, ¿cómo guisaban nuestras madres las habas tiernas con su vaina, ajos, laurel, harina frita, pimentón y vinagre?',
    clue: 'Se pueden comer templadas o frías y ganan todavía más sabor de un día para otro',
    correct: 'Las Habas en Escabeche (o Esparragadas)',
    wrongs: ['Las Habas a la Catalana con Butifarra', 'Las Alubias Tolosanas', 'Los Guisantes con Menta', 'Las Lentejas con Arroz', 'La Menestra Riojana'],
  },
  {
    id: 'rc-peces-escabeche',
    category: 'recetas',
    emoji: '🍋',
    prompt: 'En Semana Santa en Cáceres y los pueblos del Tajo, el bacalao o los barbos rebozados se conservan en una salsa fría con rodajas de naranja o limón:',
    clue: 'Un plato de Viernes Santo que no faltaba en ninguna fuente honda de loza',
    correct: 'El Bacalao o Peces en Escabeche de Naranja',
    wrongs: ['El Salmón Ahumado Noruego', 'La Lubina a la Sal', 'El Rodaballo a la Plancha', 'Las Gambas al Ajillo', 'El Rape Americano'],
  },
  {
    id: 'rc-perrunillas-convento',
    category: 'recetas',
    emoji: '⛪',
    prompt: 'En la Parte Antigua de Cáceres era toda una tradición acercarse al torno del Convento de San Pablo a comprar cajas de…',
    clue: 'Yemas, pastas, perrunillas y dulces artesanos hechos por las monjas clarisas',
    correct: 'Dulces de las Monjas de San Pablo',
    wrongs: ['Turrones de Jijona', 'Mazapanes de Soto', 'Fartons Glaseados', 'Alfajores de Medina', 'Carbayones de Oviedo'],
  },
  {
    id: 'rc-jamon-dehesa',
    category: 'recetas',
    emoji: '🍖',
    prompt: 'Criado en libertad bajo nuestras encinas comiendo bellota e hierba fresca durante la montanera:',
    clue: 'Cortado finito a cuchillo con picos de pan, orgullo mayor de Extremadura',
    correct: 'El Jamón Ibérico Dehesa de Extremadura',
    wrongs: ['El Jamón Cocido Dulce', 'La Cecina de León', 'El Pastrami Ahumado', 'El Lacon Asado', 'La Panceta Curada'],
  },
  {
    id: 'rc-lomito-presa',
    category: 'recetas',
    emoji: '🥩',
    prompt: 'Pieza jugosísima y veteada del cerdo ibérico embutida con pimentón o asada a la brasa de encina:',
    clue: 'Junto al secreto y la pluma, uno de los bocados ibéricos más tiernos',
    correct: 'El Lomito / Presa Ibérica',
    wrongs: ['El Chuletón de Buey', 'La Pechuga de Pavo', 'El Solomillo Wellington', 'Las Costillas Barbacoa', 'El Redondo de Ternera'],
  },
  {
    id: 'rc-higos-almibar',
    category: 'recetas',
    emoji: '🍈',
    prompt: 'Fruto dulce y meloso muy abundante en nuestras higueras cacereñas (especialmente en Almoharín), delicioso fresco, seco o con chocolate:',
    clue: 'En agosto y septiembre llenaban las cestas de mimbre y los secaderos al sol',
    correct: 'Los Higos y Brevas de Nuestra Tierra',
    wrongs: ['Los Plátanos de Canarias', 'Las Piñas Tropicales', 'Los Mangos Malagueños', 'Las Papayas Dulces', 'Los Kiwis del Norte'],
  },
  {
    id: 'rc-picotas-jerte',
    category: 'recetas',
    emoji: '🍒',
    prompt: 'Variedad única de cereza cacereña crujiente, muy dulce y que se recoge del árbol sin rabito:',
    clue: 'Con Denominación de Origen en los valles del norte de nuestra provincia',
    correct: 'La Picota del Jerte',
    wrongs: ['La Fresa de Huelva', 'El Melocotón de Calanda', 'La Ciruela Claudia Verde', 'El Níspero de Callosa', 'El Albaricoque Real'],
  },
  {
    id: 'rc-pinonate',
    category: 'recetas',
    emoji: '🍯',
    prompt: 'Dulce tradicional de fiesta y carnaval en la comarca de Alcántara, Garrovillas y Casar hecho con roscos o bastoncitos de masa frita ligados con miel:',
    clue: 'Una delicia artesana antiquísima que brilla dorada por la miel cocida',
    correct: 'El Piñonate',
    wrongs: ['El Merengue Suizo', 'La Tarta Sacher', 'El Coulant de Chocolate', 'El Milhojas de Nata', 'La Pavlova'],
  },
  {
    id: 'rc-arroz-liebre',
    category: 'recetas',
    emoji: '🥘',
    prompt: 'Arroz meloso o caldoso guisado a fuego lento con caza menor del campo, ajo, pimiento seco, laurel y vino de la tierra:',
    clue: 'Plato clásico de otoño e invierno en los pueblos y cortijos cacereños',
    correct: 'El Arroz con Liebre',
    wrongs: ['El Risotto de Setas y Parmesano', 'El Arroz Tres Delicias', 'La Paella de Marisco', 'El Arroz Negro con Alioli', 'El Sushi Variado'],
  },
  {
    id: 'rc-torrijas-miel',
    category: 'recetas',
    emoji: '🍞',
    prompt: 'Rebanadas de pan empapadas en leche aromatizada con canela y cáscara de limón, rebozadas en huevo, fritas y bañadas en miel o azúcar:',
    clue: 'Reinas indiscutibles de todas nuestras casas cuando llega la Semana Santa',
    correct: 'Las Torrijas Caseras',
    wrongs: ['Los Gofres Belgas', 'Las Tortitas con Sirope', 'Los Muffins de Arándanos', 'Las Magdalenas Cuadradas', 'Los Bizcochos de Soletilla'],
  },
  {
    id: 'rc-mantecados-cajon',
    category: 'recetas',
    emoji: '🧁',
    prompt: 'Bizcochitos esponjosos horneados antiguamente en moldes cuadrados de papel doblado a mano en los hornos de pan de nuestros pueblos:',
    clue: 'Ideales para mojar en el tazón de leche o chocolate caliente del desayuno',
    correct: 'Los Mantecados / Bollos de Cajón',
    wrongs: ['Los Donuts Glaseados', 'Las Berlinas Rellenas', 'Los Churros de Lazo', 'Las Galletas María', 'Los Barquillos'],
  },
  {
    id: 'rc-cochifrito-tostón',
    category: 'recetas',
    emoji: '🐖',
    prompt: 'Cochinillo en trozos pequeños frito muy lentamente con abundantes ajos enteros con piel, laurel y un toque de limón o vinagre:',
    clue: 'Crujiente por fuera y tiernísimo por dentro, imprescindible en bodas y fiestas',
    correct: 'La Cuchifrita / Cochifrito Extremeño',
    wrongs: ['El Pollo Empanado', 'Las Albóndigas en Salsa', 'El Filete Ruso', 'El Escalope Vienés', 'El Pavo Asado'],
  },
  {
    id: 'rc-aceitunas-machacadas',
    category: 'recetas',
    emoji: '🫒',
    prompt: 'Aperitivo que nunca falta en nuestras mesas, aliñado en casa con agua, sal, ajos machacados, tomillo, orégano, hinojo y tiras de pimiento o limón:',
    clue: 'Cada familia guarda con orgullo el secreto de su aliño de cosecha propia',
    correct: 'Las Aceitunas Partidas / Machacadas',
    wrongs: ['Los Pepinillos Dulces', 'Las Alcaparras Saladas', 'Las Cebollitas Francesas', 'El Maíz Tostado', 'Los Altramuces Picantes'],
  },
  {
    id: 'rc-caldereta-venado',
    category: 'recetas',
    emoji: '🦌',
    prompt: 'Guiso intenso y sabroso de caza mayor típico de la Sierra de San Pedro, Monfragüe y el Tajo Internacional, marinado antes con vino tinto, tomillo y laurel:',
    clue: 'Carne tierna cocinada despacio durante horas como en las monterías tradicionales',
    correct: 'El Estofado / Caldereta de Venado',
    wrongs: ['El Roast Beef Inglés', 'La Ternera Strogonoff', 'El Carpaccio con Rúcula', 'El Steak Tartar', 'La Hamburguesa con Queso'],
  },
  {
    id: 'rc-tortilla-esparragos-ajetes',
    category: 'recetas',
    emoji: '🥚',
    prompt: 'Cuando salíamos de gira al campo en el Día de la Luz o romerías de mayo, junto al hornazo nunca faltaba en la fiambrera una buena…',
    clue: 'Cuajada con patatas nuevas, cebolla tierna o pimientos verdes de la huerta',
    correct: 'Tortilla de Patatas Camperas',
    wrongs: ['Quiche de Salmón', 'Pizza Cuatro Quesos', 'Lasaña Gratinada', 'Crepe de Jamón', 'Soufflé de Queso'],
  },
  {
    id: 'rc-huesillos',
    category: 'recetas',
    emoji: '🥖',
    prompt: 'Dulce tradicional extremeño de Carnaval y Todos los Santos en forma de rulitos alargados de masa con anís fritos y rebozados en azúcar:',
    clue: 'Crujientes por fuera, tiernos por dentro y facilísimos de comer uno tras otro',
    correct: 'Los Huesillos Extremeños',
    wrongs: ['Los Huesos de Santo de Mazapán', 'Los Panellets de Piñones', 'Las Yemas de Santa Teresa', 'Los Roscos de Vino Malagueños', 'Los Borrachuelos'],
  },
  {
    id: 'rc-migas-dulces-chocolate',
    category: 'recetas',
    emoji: '☕',
    prompt: 'En muchas casas de Cáceres y los pueblos de Alcántara, cuando sobraban migas del mediodía o por la mañana temprano se tomaban en tazón con…',
    clue: 'Una combinación muy extremeña que sorprende a los de fuera y a nosotros nos encanta',
    correct: 'Café con Leche o Chocolate Caliente',
    wrongs: ['Refresco de Limón con Hielo', 'Horchata de Chufa', 'Té Verde con Menta', 'Sidra Asturiana Escanciada', 'Zumo de Piña'],
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
        <div className="flex items-start sm:items-center justify-between gap-2 px-1 shrink-0">
          <h3 className="text-base sm:text-2xl md:text-3xl font-black text-stone-950 text-left leading-snug break-words">
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
            <p className="text-xs sm:text-lg md:text-xl font-bold text-stone-700 bg-stone-100 border border-stone-300 rounded-xl px-2.5 py-1 leading-snug break-words shrink-0">
              💡 {currentItem.clue}
            </p>
          </div>
        ) : (
          <div
            className={`${meta.cardBg} border-2 sm:border-3 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 flex flex-row items-center justify-start sm:justify-center gap-2.5 sm:gap-4 shrink-0`}
          >
            <span className="text-4xl sm:text-7xl leading-none shrink-0" aria-hidden="true">
              {currentItem.emoji}
            </span>
            <div className="text-left min-w-0 flex-1">
              <p className="font-black text-stone-950 text-base sm:text-2xl md:text-3xl leading-snug break-words">
                {currentItem.prompt}
              </p>
              <p className="font-bold text-stone-700 text-xs sm:text-lg md:text-xl mt-0.5 sm:mt-1 leading-snug break-words">
                {currentItem.clue}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de respuesta */}
        {feedback && (
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-sm sm:text-xl leading-snug break-words shrink-0">
            {feedback}
          </div>
        )}

        {/* Botones de opciones: en móvil siempre a ancho completo (1 columna) para que ningún texto largo se parta ni se corte */}
        <div
          className={`w-full grid gap-1.5 sm:gap-3 items-stretch ${
            isPhotoRound
              ? options.length === 2
                ? 'shrink-0 grid-cols-1 sm:grid-cols-2'
                : 'shrink-0 grid-cols-1 sm:grid-cols-3'
              : options.length === 3
              ? 'flex-1 min-h-0 grid-cols-1 grid-rows-3 sm:grid-cols-3 sm:grid-rows-1'
              : 'flex-1 min-h-0 grid-cols-1 grid-rows-4 sm:grid-cols-2 sm:grid-rows-2'
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
                    ? 'py-2 sm:py-3 min-h-[42px] sm:min-h-[58px] text-base sm:text-xl md:text-2xl'
                    : 'py-1.5 sm:py-3 text-base sm:text-2xl md:text-3xl min-h-0'
                } flex items-center justify-center text-center font-black leading-snug whitespace-normal break-words cursor-pointer transition-all active:scale-95 shadow-xs ${btnClasses}`}
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
