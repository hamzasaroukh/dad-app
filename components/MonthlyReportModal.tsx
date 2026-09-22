'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import type { DayGroup } from '@/lib/types'

interface Props {
  year: number
  month: number
  dayGroups: DayGroup[]
  monthlyTotal: number
  onClose: () => void
}

function buildPrintWindow(
  dayGroups: DayGroup[],
  monthlyTotal: number,
  tr: typeof translations.fr,
  year: number,
  month: number,
  lang: string
) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const rows = dayGroups
    .map((group) => {
      const items = group.expenses
        .map(
          (exp) => `
          <tr>
            <td>${group.date}</td>
            <td>${exp.description}</td>
            <td class="amount">${exp.price.toFixed(2)} ${tr.currency}</td>
          </tr>`
        )
        .join('')
      const sub = `
        <tr class="subtotal">
          <td colspan="2">${tr.dailyTotal}</td>
          <td class="amount">${group.total.toFixed(2)} ${tr.currency}</td>
        </tr>`
      return items + sub
    })
    .join('')

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; margin: 15mm 20mm; direction: ${dir}; color: #1e293b; }
    h1 { font-size: 26px; text-align: center; margin-bottom: 4px; color: #1e1b4b; }
    h2 { font-size: 15px; text-align: center; color: #6b7280; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #4338ca; color: white; padding: 10px 12px; text-align: start; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .subtotal { background: #eef2ff !important; font-weight: 700; color: #4338ca; }
    .total-row { background: #4338ca !important; color: white; font-size: 17px; font-weight: 700; }
    .total-row td { padding: 12px; }
    .amount { text-align: end; }
  </style>
</head>
<body>
  <h1>الحسين النجاري</h1>
  <h2>${tr.reportTitle} — ${tr.months[month - 1]} ${year}</h2>
  <table>
    <thead>
      <tr>
        <th>${tr.date}</th>
        <th>${tr.item}</th>
        <th class="amount">${tr.amount}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">${tr.monthlyTotal}</td>
        <td class="amount">${monthlyTotal.toFixed(2)} ${tr.currency}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`
}

export default function MonthlyReportModal({
  year,
  month,
  dayGroups,
  monthlyTotal,
  onClose,
}: Props) {
  const { lang, dir } = useLanguage()
  const tr = translations[lang]

  const handlePrint = () => {
    const html = buildPrintWindow(dayGroups, monthlyTotal, tr, year, month, lang)
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.focus()
      setTimeout(() => win.print(), 600)
    }
  }

  return (
    <div
      className="no-print fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      dir={dir}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {tr.monthlyReport} — {tr.months[month - 1]} {year}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
          {dayGroups.length === 0 ? (
            <p className="text-center text-slate-400 py-8 text-lg">{tr.noExpenses}</p>
          ) : (
            dayGroups.map((group) => (
              <div
                key={group.date}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <div className="bg-indigo-50 px-3 py-2 font-bold text-indigo-700 text-sm">
                  {group.date}
                </div>
                {group.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex justify-between px-3 py-2 border-t border-slate-50 text-sm"
                  >
                    <span className="text-slate-700">{exp.description}</span>
                    <span className="font-semibold text-slate-800">
                      {exp.price.toFixed(2)} {tr.currency}
                    </span>
                  </div>
                ))}
                <div className="bg-slate-50 px-3 py-2 flex justify-between text-sm font-bold border-t border-slate-100">
                  <span className="text-slate-500">{tr.dailyTotal}</span>
                  <span className="text-green-600">
                    {group.total.toFixed(2)} {tr.currency}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 space-y-3">
          <div className="bg-indigo-600 text-white rounded-2xl px-5 py-4 flex justify-between items-center">
            <span className="font-bold text-lg">{tr.monthlyTotal}</span>
            <span className="font-extrabold text-2xl">
              {monthlyTotal.toFixed(2)} {tr.currency}
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-2xl active:bg-green-700 transition-colors shadow"
          >
            🖨️ {tr.print}
          </button>
        </div>
      </div>
    </div>
  )
}
