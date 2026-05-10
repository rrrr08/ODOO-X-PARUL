"use client"

import Link from "next/link"
import { Home, Map, Search, Users, User, Shield, LogOut, Plane } from "lucide-react"
import { signOut, useSession } from "next-auth/react"

export function Sidebar() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 flex flex-col justify-between hidden md:flex no-print">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 text-[#6C47FF] font-bold text-xl font-heading hover:opacity-80 transition-opacity">
          <Plane className="w-6 h-6" />
          <span>Traveloop</span>
        </Link>
        <nav className="space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/trips" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Map className="w-5 h-5" />
            <span>My Trips</span>
          </Link>
          <Link href="/search/cities" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Link>
          <Link href="/community" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Users className="w-5 h-5" />
            <span>Community</span>
          </Link>
        </nav>
      </div>
      <div className="p-6 border-t border-gray-200">
        <nav className="space-y-2">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <User className="w-5 h-5" />
            <span>Profile</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg text-[#6C47FF] bg-indigo-50 font-bold transition-all shadow-sm">
              <Shield className="w-5 h-5" />
              <span>Admin</span>
            </Link>
          )}
          <button 
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}
