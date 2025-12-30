
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminContext } from '@/lib/auth'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: admin.tenantId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: categories })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const { name, slug, description } = createSchema.parse(body)

    const existing = await prisma.category.findFirst({
      where: {
        tenantId: admin.tenantId,
        OR: [{ name }, { slug }]
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'Category with this name or slug already exists' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        tenantId: admin.tenantId,
        name,
        slug,
        description,
      }
    })

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: admin.role,
        action: 'CATEGORY_CREATE',
        resourceType: 'Category',
        resourceId: category.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        newValue: category as any,
      },
    })

    return NextResponse.json({ data: category }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
