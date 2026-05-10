import { NextResponse } from "next-auth/next"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const posts = await prisma.communityPost.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, image: true } },
        trip: {
          select: {
            title: true,
            stops: { select: { cityName: true, country: true }, orderBy: { order: 'asc' } }
          }
        }
      }
    })

    const total = await prisma.communityPost.count()
    const nextPage = (page * limit) < total ? page + 1 : null

    return Response.json({ posts, nextPage })
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
    const { title, body: postBody, tripId } = body

    const post = await prisma.communityPost.create({
      data: {
        title,
        body: postBody,
        tripId,
        userId: session.user.id
      }
    })

    return Response.json(post)
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
