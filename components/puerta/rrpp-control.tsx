'use client'

import { useState } from 'react'
import { Check, Copy, Link2, Pause, Play, Plus } from 'lucide-react'
import { Btn, Field, Modal, PageHeader, Panel, PanelTitle, Progress, Tag, inputClass } from './primitives'
import { formatCLPShort } from '@/lib/ficha'
import type { EventItem, Rrpp } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function RrppControl({
  rrpp,
  setRrpp,
  event,
  notify,
}: {
  rrpp: Rrpp[]
  setRrpp: React.Dispatch<React.SetStateAction<Rrpp[]>>
  event: EventItem
  notify: (msg: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', handle: '', cupo: 40, comision: 10 })
  const [createdLink, setCreatedLink] = useState<string | null>(null)

  const totalRrpp = rrpp.reduce((a, r) => a + r.convertidas, 0)
  const direct = Math.max(0, event.vendidas - totalRrpp)
  const rrppPct = event.vendidas ? Math.round((totalRrpp / Math.max(event.vendidas, totalRrpp)) * 100) : 0
  const totalComision = rrpp.reduce((a, r) => a + (r.ingresos * r.comisionPct) / 100, 0)

  const slug = (s: string) => s.replace('@', '').toLowerCase().replace(/[^a-z0-9]+/g, '')

  function create(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    const handle = form.handle.trim() ? (form.handle.startsWith('@') ? form.handle : '@' + form.handle) : '@' + slug(form.nombre)
    setRrpp((prev) => [
      ...prev,
      {
        id: `r-${Date.now()}`,
        nombre: form.nombre.trim(),
        handle,
        cupo: form.cupo,
        convertidas: 0,
        ingresos: 0,
        comisionPct: form.comision,
        activo: true,
      },
    ])
    setCreatedLink(`puerta.cl/e/viernes-13?rrpp=${slug(handle)}`)
  }

  function closeModal() {
    setOpen(false)
    setCreatedLink(null)
    setForm({ nombre: '', handle: '', cupo: 40, comision: 10 })
  }

  return (
    <div>
      <PageHeader eyebrow="Control de listas" title="Embajadores y RRPP">
        <Btn onClick={() => setOpen(true)}>
          <Link2 className="size-4" aria-hidden />
          Crear Link de RRPP
        </Btn>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel className="md:col-span-2">
          <PanelTitle title="Total convertidos por RRPP vs. venta directa" description={`${event.fecha} — ${event.nombre}`} />
          <div className="flex items-end gap-8">
            <div>
              <p className="text-3xl font-semibold tabular-nums text-gold">{totalRrpp}</p>
              <p className="text-xs text-muted-foreground">vía RRPP</p>
            </div>
            <div>
              <p className="text-3xl font-semibold tabular-nums">{direct}</p>
              <p className="text-xs text-muted-foreground">venta directa</p>
            </div>
          </div>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-secondary" aria-hidden>
            <div className="bg-gold" style={{ width: `${rrppPct}%` }} />
            <div className="bg-primary" style={{ width: `${100 - rrppPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{rrppPct}% RRPP</span>
            <span>{100 - rrppPct}% directa</span>
          </div>
        </Panel>
        <Panel>
          <p className="text-xs text-muted-foreground">Comisiones a pagar</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{formatCLPShort(totalComision)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Calculado automáticamente al cierre de puerta</p>
          <Btn variant="outline" className="mt-4 w-full" onClick={() => notify('Liquidación enviada a los RRPP por WhatsApp')}>
            Liquidar comisiones
          </Btn>
        </Panel>
      </div>

      <Panel className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <caption className="sr-only">Gestión de RRPP y promotores</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-5 py-3 font-medium">Nombre RRPP</th>
                <th scope="col" className="px-5 py-3 font-medium">Cupo asignado</th>
                <th scope="col" className="px-5 py-3 font-medium">Convertidas</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Ingresos generados</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Comisión a pagar</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rrpp.map((r) => {
                const pct = r.cupo ? (r.convertidas / r.cupo) * 100 : 0
                const link = `puerta.cl/e/viernes-13?rrpp=${slug(r.handle)}`
                return (
                  <tr key={r.id} className={cn('border-b border-border last:border-0', !r.activo && 'opacity-50')}>
                    <td className="px-5 py-3">
                      <p className="font-medium">{r.nombre}</p>
                      <p className="text-xs text-muted-foreground">{r.handle}</p>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{r.cupo}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-14 tabular-nums">
                          {r.convertidas}/{r.cupo}
                        </span>
                        <Progress value={pct} className="w-24" />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCLPShort(r.ingresos)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="tabular-nums text-gold">{formatCLPShort((r.ingresos * r.comisionPct) / 100)}</span>
                      <span className="ml-1 text-xs text-muted-foreground">({r.comisionPct}%)</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <IconBtn
                          label={`Copiar link de ${r.nombre}`}
                          onClick={() => {
                            navigator.clipboard?.writeText(link).catch(() => {})
                            notify(`Link copiado: ${link}`)
                          }}
                        >
                          <Copy className="size-4" aria-hidden />
                        </IconBtn>
                        <IconBtn
                          label={`Agregar 10 cupos a ${r.nombre}`}
                          onClick={() => setRrpp((prev) => prev.map((x) => (x.id === r.id ? { ...x, cupo: x.cupo + 10 } : x)))}
                        >
                          <Plus className="size-4" aria-hidden />
                        </IconBtn>
                        <IconBtn
                          label={r.activo ? `Pausar a ${r.nombre}` : `Activar a ${r.nombre}`}
                          onClick={() => setRrpp((prev) => prev.map((x) => (x.id === r.id ? { ...x, activo: !x.activo } : x)))}
                        >
                          {r.activo ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={open}
        onClose={closeModal}
        title={createdLink ? 'Link creado' : 'Nuevo link de RRPP'}
        description={createdLink ? 'Envíaselo a tu promotor. Cada venta se le atribuye automáticamente.' : 'Asigna un cupo y comisión a tu promotor.'}
      >
        {createdLink ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3">
              <Check className="size-5 text-success" aria-hidden />
              <p className="flex-1 truncate font-mono text-sm text-gold">{createdLink}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Btn
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(createdLink).catch(() => {})
                  notify('Link copiado al portapapeles')
                }}
              >
                <Copy className="size-4" aria-hidden /> Copiar
              </Btn>
              <Btn onClick={closeModal}>Listo</Btn>
            </div>
          </div>
        ) : (
          <form onSubmit={create} className="flex flex-col gap-4">
            <Field label="Nombre del RRPP" htmlFor="rrpp-nombre">
              <input
                id="rrpp-nombre"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Martina Riquelme"
                className={inputClass}
              />
            </Field>
            <Field label="Instagram (opcional)" htmlFor="rrpp-handle">
              <input
                id="rrpp-handle"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="@usuario"
                className={inputClass}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cupo asignado" htmlFor="rrpp-cupo">
                <input
                  id="rrpp-cupo"
                  type="number"
                  min={1}
                  value={form.cupo}
                  onChange={(e) => setForm({ ...form, cupo: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
              <Field label="Comisión %" htmlFor="rrpp-comision">
                <input
                  id="rrpp-comision"
                  type="number"
                  min={0}
                  max={50}
                  value={form.comision}
                  onChange={(e) => setForm({ ...form, comision: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Btn variant="ghost" onClick={closeModal}>
                Cancelar
              </Btn>
              <Btn type="submit">Generar link</Btn>
            </div>
          </form>
        )}
      </Modal>

      <p className="mt-4 text-xs text-muted-foreground">
        <Tag tone="neutral">Tip</Tag> <span className="ml-1">Los RRPP pausados no pueden sumar nuevas entradas a su lista.</span>
      </p>
    </div>
  )
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-gold"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}
