const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Local (not UTC) `YYYY-MM-DD` key so a study day matches the student's day. */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Shifts a date key by whole days, immune to DST clock changes. */
export function shiftDateKey(key: string, offsetDays: number): string {
  const [yearPart, monthPart, dayPart] = key.split('-')
  const year = Number(yearPart)
  const month = Number(monthPart)
  const day = Number(dayPart)

  const base = new Date(Date.UTC(year, month - 1, day, 12))
  base.setUTCDate(base.getUTCDate() + offsetDays)

  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, '0')}-${String(
    base.getUTCDate(),
  ).padStart(2, '0')}`
}

/**
 * Consecutive completed days ending today. A streak stays alive until the end
 * of the day after the last completed day, so missing today does not erase it.
 */
export function currentStreak(dates: readonly string[], today: string = todayKey()): number {
  const completed = new Set(dates)

  let cursor = completed.has(today) ? today : shiftDateKey(today, -1)
  if (!completed.has(cursor)) return 0

  let streak = 0
  while (completed.has(cursor)) {
    streak += 1
    cursor = shiftDateKey(cursor, -1)
  }

  return streak
}

export interface DayCell {
  date: string
  label: string
  completed: boolean
  isToday: boolean
}

/** Oldest-to-newest cells for the trailing seven days, used by habit rows. */
export function lastSevenDays(
  dates: readonly string[],
  today: string = todayKey(),
): DayCell[] {
  const completed = new Set(dates)
  const cells: DayCell[] = []

  for (let offset = -6; offset <= 0; offset += 1) {
    const date = shiftDateKey(today, offset)
    cells.push({
      date,
      label: weekdayLabel(date).slice(0, 1),
      completed: completed.has(date),
      isToday: offset === 0,
    })
  }

  return cells
}

export function weekdayLabel(key: string): string {
  const [yearPart, monthPart, dayPart] = key.split('-')
  const date = new Date(Date.UTC(Number(yearPart), Number(monthPart) - 1, Number(dayPart), 12))
  return WEEKDAY_LABELS[date.getUTCDay()] ?? 'Mon'
}

/** `3h 25m` style summary for focus totals. */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0m'
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) return `${remainder}m`
  if (remainder === 0) return `${hours}h`
  return `${hours}h ${remainder}m`
}

/** Midnight local time as an ISO timestamp, for Supabase range filters. */
export function startOfLocalDayIso(daysAgo = 0): string {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - daysAgo)
  return start.toISOString()
}
