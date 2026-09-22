'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
  onAdminClear: () => void
}

export default function Header({ onAdminClear }: Props) {
  const { lang, setLang } = useLanguage()

  return (
    <header className="no-print bg-gradient-to-br from-indigo-700 to-blue-600 text-white pt-10 pb-6 px-5 shadow-lg">
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide">الحسين النجاري</h1>
          <p className="text-indigo-200 text-base mt-1 font-medium">
            {lang === 'fr' ? 'Mes Dépenses Mensuelles' : 'مصاريفي الشهرية'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
            className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold rounded-2xl px-5 py-3 text-base transition-colors shadow"
          >
            {lang === 'fr' ? 'العربية' : 'Français'}
          </button>
          <span
            onClick={onAdminClear}
            className="text-white/40 text-[11px] tracking-widest cursor-pointer select-none"
          >
            ···
          </span>
        </div>
      </div>
    </header>
  )
}
