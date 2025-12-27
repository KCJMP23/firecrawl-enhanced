'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea, Label } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  MessageSquare,
  Bot,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Sparkles,
  Image,
  FileImage,
  Zap,
  Brain,
  BookOpen
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { DocumentViewer } from '@/components/pdf/DocumentViewer'

interface PDFDocument {
  id: string
  filename: string
  size: number
  uploadedAt: string
  processedAt?: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  metadata: {
    pageCount: number
    title?: string
    author?: string
  }
  processingResult?: {
    summary: string
    topics: string[]
    keyEntities: string[]
    chunks: any[]
    images: any[]
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<PDFDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<PDFDocument | null>(null)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [chatQuery, setChatQuery] = useState('')
  const [chatHistory, setChatHistory] = useState<any[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/pdf/upload')
      const data = await response.json()
      
      if (data.documents) {
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/pdf/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('PDF uploaded successfully! Processing...')
        loadDocuments()
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleQuery = async () => {
    if (!chatQuery.trim()) return
    
    setChatLoading(true)
    const userMessage = { role: 'user', content: chatQuery, timestamp: new Date() }
    setChatHistory(prev => [...prev, userMessage])
    
    try {
      const response = await fetch('/api/pdf/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: chatQuery,
          documentIds: selectedDocument ? [selectedDocument.id] : undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.result.answer,
          sources: data.result.sources,
          relevanceScore: data.result.relevanceScore,
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, aiMessage])
      } else {
        toast.error(data.error || 'Query failed')
      }
    } catch (error) {
      console.error('Query error:', error)
      toast.error('Query failed')
    } finally {
      setChatLoading(false)
      setChatQuery('')
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    
    try {
      const response = await fetch(`/api/pdf/${documentId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Document deleted successfully')
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null)
        }
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const openDocumentViewer = (document: PDFDocument) => {
    setSelectedDocument(document)
    setShowDocumentViewer(true)
  }

  const updateDocument = async (updates: any) => {
    if (!selectedDocument) return
    
    try {
      const response = await fetch(`/api/pdf/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const { document: updatedDoc } = await response.json()
        setDocuments(prev => prev.map(doc => 
          doc.id === updatedDoc.id ? updatedDoc : doc
        ))
        setSelectedDocument(updatedDoc)
        toast.success('Document updated successfully')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update document')
    }
  }

  const getStatusIcon = (status: PDFDocument['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: PDFDocument['status']) => {
    const variants = {
      completed: 'bg-green-600',
      processing: 'bg-blue-600',
      failed: 'bg-red-600',
      uploading: 'bg-gray-600'
    }
    
    return (
      <Badge className={variants[status]}>
        {status}
      </Badge>
    )
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.metadata.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Document Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload PDFs and chat with your documents using AI
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{documents.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processed</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold">
                  {documents.filter(d => d.status === 'processing').length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pages</p>
                <p className="text-2xl font-bold">
                  {documents.reduce((acc, doc) => acc + doc.metadata.pageCount, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredDocuments.map(document => (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => openDocumentViewer(document)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(document.status)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {document.metadata.title || document.filename}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {Math.round(document.size / 1024)}KB • {document.metadata.pageCount} pages
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(document.status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {document.status === 'processing' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Processing...</span>
                              <span>75%</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                        )}
                        
                        {document.processingResult && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Brain className="w-4 h-4" />
                              <span>{document.processingResult.chunks.length} text chunks</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Image className="w-4 h-4" />
                              <span>{document.processingResult.images.length} images</span>
                            </div>
                            {document.processingResult.topics.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {document.processingResult.topics.slice(0, 3).map(topic => (
                                  <Badge key={topic} variant="secondary" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openDocumentViewer(document)
                                    }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteDocument(document.id)
                                    }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Document Selector */}
            <Card>
              <CardHeader>
                <CardTitle>Select Documents</CardTitle>
                <CardDescription>
                  Choose which documents to query
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={!selectedDocument ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    All Documents
                  </Button>
                  {documents.filter(d => d.status === 'completed').map(doc => (
                    <Button
                      key={doc.id}
                      variant={selectedDocument?.id === doc.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {doc.metadata.title || doc.filename}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Interface */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Document Chat
                </CardTitle>
                <CardDescription>
                  Ask questions about your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Chat History */}
                <div className="h-96 overflow-y-auto space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start a conversation about your documents</p>
                    </div>
                  ) : (
                    chatHistory.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 border'
                        }`}>
                          <p>{message.content}</p>
                          {message.sources && (
                            <div className="mt-2 text-sm opacity-75">
                              <p className="font-medium">Sources:</p>
                              {message.sources.map((source: any, i: number) => (
                                <p key={i}>• Page {source.pageNumber}: {source.content}</p>
                              ))}
                            </div>
                          )}
                          <p className="text-xs opacity-50 mt-1">
                            {format(message.timestamp, 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 border p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleQuery()}
                    disabled={chatLoading}
                  />
                  <Button onClick={handleQuery} disabled={!chatQuery.trim() || chatLoading}>
                    <Zap className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Document Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Document Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Total Processing Time</span>
                    <span className="font-medium">12m 34s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Average Pages per Document</span>
                    <span className="font-medium">8.5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Images Extracted</span>
                    <span className="font-medium">127</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span>Text Chunks Generated</span>
                    <span className="font-medium">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Topics */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Topics</CardTitle>
                <CardDescription>Most common topics across your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Technology', 'Business Strategy', 'Finance', 'Marketing', 'Legal'].map((topic, index) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span>{topic}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(5 - index) * 20}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{5 - index}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setShowDocumentViewer(false)}
          onUpdate={updateDocument}
        />
      )}
    </div>
  )
}