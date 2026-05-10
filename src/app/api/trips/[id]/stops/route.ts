import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { cityName, country, startDate, endDate, order } = await req.json()

    const stop = await prisma.stop.create({
      data: {
        cityName,
        country,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        order: order || 0,
        tripId: id
      }
    })

    return Response.json(stop, { status: 201 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const stops = await prisma.stop.findMany({
      where: { tripId: id },
      orderBy: { order: 'asc' },
      include: { activities: true }
    })
    return Response.json(stops)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
