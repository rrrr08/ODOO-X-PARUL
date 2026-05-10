import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined

    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        stops: true,
        expenses: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    return Response.json(trips)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, startDate, endDate, description, coverUrl, totalBudget, isPublic } = body

    const trip = await prisma.trip.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        coverUrl,
        totalBudget,
        isPublic,
        userId: session.user.id
      }
    })

    return Response.json(trip)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
