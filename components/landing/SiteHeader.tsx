import Link from 'next/link'

const LINKS = [
  { href: '/features', label: 'Features' },
  { href: '/mission', label: 'Our Mission' },
  { href: '/about', label: 'Our Story' },
  { href: '/community', label: 'Community' },
]

export default function SiteHeader() {
  return (
    <header className="relative z-20 border-b border-espresso/10">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="StudyBud home">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-[13px] font-semibold text-paper-50 transition-transform group-hover:-rotate-6">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-espresso">StudyBud</span>
        </Link>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium text-espresso-500 transition-colors hover:text-espresso"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-3 py-2 text-[13px] font-medium text-espresso-700 transition-colors hover:text-espresso sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-full bg-espresso px-4 py-2 text-[13px] font-medium text-paper-50 transition-colors hover:bg-espresso-800"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}
