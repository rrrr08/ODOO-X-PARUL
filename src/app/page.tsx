import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MapPin, Plane, Globe, Shield, Users, Compass, Search, Map } from "lucide-react";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-indigo-100">
      {/* Official Header */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className="text-[#6C47FF] w-7 h-7" />
            <span className="text-2xl font-bold tracking-tight text-gray-900 font-heading">Traveloop</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <Link href="/search/cities" className="hover:text-[#6C47FF] transition-colors">Destinations</Link>
            <Link href="/community" className="hover:text-[#6C47FF] transition-colors">Community</Link>
            <Link href="/trips" className="hover:text-[#6C47FF] transition-colors">My Trips</Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl px-6 h-11 font-bold transition-all shadow-sm">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-sm font-bold text-gray-700 hover:text-[#6C47FF] px-4">Log in</Link>
                <Link href="/signup">
                  <Button className="bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl px-6 h-11 font-bold transition-all shadow-sm">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero: The World Awaits */}
      <section className="relative pt-48 pb-32 overflow-hidden bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-[#6C47FF] rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-100">
            <Globe className="w-3.5 h-3.5" />
            Reliable Travel Planning
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Your journey, <span className="text-[#6C47FF]">expertly</span> planned.
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
            Create custom itineraries, manage budgets, and discover verified destinations with the world&apos;s most intuitive travel platform.
          </p>
          
          <div className="max-w-3xl mx-auto pt-4">
            <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-1 flex items-center gap-4 px-6 py-4 border-b md:border-b-0 md:border-r border-gray-100 w-full">
                <Search className="w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Where do you want to go?" className="bg-transparent border-none outline-none w-full text-gray-900 font-medium placeholder:text-gray-400" />
              </div>
              <Link href="/search/cities">
                <Button className="w-full md:w-auto h-14 px-10 bg-[#6C47FF] hover:bg-[#5a3ae0] text-white rounded-xl font-bold text-lg transition-all">
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cinematic Grid */}
        <div className="max-w-7xl mx-auto px-6 mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          <HeroPhoto src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e" label="Kyoto" />
          <HeroPhoto src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be" label="London" className="mt-8" />
          <HeroPhoto src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963" label="Santorini" />
          <HeroPhoto src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9" label="Venice" className="mt-8" />
        </div>
      </section>

      {/* Official Features */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <OfficialFeature 
              icon={<Map className="w-8 h-8" />}
              title="Smart Itineraries"
              description="Build day-by-day plans with integrated maps and activity suggestions."
            />
            <OfficialFeature 
              icon={<Shield className="w-8 h-8" />}
              title="Travel Security"
              description="Keep your documents and reservations safe and accessible on any device."
            />
            <OfficialFeature 
              icon={<Users className="w-8 h-8" />}
              title="Traveler Network"
              description="Connect with thousands of global explorers and share your best routes."
            />
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-16 md:justify-between items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <TrustLogo name="National Geographic" />
          <TrustLogo name="Lonely Planet" />
          <TrustLogo name="Trip Advisor" />
          <TrustLogo name="Forbes Travel" />
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="py-20 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-gray-800 pb-16 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-white">
              <Plane className="w-6 h-6 rotate-45" />
              <span className="text-xl font-bold tracking-tight">Traveloop</span>
            </div>
            <p className="text-sm leading-relaxed">The professional standard for modern travel planning and community exploration.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="/search/cities" className="hover:text-white transition-colors">Search Destinations</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community Feed</Link></li>
              <li><Link href="/trips" className="hover:text-white transition-colors">Trip Planner</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs font-medium tracking-widest uppercase">
          © 2026 Traveloop Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function HeroPhoto({ src, label, className }: { src: string, label: string, className?: string }) {
  return (
    <div className={`relative h-[300px] rounded-3xl overflow-hidden shadow-xl group ${className}`}>
      <img src={src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-6 left-6">
        <h4 className="text-white font-bold text-xl">{label}</h4>
      </div>
    </div>
  )
}

function OfficialFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-16 h-16 bg-indigo-50 text-[#6C47FF] rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110 duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
      <p className="text-gray-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function TrustLogo({ name }: { name: string }) {
  return (
    <div className="text-xl font-black tracking-tighter text-gray-400 select-none">
      {name}
    </div>
  )
}
