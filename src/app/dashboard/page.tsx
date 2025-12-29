import { DashboardStats } from '@/components/dashboard/dashboard-stats'

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to the News Aggregator CMS.</p>
      </div>
      
      <DashboardStats />
    </div>
  )
}
