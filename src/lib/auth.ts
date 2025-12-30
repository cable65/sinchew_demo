import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-dev-key-do-not-use-in-prod'
)

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY)
}

export async function verifyToken(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch (error) {
    return null
  }
}

export async function getAuthContext(req: NextRequest) {
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

export async function getAdminContext(req: NextRequest) {
  const user = await getAuthContext(req)
  if (!user || user.role !== 'ADMIN') return null
  return user
}
