
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { checkGrammar } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { content } = await req.json()
    
    if (!content) {
      return NextResponse.json({ error: 'Content required' }, { status: 400 })
    }

    const result = await checkGrammar(content)

    // Log the AI usage
    await prisma.auditLog.create({
      data: {
        actorId: payload.userId as string,
        actorRole: payload.role as string,
        action: 'AI_GRAMMAR_CHECK',
        resourceType: 'AI',
        resourceId: 'grammar-check',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        metadata: { contentLength: content.length },
      },
    })

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('AI Grammar Error:', error)
    return NextResponse.json({ error: 'Failed to check grammar' }, { status: 500 })
  }
}
