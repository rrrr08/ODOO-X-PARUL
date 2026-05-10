'use client'

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Search, Plus, Loader2, X, Clock, DollarSign } from "lucide-react"

export function AddActivityModal({ isOpen, onClose, stopId, trip }: any) {
  const [search, setSearch] = useState("")
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [scheduledAt, setScheduledAt] = useState("")
  const queryClient = useQueryClient()

  const categories = ["Sightseeing", "Museum", "Food", "Shopping", "Adventure", "Other"]

  const { data: activities, isLoading: searching } = useQuery({
    queryKey: ['activity-search', search, selectedCat],
    queryFn: async () => {
      if (!search && !selectedCat) return []
      const res = await axios.get(`/api/search/activities?q=${search || ''}&category=${selectedCat || ''}`)
      return res.data
    },
    enabled: search.length > 1 || !!selectedCat
  })

  const mutation = useMutation({
    mutationFn: async (activity: any) => {
      return axios.post(`/api/stops/${stopId}/activities`, {
        name: activity.name,
        category: activity.category,
        description: activity.description,
        cost: activity.averageCost || 0,
        duration: activity.duration || "2h",
        scheduledAt: scheduledAt || null
      })
    },
    onSuccess: () => {
      toast.success("Activity added to your stop!")
      queryClient.invalidateQueries({ queryKey: ['trip'] })
      setScheduledAt("")
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add activity")
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-black text-[#1E1B4B] font-heading">Add Activity</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search activities (e.g. Museum, Hiking)..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#6C47FF] focus:bg-white transition-all outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Browse by Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(selectedCat === cat ? null : cat)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${selectedCat === cat ? 'bg-[#6C47FF] text-white border-[#6C47FF] shadow-lg shadow-indigo-100' : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
          <label className="block text-xs font-black text-[#6C47FF] uppercase tracking-widest mb-2">Schedule Date (Optional)</label>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#6C47FF]" />
            <input 
              type="date" 
              className="flex-1 bg-white border-gray-200 rounded-xl p-2 text-sm font-bold focus:ring-[#6C47FF] outline-none"
              value={scheduledAt}
              min={trip?.startDate ? new Date(trip.startDate).toISOString().split('T')[0] : ""}
              max={trip?.endDate ? new Date(trip.endDate).toISOString().split('T')[0] : ""}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-medium">Leave empty to keep it in your &quot;Flexible Schedule&quot;</p>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {searching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C47FF]" />
              <p className="font-bold text-sm">Finding experiences...</p>
            </div>
          ) : activities?.length > 0 ? (
            activities.map((act: any) => (
              <div 
                key={act.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-[#6C47FF]/30 hover:bg-white hover:shadow-lg transition-all group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-[#6C47FF] uppercase">{act.category}</span>
                  </div>
                  <h4 className="font-bold text-gray-900">{act.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" /> 2h</span>
                    <span className="flex items-center gap-1 text-xs text-gray-900 font-bold"><DollarSign className="w-3 h-3" /> {act.averageCost || 0}</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const stop = trip?.stops?.find((s: any) => s.id === stopId);
                    const isAdded = stop?.activities?.some((a: any) => a.name === act.name);
                    if (isAdded) {
                      toast.error("This activity is already in your stop!");
                      return;
                    }
                    mutation.mutate(act)
                  }}
                  disabled={mutation.isPending || trip?.stops?.find((s: any) => s.id === stopId)?.activities?.some((a: any) => a.name === act.name)}
                  className={`p-3 rounded-xl shadow-md transition-all active:scale-90 ${
                    trip?.stops?.find((s: any) => s.id === stopId)?.activities?.some((a: any) => a.name === act.name)
                      ? 'bg-green-500 text-white cursor-default'
                      : 'bg-[#6C47FF] text-white hover:bg-[#5A35E5]'
                  }`}
                >
                  {trip?.stops?.find((s: any) => s.id === stopId)?.activities?.some((a: any) => a.name === act.name) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold italic">Search to find activities to add</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
