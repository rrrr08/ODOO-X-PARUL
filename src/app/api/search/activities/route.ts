import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities = await prisma.globalActivity.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ]
          },
          category ? { category: { equals: category, mode: 'insensitive' } } : {}
        ]
      },
      include: {
        city: {
          select: { name: true }
        }
      },
      take: limit
    })

    return Response.json(activities.map((a: any) => ({
      ...a,
      cityName: a.city?.name,
      cost: a.averageCost,
      duration: 120
    })))
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
