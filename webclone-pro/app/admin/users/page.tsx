'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label, Textarea } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Ban,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Activity,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  name: string
  role: string
  plan: string
  status: string
  created_at: string
  last_seen: string
  projects_count: number
  api_calls: number
  storage_used: number
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, filterRole, filterPlan, filterStatus])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Mock data for demonstration
      const mockUsers: User[] = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          plan: 'pro',
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          projects_count: 12,
          api_calls: 45678,
          storage_used: 2.5
        },
        {
          id: '2',
          email: 'sarah@company.com',
          name: 'Sarah Johnson',
          role: 'user',
          plan: 'enterprise',
          status: 'active',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          projects_count: 45,
          api_calls: 234567,
          storage_used: 8.7
        },
        {
          id: '3',
          email: 'mike@startup.io',
          name: 'Mike Wilson',
          role: 'user',
          plan: 'starter',
          status: 'suspended',
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          last_seen: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          projects_count: 3,
          api_calls: 5678,
          storage_used: 0.5
        }
      ]

      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }

    // Plan filter
    if (filterPlan !== 'all') {
      filtered = filtered.filter(user => user.plan === filterPlan)
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus)
    }

    setFilteredUsers(filtered)
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'suspend':
          toast.success('User suspended successfully')
          break
        case 'activate':
          toast.success('User activated successfully')
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this user?')) {
            toast.success('User deleted successfully')
          }
          break
        case 'reset-password':
          toast.success('Password reset email sent')
          break
        case 'upgrade':
          toast.success('User plan upgraded')
          break
      }
      loadUsers()
    } catch (error) {
      console.error('Error performing user action:', error)
      toast.error('Failed to perform action')
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      toast.error('No users selected')
      return
    }

    try {
      switch (action) {
        case 'export':
          exportUsers()
          break
        case 'email':
          toast.success(`Email sent to ${selectedUsers.size} users`)
          break
        case 'suspend':
          toast.success(`${selectedUsers.size} users suspended`)
          break
        case 'delete':
          if (confirm(`Delete ${selectedUsers.size} users?`)) {
            toast.success(`${selectedUsers.size} users deleted`)
          }
          break
      }
      setSelectedUsers(new Set())
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  const exportUsers = () => {
    const csv = [
      ['Email', 'Name', 'Role', 'Plan', 'Status', 'Created', 'Projects', 'API Calls'],
      ...filteredUsers.map(user => [
        user.email,
        user.name,
        user.role,
        user.plan,
        user.status,
        format(new Date(user.created_at), 'yyyy-MM-dd'),
        user.projects_count,
        user.api_calls
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const selectAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage users, permissions, and subscriptions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadUsers()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-blue-600">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
              <Badge variant="secondary">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pro/Enterprise</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.plan === 'pro' || u.plan === 'enterprise').length}
                </p>
              </div>
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Suspended</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'suspended').length}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search users by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPlan} onValueChange={setFilterPlan}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('email')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkAction('suspend')}>
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onChange={selectAllUsers}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>API Calls</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.plan === 'enterprise' ? 'default' : 'secondary'}>
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.status === 'active' ? 'default' : 'destructive'}
                        className={user.status === 'active' ? 'bg-green-600' : ''}
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.projects_count}</TableCell>
                    <TableCell>{user.api_calls.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {format(new Date(user.last_seen), 'MMM dd, HH:mm')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDialog(true)
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserAction(user.id, 'edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                        >
                          {user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        {selectedUser && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="overview">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <p className="text-sm">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="text-sm capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <p className="text-sm capitalize">{selectedUser.plan}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge
                      variant={selectedUser.status === 'active' ? 'default' : 'destructive'}
                      className={selectedUser.status === 'active' ? 'bg-green-600' : ''}
                    >
                      {selectedUser.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Member Since</Label>
                    <p className="text-sm">
                      {format(new Date(selectedUser.created_at), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <Button onClick={() => handleUserAction(selectedUser.id, 'reset-password')}>
                    Reset Password
                  </Button>
                  <Button variant="outline" onClick={() => handleUserAction(selectedUser.id, 'upgrade')}>
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction(selectedUser.id, selectedUser.status === 'active' ? 'suspend' : 'activate')}
                  >
                    {selectedUser.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUserAction(selectedUser.id, 'delete')}
                  >
                    Delete User
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Projects Created</span>
                    <span className="font-medium">{selectedUser.projects_count}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">API Calls</span>
                    <span className="font-medium">{selectedUser.api_calls.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Storage Used</span>
                    <span className="font-medium">{selectedUser.storage_used} GB</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-sm">Last Active</span>
                    <span className="font-medium">
                      {format(new Date(selectedUser.last_seen), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="billing">
                <p className="text-sm text-gray-600">Billing information coming soon...</p>
              </TabsContent>

              <TabsContent value="security">
                <p className="text-sm text-gray-600">Security settings coming soon...</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}