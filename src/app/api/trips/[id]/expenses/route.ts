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

    const { category, description, quantity, unitCost, date, stopId } = await req.json()
    const amount = (quantity || 1) * unitCost

    const expense = await prisma.expense.create({
      data: {
        category,
        description,
        quantity: quantity || 1,
        unitCost,
        amount,
        date: date ? new Date(date) : null,
        stopId,
        tripId: id
      }
    })

    return Response.json(expense, { status: 201 })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const expenses = await prisma.expense.findMany({
      where: { tripId: id },
      orderBy: { date: 'asc' }
    })
    return Response.json(expenses)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
