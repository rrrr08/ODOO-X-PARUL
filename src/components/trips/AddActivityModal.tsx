'use client'

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Search, Plus, Loader2, X, Clock, DollarSign } from "lucide-react"

export function AddActivityModal({ isOpen, onClose, stopId, trip }: any) {
  const [search, setSearch] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const queryClient = useQueryClient()

  const { data: activities, isLoading: searching } = useQuery({
    queryKey: ['activity-search', search],
    queryFn: async () => {
      if (!search) return []
      const res = await axios.get(`/api/search/activities?q=${search}`)
      return res.data
    },
    enabled: search.length > 1
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
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-[#1E1B4B] font-heading">Add Activity</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search activities (e.g. Museum, Hiking)..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#6C47FF] focus:bg-white transition-all outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                  onClick={() => mutation.mutate(act)}
                  disabled={mutation.isPending}
                  className="bg-[#6C47FF] text-white p-3 rounded-xl shadow-md hover:bg-[#5A35E5] transition-all active:scale-90"
                >
                  <Plus className="w-5 h-5" />
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
