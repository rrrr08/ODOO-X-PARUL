'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { Search, MapPin, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { TripCard } from "@/components/trips/TripCard"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { EmptyState } from "@/components/shared/EmptyState"

export default function Dashboard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const { data: topCities, isLoading: loadingCities } = useQuery({
    queryKey: ['topCities'],
    queryFn: async () => {
      const res = await axios.get('/api/search/cities?top=true&limit=5')
      return res.data
    }
  })

  const { data: recentTrips, isLoading: loadingTrips } = useQuery({
    queryKey: ['trips', { limit: 4 }],
    queryFn: async () => {
      const res = await axios.get('/api/trips?limit=4')
      return res.data
    }
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search/cities?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const comparisonNow = new Date()
  const ongoing = recentTrips?.filter((t: any) => {
    const s = new Date(t.startDate); s.setHours(0,0,0,0)
    const e = new Date(t.endDate); e.setHours(23,59,59,999)
    return comparisonNow >= s && comparisonNow <= e
  }) || []
  
  const upcoming = recentTrips?.filter((t: any) => {
    const s = new Date(t.startDate); s.setHours(0,0,0,0)
    return comparisonNow < s
  }) || []

  const completed = recentTrips?.filter((t: any) => {
    const e = new Date(t.endDate); e.setHours(23,59,59,999)
    return comparisonNow > e
  }) || []

  return (
    <div className="space-y-10 pb-10">
      {/* Hero Section */}
      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden shadow-md group">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#6C47FF]/80 to-[#F59E0B]/60 transition-opacity group-hover:opacity-90" />
        <div className="absolute inset-0 bg-black/10" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-8 shadow-sm">
            Where will you go next?
          </h1>
          
          <form onSubmit={handleSearch} className="w-full max-w-2xl relative group/search">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400 w-5 h-5 transition-colors group-focus-within/search:text-indigo-600" />
            <input 
              type="text" 
              placeholder="Search cities, activities..."
              className="w-full pl-16 pr-8 py-5 rounded-2xl text-lg shadow-2xl border-none ring-1 ring-black/5 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-gray-900 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Top Regional Selections */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1E1B4B] font-heading">Trending Destinations</h2>
          <Link href="/search/cities" className="text-[#6C47FF] font-medium hover:underline">View all</Link>
        </div>
        
        <div className="flex overflow-x-auto pb-6 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 gap-4 hide-scrollbar">
          {loadingCities ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-[160px] md:min-w-0 h-[200px] bg-gray-200 rounded-xl animate-pulse"></div>
            ))
          ) : (
            topCities?.map((city: any) => (
              <Link href={`/search/cities?q=${city.name}`} key={city.id} className="min-w-[160px] md:min-w-0 group cursor-pointer block relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:scale-105">
                <div className="h-[200px] bg-gradient-to-tr from-purple-200 to-indigo-100">
                  {city.imageUrl && <img src={city.imageUrl} alt={city.name} className="w-full h-full object-cover" />}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-white font-bold text-lg font-heading">{city.name}</h3>
                  <div className="flex items-center text-gray-300 text-sm mt-1 gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{city.country}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Your Trips Sections */}
      <section className="space-y-12">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-[#1E1B4B] font-heading">My Itineraries</h2>
          <Link href="/trips" className="text-[#6C47FF] font-medium hover:underline flex items-center gap-1">
            View All Trips <Globe className="w-4 h-4" />
          </Link>
        </div>

        {loadingTrips ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SkeletonCard lines={2} height="h-64" />
            <SkeletonCard lines={2} height="h-64" />
          </div>
        ) : !recentTrips?.length ? (
          <EmptyState 
            icon={<Globe className="w-16 h-16 text-[#6C47FF]/40" />}
            title="Start your first trip"
            description="You haven't planned any trips yet. Create your first itinerary today!"
            action={{ label: "+ Plan a Trip", href: "/trips/new" }}
          />
        ) : (
          <div className="space-y-12">
            {/* Ongoing Trips */}
            {ongoing.length > 0 && (
              <div className="animate-in slide-in-from-left-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-[#6C47FF] rounded-full" />
                  <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Ongoing Trips</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ongoing.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} isOngoing />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Trips */}
            {upcoming.length > 0 && (
              <div className="animate-in slide-in-from-left-4 duration-500 delay-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-[#F59E0B] rounded-full" />
                  <h3 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Upcoming Trips</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcoming.map((trip: any) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Trips */}
            {completed.length > 0 && (
              <div className="animate-in slide-in-from-left-4 duration-500 delay-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gray-300 rounded-full" />
                  <h3 className="text-xl font-bold text-gray-500 uppercase tracking-wider">Previous Trips</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {completed.map((trip: any) => (
                    <div key={trip.id} className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <TripCard trip={trip} isSmall />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Mobile Floating Action Button */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Link href="/trips/new" className="bg-[#6C47FF] text-white px-6 py-3 rounded-full shadow-xl font-medium flex items-center gap-2 hover:bg-[#5A35E5] transition-colors">
          <span className="text-xl leading-none mb-0.5">+</span> Plan a Trip
        </Link>
      </div>
    </div>
  )
}
