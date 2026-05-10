import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, FileText, Plus, Trash2, Pencil } from "lucide-react"
import Link from "next/link"
import { useState } from 'react'
import { AddExpenseModal } from './AddExpenseModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

export function BudgetDashboard({ trip, subtotal, budget, barData, COLORS }: any) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [newBudget, setNewBudget] = useState(budget)
  const queryClient = useQueryClient()

  const isOverBudget = subtotal > budget

  const budgetMutation = useMutation({
    mutationFn: (amount: number) => axios.patch(`/api/trips/${trip.id}`, { totalBudget: amount }),
    onSuccess: () => {
      toast.success("Budget updated")
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] })
      setIsEditingBudget(false)
    }
  })

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/expenses/${id}`),
    onSuccess: () => {
      toast.success("Expense removed")
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] })
    }
  })

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <h3 className="font-black text-[#1E1B4B] mb-6 uppercase tracking-widest text-xs">Budget Progress</h3>
            <div className="h-48 w-full relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{name: 'Spent', value: subtotal}, {name: 'Remaining', value: Math.max(budget - subtotal, 0)}]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6C47FF" />
                    <Cell fill={isOverBudget ? '#EF4444' : '#10B981'} />
                  </Pie>
                  <Tooltip formatter={(val: any) => `$${val?.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Spent</span>
                <span className="text-2xl font-black text-[#1E1B4B]">${subtotal.toFixed(0)}</span>
              </div>
            </div>
            
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-left">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Limit</p>
                  {isEditingBudget ? (
                    <input 
                      type="number" 
                      className="w-20 bg-white border-none rounded-lg text-sm font-black p-1 focus:ring-1 focus:ring-[#6C47FF]" 
                      value={newBudget}
                      onChange={(e) => setNewBudget(Number(e.target.value))}
                      onBlur={() => budgetMutation.mutate(newBudget)}
                      autoFocus
                    />
                  ) : (
                    <p className="text-lg font-black text-[#1E1B4B]">${budget}</p>
                  )}
                </div>
                <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-2 hover:bg-white rounded-xl transition-colors text-[#6C47FF]">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => setIsExpenseModalOpen(true)}
                className="w-full py-3 bg-[#6C47FF] text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-[#5A35E5] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Log Expense
              </button>
            </div>
          </div>

          {isOverBudget && (
            <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 animate-bounce">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-red-700 text-sm uppercase tracking-wider">Over Budget!</p>
                <p className="text-xs text-red-600 font-bold">You are ${(subtotal - budget).toFixed(2)} over.</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-2/3 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-[#1E1B4B] text-sm font-heading uppercase tracking-widest">Breakdown by Category</h3>
              <Link href={`/trips/${trip.id}/budget`} className="text-[#6C47FF] text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                View Full Invoice <FileText className="w-3 h-3" />
              </Link>
            </div>
            
            {barData.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fontWeight: '900', fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} formatter={(val: any) => `$${val}`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                      {barData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-200">
                <DollarSign className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-widest text-xs">No expenses logged</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-black text-[#1E1B4B] text-sm font-heading uppercase tracking-widest mb-6">Recent Expenses</h3>
            <div className="space-y-3">
              {trip.expenses?.length > 0 ? (
                trip.expenses.slice(-5).reverse().map((exp: any) => (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-indigo-50/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#6C47FF] shadow-sm border border-gray-100 font-bold text-xs">
                        {exp.category.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{exp.description}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{exp.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-black text-gray-900">${exp.amount}</p>
                      <button 
                        onClick={() => deleteExpenseMutation.mutate(exp.id)}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-4 text-gray-400 text-sm italic">Nothing logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
        tripId={trip.id}
        stops={trip.stops}
      />
    </div>
  )
}
