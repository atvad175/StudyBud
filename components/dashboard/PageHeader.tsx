export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="mb-8 animate-fade-up">
      <div className="flex items-center gap-2.5">
        <span className="h-px w-6 bg-neon-indigo/50" aria-hidden />
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-neon-indigo/80">
          {eyebrow}
        </p>
      </div>
      <h1 className="display mt-3 text-[2.1rem] text-white sm:text-[2.6rem]">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-400">{description}</p>
    </header>
  )
}
