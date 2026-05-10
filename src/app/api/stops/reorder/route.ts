import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stops } = await req.json() // Array of { id, order }

    if (!Array.isArray(stops)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Update each stop order in a transaction
    await prisma.$transaction(
      stops.map((stop: { id: string; order: number }) =>
        prisma.stop.update({
          where: { id: stop.id },
          data: { order: stop.order }
        })
      )
    )

    return NextResponse.json({ message: "Reordered successfully" })
  } catch (error: any) {
    console.error("[REORDER_STOPS_ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
