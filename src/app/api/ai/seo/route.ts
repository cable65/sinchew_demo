
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { generateSeoSuggestions } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1]
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, content } = await req.json()
    
    if (!title && !content) {
      return NextResponse.json({ error: 'Title or content required' }, { status: 400 })
    }

    const suggestions = await generateSeoSuggestions(title || '', content || '')

    // Log the AI usage
    await prisma.auditLog.create({
      data: {
        actorId: payload.userId as string,
        actorRole: payload.role as string,
        action: 'AI_SEO_GENERATE',
        resourceType: 'AI',
        resourceId: 'seo-gen',
        ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        metadata: { titleLength: title?.length, contentLength: content?.length },
      },
    })

    return NextResponse.json({ data: suggestions })
  } catch (error) {
    console.error('AI SEO Error:', error)
    return NextResponse.json({ error: 'Failed to generate SEO suggestions' }, { status: 500 })
  }
}
