// /scripts/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@lockbox.app'
  const adminPassword = process.env.ADMIN_PASSWORD || 'LockboxAdmin2024!'

  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Admin',
      password: hashedPassword,
      role: 'SUPERADMIN',
      emailVerified: new Date(),
      isActive: true,
    },
  })
  
  console.log('--- SEEDING COMPLETE ---')
  console.log('Admin Email:', admin.email)
  console.log('Role:', admin.role)
  console.log('------------------------')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
