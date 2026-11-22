import assert from 'node:assert/strict'
import { test } from 'node:test'

import { readFlashcards, readModelName } from '../lib/flashcards.ts'

test('readFlashcards rejects values that are not decks', () => {
  assert.deepEqual(readFlashcards(null), [])
  assert.deepEqual(readFlashcards('text'), [])
  assert.deepEqual(readFlashcards([]), [])
  assert.deepEqual(readFlashcards({ cards: 'nope' }), [])
  assert.deepEqual(readFlashcards({ cards: [null, 42, { question: '', answer: 'x' }] }), [])
})

test('readFlashcards keeps valid cards and their ids', () => {
  const cards = readFlashcards({
    cards: [
      { id: 'abc', question: 'What is mitosis?', answer: 'Cell division producing two copies.' },
      { question: 'What is meiosis?', answer: 'Division producing gametes.' },
    ],
  })

  assert.equal(cards.length, 2)
  assert.equal(cards[0]?.id, 'abc')
  assert.equal(cards[1]?.question, 'What is meiosis?')
  // Cards without an id still get a stable, non-empty key.
  assert.ok(cards[1]?.id && cards[1].id.length > 0)
})

test('readModelName only returns strings', () => {
  assert.equal(readModelName({ model: 'gemini-flash-lite-latest' }), 'gemini-flash-lite-latest')
  assert.equal(readModelName({ model: 3 }), null)
  assert.equal(readModelName(null), null)
})
