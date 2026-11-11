'use client'

import { useRef, useState } from 'react'
import { Check, Copy, ImageUp, Loader2, PencilLine, Smartphone, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { Btn, Modal, PageHeader, Panel, PanelTitle, Tag, inputClass } from './primitives'
import { FichaPreview, isFichaValid } from './ficha-preview'
import { AppPreview } from './app-preview'
import type { Ficha } from '@/lib/ficha'
import type { EventItem } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const EXAMPLE_PROMPT =
  'Evento Viernes techno en Bellavista, edad mujeres +21 hombres +23, casual sin ropa deportiva, listas gratis hasta 00:30 con 150 cupos, early bird a $7.000, preventa a $10.000 y puerta a $15.000.'

export function EventBuilder({
  onPublish,
  onGoToMetrics,
  notify,
}: {
  onPublish: (event: EventItem) => void
  onGoToMetrics: () => void
  notify: (msg: string) => void
}) {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT)
  const [flyer, setFlyer] = useState<{ url: string; name: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ficha, setFicha] = useState<Ficha | null>(null)
  const [source, setSource] = useState<'ai' | 'local' | null>(null)
  const [published, setPublished] = useState<{ slug: string; nombre: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [venue, setVenue] = useState('Club Subterráneo, Bellavista')
  const [view, setView] = useState<'edit' | 'app'>('edit')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file?: File) {
    if (!file || !file.type.startsWith('image/')) return
    if (flyer) URL.revokeObjectURL(flyer.url)
    setFlyer({ url: URL.createObjectURL(file), name: file.name })
  }

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'No se pudo generar la ficha')
      setFicha(data.ficha)
      setSource(data.source)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function publish() {
    if (!ficha) return
    const slug = ficha.nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    const aforo = ficha.tramos.reduce((a, t) => a + t.cupos, 0) || 400
    onPublish({
      id: `ev-${Date.now()}`,
      nombre: ficha.nombre,
      fecha: ficha.fecha,
      local: venue,
      cover: flyer?.url,
      aforo,
      vendidas: 0,
      recaudacion: 0,
      escaneados: 0,
      estado: 'publicado',
      ficha,
    })
    setPublished({ slug, nombre: ficha.nombre })
  }

  async function copy(text: string) {
    await navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(text)
    setTimeout(() => setCopied(null), 1500)
  }

  const valid = ficha ? isFichaValid(ficha) : false
  const links = published
    ? [
        { label: 'Venta pública', url: `puerta.cl/e/${published.slug}` },
        { label: 'Lista gratis', url: `puerta.cl/e/${published.slug}/lista` },
        { label: 'Link RRPP genérico', url: `puerta.cl/e/${published.slug}?rrpp=club` },
      ]
    : []

  return (
    <div>
      <PageHeader eyebrow="Gestión de eventos" title="Crea la ficha oficial con IA" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel className="flex flex-col gap-5">
          <PanelTitle title="1 · Lo que sabes del evento" description="Sube el flyer y descríbelo como se lo contarías a tu equipo." />

          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files?.[0])
            }}
            className={cn(
              'relative flex min-h-44 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed p-6 text-center transition-colors',
              dragging ? 'border-gold bg-gold/5' : 'border-input bg-surface',
            )}
          >
            {flyer ? (
              <div className="flex w-full items-center gap-4 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img src={flyer.url} alt="Vista previa del flyer subido" className="h-36 w-28 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{flyer.name}</p>
                  <p className="text-xs text-muted-foreground">Flyer listo para la página pública</p>
                  <Btn
                    variant="ghost"
                    className="mt-2 h-8 px-2 text-xs"
                    onClick={() => {
                      URL.revokeObjectURL(flyer.url)
                      setFlyer(null)
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden /> Quitar
                  </Btn>
                </div>
              </div>
            ) : (
              <>
                <ImageUp className="size-7 text-gold" aria-hidden />
                <p className="text-sm">Arrastra el flyer aquí</p>
                <p className="text-xs text-muted-foreground">PNG o JPG · formato historia 9:16 recomendado</p>
                <Btn variant="outline" className="mt-2 h-8 text-xs" onClick={() => fileRef.current?.click()}>
                  Buscar archivo
                </Btn>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              aria-label="Subir flyer"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-venue" className="text-xs font-medium text-muted-foreground">
              Local y comuna
            </label>
            <input
              id="event-venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="event-prompt" className="text-xs font-medium text-muted-foreground">
              Descripción libre del evento
            </label>
            <textarea
              id="event-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="w-full resize-none rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
              placeholder="Ej: Sábado reggaetón, mujeres +18 hombres +21, elegante, lista hasta 01:00…"
            />
            <button
              type="button"
              onClick={() => setPrompt(EXAMPLE_PROMPT)}
              className="self-start text-xs text-gold/80 underline-offset-4 hover:underline"
            >
              Usar ejemplo
            </button>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Btn onClick={generate} disabled={loading || !prompt.trim()} className="h-12 text-base">
            {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
            {loading ? 'Generando ficha…' : 'Generar Ficha Oficial con IA'}
          </Btn>
        </Panel>

        <Panel className="flex flex-col">
          <PanelTitle
            title="2 · Ficha estructurada"
            description="Revisa y ajusta. La puerta valida cada ingreso contra esta ficha."
            action={
              source && (
                <Tag tone={source === 'ai' ? 'gold' : 'neutral'}>
                  <Wand2 className="size-3" aria-hidden />
                  {source === 'ai' ? 'Generada con IA' : 'Generada (modo offline)'}
                </Tag>
              )
            }
          />

          {loading && <FichaSkeleton />}
          {!loading && !ficha && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
              <Sparkles className="size-8 text-gold/60" aria-hidden />
              <p className="text-sm text-muted-foreground text-pretty">
                Aquí aparecerá la ficha oficial con edades, dress code, listas y tramos de venta.
              </p>
            </div>
          )}
          {!loading && ficha && (
            <>
              <div role="tablist" aria-label="Modo de la ficha" className="mb-4 grid grid-cols-2 gap-1 rounded-full border border-border bg-surface p-1">
                {(
                  [
                    ['edit', 'Editar ficha', PencilLine],
                    ['app', 'Vista en la app', Smartphone],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    aria-selected={view === id}
                    onClick={() => setView(id)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold transition-colors',
                      view === id ? 'bg-gold text-[#1a1208]' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
              {view === 'edit' ? (
                <FichaPreview ficha={ficha} onChange={setFicha} valid={valid} />
              ) : (
                <AppPreview ficha={ficha} venue={venue} cover={flyer?.url ?? '/covers/ultrabailable.png'} valid={valid} />
              )}
              <Btn onClick={publish} disabled={!valid} variant="success" className="mt-5 h-12 text-base">
                <Check className="size-4" aria-hidden />
                Publicar Evento y Generar Links
              </Btn>
            </>
          )}
        </Panel>
      </div>

      <Modal
        open={!!published}
        onClose={() => setPublished(null)}
        title="¡Evento publicado!"
        description={published ? `${published.nombre} ya está a la venta. Comparte estos links:` : undefined}
      >
        <ul className="flex flex-col gap-2">
          {links.map((l) => (
            <li key={l.url} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{l.label}</p>
                <p className="truncate font-mono text-sm text-gold">{l.url}</p>
              </div>
              <Btn variant="outline" className="h-8 px-3 text-xs" onClick={() => copy(l.url)}>
                {copied === l.url ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                {copied === l.url ? 'Copiado' : 'Copiar'}
              </Btn>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setPublished(null)}>
            Seguir editando
          </Btn>
          <Btn
            onClick={() => {
              setPublished(null)
              notify('Evento agregado a tus métricas')
              onGoToMetrics()
            }}
          >
            Ver métricas del evento
          </Btn>
        </div>
      </Modal>
    </div>
  )
}

function FichaSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2" aria-busy="true" aria-label="Generando ficha">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-xl border border-border bg-surface" />
      ))}
    </div>
  )
}
