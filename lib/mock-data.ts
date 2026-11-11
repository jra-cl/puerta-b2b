import type { Ficha } from './ficha'

export type EventItem = {
  id: string
  nombre: string
  fecha: string
  local: string
  aforo: number
  vendidas: number
  recaudacion: number
  escaneados: number
  estado: 'activo' | 'borrador' | 'publicado'
  cover?: string
  ficha: Ficha
}

export const EVENTS: EventItem[] = [
  {
    id: 'ev-1',
    cover: '/covers/ultrabailable.png',
    nombre: 'Noche Ultrabailable',
    fecha: 'Viernes 13',
    local: 'Club Subterráneo · Bellavista',
    aforo: 600,
    vendidas: 420,
    recaudacion: 4_200_000,
    escaneados: 185,
    estado: 'activo',
    ficha: {
      nombre: 'Noche Ultrabailable',
      fecha: 'Viernes 13',
      genero: 'Reggaetón & Pop',
      edad: { minMujeres: 21, minHombres: 23 },
      dressCode: ['Casual', 'Sin ropa deportiva'],
      listas: { horaLimite: '00:30', cuposMaximos: 200, gratis: true },
      tramos: [
        { nombre: 'Early Bird', precio: 7000, cupos: 100 },
        { nombre: 'Preventa 1', precio: 10000, cupos: 200 },
        { nombre: 'Preventa 2', precio: 12000, cupos: 200 },
        { nombre: 'Puerta', precio: 15000, cupos: 100 },
      ],
    },
  },
  {
    id: 'ev-2',
    cover: '/covers/techno.png',
    nombre: 'Sótano Techno Sessions',
    fecha: 'Sábado 14',
    local: 'Bodega Franklin',
    aforo: 450,
    vendidas: 312,
    recaudacion: 3_744_000,
    escaneados: 0,
    estado: 'publicado',
    ficha: {
      nombre: 'Sótano Techno Sessions',
      fecha: 'Sábado 14',
      genero: 'Techno',
      edad: { minMujeres: 21, minHombres: 21 },
      dressCode: ['All black', 'Sin ropa deportiva'],
      listas: { horaLimite: '01:00', cuposMaximos: 120, gratis: true },
      tramos: [
        { nombre: 'Early Bird', precio: 9000, cupos: 80 },
        { nombre: 'Preventa 1', precio: 12000, cupos: 180 },
        { nombre: 'Preventa 2', precio: 14000, cupos: 120 },
        { nombre: 'Puerta', precio: 18000, cupos: 70 },
      ],
    },
  },
  {
    id: 'ev-3',
    cover: '/covers/reggaeton.png',
    nombre: 'Cumbia Rooftop Providencia',
    fecha: 'Jueves 19',
    local: 'Terraza Costanera',
    aforo: 300,
    vendidas: 96,
    recaudacion: 768_000,
    escaneados: 0,
    estado: 'publicado',
    ficha: {
      nombre: 'Cumbia Rooftop Providencia',
      fecha: 'Jueves 19',
      genero: 'Cumbia',
      edad: { minMujeres: 18, minHombres: 21 },
      dressCode: ['Smart casual'],
      listas: { horaLimite: '00:00', cuposMaximos: 80, gratis: true },
      tramos: [
        { nombre: 'Preventa 1', precio: 8000, cupos: 200 },
        { nombre: 'Puerta', precio: 12000, cupos: 100 },
      ],
    },
  },
]

export const TRAMOS = ['Early Bird', 'Preventa 1', 'Preventa 2', 'Puerta'] as const

const DAYS = ['Sáb', 'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie']
const SLOTS = ['00h', '06h', '12h', '18h']

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function buildSalesSeries(eventId: string, scale: number) {
  const rand = seeded(eventId.charCodeAt(3) * 97)
  return DAYS.flatMap((day, d) =>
    SLOTS.map((slot, s) => {
      const nightBoost = s === 3 ? 1.8 : s === 0 ? 1.2 : s === 2 ? 0.8 : 0.25
      const early = d < 2 ? 1 : 0.15
      const p1 = d >= 1 && d < 5 ? 1 : 0.2
      const p2 = d >= 4 ? 1.1 : 0.05
      const door = d === 6 && s >= 3 ? 2.5 : 0
      const base = (n: number) => Math.round(n * nightBoost * (0.6 + rand() * 0.8) * scale)
      return {
        label: `${day} ${slot}`,
        'Early Bird': base(6 * early),
        'Preventa 1': base(7 * p1),
        'Preventa 2': base(6 * p2),
        Puerta: Math.round(door * 6 * scale),
      }
    }),
  )
}

export type ScanEntry = {
  id: string
  nombre: string
  tipo: string
  hora: string
  estado: 'ok' | 'rechazado'
  motivo?: string
}

export const INITIAL_SCANS: ScanEntry[] = [
  { id: 's1', nombre: 'Catalina Rojas', tipo: 'Preventa 1', hora: '00:42', estado: 'ok' },
  { id: 's2', nombre: 'Matías Fuentes', tipo: 'Lista RRPP · Benja', hora: '00:41', estado: 'ok' },
  { id: 's3', nombre: 'Josefa Muñoz', tipo: 'Early Bird', hora: '00:40', estado: 'ok' },
  { id: 's4', nombre: 'Tomás Herrera', tipo: 'Preventa 2', hora: '00:38', estado: 'rechazado', motivo: 'Menor de 23' },
  { id: 's5', nombre: 'Fernanda Soto', tipo: 'Lista RRPP · Coni', hora: '00:37', estado: 'ok' },
  { id: 's6', nombre: 'Diego Contreras', tipo: 'Preventa 1', hora: '00:35', estado: 'ok' },
  { id: 's7', nombre: 'Antonia Vidal', tipo: 'Early Bird', hora: '00:33', estado: 'ok' },
  { id: 's8', nombre: 'Ignacio Pérez', tipo: 'Puerta', hora: '00:31', estado: 'rechazado', motivo: 'Ropa deportiva' },
]

export const LIVE_NAMES = [
  ['Valentina Araya', 'Preventa 2'],
  ['Benjamín Silva', 'Lista RRPP · Benja'],
  ['Martina Castro', 'Preventa 1'],
  ['Vicente Morales', 'Early Bird'],
  ['Isidora Reyes', 'Lista RRPP · Coni'],
  ['Agustín Navarro', 'Preventa 2'],
  ['Florencia Díaz', 'Puerta'],
  ['Lucas Espinoza', 'Preventa 1'],
] as const

export type Rrpp = {
  id: string
  nombre: string
  handle: string
  cupo: number
  convertidas: number
  ingresos: number
  comisionPct: number
  activo: boolean
}

export const INITIAL_RRPP: Rrpp[] = [
  { id: 'r1', nombre: 'Benjamín "Benja" Tapia', handle: '@benjatapia', cupo: 80, convertidas: 74, ingresos: 740_000, comisionPct: 10, activo: true },
  { id: 'r2', nombre: 'Constanza "Coni" Lagos', handle: '@conilagos', cupo: 60, convertidas: 52, ingresos: 520_000, comisionPct: 10, activo: true },
  { id: 'r3', nombre: 'Sebastián Orellana', handle: '@sebaorellana', cupo: 50, convertidas: 31, ingresos: 310_000, comisionPct: 8, activo: true },
  { id: 'r4', nombre: 'Javiera Pizarro', handle: '@javipizarro', cupo: 40, convertidas: 18, ingresos: 198_000, comisionPct: 8, activo: true },
  { id: 'r5', nombre: 'Cristóbal Vega', handle: '@crisvega', cupo: 30, convertidas: 9, ingresos: 90_000, comisionPct: 8, activo: false },
]

export type Attendee = {
  nombre: string
  rut: string
  genero: 'F' | 'M'
  edad: number
  tipo: string
  codigo: string
  iniciales: string
}

export const VALID_ATTENDEE: Attendee = {
  nombre: 'Catalina Rojas Ibáñez',
  rut: '19.482.331-7',
  genero: 'F',
  edad: 24,
  tipo: 'Preventa 1 · $10.000',
  codigo: 'PRT-7F3K-9Q21',
  iniciales: 'CR',
}

export const INVALID_ATTENDEE: Attendee = {
  nombre: 'Tomás Herrera Lillo',
  rut: '22.105.874-K',
  genero: 'M',
  edad: 19,
  tipo: 'Preventa 2 · $12.000',
  codigo: 'PRT-2M8X-4L07',
  iniciales: 'TH',
}
