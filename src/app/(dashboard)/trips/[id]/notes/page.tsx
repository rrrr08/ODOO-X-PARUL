'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { useState } from "react"
import { format, formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { Pencil, Trash2, BookOpen, Plus, MapPin } from "lucide-react"

export default function TripNotes() {
  const params = useParams()
  const [viewMode, setViewMode] = useState<"All" | "By Day" | "By Stop">("All")
  const [isAdding, setIsAdding] = useState(false)
  const [noteContent, setNoteContent] = useState("")

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

  // Mock notes
  const [notes, setNotes] = useState([
    { id: '1', content: 'Met a lovely couple from Spain at the coffee shop. They recommended trying the local paella place down the street.', dayTag: 'Day 2', stopId: 'stop1', stopName: 'Barcelona', createdAt: new Date(Date.now() - 3600000) },
    { id: '2', content: 'Don\'t forget to pack the extra converter for the laptop! Also, buy train tickets for Tuesday.', dayTag: 'General', stopId: null, stopName: null, createdAt: new Date(Date.now() - 86400000) },
    { id: '3', content: 'The view from the top of the Eiffel Tower was breathtaking. Went right at sunset.', dayTag: 'Day 5', stopId: 'stop2', stopName: 'Paris', createdAt: new Date(Date.now() - 172800000) },
  ])

  if (isLoading) {
    return <SkeletonCard height="h-[400px]" lines={6} />
  }

  const handleSaveNote = () => {
    if (noteContent.trim()) {
      setNotes([{
        id: Date.now().toString(),
        content: noteContent,
        dayTag: 'General',
        stopId: null,
        stopName: null,
        createdAt: new Date()
      }, ...notes])
      setNoteContent("")
      setIsAdding(false)
    }
  }

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
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

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto hide-scrollbar">
        {["Itinerary Builder", "View Itinerary", "Budget", "Notes", "Checklist"].map((tab, i) => (
          <Link 
            href={`/trips/${params.id}${i===0 ? '' : i===1 ? '/view' : i===2 ? '/budget' : i===3 ? '/notes' : '/checklist'}`}
            key={tab} 
            className={`pb-3 -mb-[1px] font-medium whitespace-nowrap transition-colors z-10 ${i === 3 ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-sm gap-4">
        <h2 className="text-xl font-bold text-[#1E1B4B] font-heading flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#6C47FF]" /> Trip Journal
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["All", "By Day", "By Stop"].map(mode => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === mode ? 'bg-white shadow-sm text-[#1E1B4B]' : 'text-gray-500 hover:text-gray-900'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6C47FF] text-white rounded-lg text-sm font-medium hover:bg-[#5A35E5] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg mb-6 animate-in slide-in-from-top-4 fade-in duration-200">
          <textarea 
            rows={4}
            placeholder="Write a note, reminder, or check-in detail..."
            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#6C47FF] focus:ring-[#6C47FF] p-3 border resize-none mb-4"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            autoFocus
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              <select className="border-gray-300 rounded-lg text-sm border p-2 focus:ring-[#6C47FF] focus:border-[#6C47FF]">
                <option>General (No Day)</option>
                <option>Day 1</option>
                <option>Day 2</option>
              </select>
              <select className="border-gray-300 rounded-lg text-sm border p-2 focus:ring-[#6C47FF] focus:border-[#6C47FF]">
                <option>No Specific Stop</option>
                {trip?.stops?.map((s:any) => <option key={s.id}>{s.cityName}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveNote} disabled={!noteContent.trim()} className="px-4 py-2 text-sm font-medium text-white bg-[#6C47FF] hover:bg-[#5A35E5] rounded-lg transition-colors disabled:opacity-50">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 text-[#6C47FF]/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#1E1B4B]">No notes yet</h3>
          <p className="text-gray-500 mt-2">Start journaling your trip experiences here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow group">
              <div className="w-1.5 bg-[#6C47FF] shrink-0" />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-2">
                    {note.dayTag && <span className="bg-indigo-50 text-[#6C47FF] px-2 py-0.5 rounded text-xs font-medium border border-indigo-100">{note.dayTag}</span>}
                    {note.stopName && <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-200 flex items-center gap-1"><MapPin className="w-3 h-3" /> {note.stopName}</span>}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{formatDistanceToNow(note.createdAt)} ago</span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed flex-1">{note.content}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-gray-400 hover:text-[#6C47FF] hover:bg-indigo-50 rounded-md transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
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
