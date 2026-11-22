import type { Metadata, Viewport } from 'next'
import { Instrument_Serif } from 'next/font/google'

import './globals.css'

/**
 * Editorial display face. Only the landing/marketing surfaces use it — the
 * dashboard keeps the neutral UI sans so dense data stays legible.
 */
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: {
    default: 'StudyBud — Build discipline. Excel in your studies.',
    template: '%s · StudyBud',
  },
  description:
    'StudyBud keeps your habits, focus blocks, streaks and recall decks in one place — and turns your class notes into flashcards you can test yourself with.',
  applicationName: 'StudyBud',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://studybud-five-puce.vercel.app',
  ),
  openGraph: {
    type: 'website',
    siteName: 'StudyBud',
    title: 'StudyBud — Build discipline. Excel in your studies.',
    description:
      'A focus timer that logs every block, habits with honest streaks, and flashcards generated from your own notes — in one calm dashboard.',
    url: '/',
  },
  twitter: {
    card: 'summary',
    title: 'StudyBud — Build discipline. Excel in your studies.',
    description:
      'A focus timer that logs every block, habits with honest streaks, and flashcards generated from your own notes.',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090B',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${instrumentSerif.variable}`}>
      <body className="min-h-dvh bg-canvas font-sans text-ink-100 antialiased selection:bg-neon-indigo/30">
        {children}
      </body>
    </html>
  )
}
