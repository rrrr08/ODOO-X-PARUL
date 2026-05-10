'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { format, formatDistanceToNow } from "date-fns"
import { Pencil, Trash2, BookOpen, Plus, MapPin, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function NotesDashboard({ tripId }: { tripId: string }) {
  const [viewMode, setViewMode] = useState<"All" | "By Day" | "By Stop">("All")
  const [isAdding, setIsAdding] = useState(false)
  const [noteContent, setNoteContent] = useState("")
  const [selectedDay, setSelectedDay] = useState<number | "">("")
  const [selectedStopId, setSelectedStopId] = useState<string | "">("")
  const queryClient = useQueryClient()

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${tripId}`)
      return res.data
    }
  })

  const addNoteMutation = useMutation({
    mutationFn: (content: string) => axios.post(`/api/trips/${tripId}/notes`, { 
      content,
      day: selectedDay || null,
      stopId: selectedStopId || null
    }),
    onSuccess: () => {
      toast.success("Memory saved")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
      setNoteContent("")
      setSelectedDay("")
      setSelectedStopId("")
      setIsAdding(false)
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/notes/${id}`),
    onSuccess: () => {
      toast.success("Note removed")
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] })
    }
  })

  const notes = trip?.notes || []
  const stops = trip?.stops || []

  // Filtering Logic
  const filteredNotes = notes.filter((note: any) => {
    if (viewMode === "All") return true
    if (viewMode === "By Day") return note.day !== null
    if (viewMode === "By Stop") return note.stopId !== null
    return true
  })

  // Sort by context
  const sortedNotes = [...filteredNotes].sort((a: any, b: any) => {
    if (viewMode === "By Day") return (a.day || 0) - (b.day || 0)
    if (viewMode === "By Stop") return (a.stopId || "").localeCompare(b.stopId || "")
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  if (isLoading) return <SkeletonCard height="h-[400px]" lines={6} />

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
        <h2 className="text-xl font-bold text-[#1E1B4B] font-heading flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6C47FF]" /> Trip Journal
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {["All", "By Day", "By Stop"].map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${viewMode === mode ? 'bg-white shadow-sm text-[#1E1B4B]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6C47FF] text-white rounded-xl text-sm font-black hover:bg-[#5A35E5] transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-6 animate-in slide-in-from-top-4 duration-300">
          <textarea 
            rows={4}
            placeholder="What's on your mind? Capture a memory, reminder, or tip..."
            className="w-full border-gray-100 rounded-2xl shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-4 border bg-gray-50 resize-none mb-4 font-medium"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value ? parseInt(e.target.value) : "")}
                className="bg-gray-50 border-gray-100 rounded-xl text-xs font-bold border p-2.5 focus:ring-[#6C47FF] outline-none"
              >
                <option value="">General (No Day)</option>
                {Array.from({ length: 14 }).map((_, i) => (
                  <option key={i} value={i + 1}>Day {i + 1}</option>
                ))}
              </select>

              <select 
                value={selectedStopId}
                onChange={(e) => setSelectedStopId(e.target.value)}
                className="bg-gray-50 border-gray-100 rounded-xl text-xs font-bold border p-2.5 focus:ring-[#6C47FF] outline-none"
              >
                <option value="">No Specific Stop</option>
                {stops.map((stop: any) => (
                  <option key={stop.id} value={stop.id}>{stop.cityName}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => addNoteMutation.mutate(noteContent)} 
                disabled={!noteContent.trim() || addNoteMutation.isPending} 
                className="px-6 py-2.5 text-sm font-black text-white bg-[#6C47FF] hover:bg-[#5A35E5] rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {addNoteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Memory"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedNotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 text-[#6C47FF]/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1E1B4B]">No memories yet</h3>
          <p className="text-gray-400 mt-2 font-medium">Start journaling your trip experiences here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedNotes.map((note: any) => (
            <div key={note.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-xl transition-all group">
              <div className="w-2 bg-[#6C47FF] shrink-0" />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    {note.day && (
                      <span className="bg-indigo-50 text-[#6C47FF] px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">Day {note.day}</span>
                    )}
                    {note.stopId && (
                      <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-purple-100">
                        {stops.find((s: any) => s.id === note.stopId)?.cityName || "Stop"}
                      </span>
                    )}
                    {!note.day && !note.stopId && (
                      <span className="bg-gray-50 text-gray-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border border-gray-100">General</span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDistanceToNow(new Date(note.createdAt))} ago</span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed flex-1 font-medium">{note.content}</p>
                
                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => deleteNoteMutation.mutate(note.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
