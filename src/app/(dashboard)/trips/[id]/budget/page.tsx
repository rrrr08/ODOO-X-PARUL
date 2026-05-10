'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { format } from "date-fns"
import Link from "next/link"
import { ChevronLeft, Download, FileText, Plus, Trash2 } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useState } from "react"
import { toast } from "sonner"

export default function ExpenseInvoice() {
  const params = useParams()
  const [taxPercent, setTaxPercent] = useState(10)
  const [isPaid, setIsPaid] = useState(false)

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

  if (isLoading) {
    return <SkeletonCard height="h-[600px]" lines={8} />
  }

  const budget = trip?.totalBudget || 0
  const manualExpenses = trip?.expenses || []
  
  // Combine manual expenses and activities with costs
  const activityExpenses = trip?.stops?.flatMap((s: any) => 
    (s.activities || []).map((a: any) => ({
      id: a.id,
      category: a.category || 'Activity',
      description: a.name,
      quantity: 1,
      unitCost: a.cost || 0,
      amount: a.cost || 0,
      isActivity: true
    }))
  ) || []

  const allExpenses = [...manualExpenses, ...activityExpenses]
  const subtotal = allExpenses.reduce((sum: number, e: any) => sum + e.amount, 0)
  const taxAmount = (subtotal * taxPercent) / 100
  const grandTotal = subtotal + taxAmount

  // Category data for charts
  const categoryTotals: Record<string, number> = {}
  allExpenses.forEach((e: any) => {
    const cat = e.category || 'Other'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount
  })
  
  const barData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
  const COLORS = ['#6C47FF', '#F59E0B', '#10B981', '#F43F5E', '#3B82F6', '#8B5CF6']

  const handlePrint = () => {
    window.print()
  }

  const handleMarkPaid = () => {
    setIsPaid(!isPaid)
    toast.success(isPaid ? "Status set to Pending" : "Invoice marked as Paid!")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print">
        <Link href={`/trips/${params.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#6C47FF] mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Itinerary Builder
        </Link>
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
            {trip?.coverUrl ? <img src={trip.coverUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-gradient-to-tr from-indigo-200 to-purple-200" />}
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-[#1E1B4B]">{trip?.title}</h1>
            <p className="text-sm text-gray-500">{format(new Date(trip?.startDate || new Date()), 'MMM d')} – {format(new Date(trip?.endDate || new Date()), 'MMM d, yyyy')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Invoice */}
        <div className="lg:w-[60%] bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:p-0 print:shadow-none print:border-none">
          
          <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-100">
            <div>
              <h2 className="text-3xl font-bold font-heading text-[#1E1B4B] mb-2">INVOICE</h2>
              <p className="text-gray-500">ID: #TL-{(params.id as string).slice(0, 6).toUpperCase()}</p>
              <p className="text-gray-500">Date: {format(new Date(), 'MMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold tracking-wide border ${isPaid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                {isPaid ? 'PAID' : 'PENDING'}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-gray-900 mb-2">Trip Details:</h3>
            <p className="text-gray-600">{trip?.stops?.map((s:any)=>s.cityName).join(' → ') || 'No stops added yet.'}</p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-500 text-sm">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium text-right">Qty</th>
                  <th className="pb-3 font-medium text-right">Unit Cost</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 no-print"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allExpenses.map((exp: any, i: number) => (
                  <tr key={exp.id} className="group hover:bg-gray-50">
                    <td className="py-4 text-gray-500 text-sm">{i + 1}</td>
                    <td className="py-4 font-medium text-gray-900">{exp.category}</td>
                    <td className="py-4 text-gray-600">{exp.description}</td>
                    <td className="py-4 text-right text-gray-600">{exp.quantity || 1}</td>
                    <td className="py-4 text-right text-gray-600">${(exp.unitCost || 0).toFixed(2)}</td>
                    <td className="py-4 text-right font-medium text-gray-900">${(exp.amount || 0).toFixed(2)}</td>
                    <td className="py-4 text-right no-print">
                      {!exp.isActivity && (
                        <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="no-print w-full flex justify-center items-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 font-medium hover:text-[#6C47FF] hover:border-[#6C47FF] hover:bg-indigo-50 transition-colors mb-8">
            <Plus className="w-5 h-5" /> Add Expense
          </button>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-1/2 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 items-center">
                <span className="flex items-center gap-2">
                  Tax 
                  <input type="number" value={taxPercent} onChange={(e)=>setTaxPercent(Number(e.target.value))} className="w-16 border-gray-200 rounded px-2 py-1 text-sm no-print" />
                  <span className="no-print">%</span>
                  <span className="hidden print:inline">{taxPercent}%</span>
                </span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-200 text-[#1E1B4B]">
                <span>Grand Total</span>
                <span className="text-[#6C47FF]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap justify-end gap-3 no-print">
            <button onClick={handlePrint} className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button onClick={handlePrint} className="px-5 py-2.5 rounded-lg border border-[#6C47FF] text-[#6C47FF] font-medium hover:bg-indigo-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Print Invoice
            </button>
            <button 
              onClick={handleMarkPaid}
              className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all ${isPaid ? 'bg-gray-400 hover:bg-gray-500' : 'bg-[#10B981] hover:bg-[#059669]'}`}
            >
              {isPaid ? 'Mark as Pending' : 'Mark as Paid'}
            </button>
          </div>
        </div>

        {/* Right Column - Insights */}
        <div className="lg:w-[40%] space-y-6 no-print">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-6">Budget Insights</h3>
            
            {grandTotal > budget && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between">
                <span>Over budget warning</span>
                <span className="font-bold">${(grandTotal - budget).toFixed(2)}</span>
              </div>
            )}

            <div className="h-48 w-full relative mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{name: 'Spent', value: grandTotal}, {name: 'Remaining', value: Math.max(budget - grandTotal, 0)}]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6C47FF" />
                    <Cell fill={grandTotal > budget ? '#EF4444' : '#10B981'} />
                  </Pie>
                  <Tooltip formatter={(val: any) => `$${val?.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-gray-500 text-xs font-medium">Budget</span>
                <span className="text-lg font-bold text-[#1E1B4B]">${budget}</span>
              </div>
            </div>

            <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Breakdown by Category</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(val: any) => `$${val?.toFixed(2)}`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
