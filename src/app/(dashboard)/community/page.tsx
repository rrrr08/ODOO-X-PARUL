'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { Heart, MessageCircle, Share2, MapPin, Plus, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import Link from "next/link"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

export default function CommunityTab() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['community-posts'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(`/api/community?page=${pageParam}`)
      return res.data
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1
  })

  const posts = data?.pages.flatMap(page => page.posts) || []

  return (
    <div className="space-y-8 pb-20">
      <PageHeader 
        title="Community" 
        actions={
          <Link href="/trips">
            <button className="bg-[#F59E0B] hover:bg-[#d98b0a] text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md flex items-center gap-2 hover:scale-105 active:scale-95">
              <Plus className="w-5 h-5" /> Share My Trip
            </button>
          </Link>
        }
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Feed */}
        <div className="lg:w-[65%] space-y-6">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {['All', 'Recent', 'Most Liked', 'My Posts'].map((filter, i) => (
              <button key={filter} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-[#1E1B4B] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {filter}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <SkeletonCard lines={3} />
              <SkeletonCard lines={3} />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-6">Be the first to share an amazing trip with the world!</p>
              <Link href="/trips">
                <button className="text-[#6C47FF] font-bold hover:underline">Go to My Trips →</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasNextPage && (
                <button 
                  onClick={() => fetchNextPage()} 
                  disabled={isFetchingNextPage}
                  className="w-full py-4 text-[#6C47FF] font-bold bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading more..." : "Load More Adventures"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Info Panel */}
        <div className="lg:w-[35%] space-y-6">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#6C47FF] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
            <h3 className="font-bold font-heading mb-3 text-xl">What is Community?</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Traveloop Community is where explorers like you share itineraries, get inspiration, and discover hidden gems.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3 rounded-xl text-sm font-bold transition-all border border-white/20">
              Read Guidelines
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#F59E0B]" />
              Top Destinations
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Tokyo, Japan', count: 124 },
                { name: 'Paris, France', count: 98 },
                { name: 'Bali, Indonesia', count: 86 },
                { name: 'Rome, Italy', count: 72 },
                { name: 'New York, USA', count: 65 }
              ].map((dest, i) => (
                <div key={dest.name} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
                      {i+1}
                    </span>
                    <span className="text-gray-700 font-medium group-hover:text-[#6C47FF] transition-colors">{dest.name}</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{dest.count} trips</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likesCount || post.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [showComments, setShowComments] = useState(false)

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    
    // Optimistic UI
    const newLiked = !liked
    setLiked(newLiked)
    setLikes((prev: number) => newLiked ? prev + 1 : prev - 1)

    try {
      await axios.post('/api/community/like', { postId: post.id })
    } catch (error) {
      // Rollback
      setLiked(!newLiked)
      setLikes((prev: number) => !newLiked ? prev + 1 : prev - 1)
      toast.error("Failed to update like")
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center text-[#6C47FF] font-black text-lg shrink-0 shadow-inner">
          {post.user.image ? <img src={post.user.image} alt="" className="w-full h-full rounded-2xl object-cover" /> : post.user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 leading-tight text-lg">{post.user.name}</p>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <h4 className="font-black text-2xl text-[#1E1B4B] font-heading mb-3 leading-tight">{post.title}</h4>
      <p className="text-gray-600 mb-6 text-lg leading-relaxed">{post.body}</p>

      {post.trip && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 group hover:bg-indigo-50/50 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#6C47FF] shadow-sm border border-gray-100 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-black text-gray-900 truncate">{post.trip.title}</p>
            <p className="text-xs font-bold text-gray-500 truncate uppercase tracking-wide">
              {post.trip.stops?.length > 0 
                ? post.trip.stops.map((s:any)=>s.cityName).join(' → ')
                : "Itinerary Details"}
            </p>
          </div>
          <Link href={`/trips/${post.trip.id}`} className="shrink-0 w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-white text-[#6C47FF] text-sm font-black px-5 py-2.5 rounded-xl border border-gray-200 hover:border-[#6C47FF] transition-all shadow-sm active:scale-95">
              View Itinerary
            </button>
          </Link>
        </div>
      )}

      <div className="flex items-center gap-8 pt-6 border-t border-gray-50">
        <button 
          onClick={handleLike} 
          disabled={isLiking}
          className={`flex items-center gap-2 text-sm font-black transition-all hover:scale-110 active:scale-90 ${liked ? 'text-red-500' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Heart className={`w-6 h-6 ${liked ? 'fill-red-500' : ''}`} /> {likes}
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-gray-900 transition-all hover:scale-110 active:scale-90"
        >
          <MessageCircle className="w-6 h-6" /> Reply
        </button>
      </div>

      {showComments && (
        <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Write a reply..."
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-[#6C47FF] outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  toast.info("Comment system coming soon in the next update!")
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Globe(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}
