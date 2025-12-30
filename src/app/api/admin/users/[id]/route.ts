import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

async function getAdminContext(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  const user = await prisma.user.findUnique({ where: { id: payload.userId as string } })
  if (!user || user.role !== 'ADMIN') return null
  return user
}

const updateSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'EDITOR', 'VIEWER']).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.user.findFirst({ where: { id, tenantId: admin.tenantId } })
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: typeof data.name === 'string' ? data.name : existing.name,
        role: typeof data.role === 'string' ? data.role : existing.role,
      },
      select: { id: true, email: true, name: true, role: true },
    })

    if (typeof data.role === 'string' && data.role !== existing.role) {
      await prisma.auditLog.create({
        data: {
          actorId: admin.id,
          actorRole: admin.role,
          action: 'USER_ROLE_UPDATE',
          resourceType: 'User',
          resourceId: id,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          oldValue: { role: existing.role },
          newValue: { role: updated.role },
        },
      })
    }

    if (typeof data.name === 'string' && data.name !== existing.name) {
      await prisma.auditLog.create({
        data: {
          actorId: admin.id,
          actorRole: admin.role,
          action: 'USER_UPDATE',
          resourceType: 'User',
          resourceId: id,
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          oldValue: { name: existing.name },
          newValue: { name: updated.name },
        },
      })
    }

    return NextResponse.json({ data: updated })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = await getAdminContext(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (admin.id === id) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  try {
    const existing = await prisma.user.findFirst({ where: { id, tenantId: admin.tenantId } })
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    await prisma.user.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: admin.role,
        action: 'USER_DELETE',
        resourceType: 'User',
        resourceId: id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        oldValue: { email: existing.email, role: existing.role },
        newValue: { deleted: true },
      },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
