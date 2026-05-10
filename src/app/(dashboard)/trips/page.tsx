'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Link from "next/link"
import { TripCard } from "@/components/trips/TripCard"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Search, Filter, ArrowUpDown, Plane } from "lucide-react"
import { useState } from "react"

export default function TripsListing() {
  const [search, setSearch] = useState("")

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const res = await axios.get('/api/trips')
      return res.data
    }
  })

  const filteredTrips = trips?.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase())) || []

  const now = new Date()
  const ongoing = filteredTrips.filter((t: any) => new Date(t.startDate) <= now && new Date(t.endDate) >= now)
  const upcoming = filteredTrips.filter((t: any) => new Date(t.startDate) > now)
  const completed = filteredTrips.filter((t: any) => new Date(t.endDate) < now)

  return (
    <div className="space-y-8">
      <PageHeader 
        title="My Trips" 
        actions={
          <Link href="/trips/new" className="bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md hidden sm:block">
            + Plan a Trip
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search trips..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#6C47FF] focus:ring-1 focus:ring-[#6C47FF] outline-none transition-shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <ArrowUpDown className="w-4 h-4" /> Sort
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      ) : trips?.length === 0 ? (
        <EmptyState 
          icon={<Plane className="w-16 h-16 text-[#6C47FF]/40" />}
          title="No trips yet"
          description="It's time to start planning your next great adventure."
          action={{ label: "Plan your first trip →", href: "/trips/new" }}
        />
      ) : (
        <div className="space-y-8">
          {ongoing.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-[#1E1B4B] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Ongoing
              </h3>
              <div className="space-y-4">
                {ongoing.map((t: any) => <TripCard key={t.id} trip={t} />)}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-[#1E1B4B] mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Upcoming
              </h3>
              <div className="space-y-4">
                {upcoming.map((t: any) => <TripCard key={t.id} trip={t} />)}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-[#1E1B4B] mb-4 text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Completed
              </h3>
              <div className="space-y-4 opacity-80">
                {completed.map((t: any) => <TripCard key={t.id} trip={t} />)}
              </div>
            </section>
          )}
          
          {filteredTrips.length === 0 && trips.length > 0 && (
            <div className="text-center py-12 text-gray-500">
              No trips found matching &quot;{search}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
