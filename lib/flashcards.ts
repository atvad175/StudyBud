import type { Flashcard, Json } from '@/types/database'

/**
 * Safely reads cards out of `study_materials.ai_summary`. The column is `jsonb`
 * and therefore untrusted; nothing is rendered until it passes these checks.
 */
export function readFlashcards(summary: Json | null): Flashcard[] {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return []

  const cards = (summary as { cards?: unknown }).cards
  if (!Array.isArray(cards)) return []

  return cards.flatMap((card) => {
    if (!card || typeof card !== 'object' || Array.isArray(card)) return []

    const record = card as Record<string, unknown>
    const { id, question, answer } = record

    if (typeof question !== 'string' || typeof answer !== 'string') return []
    if (!question.trim() || !answer.trim()) return []

    return [
      {
        id: typeof id === 'string' && id.length > 0 ? id : question.slice(0, 24),
        question,
        answer,
      },
    ]
  })
}

export function readModelName(summary: Json | null): string | null {
  if (!summary || typeof summary !== 'object' || Array.isArray(summary)) return null
  const model = (summary as { model?: unknown }).model
  return typeof model === 'string' ? model : null
}
