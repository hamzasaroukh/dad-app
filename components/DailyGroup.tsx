'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import type { DayGroup } from '@/lib/types'

interface Props {
  group: DayGroup
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

function formatDate(dateStr: string, tr: typeof translations.fr) {
  const date = new Date(dateStr + 'T00:00:00')
  const dayName = tr.fullDays[date.getDay()]
  const day = date.getDate()
  const monthName = tr.months[date.getMonth()]
  return `${dayName} ${day} ${monthName}`
}

export default function DailyGroup({ group, onDelete, onEdit }: Props) {
  const { lang } = useLanguage()
  const tr = translations[lang]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden">
      {/* Day header */}
      <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
        <span className="font-bold text-indigo-700 text-base">
          {formatDate(group.date, tr)}
        </span>
      </div>

      {/* Expense items */}
      <div className="divide-y divide-slate-50">
        {group.expenses.map((expense) => (
          <div key={expense.id} className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-semibold text-lg truncate">
                {expense.description}
              </p>
            </div>
            <span className="text-indigo-600 font-bold text-lg whitespace-nowrap">
              {expense.price.toFixed(2)} {tr.currency}
            </span>
            <button
              onClick={() => onEdit(expense.id)}
              className="shrink-0 w-9 h-9 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center text-base transition-colors active:scale-90"
              aria-label="Modifier"
            >
              {tr.edit}
            </button>
            <button
              onClick={() => {
                if (window.confirm(tr.confirmDelete)) onDelete(expense.id)
              }}
              className="shrink-0 w-9 h-9 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center text-lg transition-colors active:scale-90"
              aria-label="Supprimer"
            >
              {tr.delete}
            </button>
          </div>
        ))}
      </div>

      {/* Daily total */}
      <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-t border-slate-100">
        <span className="text-slate-500 font-medium text-sm">{tr.dailyTotal}</span>
        <span className="text-green-600 font-bold text-lg">
          {group.total.toFixed(2)} {tr.currency}
        </span>
      </div>
    </div>
  )
}
