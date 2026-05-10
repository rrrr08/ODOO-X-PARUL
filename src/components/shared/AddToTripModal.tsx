'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function AddToTripModal({ isOpen, onClose, city, activity }: any) {
  const [selectedTripId, setSelectedTripId] = useState("")
  const [selectedStopId, setSelectedStopId] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const queryClient = useQueryClient()

  const { data: trips, isLoading: loadingTrips } = useQuery({
    queryKey: ['trips-mini'],
    queryFn: async () => {
      const res = await axios.get('/api/trips?limit=10')
      return res.data
    },
    enabled: isOpen
  })

  const { data: stops, isLoading: loadingStops } = useQuery({
    queryKey: ['stops-mini', selectedTripId],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${selectedTripId}/stops`)
      return res.data
    },
    enabled: !!selectedTripId && !!activity
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (activity && selectedStopId) {
        return axios.post(`/api/stops/${selectedStopId}/activities`, {
          name: activity.name,
          category: activity.category,
          description: activity.description,
          cost: activity.cost,
          duration: activity.duration,
          scheduledAt: scheduledAt || null
        })
      } else if (city) {
        return axios.post(`/api/trips/${selectedTripId}/stops`, {
          cityName: city.name,
          country: city.country,
          startDate: new Date(),
          endDate: new Date(),
          order: 0
        })
      }
    },
    onSuccess: () => {
      toast.success(`Added ${city ? city.name : activity.name} to trip!`)
      queryClient.invalidateQueries({ queryKey: ['trip'] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add to trip")
    }
  })

  // Smart Filtering Logic
  const matchingStops = stops?.filter((s: any) => 
    !activity || s.cityName.toLowerCase() === activity.cityName?.toLowerCase() || s.cityName.toLowerCase() === activity.name.split(' ')[0].toLowerCase()
  ) || []

  const hasNoMatchingStop = activity && selectedTripId && matchingStops.length === 0 && !loadingStops

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold font-heading text-[#1E1B4B] mb-6">
          Add {city ? city.name : activity?.name} to Trip
        </h2>
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Destination Trip</label>
            <select 
              value={selectedTripId}
              onChange={(e) => {
                setSelectedTripId(e.target.value)
                setSelectedStopId("")
              }}
              className="w-full border-gray-200 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-3 border transition-all"
            >
              <option value="">Choose a trip...</option>
              {Array.isArray(trips) && trips.map((trip: any) => (
                <option key={trip.id} value={trip.id}>{trip.title}</option>
              ))}
            </select>
            {loadingTrips && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading your trips...</p>}
          </div>

          {activity && selectedTripId && !hasNoMatchingStop && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Stop City</label>
              <select 
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="w-full border-gray-200 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-3 border transition-all"
              >
                <option value="">Choose a stop...</option>
                {matchingStops.map((stop: any) => (
                  <option key={stop.id} value={stop.id}>{stop.cityName}, {stop.country}</option>
                ))}
              </select>
              {loadingStops && <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Loading stops...</p>}
            </div>
          )}

          {selectedStopId && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Date (Optional)</label>
              <input 
                type="date" 
                className="w-full border-gray-200 rounded-xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-3 border transition-all"
                value={scheduledAt}
                min={trips?.find((t:any)=>t.id === selectedTripId)?.startDate?.split('T')[0]}
                max={trips?.find((t:any)=>t.id === selectedTripId)?.endDate?.split('T')[0]}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">Assign to a specific day in your itinerary.</p>
            </div>
          )}

          {hasNoMatchingStop && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl animate-in shake duration-500">
              <p className="text-sm text-amber-800 font-medium mb-3">
                Wait! You haven&apos;t added {activity.cityName || "this city"} to your trip itinerary yet.
              </p>
              <button 
                onClick={() => {
                  // Logic to add city stop then activity would go here, 
                  // but for now let's guide them to add the city first
                  toast.info(`Please add the city stop first!`)
                }}
                className="text-xs font-bold text-amber-900 underline"
              >
                How do I add this city?
              </button>
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-3 justify-end">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => mutation.mutate()}
            disabled={!selectedTripId || (!!activity && !selectedStopId) || mutation.isPending}
            className="px-6 py-2.5 font-bold text-white bg-[#6C47FF] hover:bg-[#5A35E5] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-[#6C47FF]/20 flex items-center gap-2"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {hasNoMatchingStop ? "Location Mismatch" : "Add to Trip"}
          </button>
        </div>
      </div>
    </div>
  )
}
