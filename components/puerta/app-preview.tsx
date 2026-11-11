/* eslint-disable @next/next/no-img-element -- cover may be a local object URL from the uploaded flyer */
import { CheckCircle2, AlertTriangle, Home, User, Wallet } from 'lucide-react'
import { formatCLPShort, type Ficha } from '@/lib/ficha'

function shortDay(fecha: string) {
  const [day = '', num = ''] = fecha.trim().split(/\s+/)
  return `${day.slice(0, 3)} ${num}`.trim().toUpperCase()
}

function edadLabel(f: Ficha) {
  const { minMujeres, minHombres } = f.edad
  return minMujeres === minHombres ? `+${minMujeres}` : `+${minMujeres} mujeres, +${minHombres} hombres`
}

function listaLabel(f: Ficha) {
  if (f.listas.cuposMaximos === 0) return 'sin lista'
  return f.listas.gratis ? `gratis hasta las ${f.listas.horaLimite}` : `hasta las ${f.listas.horaLimite}`
}

export function AppPreview({
  ficha,
  venue,
  cover,
  valid,
}: {
  ficha: Ficha
  venue: string
  cover?: string
  valid: boolean
}) {
  const desde = ficha.tramos.length ? Math.min(...ficha.tramos.map((t) => t.precio)) : 0
  const info = [
    ['Edad mínima', edadLabel(ficha)],
    ['Dress code', ficha.dressCode.join(', ').toLowerCase() || '—'],
    ['Música', ficha.genero.toLowerCase()],
    ['Lista', listaLabel(ficha)],
  ]

  return (
    <figure className="flex flex-col items-center gap-3">
      <div className="w-full max-w-[340px] rounded-[2.75rem] bg-gradient-to-b from-[#e8ce8c] via-[#8a6a35] to-[#e8ce8c] p-[3px] shadow-[0_0_60px_-10px_rgb(142_27_46/0.6)]">
        <div className="overflow-hidden rounded-[2.6rem] bg-[#0d0810]">
          <div className="flex items-center justify-between px-7 pt-4 text-[11px] font-semibold text-foreground">
            <span>9:41</span>
            <span className="h-5 w-20 rounded-full bg-black" aria-hidden />
            <span aria-hidden>5G</span>
          </div>

          <div className="px-4 pb-4 pt-3">
            <p className="text-center font-display text-3xl font-bold tracking-[0.12em] text-gold">PUERTA</p>
            <p className="mt-3 font-display text-lg font-semibold uppercase tracking-wide text-foreground">
              Las fiestas de esta semana
            </p>

            <article className="mt-3 rounded-2xl border border-gold/35 bg-[#150d18] p-3">
              <div className="flex gap-3">
                <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#6e3cbe] to-primary">
                  {cover && <img src={cover} alt="" className="size-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-block rounded bg-primary px-1.5 py-0.5 font-display text-[11px] font-semibold tracking-wide text-primary-foreground">
                    {shortDay(ficha.fecha)}
                  </span>
                  <h3 className="mt-1 truncate font-display text-base font-semibold uppercase leading-tight tracking-wide text-gold">
                    {ficha.nombre || 'Sin nombre'}
                  </h3>
                  <p className="truncate text-[11px] text-muted-foreground">{venue}</p>
                  {valid ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-gold/60 px-2 py-0.5 text-[10px] text-gold">
                      <CheckCircle2 className="size-3" aria-hidden />
                      Confirmado por el club
                    </span>
                  ) : (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-destructive/50 px-2 py-0.5 text-[10px] text-destructive">
                      <AlertTriangle className="size-3" aria-hidden />
                      Ficha incompleta
                    </span>
                  )}
                </div>
              </div>

              <dl className="mt-3 grid grid-cols-4 divide-x divide-gold/15 border-y border-gold/15 py-2">
                {info.map(([k, v]) => (
                  <div key={k} className="min-w-0 px-1.5 first:pl-0 last:pr-0">
                    <dt className="text-[9px] text-foreground/90">{k}</dt>
                    <dd className="text-[9px] leading-snug text-muted-foreground">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 flex items-center gap-2">
                <p className="flex-1 text-[11px] text-muted-foreground">
                  Desde <span className="text-sm font-semibold text-foreground">{formatCLPShort(desde)}</span>
                </p>
                <span className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground">
                  Comprar
                </span>
                <span className="rounded-full border border-gold/60 px-3 py-1.5 text-[11px] font-semibold text-gold">
                  Anotarme
                </span>
              </div>
            </article>

            <div className="mt-3 h-16 rounded-2xl border border-gold/10 bg-[#150d18]/60" aria-hidden />
          </div>

          <nav aria-hidden className="flex justify-around border-t border-gold/10 py-3 text-muted-foreground">
            <Home className="size-4 text-gold" />
            <Wallet className="size-4" />
            <User className="size-4" />
          </nav>
        </div>
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        Así verán tus clientes el evento en la app PUERTA
      </figcaption>
    </figure>
  )
}
