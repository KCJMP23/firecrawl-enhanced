'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Users,
  UserPlus,
  Mail,
  Shield,
  Check,
  X,
  MoreVertical,
  Crown,
  User,
  Clock,
  Settings,
  Trash2,
  Send,
  Copy,
  ExternalLink,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { SimpleButton, SimpleCard } from '@/components/ui'

interface TeamMember {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Date
  lastActive: Date
  avatar?: string
  permissions: {
    canEdit: boolean
    canDeploy: boolean
    canInvite: boolean
    canDelete: boolean
  }
}

interface Team {
  id: string
  name: string
  description: string
  createdAt: Date
  memberCount: number
  projectCount: number
  storageUsed: number
  plan: 'free' | 'pro' | 'enterprise'
}



function SimpleBadge({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'danger' }) {
  const variantClasses = 
    variant === 'success' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
    variant === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
    variant === 'danger' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
    'bg-blue-500/20 text-blue-400 border-blue-500/30'
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${variantClasses}`}>
      {children}
    </span>
  )
}

function InviteMemberDialog({ isOpen, onClose, onInvite }: {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: string) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInvite(email, role)
    setEmail('')
    setRole('member')
    setMessage('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Invite Team Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="colleague@company.com"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Role & Permissions
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="viewer">Viewer - Can view projects</option>
              <option value="member">Member - Can edit projects</option>
              <option value="admin">Admin - Can manage team</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Personal Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hey! Join our team to collaborate on amazing projects..."
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <SimpleButton type="button" variant="outline" onClick={onClose}>
              Cancel
            </SimpleButton>
            <SimpleButton type="submit">
              <Send className="w-4 h-4 mr-2" />
              Send Invitation
            </SimpleButton>
          </div>
        </form>
      </div>
    </div>
  )
}

function MemberCard({ member, onRoleChange, onRemove, isOwner }: {
  member: TeamMember
  onRoleChange: (memberId: string, newRole: string) => void
  onRemove: (memberId: string) => void
  isOwner: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)

  const roleIcons = {
    owner: <Crown className="w-4 h-4" />,
    admin: <Shield className="w-4 h-4" />,
    member: <User className="w-4 h-4" />,
    viewer: <User className="w-4 h-4" />
  }

  const roleColors = {
    owner: 'text-yellow-400',
    admin: 'text-purple-400',
    member: 'text-blue-400',
    viewer: 'text-gray-400'
  }

  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
          {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-white">{member.name || member.email}</span>
            {member.status === 'pending' && (
              <SimpleBadge variant="warning">Pending</SimpleBadge>
            )}
          </div>
          <div className="flex items-center space-x-3 text-sm text-white/60">
            <span>{member.email}</span>
            <span>•</span>
            <div className={`flex items-center space-x-1 ${roleColors[member.role]}`}>
              {roleIcons[member.role]}
              <span className="capitalize">{member.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="text-right mr-4">
          <div className="text-xs text-white/40">Last active</div>
          <div className="text-sm text-white/60">
            {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : 'Never'}
          </div>
        </div>
        
        {isOwner && member.role !== 'owner' && (
          <div className="relative">
            <SimpleButton
              variant="ghost"
              size="icon"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </SimpleButton>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onRoleChange(member.id, 'admin')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => {
                    onRoleChange(member.id, 'member')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Make Member
                </button>
                <button
                  onClick={() => {
                    onRoleChange(member.id, 'viewer')
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10"
                >
                  Make Viewer
                </button>
                <hr className="border-white/10 my-1" />
                <button
                  onClick={() => {
                    onRemove(member.id)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  Remove from Team
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TeamsPage() {
  const [loading, setLoading] = useState(true)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [team, setTeam] = useState<Team>({
    id: '1',
    name: 'My Team',
    description: 'Collaborative web cloning workspace',
    createdAt: new Date(),
    memberCount: 5,
    projectCount: 23,
    storageUsed: 8.4,
    plan: 'pro'
  })
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      email: 'owner@company.com',
      name: 'John Owner',
      role: 'owner',
      status: 'active',
      joinedAt: new Date('2024-01-01'),
      lastActive: new Date(),
      permissions: { canEdit: true, canDeploy: true, canInvite: true, canDelete: true }
    },
    {
      id: '2',
      email: 'admin@company.com',
      name: 'Sarah Admin',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      lastActive: new Date(),
      permissions: { canEdit: true, canDeploy: true, canInvite: true, canDelete: false }
    },
    {
      id: '3',
      email: 'developer@company.com',
      name: 'Mike Developer',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-02-01'),
      lastActive: new Date(),
      permissions: { canEdit: true, canDeploy: false, canInvite: false, canDelete: false }
    },
    {
      id: '4',
      email: 'designer@company.com',
      name: 'Lisa Designer',
      role: 'member',
      status: 'active',
      joinedAt: new Date('2024-02-15'),
      lastActive: new Date('2024-12-20'),
      permissions: { canEdit: true, canDeploy: false, canInvite: false, canDelete: false }
    },
    {
      id: '5',
      email: 'viewer@company.com',
      name: 'Tom Viewer',
      role: 'viewer',
      status: 'pending',
      joinedAt: new Date('2024-12-24'),
      lastActive: new Date(),
      permissions: { canEdit: false, canDeploy: false, canInvite: false, canDelete: false }
    }
  ])

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth')
        return
      }
      
      setCurrentUser(session.user)
      // Load team and members from database
      // For now using mock data
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading team data:', error)
      setLoading(false)
    }
  }

  const handleInviteMember = (email: string, role: string) => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      email,
      name: '',
      role: role as any,
      status: 'pending',
      joinedAt: new Date(),
      lastActive: new Date(),
      permissions: {
        canEdit: role !== 'viewer',
        canDeploy: role === 'admin',
        canInvite: role === 'admin',
        canDelete: false
      }
    }
    setMembers([...members, newMember])
    setTeam(prev => ({ ...prev, memberCount: prev.memberCount + 1 }))
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
    setMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole as any } : m
    ))
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(prev => prev.filter(m => m.id !== memberId))
    setTeam(prev => ({ ...prev, memberCount: prev.memberCount - 1 }))
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const isOwner = members.find(m => m.email === currentUser?.email)?.role === 'owner'

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading team...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <SimpleButton onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </SimpleButton>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Team Overview */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
          <p className="text-white/60">{team.description}</p>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <SimpleCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{team.memberCount}</div>
                <div className="text-white/60 text-sm">Team Members</div>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{team.projectCount}</div>
                <div className="text-white/60 text-sm">Projects</div>
              </div>
              <ExternalLink className="w-8 h-8 text-purple-400" />
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">{team.storageUsed}GB</div>
                <div className="text-white/60 text-sm">Storage Used</div>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </SimpleCard>
          
          <SimpleCard>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white capitalize">{team.plan}</div>
                <div className="text-white/60 text-sm">Current Plan</div>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </SimpleCard>
        </div>

        {/* Members Section */}
        <SimpleCard>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Team Members</h2>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 bg-white/5 border border-white/20 rounded-md text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admins</option>
                <option value="member">Members</option>
                <option value="viewer">Viewers</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            {filteredMembers.length > 0 ? (
              filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                  isOwner={isOwner}
                />
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                No team members found
              </div>
            )}
          </div>
        </SimpleCard>

        {/* Pending Invitations */}
        {members.filter(m => m.status === 'pending').length > 0 && (
          <SimpleCard className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pending Invitations</h3>
            <div className="space-y-3">
              {members.filter(m => m.status === 'pending').map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white">{member.email}</div>
                      <div className="text-xs text-white/60">Invited {new Date(member.joinedAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <SimpleButton size="sm" variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </SimpleButton>
                    <SimpleButton size="sm" variant="ghost">
                      Resend
                    </SimpleButton>
                  </div>
                </div>
              ))}
            </div>
          </SimpleCard>
        )}
      </div>

      {/* Invite Dialog */}
      <InviteMemberDialog
        isOpen={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        onInvite={handleInviteMember}
      />
    </div>
  )
}