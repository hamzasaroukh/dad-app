'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'

interface Props {
  onSave: (expense: { date: string; description: string; price: number }) => Promise<void>
  onClose: () => void
}

function todayString() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function AddExpenseModal({ onSave, onClose }: Props) {
  const { lang, dir } = useLanguage()
  const tr = translations[lang]

  const [date, setDate] = useState(todayString())
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const isValid = description.trim() !== '' && price !== '' && !isNaN(parseFloat(price)) && parseFloat(price) > 0

  const handleSubmit = async () => {
    if (!isValid) return
    setSaving(true)
    try {
      await onSave({ date, description: description.trim(), price: parseFloat(price) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="no-print fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      dir={dir}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {tr.addExpense}
        </h2>

        <div className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-slate-600 font-semibold mb-2 text-lg">{tr.date}</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-600 font-semibold mb-2 text-lg">
              {tr.whatBought}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={tr.descriptionPlaceholder}
              autoFocus
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-slate-600 font-semibold mb-2 text-lg">
              {tr.price} ({tr.currency})
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={tr.pricePlaceholder}
              min="0"
              step="0.01"
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-lg text-slate-800 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold text-lg active:bg-slate-50 transition-colors"
          >
            {tr.cancel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !isValid}
            className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg active:bg-indigo-700 disabled:opacity-40 transition-colors shadow-md"
          >
            {saving ? '...' : tr.save}
          </button>
        </div>
      </div>
    </div>
  )
}
