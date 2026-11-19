import Link from 'next/link'

const PAGES = [
  { href: '/features', label: 'Features' },
  { href: '/mission', label: 'Our Mission' },
  { href: '/about', label: 'Our Story' },
  { href: '/community', label: 'Community' },
]

export default function MarketingFooter({ note }: { note?: string }) {
  return (
    <footer className="border-t border-espresso/10">
      <div className="mx-auto w-full max-w-6xl px-5 py-9 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5" aria-label="StudyBud home">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-espresso text-[13px] font-semibold text-paper-50">
                S
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-espresso">StudyBud</span>
            </Link>
            <p className="mt-3 text-[12px] leading-relaxed text-espresso-400">
              {note ?? 'Life-design workspace for discipline, focus, and skill mastery.'}
            </p>
          </div>

          <nav aria-label="Pages" className="flex flex-wrap gap-x-6 gap-y-2">
            {PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="text-[12.5px] text-espresso-500 transition-colors hover:text-espresso"
              >
                {page.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 text-[12.5px]">
            <Link href="/login" className="text-espresso-500 transition-colors hover:text-espresso">
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              className="rounded-full bg-espresso px-3.5 py-1.5 font-medium text-paper-50 transition-colors hover:bg-espresso-800"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-espresso/10 pt-5 text-[11.5px] text-espresso-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} StudyBud</span>
          <span>Built for students who are done guessing.</span>
        </div>
      </div>
    </footer>
  )
}
