'use client'

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { X, DollarSign, Tag, FileText, Hash, Loader2 } from "lucide-react"

export function AddExpenseModal({ isOpen, onClose, tripId, stops }: any) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    category: "Food",
    description: "",
    quantity: 1,
    unitCost: 0,
    stopId: ""
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return axios.post(`/api/trips/${tripId}/expenses`, data)
    },
    onSuccess: () => {
      toast.success("Expense added successfully!")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
      onClose()
      setForm({
        category: "Food",
        description: "",
        quantity: 1,
        unitCost: 0,
        stopId: ""
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add expense")
    }
  })

  if (!isOpen) return null

  const categories = ["Food", "Transport", "Accommodation", "Activity", "Shopping", "Other"]

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-[#1E1B4B] font-heading uppercase tracking-wider">Log Expense</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${form.category === cat ? 'bg-[#6C47FF] text-white border-[#6C47FF] shadow-md' : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-[#6C47FF]/30'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Dinner, Flight to Paris, etc."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6C47FF] outline-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Unit Cost</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6C47FF] outline-none"
                  value={form.unitCost || ''}
                  onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Quantity</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="number" 
                  placeholder="1"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6C47FF] outline-none"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Link to Stop (Optional)</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6C47FF] outline-none appearance-none"
              value={form.stopId}
              onChange={(e) => setForm({ ...form, stopId: e.target.value })}
            >
              <option value="">No specific stop</option>
              {stops?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.cityName}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.description || !form.unitCost}
            className="w-full py-4 bg-[#6C47FF] text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-[#5A35E5] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
          >
            {mutation.isPending ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Save Expense"}
          </button>
        </div>
      </div>
    </div>
  )
}
