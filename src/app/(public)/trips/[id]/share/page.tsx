import { notFound } from "next/navigation"
import prisma from "@/lib/prisma"
import { MapPin, Calendar, Clock, DollarSign, Copy } from "lucide-react"
import { CloneTripButton } from "@/components/trips/CloneTripButton"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

  const session = await getServerSession(authOptions)
  const isOwner = session?.user?.id === trip.userId

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-[300px] bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          {trip.coverUrl && <img src={trip.coverUrl} className="w-full h-full object-cover" alt={trip.title} />}
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="text-white">
                <h1 className="text-4xl font-bold font-heading mb-2">{trip.title}</h1>
                <p className="opacity-90 max-w-2xl">{trip.description}</p>
              </div>
              {!isOwner && session?.user && (
                <div className="shrink-0 mb-2">
                  <CloneTripButton tripId={trip.id} />
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out my travel itinerary for ${trip.title}!&url=${window.location.href}`, '_blank')}
                className="bg-black text-white p-2.5 rounded-xl hover:scale-110 transition-all shadow-lg"
                title="Share on X"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}
                className="bg-[#1877F2] text-white p-2.5 rounded-xl hover:scale-110 transition-all shadow-lg"
                title="Share on Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
              <button 
                onClick={() => window.open(`https://api.whatsapp.com/send?text=Check out this trip: ${window.location.href}`, '_blank')}
                className="bg-[#25D366] text-white p-2.5 rounded-xl hover:scale-110 transition-all shadow-lg"
                title="Share on WhatsApp"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.049c0 2.123.554 4.197 1.606 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.048-5.414 12.051-12.051a11.801 11.801 0 00-3.524-8.528z"/></svg>
              </button>
            </div>
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
