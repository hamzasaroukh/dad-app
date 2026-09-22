'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from '@/lib/translations'
import { getExpenses, addExpense, updateExpense, deleteExpense, deleteExpensesInRange } from '@/lib/db'
import type { Expense, DayGroup } from '@/lib/types'
import Header from '@/components/Header'
import MonthNavigator from '@/components/MonthNavigator'
import DailyGroup from '@/components/DailyGroup'
import AddExpenseModal from '@/components/AddExpenseModal'
import MonthlyReportModal from '@/components/MonthlyReportModal'

function groupByDay(expenses: Expense[]): DayGroup[] {
  const map: Record<string, Expense[]> = {}
  for (const exp of expenses) {
    if (!map[exp.date]) map[exp.date] = []
    map[exp.date].push(exp)
  }
  return Object.entries(map)
    .map(([date, exps]) => ({
      date,
      expenses: exps,
      total: exps.reduce((sum, e) => sum + Number(e.price), 0),
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export default function Home() {
  const { lang, dir } = useLanguage()
  const tr = translations[lang]

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getExpenses(year, month)
      setExpenses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    load()
  }, [load])

  // Escape key closes whichever modal is open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showAdd) {
        setShowAdd(false)
        setEditingExpense(null)
      } else if (showReport) {
        setShowReport(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [showAdd, showReport])

  const handleSave = async (expense: { date: string; description: string; price: number }) => {
    if (editingExpense) {
      await updateExpense(editingExpense.id, expense)
    } else {
      await addExpense(expense)
    }
    setShowAdd(false)
    setEditingExpense(null)
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteExpense(id)
    load()
  }

  const handleEdit = (id: string) => {
    const expense = expenses.find((e) => e.id === id)
    if (!expense) return
    setEditingExpense(expense)
    setShowAdd(true)
  }

  const handleOpenAdd = () => {
    setEditingExpense(null)
    setShowAdd(true)
  }

  const handleAdminClear = async () => {
    const pin = window.prompt(`${tr.adminPinPrompt} — ${tr.months[month - 1]} ${year}`)
    if (pin !== '5566') return
    const ok = window.confirm(`${tr.adminClearConfirm} ${tr.months[month - 1]} ${year} ?`)
    if (!ok) return
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    try {
      await deleteExpensesInRange(startDate, endDate)
      load()
    } catch (err) {
      console.error(err)
    }
  }

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const dayGroups = groupByDay(expenses)
  const monthlyTotal = expenses.reduce((sum, e) => sum + Number(e.price), 0)

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-b from-indigo-50 to-slate-100 flex flex-col">
      <Header onAdminClear={handleAdminClear} />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-36">
        <MonthNavigator year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400 text-lg">{tr.loading}</p>
            </div>
          </div>
        ) : dayGroups.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-lg whitespace-pre-line leading-relaxed">
            <div className="text-6xl mb-4">🛒</div>
            {tr.noExpenses}
          </div>
        ) : (
          <>
            {dayGroups.map((group) => (
              <DailyGroup key={group.date} group={group} onDelete={handleDelete} onEdit={handleEdit} />
            ))}

            {/* Monthly total banner */}
            <div className="mt-2 mb-6 p-5 bg-indigo-600 text-white rounded-2xl shadow-lg flex justify-between items-center">
              <span className="text-lg font-bold">{tr.monthlyTotal}</span>
              <span className="text-2xl font-extrabold">
                {monthlyTotal.toFixed(2)} {tr.currency}
              </span>
            </div>
          </>
        )}
      </main>

      {/* Monthly report button */}
      <button
        onClick={() => setShowReport(true)}
        className="no-print fixed bottom-6 left-6 bg-green-600 text-white font-bold rounded-full px-5 py-4 text-sm shadow-xl active:scale-95 transition-transform flex items-center gap-2"
      >
        📊 <span>{tr.monthlyReport}</span>
      </button>

      {/* FAB — Add expense */}
      <button
        onClick={handleOpenAdd}
        className="no-print fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full w-16 h-16 text-4xl shadow-xl flex items-center justify-center active:scale-90 transition-transform font-light"
        aria-label={tr.addExpense}
      >
        +
      </button>

      {showAdd && (
        <AddExpenseModal
          editing={editingExpense}
          onSave={handleSave}
          onClose={() => {
            setShowAdd(false)
            setEditingExpense(null)
          }}
        />
      )}

      {showReport && (
        <MonthlyReportModal
          year={year}
          month={month}
          dayGroups={dayGroups}
          monthlyTotal={monthlyTotal}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
