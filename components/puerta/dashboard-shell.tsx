'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Sidebar, type TabId } from './sidebar'
import { Overview } from './overview'
import { EventBuilder } from './event-builder'
import { RrppControl } from './rrpp-control'
import { DoorScanner } from './door-scanner'
import { VenueSettings } from './venue-settings'
import {
  EVENTS,
  INITIAL_RRPP,
  INITIAL_SCANS,
  LIVE_NAMES,
  type EventItem,
  type Rrpp,
  type ScanEntry,
} from '@/lib/mock-data'

function nowHHMM() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function DashboardShell() {
  const [tab, setTab] = useState<TabId>('inicio')
  const [events, setEvents] = useState<EventItem[]>(EVENTS)
  const [activeEventId, setActiveEventId] = useState(EVENTS[0].id)
  const [scans, setScans] = useState<ScanEntry[]>(INITIAL_SCANS)
  const [rrpp, setRrpp] = useState<Rrpp[]>(INITIAL_RRPP)
  const [toast, setToast] = useState<string | null>(null)

  const activeEvent = events.find((e) => e.id === activeEventId) ?? events[0]
  const liveEventId = EVENTS[0].id
  const liveCount = events.find((e) => e.id === liveEventId)?.escaneados ?? 0

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      const [nombre, tipo] = LIVE_NAMES[i % LIVE_NAMES.length]
      i++
      setScans((prev) =>
        [{ id: `live-${Date.now()}`, nombre, tipo, hora: nowHHMM(), estado: 'ok' as const }, ...prev].slice(0, 30),
      )
      setEvents((prev) =>
        prev.map((e) => (e.id === liveEventId ? { ...e, escaneados: Math.min(e.vendidas, e.escaneados + 1) } : e)),
      )
    }, 7000)
    return () => clearInterval(timer)
  }, [liveEventId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  function registerScan(entry: Omit<ScanEntry, 'id' | 'hora'>) {
    setScans((prev) => [{ ...entry, id: `door-${Date.now()}`, hora: nowHHMM() }, ...prev].slice(0, 30))
    if (entry.estado === 'ok') {
      setEvents((prev) =>
        prev.map((e) => (e.id === liveEventId ? { ...e, escaneados: Math.min(e.vendidas, e.escaneados + 1) } : e)),
      )
    }
  }

  function publishEvent(event: EventItem) {
    setEvents((prev) => [...prev, event])
    setActiveEventId(event.id)
  }

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar active={tab} onChange={setTab} liveCount={liveCount} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {tab === 'inicio' && (
            <Overview
              events={events}
              event={activeEvent}
              onSelectEvent={setActiveEventId}
              onCreateEvent={() => setTab('eventos')}
              scans={scans}
            />
          )}
          {tab === 'eventos' && (
            <EventBuilder
              onPublish={publishEvent}
              onGoToMetrics={() => setTab('inicio')}
              notify={setToast}
            />
          )}
          {tab === 'rrpp' && (
            <RrppControl rrpp={rrpp} setRrpp={setRrpp} event={activeEvent} notify={setToast} />
          )}
          {tab === 'escaner' && (
            <DoorScanner event={events.find((e) => e.id === liveEventId)!} onScan={registerScan} scans={scans} />
          )}
          {tab === 'config' && <VenueSettings notify={setToast} />}
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-success/30 bg-card px-4 py-3 text-sm shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
