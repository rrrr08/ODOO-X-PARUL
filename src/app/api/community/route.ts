import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const skip = (page - 1) * limit

    // Fetch real public trips from the database
    const publicTrips = await prisma.trip.findMany({
      where: {
        isPublic: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        stops: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    // Map to a "Post" format for the community UI
    const posts = publicTrips.map(trip => ({
      id: trip.id,
      title: trip.title,
      body: trip.description || `Exploring the world! Check out my itinerary for ${trip.title}.`,
      likes: Math.floor(Math.random() * 50), // Future: Add real likes model
      createdAt: trip.createdAt,
      user: {
        name: trip.user.name || "Adventurer",
        image: trip.user.image
      },
      trip: {
        id: trip.id,
        title: trip.title,
        stops: trip.stops
      }
    }))

    return NextResponse.json({
      posts,
      nextPage: posts.length === limit ? page + 1 : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
