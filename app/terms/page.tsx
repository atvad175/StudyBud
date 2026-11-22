import type { Metadata } from 'next'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The rules for using StudyBud, what we promise, and what we do not.',
}

const SECTIONS = [
  {
    title: 'The service',
    body: [
      'StudyBud is a study workspace: a focus timer, habits with streaks, and flashcards generated from notes you supply. It is currently in beta and free to use.',
      'Beta means it changes. Features may be added, altered or removed, and short interruptions can happen. Anything that would delete your recorded work will be announced before it happens.',
    ],
  },
  {
    title: 'Your account',
    body: [
      'You need a working email address and a password of at least eight characters. Keep the password to yourself — anything done through your account is treated as done by you.',
      'One account per person. Do not share an account, and do not create accounts to abuse the AI generation limits.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'Use StudyBud for your own studying. Do not attempt to access another student’s records, probe or overload the service, or paste material you have no right to use.',
      'Notes you paste are sent to Google’s Gemini API to generate cards. Do not paste confidential material you are not allowed to share with a third-party processor.',
    ],
  },
  {
    title: 'AI output is a study aid, not a source of truth',
    body: [
      'Flashcards are generated automatically from the notes you provide. They can be incomplete or wrong. Check anything that matters against your textbook, teacher or syllabus before relying on it.',
      'StudyBud does not guarantee any grade, mark or outcome.',
    ],
  },
  {
    title: 'Your content',
    body: [
      'The notes and decks you create remain yours. We store them so the app can show them back to you and generate cards; we do not publish them or sell them.',
      'The StudyBud name, design and code remain ours.',
    ],
  },
  {
    title: 'Ending use',
    body: [
      'You can stop using StudyBud at any time, and you can ask for your account and its data to be deleted (see the privacy page).',
      'We may suspend an account that is used to attack the service or to access other students’ data.',
    ],
  },
  {
    title: 'Liability',
    body: [
      'StudyBud is provided as-is, without warranties. To the extent the law allows, we are not liable for indirect losses arising from your use of the app — including decisions made from AI-generated cards.',
      'Nothing here limits rights you have under consumer law that cannot be excluded.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">Legal</p>
        <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso sm:text-[3.6rem]">
          Terms
        </h1>
        <p className="mt-5 text-[14.5px] leading-relaxed text-espresso-500">
          Plain-language rules for using StudyBud while it is in beta.
        </p>

        <div className="mt-10 space-y-4">
          {SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-espresso/10 bg-paper-50 p-6 shadow-paper sm:p-8"
            >
              <h2 className="display text-[1.5rem] leading-tight text-espresso">{section.title}</h2>
              <div className="mt-3 space-y-2.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[13.5px] leading-relaxed text-espresso-500">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-8 text-[12px] text-espresso-400">
          Questions? Email{' '}
          <a
            href="mailto:atharvmi14@gmail.com"
            className="text-espresso-600 underline decoration-espresso/20 underline-offset-4"
          >
            atharvmi14@gmail.com
          </a>
          .
        </p>
      </main>

      <MarketingFooter />
    </div>
  )
}
