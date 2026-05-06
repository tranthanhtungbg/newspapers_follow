const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS enforce_pin_limit ON pinned_vocabulary;');
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS check_pin_limit();');
    console.log('Trigger enforce_pin_limit dropped successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
