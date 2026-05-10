import prisma from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const top = searchParams.get('top') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')
    const minCost = parseInt(searchParams.get('minCost') || '1')
    const maxCost = parseInt(searchParams.get('maxCost') || '5')
    const region = searchParams.get('region')

    const cities = await prisma.city.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { country: { contains: q, mode: 'insensitive' } },
              { region: { contains: q, mode: 'insensitive' } },
            ]
          },
          { costIndex: { gte: minCost, lte: maxCost } },
          region ? { region: { equals: region, mode: 'insensitive' } } : {}
        ]
      },
      orderBy: top ? { popularity: 'desc' } : undefined,
      take: limit
    })

    return Response.json(cities)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
