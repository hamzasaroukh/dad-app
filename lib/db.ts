import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db as firestore } from './firebase'
import type { Expense } from './types'

const expensesRef = collection(firestore, 'expenses')

export async function getExpenses(year: number, month: number): Promise<Expense[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const q = query(
    expensesRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc'),
    orderBy('created_at', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      date: data.date,
      description: data.description,
      price: data.price,
      created_at:
        data.created_at instanceof Timestamp
          ? data.created_at.toDate().toISOString()
          : data.created_at,
    }
  })
}

export async function addExpense(
  expense: Omit<Expense, 'id' | 'created_at'>
): Promise<Expense> {
  const created_at = new Date().toISOString()
  const docRef = await addDoc(expensesRef, { ...expense, created_at })
  return { id: docRef.id, created_at, ...expense }
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(firestore, 'expenses', id))
}
