'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Globe, X, MapPin, Loader2, Send } from "lucide-react"

export function ShareTripModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const queryClient = useQueryClient()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [comment, setComment] = useState("")

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips-for-sharing'],
    queryFn: async () => {
      const res = await axios.get('/api/trips?includeTemplates=true')
      return res.data
    }
  })

  const shareMutation = useMutation({
    mutationFn: async () => {
      await axios.post('/api/community', { 
        tripId: selectedTripId, 
        body: comment 
      })
      return true
    },
    onSuccess: () => {
      toast.success("Trip shared with the community!")
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
      onClose()
    },
    onError: () => {
      toast.error("Failed to share trip")
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-[#1E1B4B] font-heading">Share Your Journey</h2>
            <p className="text-gray-400 text-sm font-medium">Inspire the community with your itinerary</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Select a Trip</label>
            <div className="grid gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[#6C47FF]" /></div>
              ) : trips?.map((trip: any) => (
                <button 
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    selectedTripId === trip.id 
                      ? 'border-[#6C47FF] bg-indigo-50/50 ring-2 ring-[#6C47FF]/10' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border ${
                    selectedTripId === trip.id ? 'bg-[#6C47FF] text-white' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-gray-900 truncate">{trip.title}</p>
                      {trip.isTemplate && (
                        <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">Template</span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{trip.stops?.length || 0} stops</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3">What makes this trip special?</label>
            <textarea 
              rows={3}
              placeholder="e.g. Hidden coffee shops in Kyoto, or the best sunset spot in Santorini..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-4 focus:ring-[#6C47FF]/5 outline-none transition-all"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <button 
            disabled={!selectedTripId || shareMutation.isPending}
            onClick={() => shareMutation.mutate()}
            className="w-full bg-[#6C47FF] hover:bg-[#5A35E5] text-white py-4 rounded-2xl font-black shadow-xl hover:shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {shareMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Share with Community
          </button>
        </div>
      </div>
    </div>
  )
}
