'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { useState } from "react"
import { format } from "date-fns"
import { MapPin, Clock, List, Calendar as CalendarIcon, DollarSign } from "lucide-react"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Link from "next/link"

export default function ItineraryView() {
  const params = useParams()
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

  if (isLoading) {
    return <SkeletonCard height="h-[500px]" lines={4} />
  }

  // Derived data for budget chart
  const spent = trip?.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0
  const budgetData = [
    { name: 'Spent', value: spent, color: '#6C47FF' },
    { name: 'Remaining', value: Math.max((trip?.totalBudget || 0) - spent, 0), color: '#22c55e' }
  ]

  // Group activities by day
  const groupedByDay: Record<string, { date: Date, activities: any[], stops: Set<string> }> = {}
  
  if (trip?.stops) {
    let dayCounter = 1
    const tripStart = new Date(trip.startDate)
    
    // Simplistic grouping: just iterate days from start to end and find activities
    const daysLength = Math.ceil((new Date(trip.endDate).getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    for (let i = 0; i < daysLength; i++) {
      const currentDate = new Date(tripStart)
      currentDate.setDate(currentDate.getDate() + i)
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      
      groupedByDay[`Day ${dayCounter}`] = {
        date: currentDate,
        activities: [],
        stops: new Set()
      }

      trip.stops.forEach((stop: any) => {
        const stopStart = new Date(stop.startDate)
        const stopEnd = new Date(stop.endDate)
        if (currentDate >= stopStart && currentDate <= stopEnd) {
          groupedByDay[`Day ${dayCounter}`].stops.add(`${stop.cityName}, ${stop.country}`)
          
          stop.activities?.forEach((act: any) => {
            if (act.scheduledAt && format(new Date(act.scheduledAt), 'yyyy-MM-dd') === dateStr) {
              groupedByDay[`Day ${dayCounter}`].activities.push(act)
            }
          })
        }
      })
      
      dayCounter++
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1E1B4B] to-[#6C47FF]">
          {trip?.coverUrl && <img src={trip.coverUrl} className="w-full h-full object-cover opacity-60" alt="" />}
        </div>
        <div className="absolute bottom-4 left-6 text-white">
          <h1 className="text-3xl font-bold font-heading">{trip?.title}</h1>
          <p className="mt-1 opacity-90">{format(new Date(trip?.startDate || new Date()), 'MMM d')} – {format(new Date(trip?.endDate || new Date()), 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* Tab bar & View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-2 gap-4">
        <div className="flex gap-6 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {["Itinerary Builder", "View Itinerary", "Budget", "Notes", "Checklist"].map((tab, i) => (
            <Link 
              href={`/trips/${params.id}${i===0 ? '' : i===1 ? '/view' : i===2 ? '/budget' : i===3 ? '/notes' : '/checklist'}`}
              key={tab} 
              className={`pb-3 -mb-[9px] font-medium whitespace-nowrap transition-colors ${i === 1 ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {tab}
            </Link>
          ))}
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#1E1B4B]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <List className="w-4 h-4" /> List View
          </button>
          <button 
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-white shadow-sm text-[#1E1B4B]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <CalendarIcon className="w-4 h-4" /> Calendar
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="lg:w-2/3">
          {viewMode === 'list' ? (
            <div className="space-y-12 pb-12">
              {Object.entries(groupedByDay).map(([dayLabel, data]) => (
                <div key={dayLabel} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold font-heading text-[#1E1B4B] pl-4 border-l-4 border-[#6C47FF]">
                      {dayLabel} <span className="text-gray-400 font-normal text-lg ml-2">{format(data.date, 'EEEE, MMM d')}</span>
                    </h2>
                  </div>
                  
                  {Array.from(data.stops).map(stopName => (
                    <div key={stopName} className="inline-flex items-center gap-2 bg-indigo-50 text-[#6C47FF] px-3 py-1 rounded-md text-sm font-medium mb-6">
                      <MapPin className="w-4 h-4" /> {stopName}
                    </div>
                  ))}

                  <div className="space-y-0 relative ml-2 md:ml-4">
                    {/* Timeline Line */}
                    <div className="absolute top-4 bottom-4 left-4 w-0.5 bg-gray-200 border-dashed border-gray-300" />
                    
                    {data.activities.length === 0 ? (
                      <div className="pl-12 py-4 text-gray-400 italic text-sm">No scheduled activities for this day.</div>
                    ) : (
                      data.activities.map((act: any) => (
                        <div key={act.id} className="relative pl-12 py-4 group">
                          {/* Timeline Dot */}
                          <div className="absolute left-[13px] top-7 w-2.5 h-2.5 bg-[#6C47FF] rounded-full ring-4 ring-white group-hover:scale-125 transition-transform" />
                          
                          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="sm:w-24 shrink-0 text-gray-500 text-sm font-medium flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {act.scheduledAt ? format(new Date(act.scheduledAt), 'hh:mm a') : 'Any time'}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <h4 className="font-bold text-[#1E1B4B]">{act.name}</h4>
                                  {act.description && <p className="text-gray-500 text-sm mt-1 line-clamp-1">{act.description}</p>}
                                </div>
                                <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs shrink-0">{act.category}</span>
                              </div>
                            </div>

                            <div className="sm:text-right shrink-0">
                              <div className="inline-flex items-center font-medium bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm">
                                <DollarSign className="w-3.5 h-3.5" /> {act.cost}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {data.activities.length > 0 && (
                    <div className="mt-4 ml-12 bg-gray-50 inline-block px-4 py-2 rounded-lg text-sm text-gray-600 border border-gray-100 shadow-sm font-medium">
                      Day total: ${data.activities.reduce((sum: number, a: any) => sum + (a.cost || 0), 0)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center text-gray-400">
              Calendar View Implementation Details Omitted
            </div>
          )}
        </div>

        {/* Right Sidebar - Budget Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-6">Budget Overview</h3>
            
            <div className="mb-6 flex flex-col items-center">
              <div className="h-40 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={budgetData}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {budgetData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val: number) => `$${val}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-gray-500 text-xs font-medium">Spent</span>
                  <span className="text-lg font-bold text-[#1E1B4B]">${spent}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Budget</span>
                <span className="font-medium">${trip?.totalBudget || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Spent</span>
                <span className="font-medium text-[#6C47FF]">${spent}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${spent > (trip?.totalBudget || 0) ? 'bg-red-500' : 'bg-[#6C47FF]'}`} 
                  style={{ width: `${Math.min((spent / (trip?.totalBudget || 1)) * 100, 100)}%` }} 
                />
              </div>
            </div>

            <Link href={`/trips/${params.id}/budget`} className="block w-full text-center mt-6 text-[#6C47FF] text-sm font-medium hover:underline">
              View Full Invoice →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
