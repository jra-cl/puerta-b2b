'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-5', className)}>{children}</section>
  )
}

export function PanelTitle({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold/80">{eyebrow}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-balance text-foreground md:text-4xl">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

type BtnVariant = 'primary' | 'outline' | 'ghost' | 'success'

export function Btn({
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-[#a5223a]',
        variant === 'outline' && 'border border-border bg-transparent text-foreground hover:border-gold/50 hover:bg-accent',
        variant === 'ghost' && 'text-muted-foreground hover:bg-accent hover:text-foreground',
        variant === 'success' && 'bg-success text-[#0b0711] hover:bg-[#52d398]',
        className,
      )}
    />
  )
}

export function Tag({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'neutral' | 'gold' | 'success' | 'danger' | 'wine'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tone === 'neutral' && 'border-border bg-secondary text-muted-foreground',
        tone === 'gold' && 'border-gold/30 bg-gold/10 text-gold',
        tone === 'success' && 'border-success/30 bg-success/10 text-success',
        tone === 'danger' && 'border-destructive/30 bg-destructive/10 text-destructive',
        tone === 'wine' && 'border-primary/50 bg-primary/20 text-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Progress({ value, className }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
    >
      <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 id="modal-title" className="font-display text-2xl font-semibold">
                {title}
              </h2>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-5" aria-hidden />
              <span className="sr-only">Cerrar</span>
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
