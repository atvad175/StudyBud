import { randomUUID } from 'node:crypto'

import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

import type { Flashcard } from '@/types/database'

/**
 * Server-only flashcard generation. The Gemini key never reaches the browser:
 * this module is imported exclusively from Server Actions.
 */

const MODEL = 'gemini-flash-lite-latest'

const flashcardSchema = z.object({
  question: z.string().trim().min(3, 'Question is too short.'),
  answer: z.string().trim().min(1, 'Answer is empty.'),
})

const responseSchema = z.object({
  cards: z.array(flashcardSchema).min(1).max(20),
})

export class AIUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIUnavailableError'
  }
}

export interface GeneratedDeck {
  cards: Flashcard[]
  model: string
}

const SYSTEM_INSTRUCTION = [
  'You are StudyBud, an active-recall tutor for secondary school students.',
  'Turn the supplied notes into concise exam-ready flashcards.',
  'Rules:',
  '- Each card tests exactly one idea.',
  '- Questions must be answerable from the notes alone, never yes/no.',
  '- Answers are 1-2 sentences, concrete and specific.',
  '- Prefer definitions, mechanisms, formulas, dates and cause/effect.',
  '- Never invent facts that are not in the notes.',
  '- Return 6 to 12 cards.',
].join('\n')

function buildPrompt(title: string, content: string): string {
  return [
    `Deck title: ${title}`,
    '',
    'Student notes:',
    '"""',
    content,
    '"""',
    '',
    'Respond with JSON only, in exactly this shape:',
    '{"cards":[{"question":"...","answer":"..."}]}',
  ].join('\n')
}

/** Gemini occasionally wraps JSON in prose or fences; recover the object. */
function extractJsonObject(text: string): string {
  const trimmed = text.trim()

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed

  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new AIUnavailableError('The AI response was not valid JSON. Try generating again.')
  }

  return trimmed.slice(start, end + 1)
}

export async function generateFlashcards(input: {
  title: string
  content: string
}): Promise<GeneratedDeck> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new AIUnavailableError(
      'AI generation is not configured yet. Add GEMINI_API_KEY to the server environment (never a NEXT_PUBLIC variable) and restart the app.',
    )
  }

  const client = new GoogleGenAI({ apiKey })

  let rawText: string
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: buildPrompt(input.title, input.content),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    })
    rawText = response.text ?? ''
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown error'
    console.error('[studybud] Gemini generation failed:', detail)
    throw new AIUnavailableError(
      'The AI tutor could not be reached right now. Your notes were not saved — please try again in a moment.',
    )
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(rawText))
  } catch (error) {
    if (error instanceof AIUnavailableError) throw error
    throw new AIUnavailableError('The AI response could not be read. Try generating again.')
  }

  const validated = responseSchema.safeParse(parsed)
  if (!validated.success) {
    throw new AIUnavailableError(
      'The AI returned cards in an unexpected format. Try generating again with slightly more detail in your notes.',
    )
  }

  return {
    model: MODEL,
    cards: validated.data.cards.map((card) => ({
      id: randomUUID(),
      question: card.question,
      answer: card.answer,
    })),
  }
}
