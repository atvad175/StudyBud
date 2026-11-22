import { redirect } from 'next/navigation'

/**
 * `/landing` was an older marketing URL that duplicated `/`. It stays as a
 * redirect so any link people already shared keeps working without a second
 * copy of the page to maintain.
 */
export default function LandingRoute() {
  redirect('/')
}
