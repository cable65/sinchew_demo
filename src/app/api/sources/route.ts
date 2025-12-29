import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { verifyToken } from '@/lib/auth'
import { z, ZodError } from 'zod'
import { SourceType, UpdateFrequency } from '@prisma/client'

// Schema for validation
const createSourceSchema = z.object({
  name: z.string().min(2),
  baseUrl: z.string().url(),
  description: z.string().optional(),
  type: z.nativeEnum(SourceType),
  category: z.string(),
  updateFrequency: z.nativeEnum(UpdateFrequency),
  credentials: z.string().optional(), // In a real app, this would be a JSON string of keys/tokens
})

// Auth Helper
async function getAuthContext(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    include: { tenant: true },
  })
  return user
}

export async function GET(req: NextRequest) {
  const user = await getAuthContext(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sources = await prisma.newsSource.findMany({
    where: { tenantId: user.tenantId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const user = await getAuthContext(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only Admin/Editor can create sources
  if (user.role === 'VIEWER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = createSourceSchema.parse(body)

    const source = await prisma.newsSource.create({
      data: {
        ...data,
        tenantId: user.tenantId,
      },
    })

    // Audit Log
    await createAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'SOURCE_CREATE',
      resourceType: 'NewsSource',
      resourceId: source.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      newValue: data,
    })

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    // Handle unique constraint violation
    if ((error as any).code === 'P2002') {
      return NextResponse.json({ error: 'Source name already exists for this tenant' }, { status: 409 })
    }
    console.error('Source creation failed:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
