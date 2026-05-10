import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { PageHeader } from "@/components/shared/PageHeader"
import { MapPin, Calendar, Clock, DollarSign } from "lucide-react"

export default async function ShareTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = await prisma.trip.findFirst({
    where: {
      id,
      isPublic: true
    },
    include: {
      stops: {
        orderBy: { order: 'asc' },
        include: {
          activities: {
            orderBy: { scheduledAt: 'asc' }
          }
        }
      },
      user: {
        select: {
          name: true,
          image: true
        }
      }
    }
  })

  if (!trip) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-[300px] bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          {trip.coverUrl && <img src={trip.coverUrl} className="w-full h-full object-cover" alt={trip.title} />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <h1 className="text-4xl font-bold font-heading mb-2">{trip.title}</h1>
            <p className="opacity-90 max-w-2xl">{trip.description}</p>
          </div>
        </div>

        <div className="p-8">
          {/* Metadata */}
          <div className="flex flex-wrap gap-6 mb-10 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-gray-700">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-gray-700">{trip.stops.length} Stops</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {trip.user.image && <img src={trip.user.image} alt={trip.user.name || ""} />}
              </div>
              <span className="text-sm text-gray-500">Planned by {trip.user.name || "User"}</span>
            </div>
          </div>

          {/* Itinerary */}
          <div className="space-y-12">
            {trip.stops.map((stop, index) => (
              <div key={stop.id} className="relative pl-8 border-l-2 border-dashed border-indigo-100 last:border-l-0 pb-12 last:pb-0">
                <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-indigo-500 border-4 border-white shadow-sm" />
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Stop {index + 1}: {stop.cityName}, {stop.country}
                  </h2>
                  <span className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">
                    {new Date(stop.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {stop.activities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 p-5 rounded-2xl flex items-start gap-4 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-500 shrink-0">
                        {activity.category === 'Food' ? <DollarSign className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-800">{activity.name}</h3>
                          {activity.cost > 0 && <span className="text-sm font-semibold text-green-600">${activity.cost}</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                        {activity.scheduledAt && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-indigo-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(activity.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {stop.activities.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No activities planned for this stop yet.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
