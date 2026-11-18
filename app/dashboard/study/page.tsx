import type { Metadata } from 'next'

import PageHeader from '@/components/dashboard/PageHeader'
import FlashcardStudio from '@/components/study/FlashcardStudio'
import { requireUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Study',
}

export default async function StudyPage() {
  const { supabase } = await requireUser()

  const { data: materials, error } = await supabase
    .from('study_materials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div>
      <PageHeader
        eyebrow="Pillar 03 · Active recall"
        title="AI recall studio"
        description="Paste your notes. StudyBud's tutor turns them into flashcards you can actually test yourself with — then saves the deck to your account."
      />

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-neon-rose/30 bg-neon-rose/10 px-4 py-3 text-sm text-rose-200"
        >
          Could not load your saved decks: {error.message}
        </p>
      )}

      <FlashcardStudio materials={materials ?? []} />
    </div>
  )
}
