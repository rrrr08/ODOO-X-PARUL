const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const publicTrips = await prisma.trip.findMany({
    where: { isPublic: true }
  })

  console.log(`Found ${publicTrips.length} public trips to migrate.`)

  for (const trip of publicTrips) {
    // Check if post already exists
    const existingPost = await prisma.communityPost.findFirst({
      where: { tripId: trip.id }
    })

    if (!existingPost) {
      await prisma.communityPost.create({
        data: {
          title: trip.title,
          body: trip.description || "Check out my journey!",
          tripId: trip.id,
          userId: trip.userId
        }
      })
      console.log(`Migrated trip: ${trip.title}`)
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
