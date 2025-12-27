'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share2,
  BookOpen,
  Tags,
  MessageSquare,
  Brain,
  Image as ImageIcon,
  MapPin,
  Clock,
  User,
  FileType,
  Hash
} from 'lucide-react'
import { format } from 'date-fns'

interface DocumentViewerProps {
  document: {
    id: string
    filename: string
    size: number
    uploadedAt: string
    processedAt?: string
    status: string
    metadata: {
      pageCount: number
      title?: string
      author?: string
      subject?: string
      creator?: string
      creationDate?: string
    }
    processingResult?: {
      summary: string
      topics: string[]
      keyEntities: string[]
      chunks: Array<{
        id: string
        content: string
        pageNumber: number
        type: string
      }>
      images: Array<{
        id: string
        pageNumber: number
        description: string
        altText: string
        filename: string
      }>
    }
    title?: string
    description?: string
    tags?: string[]
    notes?: string
  }
  onClose: () => void
  onUpdate: (updates: any) => void
}

export function DocumentViewer({ document, onClose, onUpdate }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPage, setSelectedPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: document.title || document.metadata.title || document.filename,
    description: document.description || '',
    tags: document.tags || [],
    notes: document.notes || ''
  })
  const [searchResults, setSearchResults] = useState<any[]>([])

  const handleSearch = () => {
    if (!searchQuery.trim() || !document.processingResult) return
    
    const results = document.processingResult.chunks
      .filter(chunk => 
        chunk.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(chunk => ({
        ...chunk,
        highlightedContent: chunk.content.replace(
          new RegExp(searchQuery, 'gi'),
          `<mark class="bg-yellow-200 dark:bg-yellow-800">$&</mark>`
        )
      }))
    
    setSearchResults(results)
  }

  const handleSave = async () => {
    try {
      await onUpdate(editForm)
      setIsEditing(false)
    } catch (error) {
      console.error('Save error:', error)
    }
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !editForm.tags.includes(tag.trim())) {
      setEditForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">
                {editForm.title}
              </h2>
              <p className="text-sm text-gray-500">
                {Math.round(document.size / 1024)}KB • {document.metadata.pageCount} pages
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={document.status === 'completed' ? 'default' : 'secondary'}
              className={document.status === 'completed' ? 'bg-green-600' : ''}
            >
              {document.status}
            </Badge>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="ghost" onClick={onClose}>
              ×
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r bg-gray-50 dark:bg-gray-800 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full m-4">
                <TabsTrigger value="overview" className="text-xs">Info</TabsTrigger>
                <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
                <TabsTrigger value="search" className="text-xs">Search</TabsTrigger>
                <TabsTrigger value="insights" className="text-xs">AI</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4 space-y-4">
                {/* Document Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileType className="w-4 h-4" />
                      Document Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600">Title</label>
                      {isEditing ? (
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm font-medium">{editForm.title}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600">Description</label>
                      {isEditing ? (
                        <Textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm">{editForm.description || 'No description'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-600">Tags</label>
                      <div className="mt-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              {editForm.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="ml-1 text-gray-500 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <Input
                              placeholder="Add tag..."
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  addTag((e.target as HTMLInputElement).value)
                                  ;(e.target as HTMLInputElement).value = ''
                                }
                              }}
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {editForm.tags.length > 0 ? (
                              editForm.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-xs text-gray-500">No tags</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isEditing ? (
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" onClick={handleSave}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Metadata */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {document.metadata.author && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Author:</span>
                        <span>{document.metadata.author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Uploaded:</span>
                      <span>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {document.processedAt && (
                      <div className="flex items-center gap-2 text-xs">
                        <Brain className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Processed:</span>
                        <span>{format(new Date(document.processedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add your notes..."
                        rows={4}
                        className="text-xs"
                      />
                    ) : (
                      <p className="text-sm">{editForm.notes || 'No notes'}</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Content Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {document.processingResult ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Text Chunks</span>
                          <span className="font-medium">{document.processingResult.chunks.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Images</span>
                          <span className="font-medium">{document.processingResult.images.length}</span>
                        </div>
                        
                        <Separator />
                        
                        {/* Page navigation */}
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-600">Pages</p>
                          <div className="grid grid-cols-4 gap-1">
                            {Array.from({ length: document.metadata.pageCount }, (_, i) => (
                              <Button
                                key={i + 1}
                                size="sm"
                                variant={selectedPage === i + 1 ? 'default' : 'outline'}
                                onClick={() => setSelectedPage(i + 1)}
                                className="text-xs h-8"
                              >
                                {i + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Document not yet processed</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="search" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Search Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search in document..."
                        className="text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button size="sm" onClick={handleSearch}>
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-60">
                      <div className="space-y-2">
                        {searchResults.map((result, index) => (
                          <Card key={index} className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                onClick={() => setSelectedPage(result.pageNumber)}>
                            <p className="text-xs text-gray-600 mb-1">Page {result.pageNumber}</p>
                            <div 
                              className="text-xs"
                              dangerouslySetInnerHTML={{ __html: result.highlightedContent.substring(0, 150) + '...' }}
                            />
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="p-4 space-y-4">
                {document.processingResult && (
                  <>
                    {/* Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">AI Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{document.processingResult.summary}</p>
                      </CardContent>
                    </Card>

                    {/* Topics */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Key Topics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {document.processingResult.topics.map(topic => (
                            <Badge key={topic} variant="secondary" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Entities */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Key Entities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1">
                          {document.processingResult.keyEntities.slice(0, 10).map(entity => (
                            <p key={entity} className="text-xs flex items-center gap-2">
                              <Hash className="w-3 h-3 text-gray-400" />
                              {entity}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Images */}
                    {document.processingResult.images.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Extracted Images</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {document.processingResult.images.slice(0, 5).map(image => (
                              <div key={image.id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                <ImageIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium">Page {image.pageNumber}</p>
                                  <p className="text-xs text-gray-600 truncate">{image.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Document Viewer Controls */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">Page {selectedPage} of {document.metadata.pageCount}</span>
                <Button size="sm" variant="outline">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm">{zoom}%</span>
                <Button size="sm" variant="outline">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 p-4 bg-gray-100 dark:bg-gray-800 overflow-auto">
              <div className="max-w-4xl mx-auto">
                {/* PDF Preview Placeholder */}
                <Card className="h-[800px] flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">PDF Preview</p>
                    <p className="text-sm text-gray-500 mt-1">Page {selectedPage}</p>
                    {document.status === 'processing' && (
                      <p className="text-sm text-blue-600 mt-2">Processing document...</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}