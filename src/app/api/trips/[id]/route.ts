import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const trip = await prisma.trip.findFirst({
      where: {
        id,
        OR: userId ? [
          { userId: userId },
          { isPublic: true }
        ] : [
          { isPublic: true }
        ]
      },
      include: {
        stops: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              orderBy: { scheduledAt: 'asc' }
            }
          }
        },
        expenses: true,
        notes: true,
        checklist: true
      }
    })

    if (!trip) {
      return Response.json({ error: "Not found" }, { status: 404 })
    }

    return Response.json(trip)
  } catch (error: any) {
    console.error("[TRIP_GET_ERROR]", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const trip = await prisma.trip.update({
      where: {
        id,
        userId: session.user.id
      },
      data: body
    })

    return Response.json(trip)
  } catch (error: any) {
    console.error("[TRIP_PUT_ERROR]", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.trip.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return Response.json({ success: true })
  } catch (error: any) {
    console.error("[TRIP_DELETE_ERROR]", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const trip = await prisma.trip.update({
      where: {
        id,
        userId: session.user.id
      },
      data: body
    })

    if (body.isPublic !== undefined) {
      if (body.isPublic) {
        // Idempotent creation: check if already exists or use upsert
        const existingPost = await prisma.communityPost.findFirst({
          where: { tripId: trip.id, userId: session.user.id }
        })
        
        if (!existingPost) {
          await prisma.communityPost.create({
            data: {
              title: `Itinerary for ${trip.title}`,
              body: trip.description || `Check out my travel plan for ${trip.title}!`,
              tripId: trip.id,
              userId: session.user.id,
            }
          })
        }
      } else {
        await prisma.communityPost.deleteMany({
          where: {
            tripId: trip.id,
            userId: session.user.id
          }
        })
      }
    }

    return Response.json(trip)
  } catch (error: any) {
    console.error("[TRIP_PATCH_ERROR]", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
