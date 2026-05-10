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
  const [filter, setFilter] = useState<"All" | "Ongoing" | "Upcoming" | "Completed" | "Templates">("All")
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Alphabetical">("Newest")
  const [groupBy, setGroupBy] = useState<"None" | "Status" | "Month">("Status")

  const { data: trips, isLoading } = useQuery({
    queryKey: ['trips', { includeTemplates: true }],
    queryFn: async () => {
      const res = await axios.get('/api/trips?includeTemplates=true')
      return res.data
    }
  })

  const now = new Date()

  // 1. Filter & Search
  let processedTrips = trips?.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    
    if (filter === "Templates") return matchesSearch && t.isTemplate
    
    // If not looking for templates specifically, hide templates from general views unless it's "All"?
    // Actually, let's show templates in "All" but clearly marked.
    
    const tripStart = new Date(t.startDate)
    tripStart.setHours(0, 0, 0, 0)
    
    const tripEnd = new Date(t.endDate)
    tripEnd.setHours(23, 59, 59, 999)
    
    const comparisonNow = new Date()
    
    if (filter === "Ongoing") return matchesSearch && !t.isTemplate && comparisonNow >= tripStart && comparisonNow <= tripEnd
    if (filter === "Upcoming") return matchesSearch && !t.isTemplate && comparisonNow < tripStart
    if (filter === "Completed") return matchesSearch && !t.isTemplate && comparisonNow > tripEnd
    return matchesSearch
  }) || []

  // 2. Sort
  processedTrips.sort((a: any, b: any) => {
    if (sortBy === "Alphabetical") return a.title.localeCompare(b.title)
    const timeA = new Date(a.startDate).getTime()
    const timeB = new Date(b.startDate).getTime()
    return sortBy === "Newest" ? timeB - timeA : timeA - timeB
  })

  return (
    <div className="space-y-8">
      <PageHeader 
        title="My Trips" 
        actions={
          <Link href="/trips/new" className="bg-[#6C47FF] hover:bg-[#5A35E5] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#6C47FF]/20 active:scale-95 hidden sm:block">
            + Plan a Trip
          </Link>
        }
      />

      <div className="flex flex-col gap-6 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search trips by name..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:border-[#6C47FF] focus:ring-4 focus:ring-[#6C47FF]/5 outline-none transition-all font-medium text-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
            {["All", "Ongoing", "Upcoming", "Completed", "Templates"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${
                  filter === status 
                    ? "bg-white text-[#6C47FF] shadow-sm scale-105" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Group:</span>
              <select 
                value={groupBy} 
                onChange={(e: any) => setGroupBy(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-[#1E1B4B] focus:ring-0 p-1 cursor-pointer"
              >
                <option value="Status">Status</option>
                <option value="Month">Month</option>
                <option value="None">None</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sort:</span>
              <select 
                value={sortBy} 
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-[#1E1B4B] focus:ring-0 p-1 cursor-pointer"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
                <option value="Alphabetical">A-Z</option>
              </select>
            </div>
          </div>
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
          {(() => {
            if (groupBy === "None") {
              return (
                <div className="space-y-4">
                  {processedTrips.map((t: any) => <TripCard key={t.id} trip={t} />)}
                </div>
              )
            }

            const groups: Record<string, any[]> = {}
            processedTrips.forEach((t: any) => {
              let key = ""
              if (t.isTemplate) {
                key = "Templates"
              } else if (groupBy === "Status") {
                const tripStart = new Date(t.startDate); tripStart.setHours(0,0,0,0)
                const tripEnd = new Date(t.endDate); tripEnd.setHours(23,59,59,999)
                const cNow = new Date()
                if (tripStart <= cNow && tripEnd >= cNow) key = "Ongoing"
                else if (tripStart > cNow) key = "Upcoming"
                else key = "Completed"
              } else if (groupBy === "Month") {
                key = format(new Date(t.startDate), 'MMMM yyyy')
              }
              if (!groups[key]) groups[key] = []
              groups[key].push(t)
            })

            // Sort group keys if needed (e.g. Month order)
            const sortedKeys = Object.keys(groups).sort((a, b) => {
              if (groupBy === "Status" || a === "Templates" || b === "Templates") {
                const order = { "Ongoing": 0, "Upcoming": 1, "Completed": 2, "Templates": 3 }
                return (order[a as keyof typeof order] ?? 4) - (order[b as keyof typeof order] ?? 4)
              }
              if (groupBy === "Month") {
                return new Date(b).getTime() - new Date(a).getTime() // Newest month first
              }
              return a.localeCompare(b)
            })

            return sortedKeys.map(key => (
              <section key={key} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h3 className="flex items-center gap-3 font-black text-xs text-[#1E1B4B] mb-6 uppercase tracking-widest">
                  <div className={`w-2 h-2 rounded-full ${
                    key === 'Ongoing' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                    key === 'Upcoming' ? 'bg-[#6C47FF] shadow-[0_0_8px_rgba(108,71,255,0.5)]' : 
                    'bg-gray-300'
                  }`} />
                  {key}
                  <span className="text-gray-300 text-[10px] font-bold">({groups[key].length})</span>
                </h3>
                <div className="space-y-4">
                  {groups[key].map((t: any) => <TripCard key={t.id} trip={t} />)}
                </div>
              </section>
            ))
          })()}
          
          {processedTrips.length === 0 && trips.length > 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-bold italic">No trips found matching your current filters.</p>
              <button onClick={() => {setSearch(""); setFilter("All");}} className="text-[#6C47FF] text-xs font-black mt-2 uppercase tracking-widest underline">Clear all filters</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
