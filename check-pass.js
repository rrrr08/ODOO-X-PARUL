const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const email = 'rushang697@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log("User not found in DB");
    return;
  }
  
  console.log("User found:", user.email);
  console.log("Hashed password in DB:", user.password);
  
  const match = await bcrypt.compare('admin123', user.password);
  console.log("Does 'admin123' match?", match);
}

check().then(() => prisma.$disconnect());
