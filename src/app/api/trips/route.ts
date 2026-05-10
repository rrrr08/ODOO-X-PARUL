import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : undefined
    const includeTemplates = searchParams.get('includeTemplates') === 'true'

    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
        ...(includeTemplates ? {} : { isTemplate: false })
      },
      include: {
        stops: true,
        expenses: true
      },
      orderBy: {
        startDate: 'asc'
      }
    })

    console.log(`[API_TRIPS] Fetched ${trips.length} trips for user ${session.user.id}. includeTemplates=${includeTemplates}`)

    return Response.json(trips)
  } catch (error: any) {
    console.error("[TRIPS_GET_ERROR]", error)
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
    const { title, startDate, endDate, description, coverUrl, totalBudget, isPublic, isTemplate } = body

    const trip = await prisma.trip.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        description,
        coverUrl,
        totalBudget: totalBudget ? parseFloat(totalBudget.toString()) : null,
        isPublic: !!isPublic,
        isTemplate: !!isTemplate,
        userId: session.user.id
      }
    })

    return Response.json(trip)
  } catch (error: any) {
    console.error("[TRIP_CREATE_ERROR]", error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
