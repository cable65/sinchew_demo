'use client'

import { useEffect, useState, use } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Article {
  id: string
  title: string
  link: string
  description?: string | null
  content?: string | null
  imageUrl?: string | null
  author?: string | null
  tags?: string[]
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  editorialLock?: boolean
  slug?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  canonicalUrl?: string | null
  ogTitle?: string | null
  ogDescription?: string | null
  ogImageUrl?: string | null
}

export default function EditArticlePage() {
  const params = useParams()
  const id = params?.id as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [author, setAuthor] = useState('')
  const [tagsCsv, setTagsCsv] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED')
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
  const [saveProgress, setSaveProgress] = useState(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [grammarResult, setGrammarResult] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    (async () => {
      try {
        const res = await fetch(`/api/articles/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Failed to load article')
        setArticle(data.data)
        setTitle(data.data.title || '')
        setDescription(data.data.description || '')
        setContent(data.data.content || '')
        setImageUrl(data.data.imageUrl || '')
        setAuthor(data.data.author || '')
        setTagsCsv((data.data.tags || []).join(','))
        setStatus((data.data.status as any) || 'PUBLISHED')
        setEditorialLock(Boolean(data.data.editorialLock))
        setSlug(data.data.slug || '')
        setSeoTitle(data.data.seoTitle || '')
        setSeoDescription(data.data.seoDescription || '')
        setSeoKeywords(data.data.seoKeywords || '')
        setCanonicalUrl(data.data.canonicalUrl || '')
        setOgTitle(data.data.ogTitle || '')
        setOgDescription(data.data.ogDescription || '')
        setOgImageUrl(data.data.ogImageUrl || '')
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load article')
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  function slugify(s: string) {
    return s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 120)
  }

  useEffect(() => {
    if (!slug) {
      setSlug(slugify(title))
    }
  }, [title])

  const generateSeo = async () => {
    if (!title && !content) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to generate SEO')
      
      if (data.data) {
        setSeoTitle(data.data.seoTitle || '')
        setSeoDescription(data.data.seoDescription || '')
        setSeoKeywords(data.data.seoKeywords || '')
        // Also pre-fill OG tags if empty
        if (!ogTitle) setOgTitle(data.data.seoTitle || '')
        if (!ogDescription) setOgDescription(data.data.seoDescription || '')
      }
    } catch (err) {
      console.error(err)
      alert('Failed to generate SEO suggestions')
    } finally {
      setAiLoading(false)
    }
  }

  const checkGrammar = async () => {
    if (!content) return
    setAiLoading(true)
    setGrammarResult(null)
    try {
      const res = await fetch('/api/ai/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to check grammar')
      setGrammarResult(data.data)
    } catch (err) {
      console.error(err)
      alert('Failed to check grammar')
    } finally {
      setAiLoading(false)
    }
  }

  const save = async () => {
    if (!article) return
    setSaving(true)
    setSaveSuccess(false)
    setSaveProgress(0)
    setError('')
    try {
      const computedSlug = slug.trim() ? slug : slugify(title)
      const timer = setInterval(() => {
        setSaveProgress((p) => (p < 95 ? p + 5 : p))
      }, 150)
      const res = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          content,
          imageUrl: imageUrl || null,
          author,
          tags: tagsCsv.split(',').map(t => t.trim()).filter(Boolean),
          status,
          editorialLock,
          slug: computedSlug || undefined,
          seoTitle,
          seoDescription,
          seoKeywords,
          canonicalUrl,
          ogTitle,
          ogDescription,
          ogImageUrl,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to save article')
      setSaveProgress(100)
      setSaveSuccess(true)
      clearInterval(timer)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save article')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Article</h1>

      {loading && <p>Loading...</p>}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 z-50 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 shadow">Saved successfully</div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {article && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{article.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border p-2" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <div className="flex justify-between mb-1">
                 <span className="text-xs text-muted-foreground">Main article body</span>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={checkGrammar} 
                   disabled={aiLoading || !content}
                   className="h-6 text-xs"
                 >
                   {aiLoading ? 'Checking...' : 'Check Grammar (AI)'}
                 </Button>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-1 w-full rounded border p-2" rows={8} />
              
              {grammarResult && (
                <div className="mt-4 rounded-md border bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Grammar Check Results</h3>
                    <Button variant="ghost" size="sm" onClick={() => setGrammarResult(null)} className="h-6 text-xs">Close</Button>
                  </div>
                  <p className="mb-2 text-muted-foreground">{grammarResult.summary}</p>
                  {grammarResult.issues && grammarResult.issues.length > 0 ? (
                    <div className="space-y-2">
                      {grammarResult.issues.map((issue: any, idx: number) => (
                        <div key={idx} className="rounded border bg-white p-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${issue.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {issue.severity}
                            </span>
                            <span className="font-mono text-red-500 line-through">{issue.original}</span>
                            <span>→</span>
                            <span className="font-mono text-green-600 font-medium">{issue.suggestion}</span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{issue.reason}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-600 font-medium">No issues found!</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Image URL</label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input value={tagsCsv} onChange={(e) => setTagsCsv(e.target.value)} />
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">SEO Title</label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateSeo} 
                  disabled={aiLoading || (!title && !content)}
                  className="h-6 text-xs"
                >
                  {aiLoading ? 'Generating...' : 'Auto-Generate SEO (AI)'}
                </Button>
              </div>
              <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">SEO Description</label>
              <textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="mt-1 w-full rounded border p-2" rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">SEO Keywords (comma separated)</label>
              <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} />
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
              <Input value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>{saving ? `Saving… ${saveProgress}%` : 'Save'}</Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/articles')}>Cancel</Button>
              </div>
              {saving && (
                <div className="h-2 w-full rounded bg-gray-200">
                  <div className="h-2 rounded bg-blue-600" style={{ width: `${saveProgress}%` }} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

