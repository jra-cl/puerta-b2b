'use client'

import { useMemo } from 'react'
import { ChevronDown, Plus, Ticket, Wallet, ScanLine, TrendingDown } from 'lucide-react'
import { Btn, PageHeader, Panel, PanelTitle, Progress, Tag } from './primitives'
import { SalesChart, TRAMO_COLORS } from './sales-chart'
import { ScanLog } from './scan-log'
import { buildSalesSeries, TRAMOS, type EventItem, type ScanEntry } from '@/lib/mock-data'
import { formatCLP, formatCLPShort } from '@/lib/ficha'

export function Overview({
  events,
  event,
  onSelectEvent,
  onCreateEvent,
  scans,
}: {
  events: EventItem[]
  event: EventItem
  onSelectEvent: (id: string) => void
  onCreateEvent: () => void
  scans: ScanEntry[]
}) {
  const series = useMemo(
    () => buildSalesSeries(event.id, Math.max(0.2, event.vendidas / 420)),
    [event.id, event.vendidas],
  )
  const breakdown = useMemo(() => {
    const totals = TRAMOS.map((t) => ({ tramo: t, total: series.reduce((a, row) => a + row[t], 0) }))
    const sum = totals.reduce((a, b) => a + b.total, 0) || 1
    return totals.map((t) => ({ ...t, pct: (t.total / sum) * 100 }))
  }, [series])

  const soldPct = (event.vendidas / event.aforo) * 100
  const scannedPct = event.vendidas ? Math.round((event.escaneados / event.vendidas) * 100) : 0
  const puertaFee = event.recaudacion * 0.08
  const legacyFee = event.recaudacion * 0.15

  return (
    <div>
      <PageHeader eyebrow="Inicio · Métricas en vivo" title="Esta noche en tu puerta">
        <div className="relative">
          <label htmlFor="event-select" className="sr-only">
            Evento activo
          </label>
          <select
            id="event-select"
            value={event.id}
            onChange={(e) => onSelectEvent(e.target.value)}
            className="h-10 appearance-none rounded-lg border border-border bg-card pl-3 pr-9 text-sm text-foreground focus:border-gold/60 focus:outline-none"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.fecha} — {ev.nombre}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>
        <Btn onClick={onCreateEvent}>
          <Plus className="size-4" aria-hidden />
          Crear Nuevo Evento
        </Btn>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {event.cover && (
          // eslint-disable-next-line @next/next/no-img-element -- cover may be a local object URL
          <img src={event.cover} alt="" className="size-8 rounded-md border border-gold/30 object-cover" />
        )}
        <span>{event.local}</span>
        <span aria-hidden>·</span>
        {event.estado === 'activo' ? (
          <Tag tone="success">
            <span className="size-1.5 rounded-full bg-success" aria-hidden />
            En curso
          </Tag>
        ) : (
          <Tag tone="gold">Publicado · Preventa abierta</Tag>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Entradas vendidas <Ticket className="size-4 text-gold" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">
            {event.vendidas}
            <span className="text-base font-normal text-muted-foreground"> / {event.aforo} aforo</span>
          </p>
          <Progress value={soldPct} className="mt-4" />
          <p className="mt-2 text-xs text-muted-foreground">{Math.round(soldPct)}% del aforo vendido</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Recaudación bruta <Wallet className="size-4 text-gold" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{formatCLPShort(event.recaudacion)}</p>
          <p className="mt-1 text-xs text-muted-foreground">CLP · ticket promedio {formatCLPShort(event.recaudacion / Math.max(1, event.vendidas))}</p>
          <p className="mt-3 text-xs text-success">+18% vs. evento anterior</p>
        </Panel>

        <Panel>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Escaneados en puerta <ScanLine className="size-4 text-gold" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums">
            {event.escaneados}
            <span className="text-base font-normal text-muted-foreground"> ingresados</span>
          </p>
          <Progress value={scannedPct} className="mt-4" />
          <p className="mt-2 text-xs text-muted-foreground">{scannedPct}% del total vendido</p>
        </Panel>

        <Panel className="border-success/30 bg-gradient-to-br from-success/10 to-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            Comisión PUERTA estimada <TrendingDown className="size-4 text-success" aria-hidden />
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-success">{formatCLPShort(puertaFee)}</p>
          <p className="mt-1 text-xs text-muted-foreground">~8% de la recaudación</p>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-surface/70 px-3 py-2 text-xs">
            <span className="text-muted-foreground line-through decoration-destructive/70">
              ~15% ticketera · {formatCLPShort(legacyFee)}
            </span>
            <span className="font-semibold text-success">Ahorras {formatCLPShort(legacyFee - puertaFee)}</span>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <PanelTitle
            title="Curva de ventas · últimos 7 días"
            description="Entradas vendidas por bloque de 6 horas, apiladas por tramo"
          />
          <SalesChart data={series} />
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {breakdown.map((b) => (
              <div key={b.tramo} className="rounded-lg border border-border bg-surface p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full" style={{ background: TRAMO_COLORS[b.tramo] }} aria-hidden />
                  {b.tramo}
                </div>
                <p className="mt-1 text-lg font-semibold tabular-nums">{b.total}</p>
                <p className="text-xs text-muted-foreground">{b.pct.toFixed(0)}% del total</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelTitle
            title="Ingresos recientes en puerta"
            description="Log de escaneo en tiempo real"
            action={
              <Tag tone="success">
                <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden />
                Live
              </Tag>
            }
          />
          <ScanLog scans={scans} limit={9} />
        </Panel>
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Recaudación total registrada: {formatCLP(event.recaudacion)}
      </p>
    </div>
  )
}
