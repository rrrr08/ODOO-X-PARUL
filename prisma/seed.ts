const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // 1. Seed Users
  const adminEmail = 'rushang697@gmail.com'
  const userEmail = 'user@example.com'
  const bcrypt = require('bcrypt')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Rushang',
      lastName: 'Admin'
    }
  })

  const regularUser = await prisma.user.upsert({
    where: { email: userEmail },
    update: { password: hashedPassword },
    create: {
      email: userEmail,
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
      firstName: 'John',
      lastName: 'Doe'
    }
  })
  console.log('Users seeded successfully')

  // 2. Seed Cities
  const cities = [
    { name: 'Paris', country: 'France', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34', costIndex: 3, popularity: 95 },
    { name: 'Tokyo', country: 'Japan', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf', costIndex: 3, popularity: 98 },
    { name: 'Bali', country: 'Indonesia', region: 'Asia', imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', costIndex: 2, popularity: 88 },
    { name: 'Rome', country: 'Italy', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', costIndex: 3, popularity: 92 },
    { name: 'New York', country: 'USA', region: 'North America', imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9', costIndex: 3, popularity: 90 },
    { name: 'Barcelona', country: 'Spain', region: 'Europe', imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded', costIndex: 2, popularity: 85 },
  ]

  for (const city of cities) {
    await prisma.city.create({ data: city }).catch(() => {})
  }
  console.log('Cities seeded successfully')

  // 3. Seed Trips
  const trip = await prisma.trip.create({
    data: {
      title: 'European Adventure',
      description: 'A grand tour of European capitals.',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-06-15'),
      isPublic: true,
      userId: regularUser.id,
      stops: {
        create: [
          {
            cityName: 'Paris',
            country: 'France',
            startDate: new Date('2026-06-01'),
            endDate: new Date('2026-06-07'),
            order: 1,
            activities: {
              create: [
                { name: 'Eiffel Tower', category: 'Sightseeing', cost: 25 },
                { name: 'Louvre Museum', category: 'Culture', cost: 20 }
              ]
            }
          },
          {
            cityName: 'Rome',
            country: 'Italy',
            startDate: new Date('2026-06-08'),
            endDate: new Date('2026-06-15'),
            order: 2,
          }
        ]
      }
    }
  })
  console.log('Sample trip seeded')

  // 4. Seed Community Posts
  await prisma.communityPost.create({
    data: {
      title: 'Unforgettable trip to Paris!',
      body: 'The views from the Eiffel Tower were breathtaking. I highly recommend visiting in the evening.',
      userId: regularUser.id,
      tripId: trip.id
    }
  })
  console.log('Community posts seeded')

  // 3. Seed Global Activities
  const activities = [
    { name: 'Eiffel Tower Visit', category: 'Sightseeing', description: 'Visit the iconic tower', averageCost: 25, cityName: 'Paris' },
    { name: 'Sushi Making Class', category: 'Food', description: 'Learn to make sushi from a master', averageCost: 85, cityName: 'Tokyo' },
    { name: 'Colosseum Tour', category: 'Culture', description: 'Explore ancient Roman history', averageCost: 45, cityName: 'Rome' },
    { name: 'Surfing Lesson', category: 'Adventure', description: 'Catch waves in paradise', averageCost: 50, cityName: 'Bali' },
    { name: 'Statue of Liberty', category: 'Sightseeing', description: 'Iconic NYC landmark', averageCost: 30, cityName: 'New York' },
    { name: 'Sagrada Familia', category: 'Culture', description: 'Gaudis masterpiece', averageCost: 20, cityName: 'Barcelona' },
  ]

  for (const act of activities) {
    const city = await prisma.city.findFirst({ where: { name: act.cityName } })
    await prisma.globalActivity.create({
      data: {
        name: act.name,
        category: act.category,
        description: act.description,
        averageCost: act.averageCost,
        cityId: city?.id
      }
    }).catch(() => {})
  }
  console.log('Activities seeded successfully with city links')

  console.log('Seeding completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
