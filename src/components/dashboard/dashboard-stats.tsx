'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Download, FileText, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type StatsData = {
  range: string
  role: string
  summary: {
    total: number
    byStatus: { status: string; count: number }[]
  }
  trend: { date: string; count: number }[]
}

export function DashboardStats() {
  const [range, setRange] = useState('today')
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [range])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/stats?range=${range}`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (!data) return

    // Prepare CSV content
    // Section 1: Summary
    let csv = `Report Range,${range}\nRole,${data.role}\nTotal Articles,${data.summary.total}\n\n`
    
    // Section 2: Status Breakdown
    csv += `Status,Count\n`
    data.summary.byStatus.forEach(item => {
      csv += `${item.status},${item.count}\n`
    })
    csv += `\n`

    // Section 3: Trend Data
    csv += `Date,Article Count\n`
    data.trend.forEach(item => {
      csv += `${item.date},${item.count}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dashboard-report-${range}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const exportPDF = () => {
    if (!data) return

    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text('Dashboard Report', 14, 22)
    
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    doc.text(`Range: ${range}`, 14, 36)
    doc.text(`Role: ${data.role}`, 14, 42)
    doc.text(`Total Articles: ${data.summary.total}`, 14, 48)

    // Status Table
    autoTable(doc, {
      startY: 55,
      head: [['Status', 'Count']],
      body: data.summary.byStatus.map(s => [s.status, s.count]),
    })

    // Trend Table
    const finalY = (doc as any).lastAutoTable.finalY || 60
    doc.text('Trend Data', 14, finalY + 10)
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Date/Time', 'Article Count']],
      body: data.trend.map(t => [t.date, t.count]),
    })

    doc.save(`dashboard-report-${range}.pdf`)
  }

  if (loading && !data) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-gray-400" /></div>
  }

  if (!data) return <div>Failed to load data</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {data.role === 'ADMIN' ? 'Platform Overview' : 'My Performance'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {data.role === 'ADMIN' 
              ? 'Showing statistics for all articles across the platform.' 
              : 'Showing statistics for your own articles.'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="365d">Last 365 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={exportCSV} title="Export CSV">
            <FileText className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={exportPDF} title="Export PDF">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total}</div>
            <p className="text-xs text-muted-foreground">
              in selected period
            </p>
          </CardContent>
        </Card>
        
        {data.summary.byStatus.map((status) => (
          <Card key={status.status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {status.status.toLowerCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{status.count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content: Graph vs Table */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Article Trends</CardTitle>
          <CardDescription>
            Article creation over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="graph" className="space-y-4">
            <TabsList>
              <TabsTrigger value="graph">Graph View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="graph" className="h-[350px]">
              {data.trend.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center border rounded-md bg-muted/10 text-muted-foreground">
                  No data available for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </TabsContent>
            
            <TabsContent value="table">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date / Time</TableHead>
                      <TableHead className="text-right">Articles Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.trend.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          No data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.trend.map((item) => (
                        <TableRow key={item.date}>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
