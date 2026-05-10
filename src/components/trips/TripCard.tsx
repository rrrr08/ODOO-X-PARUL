'use client'

import { format } from "date-fns"
import { getTripStatus } from "@/lib/utils"
import Link from "next/link"
import { MoreVertical, Globe, Lock, Calendar } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

interface TripCardProps {
  trip: any
  isOngoing?: boolean
  isSmall?: boolean
  variant?: 'wide' | 'thumbnail'
}

export function TripCard({ trip, isOngoing = false, isSmall = false, variant = 'wide' }: TripCardProps) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const status = getTripStatus(trip.startDate, trip.endDate)
  const isThumbnail = variant === 'thumbnail'
  const stopCount = trip.stops?.length || 0
  const spent = trip.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0
  
  const [isPublic, setIsPublic] = useState(trip.isPublic)
  const [isToggling, setIsToggling] = useState(false)

  const handleCardClick = () => {
    router.push(`/trips/${trip.id}`)
  }

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isToggling) return
    setIsToggling(true)
    
    const newStatus = !isPublic
    setIsPublic(newStatus)

    try {
      await axios.patch(`/api/trips/${trip.id}`, { isPublic: newStatus })
      toast.success(newStatus ? "Trip shared to community!" : "Trip made private")
      queryClient.invalidateQueries({ queryKey: ['community-posts'] })
    } catch (error) {
      setIsPublic(!newStatus)
      toast.error("Failed to update trip status")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`block bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer
        ${isOngoing ? 'border-[#6C47FF] ring-1 ring-[#6C47FF]/20 shadow-indigo-100' : 'border-gray-100'} 
        ${isSmall ? 'scale-95' : 'w-full'}`}
    >
      <div className={`flex ${isSmall ? 'flex-col' : 'flex-row'} gap-6 p-6`}>
        {/* ... Image Section remains same ... */}
        <div className={`${isSmall ? 'w-full h-40' : 'w-44 h-32'} rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden shrink-0 shadow-sm transition-transform duration-500 group-hover:scale-[1.02]`}>
          {trip.coverUrl ? (
            <img 
              src={trip.coverUrl} 
              alt={trip.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Globe className="w-10 h-10" />
            </div>
          )}
        </div>
        
        {/* ... Content Section remains same ... */}
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className={`font-black text-[#1E1B4B] tracking-tight truncate ${isSmall ? 'text-xl' : 'text-2xl'}`}>
                {trip.title}
              </h3>
              {isOngoing && <span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200 animate-pulse" />}
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {!isSmall && (
            <div className="flex items-center gap-3 mt-4">
              <div className="bg-indigo-50 text-[#6C47FF] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {stopCount} cities
              </div>
              {trip.totalBudget && (
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${spent > trip.totalBudget ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${Math.min((spent / trip.totalBudget) * 100, 100)}%` }} 
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions Section */}
        {!isSmall && (
          <div className="flex flex-col justify-between items-end gap-2 shrink-0 border-l pl-6 border-gray-50">
            <button 
              onClick={handleTogglePublic}
              disabled={isToggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                isPublic 
                  ? 'bg-indigo-50 text-[#6C47FF] border-indigo-100' 
                  : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
              }`}
            >
              {isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              {isPublic ? "Public" : "Private"}
            </button>

            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/trips/${trip.id}`)
                }}
                className="p-2.5 text-gray-400 hover:text-[#6C47FF] hover:bg-indigo-50 rounded-xl transition-all hover:scale-110"
                title="Edit Itinerary"
              >
                <MoreVertical className="w-5 h-5 rotate-90" />
              </button>
              
              <button 
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
                    try {
                      await axios.delete(`/api/trips/${trip.id}`)
                      toast.success("Trip deleted successfully")
                      queryClient.invalidateQueries({ queryKey: ['trips'] })
                    } catch (error) {
                      toast.error("Failed to delete trip")
                    }
                  }
                }}
                className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                title="Delete Trip"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

  )
}
