'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Plus, RefreshCcw, RefreshCw } from 'lucide-react'

interface NewsSource {
  id: string
  name: string
  baseUrl: string
  type: string
  category: string
  updateFrequency: string
  lastFetchedAt?: string | null
  createdAt: string
}

export default function SourcesPage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const fetchSources = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sources')
      if (!res.ok) throw new Error('Failed to fetch sources')
      const payload = await res.json()
      const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
      setSources(items as NewsSource[])
    } catch (err) {
      setError('Failed to load sources')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (id: string) => {
    setSyncingId(id)
    try {
      const res = await fetch(`/api/sources/${id}/sync`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || 'Sync failed'
        throw new Error(msg)
      }
      fetchSources()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to sync source'
      alert(msg)
    } finally {
      setSyncingId(null)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">News Sources</h1>
        <Button asChild>
          <Link href="/dashboard/sources/create" prefetch={false}>
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCcw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : sources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-gray-500">No news sources found.</p>
            <Button variant="link" asChild className="mt-2">
              <Link href="/dashboard/sources/create">Create your first source</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((source) => (
            <Card key={source.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                  {source.name}
                </CardTitle>
                <div className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {source.type}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p className="truncate">{source.baseUrl}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>{source.category}</span>
                    <span>{source.updateFrequency}</span>
                  </div>
                  {source.lastFetchedAt && (
                    <p className="mt-2 text-xs">
                      Last fetch: {new Date(source.lastFetchedAt).toLocaleString()}
                    </p>
                  )}
                  <div className="mt-2 flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/sources/${source.id}`} prefetch={false}>Edit</Link>
                    </Button>
                    {source.type === 'NEWS' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start px-0"
                        onClick={() => handleSync(source.id)}
                        disabled={syncingId === source.id}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${syncingId === source.id ? 'animate-spin' : ''}`} />
                        Sync
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
