import { Sidebar } from "@/components/shared/Sidebar"
import { BottomNav } from "@/components/shared/BottomNav"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 md:ml-60 pb-16 md:pb-0">
        <main className="p-4 md:p-8 w-full max-w-full">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
