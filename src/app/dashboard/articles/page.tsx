'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  link: string
  description?: string
  content?: string
  imageUrl?: string | null
  publishedAt?: string | null
  source: { id: string; name: string }
  status?: string
  author?: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState('')

  const fetchArticles = async (pageNum = 1, query = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: '20' })
      if (query) params.set('q', query)
      const res = await fetch(`/api/articles?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch articles')
      const data = await res.json()
      setArticles(data.data)
      setTotalPages(data.meta.totalPages)
      setPage(data.meta.page)
    } catch (err) {
      setError('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchArticles(1, q)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Articles</h1>
        <div className="flex gap-2">
          <form onSubmit={submitSearch} className="flex gap-2">
            <Input placeholder="Search articles" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button type="submit" variant="outline">Search</Button>
          </form>
          <Button asChild>
            <Link href="/dashboard/articles/create">Create Article</Link>
          </Button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && articles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No articles found. Try syncing a source or adjusting your search.
          </CardContent>
        </Card>
      )}

      {!loading && articles.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="max-w-[400px]">
                    <div className="font-medium line-clamp-2" title={a.title}>
                      {a.title}
                    </div>
                    {a.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1" title={a.description}>
                        {a.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{a.source?.name}</TableCell>
                  <TableCell>{a.author || '-'}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      a.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      a.status === 'ARCHIVED' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                      'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                    }`}>
                      {a.status || 'PUBLISHED'}
                    </span>
                  </TableCell>
                  <TableCell>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Unpublished'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/articles/${a.id}`}>Edit</Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="ml-2">
                      <a href={a.link} target="_blank" rel="noreferrer">Original</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" size="sm" onClick={() => fetchArticles(Math.max(1, page - 1), q)} disabled={page <= 1}>Prev</Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => fetchArticles(Math.min(totalPages, page + 1), q)} disabled={page >= totalPages}>Next</Button>
      </div>
    </div>
  )
}

