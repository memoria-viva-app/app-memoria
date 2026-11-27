import { ArrowLeft } from 'lucide-react'

interface Props {
  title?: string
  subtitle?: string
  onBack?: () => void
}

export function Header({
  title,
  subtitle,
  onBack,
}: Props) {
  if (!onBack && !title) return null

  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/95 backdrop-blur-md border-b-2 sm:border-b-3 border-stone-300 px-2.5 sm:px-6 py-1.5 sm:py-3 shadow-xs shrink-0">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="animate-back-glow flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg sm:text-2xl border-2 sm:border-3 border-red-700 transition-colors cursor-pointer shrink-0 min-h-[48px] sm:min-h-[64px]"
              aria-label="Volver al menú principal"
            >
              <ArrowLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white stroke-[3]" />
              <span>Volver</span>
            </button>
          )}

          {title && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-3xl md:text-4xl font-black text-stone-950 tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="hidden sm:block text-lg sm:text-xl font-bold text-stone-700 leading-snug truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
