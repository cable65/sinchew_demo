import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import crypto from 'crypto'

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
  console.log('GET /api/articles called')
  const user = await getAuthContext(req)
  if (!user) {
    console.log('Unauthorized access attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  console.log('User authenticated:', user.email, user.tenantId)

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const sourceId = searchParams.get('sourceId') || undefined
    const q = searchParams.get('q') || ''

    console.log('Query params:', { page, limit, sourceId, q })

    const where: any = { tenantId: user.tenantId }
    if (sourceId) where.sourceId = sourceId
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ]
    }

    console.log('Prisma where:', JSON.stringify(where))

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [
          { publishedAt: 'desc' },
          { fetchedAt: 'desc' },
        ],
        take: limit,
        skip,
        include: { source: true },
      }),
      prisma.article.count({ where }),
    ])

    console.log(`Found ${articles.length} articles, total ${total}`)

    return NextResponse.json({
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/articles error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

const createSchema = z.object({
  sourceId: z.string().uuid(),
  title: z.string().min(1),
  link: z.string().url(),
  description: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().nullable().optional().or(z.literal('')),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  editorialLock: z.boolean().optional(),
  slug: z.string().min(1).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
  publishedAt: z.string().datetime().optional().nullable(),
})

const draftSchema = z.object({
  sourceId: z.string().uuid(),
  title: z.string().optional(),
  link: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  author: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.literal('DRAFT'),
  editorialLock: z.boolean().optional(),
  slug: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImageUrl: z.string().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120)
}

export async function POST(req: NextRequest) {
  const user = await getAuthContext(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!(user.role === 'ADMIN' || user.role === 'EDITOR')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    
    let data;
    if (body.status === 'DRAFT') {
      // Relaxed validation for drafts
      const parsed = draftSchema.parse(body)
      
      // Fill required DB fields with placeholders if missing
      data = {
        ...parsed,
        title: parsed.title || 'Untitled Draft',
        link: parsed.link || `urn:draft:${crypto.randomUUID()}`,
        // Ensure URLs are valid if provided, otherwise clear them or keep as is? 
        // DB just wants String. But if we want to be nice, we leave them.
      }
    } else {
      // Strict validation for non-drafts
      data = createSchema.parse(body)
    }

    const source = await prisma.newsSource.findFirst({
      where: { id: data.sourceId, tenantId: user.tenantId },
    })
    if (!source) return NextResponse.json({ error: 'Invalid source' }, { status: 400 })

    const linkConflict = await prisma.article.findUnique({
      where: { tenantId_link: { tenantId: user.tenantId, link: data.link } }
    })
    // For drafts, if conflict (e.g. reused placeholder?), regenerate? 
    // Unlikely with UUID. But if user provided a link that exists, we block.
    if (linkConflict) return NextResponse.json({ error: 'Article with this link already exists' }, { status: 400 })

    const slugToUse = data.slug ? slugify(data.slug) : undefined
    if (slugToUse) {
      const conflict = await prisma.article.findFirst({
        where: { tenantId: user.tenantId, slug: slugToUse },
      })
      if (conflict) return NextResponse.json({ error: 'Slug already in use' }, { status: 400 })
    }

    const article = await prisma.article.create({
      data: {
        tenantId: user.tenantId,
        sourceId: data.sourceId,
        title: data.title,
        link: data.link,
        description: data.description,
        content: data.content,
        imageUrl: data.imageUrl,
        author: data.author,
        creatorId: user.id, // Track creator for "My Articles"
        tags: data.tags,
        status: data.status || 'DRAFT',
        editorialLock: data.editorialLock || false,
        slug: slugToUse,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        canonicalUrl: data.canonicalUrl,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImageUrl: data.ogImageUrl,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : (data.status === 'PUBLISHED' ? new Date() : null),
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: 'ARTICLE_CREATE',
        resourceType: 'Article',
        resourceId: article.id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        newValue: article as any,
      },
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    console.error('POST /api/articles error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

