'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RichTextEditor } from '@/components/editor/rich-text-editor'

interface NewsSource {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
}

export default function CreateArticlePage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sourceId, setSourceId] = useState('')
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [author, setAuthor] = useState('')
  const [tagsCsv, setTagsCsv] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT')
  const [editorialLock, setEditorialLock] = useState(false)
  const [slug, setSlug] = useState('')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    (async () => {
      try {
        const [srcRes, catRes] = await Promise.all([
          fetch('/api/sources'),
          fetch('/api/categories')
        ])
        const srcData = await srcRes.json()
        const catData = await catRes.json()
        
        if (srcData.data) {
          setSources(srcData.data)
          if (srcData.data.length > 0) setSourceId(srcData.data[0].id)
        }
        if (catData.data) {
          setCategories(catData.data)
          if (catData.data.length > 0) setCategoryId(catData.data[0].id)
        }
      } catch (err) {
        console.error('Failed to fetch data', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const save = async () => {
    // Only validate required fields if not a draft
    if (status !== 'DRAFT') {
      if (!sourceId || !title || !link) {
        setError('Source, Title, and Link are required for published articles')
        return
      }
    } else {
      // For drafts, we still need a sourceId for the database relation
      if (!sourceId) {
        setError('Please select a Source (required even for drafts)')
        return
      }
    }

    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId,
          title,
          link,
          description,
          content,
          imageUrl: imageUrl || null,
          categoryId: categoryId || null,
          author,
          tags: (seoKeywords || tagsCsv).split(',').map(t => t.trim()).filter(Boolean),
          status,
          editorialLock,
          slug,
          seoTitle,
          seoDescription,
          seoKeywords: (tagsCsv || seoKeywords),
          canonicalUrl,
          ogTitle,
          ogDescription,
          ogImageUrl,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to create article')
      router.push('/dashboard/articles')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Article</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Article Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <label className="text-sm font-medium">Source <span className="text-red-500">*</span></label>
              <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="mt-1 w-full rounded border p-2">
                <option value="">Select a source</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Title {status !== 'DRAFT' && <span className="text-red-500">*</span>}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={status === 'DRAFT' ? 'Optional for Drafts' : ''} />
            </div>
             <div>
              <label className="text-sm font-medium">Link (Original URL) {status !== 'DRAFT' && <span className="text-red-500">*</span>}</label>
              <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder={status === 'DRAFT' ? 'Optional for Drafts' : ''} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border p-2" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <div className="mt-1">
                <RichTextEditor value={content} onChange={setContent} placeholder={status === 'DRAFT' ? 'Optional for Drafts' : 'Main article body'} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <div className="flex items-center gap-2">
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append('file', file)
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: fd })
                      const data = await res.json()
                      if (data.url) setImageUrl(data.url)
                    } catch {}
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recommended 1200×630 JPG/PNG, under 2MB.</p>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="mt-1 w-full rounded border p-2">
                <option value="">Select a category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags / SEO Keywords (comma separated)</label>
              <Input value={tagsCsv} onChange={(e) => { setTagsCsv(e.target.value); setSeoKeywords(e.target.value) }} />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="mt-1 w-full rounded border p-2">
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input id="lock" type="checkbox" checked={editorialLock} onChange={(e) => setEditorialLock(e.target.checked)} />
              <label htmlFor="lock" className="text-sm">Editorial Lock</label>
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">SEO Title</label>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">SEO Description</label>
              <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="mt-1 w-full rounded border p-2" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">SEO Keywords (comma separated)</label>
              <Input value={seoKeywords} onChange={(e) => { setSeoKeywords(e.target.value); setTagsCsv(e.target.value) }} />
            </div>
            <div>
              <label className="text-sm font-medium">Canonical URL</label>
              <Input value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">OG Title</label>
              <Input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">OG Description</label>
              <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} className="mt-1 w-full rounded border p-2" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">OG Image URL</label>
              <div className="flex items-center gap-2">
                <Input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append('file', file)
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: fd })
                      const data = await res.json()
                      if (data.url) setOgImageUrl(data.url)
                    } catch {}
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recommended 1200×630 JPG/PNG, under 2MB.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving}>Create Article</Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/articles')}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
