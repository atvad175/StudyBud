import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'StudyBud was built by Atharv Mittal so that staying organised is never the hardest part of studying.',
}

const PHILOSOPHY = [
  {
    emoji: '🎯',
    title: 'Clarity Over Clutter',
    body: 'Your study space should be as clean as your mind needs to be. No useless features, just what works.',
  },
  {
    emoji: '🌱',
    title: 'Growth is Atomic',
    body: 'Big dreams are built on tiny actions. StudyBud helps you master the small steps that lead to an extraordinary life.',
  },
]

export default function AboutPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <article className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">
            Our story
          </p>
          <h1 className="display mt-4 text-[2.9rem] leading-[1.03] text-espresso sm:text-[4rem]">
            Our Story
          </h1>

          <div className="mt-8 rounded-2xl border border-espresso/10 bg-paper-50 p-7 shadow-paper sm:p-9">
            <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <div className="mx-auto w-full max-w-[14rem] overflow-hidden rounded-full border-2 border-brass-400/40 bg-brass-400/10">
                <Image
                  src="/atharv_pic.jpg"
                  alt="Atharv Mittal"
                  width={320}
                  height={320}
                  className="aspect-square w-full object-cover object-[center_25%]"
                />
              </div>

              <div>
                <h2 className="display text-[1.75rem] leading-tight text-espresso">
                  Hi! I&apos;m Atharv Mittal, the creator of StudyBud.
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-espresso-700">
                  I built this app because I believe that staying organized shouldn&apos;t be the
                  hardest part of studying. As someone who loves exploring new things and skills, I
                  wanted to create a clean, efficient space where students can focus on their goals
                  and build their dream life without the clutter of traditional apps.
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-espresso-500">
                  When I&apos;m not working or debugging StudyBud or building new features,
                  you&apos;ll probably find me playing pickleball, reading, playing the guitar, and
                  exploring and learning new things.
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-espresso-500">
                  StudyBud is a passion project of mine, and I&apos;m always looking for ways to
                  improve it. Thanks for being part of the journey!
                </p>
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="display text-center text-[2.1rem] leading-tight text-espresso sm:text-[2.6rem]">
              The StudyBud Philosophy
            </h2>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {PHILOSOPHY.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-espresso/[0.09] bg-paper-50 p-8 text-center shadow-paper"
                >
                  <span
                    aria-hidden
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-400/12 text-[1.4rem]"
                  >
                    {card.emoji}
                  </span>
                  <h3 className="display mt-5 text-[1.55rem] leading-tight text-espresso">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-espresso-500">
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 text-center">
            <Link href="/login?mode=signup" className="paper-btn">
              Start free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        </article>
      </main>

      <MarketingFooter note="StudyBud — life-design workspace for discipline, focus, and skill mastery." />
    </div>
  )
}
