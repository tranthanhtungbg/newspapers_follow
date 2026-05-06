const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function fixAdmin() {
  const hash = await bcrypt.hash('Admin@123456', 12);
  await prisma.user.update({
    where: { email: 'admin@lingoreader.io' },
    data: { passwordHash: hash }
  });
  console.log('Admin password fixed!');
}

fixAdmin().catch(console.error).finally(() => prisma.$disconnect());
