import assert from 'node:assert/strict'
import { test } from 'node:test'

import { currentStreak, formatMinutes, lastSevenDays, shiftDateKey, weekdayLabel } from '../lib/dates.ts'

test('shiftDateKey crosses month and year boundaries', () => {
  assert.equal(shiftDateKey('2026-03-01', -1), '2026-02-28')
  assert.equal(shiftDateKey('2026-01-01', -1), '2025-12-31')
  assert.equal(shiftDateKey('2024-02-28', 1), '2024-02-29')
  assert.equal(shiftDateKey('2026-12-31', 1), '2027-01-01')
})

test('currentStreak counts consecutive days ending today', () => {
  const today = '2026-11-22'
  assert.equal(currentStreak([], today), 0)
  assert.equal(currentStreak([today], today), 1)
  assert.equal(currentStreak(['2026-11-20', '2026-11-21', today], today), 3)
})

test('currentStreak keeps yesterday alive but ignores older gaps', () => {
  const today = '2026-11-22'
  assert.equal(currentStreak(['2026-11-20', '2026-11-21'], today), 2)
  assert.equal(currentStreak(['2026-11-19', '2026-11-20'], today), 0)
})

test('currentStreak ignores duplicate dates', () => {
  const today = '2026-11-22'
  assert.equal(currentStreak([today, today, '2026-11-21'], today), 2)
})

test('lastSevenDays returns seven oldest-to-newest cells', () => {
  const cells = lastSevenDays(['2026-11-22'], '2026-11-22')
  assert.equal(cells.length, 7)
  assert.equal(cells[0]?.date, '2026-11-16')
  assert.equal(cells[6]?.date, '2026-11-22')
  assert.equal(cells[6]?.isToday, true)
  assert.equal(cells[6]?.completed, true)
  assert.equal(cells[0]?.completed, false)
})

test('weekdayLabel maps a date key to its day name', () => {
  assert.equal(weekdayLabel('2026-11-22'), 'Sun')
  assert.equal(weekdayLabel('2026-11-23'), 'Mon')
})

test('formatMinutes renders hours and minutes', () => {
  assert.equal(formatMinutes(0), '0m')
  assert.equal(formatMinutes(-5), '0m')
  assert.equal(formatMinutes(45), '45m')
  assert.equal(formatMinutes(60), '1h')
  assert.equal(formatMinutes(125), '2h 5m')
})
