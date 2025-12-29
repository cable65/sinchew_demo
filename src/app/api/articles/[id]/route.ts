import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

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
    const article = await prisma.article.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { source: true },
    })
    if (!article) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    return NextResponse.json({ data: article })
  } catch (error) {
    console.error('GET /api/articles/[id] error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  editorialLock: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional(),
})

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthContext(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(user.role === 'ADMIN' || user.role === 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.article.findFirst({
      where: { id, tenantId: user.tenantId },
    })
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 })

    const slugToUse = typeof data.slug === 'string' ? slugify(data.slug) : existing.slug || undefined
    if (slugToUse) {
      const conflict = await prisma.article.findFirst({
        where: { tenantId: user.tenantId, slug: slugToUse, NOT: { id } },
        select: { id: true },
      })
      if (conflict) {
        return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
      }
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: data.title ?? existing.title,
        description: data.description ?? existing.description,
        content: data.content ?? existing.content,
        imageUrl: typeof data.imageUrl !== 'undefined' ? data.imageUrl : existing.imageUrl,
        author: typeof data.author === 'string' ? data.author : existing.author,
        tags: Array.isArray(data.tags) ? data.tags : existing.tags,
        status: data.status ?? existing.status,
        editorialLock: typeof data.editorialLock === 'boolean' ? data.editorialLock : existing.editorialLock,
        slug: slugToUse,
        seoTitle: typeof data.seoTitle === 'string' ? data.seoTitle : existing.seoTitle,
        seoDescription: typeof data.seoDescription === 'string' ? data.seoDescription : existing.seoDescription,
        seoKeywords: typeof data.seoKeywords === 'string' ? data.seoKeywords : existing.seoKeywords,
        canonicalUrl: typeof data.canonicalUrl === 'string' ? data.canonicalUrl : existing.canonicalUrl,
        ogTitle: typeof data.ogTitle === 'string' ? data.ogTitle : existing.ogTitle,
        ogDescription: typeof data.ogDescription === 'string' ? data.ogDescription : existing.ogDescription,
        ogImageUrl: typeof data.ogImageUrl === 'string' ? data.ogImageUrl : existing.ogImageUrl,
      },
    })

    const oldValue: Record<string, unknown> = {
      id: existing.id,
      title: existing.title,
      description: existing.description ?? null,
      content: existing.content ?? null,
      imageUrl: existing.imageUrl ?? null,
      author: existing.author ?? null,
      tags: existing.tags,
      status: existing.status,
      editorialLock: existing.editorialLock,
      slug: existing.slug ?? null,
      seoTitle: existing.seoTitle ?? null,
      seoDescription: existing.seoDescription ?? null,
      seoKeywords: existing.seoKeywords ?? null,
      canonicalUrl: existing.canonicalUrl ?? null,
      ogTitle: existing.ogTitle ?? null,
      ogDescription: existing.ogDescription ?? null,
      ogImageUrl: existing.ogImageUrl ?? null,
    }
    const newValue: Record<string, unknown> = {
      id: updated.id,
      title: updated.title,
      description: updated.description ?? null,
      content: updated.content ?? null,
      imageUrl: updated.imageUrl ?? null,
      author: updated.author ?? null,
      tags: updated.tags,
      status: updated.status,
      editorialLock: updated.editorialLock,
      slug: updated.slug ?? null,
      seoTitle: updated.seoTitle ?? null,
      seoDescription: updated.seoDescription ?? null,
      seoKeywords: updated.seoKeywords ?? null,
      canonicalUrl: updated.canonicalUrl ?? null,
      ogTitle: updated.ogTitle ?? null,
      ogDescription: updated.ogDescription ?? null,
      ogImageUrl: updated.ogImageUrl ?? null,
    }
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'ARTICLE_UPDATE',
        resourceType: 'Article',
        resourceId: id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        oldValue: oldValue as any,
        newValue: newValue as any,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('PATCH /api/articles/[id] error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

