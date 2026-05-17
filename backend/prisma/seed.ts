import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const categories = [
    { name: 'Salary', type: 'income' },
    { name: 'Freelance', type: 'income' },
    { name: 'Gift', type: 'income' },
    { name: 'Allowance', type: 'income' },

    { name: 'Food', type: 'expense' },
    { name: 'Transport', type: 'expense' },
    { name: 'Education', type: 'expense' },
    { name: 'Entertainment', type: 'expense' },
    { name: 'Health', type: 'expense' },
    { name: 'Shopping', type: 'expense' },
    { name: 'Bills', type: 'expense' },
  ] as const;

  for (const category of categories) {
    await prisma.category.upsert({
      where: {
        name_type: {
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: {
        name: category.name,
        type: category.type,
      },
    });
  }

  console.log('Category seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });