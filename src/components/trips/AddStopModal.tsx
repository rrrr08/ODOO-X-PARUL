'use client'

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { Search, MapPin, Loader2, X } from "lucide-react"

export function AddStopModal({ isOpen, onClose, tripId, lastOrder, existingStops }: any) {
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: cities, isLoading: searching } = useQuery({
    queryKey: ['city-search', search],
    queryFn: async () => {
      if (!search) return []
      const res = await axios.get(`/api/search/cities?q=${search}`)
      return res.data
    },
    enabled: search.length > 1
  })

  const mutation = useMutation({
    mutationFn: async (city: any) => {
      return axios.post(`/api/trips/${tripId}/stops`, {
        cityName: city.name,
        country: city.country,
        startDate: new Date(),
        endDate: new Date(),
        order: (lastOrder || 0) + 1
      })
    },
    onSuccess: () => {
      toast.success("Stop added to your itinerary!")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
      onClose()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to add stop")
    }
  })

  const handleAddStop = (city: any) => {
    const isDuplicate = existingStops?.some((s: any) => s.cityName.toLowerCase() === city.name.toLowerCase())
    if (isDuplicate) {
      toast.error(`${city.name} is already in your itinerary!`)
      return
    }
    mutation.mutate(city)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-[#1E1B4B] font-heading">Add a Stop</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search for a city (e.g. Paris, Tokyo)..."
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#6C47FF] focus:bg-white transition-all outline-none font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          {searching ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#6C47FF]" />
              <p className="font-bold text-sm">Searching the globe...</p>
            </div>
          ) : cities?.length > 0 ? (
            cities.map((city: any) => (
              <button 
                key={city.id}
                onClick={() => handleAddStop(city)}
                disabled={mutation.isPending}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#6C47FF] border border-gray-100 group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight">{city.name}</p>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{city.country}</p>
                </div>
              </button>
            ))
          ) : search.length > 1 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold italic">No cities found matching &quot;{search}&quot;</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 font-bold italic">Type at least 2 characters to search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
