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
    include: { tenant: true }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({
    name: user.tenant.name,
    brandingConfig: user.tenant.brandingConfig,
    systemConfig: user.tenant.systemConfig
  })
}

export async function PUT(req: NextRequest) {
  const payload = await getAuthContext(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    include: { tenant: true }
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, brandingConfig, systemConfig } = body

  const updatedTenant = await prisma.tenant.update({
    where: { id: user.tenantId },
    data: {
      name: name ?? undefined,
      brandingConfig: brandingConfig ?? undefined,
      systemConfig: systemConfig ?? undefined
    }
  })

  await createAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'TENANT_UPDATE',
      resourceType: 'Tenant',
      resourceId: user.tenantId,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      oldValue: { 
          name: user.tenant.name, 
          brandingConfig: user.tenant.brandingConfig,
          systemConfig: user.tenant.systemConfig
      },
      newValue: { 
          name: updatedTenant.name, 
          brandingConfig: updatedTenant.brandingConfig,
          systemConfig: updatedTenant.systemConfig
      }
  })

  return NextResponse.json(updatedTenant)
}
