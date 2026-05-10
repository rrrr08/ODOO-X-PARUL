'use client'

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { useState } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { CheckSquare, Square, Share, Trash2, Plus, AlertCircle, Briefcase, ChevronDown, ChevronRight } from "lucide-react"

export default function Checklist() {
  const params = useParams()
  
  // Mock data state for checklist
  const [items, setItems] = useState([
    { id: '1', label: 'Passport', category: 'Documents', isPacked: true },
    { id: '2', label: 'Flight Tickets', category: 'Documents', isPacked: false },
    { id: '3', label: 'Casual Shirts', category: 'Clothing', isPacked: true },
    { id: '4', label: 'Trousers/Jeans', category: 'Clothing', isPacked: false },
    { id: '5', label: 'Phone Charger', category: 'Electronics', isPacked: false },
  ])

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    'Documents': true, 'Clothing': true, 'Electronics': true
  })

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', params.id],
    queryFn: async () => {
      const res = await axios.get(`/api/trips/${params.id}`)
      return res.data
    }
  })

  if (isLoading) {
    return <SkeletonCard height="h-[400px]" lines={6} />
  }

  const packedCount = items.filter(i => i.isPacked).length
  const totalCount = items.length
  const progress = totalCount === 0 ? 0 : Math.round((packedCount / totalCount) * 100)

  const categories = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Accessories', 'Other']

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  const toggleItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isPacked: !i.isPacked } : i))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const addItem = (e: React.FormEvent, cat: string) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const input = form.elements[0] as HTMLInputElement
    if (input.value.trim()) {
      setItems([...items, { id: Date.now().toString(), label: input.value, category: cat, isPacked: false }])
      input.value = ''
    }
  }

  const quickAddItems = ['Passport', 'Phone Charger', 'Sunscreen', 'First Aid Kit', 'Camera', 'Travel Pillow']

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
            className={`pb-3 -mb-[1px] font-medium whitespace-nowrap transition-colors z-10 ${i === 4 ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            {tab}
          </Link>
        ))}
      </div>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-sm gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-[#1E1B4B] font-heading flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#F59E0B]" /> Packing Checklist
            </h2>
            <span className="text-sm font-medium text-gray-500">{packedCount}/{totalCount} packed</span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#6C47FF] h-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
            Reset All
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-[#6C47FF] hover:bg-[#5A35E5] rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <Share className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Checklist */}
        <div className="lg:w-2/3 space-y-4">
          {categories.map(category => {
            const catItems = items.filter(i => i.category === category)
            const isExpanded = expandedCats[category]
            
            return (
              <div key={category} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                    <h3 className="font-bold text-[#1E1B4B]">{category}</h3>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded text-xs font-medium text-gray-500 border border-gray-200">
                    {catItems.filter(i => i.isPacked).length}/{catItems.length}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className="p-2">
                    {catItems.length === 0 ? (
                      <div className="p-4 flex items-center gap-2 text-sm text-gray-400">
                        <AlertCircle className="w-4 h-4" /> No items in this category yet.
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {catItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                            <button onClick={() => toggleItem(item.id)} className="flex items-center gap-3 flex-1 text-left">
                              {item.isPacked ? (
                                <CheckSquare className="w-5 h-5 text-[#6C47FF]" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-300" />
                              )}
                              <span className={`transition-all ${item.isPacked ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                                {item.label}
                              </span>
                            </button>
                            <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <form onSubmit={(e) => addItem(e, category)} className="mt-2 p-2 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Add item..." 
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 px-1"
                      />
                      <button type="submit" className="text-sm font-medium text-[#6C47FF] hover:text-[#5A35E5] px-2 py-1 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors">
                        Add
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Add Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-4">Quick Add</h3>
            <p className="text-sm text-gray-500 mb-4">Common travel essentials to quickly add to your list.</p>
            
            <div className="flex flex-wrap gap-2">
              {quickAddItems.map(item => {
                const inList = items.some(i => i.label === item)
                return (
                  <button 
                    key={item}
                    onClick={() => {
                      if (!inList) {
                        setItems([...items, { id: Date.now().toString(), label: item, category: 'Other', isPacked: false }])
                      }
                    }}
                    disabled={inList}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${inList ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-600 border-gray-300 hover:border-[#6C47FF] hover:text-[#6C47FF]'}`}
                  >
                    {item} {inList && '✓'}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
