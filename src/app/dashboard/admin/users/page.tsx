'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type User = { id: string; email: string; name?: string | null; role: 'ADMIN' | 'EDITOR' | 'VIEWER' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load users')
      setUsers(data.data || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const createUser = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || undefined, password, role })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create user')
      setEmail(''); setName(''); setPassword(''); setRole('VIEWER')
      fetchUsers()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create user')
    }
  }

  const updateRole = async (id: string, newRole: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update role')
      setUsers((prev) => prev.map(u => u.id === id ? { ...u, role: newRole } : u))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update role')
    }
  }

  const removeUser = async (id: string) => {
    if (!confirm('Delete this user?')) return
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to delete user')
      setUsers((prev) => prev.filter(u => u.id !== id))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete user')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} className="mt-1 w-full rounded border p-2">
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <Button onClick={createUser}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Email</th>
                  <th className="p-2">Name</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b">
                    <td className="p-2">{u.email}</td>
                    <td className="p-2">{u.name || '-'}</td>
                    <td className="p-2">
                      <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value as any)} className="rounded border p-1">
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <Button variant="outline" onClick={() => removeUser(u.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
