// WebHarvest Integration API for AI Agent Research Tool
import { NextRequest, NextResponse } from 'next/server';
import { WebsiteVectorStore } from '@/lib/vector/qdrant';
import { z } from 'zod';

const ResearchSchema = z.object({
  query: z.string().min(1),
  depth: z.enum(['shallow', 'medium', 'deep']).default('medium'),
  maxPages: z.number().min(1).max(20).default(5),
  framework: z.string().optional(),
  category: z.string().optional(),
});

interface ScrapingResult {
  url: string;
  title: string;
  content: string;
  metadata: {
    framework?: string;
    category?: string;
    technologies: string[];
    components: string[];
    patterns: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, depth, maxPages, framework, category } = ResearchSchema.parse(body);

    console.log(`[WebHarvest Research] Starting research for: ${query}`);

    // Determine if query is a URL or search term
    const isUrl = query.startsWith('http://') || query.startsWith('https://');
    
    let results: ScrapingResult[] = [];

    if (isUrl) {
      // Direct URL analysis
      results = await analyzeUrl(query);
    } else {
      // Search-based research
      results = await conductWebSearch(query, { depth, maxPages, framework, category });
    }

    // Store results in vector database for future reference
    await storeResults(results);

    // Generate research summary
    const summary = generateResearchSummary(results, query);

    return NextResponse.json({
      success: true,
      query,
      depth,
      summary,
      sources: results.map(r => ({
        url: r.url,
        title: r.title,
        relevance: calculateRelevance(r, query),
      })),
      keyFindings: extractKeyFindings(results, query),
      confidence: calculateConfidence(results, depth),
      totalPages: results.length,
    });

  } catch (error) {
    console.error('WebHarvest research error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Research failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function analyzeUrl(url: string): Promise<ScrapingResult[]> {
  try {
    // Integration with WebHarvest scraping API
    const response = await fetch(`${process.env.WEBHARVEST_API_URL}/api/v1/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WEBHARVEST_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown', 'structured'],
        options: {
          includeMetadata: true,
          extractComponents: true,
          analyzeTechnologies: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WebHarvest API error: ${response.statusText}`);
    }

    const data = await response.json();

    return [{
      url,
      title: data.metadata?.title || extractTitleFromUrl(url),
      content: data.markdown || data.text || '',
      metadata: {
        framework: detectFramework(data),
        category: detectCategory(data),
        technologies: data.technologies || [],
        components: data.components || [],
        patterns: data.patterns || [],
      },
    }];

  } catch (error) {
    console.error('Error analyzing URL:', error);
    
    // Fallback to basic scraping
    return [{
      url,
      title: extractTitleFromUrl(url),
      content: `Failed to scrape ${url}: ${error}`,
      metadata: {
        technologies: [],
        components: [],
        patterns: [],
      },
    }];
  }
}

async function conductWebSearch(
  query: string,
  options: {
    depth: string;
    maxPages: number;
    framework?: string;
    category?: string;
  }
): Promise<ScrapingResult[]> {
  const results: ScrapingResult[] = [];
  
  try {
    // Enhanced search query
    let searchQuery = query;
    if (options.framework) {
      searchQuery += ` ${options.framework}`;
    }
    if (options.category) {
      searchQuery += ` ${options.category}`;
    }

    // Search for relevant URLs (this would integrate with a search API)
    const searchUrls = await performWebSearch(searchQuery, options.maxPages);

    // Scrape each URL
    for (const url of searchUrls) {
      try {
        const urlResults = await analyzeUrl(url);
        results.push(...urlResults);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        continue;
      }
    }

    return results;

  } catch (error) {
    console.error('Error conducting web search:', error);
    return results;
  }
}

async function performWebSearch(query: string, maxResults: number): Promise<string[]> {
  // This would integrate with a search API like Google Custom Search, SerpAPI, etc.
  // For now, return some example URLs based on common patterns
  
  const searchTerms = query.toLowerCase();
  const mockUrls: string[] = [];

  // Add some common development/design resources based on search terms
  if (searchTerms.includes('component') || searchTerms.includes('ui')) {
    mockUrls.push(
      'https://ui.shadcn.com/',
      'https://headlessui.dev/',
      'https://nextui.org/'
    );
  }

  if (searchTerms.includes('react')) {
    mockUrls.push(
      'https://react.dev/',
      'https://reactjs.org/docs/getting-started.html',
      'https://create-react-app.dev/'
    );
  }

  if (searchTerms.includes('design') || searchTerms.includes('pattern')) {
    mockUrls.push(
      'https://patterns.dev/',
      'https://www.smashingmagazine.com/',
      'https://refactoringui.com/'
    );
  }

  return mockUrls.slice(0, maxResults);
}

async function storeResults(results: ScrapingResult[]): Promise<void> {
  try {
    const vectorStore = new WebsiteVectorStore();
    await vectorStore.initializeCollection();

    for (const result of results) {
      await vectorStore.addWebsite({
        url: result.url,
        title: result.title,
        content: result.content,
        metadata: {
          ...result.metadata,
          timestamp: Date.now(),
          source: 'agent_research',
        },
      });
    }

    console.log(`[WebHarvest Research] Stored ${results.length} results in vector database`);
  } catch (error) {
    console.error('Error storing research results:', error);
  }
}

function generateResearchSummary(results: ScrapingResult[], query: string): string {
  if (results.length === 0) {
    return `No relevant content found for "${query}".`;
  }

  const technologies = new Set<string>();
  const frameworks = new Set<string>();
  const patterns = new Set<string>();

  results.forEach(result => {
    result.metadata.technologies?.forEach(tech => technologies.add(tech));
    if (result.metadata.framework) frameworks.add(result.metadata.framework);
    result.metadata.patterns?.forEach(pattern => patterns.add(pattern));
  });

  let summary = `Research analysis for "${query}" across ${results.length} sources:\n\n`;
  
  if (frameworks.size > 0) {
    summary += `• Frameworks identified: ${Array.from(frameworks).join(', ')}\n`;
  }
  
  if (technologies.size > 0) {
    summary += `• Technologies found: ${Array.from(technologies).slice(0, 10).join(', ')}\n`;
  }
  
  if (patterns.size > 0) {
    summary += `• Design patterns: ${Array.from(patterns).slice(0, 5).join(', ')}\n`;
  }

  summary += `\nKey insights gathered from analyzing the websites and their implementation approaches.`;

  return summary;
}

function extractKeyFindings(results: ScrapingResult[], query: string): string[] {
  const findings: string[] = [];

  // Analyze common technologies
  const techCounts = new Map<string, number>();
  results.forEach(result => {
    result.metadata.technologies?.forEach(tech => {
      techCounts.set(tech, (techCounts.get(tech) || 0) + 1);
    });
  });

  // Top technologies
  const topTechs = Array.from(techCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topTechs.length > 0) {
    findings.push(`Most common technologies: ${topTechs.map(([tech, count]) => `${tech} (${count} sites)`).join(', ')}`);
  }

  // Framework analysis
  const frameworks = new Set(results.map(r => r.metadata.framework).filter(Boolean));
  if (frameworks.size > 0) {
    findings.push(`Frameworks in use: ${Array.from(frameworks).join(', ')}`);
  }

  // Content analysis
  const avgContentLength = results.reduce((sum, r) => sum + r.content.length, 0) / results.length;
  findings.push(`Average content complexity: ${avgContentLength > 10000 ? 'High' : avgContentLength > 5000 ? 'Medium' : 'Low'}`);

  // Pattern analysis
  const allPatterns = results.flatMap(r => r.metadata.patterns || []);
  const uniquePatterns = new Set(allPatterns);
  if (uniquePatterns.size > 0) {
    findings.push(`Design patterns identified: ${uniquePatterns.size} unique patterns across sources`);
  }

  return findings;
}

function calculateRelevance(result: ScrapingResult, query: string): number {
  const queryLower = query.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const contentLower = result.content.toLowerCase();

  let relevance = 0;

  // Title relevance (weighted higher)
  if (titleLower.includes(queryLower)) relevance += 0.5;
  
  // Content relevance
  const queryWords = queryLower.split(' ');
  const titleWords = titleLower.split(' ');
  const contentWords = contentLower.split(' ');

  const titleMatches = queryWords.filter(word => titleWords.includes(word)).length;
  const contentMatches = queryWords.filter(word => contentWords.includes(word)).length;

  relevance += (titleMatches / queryWords.length) * 0.3;
  relevance += (contentMatches / queryWords.length) * 0.2;

  return Math.min(1, relevance);
}

function calculateConfidence(results: ScrapingResult[], depth: string): number {
  if (results.length === 0) return 0;

  let confidence = Math.min(0.8, results.length * 0.1); // Base confidence on number of sources

  // Adjust based on depth
  const depthMultiplier = {
    shallow: 0.7,
    medium: 0.85,
    deep: 1.0,
  };

  confidence *= depthMultiplier[depth as keyof typeof depthMultiplier];

  // Adjust based on content quality
  const avgContentLength = results.reduce((sum, r) => sum + r.content.length, 0) / results.length;
  if (avgContentLength > 5000) confidence *= 1.1;
  if (avgContentLength < 1000) confidence *= 0.8;

  return Math.min(1, Math.max(0, confidence));
}

function detectFramework(data: any): string | undefined {
  const content = (data.markdown || data.text || '').toLowerCase();
  const metadata = data.metadata || {};

  // Check for framework indicators
  if (content.includes('react') || metadata.framework === 'react') return 'React';
  if (content.includes('vue') || metadata.framework === 'vue') return 'Vue';
  if (content.includes('angular') || metadata.framework === 'angular') return 'Angular';
  if (content.includes('svelte') || metadata.framework === 'svelte') return 'Svelte';
  if (content.includes('next.js') || content.includes('nextjs')) return 'Next.js';
  if (content.includes('nuxt') || metadata.framework === 'nuxt') return 'Nuxt.js';

  return undefined;
}

function detectCategory(data: any): string | undefined {
  const content = (data.markdown || data.text || '').toLowerCase();
  const url = data.url || '';

  if (content.includes('component') || content.includes('library')) return 'Component Library';
  if (content.includes('design system')) return 'Design System';
  if (content.includes('dashboard') || content.includes('admin')) return 'Dashboard';
  if (content.includes('landing') || url.includes('landing')) return 'Landing Page';
  if (content.includes('blog') || url.includes('blog')) return 'Blog';
  if (content.includes('ecommerce') || content.includes('shop')) return 'E-commerce';
  if (content.includes('portfolio')) return 'Portfolio';
  if (content.includes('documentation') || content.includes('docs')) return 'Documentation';

  return undefined;
}

function extractTitleFromUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '').replace(/\./g, ' ').toUpperCase();
  } catch {
    return url;
  }
}