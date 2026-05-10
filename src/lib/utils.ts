import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export type Expense = { amount: number; category: string }

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy")
}

export function formatDateRange(start: Date | string, end: Date | string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function getTripStatus(start: Date | string, end: Date | string): 'ongoing' | 'upcoming' | 'completed' {
  const now = new Date()
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  if (now < startDate) return 'upcoming'
  if (now > endDate) return 'completed'
  return 'ongoing'
}

export function calcTripDays(start: Date | string, end: Date | string): number {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // Inclusive of start and end
}

export function calcBudgetSummary(expenses: { amount: number, category: string }[]): { total: number, byCategory: Record<string, number> } {
  return expenses.reduce(
    (acc, expense) => {
      acc.total += expense.amount
      acc.byCategory[expense.category] = (acc.byCategory[expense.category] || 0) + expense.amount
      return acc
    },
    { total: 0, byCategory: {} as Record<string, number> }
  )
}
