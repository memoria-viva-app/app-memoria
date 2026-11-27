interface Props {
  title?: string
  subtitle?: string
}

export function Header({
  title,
  subtitle,
}: Props) {
  if (!title) return null

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 border-stone-300 px-3 sm:px-6 py-1 sm:py-1.5 shadow-2xs shrink-0">
      <div className="max-w-4xl mx-auto flex items-baseline justify-center gap-2 sm:gap-3 min-w-0 text-center">
        <h1 className="text-base sm:text-2xl md:text-3xl font-black text-stone-950 tracking-tight leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <>
            <span className="hidden sm:inline text-stone-400 font-black text-xl select-none" aria-hidden="true">
              ·
            </span>
            <p className="hidden sm:block text-base md:text-xl font-bold text-stone-600 leading-tight truncate">
              {subtitle}
            </p>
          </>
        )}
      </div>
    </header>
  )
}
