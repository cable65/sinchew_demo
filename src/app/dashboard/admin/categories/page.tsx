
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
}

const DEFAULT_CATEGORIES = [
  'News', 'Opinion', 'Entertainment', 'Sports', 'Business', 
  'Technology', 'Lifestyle', 'Politics', 'World', 'Local'
]

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Form State
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load categories')
      setCategories(data.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }, [name])

  const createCategory = async () => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create category')
      
      setName('')
      setSlug('')
      setDescription('')
      fetchCategories()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create category')
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete category')
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete category')
    }
  }

  const seedDefaults = async () => {
    if (!confirm('This will create default categories if they don\'t exist. Continue?')) return
    setLoading(true)
    try {
      for (const catName of DEFAULT_CATEGORIES) {
        const catSlug = catName.toLowerCase()
        // Check if exists in local list (approximation)
        if (categories.some(c => c.slug === catSlug)) continue

        await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            name: catName, 
            slug: catSlug, 
            description: `Articles related to ${catName}` 
          })
        })
      }
      fetchCategories()
    } catch (e) {
      alert('Error seeding defaults')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Category Management</h1>
        <Button variant="outline" onClick={seedDefaults} disabled={loading}>
          Initialize Defaults
        </Button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Create Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Technology" />
            </div>
            <div>
              <label className="text-sm font-medium">Slug</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. technology" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
            <Button onClick={createCategory} className="w-full" disabled={!name || !slug}>
              Create Category
            </Button>
          </CardContent>
        </Card>

        {/* List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Name</th>
                      <th className="p-2">Slug</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No categories found.</td></tr>
                    ) : (
                      categories.map(c => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{c.name}</td>
                          <td className="p-2 text-muted-foreground">{c.slug}</td>
                          <td className="p-2 truncate max-w-[200px]">{c.description || '-'}</td>
                          <td className="p-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteCategory(c.id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
