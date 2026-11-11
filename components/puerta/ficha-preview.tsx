'use client'

import { useState } from 'react'
import { BadgeCheck, Clock, Plus, Shirt, Ticket, User, X, AlertTriangle } from 'lucide-react'
import { DRESS_CODE_OPTIONS, formatCLPShort, type Ficha } from '@/lib/ficha'
import { inputClass } from './primitives'
import { cn } from '@/lib/utils'

export function isFichaValid(f: Ficha) {
  return (
    f.nombre.trim().length > 0 &&
    f.edad.minMujeres >= 18 &&
    f.edad.minHombres >= 18 &&
    f.dressCode.length > 0 &&
    /^\d{2}:\d{2}$/.test(f.listas.horaLimite) &&
    f.tramos.length > 0 &&
    f.tramos.every((t) => t.nombre.trim() && t.precio > 0)
  )
}

function Block({ icon: Icon, n, title, children }: { icon: typeof User; n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-border bg-surface p-4">
      <legend className="sr-only">{title}</legend>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-gold/10 font-mono text-xs text-gold">{n}</span>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {children}
    </fieldset>
  )
}

export function FichaPreview({
  ficha,
  onChange,
  valid,
}: {
  ficha: Ficha
  onChange: (f: Ficha) => void
  valid: boolean
}) {
  const [customTag, setCustomTag] = useState('')
  const set = (patch: Partial<Ficha>) => onChange({ ...ficha, ...patch })
  const allTags = Array.from(new Set([...DRESS_CODE_OPTIONS, ...ficha.dressCode]))

  function toggleTag(tag: string) {
    set({
      dressCode: ficha.dressCode.includes(tag) ? ficha.dressCode.filter((t) => t !== tag) : [...ficha.dressCode, tag],
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/20 bg-gradient-to-r from-accent to-surface p-4">
        <div className="min-w-0 flex-1">
          <label htmlFor="ficha-nombre" className="sr-only">
            Nombre del evento
          </label>
          <input
            id="ficha-nombre"
            value={ficha.nombre}
            onChange={(e) => set({ nombre: e.target.value })}
            className="w-full bg-transparent font-display text-2xl font-semibold uppercase tracking-wide text-foreground focus:outline-none"
          />
          <p className="text-xs text-muted-foreground">
            {ficha.fecha} · {ficha.genero}
          </p>
        </div>
        {valid ? (
          <div className="flex items-center gap-2 rounded-full border border-success/40 bg-success/15 px-3 py-1.5 text-xs font-semibold text-success">
            <BadgeCheck className="size-4" aria-hidden />
            Ficha Verificada y Lista para Publicar
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="size-4" aria-hidden />
            Faltan datos obligatorios
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Block icon={User} n={1} title="Requisitos de edad">
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ['minMujeres', 'Mín. mujeres'],
                ['minHombres', 'Mín. hombres'],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label htmlFor={key} className="text-xs text-muted-foreground">
                  {label}
                </label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gold">+</span>
                  <input
                    id={key}
                    type="number"
                    min={18}
                    max={35}
                    value={ficha.edad[key]}
                    onChange={(e) => set({ edad: { ...ficha.edad, [key]: Number(e.target.value) } })}
                    className={cn(inputClass, 'pl-6 text-lg font-semibold tabular-nums')}
                  />
                </div>
              </div>
            ))}
          </div>
        </Block>

        <Block icon={Shirt} n={2} title="Dress code">
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const on = ficha.dressCode.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-xs transition-colors',
                    on
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-border text-muted-foreground hover:border-gold/30 hover:text-foreground',
                  )}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const t = customTag.trim()
              if (t && !ficha.dressCode.includes(t)) set({ dressCode: [...ficha.dressCode, t] })
              setCustomTag('')
            }}
          >
            <label htmlFor="custom-tag" className="sr-only">
              Agregar etiqueta de dress code
            </label>
            <input
              id="custom-tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Otra etiqueta…"
              className={cn(inputClass, 'h-8 text-xs')}
            />
            <button type="submit" className="rounded-lg border border-border px-2 text-muted-foreground hover:text-foreground">
              <Plus className="size-4" aria-hidden />
              <span className="sr-only">Agregar</span>
            </button>
          </form>
        </Block>

        <Block icon={Clock} n={3} title="Gestión de listas">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hora-limite" className="text-xs text-muted-foreground">
                Hora límite
              </label>
              <input
                id="hora-limite"
                type="time"
                value={ficha.listas.horaLimite}
                onChange={(e) => set({ listas: { ...ficha.listas, horaLimite: e.target.value } })}
                className={cn(inputClass, 'mt-1 font-mono [color-scheme:dark]')}
              />
            </div>
            <div>
              <label htmlFor="cupos-lista" className="text-xs text-muted-foreground">
                Cupos máximos
              </label>
              <input
                id="cupos-lista"
                type="number"
                min={0}
                value={ficha.listas.cuposMaximos}
                onChange={(e) => set({ listas: { ...ficha.listas, cuposMaximos: Number(e.target.value) } })}
                className={cn(inputClass, 'mt-1 tabular-nums')}
              />
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={ficha.listas.gratis}
              onChange={(e) => set({ listas: { ...ficha.listas, gratis: e.target.checked } })}
              className="size-4 accent-[#e8ce8c]"
            />
            Lista gratuita hasta la hora límite
          </label>
        </Block>

        <Block icon={Ticket} n={4} title="Precios y tramos">
          <ul className="flex flex-col gap-2">
            {ficha.tramos.map((t, i) => (
              <li key={i} className="flex items-center gap-2">
                <label className="sr-only" htmlFor={`tramo-n-${i}`}>
                  Nombre del tramo
                </label>
                <input
                  id={`tramo-n-${i}`}
                  value={t.nombre}
                  onChange={(e) =>
                    set({ tramos: ficha.tramos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)) })
                  }
                  className={cn(inputClass, 'h-8 flex-1 text-xs')}
                />
                <label className="sr-only" htmlFor={`tramo-p-${i}`}>
                  Precio en CLP
                </label>
                <input
                  id={`tramo-p-${i}`}
                  type="number"
                  min={0}
                  step={500}
                  value={t.precio}
                  onChange={(e) =>
                    set({ tramos: ficha.tramos.map((x, j) => (j === i ? { ...x, precio: Number(e.target.value) } : x)) })
                  }
                  className={cn(inputClass, 'h-8 w-24 text-right text-xs tabular-nums')}
                />
                <button
                  type="button"
                  onClick={() => set({ tramos: ficha.tramos.filter((_, j) => j !== i) })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" aria-hidden />
                  <span className="sr-only">Eliminar tramo {t.nombre}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => set({ tramos: [...ficha.tramos, { nombre: 'Nuevo tramo', precio: 10000, cupos: 100 }] })}
              className="flex items-center gap-1 text-xs text-gold/80 hover:text-gold"
            >
              <Plus className="size-3.5" aria-hidden /> Agregar tramo
            </button>
            <span className="text-xs text-muted-foreground">
              desde {formatCLPShort(ficha.tramos.length ? Math.min(...ficha.tramos.map((t) => t.precio)) : 0)}
            </span>
          </div>
        </Block>
      </div>
    </div>
  )
}
