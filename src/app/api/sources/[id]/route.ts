import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z, ZodError } from 'zod'
import { SourceType, UpdateFrequency } from '@prisma/client'

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthContext(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const source = await prisma.newsSource.findFirst({
      where: { id, tenantId: user.tenantId },
    })
    if (!source) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    return NextResponse.json({ data: source })
  } catch (error) {
    console.error('GET /api/sources/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  baseUrl: z.string().url().optional(),
  description: z.string().optional(),
  type: z.nativeEnum(SourceType).optional(),
  category: z.string().optional(),
  updateFrequency: z.nativeEnum(UpdateFrequency).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthContext(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.newsSource.findFirst({
      where: { id, tenantId: user.tenantId },
    })
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const updated = await prisma.newsSource.update({
      where: { id },
      data: {
        name: typeof data.name === 'string' ? data.name : existing.name,
        baseUrl: typeof data.baseUrl === 'string' ? data.baseUrl : existing.baseUrl,
        description: typeof data.description === 'string' ? data.description : existing.description,
        type: data.type ?? existing.type,
        category: typeof data.category === 'string' ? data.category : existing.category,
        updateFrequency: data.updateFrequency ?? existing.updateFrequency,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    const code = (typeof error === 'object' && error && 'code' in (error as object))
      ? (error as { code?: string }).code
      : undefined
    if (code === 'P2002') {
      return NextResponse.json({ error: 'Source name already exists for this tenant' }, { status: 409 })
    }
    console.error('PATCH /api/sources/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

