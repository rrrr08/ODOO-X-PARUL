import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAdminPath = req.nextUrl.pathname.startsWith("/admin")

    if (isAdminPath && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  },
  {
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/trips/:path*", "/profile/:path*", "/community/:path*"],
}
