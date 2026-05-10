// @ts-nocheck
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Cleaning database...')
  
  try {
    // Clear tables in order of dependency
    await prisma.checklistItem.deleteMany({})
    await prisma.tripNote.deleteMany({})
    await prisma.expense.deleteMany({})
    await prisma.activity.deleteMany({})
    await prisma.stop.deleteMany({})
    await prisma.communityPost.deleteMany({})
    await prisma.trip.deleteMany({})
    await prisma.globalActivity.deleteMany({})
    await prisma.city.deleteMany({})
    await prisma.user.deleteMany({})
  } catch (err) {
    console.log('Warning during cleanup:', err.message)
  }

  console.log('🌱 Seeding new data...')

  // 1. Seed Users
  const adminEmail = 'rushang697@gmail.com'
  const userEmail = 'user@example.com'
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Rushang Parul',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Rushang',
      lastName: 'Parul'
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Sarah Explorer',
      password: hashedPassword,
      role: 'USER',
      firstName: 'Sarah',
      lastName: 'Explorer'
    }
  })

  // 2. Seed Cities
  const citiesData = [
    { name: 'Paris', country: 'France', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', costIndex: 3, popularity: 95 },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', costIndex: 3, popularity: 98 },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', costIndex: 2, popularity: 88 },
    { name: 'Rome', country: 'Italy', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', costIndex: 3, popularity: 92 },
    { name: 'New York', country: 'USA', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', costIndex: 3, popularity: 90 },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded', costIndex: 2, popularity: 85 },
    { name: 'Santorini', country: 'Greece', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff', costIndex: 3, popularity: 94 },
    { name: 'Kyoto', country: 'Japan', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', costIndex: 2, popularity: 89 },
    { name: 'Amsterdam', country: 'Netherlands', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017', costIndex: 3, popularity: 87 },
  ]

  const cities = []
  for (const data of citiesData) {
    const city = await prisma.city.create({ data }).catch(e => {
        return prisma.city.findFirst({ where: { name: data.name }})
    })
    cities.push(city)
  }

  // 3. Seed Global Activities
  const globalActivitiesData = [
    { name: 'Eiffel Tower Tour', category: 'Sightseeing', description: 'Priority access to the summit', averageCost: 45, cityName: 'Paris' },
    { name: 'Louvre Museum Guided', category: 'Culture', description: 'See the Mona Lisa with an expert', averageCost: 35, cityName: 'Paris' },
    { name: 'Shibuya Crossing Photo', category: 'Sightseeing', description: 'Capture the worlds busiest crosswalk', averageCost: 0, cityName: 'Tokyo' },
    { name: 'Colosseum Private Tour', category: 'Culture', description: 'Skip the line Roman history', averageCost: 65, cityName: 'Rome' },
    { name: 'Pasta Making Workshop', category: 'Food', description: 'Authentic Italian cooking class', averageCost: 90, cityName: 'Rome' },
  ]

  for (const act of globalActivitiesData) {
    const city = cities.find(c => c.name === act.cityName)
    if (city) {
      await prisma.globalActivity.create({
        data: {
          name: act.name,
          category: act.category,
          description: act.description,
          averageCost: act.averageCost,
          cityId: city.id
        }
      }).catch(() => {})
    }
  }

  // 4. Seed a Sample Public Trip
  const trip = await prisma.trip.create({
    data: {
      title: 'The Great European Loop',
      description: 'A month-long journey through the most beautiful cities in Europe.',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-30'),
      isPublic: true,
      totalBudget: 8000,
      userId: regularUser.id,
      stops: {
        create: [
          {
            cityName: 'Paris',
            country: 'France',
            startDate: new Date('2026-07-01'),
            endDate: new Date('2026-07-10'),
            order: 1,
            activities: {
              create: [
                { name: 'Eiffel Tower', category: 'Sightseeing', cost: 45, description: 'Sunset visit' },
                { name: 'Dinner at Le Comptoir', category: 'Food', cost: 120, description: 'Amazing bistro food' }
              ]
            }
          },
          {
            cityName: 'Amsterdam',
            country: 'Netherlands',
            startDate: new Date('2026-07-11'),
            endDate: new Date('2026-07-15'),
            order: 2,
          }
        ]
      },
      expenses: {
        create: [
          { category: 'Flights', description: 'London to Paris', amount: 150, unitCost: 150, quantity: 1, date: new Date('2026-07-01') },
        ]
      },
      notes: {
        create: [
          { 
            content: 'Remember to book the museum tickets 3 weeks in advance!',
            userId: regularUser.id
          }
        ]
      },
      checklist: {
        create: [
          { label: 'Passport', category: 'Documents', isPacked: true }
        ]
      }
    }
  })

  // 5. Community Post
  await prisma.communityPost.create({
    data: {
      title: 'How I spent $2000 in Paris',
      body: 'I traveled to Paris last month and found some amazing budget hacks. Check out my itinerary!',
      userId: regularUser.id,
      tripId: trip.id
    }
  })

  console.log('✅ Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
