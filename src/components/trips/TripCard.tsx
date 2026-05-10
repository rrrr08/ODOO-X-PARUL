'use client'

import { format } from "date-fns"
import { getTripStatus } from "@/lib/utils"
import Link from "next/link"
import { MoreVertical, Globe, Lock } from "lucide-react"
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
      <div className={`flex ${isSmall ? 'flex-col' : 'flex-row items-center'} gap-5 p-5`}>
        <div className={`${isSmall ? 'w-full h-32' : 'w-24 h-24'} rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500`}>
          {trip.coverUrl ? (
            <img src={trip.coverUrl} alt={trip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50">
              <Globe className="w-8 h-8" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className={`font-bold text-[#1E1B4B] font-heading truncate ${isSmall ? 'text-lg' : 'text-xl'}`}>{trip.title}</h3>
            {isOngoing && <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />}
            {isPublic ? <Globe className="w-4 h-4 text-[#6C47FF]" /> : <Lock className="w-4 h-4 text-gray-300" />}
          </div>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
          </p>
          
          {!isSmall && (
            <div className="flex items-center gap-5 mt-4">
              <div className="bg-indigo-50 text-[#6C47FF] px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                {stopCount} cities
              </div>
              {trip.totalBudget && (
                <div className="flex-1 max-w-[200px] space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span>Budget Used</span>
                    <span>{Math.round((spent / trip.totalBudget) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${spent > trip.totalBudget ? 'bg-red-500' : 'bg-gradient-to-r from-[#6C47FF] to-[#F59E0B]'}`} 
                      style={{ width: `${Math.min((spent / trip.totalBudget) * 100, 100)}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isSmall && (
          <div className="flex items-center gap-4 ml-auto pl-4">
            <button 
              onClick={handleTogglePublic}
              disabled={isToggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                isPublic 
                  ? 'bg-indigo-50 text-[#6C47FF] border-indigo-100 hover:bg-indigo-100 shadow-sm' 
                  : 'bg-white text-gray-400 border-gray-100 hover:text-gray-600 hover:border-gray-200'
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isPublic ? "Shared" : "Keep Private"}
            </button>

            <button className="p-2.5 text-gray-400 hover:text-[#6C47FF] hover:bg-indigo-50 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
