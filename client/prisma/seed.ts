const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Admin@1234', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@lockbox.com' },
    update: {},
    create: {
      email: 'admin@lockbox.com',
      name: 'System Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
