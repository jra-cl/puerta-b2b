'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TRAMOS } from '@/lib/mock-data'

export const TRAMO_COLORS: Record<(typeof TRAMOS)[number], string> = {
  'Early Bird': 'var(--chart-1)',
  'Preventa 1': 'var(--chart-2)',
  'Preventa 2': 'var(--chart-3)',
  Puerta: 'var(--chart-4)',
}

type Row = { label: string } & Record<(typeof TRAMOS)[number], number>

export function SalesChart({ data }: { data: Row[] }) {
  return (
    <div className="h-72 w-full" role="img" aria-label="Gráfico de ventas por hora de los últimos 7 días por tramo">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            {TRAMOS.map((t, i) => (
              <linearGradient key={t} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TRAMO_COLORS[t]} stopOpacity={0.55} />
                <stop offset="100%" stopColor={TRAMO_COLORS[t]} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="rgb(232 206 140 / 0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={3}
            tickFormatter={(v: string) => v.split(' ')[0]}
          />
          <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ stroke: 'var(--gold)', strokeOpacity: 0.3 }}
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--foreground)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--gold)', marginBottom: 4 }}
          />
          {TRAMOS.map((t, i) => (
            <Area
              key={t}
              type="monotone"
              dataKey={t}
              stackId="1"
              stroke={TRAMO_COLORS[t]}
              strokeWidth={1.5}
              fill={`url(#grad-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
