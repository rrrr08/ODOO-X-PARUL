'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { CheckSquare, Square, Trash2, Plus, AlertCircle, Briefcase, ChevronDown, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ChecklistDashboard({ tripId }: { tripId: string }) {
  const queryClient = useQueryClient()
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Documents': true, 'Clothing': true, 'Electronics': true
  })

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${tripId}`)
      return res.data
    }
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isPacked }: { id: string, isPacked: boolean }) => 
      axios.patch(`/api/checklist/${id}`, { isPacked }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    },
    onError: () => toast.error("Failed to update item")
  })

  const addItemMutation = useMutation({
    mutationFn: ({ label, category }: { label: string, category: string }) => 
      axios.post(`/api/trips/${tripId}/checklist`, { label, category }),
    onSuccess: () => {
      toast.success("Item added")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    },
    onError: () => toast.error("Failed to add item")
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/checklist/${id}`),
    onSuccess: () => {
      toast.success("Item removed")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    },
    onError: () => toast.error("Failed to delete item")
  })

  const resetMutation = useMutation({
    mutationFn: () => axios.delete(`/api/trips/${tripId}/checklist/reset`),
    onSuccess: () => {
      toast.success("Checklist reset")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    },
    onError: () => toast.error("Failed to reset checklist")
  })

  if (isLoading) return <SkeletonCard height="h-[400px]" lines={6} />

  const items = trip?.checklist || []
  const packedCount = items.filter((i: any) => i.isPacked).length
  const totalCount = items.length
  const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100)
  const categories = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Accessories', 'Other']

  const handleAddItem = (e: React.FormEvent, cat: string) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const label = formData.get('label') as string
    
    if (label?.trim()) {
      addItemMutation.mutate({ label: label.trim(), category: cat })
      form.reset()
    }
  }

  const quickAddItems = ['Passport', 'Phone Charger', 'Sunscreen', 'First Aid Kit', 'Camera', 'Travel Pillow']

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-[#1E1B4B] font-heading flex items-center gap-3 uppercase tracking-wider">
                <Briefcase className="w-6 h-6 text-[#F59E0B]" /> Packing Progress
              </h2>
              <button 
                onClick={() => {
                  if (window.confirm("Reset all items to unpacked?")) resetMutation.mutate()
                }}
                disabled={resetMutation.isPending || totalCount === 0}
                className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#6C47FF] transition-colors flex items-center gap-1.5"
              >
                {resetMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />}
                Reset All
              </button>
            </div>
            <span className="text-sm font-black text-[#6C47FF] bg-indigo-50 px-3 py-1 rounded-full">{progress}% Ready</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
            <div className="bg-gradient-to-r from-[#6C47FF] to-[#F59E0B] h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-4">
          {categories.map(category => {
            const catItems = items.filter((i: any) => i.category === category)
            const isExpanded = expandedCats[category]
            
            return (
              <div key={category} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-[#6C47FF]/20">
                <button 
                  onClick={() => setExpandedCats(prev => ({ ...prev, [category]: !prev[category] }))}
                  className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    <h3 className="font-black text-[#1E1B4B] uppercase tracking-widest text-sm">{category}</h3>
                  </div>
                  <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-gray-400 border border-gray-200">
                    {catItems.filter((i: any) => i.isPacked).length}/{catItems.length}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="p-4">
                    {catItems.length === 0 ? (
                      <div className="p-6 flex items-center gap-3 text-sm text-gray-400 font-medium italic">
                        <AlertCircle className="w-4 h-4" /> Start adding items for {category}...
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {catItems.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between p-4 hover:bg-indigo-50/30 rounded-2xl group transition-all">
                            <button 
                              onClick={() => toggleMutation.mutate({ id: item.id, isPacked: !item.isPacked })} 
                              className="flex items-center gap-4 flex-1 text-left"
                            >
                              {item.isPacked ? (
                                <CheckSquare className="w-6 h-6 text-[#6C47FF] fill-indigo-50" />
                              ) : (
                                <Square className="w-6 h-6 text-gray-200" />
                              )}
                              <span className={`transition-all font-bold ${item.isPacked ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                                {item.label}
                              </span>
                            </button>
                            <button 
                              onClick={() => deleteItemMutation.mutate(item.id)} 
                              className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <form onSubmit={(e) => handleAddItem(e, category)} className="mt-4 p-3 bg-gray-50 rounded-2xl flex items-center gap-3 border border-dashed border-gray-200">
                      <Plus className="w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        name="label"
                        placeholder={`Quick add to ${category}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold placeholder-gray-300 px-0"
                      />
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-6">
            <h3 className="font-black text-[#1E1B4B] font-heading mb-4 uppercase tracking-widest text-sm">Quick Add Essentials</h3>
            <div className="flex flex-wrap gap-2">
              {quickAddItems.map(item => {
                const inList = items.some((i: any) => i.label === item)
                return (
                  <button 
                    key={item}
                    onClick={() => !inList && addItemMutation.mutate({ label: item, category: 'Other' })}
                    disabled={inList || addItemMutation.isPending}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${inList ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-200 hover:border-[#6C47FF] hover:text-[#6C47FF] active:scale-95 shadow-sm'}`}
                  >
                    {item} {inList && '✓'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
