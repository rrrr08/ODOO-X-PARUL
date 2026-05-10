import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const filter = searchParams.get('filter') || 'All'
    const limit = 10
    const skip = (page - 1) * limit

    const session = await getServerSession(authOptions)

    let where: any = {}
    let orderBy: any = { createdAt: 'desc' }

    if (filter === 'My Posts' && session?.user?.id) {
      where.userId = session.user.id
    }

    if (filter === 'Recent') {
      orderBy = { createdAt: 'desc' }
    }

    const posts = await prisma.communityPost.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, image: true } },
        trip: { include: { stops: { orderBy: { order: 'asc' } } } },
        likes: true,
        comments: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy,
      skip,
      take: limit
    })

    const formattedPosts = posts.map(post => ({
      ...post,
      isLiked: post.likes.some(l => l.userId === session?.user?.id),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
      isTemplate: post.trip?.isTemplate || false
    }))

    const topDestinations = await prisma.stop.groupBy({
      by: ['cityName'],
      _count: { _all: true },
      orderBy: { _count: { cityName: 'desc' } },
      take: 5
    })

    return NextResponse.json({
      posts: formattedPosts,
      topDestinations: topDestinations.map(d => ({ name: d.cityName, count: d._count._all })),
      nextPage: formattedPosts.length === limit ? page + 1 : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { tripId, body } = await req.json()
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: "Trip not found or not yours" }, { status: 404 })
    }

    // Update trip to be public
    await prisma.trip.update({
      where: { id: tripId },
      data: { isPublic: true }
    })

    // Create community post
    const post = await prisma.communityPost.create({
      data: {
        title: trip.title,
        body: body || trip.description || "Check out my trip!",
        tripId: tripId,
        userId: session.user.id
      }
    })

    return NextResponse.json(post)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
