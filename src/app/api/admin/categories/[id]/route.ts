
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminContext } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  try {
    const body = await req.json()
    const { name, slug, description } = updateSchema.parse(body)

    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category || category.tenantId !== admin.tenantId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name, slug, description },
    })

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: admin.role,
        action: 'CATEGORY_UPDATE',
        resourceType: 'Category',
        resourceId: updated.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        oldValue: category as any,
        newValue: updated as any,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category || category.tenantId !== admin.tenantId) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    await prisma.category.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: admin.role,
        action: 'CATEGORY_DELETE',
        resourceType: 'Category',
        resourceId: category.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        oldValue: category as any,
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
