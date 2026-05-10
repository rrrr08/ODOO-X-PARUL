'use client'

import { useState } from "react"
import { Copy, Loader2, Check } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function CloneTripButton({ tripId }: { tripId: string }) {
  const [isCloning, setIsCloning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const router = useRouter()

  const handleClone = async () => {
    if (isCloning) return
    setIsCloning(true)

    try {
      const res = await axios.post(`/api/trips/${tripId}/clone`)
      toast.success("Itinerary copied to your trips!")
      setIsDone(true)
      setTimeout(() => {
        router.push(`/trips/${res.data.id}`)
      }, 1000)
    } catch (error) {
      toast.error("Failed to copy trip")
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <button 
      onClick={handleClone}
      disabled={isCloning || isDone}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
        isDone 
          ? 'bg-emerald-500 text-white shadow-emerald-200' 
          : 'bg-[#6C47FF] text-white hover:bg-[#5A35E5] shadow-indigo-200'
      } disabled:opacity-50`}
    >
      {isCloning ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isDone ? (
        <Check className="w-5 h-5" />
      ) : (
        <Copy className="w-5 h-5" />
      )}
      {isCloning ? "Copying..." : isDone ? "Copied!" : "Copy Trip to My Plans"}
    </button>
  )
}
