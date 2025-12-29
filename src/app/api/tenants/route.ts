import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { z, ZodError } from 'zod'
import bcrypt from 'bcrypt'

const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8), // In prod, this should be hashed. For demo, we'll store plain (BAD PRACTICE but simpler for demo flow if no bcrypt yet)
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, slug, adminEmail, adminPassword } = createTenantSchema.parse(body)

    // Check if slug exists
    const existing = await prisma.tenant.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Tenant slug already exists' }, { status: 409 })
    }

    // Transaction: Create Tenant + Admin User
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug,
          brandingConfig: {},
        },
      })

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: await bcrypt.hash(adminPassword, 10),
          tenantId: tenant.id,
          role: 'ADMIN',
        },
      })

      return { tenant, user }
    })

    // Audit Log
    await createAuditLog({
      actorId: 'SYSTEM_REGISTRATION',
      actorRole: 'SYSTEM',
      action: 'TENANT_CREATE',
      resourceType: 'Tenant',
      resourceId: result.tenant.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      newValue: { name, slug, adminEmail },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Tenant creation failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
