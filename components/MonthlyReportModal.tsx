'use client'

import { useState } from 'react'
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

export default function MonthlyReportModal({
  year,
  month,
  dayGroups,
  monthlyTotal,
  onClose,
}: Props) {
  const { lang, dir } = useLanguage()
  const tr = translations[lang]
  const [sharing, setSharing] = useState(false)

  const handleWhatsAppShare = async () => {
    setSharing(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const { jsPDF } = await import('jspdf')

      const rows = dayGroups
        .map((g) =>
          g.expenses
            .map(
              (e, i) => `
        <tr>
          <td style="padding:10px 14px;font-size:14px;color:#475569;border-bottom:1px solid #f1f5f9">${i === 0 ? g.date : ''}</td>
          <td style="padding:10px 14px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9;direction:rtl;text-align:right">${e.description}</td>
          <td style="padding:10px 14px;font-size:14px;font-weight:600;color:#1e293b;border-bottom:1px solid #f1f5f9;text-align:right;white-space:nowrap">${e.price.toFixed(2)} ${tr.currency}</td>
        </tr>`
            )
            .join('') +
          `
        <tr style="background:#eef2ff">
          <td colspan="2" style="padding:8px 14px;font-size:13px;color:#4338ca;font-weight:700">${tr.dailyTotal}</td>
          <td style="padding:8px 14px;font-size:13px;color:#16a34a;font-weight:700;text-align:right">${g.total.toFixed(2)} ${tr.currency}</td>
        </tr>`
        )
        .join('')

      const containerWidth = 750
      const div = document.createElement('div')
      div.style.cssText = `position:fixed;left:-9999px;top:0;width:${containerWidth}px;background:white;font-family:Cairo,sans-serif;`
      div.innerHTML = `
        <div style="padding:40px 40px 32px;border-bottom:4px solid #4f46e5;background:linear-gradient(135deg,#312e81,#4f46e5)">
          <h1 style="color:white;font-size:32px;font-weight:800;margin:0;text-align:center">الحسين النجاري</h1>
          <p style="color:#c7d2fe;font-size:16px;margin:8px 0 0;text-align:center;font-weight:500">${tr.reportTitle} — ${tr.months[month - 1]} ${year}</p>
        </div>
        <div style="padding:32px 40px">
          <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
            <thead>
              <tr style="background:#f8fafc">
                <th style="padding:12px 14px;text-align:left;font-size:13px;color:#94a3b8;font-weight:600;border-bottom:2px solid #e2e8f0">${tr.date}</th>
                <th style="padding:12px 14px;text-align:right;font-size:13px;color:#94a3b8;font-weight:600;border-bottom:2px solid #e2e8f0">${tr.item}</th>
                <th style="padding:12px 14px;text-align:right;font-size:13px;color:#94a3b8;font-weight:600;border-bottom:2px solid #e2e8f0">${tr.amount}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="background:#4f46e5;color:white;border-radius:14px;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:24px">
            <span style="font-size:17px;font-weight:700">${tr.monthlyTotal} — ${tr.months[month - 1]} ${year}</span>
            <span style="font-size:26px;font-weight:800">${monthlyTotal.toFixed(2)} ${tr.currency}</span>
          </div>
        </div>`

      document.body.appendChild(div)

      // Insert invisible spacer rows before any table row that would otherwise
      // straddle a page boundary, so pages never cut through a row's content.
      const imgWidth = 210
      const pageHeight = 297
      const mmPerPx = imgWidth / containerWidth
      const pageHeightPx = pageHeight / mmPerPx
      const containerTop = div.getBoundingClientRect().top
      const rowElements = Array.from(div.querySelectorAll('tbody tr'))
      const rowEdges = rowElements.map((tr) => {
        const r = tr.getBoundingClientRect()
        return { top: r.top - containerTop, bottom: r.bottom - containerTop }
      })

      let pageStart = 0
      let shift = 0
      const spacerInsertions: { index: number; heightPx: number }[] = []
      for (let i = 0; i < rowEdges.length; i++) {
        const top = rowEdges[i].top + shift
        const bottom = rowEdges[i].bottom + shift
        if (bottom - pageStart > pageHeightPx) {
          const gap = Math.max(0, pageStart + pageHeightPx - top)
          spacerInsertions.push({ index: i, heightPx: gap })
          shift += gap
          pageStart += pageHeightPx
        }
      }
      for (let i = spacerInsertions.length - 1; i >= 0; i--) {
        const { index, heightPx } = spacerInsertions[i]
        const spacerTr = document.createElement('tr')
        spacerTr.innerHTML = `<td colspan="3" style="height:${heightPx}px;padding:0;border:none"></td>`
        rowElements[index].parentElement!.insertBefore(spacerTr, rowElements[index])
      }

      const canvas = await html2canvas(div, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
      document.body.removeChild(div)

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let remaining = imgHeight
      let offset = 0
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, -offset, imgWidth, imgHeight)
        remaining -= pageHeight
        offset += pageHeight
        if (remaining > 0) pdf.addPage()
      }
      const blob = pdf.output('blob')
      const file = new File([blob], `rapport-${tr.months[month - 1]}-${year}.pdf`, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: `${tr.reportTitle} ${tr.months[month - 1]} ${year}` })
      } else {
        pdf.save(`rapport-${tr.months[month - 1]}-${year}.pdf`)
      }
    } catch (err) {
      const isCancel = err instanceof Error && err.name === 'AbortError'
      if (!isCancel) {
        window.alert(tr.whatsappError + (err instanceof Error ? err.message : String(err)))
      }
    } finally {
      setSharing(false)
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
            onClick={handleWhatsAppShare}
            disabled={sharing}
            className="w-full py-4 bg-[#25D366] text-white font-bold text-lg rounded-2xl active:opacity-90 transition-colors shadow disabled:opacity-50"
          >
            {sharing ? tr.whatsappSending : `📤 ${tr.whatsapp}`}
          </button>
        </div>
      </div>
    </div>
  )
}
