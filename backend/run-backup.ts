import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findFirst();

  if (!admin) {
    console.error('No user found');
    return;
  }
  const backup = await prisma.systemBackup.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log('Last backup:', backup);
}

main().catch(console.error).finally(() => prisma.$disconnect());
