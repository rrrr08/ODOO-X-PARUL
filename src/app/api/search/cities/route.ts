import prisma from "@/lib/prisma"

// Seed data fallback
const fallbackCities = [
  { id: '1', name: 'Paris', country: 'France', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400', costIndex: 3, popularity: 5 },
  { id: '2', name: 'Tokyo', country: 'Japan', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400', costIndex: 3, popularity: 5 },
  { id: '3', name: 'Bali', country: 'Indonesia', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=400', costIndex: 2, popularity: 5 },
  { id: '4', name: 'Rome', country: 'Italy', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=400', costIndex: 3, popularity: 5 },
  { id: '5', name: 'New York', country: 'USA', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400', costIndex: 3, popularity: 5 },
  { id: '6', name: 'Barcelona', country: 'Spain', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=400', costIndex: 2, popularity: 4 },
]

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const top = searchParams.get('top') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Try DB first
    try {
      // Assuming a City model exists, if not use fallback
      // const cities = await prisma.city.findMany(...)
      // return Response.json(cities)
      throw new Error("DB model not implemented")
    } catch (dbError) {
      // Fallback
      let results = [...fallbackCities]
      
      if (q) {
        results = results.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase()))
      }
      
      if (top) {
        results = results.sort((a, b) => b.popularity - a.popularity)
      }
      
      return Response.json(results.slice(0, limit))
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
