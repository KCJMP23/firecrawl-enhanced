// Qdrant Vector Database Integration
import { QdrantClient } from '@qdrant/js-client-rest';

export interface VectorDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
}

export class QdrantVectorStore {
  private client: QdrantClient;
  private collectionName: string;

  constructor(config: {
    url?: string;
    apiKey?: string;
    collectionName: string;
  }) {
    this.client = new QdrantClient({
      url: config.url || process.env.QDRANT_URL || 'http://localhost:6333',
      apiKey: config.apiKey || process.env.QDRANT_API_KEY,
    });
    this.collectionName = config.collectionName;
  }

  async initializeCollection(vectorSize: number = 384): Promise<void> {
    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        collection => collection.name === this.collectionName
      );

      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: vectorSize,
            distance: 'Cosine'
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });
        console.log(`Created collection: ${this.collectionName}`);
      }

      // Create payload indexes for better filtering performance
      await this.createPayloadIndexes();

    } catch (error) {
      console.error('Error initializing Qdrant collection:', error);
      throw error;
    }
  }

  private async createPayloadIndexes(): Promise<void> {
    const indexes = [
      { field: 'type', type: 'keyword' },
      { field: 'framework', type: 'keyword' },
      { field: 'category', type: 'keyword' },
      { field: 'timestamp', type: 'integer' },
    ];

    for (const index of indexes) {
      try {
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: index.field,
          field_schema: index.type,
        });
      } catch (error) {
        // Index might already exist, continue
        console.log(`Index ${index.field} might already exist:`, error);
      }
    }
  }

  async addDocuments(documents: VectorDocument[]): Promise<void> {
    try {
      const points = documents.map(doc => ({
        id: doc.id,
        vector: doc.embedding || [],
        payload: {
          content: doc.content,
          ...doc.metadata,
          timestamp: Date.now(),
        },
      }));

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      });

      console.log(`Added ${documents.length} documents to ${this.collectionName}`);
    } catch (error) {
      console.error('Error adding documents to Qdrant:', error);
      throw error;
    }
  }

  async searchSimilar(
    queryVector: number[],
    options: {
      limit?: number;
      threshold?: number;
      filter?: Record<string, any>;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const { limit = 10, threshold = 0.7, filter } = options;

      const searchResult = await this.client.search(this.collectionName, {
        vector: queryVector,
        limit,
        score_threshold: threshold,
        filter: filter ? this.buildQdrantFilter(filter) : undefined,
        with_payload: true,
      });

      return searchResult.map(result => ({
        id: result.id as string,
        score: result.score,
        content: result.payload?.content as string || '',
        metadata: result.payload || {},
      }));
    } catch (error) {
      console.error('Error searching in Qdrant:', error);
      throw error;
    }
  }

  async searchByText(
    query: string,
    options: {
      limit?: number;
      threshold?: number;
      filter?: Record<string, any>;
    } = {}
  ): Promise<SearchResult[]> {
    // This would require an embedding model to convert text to vector
    // For now, we'll use a simple text search with scroll
    try {
      const { limit = 10, filter } = options;

      const scrollResult = await this.client.scroll(this.collectionName, {
        limit,
        filter: filter ? this.buildQdrantFilter(filter) : undefined,
        with_payload: true,
      });

      // Simple text matching (in production, use proper embeddings)
      const results = scrollResult.points
        .filter(point => {
          const content = point.payload?.content as string || '';
          return content.toLowerCase().includes(query.toLowerCase());
        })
        .map(point => ({
          id: point.id as string,
          score: 1.0, // Placeholder score
          content: point.payload?.content as string || '',
          metadata: point.payload || {},
        }))
        .slice(0, limit);

      return results;
    } catch (error) {
      console.error('Error searching by text in Qdrant:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        points: [documentId],
      });
      console.log(`Deleted document ${documentId} from ${this.collectionName}`);
    } catch (error) {
      console.error('Error deleting document from Qdrant:', error);
      throw error;
    }
  }

  async updateDocument(document: VectorDocument): Promise<void> {
    // Update is same as upsert in Qdrant
    await this.addDocuments([document]);
  }

  async getCollectionInfo(): Promise<any> {
    try {
      return await this.client.getCollection(this.collectionName);
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw error;
    }
  }

  async getDocumentCount(filter?: Record<string, any>): Promise<number> {
    try {
      const info = await this.client.count(this.collectionName, {
        filter: filter ? this.buildQdrantFilter(filter) : undefined,
        exact: true,
      });
      return info.count;
    } catch (error) {
      console.error('Error getting document count:', error);
      throw error;
    }
  }

  private buildQdrantFilter(filter: Record<string, any>): any {
    const must: any[] = [];

    Object.entries(filter).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        must.push({
          key,
          match: { any: value },
        });
      } else if (typeof value === 'object' && value !== null) {
        // Handle range queries
        if (value.gte !== undefined || value.lte !== undefined || value.gt !== undefined || value.lt !== undefined) {
          must.push({
            key,
            range: value,
          });
        } else {
          must.push({
            key,
            match: { value },
          });
        }
      } else {
        must.push({
          key,
          match: { value },
        });
      }
    });

    return must.length > 0 ? { must } : undefined;
  }

  async close(): Promise<void> {
    // Qdrant client doesn't need explicit closing
    console.log('Qdrant connection closed');
  }
}

// Specialized vector stores for different use cases
export class WebsiteVectorStore extends QdrantVectorStore {
  constructor() {
    super({ collectionName: 'websites' });
  }

  async addWebsite(website: {
    url: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
    embedding?: number[];
  }): Promise<void> {
    const document: VectorDocument = {
      id: `website_${Buffer.from(website.url).toString('base64')}`,
      content: `${website.title}\n${website.content}`,
      metadata: {
        ...website.metadata,
        type: 'website',
        url: website.url,
        title: website.title,
      },
      embedding: website.embedding,
    };

    await this.addDocuments([document]);
  }

  async searchWebsites(query: string, options: {
    framework?: string;
    category?: string;
    limit?: number;
  } = {}): Promise<SearchResult[]> {
    const filter: Record<string, any> = { type: 'website' };
    
    if (options.framework) {
      filter.framework = options.framework;
    }
    if (options.category) {
      filter.category = options.category;
    }

    return await this.searchByText(query, {
      ...options,
      filter,
    });
  }
}

export class ComponentVectorStore extends QdrantVectorStore {
  constructor() {
    super({ collectionName: 'components' });
  }

  async addComponent(component: {
    name: string;
    description: string;
    code: string;
    framework: string;
    category: string;
    tags: string[];
    embedding?: number[];
  }): Promise<void> {
    const document: VectorDocument = {
      id: `component_${component.name}_${component.framework}`,
      content: `${component.name}\n${component.description}\n${component.code}`,
      metadata: {
        type: 'component',
        name: component.name,
        description: component.description,
        framework: component.framework,
        category: component.category,
        tags: component.tags,
      },
      embedding: component.embedding,
    };

    await this.addDocuments([document]);
  }

  async searchComponents(query: string, options: {
    framework?: string;
    category?: string;
    tags?: string[];
    limit?: number;
  } = {}): Promise<SearchResult[]> {
    const filter: Record<string, any> = { type: 'component' };
    
    if (options.framework) {
      filter.framework = options.framework;
    }
    if (options.category) {
      filter.category = options.category;
    }
    if (options.tags && options.tags.length > 0) {
      filter.tags = { any: options.tags };
    }

    return await this.searchByText(query, {
      ...options,
      filter,
    });
  }
}