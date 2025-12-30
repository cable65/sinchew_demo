import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Footer } from '@/components/dashboard/footer'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getUserContext() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  if (!token) return { platformName: undefined, role: undefined }
  
  const payload = await verifyToken(token)
  if (!payload?.userId) return { platformName: undefined, role: undefined }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        role: true,
        tenant: {
          select: {
            brandingConfig: true,
            name: true
          }
        }
      }
    })

    let platformName = user?.tenant?.name
    if (user?.tenant?.brandingConfig) {
      const branding = user.tenant.brandingConfig as { platformName?: string }
      if (branding.platformName) {
        platformName = branding.platformName
      }
    }
    return { platformName, role: user?.role }
  } catch (error) {
    console.error('Error fetching tenant settings:', error)
    return { platformName: undefined, role: undefined }
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { platformName, role } = await getUserContext()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-black dark:bg-gray-950 dark:text-white">
      <Sidebar platformName={platformName} userRole={role} className="hidden md:flex" />
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
