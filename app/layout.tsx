import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bodoni_Moda } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  variable: '--font-display-serif',
  weight: ['500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'PUERTA — Panel B2B para clubes y productoras',
  description:
    'Gestión nocturna para clubes, discotecas y productoras en Santiago: ventas en vivo, fichas de evento con IA, listas RRPP y escáner de puerta.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0B0711',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable} ${bodoni.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
