'use client'

import { useState } from 'react'
import { AlertOctagon, CheckCircle2, QrCode, RotateCcw, ShieldAlert, ShieldCheck } from 'lucide-react'
import { Btn, PageHeader, Panel, PanelTitle, Tag, inputClass } from './primitives'
import { ScanLog } from './scan-log'
import { INVALID_ATTENDEE, VALID_ATTENDEE, type Attendee, type EventItem, type ScanEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type Result =
  | { kind: 'idle' }
  | { kind: 'ok'; attendee: Attendee; minAge: number }
  | { kind: 'fail'; attendee?: Attendee; reason: string; detail: string }

export function DoorScanner({
  event,
  onScan,
  scans,
}: {
  event: EventItem
  onScan: (entry: Omit<ScanEntry, 'id' | 'hora'>) => void
  scans: ScanEntry[]
}) {
  const [result, setResult] = useState<Result>({ kind: 'idle' })
  const [code, setCode] = useState('')
  const { minMujeres, minHombres } = event.ficha.edad

  function evaluate(attendee: Attendee) {
    const minAge = attendee.genero === 'F' ? minMujeres : minHombres
    if (attendee.edad < minAge) {
      setResult({
        kind: 'fail',
        attendee,
        reason: 'ALERTA: Menor de edad según la Ficha Oficial del Evento',
        detail: `Tiene ${attendee.edad} años. Mínimo exigido para ${attendee.genero === 'F' ? 'mujeres' : 'hombres'}: +${minAge}.`,
      })
      onScan({ nombre: attendee.nombre, tipo: attendee.tipo, estado: 'rechazado', motivo: `Menor de ${minAge}` })
    } else {
      setResult({ kind: 'ok', attendee, minAge })
      onScan({ nombre: attendee.nombre, tipo: attendee.tipo.split(' · ')[0], estado: 'ok' })
    }
  }

  function submitCode(e: React.FormEvent) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) return
    if (c === VALID_ATTENDEE.codigo) evaluate(VALID_ATTENDEE)
    else if (c === INVALID_ATTENDEE.codigo) evaluate(INVALID_ATTENDEE)
    else {
      setResult({ kind: 'fail', reason: 'CÓDIGO NO ENCONTRADO', detail: `El QR "${c}" no pertenece a este evento o ya fue usado.` })
      onScan({ nombre: `Código ${c}`, tipo: '—', estado: 'rechazado', motivo: 'QR inválido' })
    }
    setCode('')
  }

  return (
    <div>
      <PageHeader eyebrow="Vista guardia · Simulador" title="Escáner de puerta" />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="mx-auto w-full max-w-[380px]">
          <div className="rounded-[2.5rem] border border-border bg-[#05030a] p-3 shadow-2xl shadow-primary/10">
            <div className="relative flex h-[680px] flex-col overflow-hidden rounded-[2rem] bg-surface">
              <div className="flex items-center justify-between px-6 pt-3 text-[11px] text-muted-foreground">
                <span className="font-mono">00:43</span>
                <span className="h-5 w-24 rounded-full bg-black" aria-hidden />
                <span>5G</span>
              </div>

              {result.kind === 'idle' && (
                <IdleView event={event} code={code} setCode={setCode} onSubmit={submitCode} />
              )}
              {result.kind === 'ok' && <OkView result={result} onNext={() => setResult({ kind: 'idle' })} />}
              {result.kind === 'fail' && <FailView result={result} onNext={() => setResult({ kind: 'idle' })} />}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Btn variant="success" onClick={() => evaluate(VALID_ATTENDEE)}>
              <ShieldCheck className="size-4" aria-hidden /> Simular Escaneo Válido
            </Btn>
            <Btn onClick={() => evaluate(INVALID_ATTENDEE)}>
              <ShieldAlert className="size-4" aria-hidden /> Simular Incumplimiento
            </Btn>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelTitle title="Criterios activos de la Ficha Oficial" description={`${event.fecha} — ${event.nombre}`} />
            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Criterion label="Mujeres" value={`+${minMujeres}`} />
              <Criterion label="Hombres" value={`+${minHombres}`} />
              <Criterion label="Lista hasta" value={event.ficha.listas.horaLimite} />
              <Criterion label="Aforo" value={`${event.escaneados}/${event.aforo}`} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {event.ficha.dressCode.map((d) => (
                <Tag key={d} tone="gold">
                  {d}
                </Tag>
              ))}
            </div>
          </Panel>
          <Panel>
            <PanelTitle title="Códigos de prueba" description="Escríbelos en el input del teléfono" />
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="font-mono text-gold">{VALID_ATTENDEE.codigo}</span>
                <span className="text-xs text-success">Válido</span>
              </li>
              <li className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="font-mono text-gold">{INVALID_ATTENDEE.codigo}</span>
                <span className="text-xs text-destructive">Menor de edad</span>
              </li>
            </ul>
          </Panel>
          <Panel>
            <PanelTitle title="Últimos escaneos" />
            <ScanLog scans={scans} limit={6} />
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Criterion({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function IdleView({
  event,
  code,
  setCode,
  onSubmit,
}: {
  event: EventItem
  code: string
  setCode: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex flex-1 flex-col px-5 pb-6 pt-4">
      <p className="font-display text-lg font-bold tracking-[0.25em] text-gold">PUERTA</p>
      <p className="text-xs text-muted-foreground">
        {event.nombre} · Guardia: Puerta 1
      </p>

      <div
        className="relative mt-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#1b1328] to-[#0a0710]"
        style={{ ['--scan-h' as string]: '300px' }}
        aria-label="Cámara simulada"
        role="img"
      >
        {(['left-4 top-4 border-l-2 border-t-2', 'right-4 top-4 border-r-2 border-t-2', 'left-4 bottom-4 border-l-2 border-b-2', 'right-4 bottom-4 border-r-2 border-b-2'] as const).map(
          (pos) => (
            <span key={pos} className={cn('absolute size-10 rounded-sm border-gold', pos)} aria-hidden />
          ),
        )}
        <QrCode className="size-24 text-foreground/15" aria-hidden />
        <span className="animate-scan-line absolute inset-x-6 top-0 h-0.5 bg-gold shadow-[0_0_16px_2px_var(--gold)]" aria-hidden />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Apunta al código QR del asistente</p>

      <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-2">
        <label htmlFor="qr-code" className="text-xs text-muted-foreground">
          O ingresa el código manualmente
        </label>
        <div className="flex gap-2">
          <input
            id="qr-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="PRT-XXXX-XXXX"
            autoComplete="off"
            className={cn(inputClass, 'font-mono uppercase')}
          />
          <Btn type="submit" className="shrink-0 px-3">
            Validar
          </Btn>
        </div>
      </form>
    </div>
  )
}

function Avatar({ attendee, tone }: { attendee: Attendee; tone: 'ok' | 'fail' }) {
  return (
    <div
      className={cn(
        'flex size-24 items-center justify-center rounded-full border-4 font-display text-3xl font-bold',
        tone === 'ok' ? 'border-white/40 bg-white/15 text-white' : 'border-white/40 bg-black/20 text-white',
      )}
      aria-hidden
    >
      {attendee.iniciales}
    </div>
  )
}

function OkView({ result, onNext }: { result: Extract<Result, { kind: 'ok' }>; onNext: () => void }) {
  const a = result.attendee
  return (
    <div role="status" className="flex flex-1 flex-col items-center bg-[#14804f] px-6 pb-6 pt-8 text-center text-white animate-in fade-in zoom-in-95">
      <CheckCircle2 className="size-20" aria-hidden />
      <p className="mt-2 text-3xl font-black tracking-wide">ACCESO OK</p>
      <div className="mt-6">
        <Avatar attendee={a} tone="ok" />
      </div>
      <p className="mt-4 text-xl font-semibold">{a.nombre}</p>
      <p className="font-mono text-sm text-white/80">RUT {a.rut}</p>
      <p className="mt-1 text-sm text-white/80">{a.tipo}</p>
      <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-bold">
        <CheckCircle2 className="size-5" aria-hidden />
        CUMPLE CRITERIOS DE EDAD (+{result.minAge})
      </div>
      <button
        type="button"
        onClick={onNext}
        className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-[#14804f]"
      >
        <RotateCcw className="size-4" aria-hidden /> Siguiente
      </button>
    </div>
  )
}

function FailView({ result, onNext }: { result: Extract<Result, { kind: 'fail' }>; onNext: () => void }) {
  const a = result.attendee
  return (
    <div role="alert" className="flex flex-1 flex-col items-center bg-[#b3132e] px-6 pb-6 pt-8 text-center text-white animate-in fade-in zoom-in-95">
      <AlertOctagon className="size-20" aria-hidden />
      <p className="mt-2 text-3xl font-black tracking-wide">NO INGRESA</p>
      {a && (
        <>
          <div className="mt-6">
            <Avatar attendee={a} tone="fail" />
          </div>
          <p className="mt-4 text-xl font-semibold">{a.nombre}</p>
          <p className="font-mono text-sm text-white/80">RUT {a.rut}</p>
          <p className="mt-1 text-sm text-white/80">{a.tipo}</p>
        </>
      )}
      <div className="mt-5 rounded-xl border-2 border-white/40 bg-black/20 px-4 py-3">
        <p className="text-sm font-bold text-balance">{result.reason}</p>
        <p className="mt-1 text-xs text-white/85">{result.detail}</p>
      </div>
      <button
        type="button"
        onClick={onNext}
        className="mt-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-[#b3132e]"
      >
        <RotateCcw className="size-4" aria-hidden /> Siguiente
      </button>
    </div>
  )
}
