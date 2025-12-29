import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import bcrypt from 'bcrypt'
import { createAuditLog } from '@/lib/audit'

async function getAuthContext(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  return payload
}

export async function PUT(req: NextRequest) {
  const payload = await getAuthContext(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const isValid = await bcrypt.compare(currentPassword, user.password)
  if (!isValid) {
    return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })
  
  await createAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'PASSWORD_CHANGE',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      metadata: { method: 'settings_page' }
  })

  return NextResponse.json({ success: true })
}
