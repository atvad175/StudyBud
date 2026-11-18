import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ClosingCta() {
  return (
    <section className="border-t border-espresso/10">
      <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
          Start small, stay
        </p>
        <h2 className="display mt-4 text-[2.6rem] leading-[1.03] text-espresso sm:text-[3.4rem]">
          Start with <em className="italic text-brass-500">one subject.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-espresso-500">
          Free to start. No card. Your notes and progress stay yours, and your streak starts with
          the first habit you check off.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/login?mode=signup" className="paper-btn">
            Create your account
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href="/login" className="paper-btn-ghost">
            I already have one
          </Link>
        </div>
      </div>
    </section>
  )
}
