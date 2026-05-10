import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tripId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Fetch original trip with all nested data
    const originalTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        stops: {
          include: {
            activities: true
          }
        }
      }
    })

    if (!originalTrip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // 2. Create new cloned trip
    const clonedTrip = await prisma.trip.create({
      data: {
        title: `Copy of ${originalTrip.title}`,
        description: originalTrip.description,
        startDate: originalTrip.startDate,
        endDate: originalTrip.endDate,
        totalBudget: originalTrip.totalBudget,
        coverUrl: originalTrip.coverUrl,
        userId: session.user.id,
        isPublic: false,
        isTemplate: false,
        stops: {
          create: originalTrip.stops.map(stop => ({
            cityName: stop.cityName,
            country: stop.country,
            startDate: stop.startDate,
            endDate: stop.endDate,
            order: stop.order,
            activities: {
              create: stop.activities.map(activity => ({
                name: activity.name,
                category: activity.category,
                description: activity.description,
                cost: activity.cost,
                scheduledAt: activity.scheduledAt,
                duration: activity.duration
              }))
            }
          }))
        }
      }
    })

    return NextResponse.json(clonedTrip)
  } catch (error: any) {
    console.error("[CLONE_TRIP_ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
