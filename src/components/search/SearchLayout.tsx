'use client'

import { useState, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search as SearchIcon, Filter, ArrowUpDown } from "lucide-react"

interface SearchLayoutProps {
  children: React.ReactNode
  placeholder?: string
}

export function SearchLayout({ children, placeholder = "Search cities and activities..." }: SearchLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.replace(`${pathname}?q=${encodeURIComponent(query)}`)
    } else {
      router.replace(pathname)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 pb-20 md:pb-8">
      {/* Search Header */}
      <div className="bg-[#1E1B4B] rounded-2xl p-6 md:p-10 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-[#6C47FF] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#F59E0B] rounded-full blur-3xl opacity-40"></div>
        
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-6 relative z-10">Discover your next destination</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative z-10">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input 
            type="text" 
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-xl text-lg shadow-lg border-none focus:ring-4 focus:ring-[#F59E0B]/50 transition-shadow outline-none text-gray-800"
          />
        </form>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-6 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/search/cities')}
            className={`pb-4 -mb-4 font-medium transition-colors ${pathname.includes('cities') ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Cities
          </button>
          <button 
            onClick={() => router.push('/search/activities')}
            className={`pb-4 -mb-4 font-medium transition-colors ${pathname.includes('activities') ? 'border-b-2 border-[#6C47FF] text-[#6C47FF]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Activities
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Group:</span>
            <select 
              value={searchParams.get('groupBy') || 'None'} 
              onChange={(e) => {
                const sp = new URLSearchParams(searchParams)
                sp.set('groupBy', e.target.value)
                router.replace(`${pathname}?${sp.toString()}`)
              }}
              className="bg-transparent border-none text-xs font-bold text-[#1E1B4B] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="None">None</option>
              <option value="Category">Category</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5" />
            <select 
              value={searchParams.get('filterBy') || 'All'} 
              onChange={(e) => {
                const sp = new URLSearchParams(searchParams)
                sp.set('filterBy', e.target.value)
                router.replace(`${pathname}?${sp.toString()}`)
              }}
              className="bg-transparent border-none text-xs font-bold text-[#1E1B4B] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="All">All Price</option>
              <option value="Budget">Budget ($)</option>
              <option value="Mid">Mid ($$)</option>
              <option value="Luxury">Luxury ($$$)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 whitespace-nowrap">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select 
              value={searchParams.get('sortBy') || 'Popular'} 
              onChange={(e) => {
                const sp = new URLSearchParams(searchParams)
                sp.set('sortBy', e.target.value)
                router.replace(`${pathname}?${sp.toString()}`)
              }}
              className="bg-transparent border-none text-xs font-bold text-[#1E1B4B] focus:ring-0 p-0 cursor-pointer"
            >
              <option value="Popular">Popular</option>
              <option value="PriceLow">Price: Low-High</option>
              <option value="PriceHigh">Price: High-Low</option>
              <option value="Duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  )
}
