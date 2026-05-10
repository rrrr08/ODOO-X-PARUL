'use client'

import { X, Shield, MessageSquare, Heart, Globe, Trash2 } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function CommunityGuidelinesModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  const rules = [
    {
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      title: "Be Authentic",
      desc: "Share real itineraries and experiences. Avoid posting AI-generated or fake content without proper context."
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
      title: "Respect the Community",
      desc: "Maintain a positive and constructive tone. Harassment, hate speech, or bullying will result in an immediate ban."
    },
    {
      icon: <Heart className="w-5 h-5 text-red-500" />,
      title: "Helpful Contributions",
      desc: "When replying to others, try to add value. Share tips on costs, weather, or hidden gems you found."
    },
    {
      icon: <Globe className="w-5 h-5 text-emerald-500" />,
      title: "Keep it Travel Related",
      desc: "Ensure your posts are about travel journeys, itineraries, or templates. Off-topic spam will be removed."
    },
    {
      icon: <Trash2 className="w-5 h-5 text-rose-500" />,
      title: "Moderation Rights",
      desc: "Our admin team reserves the right to remove any content that violates these rules or negatively impacts user experience."
    }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1E1B4B]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-[#6C47FF] p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black font-heading uppercase tracking-wider mb-2">Community Rules</h2>
          <p className="text-white/70 text-sm font-medium italic">Ensuring a positive experience for every explorer.</p>
        </div>

        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
          {rules.map((rule, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                {rule.icon}
              </div>
              <div>
                <h3 className="font-black text-[#1E1B4B] uppercase tracking-wide text-sm mb-1">{rule.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#6C47FF] text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-100 hover:scale-105 transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  )
}
