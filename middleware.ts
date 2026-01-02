import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for demonstration (Use Redis/KV in production)
const rateLimit = new Map<string, { count: number; lastReset: number }>()
const WINDOW_SIZE = 60 * 1000 // 1 minute
const MAX_REQUESTS = 100 // 100 requests per minute per IP

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 1. CORS & Security Headers
  const origin = request.headers.get('origin') || '*'
  
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
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers })
  }

  // 2. Rate Limiting (API Only)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1'
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
  matcher: '/api/:path*',
}
