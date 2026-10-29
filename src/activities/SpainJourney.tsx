import { useState, useEffect, useRef } from 'react'
import { sound } from '../services/sound'
import { speech } from '../services/speech'
import { SuccessCelebration } from '../components/SuccessCelebration'
import { pickRandom, SPAIN_PRAISES, GENERAL_RETRIES } from '../services/voiceFeedback'

interface Props {
  onComplete: () => void
  onExit: () => void
}

interface CulturalItem {
  title: string
  subtitle: string
  emoji: string
  correctPlace: string
  wrongPlaces: string[]
}

const STORAGE_KEY = 'memoria_viva_recent_spain_items'

function getRecentTitles(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRecentTitles(newTitles: string[]) {
  try {
    const current = getRecentTitles()
    // Guardamos los últimos 50 títulos recientes para evitar repeticiones a lo largo de muchas partidas
    const combined = Array.from(new Set([...newTitles, ...current])).slice(0, 50)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
  } catch {
    // ignorar errores de almacenamiento
  }
}

const SPAIN_ITEMS: CulturalItem[] = [
  {
    title: "La Paella tradicional",
    subtitle: "Arroz con azafrán, pollo, conejo y verduras de la huerta",
    emoji: "🥘",
    correctPlace: "Valencia",
    wrongPlaces: ["Murcia", "Alicante", "Castellón", "Albacete"],
  },
  {
    title: "La Horchata con Fartons",
    subtitle: "Bebida vegetal refrescante elaborada con chufas",
    emoji: "🥛",
    correctPlace: "Valencia",
    wrongPlaces: ["Alicante", "Castellón", "Murcia", "Albacete"],
  },
  {
    title: "Las Fiestas de las Fallas",
    subtitle: "Monumentos de cartón piedra y tracas de pólvora en marzo",
    emoji: "🎆",
    correctPlace: "Valencia",
    wrongPlaces: ["Alicante", "Castellón", "Zaragoza", "Murcia"],
  },
  {
    title: "La Fiesta de la Tomatina",
    subtitle: "Batalla festiva a tomatazo limpio en la plaza del pueblo",
    emoji: "🍅",
    correctPlace: "Valencia",
    wrongPlaces: ["Murcia", "Alicante", "Albacete", "Castellón"],
  },
  {
    title: "La Giralda y la Feria de Abril",
    subtitle: "Trajes de flamenca, farolillos y olor a azahar",
    emoji: "💃",
    correctPlace: "Sevilla",
    wrongPlaces: ["Córdoba", "Huelva", "Cádiz", "Málaga"],
  },
  {
    title: "La Torre del Oro a orillas del río",
    subtitle: "Albarrana defensiva junto a las aguas del Guadalquivir",
    emoji: "🏰",
    correctPlace: "Sevilla",
    wrongPlaces: ["Córdoba", "Cádiz", "Huelva", "Granada"],
  },
  {
    title: "La Plaza de España semicircular",
    subtitle: "Magnífica obra de ladrillo y azulejos con bancos de todas las provincias",
    emoji: "🏛️",
    correctPlace: "Sevilla",
    wrongPlaces: ["Córdoba", "Málaga", "Granada", "Cádiz"],
  },
  {
    title: "El Pulpo a Feira y la Catedral",
    subtitle: "Con pimentón, aceite y cachelos sobre plato de madera",
    emoji: "🐙",
    correctPlace: "Galicia",
    wrongPlaces: ["Asturias", "Castilla y León", "Cantabria", "País Vasco"],
  },
  {
    title: "La Torre de Hércules",
    subtitle: "El faro romano en funcionamiento más antiguo del planeta",
    emoji: "🗼",
    correctPlace: "Galicia",
    wrongPlaces: ["Asturias", "Cantabria", "País Vasco", "Andalucía"],
  },
  {
    title: "La Tarta de Santiago con Almendras",
    subtitle: "Bizcocho tradicional decorado con la cruz de azúcar glas",
    emoji: "🥧",
    correctPlace: "Galicia",
    wrongPlaces: ["Asturias", "Castilla y León", "Cantabria", "Navarra"],
  },
  {
    title: "Los Pimientos de Padrón",
    subtitle: "Pequeños y verdes fritos en aceite: unos pican y otros no",
    emoji: "🫑",
    correctPlace: "Galicia",
    wrongPlaces: ["Asturias", "Castilla y León", "Cantabria", "País Vasco"],
  },
  {
    title: "Las Islas Cíes y sus Rías Bajas",
    subtitle: "Playas de arena blanca y agua cristalina frente al océano",
    emoji: "🏝️",
    correctPlace: "Galicia",
    wrongPlaces: ["Asturias", "Cantabria", "Baleares", "Canarias"],
  },
  {
    title: "La Sagrada Familia",
    subtitle: "El templo monumental diseñado por el arquitecto Gaudí",
    emoji: "⛪",
    correctPlace: "Barcelona",
    wrongPlaces: ["Girona", "Tarragona", "Lleida", "Zaragoza"],
  },
  {
    title: "El Parque Güell con Mosaicos",
    subtitle: "Jardines con salamandra de cerámica y vistas al mar",
    emoji: "🦎",
    correctPlace: "Barcelona",
    wrongPlaces: ["Girona", "Tarragona", "Lleida", "Valencia"],
  },
  {
    title: "Los Calçots con Salsa Romesco",
    subtitle: "Cebolletas tiernas asadas a la brasa que se comen con babero",
    emoji: "🧅",
    correctPlace: "Cataluña",
    wrongPlaces: ["Aragón", "Comunidad Valenciana", "Baleares", "Navarra"],
  },
  {
    title: "Las Torres Humanas o Castells",
    subtitle: "Construcciones de personas que suben hasta coronar la cima",
    emoji: "🤸",
    correctPlace: "Cataluña",
    wrongPlaces: ["Comunidad Valenciana", "Aragón", "Baleares", "Murcia"],
  },
  {
    title: "El Monasterio de Montserrat",
    subtitle: "Santuario encaramado en una sierra de rocas redondeadas",
    emoji: "⛰️",
    correctPlace: "Barcelona",
    wrongPlaces: ["Girona", "Lleida", "Tarragona", "Huesca"],
  },
  {
    title: "La Fabada y la Sidra",
    subtitle: "Guiso con alubias tiernas, compango y buen escanciado",
    emoji: "🍲",
    correctPlace: "Asturias",
    wrongPlaces: ["Cantabria", "Galicia", "Castilla y León", "País Vasco"],
  },
  {
    title: "El Santuario de Covadonga y sus Lagos",
    subtitle: "Cueva de la Santina en el corazón de los Picos de Europa",
    emoji: "⛰️",
    correctPlace: "Asturias",
    wrongPlaces: ["Cantabria", "Galicia", "León", "Navarra"],
  },
  {
    title: "El Cachopo de Ternera con Jamón y Queso",
    subtitle: "Grandes filetes empanados rellenos y crujientes",
    emoji: "🥩",
    correctPlace: "Asturias",
    wrongPlaces: ["Cantabria", "Galicia", "Castilla y León", "País Vasco"],
  },
  {
    title: "El Queso Cabrales en Cueva Natural",
    subtitle: "Queso azul madurado en cuevas de alta montaña",
    emoji: "🧀",
    correctPlace: "Asturias",
    wrongPlaces: ["Cantabria", "Galicia", "León", "País Vasco"],
  },
  {
    title: "El Acueducto Romano y el Cochinillo",
    subtitle: "Grandes arcos de piedra milenarios y asado tierno cortado con plato",
    emoji: "🏛️",
    correctPlace: "Segovia",
    wrongPlaces: ["Ávila", "Madrid", "Valladolid", "Toledo"],
  },
  {
    title: "El Castillo de Alcázar con Torres de Cuento",
    subtitle: "Fortaleza con forma de proa de barco sobre la roca",
    emoji: "🏰",
    correctPlace: "Segovia",
    wrongPlaces: ["Ávila", "Toledo", "Valladolid", "Guadalajara"],
  },
  {
    title: "Las Fiestas de San Fermín",
    subtitle: "Pañuelo rojo al cuello y chupinazo el 7 de julio",
    emoji: "🎺",
    correctPlace: "Pamplona",
    wrongPlaces: ["Logroño", "San Sebastián", "Vitoria", "Zaragoza"],
  },
  {
    title: "Los Espárragos Blancos y las Alcachofas",
    subtitle: "Grandes verduras tiernas recolectadas en la ribera del río",
    emoji: "🌱",
    correctPlace: "Navarra",
    wrongPlaces: ["La Rioja", "Aragón", "Álava", "Soria"],
  },
  {
    title: "El Castillo Real de Olite",
    subtitle: "Palacio de reyes con torres de cuento y almenas",
    emoji: "🏰",
    correctPlace: "Navarra",
    wrongPlaces: ["Zaragoza", "Huesca", "La Rioja", "Álava"],
  },
  {
    title: "El Gazpacho y el Salmorejo",
    subtitle: "Sopa fría de tomate maduro, pepino y buen aceite virgen",
    emoji: "🍅",
    correctPlace: "Andalucía",
    wrongPlaces: ["Extremadura", "Murcia", "Castilla-La Mancha", "Comunidad Valenciana"],
  },
  {
    title: "El Aceite de Oliva de Inmensos Olivares",
    subtitle: "Mar de olivos verdes que producen el mejor oro líquido",
    emoji: "🫒",
    correctPlace: "Jaén",
    wrongPlaces: ["Córdoba", "Granada", "Ciudad Real", "Albacete"],
  },
  {
    title: "Los Espetos de Sardinas al Fuego",
    subtitle: "Pescado ensartado en caña y asado en una barca de arena",
    emoji: "🐟",
    correctPlace: "Málaga",
    wrongPlaces: ["Cádiz", "Almería", "Granada", "Huelva"],
  },
  {
    title: "El Jamón de Jabugo en la Sierra",
    subtitle: "Curado con aire puro de encinas y alcornoques",
    emoji: "🥓",
    correctPlace: "Huelva",
    wrongPlaces: ["Sevilla", "Cádiz", "Badajoz", "Córdoba"],
  },
  {
    title: "El Valle de los Dólmenes y El Torcal",
    subtitle: "Formaciones calizas de piedra esculpidas por el viento",
    emoji: "🪨",
    correctPlace: "Málaga",
    wrongPlaces: ["Granada", "Cádiz", "Córdoba", "Sevilla"],
  },
  {
    title: "La Alhambra y el Generalife",
    subtitle: "Palacios nazaríes con surtidores de agua frente a cumbres nevadas",
    emoji: "🏰",
    correctPlace: "Granada",
    wrongPlaces: ["Málaga", "Jaén", "Almería", "Córdoba"],
  },
  {
    title: "Las Casas Cueva del Sacromonte",
    subtitle: "Viviendas encaladas en la colina al son de la zambra",
    emoji: "🪕",
    correctPlace: "Granada",
    wrongPlaces: ["Málaga", "Almería", "Jaén", "Córdoba"],
  },
  {
    title: "El Cocido Tradicional y el Chotis",
    subtitle: "Fiestas de San Isidro con barquillos y claveles en la solapa",
    emoji: "🏺",
    correctPlace: "Madrid",
    wrongPlaces: ["Toledo", "Segovia", "Guadalajara", "Ávila"],
  },
  {
    title: "El Museo del Prado y Las Meninas",
    subtitle: "La gran pinacoteca con lienzos de Velázquez y Goya",
    emoji: "🎨",
    correctPlace: "Madrid",
    wrongPlaces: ["Toledo", "Segovia", "Valladolid", "Salamanca"],
  },
  {
    title: "El Monasterio de San Lorenzo de El Escorial",
    subtitle: "Gran mole de piedra herreriana mandada construir por Felipe II",
    emoji: "🏛️",
    correctPlace: "Madrid",
    wrongPlaces: ["Segovia", "Toledo", "Ávila", "Guadalajara"],
  },
  {
    title: "El Parque del Retiro y su Palacio de Cristal",
    subtitle: "Jardines históricos con barcas en el estanque central",
    emoji: "🌳",
    correctPlace: "Madrid",
    wrongPlaces: ["Toledo", "Segovia", "Valladolid", "Salamanca"],
  },
  {
    title: "La Basílica del Pilar y la Jota",
    subtitle: "A orillas del río Ebro con ofrenda de flores en octubre",
    emoji: "⛪",
    correctPlace: "Zaragoza",
    wrongPlaces: ["Huesca", "Teruel", "Navarra", "Logroño"],
  },
  {
    title: "El Asado de Ternasco a la Brasa",
    subtitle: "Carne tierna de cordero con patatas panaderas al horno",
    emoji: "🍖",
    correctPlace: "Aragón",
    wrongPlaces: ["Castilla y León", "Navarra", "La Rioja", "Cataluña"],
  },
  {
    title: "El Palacio de la Aljafería",
    subtitle: "Palacio islámico fortificado con arcos de yeso y torres",
    emoji: "🏰",
    correctPlace: "Zaragoza",
    wrongPlaces: ["Huesca", "Teruel", "Lleida", "Navarra"],
  },
  {
    title: "El Parque Nacional de Ordesa y Monte Perdido",
    subtitle: "Valles glaciares y cascadas en la alta montaña pirenaica",
    emoji: "🏞️",
    correctPlace: "Huesca",
    wrongPlaces: ["Lleida", "Zaragoza", "Navarra", "Girona"],
  },
  {
    title: "La Mezquita y los Patios con Flores",
    subtitle: "Bosque de arcos blancos y rojos con geranios en las paredes",
    emoji: "🌷",
    correctPlace: "Córdoba",
    wrongPlaces: ["Sevilla", "Jaén", "Granada", "Ciudad Real"],
  },
  {
    title: "El Puente Romano sobre el Guadalquivir",
    subtitle: "Antiguos arcos de piedra vigilados por la Torre de la Calahorra",
    emoji: "🌉",
    correctPlace: "Córdoba",
    wrongPlaces: ["Sevilla", "Jaén", "Granada", "Badajoz"],
  },
  {
    title: "La Universidad Histórica y la Rana",
    subtitle: "Fachada plateresca de piedra dorada donde buscar el anfibio escondido",
    emoji: "🎓",
    correctPlace: "Salamanca",
    wrongPlaces: ["Zamora", "Ávila", "Valladolid", "Cáceres"],
  },
  {
    title: "El Hornazo Relleno de Lomo y Chorizo",
    subtitle: "Masa de pan rellena que se degusta el Lunes de Aguas",
    emoji: "🥧",
    correctPlace: "Salamanca",
    wrongPlaces: ["Zamora", "Ávila", "Valladolid", "León"],
  },
  {
    title: "La Casa de las Conchas",
    subtitle: "Palacio urbano con cientos de conchas de vieira esculpidas en la piedra",
    emoji: "🐚",
    correctPlace: "Salamanca",
    wrongPlaces: ["Zamora", "Ávila", "Valladolid", "Cáceres"],
  },
  {
    title: "Las Murallas Medievales y las Yemas",
    subtitle: "Recinto amurallado de piedra completo y dulce redondo de yema de huevo",
    emoji: "🏰",
    correctPlace: "Ávila",
    wrongPlaces: ["Segovia", "Salamanca", "Madrid", "Toledo"],
  },
  {
    title: "El Chuletón a la Brasa",
    subtitle: "Gran pieza de carne de buey o ternera asada a fuego lento",
    emoji: "🥩",
    correctPlace: "Ávila",
    wrongPlaces: ["Segovia", "Salamanca", "Toledo", "Madrid"],
  },
  {
    title: "La Ensaimada y las Calas Turquesas",
    subtitle: "Dulce tradicional en espiral espolvoreado con azúcar glas",
    emoji: "🥐",
    correctPlace: "Mallorca",
    wrongPlaces: ["Menorca", "Ibiza", "Valencia", "Barcelona"],
  },
  {
    title: "La Sobrasada con Miel",
    subtitle: "Embutido untable rojizo condimentado con pimentón dulce",
    emoji: "🥪",
    correctPlace: "Mallorca",
    wrongPlaces: ["Menorca", "Ibiza", "Valencia", "Alicante"],
  },
  {
    title: "La Catedral del Mar y el Castillo de Bellver",
    subtitle: "Templo gótico asomado al puerto y castillo de planta redonda",
    emoji: "⛪",
    correctPlace: "Mallorca",
    wrongPlaces: ["Menorca", "Ibiza", "Barcelona", "Valencia"],
  },
  {
    title: "La Caldereta de Langosta",
    subtitle: "Guiso marinero cocinado en cazuela de barro en el puerto",
    emoji: "🦞",
    correctPlace: "Menorca",
    wrongPlaces: ["Mallorca", "Ibiza", "Cádiz", "Girona"],
  },
  {
    title: "Las Murallas de Dalt Vila y la Salina",
    subtitle: "Fortaleza blanca sobre la colina coronada por la catedral",
    emoji: "🏰",
    correctPlace: "Ibiza",
    wrongPlaces: ["Mallorca", "Menorca", "Valencia", "Alicante"],
  },
  {
    title: "El Majestuoso Volcán del Teide",
    subtitle: "El pico más alto de España rodeado de paisajes volcánicos",
    emoji: "🌋",
    correctPlace: "Tenerife",
    wrongPlaces: ["Gran Canaria", "Lanzarote", "La Palma", "Fuerteventura"],
  },
  {
    title: "Papas Arrugadas con Mojo Picón",
    subtitle: "Pequeñas patatas cocidas con mucha sal marina acompañadas de salsa roja",
    emoji: "🥔",
    correctPlace: "Canarias",
    wrongPlaces: ["Baleares", "Andalucía", "Murcia", "Ceuta"],
  },
  {
    title: "Las Dunas Doradas de Maspalomas",
    subtitle: "Extenso desierto de arena junto al océano y el faro",
    emoji: "🏖️",
    correctPlace: "Gran Canaria",
    wrongPlaces: ["Tenerife", "Lanzarote", "Fuerteventura", "Cádiz"],
  },
  {
    title: "Las Tierras de Fuego de Timanfaya",
    subtitle: "Campos de lava negra y géiseres de vapor caliente",
    emoji: "🔥",
    correctPlace: "Lanzarote",
    wrongPlaces: ["Tenerife", "Gran Canaria", "Fuerteventura", "La Palma"],
  },
  {
    title: "El Mazapán Tradicional y el Alcázar",
    subtitle: "Ciudad histórica de las tres culturas asomada sobre el río Tajo",
    emoji: "🏰",
    correctPlace: "Toledo",
    wrongPlaces: ["Madrid", "Ciudad Real", "Cuenca", "Ávila"],
  },
  {
    title: "Las Espadas de Acero Forjado y Damasquinado",
    subtitle: "Artesanía de hojas de metal con incrustaciones de oro",
    emoji: "⚔️",
    correctPlace: "Toledo",
    wrongPlaces: ["Madrid", "Guadalajara", "Ciudad Real", "Segovia"],
  },
  {
    title: "Los Grandes Viñedos y Barricas de Roble",
    subtitle: "Tierra afamada en todo el mundo por sus excelentes vinos tintos",
    emoji: "🍇",
    correctPlace: "La Rioja",
    wrongPlaces: ["Navarra", "Álava", "Burgos", "Aragón"],
  },
  {
    title: "Las Patatas con Chorizo de la Huerta",
    subtitle: "Guiso tradicional de patata cascada y pimentón que calienta el cuerpo",
    emoji: "🥔",
    correctPlace: "La Rioja",
    wrongPlaces: ["Navarra", "Burgos", "Álava", "Soria"],
  },
  {
    title: "Las Casas Colgadas",
    subtitle: "Balcones de madera que parecen volar sobre la hoz del río Huécar",
    emoji: "🏡",
    correctPlace: "Cuenca",
    wrongPlaces: ["Guadalajara", "Teruel", "Albacete", "Toledo"],
  },
  {
    title: "La Ciudad Encantada",
    subtitle: "Figuras gigantescas de piedra esculpidas por el agua y el tiempo",
    emoji: "🗿",
    correctPlace: "Cuenca",
    wrongPlaces: ["Guadalajara", "Teruel", "Albacete", "Toledo"],
  },
  {
    title: "La Playa de la Concha y los Pintxos",
    subtitle: "Elegante bahía semicircular en el mar Cantábrico con barandilla blanca",
    emoji: "🏖️",
    correctPlace: "San Sebastián",
    wrongPlaces: ["Bilbao", "Vitoria", "Pamplona", "Santander"],
  },
  {
    title: "El Museo Guggenheim con Paneles de Titanio",
    subtitle: "Edificio vanguardista a orillas de la ría protegido por Puppy",
    emoji: "🏛️",
    correctPlace: "Bilbao",
    wrongPlaces: ["San Sebastián", "Vitoria", "Santander", "Oviedo"],
  },
  {
    title: "El Bacalao al Pil-Pil",
    subtitle: "Pescado preparado en cazuela de barro ligando aceite y gelatina",
    emoji: "🐟",
    correctPlace: "País Vasco",
    wrongPlaces: ["Cantabria", "Galicia", "Asturias", "Navarra"],
  },
  {
    title: "El Peine del Viento en los Acantilados",
    subtitle: "Esculturas de hierro ancladas en la roca frente a las olas",
    emoji: "🌊",
    correctPlace: "San Sebastián",
    wrongPlaces: ["Bilbao", "Santander", "Gijón", "A Coruña"],
  },
  {
    title: "El Teatro Romano y el Templo de Diana",
    subtitle: "Monumentos del imperio de Augusta Emerita con columnas corintias",
    emoji: "🏛️",
    correctPlace: "Mérida",
    wrongPlaces: ["Badajoz", "Cáceres", "Sevilla", "Córdoba"],
  },
  {
    title: "La Ciudad Monumental y la Torre de Bujaco",
    subtitle: "Calles empedradas, palacios medievales y nidos de cigüeña",
    emoji: "🏰",
    correctPlace: "Cáceres",
    wrongPlaces: ["Badajoz", "Salamanca", "Toledo", "Mérida"],
  },
  {
    title: "La Torta del Casar Cremosa",
    subtitle: "Queso de oveja de corteza dura que se abre como una tapa",
    emoji: "🧀",
    correctPlace: "Extremadura",
    wrongPlaces: ["Castilla-La Mancha", "Andalucía", "Castilla y León", "Murcia"],
  },
  {
    title: "Las Cerezas del Valle del Jerte",
    subtitle: "Flores blancas en primavera y frutos rojos y dulces en verano",
    emoji: "🍒",
    correctPlace: "Extremadura",
    wrongPlaces: ["Andalucía", "Castilla y León", "Castilla-La Mancha", "Murcia"],
  },
  {
    title: "Los Carnavales y las Chirigotas",
    subtitle: "Coplas con humor en el Gran Teatro Falla frente al océano",
    emoji: "🎭",
    correctPlace: "Cádiz",
    wrongPlaces: ["Huelva", "Sevilla", "Málaga", "Ceuta"],
  },
  {
    title: "Las Bodegas de Vino de Jerez",
    subtitle: "Crianza tradicional en criaderas y soleras de barrica",
    emoji: "🍷",
    correctPlace: "Cádiz",
    wrongPlaces: ["Huelva", "Sevilla", "Córdoba", "Málaga"],
  },
  {
    title: "Las Tortillitas de Camarones",
    subtitle: "Fritura fina y crujiente de camarones pequeños con perejil",
    emoji: "🍤",
    correctPlace: "Cádiz",
    wrongPlaces: ["Huelva", "Málaga", "Almería", "Sevilla"],
  },
  {
    title: "El Turrón de Almendra Navideño",
    subtitle: "El dulce más famoso elaborado con almendra tostada y miel",
    emoji: "🍬",
    correctPlace: "Alicante",
    wrongPlaces: ["Valencia", "Murcia", "Albacete", "Castellón"],
  },
  {
    title: "El Castillo de Santa Bárbara sobre el Benacantil",
    subtitle: "Fortaleza rocosa con vistas a la playa del Postiguet",
    emoji: "🏰",
    correctPlace: "Alicante",
    wrongPlaces: ["Valencia", "Murcia", "Castellón", "Almería"],
  },
  {
    title: "El Palmeral de Elche",
    subtitle: "Inmenso bosque de palmeras datileras plantado en época andalusí",
    emoji: "🌴",
    correctPlace: "Alicante",
    wrongPlaces: ["Murcia", "Valencia", "Almería", "Castellón"],
  },
  {
    title: "La Catedral Gótica y la Morcilla de Arroz",
    subtitle: "Cuna del Cid Campeador a orillas del río Arlanzón",
    emoji: "⛪",
    correctPlace: "Burgos",
    wrongPlaces: ["Palencia", "Logroño", "Valladolid", "Soria"],
  },
  {
    title: "El Yacimiento de Atapuerca",
    subtitle: "La cuna de los primeros pobladores humanos de Europa",
    emoji: "🦴",
    correctPlace: "Burgos",
    wrongPlaces: ["Palencia", "Soria", "León", "Logroño"],
  },
  {
    title: "El Palacio de la Magdalena y las Rabas",
    subtitle: "Elegante bahía norteña y paseo marítimo de El Sardinero",
    emoji: "⚓",
    correctPlace: "Santander",
    wrongPlaces: ["Gijón", "Bilbao", "Oviedo", "San Sebastián"],
  },
  {
    title: "Las Cuevas de Altamira y sus Bisontes",
    subtitle: "La Capilla Sixtina del arte rupestre prehistórico",
    emoji: "🦬",
    correctPlace: "Cantabria",
    wrongPlaces: ["Asturias", "País Vasco", "Galicia", "Navarra"],
  },
  {
    title: "Los Sobaos Pasiegos y la Quesada",
    subtitle: "Dulces esponjosos elaborados con mantequilla pura de vaca",
    emoji: "🧈",
    correctPlace: "Cantabria",
    wrongPlaces: ["Asturias", "País Vasco", "Burgos", "Palencia"],
  },
  {
    title: "Las Anchoas en Aceite de Santoña",
    subtitle: "Filetes limpios a mano en conserva de salazón",
    emoji: "🐟",
    correctPlace: "Cantabria",
    wrongPlaces: ["Asturias", "País Vasco", "Galicia", "A Coruña"],
  },
  {
    title: "Las Médulas y el Castillo Templario",
    subtitle: "Montañas doradas y grandes fortalezas en El Bierzo",
    emoji: "⛰️",
    correctPlace: "León",
    wrongPlaces: ["Asturias", "Zamora", "Palencia", "Ourense"],
  },
  {
    title: "La Catedral de las Vidrieras de Colores",
    subtitle: "Templo gótico con muros casi transparentes de luz multicolor",
    emoji: "⛪",
    correctPlace: "León",
    wrongPlaces: ["Burgos", "Palencia", "Zamora", "Valladolid"],
  },
  {
    title: "La Cecina Curada de Vaca",
    subtitle: "Carne ahumada en cecinera con ligero toque de encina",
    emoji: "🥓",
    correctPlace: "León",
    wrongPlaces: ["Asturias", "Zamora", "Palencia", "Lugo"],
  },
  {
    title: "El Torico y las Torres Mudéjares",
    subtitle: "Plaza pequeña con fuente y la célebre historia de los Amantes",
    emoji: "🐂",
    correctPlace: "Teruel",
    wrongPlaces: ["Zaragoza", "Cuenca", "Castellón", "Guadalajara"],
  },
  {
    title: "Los Molinos de Viento de Don Quijote",
    subtitle: "Gigantes blancos con aspas de madera sobre los cerros",
    emoji: "🌬️",
    correctPlace: "Castilla-La Mancha",
    wrongPlaces: ["Castilla y León", "Extremadura", "Madrid", "Andalucía"],
  },
  {
    title: "El Queso de Oveja Curado en Aceite",
    subtitle: "Queso prensado con corteza de pleita de esparto",
    emoji: "🧀",
    correctPlace: "Castilla-La Mancha",
    wrongPlaces: ["Castilla y León", "Extremadura", "Andalucía", "Aragón"],
  },
  {
    title: "Las Tablas de Humedal Fluvial",
    subtitle: "Parque nacional de pasarelas de madera entre espadañas y aves acuáticas",
    emoji: "🦆",
    correctPlace: "Ciudad Real",
    wrongPlaces: ["Toledo", "Albacete", "Cuenca", "Jaén"],
  },
  {
    title: "El Pisto Tradicional con Huevo Frito",
    subtitle: "Fritada de calabacín, tomate, pimiento y cebolla picados",
    emoji: "🍳",
    correctPlace: "Castilla-La Mancha",
    wrongPlaces: ["Extremadura", "Madrid", "Murcia", "Andalucía"],
  },
  {
    title: "El Mar Menor y La Manga",
    subtitle: "Gran laguna de agua salada cálida separada del Mediterráneo",
    emoji: "⛵",
    correctPlace: "Murcia",
    wrongPlaces: ["Alicante", "Almería", "Valencia", "Castellón"],
  },
  {
    title: "El Caldero de Arroz y Pescado de Roca",
    subtitle: "Arroz meloso con ñoras servido con alioli casero",
    emoji: "🍲",
    correctPlace: "Murcia",
    wrongPlaces: ["Alicante", "Almería", "Valencia", "Granada"],
  },
  {
    title: "El Teatro Romano junto al Puerto",
    subtitle: "Gran graderío de piedra descubierto bajo el casco antiguo",
    emoji: "🏛️",
    correctPlace: "Cartagena",
    wrongPlaces: ["Murcia", "Alicante", "Almería", "Málaga"],
  },
  {
    title: "La Calle del Laurel y sus Champiñones",
    subtitle: "Famosa senda de pinchos y buen vino en el casco antiguo",
    emoji: "🍄",
    correctPlace: "Logroño",
    wrongPlaces: ["Pamplona", "Burgos", "Vitoria", "Soria"],
  },
  {
    title: "La Iglesia Románica de San Martín",
    subtitle: "Joya del Románico con canecillos tallados en el Camino Francés",
    emoji: "⛪",
    correctPlace: "Palencia",
    wrongPlaces: ["Burgos", "León", "Valladolid", "Zamora"],
  },
  {
    title: "Las Murallas sobre el Río Duero",
    subtitle: "La bien cercada con su catedral de cúpula escamada",
    emoji: "🏰",
    correctPlace: "Zamora",
    wrongPlaces: ["Salamanca", "Valladolid", "León", "Palencia"],
  },
  {
    title: "La Laguna Negra y los Pinos Silvestres",
    subtitle: "Laguna de origen glaciar rodeada de paredes de roca",
    emoji: "🌲",
    correctPlace: "Soria",
    wrongPlaces: ["Burgos", "Segovia", "La Rioja", "Guadalajara"],
  },
  {
    title: "El Castillo de Peñafiel en Forma de Barco",
    subtitle: "Fortaleza alargada sobre la colina rodeada de viñedos de ribera",
    emoji: "🏰",
    correctPlace: "Valladolid",
    wrongPlaces: ["Burgos", "Palencia", "Segovia", "Zamora"],
  },
  {
    title: "Las Murallas Reales y su Foso Navegable",
    subtitle: "Foso con agua de mar que separa dos continentes frente al Estrecho",
    emoji: "🏰",
    correctPlace: "Ceuta",
    wrongPlaces: ["Melilla", "Cádiz", "Algeciras", "Málaga"],
  },
  {
    title: "La Gran Ciudadela Fortificada frente al Mar",
    subtitle: "Peñón con recinto amurallado de cuatro recintos sobre el Mediterráneo",
    emoji: "🛡️",
    correctPlace: "Melilla",
    wrongPlaces: ["Ceuta", "Almería", "Málaga", "Cádiz"],
  },
]

const OPTION_COUNTS = [2, 3, 4, 4]

export function SpainJourney({ onComplete, onExit }: Props) {
  const [roundIdx, setRoundIdx] = useState(0)
  const [sessionItems, setSessionItems] = useState<CulturalItem[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const isAdvancingRef = useRef(false)

  const initSession = () => {
    const recent = getRecentTitles()
    // Priorizamos preguntas que no hayan salido en las últimas partidas
    const unplayed = SPAIN_ITEMS.filter((item) => !recent.includes(item.title))
    const pool = unplayed.length >= 4 ? unplayed : SPAIN_ITEMS
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 4)
    saveRecentTitles(shuffled.map((i) => i.title))

    setSessionItems(shuffled)
    setRoundIdx(0)
    setIsSuccess(false)
  }

  useEffect(() => {
    initSession()
    return () => speech.stop()
  }, [])

  useEffect(() => {
    if (sessionItems.length === 0) return
    const item = sessionItems[roundIdx] || sessionItems[0]
    const count = OPTION_COUNTS[roundIdx] || 2
    const wrongs = [...item.wrongPlaces].sort(() => 0.5 - Math.random()).slice(0, count - 1)
    setOptions([item.correctPlace, ...wrongs].sort(() => 0.5 - Math.random()))
    setSelectedPlace(null)
    setFeedback('')
    isAdvancingRef.current = false

    return () => {
      speech.stop()
    }
  }, [roundIdx, sessionItems])

  if (sessionItems.length === 0) return null
  const currentItem = sessionItems[roundIdx] || sessionItems[0]

  const handleSelectPlace = (place: string) => {
    if (isAdvancingRef.current) return
    sound.playTap()
    setSelectedPlace(place)

    if (place === currentItem.correctPlace) {
      isAdvancingRef.current = true
      sound.playSuccess()
      const praise = pickRandom(SPAIN_PRAISES)
      const msg = `¡Exacto! ${currentItem.title} es de ${currentItem.correctPlace}.`
      setFeedback(msg)

      let hasAdv = false
      const advance = () => {
        if (hasAdv) return
        hasAdv = true
        setTimeout(() => {
          if (roundIdx + 1 < sessionItems.length) {
            setRoundIdx((r) => r + 1)
          } else {
            setIsSuccess(true)
            onComplete()
          }
        }, 500)
      }

      // Solo locución de felicitación breve sin leer todo el texto de la pantalla
      const dur = speech.estimateDurationMs(praise)
      speech.speak(praise, advance)
      setTimeout(advance, dur + 2200)
    } else {
      sound.playGentleRetry()
      setFeedback(`No es de ${place}. Prueba con otra opción.`)
      speech.speak(pickRandom(GENERAL_RETRIES))
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto overflow-hidden h-full">
      <div className="flex-1 flex flex-col justify-between bg-white border-3 sm:border-4 border-rose-400 rounded-2xl sm:rounded-3xl p-2 sm:p-5 shadow-md text-center min-h-0 overflow-hidden gap-2">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-2 px-1 shrink-0">
          <h3 className="text-2xl sm:text-4xl font-black text-stone-950">
            ¿De dónde es típico?
          </h3>
          <span className="px-3 sm:px-5 py-1 sm:py-2 bg-rose-100 border-2 sm:border-3 border-rose-400 text-rose-950 font-black rounded-xl sm:rounded-2xl text-xl sm:text-3xl shrink-0">
            {roundIdx + 1}/4
          </span>
        </div>

        {/* Cultural Card */}
        <div className="bg-rose-50 border-3 sm:border-4 border-rose-300 rounded-2xl sm:rounded-3xl p-3 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5 shrink-0">
          <span className="text-6xl sm:text-8xl leading-none shrink-0">{currentItem.emoji}</span>
          <div className="text-center sm:text-left">
            <p className="font-black text-stone-950 text-2xl sm:text-5xl leading-tight">
              {currentItem.title}
            </p>
            <p className="font-bold text-rose-900 text-lg sm:text-2xl mt-1">
              {currentItem.subtitle}
            </p>
          </div>
        </div>

        {feedback && (
          <div className="p-1.5 sm:p-2.5 rounded-xl bg-amber-100 border-2 border-amber-400 text-amber-950 font-black text-lg sm:text-2xl shrink-0">
            {feedback}
          </div>
        )}

        {/* Options Grid */}
        <div
          className={`flex-1 min-h-0 w-full grid gap-2.5 sm:gap-4 items-stretch ${
            options.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 grid-rows-2 sm:grid-rows-1'
              : options.length === 3
              ? 'grid-cols-1 sm:grid-cols-3 grid-rows-3 sm:grid-rows-1'
              : 'grid-cols-2 grid-rows-2'
          }`}
        >
          {options.map((place) => {
            const isChosen = selectedPlace === place
            const isCorrect = place === currentItem.correctPlace
            return (
              <button
                key={place}
                onClick={() => handleSelectPlace(place)}
                className={`w-full h-full min-h-0 rounded-2xl sm:rounded-3xl border-3 sm:border-4 p-3 sm:p-6 flex items-center justify-center font-black text-3xl sm:text-5xl cursor-pointer transition-all active:scale-95 shadow-sm ${
                  isChosen
                    ? isCorrect
                      ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-300'
                      : 'bg-amber-100 border-amber-400 text-amber-950 opacity-75'
                    : 'bg-stone-50 hover:bg-rose-50 border-stone-300 hover:border-rose-400 text-stone-950'
                }`}
              >
                📍 {place}
              </button>
            )
          })}
        </div>
      </div>

      {isSuccess && (
        <SuccessCelebration
          title="¡Gran viajero!"
          message="Conoces de maravilla las tradiciones, platos y rincones de toda España."
          onRestart={initSession}
          onHome={onExit}
        />
      )}
    </div>
  )
}
