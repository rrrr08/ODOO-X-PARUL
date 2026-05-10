import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: Promise<{ sid: string }> }) {
  try {
    const { sid } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, category, description, cost, expense, intensity, duration, scheduledAt } = await req.json()

    const activity = await prisma.activity.create({
      data: {
        name,
        category,
        description,
        cost: cost || 0,
        expense: expense || 0,
        intensity: intensity || "Low",
        duration,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        stopId: sid
      }
    })

    return Response.json(activity, { status: 201 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ sid: string }> }) {
  try {
    const { sid } = await params
    const activities = await prisma.activity.findMany({
      where: { stopId: sid },
      orderBy: { scheduledAt: 'asc' }
    })
    return Response.json(activities)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
