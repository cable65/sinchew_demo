import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminContext } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcrypt'

export async function GET(req: NextRequest) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { tenantId: admin.tenantId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.user.count({ where: { tenantId: admin.tenantId } }),
    ])

    return NextResponse.json({ data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).default('VIEWER'),
})

export async function POST(req: NextRequest) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { email, name, password, role } = createSchema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role,
        tenantId: admin.tenantId,
      },
      select: { id: true, email: true, name: true, role: true },
    })

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: admin.role,
        action: 'USER_CREATE',
        resourceType: 'User',
        resourceId: user.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        newValue: user as any,
      },
    })

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
