import { generateText, Output } from 'ai'
import { fichaSchema, parseFichaLocally } from '@/lib/ficha'

export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim().slice(0, 2000) : ''

  if (!prompt) {
    return Response.json({ error: 'Describe el evento para generar la ficha.' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: 'google/gemini-3.5-flash',
      output: Output.object({ schema: fichaSchema }),
      system:
        'Eres el asistente de PUERTA, plataforma de gestión nocturna para clubes en Santiago de Chile. ' +
        'Convierte la descripción informal del productor en una ficha oficial estructurada. ' +
        'Precios en pesos chilenos (CLP) como enteros. Si falta información, infiere valores razonables ' +
        'para la escena nocturna de Santiago: tramos Early Bird, Preventa 1, Preventa 2 y Puerta con precios crecientes; ' +
        'cupos de lista 150 si no se indica. Responde en español.',
      prompt,
    })
    return Response.json({ ficha: output, source: 'ai' })
  } catch (error) {
    console.error('[v0] AI ficha generation failed, using local parser:', (error as Error).message)
    return Response.json({ ficha: parseFichaLocally(prompt), source: 'local' })
  }
}
