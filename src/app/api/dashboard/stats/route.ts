import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

  const { searchParams } = new URL(req.url)
  const range = searchParams.get('range') || 'today' // today, 7d, 30d, 365d, all

  const now = new Date()
  let startDate: Date | undefined

  switch (range) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0))
      break
    case '7d':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
      break
    case '365d':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 365)
      break
    case 'all':
      startDate = undefined
      break
    default:
      startDate = new Date(now.setHours(0, 0, 0, 0)) // Default to today
  }

  const where: any = {
    tenantId: user.tenantId,
  }

  if (startDate) {
    where.createdAt = {
      gte: startDate,
    }
  }

  // Role-based filtering
  // ADMIN: sees all
  // OTHERS (EDITOR/VIEWER): sees only their own
  if (user.role !== 'ADMIN') {
    where.creatorId = user.id
  }

  try {
    // 1. Total Count
    const total = await prisma.article.count({ where })

    // 2. By Status
    const byStatus = await prisma.article.groupBy({
      by: ['status'],
      where,
      _count: {
        _all: true,
      },
    })

    // 3. Trend Data (for Graph)
    // For simplicity in MVP, we'll fetch createdAt and aggregate in JS.
    // In production with millions of rows, use raw SQL date_trunc.
    const articles = await prisma.article.findMany({
      where,
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Aggregate
    const trendMap = new Map<string, number>()

    articles.forEach(a => {
      let key: string
      const d = new Date(a.createdAt)
      
      if (range === 'today') {
        // Hourly: "HH:00"
        key = `${d.getHours().toString().padStart(2, '0')}:00`
      } else if (range === '365d' || range === 'all') {
        // Monthly: "YYYY-MM" (or maybe Daily is still fine for 365? Let's do Monthly for 365/all to reduce points)
        // Actually user might want granularity. Let's do Daily for 365d too, charts can handle 365 points.
        // For "All", it could be years. Let's stick to Daily YYYY-MM-DD for consistency unless 'today'.
        key = d.toISOString().split('T')[0]
      } else {
        // Daily: "YYYY-MM-DD"
        key = d.toISOString().split('T')[0]
      }

      trendMap.set(key, (trendMap.get(key) || 0) + 1)
    })

    // Fill in gaps? Optional. For now, just return what we have.
    // Ideally we should fill 0s for missing days/hours.
    
    // Convert map to array
    const trend = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count
    }))

    return NextResponse.json({
      range,
      role: user.role,
      summary: {
        total,
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count._all })),
      },
      trend,
    })

  } catch (error) {
    console.error('Dashboard Stats Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
