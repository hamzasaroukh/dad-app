import {
  collection,
  addDoc,
  updateDoc,
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

const SHEETS_URL =
  'https://script.google.com/macros/s/AKfycbxowG3JwjfHfTyy6LMUT1gq-AUQnH-oYe37WBJkEt12znU5_S1J-VQK6l9zzR0jMi68jQ/exec'

function logToSheets(expense: { date: string; description: string; price: number }) {
  fetch(SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(expense),
  }).catch(() => {})
}

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
  logToSheets(expense)
  return { id: docRef.id, created_at, ...expense }
}

export async function updateExpense(
  id: string,
  expense: Omit<Expense, 'id' | 'created_at'>
): Promise<void> {
  await updateDoc(doc(firestore, 'expenses', id), { ...expense })
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteDoc(doc(firestore, 'expenses', id))
}

export async function deleteExpensesInRange(startDate: string, endDate: string): Promise<void> {
  const q = query(expensesRef, where('date', '>=', startDate), where('date', '<=', endDate))
  const snapshot = await getDocs(q)
  await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(firestore, 'expenses', d.id))))
}
