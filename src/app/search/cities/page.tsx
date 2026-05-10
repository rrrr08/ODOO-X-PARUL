'use client'

import { SearchLayout } from "@/components/search/SearchLayout"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSearchParams } from "next/navigation"
import { Star, Plus } from "lucide-react"
import { useState } from "react"
import { AddToTripModal } from "@/components/shared/AddToTripModal"

export default function CitiesSearch() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const [selectedCity, setSelectedCity] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [maxCost, setMaxCost] = useState(5)
  const [region, setRegion] = useState<string | null>(null)

  const handleAddClick = (city: any) => {
    setSelectedCity(city)
    setIsModalOpen(true)
  }

  const { data: cities, isLoading } = useQuery({
    queryKey: ['cities', q, maxCost, region],
    queryFn: async () => {
      const res = await axios.get(`/api/search/cities?q=${q}&maxCost=${maxCost}${region ? `&region=${region}` : ''}`)
      return res.data
    }
  })

  return (
    <SearchLayout placeholder="Search cities...">
      <div className="flex flex-col md:flex-row gap-8 mt-6">
        {/* Sidebar Filters */}
        <div className="md:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="font-black text-xs text-[#1E1B4B] mb-4 uppercase tracking-widest">Budget Level</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setMaxCost(level)}
                  className={`h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                    maxCost === level 
                      ? 'bg-[#F59E0B] border-[#F59E0B] text-white shadow-lg shadow-amber-100 scale-105' 
                      : 'bg-white text-gray-400 border-gray-100 hover:border-amber-200'
                  }`}
                >
                  <span className={`font-black tracking-tighter ${level > 3 ? 'text-[10px]' : 'text-sm'}`}>
                    {'$'.repeat(level)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-black text-xs text-[#1E1B4B] mb-4 uppercase tracking-widest">Region</h3>
            <select 
              className="w-full bg-white border border-gray-100 rounded-xl p-3 text-sm font-bold text-[#1E1B4B] outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
              onChange={(e) => setRegion(e.target.value || null)}
            >
              <option value="">All Regions</option>
              <option value="Europe">Europe</option>
              <option value="Asia">Asia</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Africa">Africa</option>
              <option value="Oceania">Oceania</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
      {isLoading ? (
        <div className="space-y-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse">
              <div className="w-[72px] h-[72px] bg-gray-200 rounded-lg shrink-0 mr-4"></div>
              <div className="flex-1 py-1">
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 w-1/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mt-6">
          {cities?.map((city: any) => (
            <div key={city.id} className="flex items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group">
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gradient-to-tr from-indigo-200 to-purple-200 shadow-inner">
                {city.imageUrl && <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
              </div>
              <div className="ml-5 flex-1">
                <h3 className="font-bold text-xl text-[#1E1B4B] group-hover:text-[#6C47FF] transition-colors">{city.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{city.country}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="font-black text-[#F59E0B] tracking-widest">{Array.from({length: city.costIndex}).map(()=>'$').join('')}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < city.popularity / 20 ? 'fill-[#F59E0B] text-[#F59E0B]' : 'fill-gray-100 text-gray-100'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleAddClick(city)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#6C47FF]/10 text-[#6C47FF] font-bold hover:bg-[#6C47FF] hover:text-white hover:border-[#6C47FF] transition-all text-sm"
              >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add to Trip</span>
              </button>
            </div>
          ))}
          {cities?.length === 0 && (
            <div className="text-center py-12 text-gray-500">No cities found matching your search.</div>
          )}
        </div>
      )}

        </div>
      </div>

      <AddToTripModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        city={selectedCity} 
      />
    </SearchLayout>
  )
}
