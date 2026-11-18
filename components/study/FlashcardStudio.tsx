'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react'

import { generateAIFlashcards } from '@/app/actions/studybud'
import GlassCard from '@/components/ui/GlassCard'
import { readFlashcards, readModelName } from '@/lib/flashcards'
import { cn } from '@/lib/utils'
import type { Flashcard, StudyMaterialRow } from '@/types/database'

interface FlashcardStudioProps {
  materials: StudyMaterialRow[]
}

export default function FlashcardStudio({ materials }: FlashcardStudioProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cards, setCards] = useState<Flashcard[]>([])
  const [deckTitle, setDeckTitle] = useState<string | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleCard(cardId: string) {
    setRevealed((current) => {
      const next = new Set(current)
      if (next.has(cardId)) next.delete(cardId)
      else next.add(cardId)
      return next
    })
  }

  function revealAll() {
    setRevealed(new Set(cards.map((card) => card.id)))
  }

  function reviewSaved(material: StudyMaterialRow) {
    const saved = readFlashcards(material.ai_summary)
    if (saved.length === 0) {
      setError('That deck has no readable cards stored.')
      return
    }

    setError(null)
    setCards(saved)
    setDeckTitle(material.title)
    setModel(readModelName(material.ai_summary))
    setRevealed(new Set())
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await generateAIFlashcards({ title, content })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setCards(result.data.cards)
      setDeckTitle(title.trim())
      setModel(result.data.model)
      setRevealed(new Set())
      setTitle('')
      setContent('')
      router.refresh()
    })
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <div className="space-y-4">
        <GlassCard glow="emerald" specular>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="deck-title" className="field-label">
                Deck title
              </label>
              <input
                id="deck-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Cell division — mitosis vs meiosis"
                maxLength={160}
                className="glass-input"
                disabled={isPending}
                required
              />
            </div>

            <div>
              <label htmlFor="deck-notes" className="field-label">
                Your notes
              </label>
              <textarea
                id="deck-notes"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste class notes, a textbook summary or your own explanation here…"
                rows={9}
                maxLength={20000}
                className="glass-input resize-y leading-relaxed"
                disabled={isPending}
                required
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-500">
                <span>Minimum 80 characters so the AI has real material.</span>
                <span className="font-mono">{content.trim().length}/20000</span>
              </div>
            </div>

            <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Wand2 className="h-4 w-4" aria-hidden />
              )}
              {isPending ? 'Generating cards…' : 'Generate flashcards'}
            </button>

            {error && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-neon-rose/30 bg-neon-rose/10 px-3 py-2 text-xs leading-relaxed text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            )}
          </form>
        </GlassCard>

        {cards.length > 0 && (
          <section aria-live="polite" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div>
                <h2 className="display text-lg text-white">
                  {deckTitle ?? 'Generated deck'}
                  <span className="ml-2 font-sans text-[11px] font-normal tracking-normal text-ink-500">
                    {cards.length} cards
                  </span>
                </h2>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  {model ? `Generated with ${model}` : 'Saved to your account'}
                </p>
              </div>
              <button type="button" onClick={revealAll} className="btn-ghost px-3 py-1.5 text-xs">
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Reveal all
              </button>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {cards.map((card, index) => {
                const isRevealed = revealed.has(card.id)
                return (
                  <li key={card.id}>
                    <GlassCard
                      as="div"
                      interactive
                      glow={isRevealed ? 'emerald' : 'indigo'}
                      className="flex h-full flex-col p-4 hover:!translate-y-0"
                      specular
                    >
                      <button
                        type="button"
                        onClick={() => toggleCard(card.id)}
                        aria-expanded={isRevealed}
                        className="flex flex-1 flex-col text-left"
                      >
                        <span className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-500">
                          Card {index + 1}
                          {isRevealed ? (
                            <EyeOff className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </span>
                        <span className="mt-2 text-sm font-medium leading-relaxed text-ink-100">
                          {card.question}
                        </span>
                        <span
                          className={cn(
                            'mt-3 border-t border-ink-600/40 pt-3 text-xs leading-relaxed transition-colors',
                            isRevealed ? 'text-neon-emerald' : 'select-none text-ink-600',
                          )}
                        >
                          {isRevealed ? card.answer : 'Tap to reveal the answer'}
                        </span>
                      </button>
                    </GlassCard>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <GlassCard>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-neon-indigo" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Saved decks</h2>
          </div>

          {materials.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-ink-400">
              Nothing saved yet. Your first generated deck will appear here, tied to your account
              only.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {materials.map((material) => {
                const count = readFlashcards(material.ai_summary).length
                return (
                  <li key={material.id}>
                    <button
                      type="button"
                      onClick={() => reviewSaved(material)}
                      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-ink-600/40 bg-ink-900/40 px-3 py-2.5 text-left transition-colors hover:border-neon-indigo/40 hover:bg-ink-800/60"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-ink-200">{material.title}</span>
                        <span className="mt-0.5 block text-[11px] text-ink-500">
                          {count} card{count === 1 ? '' : 's'} ·{' '}
                          {new Date(material.created_at).toLocaleDateString()}
                        </span>
                      </span>
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-ink-600 transition-colors group-hover:text-neon-indigo"
                        aria-hidden
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard glow="indigo">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-neon-emerald" aria-hidden />
            <h2 className="text-sm font-semibold text-white">Use them properly</h2>
          </div>
          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink-400">
            <li className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-emerald" aria-hidden />
              Answer out loud before revealing — recognition is not recall.
            </li>
            <li className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-emerald" aria-hidden />
              Mark the cards you miss and re-run them first tomorrow.
            </li>
            <li className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon-emerald" aria-hidden />
              Rewrite any card that feels vague in your own words — that is the real revision.
            </li>
          </ul>
        </GlassCard>
      </aside>
    </div>
  )
}
