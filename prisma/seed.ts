const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Assuming City and Activity are not globally seeded in the DB structure
  // but if they were, this is where we'd add the 30 cities and 50 activities.
  // Based on the schema provided, cities and activities belong to Stops.
  // For the global search (Cities Search and Activities Search), the API routes
  // currently use hardcoded fallback data since the provided schema does not 
  // contain global `City` or `GlobalActivity` models.
  
  const adminEmail = 'rushang697@gmail.com'
  const bcrypt = require('bcrypt')
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })
  console.log('Admin user upserted successfully')

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
