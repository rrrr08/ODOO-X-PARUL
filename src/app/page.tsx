import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();
  const isAuthenticated = !!session;

  return (
    <div className="relative isolate pt-14">
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Secure Authentication for your Next.js App
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A production-ready boilerplate featuring custom JWT auth, Prisma ORM, Neon PostgreSQL, 
              Role-based access control, and Forgot Password flow.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg">Get Started</Button>
                  </Link>
                  <Link href="/signin" className="text-sm font-semibold leading-6 text-gray-900">
                    Sign In <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Core Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg bg-blue-50/50">
                    <h4 className="font-bold text-blue-700">Custom JWT Auth</h4>
                    <p className="text-sm text-gray-600">Secure HTTP-only cookies, no third-party services required.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-purple-50/50">
                    <h4 className="font-bold text-purple-700">RBAC</h4>
                    <p className="text-sm text-gray-600">Role-based access control with USER and ADMIN roles.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50/50">
                    <h4 className="font-bold text-green-700">Modern Stack</h4>
                    <p className="text-sm text-gray-600">Next.js 14+ App Router, Prisma, Tailwind, and Zod.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
