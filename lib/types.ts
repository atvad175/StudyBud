/** Uniform return shape for every server action used by the UI. */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export interface WeeklyFocusPoint {
  /** Local date key, `YYYY-MM-DD`. */
  date: string
  /** Short weekday label, e.g. `Mon`. */
  label: string
  minutes: number
}
