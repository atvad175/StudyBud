type ClassValue = string | number | null | false | undefined | ClassValue[]

/** Joins conditional class names without pulling in an extra dependency. */
export function cn(...values: ClassValue[]): string {
  const parts: string[] = []

  for (const value of values) {
    if (!value && value !== 0) continue
    if (Array.isArray(value)) {
      const nested = cn(...value)
      if (nested) parts.push(nested)
      continue
    }
    parts.push(String(value))
  }

  return parts.join(' ')
}
