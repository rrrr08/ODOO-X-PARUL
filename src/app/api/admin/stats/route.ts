import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const totalUsers = await prisma.user.count()
    const totalTrips = await prisma.trip.count()
    const communityPosts = await prisma.communityPost.count()
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    
    // Active this week (any trip update)
    const activeThisWeek = await prisma.trip.count({
      where: { updatedAt: { gte: oneWeekAgo } }
    })

    const activeLastWeek = await prisma.trip.count({
      where: { 
        updatedAt: { 
          gte: twoWeeksAgo,
          lt: oneWeekAgo
        } 
      }
    })

    // Calculate real changes
    const usersLastWeek = await prisma.user.count({ where: { createdAt: { lt: oneWeekAgo } } })
    const userChange = usersLastWeek === 0 ? 100 : Math.round(((totalUsers - usersLastWeek) / usersLastWeek) * 100)

    const tripsLastWeek = await prisma.trip.count({ where: { createdAt: { lt: oneWeekAgo } } })
    const tripsChange = tripsLastWeek === 0 ? 100 : Math.round(((totalTrips - tripsLastWeek) / tripsLastWeek) * 100)

    const activeChange = activeLastWeek === 0 ? 0 : Math.round(((activeThisWeek - activeLastWeek) / activeLastWeek) * 100)

    const postsLastWeek = await prisma.communityPost.count({ where: { createdAt: { lt: oneWeekAgo } } })
    const postsChange = postsLastWeek === 0 ? 100 : Math.round(((communityPosts - postsLastWeek) / postsLastWeek) * 100)
    
    // Growth Chart Data (Last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyTrips = await prisma.trip.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true }
    })

    // Format for Recharts
    const tripsPerDayMap: Record<string, number> = {}
    dailyTrips.forEach(d => {
      const date = d.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      tripsPerDayMap[date] = (tripsPerDayMap[date] || 0) + d._count.id
    })

    const tripsPerDay = Array.from({length: 30}).map((_, i) => {
      const date = new Date(Date.now() - (29-i)*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return {
        date,
        count: tripsPerDayMap[date] || 0
      }
    })

    const users = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { trips: true } }
      }
    })

    const topCitiesData = await prisma.stop.groupBy({
      by: ['cityName'],
      _count: { cityName: true },
      orderBy: { _count: { cityName: 'desc' } },
      take: 5
    })

    return NextResponse.json({
      totalUsers,
      totalUsersChange: userChange,
      totalTrips,
      totalTripsChange: tripsChange,
      activeThisWeek,
      activeThisWeekChange: activeChange,
      communityPosts,
      communityPostsChange: postsChange,
      tripsPerDay,
      topCities: topCitiesData.map(c => ({
        name: c.cityName,
        value: c._count.cityName
      })),
      users: users.map(u => ({
        ...u,
        joinedAt: u.createdAt,
        tripCount: u._count.trips
      }))
    })
  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
