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

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    // Check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id }
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      ])
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            postId,
            userId: session.user.id
          }
        }),
        prisma.communityPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })
      ])
      return NextResponse.json({ liked: true })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
