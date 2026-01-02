import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Simple in-memory rate limiter for demonstration (Use Redis/KV in production)
const rateLimit = new Map<string, { count: number; lastReset: number }>()
const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute per IP

export async function proxy(req: NextRequest) {
  // 1. Dashboard Auth Check
  const token = req.cookies.get('token')?.value

  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // 2. API Security & Rate Limiting
  const response = NextResponse.next()

  // CORS & Security Headers
  const origin = req.headers.get('origin') || '*'
  
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Handle Preflight
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  // Rate Limiting (API Only)
  if (req.nextUrl.pathname.startsWith('/api')) {
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    
    let record = rateLimit.get(ip)
    
    if (!record || now - record.lastReset > WINDOW_SIZE) {
      record = { count: 0, lastReset: now }
    }
    
    if (record.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: response.headers }
      )
    }
    
    record.count++
    rateLimit.set(ip, record)
    
    // Cleanup old entries periodically (simple optimization)
    if (rateLimit.size > 10000) rateLimit.clear()
    
    // Add Rate Limit Headers
    response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString())
    response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - record.count).toString())
    response.headers.set('X-RateLimit-Reset', (record.lastReset + WINDOW_SIZE).toString())
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
}
