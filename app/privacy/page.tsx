import type { Metadata } from 'next'

import MarketingFooter from '@/components/landing/MarketingFooter'
import SiteHeader from '@/components/landing/SiteHeader'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'What StudyBud stores, why it stores it, who can see it, and how to get it deleted.',
}

const SECTIONS = [
  {
    title: 'What we store',
    body: [
      'Your email address and password. The password itself is never stored — Supabase Auth keeps only a salted hash.',
      'A profile with your display name, an optional grade or section, and your plan label.',
      'The work you record: habits and the dates you completed them, focus sessions and their lengths, and study decks — the notes you pasted plus the flashcards generated from them.',
    ],
  },
  {
    title: 'Where it lives',
    body: [
      'Everything is stored in a Supabase (Postgres) database owned for StudyBud, with row-level security so a signed-in student can read and write only their own rows.',
      'Your session is kept in a secure, http-only cookie set by this site. There are no advertising cookies, no third-party trackers and no analytics scripts.',
    ],
  },
  {
    title: 'AI flashcard generation',
    body: [
      'When you generate a deck, the deck title and the notes you pasted are sent to Google’s Gemini API from our server so the cards can be written. Your email address and account identity are not included in that request.',
      'Google returns the cards and does not receive a copy of your habit or focus history. If you never generate a deck, no notes leave the app.',
    ],
  },
  {
    title: 'Who can see it',
    body: [
      'You, and nobody else in the product. There is no social feed, no public profile and no teacher or school dashboard in StudyBud today.',
      'Administrators of the hosting and database accounts can technically access stored data for operation and support. We do not sell data, share it with advertisers, or use it to train models.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'Your records stay while your account exists. Deleting your account removes your profile, habits, focus sessions and decks.',
      'Database backups may retain a copy for a short period before they rotate out.',
    ],
  },
  {
    title: 'Deleting your account',
    body: [
      'Account deletion is handled by a person today, not a button. Email atharvmi14@gmail.com from the address on your StudyBud account and ask for deletion; it will be actioned within 30 days, and you will get a confirmation.',
      'You can also ask for a copy of your data in the same email and it will be exported for you.',
    ],
  },
  {
    title: 'Under 13',
    body: [
      'StudyBud is intended for secondary school students. If you are under 13, use it only with a parent, guardian or school allowing you to do so.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="paper-surface min-h-dvh">
      <SiteHeader />

      <main className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-500">Legal</p>
        <h1 className="display mt-4 text-[2.9rem] leading-[1.04] text-espresso sm:text-[3.6rem]">
          Privacy
        </h1>
        <p className="mt-5 text-[14.5px] leading-relaxed text-espresso-500">
          The short version: your study records are yours, they are visible only to you, and you can
          have them deleted. The detail is below.
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
          Questions about any of this? Email{' '}
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
