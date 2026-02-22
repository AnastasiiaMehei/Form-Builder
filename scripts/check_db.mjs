import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database...');

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log('Users:', users);

  const forms = await prisma.form.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  console.log('Forms:', forms);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
