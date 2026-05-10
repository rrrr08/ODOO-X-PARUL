'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock, DollarSign, Plus, Globe, GripVertical, Trash2, FileText, Download } from "lucide-react"
import { AddStopModal } from "@/components/trips/AddStopModal"
import { AddActivityModal } from "@/components/trips/AddActivityModal"
import { BudgetDashboard } from "@/components/trips/BudgetDashboard"
import { NotesDashboard } from "@/components/trips/NotesDashboard"
import { ChecklistDashboard } from "@/components/trips/ChecklistDashboard"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ItineraryBuilder() {
  const { data: session } = useSession()
  const params = useParams()
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [activeTab, setActiveTab] = useState("Itinerary Builder")
  const [isStopModalOpen, setIsStopModalOpen] = useState(false)
  const [activeStopId, setActiveStopId] = useState<string | null>(null)

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

  const isReadOnly = session?.user?.id !== trip?.userId

  // Helper to group activities by day
  const getDays = () => {
    if (!trip) return []
    const start = new Date(trip.startDate)
    const end = new Date(trip.endDate)
    const days = []
    let curr = new Date(start)
    
    while (curr <= end) {
      const dateStr = curr.toISOString().split('T')[0]
      const dayActivities = trip.stops?.flatMap((s: any) => 
        s.activities.filter((a: any) => a.scheduledAt && a.scheduledAt.split('T')[0] === dateStr)
      ) || []
      
      days.push({
        date: new Date(curr),
        activities: dayActivities
      })
      curr = new Date(curr.getTime() + 86400000)
    }
    return days
  }

  // Budget Calculations
  const expenses = trip?.expenses || []
  const activityCosts = trip?.stops?.reduce((sum: number, stop: any) => {
    return sum + (stop.activities?.reduce((s: number, a: any) => s + (a.cost || 0), 0) || 0)
  }, 0) || 0
  
  const subtotal = expenses.reduce((sum: number, e: any) => sum + e.amount, 0) + activityCosts
  const budget = trip?.totalBudget || 0
  const isOverBudget = subtotal > budget

  const categoryTotals: Record<string, number> = {}
  expenses.forEach((e: any) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
  })
  const barData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }))
  const COLORS = ['#6C47FF', '#F59E0B', '#10B981', '#F43F5E', '#3B82F6', '#8B5CF6']

  // DND setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      // Reorder logic (needs server mutation)
    }
  }

  const debouncedSave = useDebouncedCallback((field, value) => {
    setSaveStatus("saving")
    axios.put(`/api/trips/${params.id}`, { [field]: value })
      .then(() => setSaveStatus("saved"))
      .catch(() => setSaveStatus("idle"))
      .finally(() => setTimeout(() => setSaveStatus("idle"), 2000))
  }, 800)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard height="h-48" lines={0} />
        <SkeletonCard lines={4} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#1E1B4B] to-[#6C47FF]">
          {trip?.coverUrl && <img src={trip.coverUrl} className="w-full h-full object-cover opacity-60" alt="" />}
        </div>
        <div className="absolute bottom-4 left-6 text-white">
          <input 
            type="text" 
            defaultValue={trip?.title}
            readOnly={isReadOnly}
            onChange={(e) => !isReadOnly && debouncedSave('title', e.target.value)}
            className={`bg-transparent text-3xl font-bold font-heading border-none focus:ring-0 px-0 placeholder-white/70 min-w-[300px] ${isReadOnly ? 'cursor-default' : 'cursor-text'}`}
          />
        </div>
        <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : ""}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 gap-8 overflow-x-auto hide-scrollbar">
        {["Itinerary Builder", "View Itinerary", "Budget", "Notes", "Checklist"].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-4 font-bold text-sm uppercase tracking-wider whitespace-nowrap transition-all relative ${
              activeTab === tab ? 'text-[#6C47FF]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6C47FF] rounded-t-full shadow-[0_-2px_8px_rgba(108,71,255,0.4)]" />}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl py-8">
        {activeTab === "Itinerary Builder" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={trip?.stops?.map((s: any) => s.id) || []} strategy={verticalListSortingStrategy}>
                <div className="space-y-6">
                  {trip?.stops?.map((stop: any) => (
                    <StopCard 
                      key={stop.id} 
                      stop={stop} 
                      tripId={params.id as string} 
                      isReadOnly={isReadOnly} 
                      onAddActivity={() => setActiveStopId(stop.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {!isReadOnly && (
              <button 
                onClick={() => setIsStopModalOpen(true)}
                className="w-full mt-8 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-gray-400 hover:text-[#6C47FF] hover:border-[#6C47FF] hover:bg-indigo-50/50 transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#6C47FF]/10 transition-colors">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold">Add Destination Stop</span>
              </button>
            )}
          </div>
        )}

        {activeTab === "View Itinerary" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {getDays().map((day, i) => (
              <div key={i} className="relative pl-12 border-l-2 border-[#6C47FF]/20 last:border-l-0 pb-10">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#6C47FF] shadow-[0_0_0_4px_rgba(108,71,255,0.1)]" />
                <div className="mb-6">
                  <h3 className="text-sm font-black text-[#6C47FF] uppercase tracking-[0.2em] mb-1">Day {i + 1}</h3>
                  <p className="text-2xl font-black text-[#1E1B4B] font-heading">{format(day.date, 'EEEE, MMM d')}</p>
                </div>
                
                <div className="grid gap-4">
                  {day.activities.length === 0 ? (
                    <div className="p-6 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-center">
                      <p className="text-sm text-gray-400 font-medium">No activities scheduled for this day.</p>
                      {!isReadOnly && (
                        <button onClick={() => setActiveTab("Itinerary Builder")} className="text-xs font-bold text-[#6C47FF] mt-2 underline">Add some activities</button>
                      )}
                    </div>
                  ) : (
                    day.activities.map((act: any) => (
                      <div key={act.id} className="flex items-center gap-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow group">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-indigo-50 to-white flex flex-col items-center justify-center text-[#1E1B4B] border border-indigo-100 shrink-0">
                          <Clock className="w-4 h-4 mb-1 text-[#6C47FF]" />
                          <span className="text-[10px] font-bold">12:00</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-[#6C47FF] uppercase tracking-wider">{act.category}</span>
                            {act.intensity && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                act.intensity === 'High' ? 'bg-red-50 text-red-600' :
                                act.intensity === 'Medium' ? 'bg-amber-50 text-amber-600' :
                                'bg-green-50 text-green-600'
                              }`}>
                                {act.intensity} Intensity
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900">{act.name}</h4>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">${act.cost}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {/* Flexible Schedule */}
            {trip?.stops?.some((s: any) => s.activities?.some((a: any) => !a.scheduledAt)) && (
              <div className="mt-12 pt-12 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6C47FF]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#1E1B4B] font-heading">Flexible Schedule</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Unscheduled Activities</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.stops.flatMap((s: any) => s.activities || [])
                    .filter((a: any) => !a.scheduledAt)
                    .map((act: any) => (
                      <div key={act.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-[#6C47FF]/30 transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2 py-0.5 rounded-lg bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">{act.category}</span>
                          <span className="text-xs font-black text-gray-900">${act.cost}</span>
                        </div>
                        <h4 className="font-black text-[#1E1B4B] mb-2">{act.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{act.description}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "Budget" && (
          <BudgetDashboard 
            trip={trip} 
            subtotal={subtotal} 
            budget={budget} 
            barData={barData} 
            COLORS={COLORS} 
          />
        )}

        {activeTab === "Notes" && (
          <NotesDashboard tripId={params.id as string} />
        )}

        {activeTab === "Checklist" && (
          <ChecklistDashboard tripId={params.id as string} />
        )}
      </div>

      <AddStopModal 
        isOpen={isStopModalOpen} 
        onClose={() => setIsStopModalOpen(false)} 
        tripId={params.id} 
        lastOrder={trip?.stops?.length}
      />

      <AddActivityModal 
        isOpen={!!activeStopId} 
        onClose={() => setActiveStopId(null)} 
        stopId={activeStopId}
        trip={trip}
      />
    </div>
  )
}

function StopCard({ stop, tripId, isReadOnly, onAddActivity }: { stop: any, tripId: string, isReadOnly: boolean, onAddActivity: () => void }) {
  const queryClient = useQueryClient()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  const deleteMutation = useMutation({
    mutationFn: () => axios.delete(`/api/stops/${stop.id}`),
    onSuccess: () => {
      toast.success("Stop removed")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    }
  })

  const updateMutation = useDebouncedCallback((name: string) => {
    axios.patch(`/api/stops/${stop.id}`, { cityName: name })
      .then(() => toast.success("Stop updated", { duration: 1000 }))
  }, 1000)

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 cursor-grab">
            <GripVertical className="w-5 h-5" />
          </button>
          <input 
            type="text" 
            defaultValue={stop.cityName} 
            readOnly={isReadOnly}
            onChange={(e) => !isReadOnly && updateMutation(e.target.value)}
            className={`font-bold text-lg text-[#1E1B4B] bg-transparent border-none focus:ring-0 p-0 ${isReadOnly ? 'cursor-default' : 'cursor-text'}`}
          />
          <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-500 border border-gray-200">{stop.country}</span>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4">
        {/* Simplified inner structure for mock */}
        <p className="text-gray-500 text-sm mb-4">Activities in {stop.cityName}</p>
        <div className="space-y-2">
          {stop.activities?.map((act: any) => (
            <div key={act.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 group/act">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{act.name}</p>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{act.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">${act.cost}</span>
                {!isReadOnly && (
                  <button 
                    onClick={() => {
                      axios.delete(`/api/activities/${act.id}`)
                        .then(() => {
                          toast.success("Activity removed")
                          queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
                        })
                    }}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover/act:opacity-100 transition-all p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
          {!isReadOnly && (
            <button 
              onClick={onAddActivity}
              className="text-[#6C47FF] text-sm font-medium flex items-center gap-1 mt-2 hover:underline"
            >
              <Plus className="w-4 h-4" /> Add Activity
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
