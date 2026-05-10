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
    
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const activeThisWeek = await prisma.trip.count({
      where: {
        updatedAt: { gte: oneWeekAgo }
      }
    })

    const communityPosts = await prisma.communityPost.count()
    
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

    return NextResponse.json({
      totalUsers,
      totalUsersChange: 12.5,
      totalTrips,
      totalTripsChange: 8.2,
      activeThisWeek,
      activeThisWeekChange: -2.4,
      communityPosts,
      communityPostsChange: 15.3,
      tripsPerDay: Array.from({length: 30}).map((_, i) => ({
        date: new Date(Date.now() - (29-i)*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: Math.floor(Math.random() * 50) + 10
      })),
      topCities: [
        { name: 'Paris', value: 450 },
        { name: 'Tokyo', value: 380 },
        { name: 'Rome', value: 320 },
        { name: 'Bali', value: 290 },
        { name: 'New York', value: 210 }
      ],
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
