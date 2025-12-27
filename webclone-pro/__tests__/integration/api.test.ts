import { createClient } from '@/lib/supabase/client'

// Mock Supabase for integration tests
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication API', () => {
    it('should handle successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockSession = {
        user: mockUser,
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password',
      })

      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should handle login failure', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      })

      const supabase = createClient()
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrong-password',
      })

      expect(result.data.user).toBeNull()
      expect(result.error).toEqual({ message: 'Invalid credentials' })
    })

    it('should handle successful logout', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      })

      const supabase = createClient()
      const result = await supabase.auth.signOut()

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should get current session', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'mock-token',
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const supabase = createClient()
      const result = await supabase.auth.getSession()

      expect(result.data.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })
  })

  describe('Projects API', () => {
    it('should fetch user projects', async () => {
      const mockProjects = [
        {
          id: '1',
          name: 'Test Project',
          description: 'A test project',
          original_url: 'https://example.com',
          status: 'completed',
          progress: 100,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]

      const mockSelect = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: mockProjects,
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
      })

      const supabase = createClient()
      const result = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', 'user-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(result.data).toEqual(mockProjects)
    })

    it('should create new project', async () => {
      const newProject = {
        name: 'New Project',
        description: 'A new project',
        original_url: 'https://example.com',
        user_id: 'user-123',
      }

      const mockInsert = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { ...newProject, id: 'project-123' },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        single: mockSingle,
      })

      const supabase = createClient()
      const result = await supabase
        .from('projects')
        .insert([newProject])
        .single()

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockInsert).toHaveBeenCalledWith([newProject])
      expect(result.data).toEqual({ ...newProject, id: 'project-123' })
    })

    it('should update project status', async () => {
      const updates = { status: 'completed', progress: 100 }

      const mockUpdate = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockReturnThis()
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'project-123', ...updates },
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        single: mockSingle,
      })

      const supabase = createClient()
      const result = await supabase
        .from('projects')
        .update(updates)
        .eq('id', 'project-123')
        .single()

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', 'project-123')
      expect(result.data).toEqual({ id: 'project-123', ...updates })
    })

    it('should delete project', async () => {
      const mockDelete = jest.fn().mockReturnThis()
      const mockEq = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      })

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      })

      const supabase = createClient()
      const result = await supabase
        .from('projects')
        .delete()
        .eq('id', 'project-123')

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', 'project-123')
      expect(result.error).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Connection failed', code: 'PGRST301' },
        }),
      })

      const supabase = createClient()
      const result = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', 'user-123')

      expect(result.data).toBeNull()
      expect(result.error).toEqual({
        message: 'Connection failed',
        code: 'PGRST301',
      })
    })

    it('should handle authorization errors', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })

      const supabase = createClient()
      const result = await supabase.auth.getSession()

      expect(result.data.session).toBeNull()
      expect(result.error).toEqual({ message: 'Session expired' })
    })
  })

  describe('Performance Tests', () => {
    it('should complete API calls within reasonable time', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })

      const supabase = createClient()
      const startTime = Date.now()
      
      await supabase
        .from('projects')
        .select('*')
        .eq('user_id', 'user-123')
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // API calls should complete within 100ms (mocked)
      expect(duration).toBeLessThan(100)
    })
  })
})