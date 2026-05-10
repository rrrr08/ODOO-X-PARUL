'use client'

import { SearchLayout } from "@/components/search/SearchLayout"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { Clock, DollarSign, Plus } from "lucide-react"
import { AddToTripModal } from "@/components/shared/AddToTripModal"
import { useState } from "react"

export default function ActivitiesSearch() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddClick = (activity: any) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', q],
    queryFn: async () => {
      // Create this endpoint if needed, returning empty array for now as mock
      try {
        const res = await axios.get(`/api/search/activities?q=${q}`)
        return res.data
      } catch (e) {
        return [
          { id: '1', name: 'Eiffel Tower Visit', category: 'Sightseeing', duration: 180, cost: 35, imageUrl: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=400' },
          { id: '2', name: 'Sushi Making Class', category: 'Food', duration: 120, cost: 85, imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400' },
          { id: '3', name: 'Colosseum Tour', category: 'Culture', duration: 240, cost: 45, imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400' },
        ]
      }
    }
  })

  const categoryColors: Record<string, string> = {
    'Sightseeing': 'bg-blue-100 text-blue-700',
    'Food': 'bg-orange-100 text-orange-700',
    'Culture': 'bg-purple-100 text-purple-700',
    'Adventure': 'bg-green-100 text-green-700',
  }

  return (
    <SearchLayout placeholder="Search activities...">
      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 py-2">
        {['All', 'Sightseeing', 'Food', 'Adventure', 'Transport', 'Shopping', 'Culture'].map((cat, i) => (
          <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-[#1E1B4B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse flex flex-col">
              <div className="h-32 bg-gray-200 rounded-t-xl" />
              <div className="p-4 flex-1">
                <div className="h-4 bg-gray-200 w-3/4 rounded mb-2" />
                <div className="h-3 bg-gray-200 w-1/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities?.map((activity: any) => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group flex flex-col">
              <div className="h-40 bg-gradient-to-tr from-gray-200 to-gray-300 relative">
                {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover" />}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${categoryColors[activity.category] || 'bg-gray-100 text-gray-700'}`}>
                    {activity.category}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-[#1E1B4B] text-lg mb-2">{activity.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-auto">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.round(activity.duration / 60)} hrs
                  </div>
                  <div className="flex items-center gap-1 font-medium text-gray-900">
                    <DollarSign className="w-4 h-4" />
                    {activity.cost}
                  </div>
                </div>
                <button 
                  onClick={() => handleAddClick(activity)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[#6C47FF] text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Add to Trip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddToTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activity={selectedActivity} 
      />
    </SearchLayout>
  )
}
