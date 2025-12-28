const pdf = require('pdf-parse')
import { fromBuffer } from 'pdf2pic'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/client'

// Enhanced PDF processing implementation
export class PDFProcessorImpl {
  private openai: OpenAI
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
    
    this.supabase = createClient()
  }

  /**
   * Extract text and metadata from PDF buffer
   */
  async extractTextFromPDF(buffer: Buffer): Promise<{
    text: string
    numPages: number
    metadata: any
    chunks: Array<{
      text: string
      page: number
      position?: any
    }>
  }> {
    try {
      const data = await pdf(buffer)
      
      // Split text into meaningful chunks (paragraphs, sections)
      const chunks = this.chunkText(data.text, data.numpages)
      
      return {
        text: data.text,
        numPages: data.numpages,
        metadata: data.metadata || {},
        chunks
      }
    } catch (error) {
      console.error('PDF text extraction error:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  /**
   * Extract images from PDF
   */
  async extractImagesFromPDF(buffer: Buffer): Promise<Array<{
    pageNumber: number
    imageBuffer: Buffer
    filename: string
    format: string
  }>> {
    try {
      const convert = fromBuffer(buffer, {
        density: 150, // DPI
        saveFilename: 'page',
        savePath: './temp',
        format: 'jpeg',
        width: 1200,
        height: 1600
      })

      // Convert all pages to images
      const results = await convert.bulk(-1, { responseType: 'buffer' })
      
      return results.map((result, index) => ({
        pageNumber: index + 1,
        imageBuffer: result.buffer || Buffer.alloc(0),
        filename: `page_${index + 1}.jpg`,
        format: 'jpeg'
      }))
    } catch (error) {
      console.error('PDF image extraction error:', error)
      // Return empty array if image extraction fails
      return []
    }
  }

  /**
   * Chunk text into meaningful segments
   */
  private chunkText(text: string, numPages: number): Array<{
    text: string
    page: number
    position?: any
  }> {
    const chunks: Array<{
      text: string
      page: number
      position?: any
    }> = []
    
    // Simple chunking strategy: split by paragraphs and page breaks
    const paragraphs = text.split(/\n\s*\n/)
    let currentPage = 1
    let currentPosition = 0
    
    const avgCharsPerPage = text.length / numPages
    
    paragraphs.forEach(paragraph => {
      const trimmedParagraph = paragraph.trim()
      if (trimmedParagraph.length > 50) { // Only include substantial paragraphs
        // Estimate page number based on character position
        currentPage = Math.min(numPages, Math.floor(currentPosition / avgCharsPerPage) + 1)
        
        chunks.push({
          text: trimmedParagraph,
          page: currentPage,
          position: {
            start: currentPosition,
            end: currentPosition + trimmedParagraph.length
          }
        })
      }
      currentPosition += paragraph.length + 2 // +2 for newlines
    })
    
    // If we have too few chunks, split large ones
    if (chunks.length < 5 && chunks.some(chunk => chunk.text.length > 1000)) {
      return this.splitLargeChunks(chunks)
    }
    
    return chunks
  }

  /**
   * Split large chunks into smaller ones
   */
  private splitLargeChunks(chunks: Array<{
    text: string
    page: number
    position?: any
  }>): Array<{
    text: string
    page: number
    position?: any
  }> {
    const result: Array<{
      text: string
      page: number
      position?: any
    }> = []
    
    chunks.forEach(chunk => {
      if (chunk.text.length <= 1000) {
        result.push(chunk)
      } else {
        // Split by sentences
        const sentences = chunk.text.split(/[.!?]+\s+/)
        let currentChunk = ''
        
        sentences.forEach(sentence => {
          if ((currentChunk + sentence).length > 800 && currentChunk.length > 0) {
            result.push({
              text: currentChunk.trim(),
              page: chunk.page,
              position: chunk.position
            })
            currentChunk = sentence
          } else {
            currentChunk += (currentChunk ? '. ' : '') + sentence
          }
        })
        
        if (currentChunk.length > 0) {
          result.push({
            text: currentChunk.trim(),
            page: chunk.page,
            position: chunk.position
          })
        }
      }
    })
    
    return result
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddingsForChunks(chunks: Array<{
    text: string
    page: number
    position?: any
  }>): Promise<Array<{
    text: string
    page: number
    position?: any
    embedding: number[]
  }>> {
    const chunksWithEmbeddings: Array<{
      text: string
      page: number
      position?: any
      embedding: number[]
    }> = []
    
    // Process in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      
      try {
        const response = await this.openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: batch.map(chunk => chunk.text),
          encoding_format: 'float'
        })
        
        batch.forEach((chunk, index) => {
          chunksWithEmbeddings.push({
            ...chunk,
            embedding: response.data[index]?.embedding || []
          })
        })
        
        // Rate limiting delay
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error('Embedding generation error for batch:', error)
        // Add chunks without embeddings
        batch.forEach(chunk => {
          chunksWithEmbeddings.push({
            ...chunk,
            embedding: []
          })
        })
      }
    }
    
    return chunksWithEmbeddings
  }

  /**
   * Analyze document with AI to extract topics and entities
   */
  async analyzeDocument(text: string): Promise<{
    summary: string
    topics: string[]
    keyEntities: string[]
    language: string
    sentiment: 'positive' | 'negative' | 'neutral'
  }> {
    try {
      const prompt = `
Analyze the following document and provide a JSON response with:
1. summary: A 2-3 sentence summary
2. topics: Up to 10 main topics/themes
3. keyEntities: Up to 15 key entities (people, organizations, concepts, locations)
4. language: Detected language (e.g., 'en', 'es', 'fr')
5. sentiment: Overall sentiment (positive, negative, or neutral)

Document text (first 8000 characters):
${text.substring(0, 8000)}

Respond only with valid JSON:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use faster, cheaper model for analysis
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1000
      })

      const content = response.choices[0]?.message?.content
      if (!content) throw new Error('No response from AI')

      const analysis = JSON.parse(content)
      return {
        summary: analysis.summary || 'Analysis failed',
        topics: Array.isArray(analysis.topics) ? analysis.topics : [],
        keyEntities: Array.isArray(analysis.keyEntities) ? analysis.keyEntities : [],
        language: analysis.language || 'en',
        sentiment: analysis.sentiment || 'neutral'
      }
    } catch (error) {
      console.error('Document analysis error:', error)
      return {
        summary: 'Failed to analyze document',
        topics: [],
        keyEntities: [],
        language: 'en',
        sentiment: 'neutral'
      }
    }
  }

  /**
   * Analyze extracted images with AI vision
   */
  async analyzeImages(images: Array<{
    pageNumber: number
    imageBuffer: Buffer
    filename: string
    format: string
  }>): Promise<Array<{
    pageNumber: number
    filename: string
    description: string
    altText: string
    detectedObjects: string[]
    containsText: boolean
    textContent?: string
  }>> {
    const analyzedImages = []
    
    // Analyze up to 5 images to manage costs
    const imagesToAnalyze = images.slice(0, 5)
    
    for (const image of imagesToAnalyze) {
      try {
        const base64Image = image.imageBuffer.toString('base64')
        const dataUri = `data:image/${image.format};base64,${base64Image}`
        
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini', // Use vision-capable model
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this image from a PDF document and provide a JSON response with:
1. description: Detailed description of the image
2. altText: Concise alt text for accessibility
3. detectedObjects: Array of main objects/elements seen
4. containsText: Boolean if image contains readable text
5. textContent: Any readable text found (if containsText is true)

Respond only with valid JSON:`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataUri,
                    detail: 'low' // Use low detail to reduce costs
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
        
        const content = response.choices[0]?.message?.content
        if (content) {
          const analysis = JSON.parse(content)
          analyzedImages.push({
            pageNumber: image.pageNumber,
            filename: image.filename,
            description: analysis.description || 'Image analysis failed',
            altText: analysis.altText || 'Image',
            detectedObjects: Array.isArray(analysis.detectedObjects) ? analysis.detectedObjects : [],
            containsText: Boolean(analysis.containsText),
            textContent: analysis.textContent || undefined
          })
        }
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error('Image analysis error:', error)
        analyzedImages.push({
          pageNumber: image.pageNumber,
          filename: image.filename,
          description: 'Image analysis failed',
          altText: 'Image',
          detectedObjects: [],
          containsText: false
        })
      }
    }
    
    return analyzedImages
  }

  /**
   * Perform semantic search on document chunks
   */
  async semanticSearch(
    query: string,
    documentChunks: Array<{
      text: string
      page: number
      embedding: number[]
    }>,
    maxResults: number = 5
  ): Promise<Array<{
    text: string
    page: number
    similarity: number
    relevanceScore: number
  }>> {
    try {
      // Generate embedding for the query
      const queryResponse = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
        encoding_format: 'float'
      })
      
      const queryEmbedding = queryResponse.data[0]?.embedding || []
      
      // Calculate similarities
      const results = documentChunks
        .filter(chunk => chunk.embedding && chunk.embedding.length > 0)
        .map(chunk => {
          const similarity = this.cosineSimilarity(queryEmbedding, chunk.embedding)
          return {
            text: chunk.text,
            page: chunk.page,
            similarity,
            relevanceScore: similarity
          }
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults)
        
      return results
    } catch (error) {
      console.error('Semantic search error:', error)
      return []
    }
  }

  /**
   * Generate answer using retrieved chunks
   */
  async generateRAGAnswer(
    query: string,
    relevantChunks: Array<{
      text: string
      page: number
      similarity: number
    }>
  ): Promise<{
    answer: string
    confidence: number
    sources: Array<{
      page: number
      excerpt: string
      relevance: number
    }>
  }> {
    try {
      const context = relevantChunks
        .map((chunk, index) => `[Source ${index + 1}, Page ${chunk.page}]: ${chunk.text}`)
        .join('\n\n')
      
      const prompt = `You are an AI assistant helping users understand PDF documents. Based on the provided context, answer the user's question accurately and concisely.

If the answer is not found in the context, clearly state "I cannot find that information in the provided document."

Context from the document:
${context}

User Question: ${query}

Answer:`

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 500
      })

      const answer = response.choices[0]?.message?.content || 'I cannot generate an answer at this time.'
      
      // Calculate confidence based on similarity scores
      const avgSimilarity = relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / relevantChunks.length
      const confidence = Math.min(1, Math.max(0, avgSimilarity))
      
      const sources = relevantChunks.map(chunk => ({
        page: chunk.page,
        excerpt: chunk.text.substring(0, 150) + (chunk.text.length > 150 ? '...' : ''),
        relevance: chunk.similarity
      }))

      return {
        answer,
        confidence,
        sources
      }
    } catch (error) {
      console.error('RAG answer generation error:', error)
      return {
        answer: 'I encountered an error while processing your question.',
        confidence: 0,
        sources: []
      }
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += (a[i] || 0) * (b[i] || 0)
      normA += (a[i] || 0) * (a[i] || 0)
      normB += (b[i] || 0) * (b[i] || 0)
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  /**
   * Clean and optimize text for processing
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim()
  }
}