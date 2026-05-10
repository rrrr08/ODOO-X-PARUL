import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: tripId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Optional: Only allow reset if user owns the trip
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true }
    })

    if (!trip || trip.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Reset means unchecking all items, or deleting all? 
    // The requirement says "reset checklist for re-use", which usually means unchecking.
    await prisma.checklist.updateMany({
      where: { tripId },
      data: { isPacked: false }
    })

    return NextResponse.json({ message: "Checklist reset successfully" })
  } catch (error: any) {
    console.error("[CHECKLIST_RESET_ERROR]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
