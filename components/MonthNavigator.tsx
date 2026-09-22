'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
}

export default function MonthNavigator({ year, month, onPrev, onNext }: Props) {
  const { lang } = useLanguage()
  const tr = translations[lang]

  return (
    <div className="no-print flex items-center justify-between py-5">
      <button
        onClick={onPrev}
        className="w-12 h-12 rounded-full bg-white shadow text-indigo-600 font-bold text-2xl flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Mois précédent"
      >
        ‹
      </button>

      <h2 className="text-xl font-bold text-slate-700">
        {tr.months[month - 1]} {year}
      </h2>

      <button
        onClick={onNext}
        className="w-12 h-12 rounded-full bg-white shadow text-indigo-600 font-bold text-2xl flex items-center justify-center active:scale-90 transition-transform"
        aria-label="Mois suivant"
      >
        ›
      </button>
    </div>
  )
}
