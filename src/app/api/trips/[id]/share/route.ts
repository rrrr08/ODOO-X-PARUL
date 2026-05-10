import prisma from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const trip = await prisma.trip.findFirst({
      where: {
        id,
        isPublic: true
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
        user: {
          select: {
            name: true,
            avatarUrl: true
          }
        }
      }
    })

    if (!trip) {
      return Response.json({ error: "Trip not found or not public" }, { status: 404 })
    }

    return Response.json(trip)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
