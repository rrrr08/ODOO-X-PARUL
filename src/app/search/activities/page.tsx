'use client'

import { SearchLayout } from "@/components/search/SearchLayout"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { Clock, DollarSign, Plus } from "lucide-react"
import { AddToTripModal } from "@/components/shared/AddToTripModal"
import { useState } from "react"
import { SkeletonCard } from "@/components/shared/SkeletonCard"

export default function ActivitiesSearch() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const sortBy = searchParams.get('sortBy') || 'Popular'
  const filterBy = searchParams.get('filterBy') || 'All'
  const groupBy = searchParams.get('groupBy') || 'None'
  const [category, setCategory] = useState('All')
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleAddClick = (activity: any) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', q],
    queryFn: async () => {
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

  // Filter & Sort logic
  let processed = [...(activities || [])]

  // Category chip filter
  if (category !== 'All') {
    processed = processed.filter(a => a.category === category)
  }

  // Price filter
  if (filterBy === 'Budget') processed = processed.filter(a => a.cost < 50)
  if (filterBy === 'Mid') processed = processed.filter(a => a.cost >= 50 && a.cost <= 150)
  if (filterBy === 'Luxury') processed = processed.filter(a => a.cost > 150)

  // Sort
  if (sortBy === 'PriceLow') processed.sort((a, b) => a.cost - b.cost)
  if (sortBy === 'PriceHigh') processed.sort((a, b) => b.cost - a.cost)
  if (sortBy === 'Duration') processed.sort((a, b) => a.duration - b.duration)

  const groups: Record<string, any[]> = {}
  if (groupBy === 'Category') {
    processed.forEach(a => {
      if (!groups[a.category]) groups[a.category] = []
      groups[a.category].push(a)
    })
  } else {
    groups['All'] = processed
  }

  const categoryColors: Record<string, string> = {
    'Sightseeing': 'bg-blue-100 text-blue-700',
    'Food': 'bg-orange-100 text-orange-700',
    'Culture': 'bg-purple-100 text-purple-700',
    'Adventure': 'bg-green-100 text-green-700',
    'Transport': 'bg-gray-100 text-gray-700',
    'Shopping': 'bg-pink-100 text-pink-700',
  }

  return (
    <SearchLayout placeholder="Search activities...">
      {/* Category filter chips */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-6 py-2">
        {['All', 'Sightseeing', 'Food', 'Adventure', 'Transport', 'Shopping', 'Culture'].map((cat) => (
          <button 
            key={cat} 
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-black whitespace-nowrap transition-all ${
              category === cat 
                ? 'bg-[#6C47FF] text-white shadow-lg scale-105' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} height="h-64" />)}
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groups).map(([groupName, items]) => (
            <div key={groupName}>
              {groupBy !== 'None' && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-[#6C47FF] rounded-full" />
                  <h2 className="text-xl font-black text-[#1E1B4B] uppercase tracking-wider">{groupName}</h2>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">{items.length} Activities</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((activity: any) => (
                  <div key={activity.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                    <div className="h-44 bg-gray-100 relative">
                      {activity.imageUrl && <img src={activity.imageUrl} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${categoryColors[activity.category] || 'bg-gray-100 text-gray-700'}`}>
                          {activity.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-[#1E1B4B] text-lg mb-3 leading-tight">{activity.name}</h3>
                      <div className="flex items-center gap-6 text-xs text-gray-400 font-bold mb-6 mt-auto uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#6C47FF]" />
                          {Math.round(activity.duration / 60)} hrs
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-900">
                          <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                          {activity.cost}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddClick(activity)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#6C47FF] text-white hover:bg-[#5A35E5] transition-all font-bold shadow-md hover:shadow-indigo-200"
                      >
                        <Plus className="w-4 h-4" /> Add to Trip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {processed.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic text-lg">No activities found matching your filters.</p>
              <button onClick={() => setCategory('All')} className="text-[#6C47FF] font-black mt-4 underline">Clear Filters</button>
            </div>
          )}
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
