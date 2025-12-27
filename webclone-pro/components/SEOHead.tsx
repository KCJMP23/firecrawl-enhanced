'use client'

import Head from 'next/head'
import { SEOConfig, seoManager } from '@/lib/seo'

interface SEOHeadProps {
  config: SEOConfig
  structuredData?: any[]
}

export default function SEOHead({ config, structuredData = [] }: SEOHeadProps) {
  const metadata = seoManager.generateMetadata(config)

  // Default structured data
  const defaultStructuredData = [
    seoManager.generateOrganizationSchema(),
    seoManager.generateWebSiteSchema(),
    seoManager.generateSoftwareApplicationSchema()
  ]

  const allStructuredData = [...defaultStructuredData, ...structuredData]

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metadata.title as string}</title>
      <meta name="description" content={metadata.description || ''} />
      <meta name="keywords" content={metadata.keywords || ''} />
      
      {/* Canonical URL */}
      {metadata.alternates?.canonical && (
        <link rel="canonical" href={metadata.alternates.canonical} />
      )}
      
      {/* Robots Meta */}
      <meta name="robots" content={`${metadata.robots?.index ? 'index' : 'noindex'}, ${metadata.robots?.follow ? 'follow' : 'nofollow'}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={metadata.openGraph?.title || ''} />
      <meta property="og:description" content={metadata.openGraph?.description || ''} />
      <meta property="og:url" content={metadata.openGraph?.url || ''} />
      <meta property="og:site_name" content={metadata.openGraph?.siteName || ''} />
      <meta property="og:type" content={metadata.openGraph?.type || 'website'} />
      <meta property="og:locale" content={metadata.openGraph?.locale || 'en_US'} />
      {metadata.openGraph?.images?.[0]?.url && (
        <>
          <meta property="og:image" content={metadata.openGraph.images[0].url} />
          <meta property="og:image:width" content={metadata.openGraph.images[0].width?.toString() || '1200'} />
          <meta property="og:image:height" content={metadata.openGraph.images[0].height?.toString() || '630'} />
          <meta property="og:image:alt" content={metadata.openGraph.images[0].alt || ''} />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={metadata.twitter?.card || 'summary_large_image'} />
      <meta name="twitter:title" content={metadata.twitter?.title || ''} />
      <meta name="twitter:description" content={metadata.twitter?.description || ''} />
      <meta name="twitter:creator" content={metadata.twitter?.creator || '@webclonepro'} />
      <meta name="twitter:site" content={metadata.twitter?.site || '@webclonepro'} />
      {metadata.twitter?.images?.[0] && (
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
      )}
      
      {/* Alternate Languages */}
      {metadata.alternates?.languages && Object.entries(metadata.alternates.languages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Site Verification */}
      {metadata.verification?.google && (
        <meta name="google-site-verification" content={metadata.verification.google} />
      )}
      {metadata.verification?.bing && (
        <meta name="msvalidate.01" content={metadata.verification.bing} />
      )}
      {metadata.verification?.yandex && (
        <meta name="yandex-verification" content={metadata.verification.yandex} />
      )}
      
      {/* Performance Hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//cdn.webclone.pro" />
      <link rel="preconnect" href="https://api.webclone.pro" />
      
      {/* Theme and Appearance */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="color-scheme" content="dark light" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* App-specific Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="WebClone Pro" />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: data }}
        />
      ))}
    </Head>
  )
}

// HOC for easy SEO implementation
export function withSEO<T extends object>(
  Component: React.ComponentType<T>,
  seoConfig: SEOConfig
) {
  return function SEOWrappedComponent(props: T) {
    return (
      <>
        <SEOHead config={seoConfig} />
        <Component {...props} />
      </>
    )
  }
}