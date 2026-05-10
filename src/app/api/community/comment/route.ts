import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { postId, content } = await req.json()
    if (!content) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId: session.user.id,
        content
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
