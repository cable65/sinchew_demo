import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getTenantPlatformName() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return undefined
  
  const payload = await verifyToken(token)
  if (!payload?.userId) return undefined

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        tenant: {
          select: {
            brandingConfig: true,
            name: true
          }
        }
      }
    })

    if (user?.tenant?.brandingConfig) {
      const branding = user.tenant.brandingConfig as { platformName?: string }
      if (branding.platformName) {
        return branding.platformName
      }
    }
    return user?.tenant?.name
  } catch (error) {
    console.error('Error fetching tenant settings:', error)
    return undefined
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const platformName = await getTenantPlatformName()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-black dark:bg-gray-950 dark:text-white">
      <Sidebar platformName={platformName} className="hidden md:flex" />
      <div className="flex flex-1 flex-col">
        <Header platformName={platformName} />
        <main className="flex flex-1 flex-col overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="flex-1 p-4 md:p-6 w-full max-w-[100vw]">
            {children}
          </div>
          <Footer platformName={platformName} />
        </main>
      </div>
    </div>
  )
}
