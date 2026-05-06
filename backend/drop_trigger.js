const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('DROP TRIGGER IF EXISTS check_pinned_vocab_limit ON "PinnedVocabulary";');
    await prisma.$executeRawUnsafe('DROP FUNCTION IF EXISTS check_pinned_vocab_limit();');
    console.log('Trigger dropped successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
