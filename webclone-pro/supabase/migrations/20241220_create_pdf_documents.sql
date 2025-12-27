-- Create PDF documents table
CREATE TABLE pdf_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  storage_path TEXT NOT NULL,
  
  -- Processing status
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Processing results
  processing_result JSONB,
  
  -- User customizable fields
  title TEXT,
  description TEXT,
  tags TEXT[],
  notes TEXT,
  
  -- Embeddings and search
  content_summary TEXT,
  key_topics TEXT[],
  key_entities TEXT[]
);

-- Create document chunks table for vector search
CREATE TABLE pdf_document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES pdf_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  chunk_type TEXT NOT NULL DEFAULT 'text' CHECK (chunk_type IN ('text', 'table', 'header', 'footer', 'image_caption')),
  
  -- Position data
  position JSONB, -- {x, y, width, height}
  
  -- Styling metadata
  style_metadata JSONB, -- {fontSize, fontFamily, isBold, isItalic, etc}
  
  -- Vector embedding for semantic search
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create extracted images table
CREATE TABLE pdf_extracted_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES pdf_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  image_index INTEGER NOT NULL,
  
  -- Image data
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  
  -- Position and dimensions
  position JSONB, -- {x, y, width, height}
  
  -- AI-generated descriptions
  description TEXT,
  alt_text TEXT,
  
  -- Image analysis results
  analysis_result JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create query history table
CREATE TABLE pdf_query_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_ids UUID[], -- Array of document IDs queried
  
  -- Query data
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  
  -- Metadata
  relevance_score FLOAT,
  sources_used JSONB, -- Array of chunk references used
  processing_time_ms INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_pdf_documents_user_id ON pdf_documents(user_id);
CREATE INDEX idx_pdf_documents_status ON pdf_documents(status);
CREATE INDEX idx_pdf_documents_uploaded_at ON pdf_documents(uploaded_at DESC);
CREATE INDEX idx_pdf_documents_tags ON pdf_documents USING GIN(tags);
CREATE INDEX idx_pdf_documents_key_topics ON pdf_documents USING GIN(key_topics);
CREATE INDEX idx_pdf_documents_metadata ON pdf_documents USING GIN(metadata);

CREATE INDEX idx_pdf_chunks_document_id ON pdf_document_chunks(document_id);
CREATE INDEX idx_pdf_chunks_page_number ON pdf_document_chunks(page_number);
CREATE INDEX idx_pdf_chunks_embedding ON pdf_document_chunks USING hnsw(embedding vector_cosine_ops);

CREATE INDEX idx_pdf_images_document_id ON pdf_extracted_images(document_id);
CREATE INDEX idx_pdf_images_page_number ON pdf_extracted_images(page_number);

CREATE INDEX idx_pdf_queries_user_id ON pdf_query_history(user_id);
CREATE INDEX idx_pdf_queries_created_at ON pdf_query_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_extracted_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_query_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own documents
CREATE POLICY "Users can view their own documents" ON pdf_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view chunks of their own documents" ON pdf_document_chunks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pdf_documents 
      WHERE pdf_documents.id = pdf_document_chunks.document_id 
      AND pdf_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view images from their own documents" ON pdf_extracted_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pdf_documents 
      WHERE pdf_documents.id = pdf_extracted_images.document_id 
      AND pdf_documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own query history" ON pdf_query_history
  FOR ALL USING (auth.uid() = user_id);

-- Create functions for vector search
CREATE OR REPLACE FUNCTION search_document_chunks(
  query_embedding VECTOR(1536),
  document_ids UUID[] DEFAULT NULL,
  user_id UUID DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.5,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  page_number INTEGER,
  chunk_type TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.document_id,
    c.content,
    c.page_number,
    c.chunk_type,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM pdf_document_chunks c
  JOIN pdf_documents d ON c.document_id = d.id
  WHERE 
    (user_id IS NULL OR d.user_id = search_document_chunks.user_id)
    AND (document_ids IS NULL OR d.id = ANY(document_ids))
    AND 1 - (c.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Create function to get document statistics
CREATE OR REPLACE FUNCTION get_document_stats(user_id UUID)
RETURNS TABLE (
  total_documents INTEGER,
  completed_documents INTEGER,
  processing_documents INTEGER,
  failed_documents INTEGER,
  total_pages INTEGER,
  total_chunks INTEGER,
  total_images INTEGER,
  total_storage_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_documents,
    COUNT(CASE WHEN status = 'completed' THEN 1 END)::INTEGER AS completed_documents,
    COUNT(CASE WHEN status = 'processing' THEN 1 END)::INTEGER AS processing_documents,
    COUNT(CASE WHEN status = 'failed' THEN 1 END)::INTEGER AS failed_documents,
    COALESCE(SUM((metadata->>'pageCount')::INTEGER), 0)::INTEGER AS total_pages,
    COALESCE((
      SELECT COUNT(*) FROM pdf_document_chunks c 
      JOIN pdf_documents d ON c.document_id = d.id 
      WHERE d.user_id = get_document_stats.user_id
    ), 0)::INTEGER AS total_chunks,
    COALESCE((
      SELECT COUNT(*) FROM pdf_extracted_images i 
      JOIN pdf_documents d ON i.document_id = d.id 
      WHERE d.user_id = get_document_stats.user_id
    ), 0)::INTEGER AS total_images,
    COALESCE(SUM(file_size), 0) AS total_storage_bytes
  FROM pdf_documents 
  WHERE pdf_documents.user_id = get_document_stats.user_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pdf_documents_updated_at
  BEFORE UPDATE ON pdf_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();