// Vector Search API Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { WebsiteVectorStore, ComponentVectorStore } from '@/lib/vector/qdrant';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(1),
  collection: z.enum(['websites', 'components']),
  limit: z.number().min(1).max(50).default(10),
  threshold: z.number().min(0).max(1).default(0.7),
  filter: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, collection, limit, threshold, filter } = SearchSchema.parse(body);

    let vectorStore;
    let results;

    switch (collection) {
      case 'websites':
        vectorStore = new WebsiteVectorStore();
        await vectorStore.initializeCollection();
        
        results = await vectorStore.searchWebsites(query, {
          limit,
          framework: filter?.framework,
          category: filter?.category,
        });
        break;

      case 'components':
        vectorStore = new ComponentVectorStore();
        await vectorStore.initializeCollection();
        
        results = await vectorStore.searchComponents(query, {
          limit,
          framework: filter?.framework,
          category: filter?.category,
          tags: filter?.tags,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid collection name' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      query,
      collection,
      results: results.map(result => ({
        id: result.id,
        score: result.score,
        content: result.content,
        metadata: result.metadata,
      })),
      total: results.length,
      searchTime: Date.now(), // Would calculate actual search time
    });

  } catch (error) {
    console.error('Vector search error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const collection = searchParams.get('collection');

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'info': {
        if (!collection || !['websites', 'components'].includes(collection)) {
          return NextResponse.json(
            { error: 'Valid collection parameter is required for info action' },
            { status: 400 }
          );
        }

        let vectorStore;
        if (collection === 'websites') {
          vectorStore = new WebsiteVectorStore();
        } else {
          vectorStore = new ComponentVectorStore();
        }

        await vectorStore.initializeCollection();
        const info = await vectorStore.getCollectionInfo();
        const count = await vectorStore.getDocumentCount();

        return NextResponse.json({
          collection,
          info,
          documentCount: count,
        });
      }

      case 'collections': {
        return NextResponse.json({
          collections: [
            {
              name: 'websites',
              description: 'Scraped website content and metadata',
              vectorSize: 384,
            },
            {
              name: 'components',
              description: 'UI components and code snippets',
              vectorSize: 384,
            },
          ],
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available actions: info, collections' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Vector API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Add documents to vector store
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { collection, documents } = body;

    if (!collection || !['websites', 'components'].includes(collection)) {
      return NextResponse.json(
        { error: 'Valid collection parameter is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'Documents array is required and cannot be empty' },
        { status: 400 }
      );
    }

    let vectorStore;
    if (collection === 'websites') {
      vectorStore = new WebsiteVectorStore();
      await vectorStore.initializeCollection();

      // Add websites
      for (const doc of documents) {
        await vectorStore.addWebsite({
          url: doc.url,
          title: doc.title,
          content: doc.content,
          metadata: doc.metadata || {},
          embedding: doc.embedding,
        });
      }
    } else {
      vectorStore = new ComponentVectorStore();
      await vectorStore.initializeCollection();

      // Add components
      for (const doc of documents) {
        await vectorStore.addComponent({
          name: doc.name,
          description: doc.description,
          code: doc.code,
          framework: doc.framework,
          category: doc.category,
          tags: doc.tags || [],
          embedding: doc.embedding,
        });
      }
    }

    return NextResponse.json({
      success: true,
      collection,
      addedDocuments: documents.length,
      message: `Successfully added ${documents.length} documents to ${collection}`,
    });

  } catch (error) {
    console.error('Vector add documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Delete documents from vector store
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collection = searchParams.get('collection');
    const documentId = searchParams.get('id');

    if (!collection || !['websites', 'components'].includes(collection)) {
      return NextResponse.json(
        { error: 'Valid collection parameter is required' },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    let vectorStore;
    if (collection === 'websites') {
      vectorStore = new WebsiteVectorStore();
    } else {
      vectorStore = new ComponentVectorStore();
    }

    await vectorStore.initializeCollection();
    await vectorStore.deleteDocument(documentId);

    return NextResponse.json({
      success: true,
      collection,
      deletedDocument: documentId,
      message: `Successfully deleted document ${documentId} from ${collection}`,
    });

  } catch (error) {
    console.error('Vector delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}