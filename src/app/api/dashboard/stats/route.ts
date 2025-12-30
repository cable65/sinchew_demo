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

    const formatDateKey = (d: Date, r: string) => {
      if (r === 'today') {
        return `${d.getHours().toString().padStart(2, '0')}:00`
      }
      return d.toISOString().split('T')[0]
    }

    // Pre-fill keys with 0 to ensure continuous graph
    if (range === 'today') {
      for (let i = 0; i < 24; i++) {
        trendMap.set(`${i.toString().padStart(2, '0')}:00`, 0)
      }
    } else {
      let current = new Date(startDate || new Date())
      const end = new Date()
      end.setHours(0, 0, 0, 0)

      if (range === 'all') {
        if (articles.length > 0) {
          current = new Date(articles[0].createdAt)
        } else {
          // If no articles at all, we can't determine a range for "all".
          // We'll leave the map empty, resulting in an empty trend array.
          // The frontend will show "No data available".
          current = new Date(end.getTime() + 1) // Force skip loop
        }
      }

      current.setHours(0, 0, 0, 0)
      
      // Safety limit for 'all' to prevent massive loops (e.g. bad dates)
      // Limit to 5 years?
      const safetyLimit = 365 * 5
      let loopCount = 0

      while (current <= end && loopCount < safetyLimit) {
        trendMap.set(formatDateKey(current, range), 0)
        current.setDate(current.getDate() + 1)
        loopCount++
      }
    }

    // Fill with actual data
    articles.forEach(a => {
      const d = new Date(a.createdAt)
      const key = formatDateKey(d, range)
      if (trendMap.has(key)) {
        trendMap.set(key, (trendMap.get(key) || 0) + 1)
      } else {
        // For 'all' or edge cases where date might be outside pre-filled range (shouldn't happen with correct logic)
        // We add it to ensure data isn't lost
        trendMap.set(key, (trendMap.get(key) || 0) + 1)
      }
    })
    
    // Sort by date key to ensure chronological order (Map insertion order is usually preserved but explicit sort is safer)
    // Actually, we inserted in order, so Map order is correct.
    // But 'all' fallback or extra keys might be out of order.
    // Let's sort the final array.
    
    const trend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

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
