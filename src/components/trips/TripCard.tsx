'use client'

import { format } from "date-fns"
import { getTripStatus } from "@/lib/utils"
import Link from "next/link"
import { MoreVertical, Globe, Lock, Calendar } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

interface TripCardProps {
  trip: any
  isOngoing?: boolean
  isSmall?: boolean
  variant?: 'wide' | 'thumbnail'
}

export function TripCard({ trip, isOngoing = false, isSmall = false, variant = 'wide' }: TripCardProps) {
  const queryClient = useQueryClient()
  const status = getTripStatus(trip.startDate, trip.endDate)
  const isThumbnail = variant === 'thumbnail'
  const stopCount = trip.stops?.length || 0
  const spent = trip.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0
  
  const [isPublic, setIsPublic] = useState(trip.isPublic)
  const [isToggling, setIsToggling] = useState(false)

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
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
    <Link 
      href={`/trips/${trip.id}`} 
      className={`block bg-white rounded-2xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
        ${isOngoing ? 'border-[#6C47FF] ring-1 ring-[#6C47FF]/20 shadow-indigo-100' : 'border-gray-100'} 
        ${isSmall ? 'scale-95' : 'w-full'}`}
    >
      <div className={`flex ${isSmall ? 'flex-col' : 'flex-row'} gap-6 p-6`}>
        {/* Image Section */}
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
        
        {/* Content Section */}
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
          <div className="flex flex-col justify-between items-end gap-2 shrink-0">
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

            <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
