'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

type SourceType = 'NEWS' | 'BLOG' | 'SOCIAL'
type UpdateFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MANUAL'

interface NewsSource {
  id: string
  name: string
  baseUrl: string
  description?: string | null
  type: SourceType
  category: string
  updateFrequency: UpdateFrequency
}

export default function EditSourcePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<SourceType>('NEWS')
  const [category, setCategory] = useState('')
  const [updateFrequency, setUpdateFrequency] = useState<UpdateFrequency>('HOURLY')

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await fetch(`/api/sources/${id}`)
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || 'Failed to load source')
        const data: NewsSource = payload.data
        setName(data.name)
        setBaseUrl(data.baseUrl)
        setDescription(data.description || '')
        setType(data.type)
        setCategory(data.category)
        setUpdateFrequency(data.updateFrequency)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load source')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, baseUrl, description, type, category, updateFrequency }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload?.error || 'Failed to update source')
      router.push('/dashboard/sources')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update source')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Edit News Source</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle>Source Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input id="baseUrl" type="url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" value={type} onChange={(e) => setType(e.target.value as SourceType)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="NEWS">News (RSS)</option>
                    <option value="BLOG">Blog</option>
                    <option value="SOCIAL">Social Media</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="updateFrequency">Frequency</Label>
                  <select id="updateFrequency" value={updateFrequency} onChange={(e) => setUpdateFrequency(e.target.value as UpdateFrequency)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MANUAL">Manually / No update</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="button" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

