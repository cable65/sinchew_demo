'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  // Profile State
  const [profile, setProfile] = useState({ name: '', email: '', role: '' })
  
  // Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  
  // Organization & System State (Tenant)
  const [tenant, setTenant] = useState<{
    name: string;
    brandingConfig: { logoUrl?: string; enableBranding?: boolean; platformName?: string };
    systemConfig: { defaultAiModel?: string; autoPublish?: boolean };
  }>({ 
    name: '', 
    brandingConfig: { logoUrl: '', enableBranding: false, platformName: '' },
    systemConfig: { defaultAiModel: 'gpt-4o', autoPublish: false }
  })

  // Fetch Data
  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (profile.role === 'ADMIN' && (activeTab === 'organization' || activeTab === 'system')) {
      fetchTenantSettings()
    }
  }, [activeTab, profile.role])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile({ name: data.name || '', email: data.email, role: data.role })
      }
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  }

  const fetchTenantSettings = async () => {
    try {
      const res = await fetch('/api/tenant/settings')
      if (res.ok) {
        const data = await res.json()
        setTenant({
          name: data.name || '',
          brandingConfig: (data.brandingConfig as any) || { logoUrl: '', enableBranding: false, platformName: '' },
          systemConfig: (data.systemConfig as any) || { defaultAiModel: 'gpt-4o', autoPublish: false }
        })
      }
    } catch (error) {
      console.error('Failed to fetch tenant settings', error)
    }
  }

  // Handlers
  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name })
      })
      if (res.ok) alert('Profile updated successfully!')
      else alert('Failed to update profile')
    } catch (e) {
      alert('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match')
      return
    }
    if (!passwords.current) {
        alert('Please enter current password')
        return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          currentPassword: passwords.current, 
          newPassword: passwords.new 
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert('Password changed successfully!')
        setPasswords({ current: '', new: '', confirm: '' })
      } else {
        alert(data.error || 'Failed to change password')
      }
    } catch (e) {
      alert('Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTenant = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tenant.name,
          brandingConfig: tenant.brandingConfig,
          systemConfig: tenant.systemConfig
        })
      })
      
      if (res.ok) {
          alert('Settings updated successfully!')
          fetchTenantSettings() // Refresh
      } else {
          const data = await res.json()
          alert(data.error || 'Failed to update settings')
      }
    } catch (e) {
      alert('Error updating settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {profile.role === 'ADMIN' && (
            <>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </>
          )}
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal details and public profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={profile.name} 
                  onChange={(e) => setProfile({...profile, name: e.target.value})} 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} disabled />
                <p className="text-[0.8rem] text-muted-foreground">
                  Email address cannot be changed. Contact admin for assistance.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Change your password to keep your account secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  type="password" 
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={passwords.new}
                  onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {profile.role === 'ADMIN' && (
          <>
            <TabsContent value="organization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Manage your organization's branding and basic info.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input 
                      id="org-name" 
                      value={tenant.name}
                      onChange={(e) => setTenant({...tenant, name: e.target.value})}
                      placeholder="Acme Inc." 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input 
                      id="platform-name" 
                      value={tenant.brandingConfig.platformName || ''}
                      onChange={(e) => setTenant({
                        ...tenant, 
                        brandingConfig: { ...tenant.brandingConfig, platformName: e.target.value }
                      })}
                      placeholder="My News Platform" 
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                      This name will be displayed in the footer.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-logo">Logo URL</Label>
                    <Input  
                      id="org-logo" 
                      value={tenant.brandingConfig.logoUrl || ''}
                      onChange={(e) => setTenant({
                        ...tenant, 
                        brandingConfig: { ...tenant.brandingConfig, logoUrl: e.target.value }
                      })}
                      placeholder="https://example.com/logo.png" 
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="branding-enabled" 
                      checked={tenant.brandingConfig.enableBranding || false}
                      onCheckedChange={(checked) => setTenant({
                        ...tenant,
                        brandingConfig: { ...tenant.brandingConfig, enableBranding: checked }
                      })}
                    />
                    <Label htmlFor="branding-enabled">Enable Custom Branding</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveTenant} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Configuration</CardTitle>
                  <CardDescription>
                    Configure global system behaviors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">Default AI Model</Label>
                    <Input 
                      id="ai-model" 
                      value={tenant.systemConfig.defaultAiModel || 'gpt-4o'} 
                      disabled 
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                      Contact support to upgrade your AI model tier.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto-publish" 
                      checked={tenant.systemConfig.autoPublish || false}
                      onCheckedChange={(checked) => setTenant({
                        ...tenant,
                        systemConfig: { ...tenant.systemConfig, autoPublish: checked }
                      })}
                    />
                    <Label htmlFor="auto-publish">Auto-Publish Trusted Sources</Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveTenant} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
