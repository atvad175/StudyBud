import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ArrowRight, Brain, Flame } from 'lucide-react'

import HeroProductPreview from '@/components/landing/HeroProductPreview'
import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'StudyBud — Build discipline. Excel in your studies.',
  description:
    'Study, focus, and build better routines in one place. StudyBud brings together study strategies, flashcards, exam practice, focus tools and small habits — so you know what to work on next and can see your progress over time.',
}

export default function LandingPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main>
        <section className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-14 text-center sm:px-8 sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(38rem_20rem_at_50%_0%,rgba(194,145,63,0.12),transparent_70%)]"
          />

          <h1 className="display mx-auto mt-3 max-w-4xl text-[2.9rem] leading-[1.02] text-espresso sm:text-[4.2rem] lg:text-[4.9rem]">
            Build discipline.
            <br />
            Excel in your studies.
            <br />
            <em className="italic text-brass-500">Design your dream life.</em>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-[15px] leading-relaxed text-espresso-500 sm:text-[16px]">
            Study, focus, and build better routines in one place. StudyBud brings together
            subject-specific study strategies, flashcards, exam practice, focus tools, and small
            habits — so you know what to work on next and can see your progress over time.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login?mode=signup" className="paper-btn">
              Start free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#bento" className="paper-btn-ghost">
              See what is inside
            </a>
          </div>

          <p className="mt-4 text-[12px] text-espresso-400">
            Free to start · No card · Your notes stay yours
          </p>

          <HeroProductPreview />
        </section>

        <section id="bento" className="border-t border-espresso/10">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="display text-[2.4rem] leading-[1.05] text-espresso sm:text-[3.1rem]">
                Everything in one calm dashboard
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-espresso-500">
                Each part of StudyBud works together: your habits, your focus timer, your schedule,
                your mood, and your subjects — so you spend less time juggling apps and more time
                learning.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-espresso/[0.09] bg-paper-50 p-7 shadow-paper lg:col-span-2">
                <div className="flex flex-col gap-7 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brass-400/30 bg-brass-400/10 text-brass-500">
                      <Brain className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                    </span>
                    <h3 className="display mt-5 text-[1.8rem] leading-tight text-espresso">
                      AI Life &amp; Skill Coach (Gemini)
                    </h3>
                    <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-espresso-500">
                      Chat with an AI that coaches you on discipline, habits, and skill mastery. It
                      asks the right questions so you cultivate a growth mindset and overcome your
                      limits.
                    </p>
                  </div>

                  <div className="w-full max-w-[19rem] space-y-2.5 rounded-xl border border-espresso/10 bg-paper p-4">
                    <p className="max-w-[92%] rounded-2xl rounded-bl-sm border border-brass-400/25 bg-brass-400/10 px-3.5 py-2.5 text-[12px] leading-relaxed text-espresso-700">
                      Can you say back the main idea of what you just read — without looking at the
                      book?
                    </p>
                    <p className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-espresso/10 bg-paper-200 px-3.5 py-2.5 text-[12px] leading-relaxed text-espresso-700">
                      It is about how speed changes over time, so acceleration is the rate of that
                      change.
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-espresso/[0.09] bg-paper-50 p-7 shadow-paper">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#B4593F]/25 bg-[#B4593F]/10 text-[#B4593F]">
                  <Flame className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                </span>
                <h3 className="display mt-5 text-[1.8rem] leading-tight text-espresso">
                  Tiny habits, clear streaks
                </h3>
                <p className="mt-3 text-[13.5px] leading-relaxed text-espresso-500">
                  Pick one small habit. Mark it done. Watch your streak grow. Small steps beat big
                  plans you never start.
                </p>

                <div className="mt-6 rounded-xl border border-espresso/10 bg-paper p-4">
                  <p className="display text-[2.4rem] leading-none text-[#B4593F]">
                    42<span className="ml-1 font-sans text-[0.9rem] font-medium">days</span>
                  </p>
                  <div className="mt-3 flex gap-1.5" aria-hidden>
                    {[1, 1, 1, 1, 1, 1, 0].map((value, index) => (
                      <span
                        key={index}
                        className={`h-3 w-3 rounded-sm ${
                          value ? 'bg-[#B4593F]' : 'bg-[#B4593F]/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-espresso/[0.09] bg-paper-50 p-7 shadow-paper lg:col-span-3">
                <div className="grid gap-6 sm:grid-cols-[1fr_1fr] sm:items-center">
                  <div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3F5F9B]/25 bg-[#3F5F9B]/10 text-[#3F5F9B]">
                      <Activity className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                    </span>
                    <h3 className="display mt-5 text-[1.8rem] leading-tight text-espresso">
                      Time and energy that fit you
                    </h3>
                    <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-espresso-500">
                      Note when you focus best. Plan harder work for those hours. StudyBud helps you
                      match tasks to your real energy — not a perfect schedule you cannot keep.
                    </p>
                  </div>

                  <svg
                    viewBox="0 0 200 100"
                    role="img"
                    aria-label="A focus curve rising and falling across the day"
                    className="w-full overflow-visible"
                  >
                    <path
                      d="M0,80 Q20,20 50,20 T100,50 T150,10 T200,80"
                      fill="none"
                      stroke="#3F5F9B"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="150" cy="10" r="5" fill="#3F5F9B" />
                  </svg>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-t border-espresso/10">
          <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
            <div className="rounded-2xl border border-espresso/10 bg-paper-50 p-7 shadow-paper sm:p-10">
              <h2 className="display text-[1.9rem] leading-tight text-espresso sm:text-[2.2rem]">
                Who is StudyBud for?
              </h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-espresso-500">
                StudyBud is for students and lifelong learners who want a calmer way to plan their
                work, practise what they learn, and build routines that last. Start with one task,
                use the tools that help, and grow your system as you go.
              </p>
              <p className="mt-3 text-[14.5px] leading-relaxed text-espresso-500">
                Create an account to save your profile and study progress across sessions. StudyBud
                currently uses email-and-password sign-in; Google and Microsoft sign-in are not
                available yet.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-espresso/10">
          <div className="mx-auto w-full max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28">
            <h2 className="display text-[2.6rem] leading-[1.03] text-espresso sm:text-[3.4rem]">
              Ready to design <em className="italic text-brass-500">your dream life?</em>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-espresso-500">
              Set up your profile in a few short steps. No credit card. Free while we are in beta.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/login?mode=signup" className="paper-btn">
                Create your free account
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href="/login" className="paper-btn-ghost">
                I already have one
              </Link>
            </div>

            <p className="mt-6 text-[12.5px] text-espresso-400">
              Use your email to join the community — no complex setup required.
            </p>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  )
}
