import { z } from 'zod'

export const DRESS_CODE_OPTIONS = [
  'Casual',
  'Elegante',
  'Smart casual',
  'Sin ropa deportiva',
  'Sin zapatillas',
  'Sin gorros',
  'Temático',
  'All black',
] as const

export const fichaSchema = z.object({
  nombre: z.string().describe('Nombre corto y atractivo del evento'),
  fecha: z.string().describe('Día o fecha del evento, ej: "Viernes 13 de noviembre"'),
  genero: z.string().describe('Género musical principal, ej: Techno, Reggaetón, House'),
  edad: z.object({
    minMujeres: z.number().int().min(18).max(35),
    minHombres: z.number().int().min(18).max(35),
  }),
  dressCode: z
    .array(z.string())
    .describe('Etiquetas cortas de dress code, preferir: ' + DRESS_CODE_OPTIONS.join(', ')),
  listas: z.object({
    horaLimite: z.string().describe('Hora límite en formato HH:MM 24h, ej: "00:30"'),
    cuposMaximos: z.number().int().min(0),
    gratis: z.boolean(),
  }),
  tramos: z
    .array(
      z.object({
        nombre: z.string().describe('Ej: Early Bird, Preventa 1, Preventa 2, Puerta'),
        precio: z.number().int().min(0).describe('Precio en CLP sin puntos'),
        cupos: z.number().int().min(0),
      }),
    )
    .min(1),
})

export type Ficha = z.infer<typeof fichaSchema>

export function formatCLP(value: number) {
  return '$' + Math.round(value).toLocaleString('es-CL') + ' CLP'
}

export function formatCLPShort(value: number) {
  return '$' + Math.round(value).toLocaleString('es-CL')
}

/** Offline parser used when the AI Gateway is unavailable, so the prototype still works. */
export function parseFichaLocally(prompt: string): Ficha {
  const text = prompt.toLowerCase()
  const num = (re: RegExp) => {
    const m = text.match(re)
    return m ? Number(m[1].replace(/\./g, '')) : undefined
  }

  const minMujeres = num(/mujeres?\s*\+?\s*(\d{2})/) ?? 21
  const minHombres = num(/hombres?\s*\+?\s*(\d{2})/) ?? 23
  const hora = text.match(/hasta\s*(?:las\s*)?(\d{1,2}[:.]\d{2})/)
  const preventa = num(/preventa[^\d$]*\$?\s*([\d.]+)/) ?? 10000

  const dress: string[] = []
  if (text.includes('casual')) dress.push('Casual')
  if (text.includes('elegante')) dress.push('Elegante')
  if (text.includes('deportiva')) dress.push('Sin ropa deportiva')
  if (text.includes('zapatilla')) dress.push('Sin zapatillas')
  if (text.includes('black')) dress.push('All black')
  if (dress.length === 0) dress.push('Casual')

  const generos = ['techno', 'house', 'reggaetón', 'reggaeton', 'cumbia', 'hip hop', 'pop', 'electrónica']
  const genero = generos.find((g) => text.includes(g)) ?? 'Electrónica'
  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo']
  const dia = dias.find((d) => text.includes(d)) ?? 'viernes'
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return {
    nombre: `${cap(dia)} ${cap(genero)}`,
    fecha: cap(dia),
    genero: cap(genero),
    edad: { minMujeres, minHombres },
    dressCode: dress,
    listas: {
      horaLimite: hora ? hora[1].replace('.', ':').padStart(5, '0') : '00:30',
      cuposMaximos: 150,
      gratis: text.includes('gratis'),
    },
    tramos: [
      { nombre: 'Early Bird', precio: Math.round(preventa * 0.7), cupos: 100 },
      { nombre: 'Preventa 1', precio: preventa, cupos: 200 },
      { nombre: 'Preventa 2', precio: Math.round(preventa * 1.3), cupos: 200 },
      { nombre: 'Puerta', precio: Math.round(preventa * 1.6), cupos: 100 },
    ],
  }
}
