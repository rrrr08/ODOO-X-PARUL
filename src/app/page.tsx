import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MapPin, Plane, Globe, Shield, Users, Compass } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Plane className="text-white w-6 h-6 rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 font-heading">Traveloop</span>
          </div>
          
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-md shadow-indigo-100">Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors px-4">Sign In</Link>
                <Link href="/signup">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-md shadow-indigo-100">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140%] h-[600px] bg-indigo-50/50 rounded-[100%] blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide uppercase border border-indigo-100">
              <Compass className="w-4 h-4 animate-spin-slow" />
              Your next adventure starts here
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black leading-[1.1] text-gray-900 tracking-tight">
              Plan your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Perfect Trip</span> with Traveloop
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
              The all-in-one travel planner for modern explorers. Create itineraries, track expenses, and discover hidden gems with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href={isAuthenticated ? "/dashboard" : "/signup"}>
                <Button size="lg" className="h-16 px-10 text-lg bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xl shadow-indigo-200 transition-transform hover:scale-105">
                  {isAuthenticated ? "Go to Dashboard →" : "Start Planning Now"}
                </Button>
              </Link>
              <Link href="/search/cities">
                <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-2xl border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
              <img 
                src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800" 
                alt="Travel Destination" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm font-bold uppercase tracking-widest mb-1 text-white/80">Current Trending</p>
                <h3 className="text-3xl font-black tracking-tight">Paris, France</h3>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 -rotate-6 max-w-[240px]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <span className="font-bold text-gray-900">324+ Destinations</span>
              </div>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Explore a vast world of activities curated by our experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">Everything you need to <span className="text-indigo-600">Travel Smarter</span></h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Focus on the adventure, we'll handle the logistics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Globe className="w-10 h-10" />}
              title="Global Explorer"
              description="Access detailed information on thousands of cities and attractions worldwide."
              color="bg-indigo-50 text-indigo-600"
            />
            <FeatureCard 
              icon={<Shield className="w-10 h-10" />}
              title="Secure Planning"
              description="Your itineraries and documents are safely stored and accessible anywhere, even offline."
              color="bg-emerald-50 text-emerald-600"
            />
            <FeatureCard 
              icon={<Users className="w-10 h-10" />}
              title="Community First"
              description="Join a global community of travelers. Share tips, reviews, and detailed itineraries."
              color="bg-amber-50 text-amber-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <StatCard value="10k+" label="Active Travelers" />
          <StatCard value="50k+" label="Trips Planned" />
          <StatCard value="120+" label="Countries" />
          <StatCard value="4.9/5" label="User Rating" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-indigo-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-10">
          <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">Ready to map out your next adventure?</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">Join thousands of travelers who are using Traveloop to create unforgettable memories.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-lg bg-white text-indigo-600 hover:bg-gray-100 rounded-2xl font-bold shadow-xl">
                Get Started for Free
              </Button>
            </Link>
            <p className="text-indigo-200 font-medium">No credit card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Plane className="text-white w-5 h-5 rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 font-heading">Traveloop</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Traveloop Inc. All rights reserved.</p>
          <div className="flex gap-8 text-sm font-medium text-gray-600">
            <Link href="#" className="hover:text-indigo-600">Terms</Link>
            <Link href="#" className="hover:text-indigo-600">Privacy</Link>
            <Link href="#" className="hover:text-indigo-600">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
      <div className={`w-20 h-20 rounded-2xl ${color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500 shadow-inner`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-[#1E1B4B] mb-4 font-heading">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-lg">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string, label: string }) {
  return (
    <div className="space-y-2">
      <p className="text-4xl md:text-5xl font-black text-[#1E1B4B] tracking-tight">{value}</p>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}
