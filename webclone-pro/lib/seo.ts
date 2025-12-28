// Advanced SEO optimization system for WebClone Pro 2026
import { Metadata } from 'next'

export interface SEOConfig {
  title?: string
  description?: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  twitterCard?: 'summary' | 'summary_large_image' | 'player'
  noindex?: boolean
  nofollow?: boolean
  structuredData?: any
  alternateLanguages?: Record<string, string>
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface ReviewData {
  rating: number
  reviewCount: number
  bestRating?: number
  worstRating?: number
}

export class SEOManager {
  private baseUrl = 'https://webclone.pro'
  private siteName = 'WebClone Pro 2026'
  private defaultImage = '/images/og-default.jpg'

  constructor(baseUrl?: string) {
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  // Generate comprehensive metadata
  generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords = [],
      canonical,
      ogImage = this.defaultImage,
      ogType = 'website',
      twitterCard = 'summary_large_image',
      noindex = false,
      nofollow = false,
      alternateLanguages = {}
    } = config

    const metadata: Metadata = {
      title: title ? `${title} | ${this.siteName}` : this.siteName,
      description,
      keywords: keywords.join(', '),
      robots: {
        index: !noindex,
        follow: !nofollow,
        googleBot: {
          index: !noindex,
          follow: !nofollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1
        }
      },
      openGraph: {
        title: title || this.siteName,
        description,
        url: canonical || this.baseUrl,
        siteName: this.siteName,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title || this.siteName
          }
        ],
        type: ogType,
        locale: 'en_US'
      },
      twitter: {
        card: twitterCard,
        title: title || this.siteName,
        description,
        images: [ogImage],
        creator: '@webclonepro',
        site: '@webclonepro'
      },
      alternates: {
        canonical: canonical || this.baseUrl,
        languages: alternateLanguages
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION
      }
    }

    return metadata
  }

  // Generate JSON-LD structured data
  generateStructuredData(type: string, data: any): string {
    const baseStructure = {
      '@context': 'https://schema.org',
      '@type': type,
      ...data
    }

    return JSON.stringify(baseStructure, null, 2)
  }

  // Organization schema
  generateOrganizationSchema(): string {
    return this.generateStructuredData('Organization', {
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'Next-generation AI-native website cloning and creation platform',
      foundingDate: '2024',
      industry: 'Software Development',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'US'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-555-WEBCLONE',
        contactType: 'Customer Service',
        email: 'support@webclone.pro'
      },
      sameAs: [
        'https://twitter.com/webclonepro',
        'https://github.com/webclonepro',
        'https://linkedin.com/company/webclonepro'
      ]
    })
  }

  // Website schema
  generateWebSiteSchema(): string {
    return this.generateStructuredData('WebSite', {
      name: this.siteName,
      url: this.baseUrl,
      description: 'AI-powered website cloning and creation platform',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    })
  }

  // Software application schema
  generateSoftwareApplicationSchema(): string {
    return this.generateStructuredData('SoftwareApplication', {
      name: this.siteName,
      url: this.baseUrl,
      description: 'AI-native website cloning and creation platform',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web Browser',
      price: '29',
      priceCurrency: 'USD',
      offers: {
        '@type': 'Offer',
        price: '29',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        validFrom: '2024-01-01'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '127',
        bestRating: '5',
        worstRating: '1'
      },
      featureList: [
        'AI-Powered Website Cloning',
        'Real-time Collaboration',
        'Advanced Analytics',
        'Custom Templates',
        'Version Control',
        'Team Management'
      ]
    })
  }

  // Breadcrumb schema
  generateBreadcrumbSchema(items: BreadcrumbItem[]): string {
    const listItems = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${this.baseUrl}${item.url}`
    }))

    return this.generateStructuredData('BreadcrumbList', {
      itemListElement: listItems
    })
  }

  // FAQ schema
  generateFAQSchema(faqs: FAQItem[]): string {
    const mainEntities = faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))

    return this.generateStructuredData('FAQPage', {
      mainEntity: mainEntities
    })
  }

  // Article schema
  generateArticleSchema(article: {
    title: string
    description: string
    author: string
    publishedDate: string
    modifiedDate?: string
    image: string
    url: string
  }): string {
    return this.generateStructuredData('Article', {
      headline: article.title,
      description: article.description,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/images/logo.png`
        }
      },
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate || article.publishedDate,
      image: {
        '@type': 'ImageObject',
        url: article.image,
        width: 1200,
        height: 630
      },
      url: article.url,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.url
      }
    })
  }

  // Product schema for templates
  generateProductSchema(product: {
    name: string
    description: string
    price: number
    currency: string
    image: string
    url: string
    category: string
    reviews?: ReviewData
  }): string {
    const productData: any = {
      name: product.name,
      description: product.description,
      image: product.image,
      url: product.url,
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price.toString(),
        priceCurrency: product.currency,
        availability: 'https://schema.org/InStock',
        url: product.url
      },
      brand: {
        '@type': 'Brand',
        name: this.siteName
      }
    }

    if (product.reviews) {
      productData.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.reviews.rating.toString(),
        reviewCount: product.reviews.reviewCount.toString(),
        bestRating: (product.reviews.bestRating || 5).toString(),
        worstRating: (product.reviews.worstRating || 1).toString()
      }
    }

    return this.generateStructuredData('Product', productData)
  }

  // Generate sitemap entry
  generateSitemapEntry(url: string, lastmod?: string, changefreq?: string, priority?: number): string {
    const entry = {
      loc: `${this.baseUrl}${url}`,
      lastmod: lastmod || new Date().toISOString(),
      changefreq: changefreq || 'weekly',
      priority: priority || 0.8
    }

    return `
    <url>
      <loc>${entry.loc}</loc>
      <lastmod>${entry.lastmod}</lastmod>
      <changefreq>${entry.changefreq}</changefreq>
      <priority>${entry.priority}</priority>
    </url>`
  }

  // Generate complete sitemap
  generateSitemap(urls: Array<{url: string, lastmod?: string, changefreq?: string, priority?: number}>): string {
    const entries = urls.map(url => this.generateSitemapEntry(url.url, url.lastmod, url.changefreq, url.priority))

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${entries.join('\n')}
</urlset>`
  }

  // Generate robots.txt
  generateRobotsTxt(disallowedPaths: string[] = []): string {
    const disallowRules = disallowedPaths.map(path => `Disallow: ${path}`).join('\n')
    
    return `User-agent: *
${disallowRules || 'Allow: /'}

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/blog-sitemap.xml
Sitemap: ${this.baseUrl}/templates-sitemap.xml

# Crawl delay for bots
Crawl-delay: 1

# Block specific bots if needed
User-agent: BadBot
Disallow: /`
  }

  // Meta tags for specific pages
  generatePageMetaTags(config: SEOConfig): { [key: string]: string } {
    const tags: { [key: string]: string } = {}

    if (config.canonical) {
      tags.canonical = config.canonical
    }

    if (config.keywords && config.keywords.length > 0) {
      tags.keywords = config.keywords.join(', ')
    }

    if (config.noindex || config.nofollow) {
      const robots = []
      if (config.noindex) robots.push('noindex')
      if (config.nofollow) robots.push('nofollow')
      tags.robots = robots.join(', ')
    }

    // Add hreflang for internationalization
    if (config.alternateLanguages) {
      Object.entries(config.alternateLanguages).forEach(([lang, url]) => {
        tags[`hreflang-${lang}`] = url
      })
    }

    return tags
  }

  // Performance optimization hints
  generatePerformanceHints(): string[] {
    return [
      '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
      '<link rel="dns-prefetch" href="//cdn.webclone.pro">',
      '<link rel="preconnect" href="https://api.webclone.pro">',
      '<link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossorigin>',
      '<link rel="prefetch" href="/api/templates">',
      '<meta name="theme-color" content="#2563eb">',
      '<meta name="color-scheme" content="dark light">'
    ]
  }

  // Security headers for SEO
  generateSecurityHeaders(): { [key: string]: string } {
    return {
      'X-Robots-Tag': 'index, follow',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    }
  }
}

// Export singleton instance
export const seoManager = new SEOManager(process.env.NEXT_PUBLIC_BASE_URL)

// Helper functions for common use cases
export const generatePageSEO = (config: SEOConfig) => seoManager.generateMetadata(config)
export const generateOrganizationLD = () => seoManager.generateOrganizationSchema()
export const generateWebsiteLD = () => seoManager.generateWebSiteSchema()
export const generateBreadcrumbLD = (items: BreadcrumbItem[]) => seoManager.generateBreadcrumbSchema(items)
export const generateFAQLD = (faqs: FAQItem[]) => seoManager.generateFAQSchema(faqs)