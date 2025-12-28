import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'
import { AICostOptimizer } from './ai-cost-optimizer'

// Types for PDF processing
export interface PDFDocument {
  id: string
  filename: string
  size: number
  userId: string
  uploadedAt: string
  processedAt?: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  metadata: {
    pageCount: number
    title?: string
    author?: string
    subject?: string
    keywords?: string
    creator?: string
    producer?: string
    creationDate?: string
    modificationDate?: string
  }
  processingResult?: ProcessingResult
}

export interface ProcessingResult {
  chunks: DocumentChunk[]
  images: ExtractedImage[]
  summary: string
  topics: string[]
  keyEntities: string[]
  embeddings: number[][]
}

export interface DocumentChunk {
  id: string
  content: string
  pageNumber: number
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  type: 'text' | 'table' | 'header' | 'footer'
  embedding?: number[]
  metadata: {
    fontSize?: number
    fontFamily?: string
    isBold?: boolean
    isItalic?: boolean
  }
}

export interface ExtractedImage {
  id: string
  pageNumber: number
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  base64Data: string
  description?: string
  alt?: string
  filename: string
  size: number
}

export interface QueryResult {
  chunks: DocumentChunk[]
  relevanceScore: number
  answer: string
  sources: {
    pageNumber: number
    content: string
    relevance: number
  }[]
}

export class PDFProcessor {
  private openai: OpenAI
  private supabase: ReturnType<typeof createClient>
  private costOptimizer?: AICostOptimizer

  constructor(costOptimizer?: AICostOptimizer) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    )
    
    this.costOptimizer = costOptimizer
  }

  /**
   * Process uploaded PDF file
   */
  async processPDF(file: File, userId: string): Promise<PDFDocument> {
    const documentId = uuidv4()
    
    try {
      // Create initial document record
      const document: PDFDocument = {
        id: documentId,
        filename: file.name,
        size: file.size,
        userId,
        uploadedAt: new Date().toISOString(),
        status: 'uploading',
        metadata: {
          pageCount: 0
        }
      }

      await this.saveDocument(document)

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('documents')
        .upload(`${userId}/${documentId}/${file.name}`, file)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Update status to processing
      await this.updateDocumentStatus(documentId, 'processing')

      // Extract PDF content
      const arrayBuffer = await file.arrayBuffer()
      const processingResult = await this.extractPDFContent(arrayBuffer)

      // Generate embeddings
      const chunksWithEmbeddings = await this.generateEmbeddings(processingResult.chunks)
      processingResult.chunks = chunksWithEmbeddings

      // Generate document summary and analysis
      const analysis = await this.analyzeDocument(processingResult.chunks)
      processingResult.summary = analysis.summary
      processingResult.topics = analysis.topics
      processingResult.keyEntities = analysis.keyEntities

      // Process and describe images
      const processedImages = await this.processImages(processingResult.images)
      processingResult.images = processedImages

      // Update document with results
      const updatedDocument = {
        ...document,
        status: 'completed' as const,
        processedAt: new Date().toISOString(),
        processingResult
      }

      await this.saveDocument(updatedDocument)
      return updatedDocument

    } catch (error) {
      console.error('PDF processing error:', error)
      await this.updateDocumentStatus(documentId, 'failed')
      throw error
    }
  }

  /**
   * Extract content from PDF using pdf2pic and pdfjs-dist
   */
  private async extractPDFContent(arrayBuffer: ArrayBuffer): Promise<ProcessingResult> {
    // This would use libraries like pdf2pic for images and pdf-parse for text
    // For now, we'll simulate the extraction process
    
    const mockResult: ProcessingResult = {
      chunks: [
        {
          id: uuidv4(),
          content: "Sample extracted text from PDF document. This represents the actual text content that would be extracted from the PDF file.",
          pageNumber: 1,
          position: { x: 50, y: 100, width: 500, height: 50 },
          type: 'text',
          metadata: {
            fontSize: 12,
            fontFamily: 'Arial',
            isBold: false,
            isItalic: false
          }
        }
      ],
      images: [
        {
          id: uuidv4(),
          pageNumber: 1,
          position: { x: 100, y: 200, width: 300, height: 200 },
          base64Data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...', // Mock base64
          filename: 'extracted_image_1.jpg',
          size: 15432
        }
      ],
      summary: '',
      topics: [],
      keyEntities: [],
      embeddings: []
    }

    return mockResult
  }

  /**
   * Generate embeddings for text chunks
   */
  private async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    let totalTokens = 0
    let totalCost = 0
    
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          const model = this.costOptimizer?.selectOptimalModel('embeddings', 'simple') || 'text-embedding-3-small'
          const response = await this.openai.embeddings.create({
            model,
            input: chunk.content,
            encoding_format: 'float'
          })
          
          // Track usage if cost optimizer is available
          if (this.costOptimizer && response.usage) {
            const cost = this.costOptimizer.calculateRequestCost(model, response.usage.total_tokens, 0, false)
            totalTokens += response.usage.total_tokens
            totalCost += cost
          }

          return {
            ...chunk,
            embedding: response.data[0]?.embedding || []
          }
        } catch (error) {
          console.error('Embedding generation error:', error)
          return chunk
        }
      })
    )

    return chunksWithEmbeddings
  }

  /**
   * Analyze document content using AI
   */
  private async analyzeDocument(chunks: DocumentChunk[]) {
    const fullText = chunks.map(chunk => chunk.content).join('\n\n')
    
    const prompt = `
Analyze the following document content and provide:
1. A comprehensive summary (2-3 paragraphs)
2. Key topics (up to 10 main topics)
3. Key entities (people, organizations, concepts - up to 15)

Document Content:
${fullText}

Please respond in JSON format:
{
  "summary": "...",
  "topics": [...],
  "keyEntities": [...]
}`

    try {
      const model = this.costOptimizer?.selectOptimalModel('document analysis', 'medium') || 'gpt-4o-mini'
      const response = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
      
      // Track usage if cost optimizer is available
      let tokensUsed = 0
      let cost = 0
      if (this.costOptimizer && response.usage) {
        tokensUsed = response.usage.total_tokens
        cost = this.costOptimizer.calculateRequestCost(model, response.usage.prompt_tokens, response.usage.completion_tokens)
      }

      const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')
      return {
        summary: analysis.summary || '',
        topics: analysis.topics || [],
        keyEntities: analysis.keyEntities || [],
        tokensUsed,
        cost
      }
    } catch (error) {
      console.error('Document analysis error:', error)
      return {
        summary: 'Analysis failed',
        topics: [],
        keyEntities: []
      }
    }
  }

  /**
   * Process and describe images using AI vision
   */
  private async processImages(images: ExtractedImage[]): Promise<ExtractedImage[]> {
    let totalImageTokens = 0
    let totalImageCost = 0
    
    return await Promise.all(
      images.map(async (image) => {
        try {
          const model = this.costOptimizer?.selectOptimalModel('image analysis', 'medium') || 'gpt-4o'
          const response = await this.openai.chat.completions.create({
            model,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analyze this image and provide: 1) A detailed description, 2) A concise alt text suitable for accessibility. Respond in JSON format: {"description": "...", "alt": "..."}'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: image.base64Data
                    }
                  }
                ]
              }
            ],
            max_tokens: 500
          })
          
          // Track vision API usage
          if (this.costOptimizer && response.usage) {
            const cost = this.costOptimizer.calculateRequestCost(model, response.usage.prompt_tokens, response.usage.completion_tokens) + 0.002 // vision API cost
            totalImageTokens += response.usage.total_tokens
            totalImageCost += cost
          }

          const analysis = JSON.parse(response.choices[0]?.message?.content || '{}')
          
          return {
            ...image,
            description: analysis.description || 'Image analysis failed',
            alt: analysis.alt || 'Image'
          }
        } catch (error) {
          console.error('Image analysis error:', error)
          return {
            ...image,
            description: 'Image analysis failed',
            alt: 'Image'
          }
        }
      })
    )
  }

  /**
   * Query documents using RAG
   */
  async queryDocuments(query: string, userId: string, documentIds?: string[]): Promise<QueryResult> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      })

      // Find relevant chunks using vector similarity
      const relevantChunks = await this.findRelevantChunks(
        queryEmbedding.data[0]?.embedding || [],
        userId,
        documentIds
      )

      // Generate answer using RAG
      const answer = await this.generateAnswer(query, relevantChunks)

      return {
        chunks: relevantChunks,
        relevanceScore: relevantChunks.length > 0 ? relevantChunks[0]?.relevanceScore || 0 : 0,
        answer,
        sources: relevantChunks.map(chunk => ({
          pageNumber: chunk.pageNumber,
          content: chunk.content.substring(0, 200) + '...',
          relevance: chunk.relevanceScore || 0
        }))
      }
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  /**
   * Find relevant chunks using vector similarity
   */
  private async findRelevantChunks(
    queryEmbedding: number[],
    userId: string,
    documentIds?: string[]
  ): Promise<(DocumentChunk & { relevanceScore: number })[]> {
    // This would use pgvector or similar for efficient similarity search
    // For now, we'll return mock relevant chunks
    
    const mockChunks: (DocumentChunk & { relevanceScore: number })[] = [
      {
        id: uuidv4(),
        content: "Relevant content from the document that matches the query...",
        pageNumber: 1,
        position: { x: 50, y: 100, width: 500, height: 50 },
        type: 'text',
        metadata: { fontSize: 12, fontFamily: 'Arial' },
        relevanceScore: 0.85
      }
    ]

    return mockChunks
  }

  /**
   * Generate answer using retrieved chunks
   */
  private async generateAnswer(query: string, chunks: DocumentChunk[]): Promise<string> {
    const context = chunks.map(chunk => chunk.content).join('\n\n')
    
    const prompt = `Based on the following context from the document(s), answer the user's question. If the answer cannot be found in the context, say "I cannot find that information in the provided documents."

Context:
${context}

Question: ${query}

Answer:`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      })

      return response.choices[0]?.message?.content || 'I cannot generate an answer at this time.'
    } catch (error) {
      console.error('Answer generation error:', error)
      return 'I cannot generate an answer at this time.'
    }
  }

  /**
   * Save document to database
   */
  private async saveDocument(document: PDFDocument): Promise<void> {
    const { error } = await (this.supabase
      .from('pdf_documents')
      .upsert as any)(document)

    if (error) {
      throw new Error(`Database error: ${error.message}`)
    }
  }

  /**
   * Update document status
   */
  private async updateDocumentStatus(documentId: string, status: PDFDocument['status']): Promise<void> {
    const { error } = await (this.supabase
      .from('pdf_documents')
      .update as any)({ status })
      .eq('id', documentId)

    if (error) {
      throw new Error(`Status update error: ${error.message}`)
    }
  }

  /**
   * Get user documents
   */
  async getUserDocuments(userId: string): Promise<PDFDocument[]> {
    const { data, error } = await this.supabase
      .from('pdf_documents')
      .select('*')
      .eq('userId', userId)
      .order('uploadedAt', { ascending: false })

    if (error) {
      throw new Error(`Fetch error: ${error.message}`)
    }

    return data || []
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    // Delete from storage
    await this.supabase.storage
      .from('documents')
      .remove([`${userId}/${documentId}`])

    // Delete from database
    const { error } = await this.supabase
      .from('pdf_documents')
      .delete()
      .eq('id', documentId)
      .eq('userId', userId)

    if (error) {
      throw new Error(`Delete error: ${error.message}`)
    }
  }
}