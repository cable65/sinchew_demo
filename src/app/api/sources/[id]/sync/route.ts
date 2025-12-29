import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { fetchRssFeed } from '@/lib/services/rss-service'
import { randomUUID } from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  // 1. Auth Check
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // 2. Get Source
    const source = await prisma.newsSource.findUnique({
      where: { id },
    })

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    if (source.type !== 'NEWS') {
      return NextResponse.json({ error: 'Only NEWS feeds can be synced manually' }, { status: 400 })
    }

    // 3. Fetch Feed
    const feedData = await fetchRssFeed(source.baseUrl)

    // 4. Persist Articles (dedupe on tenantId+link)
    const items = (feedData.items || []).map((item: any) => ({
      tenantId: source.tenantId,
      sourceId: source.id,
      title: item.title || 'Untitled',
      link: item.link,
      guid: item.guid,
      description: item.content || item.contentSnippet || null,
      content: item.content || null,
      imageUrl: (item.enclosure && item.enclosure.url) ? item.enclosure.url : null,
      publishedAt: item.isoDate ? new Date(item.isoDate) : (item.pubDate ? new Date(item.pubDate) : null),
    })).filter(a => !!a.link)

    let inserted = 0
    if (items.length > 0) {
      const hasCreateMany = (prisma as any)?.article?.createMany
      if (hasCreateMany) {
        const result = await (prisma as any).article.createMany({ data: items, skipDuplicates: true })
        inserted = result?.count ?? items.length
      } else {
        const results = await prisma.$transaction(
          items.map((item) => prisma.$executeRaw`
            INSERT INTO "articles" (
              "id", "tenant_id", "source_id", "title", "link", "guid", "description", "content", "image_url", "published_at"
            ) VALUES (
              ${randomUUID()}, ${item.tenantId}, ${item.sourceId}, ${item.title}, ${item.link}, ${item.guid ?? null}, ${item.description ?? null}, ${item.content ?? null}, ${item.imageUrl ?? null}, ${item.publishedAt ?? null}
            )
            ON CONFLICT ("tenant_id", "link") DO NOTHING
          `)
        )
        inserted = results.reduce((sum: number, r: number) => sum + (typeof r === 'number' ? r : 0), 0)
      }
    }

    // 5. Update Source Last Fetch Time
    await prisma.newsSource.update({
      where: { id },
      data: { lastFetchedAt: new Date() },
    })

    // 6. Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: payload.userId as string,
        actorRole: payload.role as string,
        action: 'SOURCE_SYNC',
        resourceType: 'NewsSource',
        resourceId: id,
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        newValue: { itemsFetched: feedData.items.length, itemsInserted: inserted },
      },
    })

    return NextResponse.json({ 
      success: true, 
      itemsFetched: feedData.items.length,
      itemsInserted: inserted,
      latestItem: feedData.items[0]
    })
  } catch (error) {
    console.error('Sync failed:', error)
    const message = (error as any)?.message || 'Sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
