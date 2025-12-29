import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const tenants = await prisma.tenant.findMany()
  console.log('Tenants:', tenants)
  const users = await prisma.user.findMany()
  console.log('Users:', users)
  const auditLogs = await prisma.auditLog.findMany()
  console.log('Audit Logs:', auditLogs)
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
