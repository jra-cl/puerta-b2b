import { Check, X } from 'lucide-react'
import type { ScanEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function ScanLog({ scans, limit = 8 }: { scans: ScanEntry[]; limit?: number }) {
  return (
    <ul className="flex flex-col divide-y divide-border" aria-label="Últimos escaneos">
      {scans.slice(0, limit).map((s) => (
        <li key={s.id} className="flex items-center gap-3 py-2.5 animate-in fade-in">
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-full',
              s.estado === 'ok' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
            )}
          >
            {s.estado === 'ok' ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
            <span className="sr-only">{s.estado === 'ok' ? 'Aceptado' : 'Rechazado'}</span>
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{s.nombre}</p>
            <p className="truncate text-xs text-muted-foreground">
              {s.estado === 'ok' ? s.tipo : `Rechazado · ${s.motivo}`}
            </p>
          </div>
          <span className="font-mono text-xs text-muted-foreground">{s.hora}</span>
        </li>
      ))}
    </ul>
  )
}
