'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { toast } from "sonner"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2 } from "lucide-react"

export default function ItineraryBuilder() {
  const params = useParams()
  const queryClient = useQueryClient()
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

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
            onChange={(e) => debouncedSave('title', e.target.value)}
            className="bg-transparent text-3xl font-bold font-heading border-none focus:ring-0 px-0 placeholder-white/70 min-w-[300px]"
          />
        </div>
        <div className="absolute top-4 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm">
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved ✓" : ""}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto hide-scrollbar">
        {["Itinerary Builder", "View Itinerary", "Budget", "Notes", "Checklist"].map((tab, i) => (
          <button 
            key={tab} 
            className={`pb-3 font-medium whitespace-nowrap transition-colors ${i === 0 ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={trip?.stops?.map((s: any) => s.id) || []} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {trip?.stops?.map((stop: any) => (
                <StopCard key={stop.id} stop={stop} tripId={params.id as string} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <button className="w-full mt-6 border-2 border-dashed border-gray-300 rounded-xl p-6 text-gray-500 hover:text-[#6C47FF] hover:border-[#6C47FF] hover:bg-indigo-50 transition-colors flex flex-col items-center justify-center gap-2 font-medium">
          <Plus className="w-6 h-6" />
          Add Another Stop
        </button>
      </div>
    </div>
  )
}

function StopCard({ stop, tripId }: { stop: any, tripId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

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
            className="font-bold text-lg text-[#1E1B4B] bg-transparent border-none focus:ring-0 p-0"
          />
          <span className="bg-white px-2 py-0.5 rounded text-xs text-gray-500 border border-gray-200">{stop.country}</span>
        </div>
        <button className="text-gray-400 hover:text-red-500 p-1">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        {/* Simplified inner structure for mock */}
        <p className="text-gray-500 text-sm mb-4">Activities in {stop.cityName}</p>
        <div className="space-y-2">
          {stop.activities?.map((act: any) => (
            <div key={act.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
              <span>{act.name}</span>
              <span className="text-sm font-medium">${act.cost}</span>
            </div>
          ))}
          <button className="text-[#6C47FF] text-sm font-medium flex items-center gap-1 mt-2 hover:underline">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        </div>
      </div>
    </div>
  )
}
