import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { seoManager } from '@/lib/seo'
import { PageErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

// Enhanced metadata with SEO optimizations
export const metadata: Metadata = seoManager.generateMetadata({
  title: 'WebClone Pro 2026 - AI-Native Website Cloning Platform',
  description: 'Transform any website into a customizable, AI-enhanced clone. Build, modify, and deploy with cutting-edge AI tools. Start your next project in minutes.',
  keywords: [
    'website cloning',
    'AI website builder', 
    'website generator',
    'web development',
    'AI automation',
    'website creation',
    'template marketplace',
    'web scraping',
    'site builder',
    'developer tools'
  ],
  ogImage: '/images/og-hero.jpg',
  structuredData: [
    seoManager.generateOrganizationSchema(),
    seoManager.generateWebSiteSchema(),
    seoManager.generateSoftwareApplicationSchema()
  ]
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' }
  ],
  colorScheme: 'dark light'
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdn.webclone.pro" />
        <link rel="dns-prefetch" href="//api.webclone.pro" />
        
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.webclone.pro" />
        
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons and app icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png" />
        
        {/* Apple touch icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-icon-144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-icon-120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-icon-114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-icon-76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-icon-72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-icon-60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-icon-57.png" />
        
        {/* Microsoft tiles */}
        <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        
        {/* Browser configuration */}
        <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WebClone Pro" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()" />
        
        {/* Performance hints */}
        <meta name="google" content="notranslate" />
        
        {/* Structured data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seoManager.generateOrganizationSchema()
          }}
        />
        
        {/* Structured data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seoManager.generateWebSiteSchema()
          }}
        />
        
        {/* Structured data - Software Application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seoManager.generateSoftwareApplicationSchema()
          }}
        />
      </head>
      <body className={`${inter.className} antialiased bg-black text-white`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          {/* Skip to main content for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Skip to main content
          </a>
          
          {/* Main content wrapper */}
          <div id="main-content" className="min-h-screen">
            <PageErrorBoundary>
              {children}
            </PageErrorBoundary>
          </div>
          
          {/* Prefetch critical pages */}
          <link rel="prefetch" href="/dashboard" />
          <link rel="prefetch" href="/templates" />
          <link rel="prefetch" href="/pricing" />
          
          {/* Service worker registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator && typeof window !== 'undefined') {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    }, function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    });
                  });
                }
              `
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}