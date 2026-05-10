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

    const { content, dayTag, stopId } = await req.json()

    const note = await prisma.tripNote.create({
      data: {
        content,
        dayTag,
        stopId,
        tripId: id,
        userId: session.user.id
      }
    })

    return Response.json(note, { status: 201 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const notes = await prisma.tripNote.findMany({
      where: { tripId: id },
      orderBy: { createdAt: 'desc' }
    })
    return Response.json(notes)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
