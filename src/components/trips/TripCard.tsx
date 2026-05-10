import { format } from "date-fns"
import { getTripStatus } from "@/lib/utils"
import Link from "next/link"
import { MoreVertical } from "lucide-react"

interface TripCardProps {
  trip: any
  variant?: 'wide' | 'thumbnail'
}

export function TripCard({ trip, variant = 'wide' }: TripCardProps) {
  const status = getTripStatus(trip.startDate, trip.endDate)
  const isThumbnail = variant === 'thumbnail'
  const stopCount = trip.stops?.length || 0
  const spent = trip.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0

  return (
    <Link href={`/trips/${trip.id}`} className={`block bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:bg-[#F5F3FF] transition-all hover:shadow-lg ${isThumbnail ? 'w-40 min-w-40' : 'w-full'}`}>
      <div className={`flex ${isThumbnail ? 'flex-col' : 'flex-row items-center'} gap-4 p-4`}>
        <div className={`${isThumbnail ? 'w-full h-24' : 'w-20 h-20'} rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden shrink-0`}>
          {trip.coverUrl && <img src={trip.coverUrl} alt={trip.title} className="w-full h-full object-cover" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1E1B4B] font-heading truncate">{trip.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</p>
          
          {!isThumbnail && (
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{stopCount} cities</span>
              {trip.totalBudget && (
                <div className="flex-1 max-w-[150px] flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#6C47FF]" style={{ width: `${Math.min((spent / trip.totalBudget) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isThumbnail && (
          <div className="flex items-center gap-3 ml-auto pl-4">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
              status === 'ongoing' ? 'bg-green-50 text-green-700 border-green-200' :
              status === 'upcoming' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <button className="p-2 text-gray-400 hover:text-[#6C47FF] hover:bg-indigo-50 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </Link>
  )
}
