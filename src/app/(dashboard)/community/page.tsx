'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { Heart, MessageCircle, Share2, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { SkeletonCard } from "@/components/shared/SkeletonCard"

export default function CommunityTab() {
  const [search, setSearch] = useState("")

  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['community-posts'],
    queryFn: async ({ pageParam = 1 }) => {
      // Mocking the endpoint since it might not be fully seeded
      try {
        const res = await axios.get(`/api/community?page=${pageParam}`)
        return res.data
      } catch (e) {
        return {
          posts: [
            { id: '1', title: 'Just got back from an amazing 2 weeks in Japan!', body: 'Highly recommend taking the Shinkansen down to Kyoto. The bamboo forest was incredible.', likes: 45, createdAt: new Date(Date.now() - 86400000*2), user: { name: 'Sarah Jenkins', image: null }, trip: { title: 'Japan 2026', stops: [{cityName:'Tokyo'}, {cityName:'Kyoto'}] } },
            { id: '2', title: 'Backpacking across Europe on a budget', body: 'We managed to keep our daily budget under $50 by staying in hostels and eating street food.', likes: 112, createdAt: new Date(Date.now() - 86400000*5), user: { name: 'Mark Doe', image: null } }
          ],
          nextPage: null
        }
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1
  })

  const posts = data?.pages.flatMap(page => page.posts) || []

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Community" 
        actions={
          <button className="bg-[#F59E0B] hover:bg-[#d98b0a] text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md">
            + Share My Trip
          </button>
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
          ) : (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasNextPage && (
                <button onClick={() => fetchNextPage()} className="w-full py-3 text-[#6C47FF] font-medium bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                  Load More
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Info Panel */}
        <div className="lg:w-[35%] space-y-6">
          <div className="bg-gradient-to-br from-[#1E1B4B] to-[#6C47FF] rounded-xl p-6 text-white shadow-md">
            <h3 className="font-bold font-heading mb-2 text-lg">What is Community?</h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              Traveloop Community is a place to share your itineraries, get inspiration from other travelers, and discover hidden gems around the world.
            </p>
            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Read Guidelines
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-[#1E1B4B] font-heading mb-4">Top Destinations</h3>
            <div className="space-y-3">
              {['Tokyo, Japan', 'Paris, France', 'Bali, Indonesia', 'Rome, Italy', 'New York, USA'].map((dest, i) => (
                <div key={dest} className="flex items-center gap-3">
                  <span className="text-[#F59E0B] font-bold text-lg w-5">{i+1}</span>
                  <span className="text-gray-700">{dest}</span>
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
  const [likes, setLikes] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-200 to-purple-200 flex items-center justify-center text-[#1E1B4B] font-bold shrink-0">
          {post.user.image ? <img src={post.user.image} alt="" className="w-full h-full rounded-full" /> : post.user.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-tight">{post.user.name}</p>
          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt))} ago</p>
        </div>
      </div>

      <h4 className="font-bold text-xl text-[#1E1B4B] font-heading mb-2">{post.title}</h4>
      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{post.body}</p>

      {post.trip && (
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4 flex items-center gap-3">
          <MapPin className="text-[#6C47FF] w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{post.trip.title}</p>
            <p className="text-xs text-gray-500 truncate">{post.trip.stops?.map((s:any)=>s.cityName).join(' → ')}</p>
          </div>
          <button className="text-[#6C47FF] text-sm font-medium hover:underline shrink-0 px-2">View Trip</button>
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-gray-900'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} /> {likes}
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <MessageCircle className="w-5 h-5" /> Reply
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors ml-auto">
          <Share2 className="w-5 h-5" /> Share
        </button>
      </div>
    </div>
  )
}
