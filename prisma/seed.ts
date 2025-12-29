import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const tenantSlug = 'demo-tenant'
  
  // Clean up
  await prisma.auditLog.deleteMany({})
  await prisma.newsSource.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.tenant.deleteMany({})

  console.log('Cleaned up database.')

  // Create Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Organization',
      slug: tenantSlug,
      brandingConfig: { color: 'blue' },
    },
  })

  // Create Admin User
  const hashedPassword = await bcrypt.hash('supersecretpassword', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedPassword,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  })

  console.log(`Created tenant: ${tenant.name} (${tenant.id})`)
  console.log(`Created admin: ${admin.email} (${admin.id})`)
  
  // Log the seed action manually just to test audit
  await prisma.auditLog.create({
    data: {
      actorId: 'SEED_SCRIPT',
      actorRole: 'SYSTEM',
      action: 'TENANT_CREATE',
      resourceType: 'Tenant',
      resourceId: tenant.id,
      newValue: { name: tenant.name },
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
