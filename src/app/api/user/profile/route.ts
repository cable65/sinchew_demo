import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

async function getAuthContext(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return payload
}

export async function GET(req: NextRequest) {
  const payload = await getAuthContext(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: { id: true, email: true, name: true, role: true }
  })

  return NextResponse.json(user)
}

export async function PUT(req: NextRequest) {
  const payload = await getAuthContext(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name } = body

  const oldUser = await prisma.user.findUnique({
      where: { id: payload.userId as string }
  })

  const user = await prisma.user.update({
    where: { id: payload.userId as string },
    data: { name },
  })

  await createAuditLog({
      actorId: payload.userId as string,
      actorRole: payload.role as any,
      action: 'USER_UPDATE',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      oldValue: { name: oldUser?.name },
      newValue: { name: user.name }
  })

  return NextResponse.json(user)
}
