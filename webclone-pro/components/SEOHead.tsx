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
      <meta name="keywords" content={Array.isArray(metadata.keywords) ? metadata.keywords.join(', ') : (metadata.keywords || '')} />
      
      {/* Canonical URL */}
      {metadata.alternates?.canonical && (
        <link rel="canonical" href={
          typeof metadata.alternates.canonical === 'string' 
            ? metadata.alternates.canonical 
            : metadata.alternates.canonical.toString()
        } />
      )}
      
      {/* Robots Meta */}
      <meta name="robots" content={
        typeof metadata.robots === 'string' 
          ? metadata.robots 
          : `${metadata.robots?.index ? 'index' : 'noindex'}, ${metadata.robots?.follow ? 'follow' : 'nofollow'}`
      } />
      
      {/* Open Graph */}
      <meta property="og:title" content={String(metadata.openGraph?.title || '')} />
      <meta property="og:description" content={String(metadata.openGraph?.description || '')} />
      <meta property="og:url" content={String(metadata.openGraph?.url || '')} />
      <meta property="og:site_name" content={String(metadata.openGraph?.siteName || '')} />
      <meta property="og:type" content={(metadata.openGraph as any)?.type || 'website'} />
      <meta property="og:locale" content={(metadata.openGraph as any)?.locale || 'en_US'} />
      {(() => {
        const images = metadata.openGraph?.images;
        const firstImage = Array.isArray(images) ? images[0] : images;
        if (!firstImage) return null;
        
        return (
          <>
            <meta property="og:image" content={String((firstImage as any).url || '')} />
            <meta property="og:image:width" content={String((firstImage as any).width || '1200')} />
            <meta property="og:image:height" content={String((firstImage as any).height || '630')} />
            <meta property="og:image:alt" content={String((firstImage as any).alt || '')} />
          </>
        );
      })()}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={String((metadata.twitter as any)?.card || 'summary_large_image')} />
      <meta name="twitter:title" content={String(metadata.twitter?.title || '')} />
      <meta name="twitter:description" content={String(metadata.twitter?.description || '')} />
      <meta name="twitter:creator" content={metadata.twitter?.creator || '@webclonepro'} />
      <meta name="twitter:site" content={metadata.twitter?.site || '@webclonepro'} />
      {(() => {
        const twitterImages = metadata.twitter?.images;
        const firstImage = Array.isArray(twitterImages) ? twitterImages[0] : twitterImages;
        if (!firstImage) return null;
        return <meta name="twitter:image" content={String(firstImage)} />;
      })()}
      
      {/* Alternate Languages */}
      {metadata.alternates?.languages && Object.entries(metadata.alternates.languages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={String(url)} />
      ))}
      
      {/* Site Verification */}
      {metadata.verification?.google && (
        <meta name="google-site-verification" content={
          Array.isArray(metadata.verification.google) 
            ? metadata.verification.google.join(',') 
            : String(metadata.verification.google)
        } />
      )}
      {(metadata.verification as any)?.bing && (
        <meta name="msvalidate.01" content={
          Array.isArray((metadata.verification as any).bing) 
            ? (metadata.verification as any).bing.join(',') 
            : String((metadata.verification as any).bing)
        } />
      )}
      {(metadata.verification as any)?.yandex && (
        <meta name="yandex-verification" content={
          Array.isArray((metadata.verification as any).yandex) 
            ? (metadata.verification as any).yandex.join(',') 
            : String((metadata.verification as any).yandex)
        } />
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