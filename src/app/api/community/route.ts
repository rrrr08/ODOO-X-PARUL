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

    // Add fallback data if database is empty so the UI doesn't look barren
    if (posts.length === 0) {
      posts.push(
        { 
          id: '1', 
          title: 'Just got back from an amazing 2 weeks in Japan!', 
          body: 'Highly recommend taking the Shinkansen down to Kyoto. The bamboo forest was incredible.', 
          likes: 45, 
          createdAt: new Date(Date.now() - 86400000*2), 
          user: { name: 'Sarah Jenkins', image: null }, 
          trip: { id: 'sample-1', title: 'Japan 2026', stops: [{cityName:'Tokyo'}, {cityName:'Kyoto'}] } 
        },
        { 
          id: '2', 
          title: 'Backpacking across Europe on a budget', 
          body: 'We managed to keep our daily budget under $50 by staying in hostels and eating street food.', 
          likes: 112, 
          createdAt: new Date(Date.now() - 86400000*5), 
          user: { name: 'Mark Doe', image: null },
          trip: null
        }
      )
    }

    return NextResponse.json({
      posts,
      nextPage: posts.length === limit ? page + 1 : null
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
