export interface Expense {
  id: string
  date: string
  description: string
  price: number
  created_at: string
}

export type Language = 'fr' | 'ar'

export interface DayGroup {
  date: string
  expenses: Expense[]
  total: number
}
