import type { Metadata } from 'next'

import LandingPage from '@/app/page'

export const metadata: Metadata = {
  title: 'StudyBud — Build discipline. Excel in your studies.',
  description:
    'StudyBud turns your notes into recall cards and keeps your habits, focus blocks and streaks on the record — in one quiet workspace.',
}

/**
 * Canonical marketing URL. The components live once in `app/page.tsx` so `/`
 * and `/landing` can never drift apart.
 */
export default function LandingRoute() {
  return <LandingPage />
}
