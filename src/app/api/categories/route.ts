import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthContext } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getAuthContext(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const categories = await prisma.category.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ data: categories })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
