import Link from "next/link"
import { Home, Map, Search, Users, User } from "lucide-react"

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center h-16 md:hidden z-50 no-print">
      <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#6C47FF]">
        <Home className="w-6 h-6" />
        <span className="text-[10px] mt-1">Home</span>
      </Link>
      <Link href="/trips" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#6C47FF]">
        <Map className="w-6 h-6" />
        <span className="text-[10px] mt-1">Trips</span>
      </Link>
      <Link href="/search/cities" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#6C47FF]">
        <Search className="w-6 h-6" />
        <span className="text-[10px] mt-1">Search</span>
      </Link>
      <Link href="/community" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#6C47FF]">
        <Users className="w-6 h-6" />
        <span className="text-[10px] mt-1">Community</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#6C47FF]">
        <User className="w-6 h-6" />
        <span className="text-[10px] mt-1">Profile</span>
      </Link>
    </nav>
  )
}
