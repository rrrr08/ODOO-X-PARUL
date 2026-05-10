'use client'

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Users, Map, Calendar, MessageSquare, TrendingUp, TrendingDown, Search, MoreVertical, Trash2, Shield, User as UserIcon, Check, X, Loader2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from "date-fns"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Tab = 'overview' | 'users' | 'trips' | 'community'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const queryClient = useQueryClient()

  const isAdmin = status === 'authenticated' && session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/stats')
      return res.data
    },
    enabled: isAdmin
  })

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/community')
      return res.data
    },
    enabled: isAdmin && activeTab === 'community'
  })

  const { data: trips, isLoading: isTripsLoading } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/trips')
      return res.data
    },
    enabled: isAdmin && activeTab === 'trips'
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      await axios.patch(`/api/admin/users/${userId}`, { role })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success("User role updated")
    }
  })

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      await axios.delete(`/api/admin/community?id=${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      toast.success("Post removed")
    }
  })

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      await axios.delete(`/api/admin/trips?id=${tripId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] })
      toast.success("Trip deleted")
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axios.delete(`/api/admin/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      toast.success("User account deleted")
    }
  })

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#6C47FF]" />
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') return null

  const COLORS = ['#6C47FF', '#F59E0B', '#10B981', '#F43F5E', '#3B82F6']

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <PageHeader 
          title="Admin Control Center" 
          subtitle="Full platform governance and moderation" 
        />
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'trips', 'community'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-[#6C47FF] text-white shadow-lg shadow-indigo-100 scale-105' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard icon={<Users className="w-6 h-6 text-[#6C47FF]" />} value={stats?.totalUsers || 0} label="Total Users" change={stats?.totalUsersChange || 0} />
            <KpiCard icon={<Map className="w-6 h-6 text-[#F59E0B]" />} value={stats?.totalTrips || 0} label="Total Trips" change={stats?.totalTripsChange || 0} />
            <KpiCard icon={<Calendar className="w-6 h-6 text-[#10B981]" />} value={stats?.activeThisWeek || 0} label="Active Users" change={stats?.activeThisWeekChange || 0} />
            <KpiCard icon={<MessageSquare className="w-6 h-6 text-[#F43F5E]" />} value={stats?.communityPosts || 0} label="Posts" change={stats?.communityPostsChange || 0} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-[60%] bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-black text-[#1E1B4B] font-heading mb-8 text-xl uppercase tracking-wider">Growth Analytics</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.tripsPerDay || []}>
                    <defs>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6C47FF" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="count" stroke="#6C47FF" strokeWidth={4} fill="url(#colorTrips)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:w-[40%] bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="font-black text-[#1E1B4B] font-heading mb-8 text-xl uppercase tracking-wider">Popular Destinations</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats?.topCities || []} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                      {(stats?.topCities || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-[#1E1B4B] font-heading text-xl uppercase tracking-wider">User Moderation</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Explorer</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-center">Trips</th>
                  <th className="px-8 py-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.users?.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-[#6C47FF] text-xl shadow-sm border border-indigo-100">
                          {user.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-tight">{user.name}</p>
                          <p className="text-xs font-bold text-gray-400 mt-1">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <select 
                        value={user.role}
                        onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                        className={`text-xs font-black px-3 py-1.5 rounded-lg border-2 outline-none transition-all ${
                          user.role === 'ADMIN' ? 'bg-indigo-50 border-indigo-100 text-[#6C47FF]' : 'bg-gray-50 border-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        {user.tripCount} trips
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => { if(confirm('Permanently delete this user and all their data?')) deleteUserMutation.mutate(user.id) }}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'trips' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-[#1E1B4B] font-heading text-xl uppercase tracking-wider">Global Trip Index</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Trip Itinerary</th>
                  <th className="px-8 py-5">Author</th>
                  <th className="px-8 py-5 text-center">Stops</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips?.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-gray-900 text-lg leading-tight truncate max-w-xs">{trip.title}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                        {trip.isPublic ? '🌐 Public' : '🔒 Private'} {trip.isTemplate ? '• 📝 Template' : ''}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900">{trip.user.name}</p>
                      <p className="text-[10px] text-gray-400">{trip.user.email}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-xs font-black text-gray-600 bg-gray-50 px-2 py-1 rounded">
                        {trip._count.stops} Cities
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => { if(confirm('Delete this trip? This cannot be undone.')) deleteTripMutation.mutate(trip.id) }}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'community' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="font-black text-[#1E1B4B] font-heading text-xl uppercase tracking-wider">Feed Content Review</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-5">Post Content</th>
                  <th className="px-8 py-5">Engagement</th>
                  <th className="px-8 py-5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts?.map((post: any) => (
                  <tr key={post.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-8 py-6 max-w-md">
                      <p className="font-black text-gray-900 text-lg leading-tight truncate">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 italic">"{post.body}"</p>
                      <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase">By {post.user.name} • {post.user.email}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black bg-indigo-50 text-[#6C47FF] px-2 py-1 rounded uppercase min-w-[70px]">
                          {post._count.likes} Likes
                        </span>
                        <span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded uppercase min-w-[70px]">
                          {post._count.comments} Replies
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => { if(confirm('Remove this entire post?')) deletePostMutation.mutate(post.id) }}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon, value, label, change }: { icon: React.ReactNode, value: number, label: string, change: number }) {
  const isPositive = change >= 0
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div>
        <h4 className="text-3xl font-bold font-heading text-[#1E1B4B]">{value.toLocaleString()}</h4>
        <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}
