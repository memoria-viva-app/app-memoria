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
  | 'foto-patrimonio'
  | 'foto-costumbres'
  | 'habla'
  | 'tradiciones'
  | 'recetas'

interface GuarenaQuestion {
  id: string
  category: RoundCategory
  prompt: string
  clue: string
  photo?: string
  emoji?: string
  correct: string
  wrongs: string[]
}

const STORAGE_KEY = 'memoria_viva_recent_guarena_tierra'

const GUARENA_PRAISES = [
  '¡Qué bien conoces nuestra Guareña!',
  '¡Eso es! De pura cepa guareñense.',
  '¡Exacto! Qué buenos recuerdos del pueblo.',
  '¡Muy bien dicho, sí señor!',
  '¡Clavado! Conoces Guareña al dedillo.',
  '¡Bravo! Con todo el miajón castúo.',
  '¡Qué memoria tan estupenda tienes!',
  '¡Olé! Ni un detalle de Guareña se te escapa.',
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

function pickFreshQuestion(pool: GuarenaQuestion[], recent: string[]): GuarenaQuestion {
  const unplayed = pool.filter((q) => !recent.includes(q.id))
  const candidates = unplayed.length > 0 ? unplayed : pool
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// ============================================================================
// RONDA 1: PATRIMONIO, HISTORIA Y RINCONES DE GUAREÑA EN FOTO (20 preguntas)
// ============================================================================
const PATRIMONIO_PHOTO_ITEMS: GuarenaQuestion[] = [
  {
    id: 'gu-santa-maria-1',
    category: 'foto-patrimonio',
    prompt: '¿Qué gran monumento de Guareña vemos en la fotografía?',
    clue: 'Templo renacentista iniciado en 1557, orgullo mayor de nuestro pueblo',
    photo: './guarena/santa-maria-1.jpg',
    correct: 'Iglesia de Santa María',
    wrongs: ['Ermita de San Isidro', 'Capilla de San Roque', 'Convento de Santa Clara', 'Ermita del Pilar'],
  },
  {
    id: 'gu-santa-maria-torre',
    category: 'foto-patrimonio',
    prompt: '¿Qué campanario domina desde lo alto todo el caserío de Guareña?',
    clue: 'En sus obras intervinieron grandes maestros como Rodrigo Gil de Hontañón',
    photo: './guarena/santa-maria-2.jpg',
    correct: 'La Torre de Santa María',
    wrongs: ['La Torre del Reloj Viejo', 'La Espadaña del Santo', 'El Torreón de la Alberca', 'La Atalaya del Monte'],
  },
  {
    id: 'gu-ayuntamiento-1',
    category: 'foto-patrimonio',
    prompt: '¿Qué edificio preside la Plaza de España de Guareña?',
    clue: 'Con sus soportales de granito, su reloj central y el nido de cigüeña en lo alto',
    photo: './guarena/ayuntamiento-1.jpg',
    correct: 'El Ayuntamiento de Guareña',
    wrongs: ['La Antigua Estación de Tren', 'El Mercado de Abastos', 'El Casino Viejo', 'La Cámara Agraria'],
  },
  {
    id: 'gu-plaza-espana',
    category: 'foto-patrimonio',
    prompt: '¿En qué céntrica plaza de Guareña se levanta esta fachada porticada?',
    clue: 'El corazón neurálgico de paseos, pregones, fiestas y citas vecinales',
    photo: './guarena/ayuntamiento-2.jpg',
    correct: 'En la Plaza de España',
    wrongs: ['En las Cuatro Esquinas', 'En el Parque San Ginés', 'En la Ronda del Pilar', 'En el Camino de la Estación'],
  },
  {
    id: 'gu-catalina-cortes',
    category: 'foto-patrimonio',
    prompt: '¿Cómo conocemos en Guareña este bello palacete de la calle Don Diego López?',
    clue: 'Joya modernista y neoclásica con mirador en esquina del primer tercio del siglo XX',
    photo: './guarena/catalina-cortes.jpg',
    correct: 'Casa de Doña Catalina Cortés',
    wrongs: ['Casa del Comendador', 'Palacio de los Duques', 'Posada de la Calle Grande', 'Casona del Pósito'],
  },
  {
    id: 'gu-catalina-calle',
    category: 'foto-patrimonio',
    prompt: '¿En qué conocida calle de Guareña se alza el Palacete de Doña Catalina Cortés?',
    clue: 'Vía señorial muy céntrica del casco histórico guareñense',
    photo: './guarena/catalina-cortes.jpg',
    correct: 'En la Calle Don Diego López',
    wrongs: ['En la Calle Oriente', 'En la Ronda del Guadiana', 'En el Callejón del Horno', 'En la Avenida del Pantano'],
  },
  {
    id: 'gu-chamizo-obra',
    category: 'foto-patrimonio',
    prompt: '¿Qué libro inmortal escribió este hijo predilecto de Guareña?',
    clue: 'Publicado en 1921, elevó el habla castúa de nuestro pueblo a la gran poesía',
    photo: './guarena/luis-chamizo.jpg',
    correct: 'El Miajón de los Castúos',
    wrongs: ['Platero y Yo', 'Campos de Castilla', 'Romancero Gitano', 'Cántico Espiritual'],
  },
  {
    id: 'gu-chamizo-poema',
    category: 'foto-patrimonio',
    prompt: '¿Qué célebre poema de este autor guareñense comienza sintiendo la tierra y la jesa?',
    clue: 'Su amigo Eugenio Frutos contó con emoción cómo lo vio escribir sus primeros versos',
    photo: './guarena/luis-chamizo.jpg',
    correct: 'La Nacencia',
    wrongs: ['La Canción del Pirata', 'Las Coplas a la Muerte', 'Soledades', 'Nanas de la Cebolla'],
  },
  {
    id: 'gu-vista-aerea',
    category: 'foto-patrimonio',
    prompt: '¿Qué vemos rodeando todo el casco blanco de nuestra Guareña desde el aire?',
    clue: 'Tierra fértil de labor donde se dan la mano los olivares, las viñas y el cereal',
    photo: './guarena/guarena-urbana.jpg',
    correct: 'Olivares, viñas y tierras de vega',
    wrongs: ['Pinares de alta montaña', 'Acantilados junto al mar', 'Bosques de hayas y abetos', 'Arrozales inundados de costa'],
  },
  {
    id: 'gu-panoramica-entrada',
    category: 'foto-patrimonio',
    prompt: 'Al acercarnos por carretera a Guareña entre olivos, ¿qué silueta sobresale en lo alto?',
    clue: 'Por sus dimensiones monumentales se la llama con orgullo catedralicia',
    photo: './guarena/panoramica.jpg',
    correct: 'La mole de Santa María',
    wrongs: ['Un castillo con foso de agua', 'Un acueducto de tres pisos', 'Una muralla de pizarra negra', 'Un faro blanco redondo'],
  },
  {
    id: 'gu-escudo',
    category: 'foto-patrimonio',
    prompt: '¿Qué representa este emblema histórico conservado en Guareña?',
    clue: 'Símbolo oficial e histórico de nuestra villa a lo largo de los siglos',
    photo: './guarena/escudo-villa.jpg',
    correct: 'El Escudo de la Villa de Guareña',
    wrongs: ['El Sello de los Alfareros', 'El Emblema del Ferrocarril', 'La Cruz del Pantano', 'El Blasón de la Mesta'],
  },
  {
    id: 'gu-turunuelo-dama',
    category: 'foto-patrimonio',
    prompt: '¿En qué yacimiento del término de Guareña apareció este rostro tartésico?',
    clue: 'Un hallazgo mundialmente famoso del siglo V antes de Cristo en nuestra tierra',
    photo: './guarena/turunuelo-dama.jpg',
    correct: 'En Casas del Turuñuelo',
    wrongs: ['En la Cueva del Monte', 'En el Cerro de la Horca', 'En las Minas Viejas', 'En el Pozo de la Nieve'],
  },
  {
    id: 'gu-turunuelo-joyas',
    category: 'foto-patrimonio',
    prompt: '¿Qué adorno lleva esculpido esta famosa figura hallada en El Turuñuelo de Guareña?',
    clue: 'Demuestra la finísima orfebrería tartésica hace más de 2.500 años',
    photo: './guarena/turunuelo-dama.jpg',
    correct: 'Diadema y grandes arracadas (pendientes)',
    wrongs: ['Corona de hojas de roble', 'Gafas de cristal tallado', 'Sombrero de ala ancha', 'Collar de conchas marinas'],
  },
  {
    id: 'gu-turunuelo-rostros',
    category: 'foto-patrimonio',
    prompt: '¿Por qué hicieron historia en todo el mundo estos relieves hallados en Guareña?',
    clue: 'Hasta excavarse El Turuñuelo se creía que esa antigua cultura no esculpía figuras humanas',
    photo: './guarena/turunuelo-rostros.jpg',
    correct: 'Son los primeros rostros humanos de Tartessos',
    wrongs: ['Son estatuas visigodas del siglo X', 'Son retratos de alcaldes del siglo XIX', 'Son tallas barrocas de madera', 'Son máscaras de teatro griego'],
  },
  {
    id: 'gu-turunuelo-guerrero',
    category: 'foto-patrimonio',
    prompt: 'Junto a las damas de El Turuñuelo en Guareña apareció también el relieve de…',
    clue: 'Se distingue claramente por la protección que cubre su cabeza',
    photo: './guarena/turunuelo-guerrero.jpg',
    correct: 'Un guerrero tartésico con casco',
    wrongs: ['Un marinero con timón', 'Un monje medieval leyendo', 'Un escribano con pluma', 'Un músico con guitarra'],
  },
  {
    id: 'gu-turunuelo-relieve2',
    category: 'foto-patrimonio',
    prompt: '¿De qué época histórica es el gran edificio de dos plantas de El Turuñuelo en Guareña?',
    clue: 'Conservado bajo tierra sellado en adobe desde hace unos veinticinco siglos',
    photo: './guarena/turunuelo-relieve.jpg',
    correct: 'De la época Tartésica (siglo V a. C.)',
    wrongs: ['De la Guerra de la Independencia', 'De la Edad Media cristiana', 'Del siglo XVIII ilustrado', 'De los años veinte'],
  },
  {
    id: 'gu-turunuelo-abecedario',
    category: 'foto-patrimonio',
    prompt: '¿Qué tesoro epigráfico grabado en pizarra se descubrió en El Turuñuelo de Guareña?',
    clue: 'Contiene una secuencia ordenada de 21 signos de escritura paleo-hispánica',
    photo: './guarena/turunuelo-abecedario.jpg',
    correct: 'El Abecedario del Turuñuelo',
    wrongs: ['Un calendario de siembra romano', 'El plano de una acequia árabe', 'Una partitura musical antigua', 'Una carta real en pergamino'],
  },
  {
    id: 'gu-turunuelo-bronces',
    category: 'foto-patrimonio',
    prompt: '¿De qué metal están hechas estas valiosas piezas rituales halladas en El Turuñuelo (Guareña)?',
    clue: 'Aparecieron junto a la gran escalinata y el patio del santuario tartésico',
    photo: './guarena/turunuelo-carro.jpg',
    correct: 'De bronce tartésico',
    wrongs: ['De aluminio moderno', 'De porcelana pintada', 'De vidrio soplado azul', 'De acero inoxidable'],
  },
  {
    id: 'gu-torrefresneda-1',
    category: 'foto-patrimonio',
    prompt: '¿Cómo se llama la Entidad Local Menor perteneciente al municipio de Guareña?',
    clue: 'Poblado blanco nacido con el Plan Badajoz cuya iglesia está dedicada a la Virgen de Fátima',
    photo: './guarena/torrefresneda-iglesia.jpg',
    correct: 'Torrefresneda',
    wrongs: ['Valdehornillos', 'Pueblonuevo', 'Gargáligas', 'Alonso de Ojeda'],
  },
  {
    id: 'gu-torrefresneda-2',
    category: 'foto-patrimonio',
    prompt: '¿A qué Virgen está dedicada la parroquia de nuestra pedanía de Torrefresneda (Guareña)?',
    clue: 'Celebra con gran cariño sus fiestas patronales en el mes de mayo',
    photo: './guarena/torrefresneda-plaza.jpg',
    correct: 'Nuestra Señora de Fátima',
    wrongs: ['Virgen de la Montaña', 'Virgen del Carmen', 'Virgen de las Nieves', 'Virgen de Covadonga'],
  },
]

// ============================================================================
// RONDA 2: OFICIOS, CAMPO Y SABORES DE GUAREÑA EN FOTO (22 preguntas)
// ============================================================================
const COSTUMBRES_PHOTO_ITEMS: GuarenaQuestion[] = [
  {
    id: 'gu-foto-tinajas',
    category: 'foto-costumbres',
    prompt: '¿Qué recipientes fabricaba en Guareña el padre de Luis Chamizo, dando fama de «tinajeros» a la familia?',
    clue: 'Grandes vasijas de barro cocido esenciales para guardar vino de pitarra y aceite',
    photo: './guarena/tinajas.jpg',
    correct: 'Tinajas de barro',
    wrongs: ['Toneles de roble francés', 'Cestas de esparto verde', 'Calderos de latón', 'Damajuanas de mimbre'],
  },
  {
    id: 'gu-foto-botijo',
    category: 'foto-costumbres',
    prompt: '¿Cómo llamamos en el campo de Guareña a este inseparable compañero de barro que refresca el agua?',
    clue: 'Nunca faltaba en la siega ni a la sombra del olivo para echar un buen trago',
    photo: './guarena/botijo.jpg',
    correct: 'El Botijo (o Piporro / Buche)',
    wrongs: ['El Porrón de cristal', 'La Alcuza del aceite', 'El Almirez de bronce', 'La Cantimplora militar'],
  },
  {
    id: 'gu-foto-bollas',
    category: 'foto-costumbres',
    prompt: '¿Qué dulce panadero tan típico de Guareña vemos aquí elaborado tras la matanza?',
    clue: 'Hechas con masa de pan, azúcar, anís y los trocitos dorados de fundir la manteca',
    photo: './guarena/bollas-chicharron.jpg',
    correct: 'Las Bollas de Chicharrones',
    wrongs: ['Los Sobaos Pasiegos', 'Las Ensaimadas Rellenas', 'Los Fartons Valencianos', 'Los Gofres Dulces'],
  },
  {
    id: 'gu-foto-migas-lumbre',
    category: 'foto-costumbres',
    prompt: '¿Qué plato tradicional de los días de lluvia y matanza en Guareña se mueve así en la sartén?',
    clue: 'Con pan asentado picado a cuchillo, ajos, buen aceite, pimentón y torreznos',
    photo: './guarena/migas-lumbre.jpg',
    correct: 'Las Migas Extremeñas',
    wrongs: ['El Arroz con Bogavante', 'La Fideuá Marinera', 'Las Gachas Dulces', 'El Pisto con Huevo'],
  },
  {
    id: 'gu-foto-migas-uvas',
    category: 'foto-costumbres',
    prompt: 'En otoño en Guareña, además de torreznos o pimientos fritos, ¿qué fruta casa de maravilla con las migas?',
    clue: 'El bocado fresco y dulce perfecto de nuestra vendimia entre cucharada y cucharada',
    photo: './guarena/migas-uvas.jpg',
    correct: 'Unos granos de uvas dulces',
    wrongs: ['Rodajas de piña en almíbar', 'Fresas con nata montada', 'Gajos de pomelo amargo', 'Ciruelas pasas cocidas'],
  },
  {
    id: 'gu-foto-migas-cazuela',
    category: 'foto-costumbres',
    prompt: '¿Qué ingrediente humilde y sagrado es la base principal para picar unas buenas migas guareñenses?',
    clue: 'Como decía Chamizo, el que guarda dentro «el miajón» bajo la corteza',
    photo: './guarena/migas-cazuela.jpg',
    correct: 'El pan asentado de varios días',
    wrongs: ['La harina fina de maíz', 'La patata rallada cruda', 'Los garbanzos remojados', 'La sémola de arroz'],
  },
  {
    id: 'gu-foto-caldereta',
    category: 'foto-costumbres',
    prompt: '¿Qué guiso festivo no puede faltar cuando nos juntamos en la Romería de San Isidro en Guareña?',
    clue: 'Cocinada a fuego lento en caldero con cordero, ajo, laurel, vino y majado de hígado',
    photo: './guarena/caldereta.jpg',
    correct: 'La Caldereta de Cordero',
    wrongs: ['El Marmitako de Bonito', 'La Fabada Asturiana', 'El Pulpo a la Gallega', 'El Bacalao al Pil-Pil'],
  },
  {
    id: 'gu-foto-perrunillas',
    category: 'foto-costumbres',
    prompt: '¿Qué pastas redondas de manteca, canela y limón llenan las latas de las casas de Guareña?',
    clue: 'Se deshacen en la boca acompañando el café o una copita de anís en días de fiesta',
    photo: './guarena/perrunillas.jpg',
    correct: 'Las Perrunillas Caseras',
    wrongs: ['Los Macarons Franceses', 'Las Tejas de Almendra', 'Los Merengues Blancos', 'Los Piononos'],
  },
  {
    id: 'gu-foto-gazpacho',
    category: 'foto-costumbres',
    prompt: '¿Qué plato fresco aliviaba el calor de los segadores en los veranos de Guareña?',
    clue: 'Majado con pan, ajo, tomate maduro de huerta, pimiento, pepino, aceite y vinagre',
    photo: './guarena/gazpacho.jpg',
    correct: 'El Gazpacho Machao',
    wrongs: ['La Crema de Espinacas', 'El Caldo Verde Caliente', 'La Vichyssoise de Puerro', 'El Consomé de Navidad'],
  },
  {
    id: 'gu-foto-pestinos',
    category: 'foto-costumbres',
    prompt: '¿Qué dulce tradicional de sartén bañado en miel es imprescindible en la Semana Santa de Guareña?',
    clue: 'Su masa perfumada con anís y vino blanco se dobla uniendo los picos antes de freír',
    photo: './guarena/pestinos.jpg',
    correct: 'Los Pestiños con Miel',
    wrongs: ['Los Churros Rellenos', 'Las Tartaletas de Crema', 'Los Bizcochos Borrachos', 'Las Marquesas'],
  },
  {
    id: 'gu-foto-torrijas',
    category: 'foto-costumbres',
    prompt: '¿Qué otro dulce reina cada Cuaresma y Semana Santa en todas las cocinas de Guareña?',
    clue: 'Rebanadas de pan bañadas en leche con canela y limón, pasadas por huevo y fritas',
    photo: './guarena/torrijas.jpg',
    correct: 'Las Torrijas Caseras',
    wrongs: ['Las Tortitas con Nata', 'Los Crepes de Chocolate', 'Los Barquillos Tostados', 'Las Galletas de Jengibre'],
  },
  {
    id: 'gu-foto-rosquillas',
    category: 'foto-costumbres',
    prompt: '¿Qué dulce redondo de sartén amasado con aguardiente, anís y cáscara de naranja hacían nuestras abuelas en Guareña?',
    clue: 'Tiernas por dentro y doradas por fuera, se hacían por fuentes enteras para toda la familia',
    photo: './guarena/rosquillas.jpg',
    correct: 'Las Rosquillas Caseras',
    wrongs: ['Los Pretzels Salados', 'Las Rosquillas Heladas', 'Los Panecillos de Leche', 'Los Buñuelos de Bacalao'],
  },
  {
    id: 'gu-foto-aceitunas',
    category: 'foto-costumbres',
    prompt: '¿Qué aperitivo casero aliñado con ajo, tomillo, orégano e hinojo nunca falta en una mesa de Guareña?',
    clue: 'Preparadas en casa tras el verdeo de nuestros propios olivares',
    photo: './guarena/aceitunas.jpg',
    correct: 'Las Aceitunas Machacadas / Partidas',
    wrongs: ['Los Pepinillos Agridulces', 'Las Alcaparras en Salazón', 'Las Guindillas Verdes', 'Las Cebollitas en Vinagre'],
  },
  {
    id: 'gu-foto-esparragos',
    category: 'foto-costumbres',
    prompt: 'Tras las lluvias de primavera en el término de Guareña salimos por lindes y olivares a buscarlos para este…',
    clue: 'Cuajado con huevos camperos y un chorrito de aceite de oliva virgen de nuestra cooperativa',
    photo: './guarena/esparragos.jpg',
    correct: 'Revuelto de Espárragos Trigueros',
    wrongs: ['Salteado de Bambú', 'Tortilla de Alcachofas', 'Guiso de Coles', 'Puré de Guisantes'],
  },
  {
    id: 'gu-foto-sopa-ajo',
    category: 'foto-costumbres',
    prompt: 'En las noches heladas de enero en Guareña, ¿qué sopa humilde y sabrosa entona el cuerpo al instante?',
    clue: 'Con ajos dorados, rebanadas finas de pan, pimentón y un huevo escalfado en el caldo',
    photo: './guarena/sopa-ajo.jpg',
    correct: 'La Sopa de Ajo',
    wrongs: ['La Sopa de Marisco', 'La Sopa de Cebolla Francesa', 'El Caldo de Pescado', 'La Sopa de Fideos Chinos'],
  },
  {
    id: 'gu-foto-hornazo',
    category: 'foto-costumbres',
    prompt: 'Cuando vamos al campo en primavera o a San Isidro en el pantano de San Roque, ¿qué llevamos en la merienda?',
    clue: 'Masa horneada dorada y rellena de embutido, lomo o atún y huevo duro',
    photo: './guarena/hornazo.jpg',
    correct: 'Empanada Casera / Hornazo',
    wrongs: ['Soufflé de Queso', 'Fondue Caliente', 'Pastel de Salmón Crudo', 'Volován de Nata'],
  },
  {
    id: 'gu-foto-olivar',
    category: 'foto-costumbres',
    prompt: '¿Qué árbol centenario cubre buena parte del término de Guareña dándonos nuestro preciado aceite?',
    clue: 'En invierno cuadrillas y familias salen con varas y mantones a varear su fruto',
    photo: './guarena/olivar.jpg',
    correct: 'El Olivo',
    wrongs: ['El Naranjo Amargo', 'El Manzano Sidrero', 'El Castaño Serrano', 'El Avellano'],
  },
  {
    id: 'gu-foto-jesa',
    category: 'foto-costumbres',
    prompt: '¿Cómo llamaba Luis Chamizo en el habla castúa de Guareña a este paisaje de encinas y pastos?',
    clue: 'En *La Nacencia* escribe con orgullo sobre el olor a tierra húmeda de «la jesa»',
    photo: './guarena/dehesa.jpg',
    correct: 'La Jesa (La Dehesa)',
    wrongs: ['La Marisma', 'El Páramo Helado', 'La Albufera', 'El Hayedo'],
  },
  {
    id: 'gu-foto-uvas-higos',
    category: 'foto-costumbres',
    prompt: 'Al llegar finales de agosto y septiembre a Guareña, ¿qué dos frutos dulces acompañan hasta las sopas de tomate?',
    clue: 'Recién cogidos de las viñas y las higueras del término al final del verano',
    photo: './guarena/uvas-higos.jpg',
    correct: 'Las Uvas y los Higos',
    wrongs: ['Los Arándanos y Frambuesas', 'Los Kiwis y Papayas', 'Los Cocos y Dátiles', 'Las Castañas y Bellotas'],
  },
  {
    id: 'gu-foto-vino-tinaja',
    category: 'foto-costumbres',
    prompt: '¿Qué vino tradicional elaboraban muchos vecinos de Guareña pisando la uva y fermentándola en estas vasijas?',
    clue: 'Compartido con orgullo entre amigos en las bodegas caseras con un taco de queso o chorizo',
    photo: './guarena/tinajas.jpg',
    correct: 'El Vino de Pitarra',
    wrongs: ['La Sidra Dulce', 'El Cava Espumoso', 'El Vermut Rojo', 'La Cerveza de Trigo'],
  },
  {
    id: 'gu-foto-aceite-coop',
    category: 'foto-costumbres',
    prompt: '¿Adónde llevan los agricultores de Guareña la aceituna recién cogida de estos árboles para moler el oro líquido?',
    clue: 'Allí nace el aceite virgen extra que aliña nuestros gazpachos, sopas y tostadas',
    photo: './guarena/olivar.jpg',
    correct: 'A la Almazara / Cooperativa del pueblo',
    wrongs: ['Al Astillero del río', 'A la Tahona de sal', 'Al Telar de lana', 'A la Fragua del herrero'],
  },
  {
    id: 'gu-foto-encina-bellota',
    category: 'foto-costumbres',
    prompt: '¿Qué fruto da este árbol de nuestras tierras de Guareña para criar en montanera al cerdo ibérico?',
    clue: 'Dulce de encina, que de niños también asábamos junto a las brasas',
    photo: './guarena/dehesa.jpg',
    correct: 'La Bellota',
    wrongs: ['El Piñón Blanco', 'La Nuez Moscada', 'La Almendra Amarga', 'El Hayuco'],
  },
]

// ============================================================================
// RONDA 3: EL CASTÚO DE LUIS CHAMIZO Y EL HABLA DE GUAREÑA (54 preguntas)
// ============================================================================
const HABLA_ITEMS: GuarenaQuestion[] = [
  {
    id: 'gh-miajon',
    category: 'habla',
    emoji: '🍞',
    prompt: 'Luis Chamizo tituló su gran obra en Guareña «El Miajón de los Castúos»',
    clue: '¿Qué significa literalmente la palabra "miajón"?',
    correct: 'La miga tierna del pan (y el alma honda de nuestra gente)',
    wrongs: ['La corteza quemada de la hogaza', 'El camino largo hacia el río', 'El sombrero del segador'],
  },
  {
    id: 'gh-castuo',
    category: 'habla',
    emoji: '📖',
    prompt: '«Somos castúos de pura cepa, como cantaba Chamizo en Guareña»',
    clue: '¿Qué quiso expresar Luis Chamizo al acuñar la palabra "castúo"?',
    correct: 'Hombre y habla castizos de la tierra extremeña, fieles a sus raíces',
    wrongs: ['Forastero llegado de tierras lejanas', 'Escribano de leyes antiguas en latín', 'Mercader que viaja por el mar'],
  },
  {
    id: 'gh-nacencia',
    category: 'habla',
    emoji: '👶',
    prompt: '«Brujas las del pueblo, echad las cuentas, que ya se acerca la nacencia»',
    clue: '¿Qué significa "la nacencia" en el castúo de Guareña?',
    correct: 'El nacimiento, el venir un niño al mundo',
    wrongs: ['La recogida de la aceituna en enero', 'La puesta del sol tras el cerro', 'La despedida de los quintos'],
  },
  {
    id: 'gh-jesa',
    category: 'habla',
    emoji: '🌳',
    prompt: '«Juelgo a tierra mojá de la jesa cuando caen las primeras aguas»',
    clue: '¿Qué es "la jesa" en los versos guareñenses de Chamizo?',
    correct: 'La dehesa arbolada de encinas y pastos',
    wrongs: ['La plaza mayor del ayuntamiento', 'La torre más alta de la iglesia', 'La bodega subterránea fresca'],
  },
  {
    id: 'gh-guapero',
    category: 'habla',
    emoji: '🌸',
    prompt: '«Como las flores tempranas del guapero en el camino»',
    clue: 'En el vocabulario castúo de Guareña, ¿qué árbol o arbusto del campo es el "guapero"?',
    correct: 'El peral o almendro silvestre de nuestros campos',
    wrongs: ['Un pino altísimo de montaña', 'Una palmera datilera', 'Un rosal de jardín cerrado'],
  },
  {
    id: 'gh-diquelar',
    category: 'habla',
    emoji: '👀',
    prompt: '«¡Diquela bien por dónde pisas entre los surcos!»',
    clue: '¿Qué significa "diquelar" en el habla popular recogida en Guareña?',
    correct: 'Mirar con atención, fijarse o darse cuenta',
    wrongs: ['Cantar en voz muy alta', 'Dormir la siesta a la sombra', 'Guardar el grano en el saco'],
  },
  {
    id: 'gh-palrar',
    category: 'habla',
    emoji: '🗣️',
    prompt: '«Asín palramos nosotros en el pueblo desde chiquininos»',
    clue: '¿Qué quiere decir "palrar"?',
    correct: 'Hablar, conversar con naturalidad',
    wrongs: ['Correr detrás de las liebres', 'Podar los sarmientos de la viña', 'Sacar agua fresca del pozo'],
  },
  {
    id: 'gh-jierro-jumo',
    category: 'habla',
    emoji: '🔥',
    prompt: 'En el castúo de Guareña decimos «jumo», «jierro», «jacha» o «jigo»',
    clue: '¿A qué palabras castellanas equivalen con nuestra típica "j" aspirada?',
    correct: 'Humo, hierro, hacha e higo',
    wrongs: ['Zumo, barro, racha y trigo', 'Junco, cerro, fecha y mijo', 'Yugo, perro, bache y nido'],
  },
  {
    id: 'gh-coguelmo',
    category: 'habla',
    emoji: '🌾',
    prompt: '«Llenó la medida de trigo con buen cogüelmo»',
    clue: '¿Qué es "el cogüelmo" en las labores del campo de Guareña?',
    correct: 'El colmo rebosante que sobresale por encima del recipiente',
    wrongs: ['El fondo vacío del costal', 'La cuerda de atar las gavillas', 'La sombra corta del mediodía'],
  },
  {
    id: 'gh-besana',
    category: 'habla',
    emoji: '🚜',
    prompt: '«Salió con la yunta antes del alba a abrir la primera besana»',
    clue: 'En nuestra tierra labradora de Guareña, ¿qué es la "besana"?',
    correct: 'El primer surco recto y la labor de arado en la tierra',
    wrongs: ['La campana que toca a misa mayor', 'La merienda dulce de los domingos', 'La ventana pequeña del doblao'],
  },
  {
    id: 'gh-arrecio',
    category: 'habla',
    emoji: '🥶',
    prompt: '«¡Cierra el portón y arrímate a la camilla, que vengo arrecío!»',
    clue: '¿Qué significa venir "arrecío" en los inviernos de Guareña?',
    correct: 'Estar helado, entumecido de puro frío',
    wrongs: ['Venir muy enfadado con alguien', 'Traer los bolsillos llenos', 'Llegar muerto de risa'],
  },
  {
    id: 'gh-entrillar',
    category: 'habla',
    emoji: '🚪',
    prompt: '«¡Ten cuidao con la puerta no te vayas a entrillar los dedos!»',
    clue: '¿Qué es "entrillarse"?',
    correct: 'Pillarse un dedo con una puerta, ventana o cajón',
    wrongs: ['Mancharse la camisa de aceite', 'Perder las monedas por la calle', 'Desatarse los cordones'],
  },
  {
    id: 'gh-achiperres',
    category: 'habla',
    emoji: '🧰',
    prompt: '«Quita del corral todos esos achiperres viejos»',
    clue: '¿Qué son los "achiperres"?',
    correct: 'Trastos, cachivaches o herramientas menudas',
    wrongs: ['Dulces finos de boda', 'Racimos grandes de uvas', 'Claveles rojos de maceta'],
  },
  {
    id: 'gh-ajilar',
    category: 'habla',
    emoji: '🚶',
    prompt: '«¡Ajila pa la Calle Grande, que nos cierran la tienda!»',
    clue: '¿Qué nos dicen en Guareña con "¡ajila!"?',
    correct: 'Que espabilemos y caminemos deprisa',
    wrongs: ['Que hablemos más despacito', 'Que nos sentemos en el poyo', 'Que cerremos el paraguas'],
  },
  {
    id: 'gh-farraguas',
    category: 'habla',
    emoji: '👕',
    prompt: '«¡Niño, arréglate esa camisa, no vayas tan farraguas!»',
    clue: '¿Cómo va alguien cuando le dicen que va "farraguas"?',
    correct: 'Desaliñado, con la ropa descuidada o por fuera',
    wrongs: ['Demasiado elegante de domingo', 'Tapado con dos mantas', 'Calzado con botas nuevas'],
  },
  {
    id: 'gh-barruntar',
    category: 'habla',
    emoji: '🌩️',
    prompt: '«Por cómo vienen las nubes del Guadiana, barrunto que va a llover»',
    clue: '¿Qué es "barruntar"?',
    correct: 'Presentir o notar señales de lo que va a pasar',
    wrongs: ['Regar los geranios del patio', 'Olvidar lo que íbamos a decir', 'Barrer la acera temprano'],
  },
  {
    id: 'gh-escusao',
    category: 'habla',
    emoji: '👁️',
    prompt: '«¡No seas tan escusao asomándote al visillo!»',
    clue: '¿Qué significa ser "escusao" o "escusá"?',
    correct: 'Ser muy curioso, cotilla o querer enterarse de todo',
    wrongs: ['Ser muy callado y vergonzoso', 'Ser el primero en levantarse', 'Ser muy ahorrador'],
  },
  {
    id: 'gh-lambuzo',
    category: 'habla',
    emoji: '🍪',
    prompt: '«¡Qué lambuzo eres en cuanto hueles las galletas rizadas!»',
    clue: '¿A quién llamamos "lambuzo"?',
    correct: 'Al que es muy goloso o le gusta picotear lo dulce',
    wrongs: ['Al que come sin sal', 'Al que no prueba nunca el postre', 'Al que cocina a fuego lento'],
  },
  {
    id: 'gh-choncho',
    category: 'habla',
    emoji: '🍈',
    prompt: '«Ese melón ha salido un poco choncho»',
    clue: '¿Cómo está una fruta cuando decimos que está "choncha"?',
    correct: 'Sosa, verde o todavía sin madurar bien',
    wrongs: ['Dulce como la miel', 'Asada en las brasas', 'Pelada en trocitos'],
  },
  {
    id: 'gh-feje',
    category: 'habla',
    emoji: '🪵',
    prompt: '«Ató un buen feje de sarmientos secos para encender la candela»',
    clue: '¿Qué es un "feje"?',
    correct: 'Un haz o manojo grande atado de leña o ramas',
    wrongs: ['Un cántaro de boca ancha', 'Un banco largo de madera', 'Una cuchara de palo'],
  },
  {
    id: 'gh-pelona',
    category: 'habla',
    emoji: '❄️',
    prompt: '«¡Menuda pelona había esta mañana en los olivares de Guareña!»',
    clue: '¿Qué es caer una buena "pelona"?',
    correct: 'Una helada intensa que deja el campo blanco de escarcha',
    wrongs: ['Un viento caliente de agosto', 'Una fiesta en la plaza', 'Una cosecha abundante'],
  },
  {
    id: 'gh-esmorecio',
    category: 'habla',
    emoji: '😮‍💨',
    prompt: '«Después de varear todo el día llegué a casa esmorecío»',
    clue: '¿Qué es estar "esmorecío"?',
    correct: 'Rendido, agotado o casi sin fuerzas',
    wrongs: ['Con muchas ganas de juerga', 'Recién peinado de peluquería', 'Enfadado sin motivo'],
  },
  {
    id: 'gh-traspuesto',
    category: 'habla',
    emoji: '😴',
    prompt: '«Después del cocido me quedé traspuesto en la butaca»',
    clue: '¿Qué significa quedarse "traspuesto"?',
    correct: 'Quedarse dormido dando una cabezadita corta',
    wrongs: ['Salir corriendo sin avisar', 'Perderse por las callejuelas', 'Mudarse a otra calle'],
  },
  {
    id: 'gh-fresco',
    category: 'habla',
    emoji: '🪑',
    prompt: '«Cuando baje el sol sacamos las sillas a la puerta a tomar el fresco»',
    clue: '¿Qué entrañable costumbre veraniega de Guareña es esa?',
    correct: 'Sentarse en la acera con los vecinos a charlar con la brisa de la noche',
    wrongs: ['Ir a comprar abanicos a la feria', 'Cenar dentro de la despensa', 'Regar el tejado con manguera'],
  },
  {
    id: 'gh-chupa',
    category: 'habla',
    emoji: '🌧️',
    prompt: '«Viniendo de San Ginés nos pilló una chupa de agua tremenda»',
    clue: '¿Qué es caer una buena "chupa"?',
    correct: 'Un aguacero fuerte que te deja calado hasta los huesos',
    wrongs: ['Un rocío suave de primavera', 'Cuatro gotas sin importancia', 'Un día nublado sin lluvia'],
  },
  {
    id: 'gh-esconchao',
    category: 'habla',
    emoji: '🥣',
    prompt: '«Ese lebrillo viejo tiene el borde un poco esconchao»',
    clue: '¿Qué significa que esté "esconchao"?',
    correct: 'Que le ha saltado algún trocito de barro, loza o cal',
    wrongs: ['Que está lleno hasta arriba', 'Que reluce como un espejo', 'Que huele a jabón casero'],
  },
  {
    id: 'gh-resolana',
    category: 'habla',
    emoji: '☀️',
    prompt: '«Qué agustito se está en enero charlando a la resolana»',
    clue: '¿Dónde nos ponemos cuando buscamos "la resolana"?',
    correct: 'Al sol templado de invierno y resguardados del aire frío',
    wrongs: ['En la esquina más ventosa y fría', 'A oscuras con las persianas bajadas', 'Bajo el sol de agosto a las tres'],
  },
  {
    id: 'gh-repantigao',
    category: 'habla',
    emoji: '🛋️',
    prompt: '«Ahí está tan a gusto, bien repantigao en el sofá»',
    clue: '¿Qué es estar "repantigao"?',
    correct: 'Arrellanado, tumbado con toda la comodidad del mundo',
    wrongs: ['Sentado rígido en el borde', 'Subido a una escalera alta', 'Buscando algo debajo de la mesa'],
  },
  {
    id: 'gh-dornillo',
    category: 'habla',
    emoji: '🥗',
    prompt: '«En el dornillo de madera sabe el gazpacho machao el doble de rico»',
    clue: '¿Qué es el "dornillo"?',
    correct: 'Un cuenco ancho y redondo de madera donde se maja y sirve el gazpacho',
    wrongs: ['Una sartén de hierro con patas largas', 'Un jarro estrecho para el vino', 'Una cesta para coger espárragos'],
  },
  {
    id: 'gh-doblao',
    category: 'habla',
    emoji: '🏠',
    prompt: '«Sube las cajas y los trastos arriba al doblao»',
    clue: 'En las casas tradicionales de Guareña, ¿qué es "el doblao"?',
    correct: 'La planta alta o desván bajo el tejado donde se guardaban grano y enseres',
    wrongs: ['El zaguán de baldosas junto a la calle', 'El pozo hondo del patio', 'La cuadra del final del corral'],
  },
  {
    id: 'gh-alacena',
    category: 'habla',
    emoji: '🚪',
    prompt: '«En la alacena están las perrunillas y el bote del azúcar»',
    clue: '¿Qué es "la alacena"?',
    correct: 'El armario de obra empotrado en la pared con baldas y puertas de madera',
    wrongs: ['El poyete exterior de la fachada', 'La chimenea ancha de leña', 'El lavadero de piedra del patio'],
  },
  {
    id: 'gh-badila',
    category: 'habla',
    emoji: '🔥',
    prompt: '«Dale unas vueltas al brasero con la badila para echar una firma»',
    clue: '¿Qué es "la badila" y "echar una firma" en el brasero?',
    correct: 'La paleta metálica con la que se remueve la ceniza para avivar el calor',
    wrongs: ['El abanico de palma del verano', 'La tapadera de las ollas grandes', 'El pestillo de hierro del portón'],
  },
  {
    id: 'gh-picon',
    category: 'habla',
    emoji: '🪵',
    prompt: '«Con buen picón de encina aguanta caliente la camilla toda la tarde»',
    clue: '¿Qué es "el picón" o "cisco"?',
    correct: 'Carbón vegetal menudo de ramas de encina para el brasero tradicional',
    wrongs: ['Aserrín blanco de carpintería', 'Arena fina del río Guadámez', 'Paja trillada del granero'],
  },
  {
    id: 'gh-mijina',
    category: 'habla',
    emoji: '🤏',
    prompt: '«Ponme solo una mijina de sal y un chorrito de aceite»',
    clue: '¿Cuánto es "una mijina" o "una miaja"?',
    correct: 'Una pizca, una cantidad muy pequeñita',
    wrongs: ['Un kilo entero bien pesado', 'Un plato rebosante', 'Media arroba'],
  },
  {
    id: 'gh-chiquinino',
    category: 'habla',
    emoji: '🐣',
    prompt: '«¡Conocí a tu nieto cuando era así de chiquinino!»',
    clue: '¿Qué expresan nuestros diminutivos en "-ino / -ina" tan propios de Guareña y Extremadura?',
    correct: 'Pequeñez dicha siempre con mucho cariño y cercanía',
    wrongs: ['Desprecio o enfado grande', 'Que algo es muy antiguo', 'Que algo pesa demasiado'],
  },
  {
    id: 'gh-pitera',
    category: 'habla',
    emoji: '🤕',
    prompt: '«Saltando la tapia del huerto se cayó y se abrió una pitera»',
    clue: '¿Qué es una "pitera"?',
    correct: 'Una brecha o descalabradura en la cabeza',
    wrongs: ['Una puerta secreta en el muro', 'Una zanja para regar tomates', 'Una grieta en el botijo'],
  },
  {
    id: 'gh-churretes',
    category: 'habla',
    emoji: '🍫',
    prompt: '«Ven que te limpie la boca, que llevas unos churretes de chocolate»',
    clue: '¿Qué son los "churretes"?',
    correct: 'Manchas o lamparones de comida o tizne en la cara',
    wrongs: ['Botones dorados del abrigo', 'Lazos blancos en las trenzas', 'Zapatos de charol nuevos'],
  },
  {
    id: 'gh-enguachinar',
    category: 'habla',
    emoji: '💧',
    prompt: '«Con tanta lluvia seguida se han enguachinao los sembrados»',
    clue: '¿Qué quiere decir "enguachinarse"?',
    correct: 'Encharcarse de agua la tierra (o llenarse la tripa de beber tanta agua)',
    wrongs: ['Secarse el pozo en agosto', 'Granizar piedras gordas', 'Helarse las flores del almendro'],
  },
  {
    id: 'gh-fusca',
    category: 'habla',
    emoji: '🍂',
    prompt: '«Recoge con el recogedor toda esa fusca del patio»',
    clue: '¿Qué es "la fusca"?',
    correct: 'Hojarasca, ramitas secas o pelusilla barrida del suelo',
    wrongs: ['Ropa blanca tendida al sol', 'Harina recién cernida', 'Lana limpia de colchón'],
  },
  {
    id: 'gh-jato',
    category: 'habla',
    emoji: '🎒',
    prompt: '«Ya tengo listo el jato para ir mañana a la aceituna»',
    clue: '¿Qué llamamos en Guareña "el jato"?',
    correct: 'El hatillo con la fiambrera, el pan, el agua y la ropa de faena',
    wrongs: ['El tractor grande de la cooperativa', 'El olivo más viejo de la parcela', 'El camino real de tierra'],
  },
  {
    id: 'gh-esparramar',
    category: 'habla',
    emoji: '🌾',
    prompt: '«Ten cuidado con la cesta, no se esparramen las almendras»',
    clue: '¿Qué es "esparramar"?',
    correct: 'Esparcir o caer rodando las cosas por todo el suelo',
    wrongs: ['Tostar frutos secos en la sartén', 'Guardar en tarros de cristal', 'Contar de diez en diez'],
  },
  {
    id: 'gh-coscarse',
    category: 'habla',
    emoji: '👂',
    prompt: '«Estaba tan entretenido hablando que ni se coscó de la hora»',
    clue: '¿Qué significa "no coscarse"?',
    correct: 'No enterarse o no darse cuenta de algo',
    wrongs: ['No llevar reloj de pulsera', 'No querer volver a casa', 'No escuchar bien la radio'],
  },
  {
    id: 'gh-modorra',
    category: 'habla',
    emoji: '🌞',
    prompt: '«A las cuatro de la tarde en julio entra una modorra que no veas»',
    clue: '¿Qué es "la modorra"?',
    correct: 'Sopor y sueño pesado producido por el calor de la siesta',
    wrongs: ['Ganas de salir a correr al sol', 'Frío repentino en los pies', 'Sed de agua con limón'],
  },
  {
    id: 'gh-relente',
    category: 'habla',
    emoji: '🌙',
    prompt: '«Recoge la ropa tendida antes de que caiga el relente»',
    clue: '¿Qué es "el relente"?',
    correct: 'La humedad fría que cae al anochecer en los días rasos',
    wrongs: ['El polvo rojo de los caminos', 'El humo del horno de leña', 'El viento cálido de poniente'],
  },
  {
    id: 'gh-avios',
    category: 'habla',
    emoji: '🍲',
    prompt: '«Ya compré en la plaza todos los avíos del puchero»',
    clue: '¿Qué son "los avíos" de comer?',
    correct: 'Los ingredientes necesarios para aviar y cocinar un buen plato',
    wrongs: ['Los manteles blancos de fiesta', 'Las cucharas soperas de acero', 'Las recetas apuntadas en papel'],
  },
  {
    id: 'gh-emperifollao',
    category: 'habla',
    emoji: '✨',
    prompt: '«¡Qué emperifollaos van todos hoy para la Feria de Agosto!»',
    clue: '¿Qué quiere decir ir "emperifollao"?',
    correct: 'Ir muy arreglado, mudado y elegante de fiesta',
    wrongs: ['Ir con prisa mirando el reloj', 'Ir cargado con muchas bolsas', 'Ir despeinado por el aire'],
  },
  {
    id: 'gh-chambra',
    category: 'habla',
    emoji: '🧥',
    prompt: '«Antes las mujeres mayores llevaban siempre su chambra bien limpia»',
    clue: '¿Qué prenda tradicional era "la chambra"?',
    correct: 'Una blusa o chaquetilla cómoda de tela que se vestía a diario',
    wrongs: ['Un calzado de esparto trenzado', 'Un peine grande de carey', 'Un delantal de cuero grueso'],
  },
  {
    id: 'gh-chinelas',
    category: 'habla',
    emoji: '🥿',
    prompt: '«Quítate los zapatos de calle y ponte las chinelas»',
    clue: '¿Qué son "las chinelas"?',
    correct: 'Las zapatillas cómodas y ligeras de estar por casa',
    wrongs: ['Las botas altas de regar', 'Los guantes de lana gorda', 'Las gafas de leer de cerca'],
  },
  {
    id: 'gh-candil',
    category: 'habla',
    emoji: '🪔',
    prompt: '«Menos alumbra que un candil sin aceite»',
    clue: '¿Cómo daban luz los antiguos candiles en las casas de Guareña?',
    correct: 'Quemando aceite con una mecha o torcida de algodón',
    wrongs: ['Con una vela gruesa de cera roja', 'Con brasas de sarmiento dentro', 'Con espejos puestos al sol'],
  },
  {
    id: 'gh-trocha',
    category: 'habla',
    emoji: '🥾',
    prompt: '«Vámonos por la trocha y llegamos antes al pantano de San Roque»',
    clue: '¿Qué es ir "por una trocha"?',
    correct: 'Tomar una vereda estrecha o atajo a través del campo',
    wrongs: ['Ir dando un rodeo muy largo', 'Cruzar por medio de la plaza', 'Subirse al remolque grande'],
  },
  {
    id: 'gh-rebana',
    category: 'habla',
    emoji: '🥖',
    prompt: '«Nos daban para merendar en la calle una buena rebaná con aceite y azúcar»',
    clue: '¿Qué era aquella "rebaná" de nuestra niñez en Guareña?',
    correct: 'Una tajada hermosa de pan de pueblo regada con aceite de oliva',
    wrongs: ['Una tarta comprada de pastelería', 'Un cucurucho de barquillo', 'Un vaso de leche merengada'],
  },
  {
    id: 'gh-roando',
    category: 'habla',
    emoji: '🔄',
    prompt: '«Bajó el chiquillo roando por la ladera sin hacerse ni un rasguño»',
    clue: 'En la pronunciación popular extremeña, ¿qué es caer "roando"?',
    correct: 'Rodando, dando vueltas',
    wrongs: ['Saltando a la pata coja', 'Cantando una copla', 'Andando de espaldas'],
  },
  {
    id: 'gh-acho-chacho',
    category: 'habla',
    emoji: '👋',
    prompt: '«¡Acho, espérate que voy contigo pa la plaza!»',
    clue: '¿De dónde nace esta exclamación tan nuestra en toda Extremadura?',
    correct: 'De acortar con confianza y cariño la palabra "muchacho"',
    wrongs: ['Del sonido del hacha en el monte', 'De un apellido antiguo italiano', 'De arriar las mulas en la era'],
  },
  {
    id: 'gh-calor-la',
    category: 'habla',
    emoji: '🌡️',
    prompt: '«¡Madre mía, qué calor más grande hace hoy: no se aguanta la calor!»',
    clue: 'Cuando decimos en el pueblo "la calor", ¿a qué momento típico nos referimos?',
    correct: 'Al bochorno intenso del verano en nuestras vegas',
    wrongs: ['A las mañanas frescas de abril', 'A las lloviznas de noviembre', 'Al viento helado del norte'],
  },
]

// ============================================================================
// RONDA 4: CALLES, FIESTAS, HISTORIA Y GENTE DE GUAREÑA (54 preguntas)
// ============================================================================
const TRADICIONES_ITEMS: GuarenaQuestion[] = [
  {
    id: 'gt-cristo-aguas',
    category: 'tradiciones',
    emoji: '🙏',
    prompt: '¿Quién es el venerado Patrono de Guareña cuya festividad mayor celebramos el 14 de septiembre?',
    clue: 'Históricamente los labradores le sacaban también en rogativa para pedir lluvias',
    correct: 'El Santísimo Cristo de las Aguas',
    wrongs: ['San Pedro de Alcántara', 'El Cristo de la Salud', 'San Sebastián Mártir', 'El Señor de la Columna'],
  },
  {
    id: 'gt-el-santo',
    category: 'tradiciones',
    emoji: '⛪',
    prompt: '¿Cómo llamamos popularmente todos en Guareña a la plaza y entorno de la Iglesia de San Gregorio?',
    clue: 'Un rincón muy querido con su atrio porticado sobre columnas y capiteles visigóticos',
    correct: '«El Santo»',
    wrongs: ['«El Castillo»', '«La Corredera»', '«El Mirador»', '«La Lonja»'],
  },
  {
    id: 'gt-parque-grande',
    category: 'tradiciones',
    emoji: '🌳',
    prompt: '¿Con qué nombre cariñoso conocemos en Guareña al Parque Municipal San Ginés, creado en los años 30?',
    clue: 'El gran pulmón verde de paseos, sombras, juegos y casetas de nuestro pueblo',
    correct: '«El Parque Grande»',
    wrongs: ['«La Alameda Chica»', '«El Jardín Real»', '«El Bosque Nuevo»', '«El Prado Alto»'],
  },
  {
    id: 'gt-romeria-san-isidro',
    category: 'tradiciones',
    emoji: '🌾',
    prompt: 'Cada mes de mayo, ¿en qué paraje con ermita junto al agua celebramos en Guareña la Romería de San Isidro?',
    clue: 'Jornada grande de carrozas, calderetas, convivencia y campo entre vecinos y amigos',
    correct: 'Junto al Pantano de San Roque',
    wrongs: ['En la Cumbre de Gredos', 'En las Lagunas de Ruidera', 'En el Embarcadero del Mar', 'En la Dehesa del Norte'],
  },
  {
    id: 'gt-ferias-agosto',
    category: 'tradiciones',
    emoji: '🎡',
    prompt: '¿En qué mes del verano vive Guareña sus grandes Ferias y Fiestas llenas de reencuentros de quienes vuelven al pueblo?',
    clue: 'Días de atracciones, verbenas, conciertos, dianas floreadas y ambiente en el recinto y el parque',
    correct: 'En el mes de Agosto',
    wrongs: ['En pleno Enero', 'A mitad de Noviembre', 'A finales de Febrero', 'En Semana Santa'],
  },
  {
    id: 'gt-calle-grande',
    category: 'tradiciones',
    emoji: '🛍️',
    prompt: '¿Cómo se llama la calle más emblemática, comercial y transitada de toda la vida en el centro de Guareña?',
    clue: 'Eje histórico de tiendas, paseos y encuentros que desemboca hacia la Plaza de España',
    correct: 'La Calle Grande',
    wrongs: ['La Calle Estrecha del Río', 'La Gran Vía del Mar', 'El Paseo de Recoletos', 'La Calle de los Plateros'],
  },
  {
    id: 'gt-cuatro-esquinas',
    category: 'tradiciones',
    emoji: '🧭',
    prompt: '¿Qué famoso cruce y calle del casco tradicional de Guareña toma su nombre de la confluencia de sus vías?',
    clue: 'Uno de los puntos de referencia más castizos para orientarse y quedar en el pueblo',
    correct: 'Las Cuatro Esquinas',
    wrongs: ['Los Siete Caños', 'Las Tres Cruces Altas', 'Los Cinco Puentes', 'Las Dos Torres'],
  },
  {
    id: 'gt-luis-chamizo-nac',
    category: 'tradiciones',
    emoji: '✍️',
    prompt: '¿En qué año nació en nuestra villa de Guareña el gran poeta Luis Chamizo Trigueros?',
    clue: 'En noviembre de aquel año vio la luz el futuro autor de *El Miajón de los Castúos*',
    correct: 'En 1894',
    wrongs: ['En 1605', 'En 1789', 'En 1968', 'En 1520'],
  },
  {
    id: 'gt-joaquin-chamizo',
    category: 'tradiciones',
    emoji: '🏺',
    prompt: '¿Qué oficio tradicional ejercía en Guareña don Joaquín Chamizo, padre de nuestro poeta Luis Chamizo?',
    clue: 'Por eso a Chamizo le llamaban con admiración «el feliz tinajero de Guareña»',
    correct: 'Alfarero y fabricante de tinajas',
    wrongs: ['Capitán de barco mercante', 'Relojero de catedrales', 'Soplador de vidrio fino', 'Tejedor de tapices'],
  },
  {
    id: 'gt-eugenio-frutos',
    category: 'tradiciones',
    emoji: '📚',
    prompt: '¿Qué ilustre filósofo, catedrático y poeta nacido en Guareña da nombre hoy a nuestra Biblioteca Pública Municipal?',
    clue: 'Íntimo amigo de juventud de Luis Chamizo, nació en Guareña en 1903',
    correct: 'Don Eugenio Frutos Cortés',
    wrongs: ['Don Benito Arias Montano', 'Don Juan Donoso Cortés', 'Don Francisco de Zurbarán', 'Don Pedro de Valdivia'],
  },
  {
    id: 'gt-escultura-nacencia',
    category: 'tradiciones',
    emoji: '🗿',
    prompt: '¿A qué dos grandes amigos guareñenses reúne el conjunto escultórico «Yo vi escribir La Nacencia»?',
    clue: 'Rinde homenaje al momento literario compartido entre ambos jóvenes del pueblo',
    correct: 'A Luis Chamizo y Eugenio Frutos',
    wrongs: ['A Cervantes y Quevedo', 'A Velázquez y Murillo', 'A Pizarro y Orellana', 'A Lope y Calderón'],
  },
  {
    id: 'gt-diego-lopez-cabrera',
    category: 'tradiciones',
    emoji: '🪵',
    prompt: '¿Quién realizó el magnífico retablo mayor actual de madera tallada de la Iglesia de Santa María de Guareña?',
    clue: 'Una obra admirable salida de las manos de un gran artesano tallista hijo de nuestro pueblo',
    correct: 'El artesano local Diego López Cabrera',
    wrongs: ['Alonso Cano en Granada', 'Juan de Juni en Valladolid', 'El Greco en Toledo', 'Gaudí en Barcelona'],
  },
  {
    id: 'gt-santa-maria-bic',
    category: 'tradiciones',
    emoji: '🏛️',
    prompt: 'Por su colosal nave única, sus bóvedas estrelladas y su nobleza de piedra, ¿cómo llaman muchos a Santa María de Guareña?',
    clue: 'Declarada Bien de Interés Cultural y Monumento Histórico-Artístico',
    correct: '«La Catedral de las Vegas Altas»',
    wrongs: ['«La Mezquita del Sur»', '«La Basílica de la Sierra»', '«La Ermita Chica»', '«La Colegiata del Mar»'],
  },
  {
    id: 'gt-viernes-santo-cristo',
    category: 'tradiciones',
    emoji: '🕯️',
    prompt: 'En la Semana Santa de Guareña, además de su fiesta de septiembre, ¿qué noche procesiona con gran fervor el Cristo de las Aguas?',
    clue: 'Uno de los momentos más emocionantes y multitudinarios para todos los guareñenses',
    correct: 'La noche del Viernes Santo',
    wrongs: ['El Lunes de Carnaval', 'La mañana de Reyes', 'La víspera de San Juan', 'El día de Todos los Santos'],
  },
  {
    id: 'gt-poema-semana-santa',
    category: 'tradiciones',
    emoji: '📜',
    prompt: '¿Qué poema dedicó expresamente Luis Chamizo a las procesiones, saetas y fe de su propio pueblo natal?',
    clue: 'Lleva el nombre mismo de nuestra localidad en sus versos llenos de sentimiento',
    correct: '«Semana Santa en Guareña»',
    wrongs: ['«Romancero del Duero»', '«Primavera en Sevilla»', '«Noche de Difuntos»', '«Campanas de Bastabales»'],
  },
  {
    id: 'gt-coral-bel-canto',
    category: 'tradiciones',
    emoji: '🎶',
    prompt: '¿Cómo se llama la querida agrupación coral de Guareña que suele solemnizar las misas del Cristo de las Aguas y conciertos locales?',
    clue: 'Orgullo musical de voces guareñenses desde hace décadas',
    correct: 'La Coral Bel Canto de Guareña',
    wrongs: ['El Orfeón Marino', 'La Escolanía del Valle', 'Los Cantores del Alba', 'La Tuna Universitaria'],
  },
  {
    id: 'gt-convento-dominicas',
    category: 'tradiciones',
    emoji: '⛪',
    prompt: 'En la zona histórica de la Plaza Vieja de Guareña se conserva la portada granítica con escudo episcopal del antiguo…',
    clue: 'Fundación conventual femenina histórica muy ligada a la memoria antigua de la villa',
    correct: 'Convento de Monjas Dominicas',
    wrongs: ['Hospital de Peregrinos del Norte', 'Palacio del Almirante', 'Cuartel de Caballería Real', 'Fuerte Artillero'],
  },
  {
    id: 'gt-casa-cultura',
    category: 'tradiciones',
    emoji: '🏛️',
    prompt: '¿Qué edificio cultural de Guareña ocupa una hermosa casona señorial rehabilitada fechada en 1867?',
    clue: 'Punto vivo de exposiciones, teatro, biblioteca, charlas y vida asociativa del pueblo',
    correct: 'La Casa de la Cultura',
    wrongs: ['El Faro Municipal', 'La Lonja del Pescado', 'El Observatorio Astronómico', 'El Balneario Termal'],
  },
  {
    id: 'gt-san-gregorio-labradores',
    category: 'tradiciones',
    emoji: '🌱',
    prompt: 'Antes de extenderse San Isidro, ¿de qué gremio fundamental de Guareña era antiguo protector San Gregorio de Ostia?',
    clue: 'Se le rezaba para librar las cosechas de plagas de langosta y malas tormentas',
    correct: 'De los labradores y gentes del campo',
    wrongs: ['De los navegantes de alta mar', 'De los mineros del carbón', 'De los relojeros suizos', 'De los vidrieros reales'],
  },
  {
    id: 'gt-monumento-duran',
    category: 'tradiciones',
    emoji: '🩺',
    prompt: 'En la Plaza de San Gregorio («El Santo») de Guareña hay un recordado monumento dedicado a…',
    clue: 'Homenaje del pueblo agradecido situado frente al atrio porticado',
    correct: 'Don Juan Durán Palomares',
    wrongs: ['Cristóbal Colón', 'Hernán Cortés', 'Vasco Núñez de Balboa', 'El Cid Campeador'],
  },
  {
    id: 'gt-las-brujas-chamizo',
    category: 'tradiciones',
    emoji: '🎭',
    prompt: 'Además de *El Miajón de los Castúos*, ¿qué famosa obra de teatro en verso de ambiente extremeño escribió Luis Chamizo?',
    clue: 'Estrenada con enorme éxito en 1930 y representada muchas veces con cariño en Guareña',
    correct: 'Las Brujas',
    wrongs: ['La Casa de Bernarda Alba', 'Don Juan Tenorio', 'La Vida es Sueño', 'El Alcalde de Zalamea'],
  },
  {
    id: 'gt-asociacion-nacencia',
    category: 'tradiciones',
    emoji: '👩‍🍳',
    prompt: '¿Cómo se llama la activa Asociación de Mujeres de Guareña que mantiene vivas tantas tradiciones y creó el dulce «Los Tartesitos»?',
    clue: 'Lleva por nombre el título del poema más famoso de Luis Chamizo',
    correct: 'Asociación de Mujeres «La Nacencia»',
    wrongs: ['Asociación «Las Sirenas»', 'Círculo «Las Cumbres»', 'Hermandad «Mar del Norte»', 'Peña «Los Almendros»'],
  },
  {
    id: 'gt-turunuelo-escalinata',
    category: 'tradiciones',
    emoji: '🪜',
    prompt: 'En el yacimiento de Casas del Turuñuelo en Guareña sorprendió al mundo entero encontrar intacta una monumental…',
    clue: 'De casi tres metros de altura conectando las dos plantas del edificio tartésico',
    correct: 'Escalinata tartésica de más de 2.500 años',
    wrongs: ['Noria de hierro forjado', 'Cúpula de cristal de colores', 'Torre Eiffel en miniatura', 'Fuente de mármol blanco'],
  },
  {
    id: 'gt-turunuelo-caballos',
    category: 'tradiciones',
    emoji: '🐎',
    prompt: 'En el patio ritual de Casas del Turuñuelo (Guareña) los arqueólogos hallaron una impresionante ofrenda con decenas de…',
    clue: 'Depositados cuidadosamente en pareja antes de sellar y cubrir bajo tierra el edificio',
    correct: 'Caballos de época tartésica',
    wrongs: ['Camellos del desierto', 'Elefantes africanos', 'Barcas vikingas de madera', 'Carruajes de vapor'],
  },
  {
    id: 'gt-estacion-tren',
    category: 'tradiciones',
    emoji: '🚂',
    prompt: 'Desde el siglo XIX, ¿qué infraestructura de transporte impulsó el comercio de vinos, aceites y cereales en Guareña?',
    clue: 'Por su estación en la línea Ciudad Real-Badajoz salían vagones con los frutos del pueblo',
    correct: 'La Estación de Ferrocarril de Guareña',
    wrongs: ['Un puerto marítimo de carga', 'Un teleférico de montaña', 'Un canal de esclusas navegables', 'Un aeródromo internacional'],
  },
  {
    id: 'gt-el-pilar-zona',
    category: 'tradiciones',
    emoji: '⛲',
    prompt: '¿Qué tradicional zona y vía de Guareña recuerda con su nombre uno de los antiguos abrevaderos y fuentes del pueblo?',
    clue: 'Donde antiguamente bebían las caballerías al volver de las faenas del campo',
    correct: 'El Pilar',
    wrongs: ['El Embarcadero', 'La Cascada Alta', 'El Acueducto Chico', 'Los Baños del Rey'],
  },
  {
    id: 'gt-calle-fuentes-carrera',
    category: 'tradiciones',
    emoji: '🏘️',
    prompt: 'Junto a la Calle Grande y Don Diego López, ¿qué otras calles con sabor de toda la vida forman el callejero tradicional de Guareña?',
    clue: 'Nombres castizos por los que han paseado todas las generaciones guareñenses',
    correct: 'Calles Derecha, Fuentes, Carrera y San Ginés',
    wrongs: ['Calles Sierpes, Tetuán y Betis', 'Calles Alcalá, Preciados y Mayor', 'Calles Larios, Granada y Mar', 'Calles Laurel y Portales'],
  },
  {
    id: 'gt-borriquita',
    category: 'tradiciones',
    emoji: '🌿',
    prompt: '¿Con qué alegre procesión de palmas y ramos de olivo arranca el Domingo de Ramos la Semana Santa en Guareña?',
    clue: 'Muy querida especialmente por todos los niños y familias del pueblo',
    correct: 'La Entrada en Jerusalén («La Borriquita»)',
    wrongs: ['El Santo Entierro Nocturno', 'La Procesión del Silencio', 'Las Siete Palabras', 'La Soledad de María'],
  },
  {
    id: 'gt-silencio-guarena',
    category: 'tradiciones',
    emoji: '🕯️',
    prompt: 'En la noche sobrecogedora de la Semana Santa guareñense, con las luces apagadas y profundo recogimiento, sale la Cofradía del…',
    clue: 'Solo se oye el arrastrar de pies, tambores sordos y el respeto de todo el pueblo',
    correct: 'Santísimo Cristo del Silencio',
    wrongs: ['Cristo de las Campanas', 'Señor de la Alegría', 'Cristo de los Navegantes', 'Nazareno del Alba'],
  },
  {
    id: 'gt-cooperativa-campo',
    category: 'tradiciones',
    emoji: '🫒',
    prompt: 'En la economía y vida cotidiana de las familias de Guareña, ¿qué tres cultivos tradicionales han sido siempre el alma del término?',
    clue: 'La trilogía mediterránea que rodea el pueblo por los cuatro costados',
    correct: 'El olivo, la vid y el cereal (y regadíos de vega)',
    wrongs: ['El plátano, el café y la caña de azúcar', 'El té, el cacao y el coco', 'El manzano sidrero y el lúpulo', 'El tulipán y el azafrán alpino'],
  },
  {
    id: 'gt-poligono-alberca',
    category: 'tradiciones',
    emoji: '🏭',
    prompt: '¿Con qué nombre tradicional relacionado con el agua conocemos la zona empresarial e industrial de Guareña?',
    clue: 'Espacio donde trabajan muchos talleres, industrias y servicios locales',
    correct: 'La Alberca',
    wrongs: ['El Astillero', 'La Dársena', 'Los Altos Hornos', 'La Atarazana'],
  },
  {
    id: 'gt-rio-guadamez',
    category: 'tradiciones',
    emoji: '🏞️',
    prompt: '¿Qué ríos y riberas riegan las tierras del término municipal de Guareña rumbo al Guadiana?',
    clue: 'Cursos de agua ligados desde antiguo a pastos, huertas, charcas y al propio yacimiento tartésico',
    correct: 'El río Guadámez, el Búrdalo y el río Guareña (Cristina)',
    wrongs: ['El Ebro, el Jalón y el Segre', 'El Miño y el Sil', 'El Nervión y el Bidasoa', 'El Turia y el Júcar'],
  },
  {
    id: 'gt-quinto-coto',
    category: 'tradiciones',
    emoji: '🌿',
    prompt: '¿Cómo se ha llamado tradicionalmente a la gran finca y dehesa histórica ligada a la memoria campesina y agraria de Guareña?',
    clue: 'Nombre muy presente en la historia del campo guareñense del siglo XX',
    correct: 'Quinto Coto',
    wrongs: ['Monte Perdido', 'Coto de Doñana', 'Vega Sicilia', 'Dehesa del Moncayo'],
  },
  {
    id: 'gt-verdeo-vendimia',
    category: 'tradiciones',
    emoji: '🍇',
    prompt: 'Al terminar las Ferias de Agosto y llegar septiembre a Guareña, ¿qué gran faena agrícola llena de remolques los caminos y bodegas?',
    clue: 'Cortando racimos desde bien temprano antes de que apriete el sol',
    correct: 'La Vendimia',
    wrongs: ['La Esquila de primavera', 'La Siembra de castañas', 'La Recogida de la nieve', 'El Corte del helecho'],
  },
  {
    id: 'gt-matanza-invierno',
    category: 'tradiciones',
    emoji: '🐖',
    prompt: 'Antiguamente en los meses fríos de diciembre y enero, las familias y vecinos de Guareña se juntaban en los corrales para hacer…',
    clue: 'Un día entero de trabajo y fiesta haciendo chorizos, morcillas, pringue y bollas de chicharrones',
    correct: 'La Matanza Tradicional Casera',
    wrongs: ['La Trilla con trillo de pedernal', 'La Siega a hoz del trigo', 'El Verdeo de septiembre', 'La Feria de Mayo'],
  },
  {
    id: 'gt-candelas-luminarias',
    category: 'tradiciones',
    emoji: '🔥',
    prompt: 'En las fiestas tradicionales de invierno en Guareña, el humo aromático de tomillo, sarmientos y ramón de olivo anunciaba…',
    clue: 'Cuando vecinos y chiquillos se reunían alrededor del fuego al anochecer',
    correct: 'Las Candelas / Luminarias en las calles',
    wrongs: ['La Fiesta de la Espuma', 'El Concurso de Castillos de Arena', 'La Regata de Verano', 'El Baile de Agosto'],
  },
  {
    id: 'gt-mercadillo',
    category: 'tradiciones',
    emoji: '🧺',
    prompt: 'Ir a dar una vuelta por los puestos del mercadillo en Guareña ha sido siempre excusa perfecta para comprar fruta, telas y…',
    clue: 'Lo mejor de salir a hacer los mandados por la mañana en nuestro pueblo',
    correct: 'Saludar y charlar un rato con vecinos y conocidos',
    wrongs: ['Ver llegar los barcos pesqueros', 'Subir en tranvía eléctrico', 'Esquiar por la ladera', 'Cruzar la frontera en aduana'],
  },
  {
    id: 'gt-mercado-tartesico',
    category: 'tradiciones',
    emoji: '🏺',
    prompt: 'A raíz de la fama de Casas del Turuñuelo, Guareña celebra jornadas culturales y ambientación histórica dedicadas a…',
    clue: 'Con talleres, artesanía, visitas y orgullo por nuestras raíces de hace 2.500 años',
    correct: 'El Mundo Tartésico de Guareña',
    wrongs: ['Los Vikingos del Norte', 'Los Faraones del Nilo', 'Los Samuráis del Japón', 'Los Piratas del Caribe'],
  },
  {
    id: 'gt-trilla-eras',
    category: 'tradiciones',
    emoji: '🌾',
    prompt: 'En los veranos antiguos de Guareña, antes de las cosechadoras, ¿dónde se separaba el grano de la paja dando vueltas con el trillo?',
    clue: 'Explanadas empedradas o de tierra apisonada a las afueras del casco urbano',
    correct: 'En las Eras del pueblo',
    wrongs: ['Dentro de las bodegas hondas', 'En el campanario de la iglesia', 'En las charcas de pesca', 'Bajo los soportales de la plaza'],
  },
  {
    id: 'gt-encalar-fachadas',
    category: 'tradiciones',
    emoji: '🪣',
    prompt: 'Cuando se acercaban la Semana Santa o las fiestas en Guareña, las mujeres dejaban las fachadas y patios relucientes con cubo y brocha…',
    clue: 'Daba a las calles ese blanco purísimo y olor a limpio tan extremeño',
    correct: 'Encalando / Blanqueando con cal viva',
    wrongs: ['Forrando los muros de madera', 'Pintando de negro las paredes', 'Cubriendo con tejas las puertas', 'Poniendo papel pintado fuera'],
  },
  {
    id: 'gt-cantaros-agua',
    category: 'tradiciones',
    emoji: '🏺',
    prompt: 'Antes de que hubiera agua corriente en los grifos de todas las casas de Guareña, ¿cómo se traía el agua fresca desde las fuentes y pozos?',
    clue: 'Apoyados en la cadera o en aguaderas sobre el borriquillo',
    correct: 'En cántaros de barro',
    wrongs: ['En sacos de arpillera', 'En cestas de mimbre calado', 'En cajas de cartón', 'En odres de papel'],
  },
  {
    id: 'gt-mesa-camilla',
    category: 'tradiciones',
    emoji: '🪑',
    prompt: 'En las tardes de invierno de Guareña, toda la familia se sentaba alrededor de una mesa redonda con faldas gruesas llamada…',
    clue: 'Con la tarima de madera abajo y el brasero calentando las piernas mientras se charlaba o cosía',
    correct: 'La Mesa Camilla',
    wrongs: ['El Velador de Mármol Frío', 'El Pupitre de Escuela', 'El Banco de Piedra del Parque', 'El Mostrador de Estaño'],
  },
  {
    id: 'gt-canto-auroros-villancicos',
    category: 'tradiciones',
    emoji: '🎄',
    prompt: 'En Navidad en Guareña, ¿con qué instrumentos caseros de toda la vida hemos acompañado los villancicos junto a la lumbre?',
    clue: 'Rascando con una cuchara el relieve del cristal mientras sonaba la pandereta',
    correct: 'La botella de anís, la zambomba y el almirez',
    wrongs: ['El arpa clásica de concierto', 'La gaita escocesa de guerra', 'El órgano de tubos catedralicio', 'El violonchelo barroco'],
  },
  {
    id: 'gt-quintos',
    category: 'tradiciones',
    emoji: '🎖️',
    prompt: 'Antiguamente en Guareña, los mozos nacidos en el mismo año que entraban en sorteo para ir al servicio militar celebraban la fiesta de…',
    clue: 'Recorrían las calles del pueblo cantando juntos y guardando amistad para toda la vida',
    correct: 'Los Quintos',
    wrongs: ['Los Alféreces', 'Los Maestrantes', 'Los Regidores', 'Los Navegantes'],
  },
  {
    id: 'gt-cine-verano',
    category: 'tradiciones',
    emoji: '🎬',
    prompt: 'En las noches cálidas de verano en Guareña, ¡qué ilusión hacía ir con bocadillo o pipas a ver películas bajo las estrellas en el…!',
    clue: 'Sillas al fresco, pantalla blanca grande y murmullo vecinal antes de apagarse las luces',
    correct: 'Cine de Verano',
    wrongs: ['Teatro de Hielo', 'Autocine Flotante', 'Planetario Subterráneo', 'Circo de Invierno'],
  },
  {
    id: 'gt-campanas-santa-maria',
    category: 'tradiciones',
    emoji: '🔔',
    prompt: 'Desde cualquier calle o huerta de Guareña se sabía si había misa mayor, fiesta grande, fuego o difunto gracias al toque de…',
    clue: 'El lenguaje sonoro del pueblo desde lo alto de la torre renacentista',
    correct: 'Las Campanas de Santa María',
    wrongs: ['Las Sirenas del Puerto', 'Los Clarines del Castillo', 'El Gong del Ayuntamiento', 'Los Tambores del Río'],
  },
  {
    id: 'gt-chozos-piedra',
    category: 'tradiciones',
    emoji: '🛖',
    prompt: 'Por los campos del término de Guareña aún se ven antiguas construcciones redondas con techo cónico donde se resguardaban pastores y labradores:',
    clue: 'Levantados con sabiduría popular en piedra seca o ramaje',
    correct: 'Los Chozos de campo',
    wrongs: ['Los Hórreos con pilares', 'Las Barracas de caña', 'Los Pazos señoriales', 'Los Iglús'],
  },
  {
    id: 'gt-nido-ciguenas',
    category: 'tradiciones',
    emoji: '🦩',
    prompt: 'Como dice el refrán «Por San Blas la cigüeña verás», en Guareña nos alegra oír su crotoreo en lo alto de Santa María y sobre…',
    clue: 'Tiene su gran nido justo encima de la esfera del reloj municipal',
    correct: 'La espadaña del reloj del Ayuntamiento',
    wrongs: ['El surtidor bajo de la fuente', 'La puerta del mercado', 'Los bancos de hierro del paseo', 'El puente del arroyo'],
  },
  {
    id: 'gt-feria-mayo',
    category: 'tradiciones',
    emoji: '🐎',
    prompt: 'Históricamente en mayo, junto a las fiestas agrarias de San Isidro, Guareña vivía con gran animación el trato y ambiente de…',
    clue: 'Tradición ganadera y agrícola muy arraigada en nuestra comarca de las Vegas Altas',
    correct: 'La Feria de Mayo',
    wrongs: ['La Fiesta de la Vendimia de Octubre', 'El Carnaval de Invierno', 'La Feria del Marisco', 'Las Hogueras de Diciembre'],
  },
  {
    id: 'gt-jabon-casero',
    category: 'tradiciones',
    emoji: '🧼',
    prompt: 'En los patios de Guareña no se tiraba ni una gota de aceite usado: se guardaba para cocerlo en caldera dando vueltas siempre al mismo lado y hacer…',
    clue: 'Dejaba la ropa blanquísima tendida al sol y quitaba cualquier mancha difícil',
    correct: 'Jabón casero en tacos blancos',
    wrongs: ['Velas perfumadas de colores', 'Pintura azul para las puertas', 'Cera líquida para muebles', 'Pegamento de carpintero'],
  },
  {
    id: 'gt-hornos-semana-santa',
    category: 'tradiciones',
    emoji: '🔥',
    prompt: 'Cuando llegaba la Semana Santa en Guareña, las mujeres preparaban latas llenas de masa en casa y salían por las calles camino de…',
    clue: 'Inundando todo el barrio de un aroma irresistible a canela, limón, vainilla y manteca cocida',
    correct: 'Las panaderías y hornos del pueblo para cocer los dulces',
    wrongs: ['El río para enfriar las bandejas', 'La estación para mandarlas fuera', 'La plaza para vender la harina', 'El molino de aceite'],
  },
  {
    id: 'gt-gentilicio',
    category: 'tradiciones',
    emoji: '💚',
    prompt: '¿Cómo se nos llama con orgullo a los nacidos y vecinos de nuestra villa de Guareña?',
    clue: 'Nuestro gentilicio de toda la vida en la provincia de Badajoz',
    correct: 'Guareñenses (o Guareñeños)',
    wrongs: ['Placentinenses', 'Mirobrigenses', 'Pacenses de la Sierra', 'Jerezanos'],
  },
  {
    id: 'gt-bodegas-pitarra',
    category: 'tradiciones',
    emoji: '🍷',
    prompt: 'En el otoño de Guareña, hacia San Andrés o la Inmaculada, llegaba el momento esperado de espichar la tinaja en casa para…',
    clue: 'Reuniendo a la familia y amigos con unas aceitunas y chorizo asado',
    correct: 'Probar el vino nuevo de pitarra del año',
    wrongs: ['Destilar ron de caña', 'Prensar sidra de manzana', 'Hacer cerveza tostada', 'Guardar hielo para julio'],
  },
  {
    id: 'gt-semana-chamicena',
    category: 'tradiciones',
    emoji: '🎭',
    prompt: 'Para mantener siempre viva la obra de Luis Chamizo, Guareña dedica recitales, certámenes poéticos y homenajes a…',
    clue: 'Recordando en escuelas, teatro y plazas los poemas que pusieron el nombre de Guareña en toda España',
    correct: 'La poesía en castúo y la memoria de Luis Chamizo',
    wrongs: ['La novela policiaca inglesa', 'Las sagas nórdicas antiguas', 'El teatro japonés', 'La lírica provenzal'],
  },
]

// ============================================================================
// RONDA 5: RECETAS TÍPICAS, DULCES Y MEDIDAS DE GUAREÑA (54 preguntas)
// ============================================================================
const RECETAS_ITEMS: GuarenaQuestion[] = [
  {
    id: 'gr-tartesitos',
    category: 'recetas',
    emoji: '🍪',
    prompt: '¿Cómo se llama el dulce insignia creado por la Asociación de Mujeres «La Nacencia» de Guareña en honor a El Turuñuelo?',
    clue: 'Tiene forma de altar en piel de toro, lleva canela por encima y su masa «duerme» de un día para otro',
    correct: 'Los Tartesitos de Guareña',
    wrongs: ['Los Piononos de Santa Fe', 'Los Miguelitos de La Roda', 'Los Fartons Glaseados', 'Las Yemas de San Leandro'],
  },
  {
    id: 'gr-pringue',
    category: 'recetas',
    emoji: '🥖',
    prompt: 'En las matanzas tradicionales de Guareña, ¿cómo llamamos a esa deliciosa mezcla de hígado, carnes, ajos, manteca y especias para untar en pan?',
    clue: 'Un desayuno de campeones en las mañanas frías de invierno con el café caliente',
    correct: 'La Pringue de matanza',
    wrongs: ['El Paté de Salmón', 'La Sobrasada Mallorquina', 'La Mantequilla Dulce', 'El Queso Fresco Batido'],
  },
  {
    id: 'gr-bollas-chicharrones',
    category: 'recetas',
    emoji: '🥮',
    prompt: '¿Qué tortas o bollas doradas tan típicas de Guareña se amasan aprovechando los chicharrones crujientes de fundir la manteca?',
    clue: 'Con azúcar por encima y toque de anís o aguardiente, duran tiernas muchos días',
    correct: 'Las Bollas de Chicharrones',
    wrongs: ['Las Ensaimadas de Cabello', 'Los Croissants Franceses', 'Los Panecillos de Viena', 'Las Rosquillas Tontas'],
  },
  {
    id: 'gr-galletas-rizadas',
    category: 'recetas',
    emoji: '🌼',
    prompt: 'En la repostería tradicional de Semana Santa en Guareña, ¿qué galletas hechas con máquina o boquilla llenan las calles de olor a vainilla?',
    clue: 'Crujientes, doraditas y presentes en todas las latas familiares guareñenses',
    correct: 'Las Galletas Rizadas',
    wrongs: ['Las Galletas Saladas de Barco', 'Los Barquillos Rellenos de Nata', 'Las Obleas de Colores', 'Los Polvorones de Almendra'],
  },
  {
    id: 'gr-roscas-esquilaora',
    category: 'recetas',
    emoji: '🥨',
    prompt: 'En los cuadernos antiguos de repostería de las abuelas de Guareña figura con nombre muy nuestro una receta llamada…',
    clue: 'Junto a las perrunillas y empanadillas, joya del recetario casero recopilado en el pueblo',
    correct: 'Las Roscas de la Esquilaora',
    wrongs: ['Las Rosquillas de San Isidro de Madrid', 'Los Bagels Tostados', 'Las Berlinas de Chocolate', 'Los Suspiros del Norte'],
  },
  {
    id: 'gr-cascaron-aceite',
    category: 'recetas',
    emoji: '🥚',
    prompt: 'En las recetas antiguas de dulces de Guareña, cuando la abuela apuntaba «tres cascarones de aceite», ¿con qué se medía?',
    clue: 'Medida casera ingeniosa de unos 55 mililitros usada antes de existir los vasos medidores',
    correct: 'Con media cáscara de huevo vacía',
    wrongs: ['Con una cáscara grande de sandía', 'Con la concha de un caracol', 'Con el tapón de una garrafa', 'Con un cucharón de sopa'],
  },
  {
    id: 'gr-harina-admita',
    category: 'recetas',
    emoji: '🥣',
    prompt: 'En todos los cuadernos manuscritos de dulces de Guareña nunca ponían gramos exactos de harina, sino la famosa frase…',
    clue: 'Significaba ir añadiendo poco a poco hasta que la masa dejara de pegarse a las manos',
    correct: '«Harina, la que admita»',
    wrongs: ['«Harina, medio costal»', '«Harina, tres cucharadas rasas»', '«Harina, sin tocarla»', '«Harina, pasada por agua»'],
  },
  {
    id: 'gr-chato-ocho-vino',
    category: 'recetas',
    emoji: '🍷',
    prompt: 'Cuando una receta tradicional de pestiños o empanadillas en Guareña pedía «un chato o un ocho de vino blanco», ¿cuánto era?',
    clue: 'La medida clásica de un vasito corto de taberna (unos 80 mililitros)',
    correct: 'Un vasito pequeño de vino',
    wrongs: ['Ocho botellas enteras', 'Una arroba de tinaja', 'Media garrafa de cuatro litros', 'Una gota con cuentagotas'],
  },
  {
    id: 'gr-rabo-tenedor',
    category: 'recetas',
    emoji: '🍴',
    prompt: '¿Qué parte del cubierto usaban nuestras madres y abuelas en Guareña para medir la pizca exacta de bicarbonato o canela en los dulces?',
    clue: 'Equivalía a unos cinco gramos justos sin necesidad de báscula',
    correct: 'El rabo (mango) del tenedor o la cuchara',
    wrongs: ['La hoja ancha del cuchillo jamonero', 'El asa de la sartén grande', 'El borde del plato llano', 'El pie de la copa'],
  },
  {
    id: 'gr-jicara-medida',
    category: 'recetas',
    emoji: '☕',
    prompt: 'Otra medida tradicional muy repetida en los recetarios antiguos de Guareña para el aceite, el azúcar o el aguardiente era «una jícara», que era…',
    clue: 'Aquella tacita pequeña de loza donde antiguamente se servía el chocolate espeso',
    correct: 'Una tacita pequeña de las de tomar chocolate (unos 100 ml)',
    wrongs: ['Un cubo de fregar el patio', 'Una olla grande de cocido', 'Un dedal de costura', 'Una sopera honda familiar'],
  },
  {
    id: 'gr-empanadillas-repulgo',
    category: 'recetas',
    emoji: '🥟',
    prompt: '¿De qué rellenamos tradicionalmente en Guareña las empanadillas dulces cerradas a mano con su bonito repulgo antes de rebozarlas en azúcar?',
    clue: 'Un bocado fino y artesanal que nunca falta en bodas, comuniones y Semana Santa',
    correct: 'De cabello de ángel o pasta de almendra',
    wrongs: ['De atún picante con mayonesa', 'De espinacas con queso azul', 'De carne picada con curry', 'De nata montada helada'],
  },
  {
    id: 'gr-perrunillas',
    category: 'recetas',
    emoji: '🍪',
    prompt: 'Manteca de cerdo ibérico bien batida, azúcar, huevos, harina, ralladura de limón, canela y un chorrito de aguardiente…',
    clue: 'Con clara batida y azúcar por encima antes de entrar al horno en latas grandes',
    correct: 'Las Perrunillas de Guareña',
    wrongs: ['Los Churros de Lazo', 'Las Natillas Caseras', 'Los Flanecitos de Huevo', 'Las Crepes Finas'],
  },
  {
    id: 'gr-migas-sardinas',
    category: 'recetas',
    emoji: '🐟',
    prompt: 'En Guareña, cuando caen cuatro gotas o hace frío, junto a unos buenos pimientos fritos y torreznos, las migas están de lujo acompañadas de…',
    clue: 'Asadas o pasadas por la sartén, su sabor salado combina de maravilla con el pan con pimentón',
    correct: 'Unas sardinas asadas o arenques',
    wrongs: ['Rodajas de salmón crudo', 'Palitos de cangrejo congelado', 'Almejas a la marinera', 'Gambas con gabardina'],
  },
  {
    id: 'gr-sopa-tomate',
    category: 'recetas',
    emoji: '🍅',
    prompt: 'Sofrito lento de tomate maduro de las huertas de Guareña, cebolla, pimiento verde, ajo y hierbabuena vertido sobre finísimas sopas de pan asentado:',
    clue: 'En verano se sirven acompañadas de tajadas de melón dulce o unos higos frescos',
    correct: 'Las Sopas de Tomate',
    wrongs: ['El Salmorejo Cordobés con Jamón', 'La Porrusalda Vasca', 'La Sopa de Pescado', 'El Pisto Manchego'],
  },
  {
    id: 'gr-gazpacho-machao',
    category: 'recetas',
    emoji: '🥣',
    prompt: 'Antes de existir las batidoras eléctricas, en Guareña se majaban en el mortero o dornillo el ajo, la sal, la miga de pan y el tomate para hacer…',
    clue: 'Con agua bien fresca, buen aceite de oliva, vinagre y tropezones de pepino y pimiento',
    correct: 'El Gazpacho Machao',
    wrongs: ['La Salsa Bechamel', 'El Puré de Patatas', 'El Alioli Catalán', 'La Crema Pastelera'],
  },
  {
    id: 'gr-caldereta-cordero',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Carne de cordero troceada, refrito de ajos, laurel, vino blanco de la tierra, pimentón y el majado del hígado asado y pimiento seco:',
    clue: 'El guiso estrella de las peñas y familias de Guareña cada 15 de mayo en San Isidro',
    correct: 'La Caldereta de Cordero',
    wrongs: ['El Cocido Montañés', 'El Pollo al Curry', 'La Paella Valenciana', 'El Ternasco con Patatas'],
  },
  {
    id: 'gr-guiso-aceitunas',
    category: 'recetas',
    emoji: '🫒',
    prompt: 'Receta muy particular y sabrosa del recetario tradicional de Guareña donde nuestro fruto del olivar, partido y desalado, se cocina en salsa…',
    clue: 'Un plato humilde de aprovechamiento lleno de sabor de nuestra tierra olivarera',
    correct: 'El Guiso de Aceitunas Machadas',
    wrongs: ['Las Aceitunas Rellenas de Anchoa de Lata', 'La Ensalada César', 'El Guacamole Mexicano', 'El Hummus de Garbanzo'],
  },
  {
    id: 'gr-tagarninas',
    category: 'recetas',
    emoji: '🌿',
    prompt: 'Planta silvestre espinosa muy apreciada en el campo de Guareña cuyas pencas tiernas cocidas se rehogaban con ajo, pimentón, vinagre o huevo:',
    clue: 'Manjar humilde de primavera junto a los cardillos y espárragos del término',
    correct: 'El Esparragado de Tagarninas',
    wrongs: ['Las Algas Marinas al Vapor', 'La Coliflor Gratinada con Queso', 'Los Brotes de Soja', 'La Rúcula con Parmesano'],
  },
  {
    id: 'gr-ajoblanco',
    category: 'recetas',
    emoji: '🧄',
    prompt: 'Sopa fría antiquísima de los veranos en Guareña majando ajo, miga de pan (y almendra cuando había), aceite de oliva, vinagre y agua fresca:',
    clue: 'Qué bien sentaba a mediodía servida con unos granos de uva moscatel o trocitos de melón',
    correct: 'El Ajoblanco Extremeño',
    wrongs: ['La Leche Merengada con Canela', 'El Batido de Vainilla', 'La Salsa Tártara', 'La Sopa de Almendras Caliente de Navidad'],
  },
  {
    id: 'gr-repapalos-dulces',
    category: 'recetas',
    emoji: '🥛',
    prompt: 'Bollitos tiernos de pan rallado o miga y huevo batido, fritos en sartén y cocidos después en leche con canela y cáscara de limón:',
    clue: 'Postre casero de aprovechamiento que en Guareña convierte el pan duro en una delicia',
    correct: 'Los Repápalos Dulces con Leche',
    wrongs: ['Los Profiteroles de Nata', 'El Tiramisú de Café', 'La Tarta de Manzana', 'El Tocino de Cielo'],
  },
  {
    id: 'gr-repapalos-caldo',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Y en su versión salada de vigilia o diario en Guareña, esos mismos bollitos de miga de pan, huevo, ajo y perejil se cuecen en…',
    clue: 'Empapándose de todo el sabor de un buen caldo con azafrán o pimentón',
    correct: 'Caldo casero o salsa esparragada (Repápalos salados)',
    wrongs: ['Zumo de naranja exprimido', 'Almíbar de fresas', 'Chocolate caliente espeso', 'Vino dulce de postre'],
  },
  {
    id: 'gr-rosas-flores',
    category: 'recetas',
    emoji: '🌸',
    prompt: 'Dulce de sartén finísimo hecho calentando en aceite el molde de hierro en forma de estrella antes de mojarlo en la masa de harina, leche y huevo:',
    clue: 'Enmieladas o con azúcar y canela, lucen preciosas en las bandejas de fiesta de Guareña',
    correct: 'Las Flores (o Rosas) Extremeñas',
    wrongs: ['Las Orejas Gallegas', 'Los Gofres Cuadrados', 'Las Magdalenas de Papel', 'Los Bizcochos de Calatayud'],
  },
  {
    id: 'gr-arrope',
    category: 'recetas',
    emoji: '🍇',
    prompt: 'Dulce tradicional de otoño tras la vendimia en Guareña cocinado reduciendo lentamente durante horas el mosto de uva con trozos de calabaza o melón:',
    clue: 'Oscuro, meloso y dulcísimo, se guardaba en orzas de barro para todo el invierno',
    correct: 'El Arrope Casero',
    wrongs: ['La Mermelada de Frambuesa', 'El Caramelo Líquido Industrial', 'La Gelatina de Limón', 'La Compota de Pera al Vino'],
  },
  {
    id: 'gr-prueba-matanza',
    category: 'recetas',
    emoji: '🥩',
    prompt: 'Carne magra picada y adobada con ajo machacado, pimentón de la Vera, sal y orégano que se freía en la sartén el día de matanza en Guareña:',
    clue: 'Servía para comprobar que el punto de sal y pimentón de los chorizos había quedado perfecto',
    correct: 'La Prueba de Cerdo (Picadillo de matanza)',
    wrongs: ['El Steak Tartar Crudo', 'El Carpaccio Italiano', 'El Pollo Empanado', 'Las Albóndigas con Tomate'],
  },
  {
    id: 'gr-chanfaina',
    category: 'recetas',
    emoji: '🥘',
    prompt: 'Guiso pastoril muy arraigado en nuestras tierras de Badajoz con asadura de cordero, ajo, laurel, guindilla, vino, pan frito y huevo duro:',
    clue: 'Plato intenso de cuchara y tenedor para mojar medio pan de pueblo',
    correct: 'La Chanfaina Extremeña',
    wrongs: ['El Chilindrón Aragonés', 'La Ropa Vieja Canaria', 'Los Callos a la Madrileña', 'El Estofado Irlandés'],
  },
  {
    id: 'gr-mantecados-horno',
    category: 'recetas',
    emoji: '🧁',
    prompt: 'Dulce de horno suave y mantecoso cortado con cortapastas redondo o de estrella y espolvoreado de azúcar al salir de la panadería en Guareña:',
    clue: 'Inseparable de las latas de dulces navideños y de bodas antiguas en el pueblo',
    correct: 'Los Mantecados Caseros de Guareña',
    wrongs: ['Los Brownies de Nueces', 'Los Cupcakes con Crema Rosa', 'Los Muffins Ingleses', 'Las Tartas de Queso Frías'],
  },
  {
    id: 'gr-huesillos',
    category: 'recetas',
    emoji: '🥖',
    prompt: 'Rulitos de masa tierna aromatizada con matalahúva (anís) y aguardiente, fritos en sartén y pasados por azúcar blanco en Todos los Santos y Carnaval:',
    clue: 'Uno de los dulces de sartén más rápidos y ricos de las casas de Guareña',
    correct: 'Los Huesillos Extremeños',
    wrongs: ['Los Panellets Catalanes', 'Los Huesos de Mazapán Rellenos', 'Los Buñuelos Rellenos de Trufa', 'Los Bastones de Caramelo'],
  },
  {
    id: 'gr-cojondongo',
    category: 'recetas',
    emoji: '🥗',
    prompt: 'Majado espeso de miga de pan, ajo, aceite de oliva y vinagre al que se añaden tiras o trozos de pimiento, tomate y cebolla fresca:',
    clue: 'Plato fresco de mediodía muy hermano del gazpacho en los veranos de faena en el campo',
    correct: 'El Cojondongo',
    wrongs: ['La Ensalada Waldorf con Manzana', 'El Tabulé de Cuscús', 'El Coleslaw de Repollo', 'La Escalivada Templada'],
  },
  {
    id: 'gr-zorongollo',
    category: 'recetas',
    emoji: '🫑',
    prompt: 'Pimientos rojos carnosos de huerta asados sobre las brasas, pelados a tiras y aliñados en su propio jugo con tomate asado, ajo, cebolla y aceite:',
    clue: 'Con un huevo cocido picado o acompañando una tajada de lomo o carne a la brasa',
    correct: 'El Zorongollo Extremeño',
    wrongs: ['El Pisto con Calabacín', 'La Piperrada Vasca', 'Los Pimientos Rellenos de Arroz', 'El Ratatouille'],
  },
  {
    id: 'gr-peces-guadamez',
    category: 'recetas',
    emoji: '🐟',
    prompt: 'Antiguamente, cuando se iba a pescar al río Guadámez o a las charcas y pantano de Guareña, los peces pequeños limpios y enharinados se preparaban…',
    clue: 'Bien crujientes en sartén o conservados varios días en escabeche casero con laurel y pimentón',
    correct: 'Fritos o en escabeche casero',
    wrongs: ['Crudos marinados en soja', 'Ahumados en madera de haya', 'Cocidos en leche de coco', 'Al vapor con jengibre'],
  },
  {
    id: 'gr-arroz-liebre',
    category: 'recetas',
    emoji: '🥘',
    prompt: 'En temporada de caza por los llanos y olivares de Guareña, ¿qué arroz caldoso hecho en perol da fama a las reuniones camperas de otoño e invierno?',
    clue: 'Con su refrito lento de ajo, pimiento choricero, tomillo, vino y caza menor',
    correct: 'El Arroz con Liebre (o con Conejo de campo)',
    wrongs: ['El Arroz con Leche y Canela', 'El Arroz Negro con Sepia', 'El Arroz Tres Delicias', 'El Risotto de Gorgonzola'],
  },
  {
    id: 'gr-morcilla-mondongo',
    category: 'recetas',
    emoji: '🌭',
    prompt: 'Además del chorizo ibérico rojo de herradura, en las matanzas de Guareña no faltaban colgadas en los varales del doblao…',
    clue: 'Unas para el cocido y otras tiernas para untar o pasar por la sartén',
    correct: 'Las Morcillas caseras y la Patatera',
    wrongs: ['Las Salchichas de Frankfurt', 'El Salami Ahumado Húngaro', 'La Mortadela con Pistachos', 'El Jamón de Pavo Cocido'],
  },
  {
    id: 'gr-cocido-extremeno',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Garbanzos tiernos de nuestras tierras cocidos despacio con tocino, hueso de jamón, chorizo, morcilla, patata y repollo o verdura:',
    clue: 'Primero su sopa de fideos bien calentita y después los garbanzos y «la pringá»',
    correct: 'El Cocido Extremeño de Guareña',
    wrongs: ['La Olla Aranesa', 'La Sopa Minestrone', 'El Potaje de Vigilia sin Carne', 'Las Alubias con Almejas'],
  },
  {
    id: 'gr-melon-invierno',
    category: 'recetas',
    emoji: '🍈',
    prompt: 'Colgados con cuerdas de esparto de las vigas del doblao en las casas de Guareña, ¿qué fruta de secano aguantaba dulce hasta Nochebuena?',
    clue: 'De piel verde rugosa o tendral, abrir uno en Navidad era una fiesta en la mesa',
    correct: 'Los Melones de colgar (de invierno)',
    wrongs: ['Las Fresas tempranas', 'Las Cerezas de mayo', 'Los Albaricoques tiernos', 'Las Ciruelas rojas'],
  },
  {
    id: 'gr-granadas-otono',
    category: 'recetas',
    emoji: '🍎',
    prompt: 'En otoño en los huertos de Guareña madura una fruta de corona que desgranábamos en un bol con azúcar o un chorrito de vino dulce:',
    clue: 'Llena de granitos rojos brillantes como rubíes al llegar los Santos',
    correct: 'La Granada desgranada',
    wrongs: ['El Mango en dados', 'El Plátano machacado', 'El Coco rallado', 'La Piña asada'],
  },
  {
    id: 'gr-migas-cafe',
    category: 'recetas',
    emoji: '☕',
    prompt: 'En muchas casas de Guareña, cuando sobraba un platito de migas para la mañana siguiente, ¿cómo les encantaba desayunarlas a nuestros mayores?',
    clue: 'Echadas a cucharadas dentro del tazón caliente antes de salir al campo',
    correct: 'Migas con café con leche (o con chocolate)',
    wrongs: ['Migas con refresco de cola', 'Migas con helado de vainilla', 'Migas con nata montada', 'Migas con zumo de limón'],
  },
  {
    id: 'gr-pajaritos-perdiz',
    category: 'recetas',
    emoji: '🐦',
    prompt: 'Guiso tradicional campero de nuestra tierra donde las perdices rojas se estofan despacio atadas con laurel, ajos enteros, cebolla, vinagre y vino blanco:',
    clue: 'Tiernas y jugosas en su salsa oscura, manjar de días señalados',
    correct: 'Las Perdices Estofadas / En Escabeche',
    wrongs: ['El Pato Pekín Lacado', 'El Pavo Relleno de Arándanos', 'Las Alitas Picantes', 'El Pollo al Limón Chino'],
  },
  {
    id: 'gr-esparragos-esparragados',
    category: 'recetas',
    emoji: '🥄',
    prompt: 'Además de en revuelto, ¿cómo se guisan en Guareña los espárragos trigueros en cazuela con majado de pan frito, ajo, pimentón, vinagre y huevo cuajado?',
    clue: 'Esa salsa ligada con majado y pimentón que da nombre a toda una forma extremeña de cocinar',
    correct: 'Espárragos Esparragados (en sopa o caldillo)',
    wrongs: ['Espárragos Blancos con Mayonesa de Bote', 'Espárragos Gratinados con Bechamel', 'Crema Fría con Nata', 'Tempura Japonesa'],
  },
  {
    id: 'gr-pestinos-azucar',
    category: 'recetas',
    emoji: '✨',
    prompt: 'En Guareña hay dos bandos deliciosos al terminar de freír los pestiños y las rosquillas: unos los bañan en miel cocida y otros los rebozan aún calientes en…',
    clue: 'Mezclada en un plato hondo para que se pegue bien por todas las dobleces',
    correct: 'Azúcar blanco con canela molida',
    wrongs: ['Sal gorda marina', 'Cacao amargo puro', 'Coco rallado verde', 'Sésamo tostado salado'],
  },
  {
    id: 'gr-tostada-aceite-ajo',
    category: 'recetas',
    emoji: '🧄',
    prompt: 'Para desayunar con fuerza en Guareña, nada supera una buena rebanada de pan candeal tostada a la lumbre, frotada con un diente de ajo y regada con…',
    clue: 'El desayuno mediterráneo más sano y sabroso de nuestras casas desde siempre',
    correct: 'Aceite de oliva virgen nuevo de Guareña (y su pizca de sal o tomate)',
    wrongs: ['Margarina vegetal con mermelada', 'Sirope de arce dulce', 'Crema de cacahuete', 'Salsa barbacoa'],
  },
  {
    id: 'gr-sopa-obispo-cano',
    category: 'recetas',
    emoji: '🍲',
    prompt: 'Cuando en casa había poco más que pan asentado, un pimiento seco, ajo, aceite, pimentón y un chorrito de leche o un huevo, nuestras abuelas hacían unas ricas…',
    clue: 'Cocina humilde de aprovechamiento que quitaba el frío y sabía a gloria',
    correct: 'Sopas Canas (o Sopas de Ajo y Pimentón)',
    wrongs: ['Sopas de Aleta de Tiburón', 'Cremas de Bogavante', 'Sopas de Cebolla con Gruyère', ' Sopas Frías de Pepino y Yogur'],
  },
  {
    id: 'gr-tortilla-san-isidro',
    category: 'recetas',
    emoji: '🥚',
    prompt: 'En todas las casetas y reuniones bajo las encinas en la Romería de San Isidro de Guareña, junto a los embutidos y la caldereta nunca falta…',
    clue: 'Gruesa, jugosa, con patatas bien pochadas y cebolla o pimientos verdes',
    correct: 'La Tortilla de Patatas casera',
    wrongs: ['El Sushi de Atún', 'La Pizza con Piña', 'El Perrito Caliente', 'Los Tacos Picantes'],
  },
  {
    id: 'gr-borrachuelos-roscos-vino',
    category: 'recetas',
    emoji: '🍩',
    prompt: 'Cuando se acercaba la Navidad en Guareña, además de mantecados y perrunillas, se amasaban con vino de la tierra, ajonjolí y matalahúva unos tiernos…',
    clue: 'Bañados de azúcar glas blanca como la escarcha de diciembre',
    correct: 'Roscos de Vino caseros',
    wrongs: ['Pretzels Alemanes', 'Cruasanes Rellenos', ' Galletas de Avena sin Azúcar', 'Pasteles de Arroz'],
  },
  {
    id: 'gr-queso-oveja-aceite',
    category: 'recetas',
    emoji: '🧀',
    prompt: 'Para que el queso curado de oveja no se resecara en el verano de Guareña, ¿dónde se metían los trozos cortados en tarros o vasijas de barro?',
    clue: 'Con una ramita de romero o laurel, quedando el queso tierno y el aceite riquísimo',
    correct: 'Conservado en buen aceite de oliva',
    wrongs: ['En agua con salmuera hirviendo', 'En vinagre fuerte de vino', 'Enterrado bajo arena húmeda', 'Bañado en leche fresca'],
  },
  {
    id: 'gr-natillas-con-galleta',
    category: 'recetas',
    emoji: '🍮',
    prompt: 'En los cumpleaños y domingos familiares en las casas de Guareña, ¿qué postre casero de leche, yemas, azúcar y maicena coronábamos con canela y una galleta?',
    clue: 'Removido con paciencia al fuego con una cáscara de limón para que no se pegara',
    correct: 'Las Natillas Caseras de la abuela',
    wrongs: ['El Helado de Pistacho', 'La Mousse de Maracuyá', 'La Panna Cotta de Frutos Rojos', 'El Sorbete de Limón al Cava'],
  },
  {
    id: 'gr-arroz-con-leche',
    category: 'recetas',
    emoji: '🍚',
    prompt: 'Otro postre de cuchara clásico en Guareña, cocido muy despacito dando vueltas con palo de canela y corteza de limón hasta quedar cremoso:',
    clue: 'Servido en platillos o cuencos individuales dibujando cruces o líneas de canela molida por encima',
    correct: 'El Arroz con Leche casero',
    wrongs: ['La Polenta Dulce', 'Las Gachas de Avena Inglesas', 'El Cuscús con Pasas', 'La Tapioca Tropical'],
  },
  {
    id: 'gr-lomo-adobado-orza',
    category: 'recetas',
    emoji: '🏺',
    prompt: 'Antes de haber frigoríficos en Guareña, ¿cómo se guardaban durante meses los trozos de lomo, costilla y chorizo fritos tras la matanza?',
    clue: 'Cubiertos por completo en su propia manteca blanca solidificada en lugar fresco',
    correct: 'En orzas o tinajillas de barro («lomo en manteca / de orza»)',
    wrongs: ['Colgados al sol de julio en el patio', 'Envueltos en hojas de periódico mojadas', 'Metidos en sacos de trigo', 'Sumergidos en agua del pozo'],
  },
  {
    id: 'gr-calabaza-asada-dulces',
    category: 'recetas',
    emoji: '🎃',
    prompt: 'De la calabaza cidra cultivada en las huertas de Guareña y cocida despacio con azúcar y corteza de limón salía el relleno casero más rico para nuestras empanadillas:',
    clue: 'Hebras doradas, brillantes y dulces hechas en casa con toda la paciencia',
    correct: 'El Cabello de Ángel casero',
    wrongs: ['La Crema de Avellanas y Cacao', 'El Dulce de Leche Argentino', 'La Pasta de Guayaba', 'El Mazapán Crudo'],
  },
  {
    id: 'gr-magdalenas-papel',
    category: 'recetas',
    emoji: '🧁',
    prompt: 'Con huevos bien batidos a mano hasta blanquear, azúcar, aceite suave, limón rallado y harina salían del horno en Guareña aquellas altas y esponjosas…',
    clue: 'Con su copete dorado abierto y una costrita de azúcar por arriba para mojar en leche',
    correct: 'Magdalenas Caseras de pueblo',
    wrongs: ['Galletas Saladas Integrales', 'Obleas de Barquillo', 'Rosquillas de Anís Fritas', 'Tortitas Americanas'],
  },
  {
    id: 'gr-pimientos-asados-conserva',
    category: 'recetas',
    emoji: '🫙',
    prompt: 'Al final del verano en Guareña, las familias compraban sacos de tomates y pimientos de las vegas para asarlos, pelarlos y embotarlos al baño maría haciendo…',
    clue: 'Despensa llena de botes de cristal para tener sabor a huerta todo el año',
    correct: 'Las Conservas caseras de tomate y pimiento',
    wrongs: ['Encurtidos de col fermentada', 'Salsas de soja picantes', 'Mermeladas de naranja amarga', 'Siropes de frutas exóticas'],
  },
  {
    id: 'gr-tomate-frito-huevos',
    category: 'recetas',
    emoji: '🍳',
    prompt: 'Después de una mañana de faena en Guareña, ¿qué plato sencillo de sartén con patatas fritas en rodajas, pimientos verdes, tomate casero y dos huevos camperos sabe a gloria?',
    clue: 'Con la yema líquida pidiendo a gritos un buen trozo de pan para mojar',
    correct: 'Huevos fritos con patatas, pimientos y tomate de huerta',
    wrongs: ['Huevos Benedictinos con Salsa Holandesa', 'Tortilla Francesa de Finas Hierbas', 'Quiche Lorraine de Bacon', 'Huevos Rellenos de Caviar'],
  },
  {
    id: 'gr-sangria-limonada-fiesta',
    category: 'recetas',
    emoji: '🍋',
    prompt: 'En las bodas antiguas en casa, bautizos y fiestas de verano en Guareña, para refrescar a todos los invitados se preparaba en barreño o jarra grande con fruta picada, vino, azúcar y canela…',
    clue: 'Fresquita y aromática para brindar por los novios o por las fiestas del pueblo',
    correct: 'La Sangría / Limonada casera de fiesta',
    wrongs: ['El Ponche Caliente Inglés', 'El Té Helado con Leche', 'El Chocolate a la Taza', 'El Café Irlandés'],
  },
  {
    id: 'gr-higos-secos-nueces',
    category: 'recetas',
    emoji: '🌰',
    prompt: 'Secados al sol en cañizos al terminar el verano y guardados con un toque de harina e hinojo, en invierno eran en Guareña el mejor bocado energético con unas nueces o almendras:',
    clue: 'Los famosos «panecillos» o golosina natural que llevaban hasta los labradores en el bolsillo',
    correct: 'Los Higos Pasos (Higos secos)',
    wrongs: ['Los Dátiles Rellenos de Nata', 'Las Ciruelas en Aguardiente', 'Las Rodajas de Plátano Frito', 'Las Bayas Rojas'],
  },
  {
    id: 'gr-costillas-adobadas-arroz',
    category: 'recetas',
    emoji: '🍖',
    prompt: 'Guiso casero de mediodía muy socorrido y sabroso en las cocinas de Guareña cociendo patatas chascadas (o arroz) con ajo, laurel, pimentón y trozos tiernos de…',
    clue: 'El chasquido al romper la patata hace que el caldo espese y quede trabadito',
    correct: 'Patatas guisadas con costillas adobadas',
    wrongs: ['Patatas Bravas de Bar', 'Ensalada Alemana con Salchichas', 'Ñoquis con Salsa Pesto', 'Puré Instantáneo de Sobre'],
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
    badge: 'Ronda 1/5 · Patrimonio de Guareña',
    optionCount: 2,
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-100 border-amber-400 text-amber-950',
    cardBg: 'bg-amber-50 border-amber-300',
  },
  {
    badge: 'Ronda 2/5 · Oficios y Mesa de Guareña',
    optionCount: 3,
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-100 border-emerald-400 text-emerald-950',
    cardBg: 'bg-emerald-50 border-emerald-300',
  },
  {
    badge: 'Ronda 3/5 · Castúo y Nuestra Habla',
    optionCount: 3,
    borderColor: 'border-teal-500',
    badgeBg: 'bg-teal-100 border-teal-400 text-teal-950',
    cardBg: 'bg-teal-50 border-teal-300',
  },
  {
    badge: 'Ronda 4/5 · Calles, Fiestas e Historia',
    optionCount: 4,
    borderColor: 'border-rose-500',
    badgeBg: 'bg-rose-100 border-rose-400 text-rose-950',
    cardBg: 'bg-rose-50 border-rose-300',
  },
  {
    badge: 'Ronda 5/5 · Recetas de Guareña',
    optionCount: 4,
    borderColor: 'border-orange-500',
    badgeBg: 'bg-orange-100 border-orange-400 text-orange-950',
    cardBg: 'bg-orange-50 border-orange-300',
  },
]

function buildSession(): GuarenaQuestion[] {
  const recent = getRecentIds()
  const q1 = pickFreshQuestion(PATRIMONIO_PHOTO_ITEMS, recent)
  const q2 = pickFreshQuestion(COSTUMBRES_PHOTO_ITEMS, recent)
  const q3 = pickFreshQuestion(HABLA_ITEMS, recent)
  const q4 = pickFreshQuestion(TRADICIONES_ITEMS, recent)
  const q5 = pickFreshQuestion(RECETAS_ITEMS, recent)
  const session = [q1, q2, q3, q4, q5]
  saveRecentIds(session.map((q) => q.id))
  return session
}

function buildOptionsForRound(q: GuarenaQuestion, roundIdx: number): string[] {
  const count = ROUND_META[roundIdx]?.optionCount || 3
  const wrongs = [...q.wrongs].sort(() => 0.5 - Math.random()).slice(0, count - 1)
  return [q.correct, ...wrongs].sort(() => 0.5 - Math.random())
}

export function GuarenaTierra({ onComplete, onExit }: Props) {
  const [sessionItems, setSessionItems] = useState<GuarenaQuestion[]>(() => buildSession())
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
      const praise = pickRandom(GUARENA_PRAISES)
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

        {/* Botones de opciones: en móvil siempre a ancho completo (1 columna) para que ningún texto se corte */}
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
          title="¡Orgullo de Guareña!"
          message="Has recorrido nuestra Guareña, el castúo de Luis Chamizo, nuestras calles, fiestas y recetas de toda la vida."
          onRestart={startNewSession}
          onHome={onExit}
        />
      )}
    </div>
  )
}
