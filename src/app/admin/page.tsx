'use client'

import { PageHeader } from "@/components/shared/PageHeader"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Users, Map, Calendar, MessageSquare, TrendingUp, TrendingDown, Search, MoreVertical } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts'
import { format } from "date-fns"

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Mocking the endpoint
      return {
        totalUsers: 1245,
        totalUsersChange: 12.5,
        totalTrips: 8432,
        totalTripsChange: 8.2,
        activeThisWeek: 320,
        activeThisWeekChange: -2.4,
        communityPosts: 5420,
        communityPostsChange: 15.3,
        tripsPerDay: Array.from({length: 30}).map((_, i) => ({
          date: format(new Date(Date.now() - (29-i)*86400000), 'MMM dd'),
          count: Math.floor(Math.random() * 50) + 10
        })),
        topCities: [
          { name: 'Paris', value: 450 },
          { name: 'Tokyo', value: 380 },
          { name: 'Rome', value: 320 },
          { name: 'Bali', value: 290 },
          { name: 'New York', value: 210 }
        ],
        users: Array.from({length: 10}).map((_, i) => ({
          id: i.toString(),
          name: `User ${i+1}`,
          email: `user${i+1}@example.com`,
          joinedAt: new Date(Date.now() - Math.random()*10000000000).toISOString(),
          tripCount: Math.floor(Math.random() * 15),
          role: i === 0 ? 'ADMIN' : 'USER'
        }))
      }
    }
  })

  const COLORS = ['#6C47FF', '#F59E0B', '#10B981', '#F43F5E', '#3B82F6']

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin Dashboard" 
        subtitle="Platform Overview • As of today" 
      />

      {/* Row 1 - KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard 
          icon={<Users className="w-8 h-8 text-[#6C47FF]" />}
          value={stats?.totalUsers || 0}
          label="Total Users"
          change={stats?.totalUsersChange || 0}
        />
        <KpiCard 
          icon={<Map className="w-8 h-8 text-[#F59E0B]" />}
          value={stats?.totalTrips || 0}
          label="Total Trips Created"
          change={stats?.totalTripsChange || 0}
        />
        <KpiCard 
          icon={<Calendar className="w-8 h-8 text-[#10B981]" />}
          value={stats?.activeThisWeek || 0}
          label="Active This Week"
          change={stats?.activeThisWeekChange || 0}
        />
        <KpiCard 
          icon={<MessageSquare className="w-8 h-8 text-[#F43F5E]" />}
          value={stats?.communityPosts || 0}
          label="Community Posts"
          change={stats?.communityPostsChange || 0}
        />
      </div>

      {/* Row 2 - Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[60%] bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-[#1E1B4B] font-heading mb-6">Trips Created Per Day (Last 30 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.tripsPerDay || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C47FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6C47FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} minTickGap={30} />
                <YAxis tick={{fontSize: 12, fill: '#6B7280'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1E1B4B' }}
                />
                <Area type="monotone" dataKey="count" stroke="#6C47FF" strokeWidth={3} fillOpacity={1} fill="url(#colorTrips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:w-[40%] bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-[#1E1B4B] font-heading mb-6">Top 5 Cities by Popularity</h3>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.topCities || []}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.topCities || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} trips`, 'Popularity']} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4 - User Management Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-bold text-[#1E1B4B] font-heading text-lg">User Management</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-[#6C47FF] focus:border-[#6C47FF] outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-center">Trips</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.users?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-200 to-purple-200 flex items-center justify-center text-[#1E1B4B] font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{format(new Date(user.joinedAt), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-center font-medium text-gray-900">{user.tripCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-md border ${user.role === 'ADMIN' ? 'bg-purple-50 text-[#6C47FF] border-purple-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-[#6C47FF] hover:bg-indigo-50 rounded-md transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>Showing 1 to 10 of 1245 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 bg-[#6C47FF] text-white rounded">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">2</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">3</button>
            <button className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50">Next</button>
          </div>
        </div>
      </div>
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
