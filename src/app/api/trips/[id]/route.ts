import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const trip = await prisma.trip.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
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
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const trip = await prisma.trip.update({
      where: {
        id: params.id,
        userId: session.user.id
      },
      data: body
    })

    return Response.json(trip)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.trip.delete({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    return Response.json({ success: true })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
