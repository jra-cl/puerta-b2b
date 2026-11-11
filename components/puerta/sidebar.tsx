'use client'

import { Activity, CalendarPlus, ScanLine, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'inicio' | 'eventos' | 'rrpp' | 'escaner' | 'config'

export const NAV_ITEMS: { id: TabId; label: string; short: string; icon: typeof Activity }[] = [
  { id: 'inicio', label: 'Métricas en Vivo', short: 'Inicio', icon: Activity },
  { id: 'eventos', label: 'Eventos & Ficha IA', short: 'Eventos', icon: CalendarPlus },
  { id: 'rrpp', label: 'Listas y RRPP', short: 'RRPP', icon: Users },
  { id: 'escaner', label: 'Escáner de Puerta', short: 'Escáner', icon: ScanLine },
  { id: 'config', label: 'Configuración del Local', short: 'Local', icon: Settings },
]

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('font-display text-2xl font-bold tracking-[0.25em] text-gold', className)}>
      PUERTA
    </span>
  )
}

export function Sidebar({
  active,
  onChange,
  liveCount,
}: {
  active: TabId
  onChange: (tab: TabId) => void
  liveCount: number
}) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-20 items-center px-6">
          <Logo />
        </div>
        <nav aria-label="Navegación principal" className="flex-1 px-3">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onChange(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-accent text-foreground shadow-[inset_2px_0_0_0_var(--gold)]'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('size-4', isActive ? 'text-gold' : '')} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    <span className="font-mono text-[10px] text-muted-foreground/60">{i + 1}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="m-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Puerta abierta
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{liveCount}</p>
          <p className="text-xs text-muted-foreground">personas dentro ahora</p>
        </div>
        <div className="flex items-center gap-3 border-t border-border px-6 py-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-semibold">
            CS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Club Subterráneo</p>
            <p className="truncate text-xs text-muted-foreground">Admin · Bellavista</p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Logo className="text-xl" />
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-success" aria-hidden />
            {liveCount} dentro
          </span>
        </div>
        <nav aria-label="Navegación principal" className="overflow-x-auto px-2 pb-2">
          <ul className="flex gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = active === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onChange(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm',
                      isActive ? 'bg-accent text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <Icon className={cn('size-4', isActive && 'text-gold')} aria-hidden />
                    {item.short}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </header>
    </>
  )
}
