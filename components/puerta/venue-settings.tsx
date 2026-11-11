'use client'

import { useState } from 'react'
import { Btn, Field, PageHeader, Panel, PanelTitle, inputClass } from './primitives'
import { cn } from '@/lib/utils'

const TOGGLES = [
  { id: 'rut', label: 'Validar RUT con cédula en puerta', desc: 'El guardia ve RUT y edad en cada escaneo.' },
  { id: 'reingreso', label: 'Permitir reingreso', desc: 'Un QR puede escanearse dos veces si sale y vuelve.' },
  { id: 'wa', label: 'Enviar entradas por WhatsApp', desc: 'Además del correo, el QR llega por WhatsApp.' },
  { id: 'cierre', label: 'Cerrar listas automáticamente', desc: 'Las listas se bloquean a la hora límite de la ficha.' },
] as const

export function VenueSettings({ notify }: { notify: (msg: string) => void }) {
  const [toggles, setToggles] = useState<Record<string, boolean>>({ rut: true, reingreso: false, wa: true, cierre: true })

  return (
    <div>
      <PageHeader eyebrow="Configuración" title="Tu local" />
      <form
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          notify('Configuración guardada')
        }}
      >
        <Panel className="flex flex-col gap-4">
          <PanelTitle title="Datos del local" />
          <Field label="Nombre comercial" htmlFor="v-nombre">
            <input id="v-nombre" defaultValue="Club Subterráneo" className={inputClass} />
          </Field>
          <Field label="Dirección" htmlFor="v-dir">
            <input id="v-dir" defaultValue="Pío Nono 127, Bellavista, Providencia" className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Aforo máximo autorizado" htmlFor="v-aforo">
              <input id="v-aforo" type="number" defaultValue={600} className={inputClass} />
            </Field>
            <Field label="RUT empresa" htmlFor="v-rut">
              <input id="v-rut" defaultValue="76.543.210-9" className={inputClass} />
            </Field>
          </div>
          <Field label="Cuenta para pagos" htmlFor="v-banco" hint="Las ventas se depositan a las 48 h hábiles tras el evento.">
            <input id="v-banco" defaultValue="Banco de Chile · Cta. Cte. ****4821" className={inputClass} />
          </Field>
        </Panel>

        <Panel className="flex flex-col">
          <PanelTitle title="Reglas de puerta" />
          <ul className="flex flex-col divide-y divide-border">
            {TOGGLES.map((t) => {
              const on = toggles[t.id]
              return (
                <li key={t.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p id={`t-${t.id}`} className="text-sm">
                      {t.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-labelledby={`t-${t.id}`}
                    onClick={() => setToggles({ ...toggles, [t.id]: !on })}
                    className={cn(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                      on ? 'bg-gold' : 'bg-secondary',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 size-5 rounded-full bg-background transition-all',
                        on ? 'left-[22px]' : 'left-0.5',
                      )}
                    />
                  </button>
                </li>
              )
            })}
          </ul>
          <Btn type="submit" className="mt-auto self-end">
            Guardar cambios
          </Btn>
        </Panel>
      </form>
    </div>
  )
}
