import type { Metadata } from 'next'

import LandingPage from '@/app/page'

export const metadata: Metadata = {
  title: 'StudyBud — Build discipline. Excel in your studies.',
  description:
    'Study, focus, and build better routines in one place. StudyBud brings together study strategies, flashcards, exam practice, focus tools and small habits.',
}

/**
 * Canonical marketing URL. The components live once in `app/page.tsx` so `/`
 * and `/landing` can never drift apart.
 */
export default function LandingRoute() {
  return <LandingPage />
}
