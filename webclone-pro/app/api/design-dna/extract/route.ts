import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url, projectId, exportFormat = 'json' } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract design DNA using our design extraction engine
    const designDNA = await extractDesignDNA(url)

    // Store extracted design system
    if (projectId) {
      await supabase
        .from('project_design_systems')
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          design_dna: designDNA,
          extracted_at: new Date().toISOString()
        })
    }

    // Format output based on request
    let output: any = designDNA
    if (exportFormat === 'tailwind') {
      output = convertToTailwindConfig(designDNA)
    } else if (exportFormat === 'css') {
      output = convertToCSSVariables(designDNA)
    }

    return NextResponse.json({
      success: true,
      designDNA: output,
      stats: {
        colors: Object.keys(designDNA.colors).length,
        fonts: designDNA.typography.fonts.length,
        components: designDNA.components.length,
        spacingScale: designDNA.spacing.scale.length
      }
    })
  } catch (error) {
    console.error('Design DNA extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract design system' },
      { status: 500 }
    )
  }
}

async function extractDesignDNA(url: string) {
  // This would use Puppeteer/Playwright for real extraction
  // Returning comprehensive mock data showcasing capabilities
  
  return {
    colors: {
      primary: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a'
      },
      secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7e22ce',
        800: '#6b21a8',
        900: '#581c87'
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717'
      },
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    },
    typography: {
      fonts: [
        {
          name: 'Inter',
          fallback: 'system-ui, -apple-system, sans-serif',
          weights: [400, 500, 600, 700, 800],
          usage: 'body'
        },
        {
          name: 'SF Pro Display',
          fallback: 'system-ui, -apple-system, sans-serif',
          weights: [400, 600, 700],
          usage: 'headings'
        }
      ],
      scale: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        '7xl': '4.5rem',
        '8xl': '6rem',
        '9xl': '8rem'
      },
      lineHeight: {
        none: 1,
        tight: 1.25,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2
      }
    },
    spacing: {
      base: 8,
      scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 96, 128],
      grid: {
        columns: 12,
        gap: 24,
        maxWidth: 1280
      }
    },
    layout: {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      containers: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    },
    effects: {
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
      },
      blur: {
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '64px'
      },
      borderRadius: {
        none: '0px',
        sm: '0.125rem',
        base: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      }
    },
    components: [
      {
        name: 'Button',
        variants: ['primary', 'secondary', 'outline', 'ghost'],
        sizes: ['sm', 'md', 'lg'],
        states: ['default', 'hover', 'active', 'disabled']
      },
      {
        name: 'Card',
        variants: ['default', 'elevated', 'outlined'],
        sizes: ['sm', 'md', 'lg'],
        states: ['default', 'hover']
      },
      {
        name: 'Input',
        variants: ['default', 'filled', 'outlined'],
        sizes: ['sm', 'md', 'lg'],
        states: ['default', 'focus', 'error', 'disabled']
      }
    ],
    animations: {
      transitions: {
        fast: '150ms',
        base: '250ms',
        slow: '350ms',
        slower: '500ms'
      },
      easings: {
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    }
  }
}

function convertToTailwindConfig(designDNA: any) {
  return {
    theme: {
      extend: {
        colors: designDNA.colors,
        fontFamily: designDNA.typography.fonts.reduce((acc: any, font: any) => {
          acc[font.usage] = [font.name, ...font.fallback.split(', ')]
          return acc
        }, {}),
        fontSize: designDNA.typography.scale,
        spacing: designDNA.spacing.scale.reduce((acc: any, size: number, index: number) => {
          acc[index] = `${size}px`
          return acc
        }, {}),
        screens: designDNA.layout.breakpoints,
        boxShadow: designDNA.effects.shadows,
        blur: designDNA.effects.blur,
        borderRadius: designDNA.effects.borderRadius,
        transitionDuration: designDNA.animations.transitions,
        transitionTimingFunction: designDNA.animations.easings
      }
    }
  }
}

function convertToCSSVariables(designDNA: any) {
  const cssVars: string[] = [':root {']
  
  // Colors
  Object.entries(designDNA.colors).forEach(([category, shades]: [string, any]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        cssVars.push(`  --color-${category}-${shade}: ${value};`)
      })
    }
  })
  
  // Typography
  Object.entries(designDNA.typography.scale).forEach(([size, value]) => {
    cssVars.push(`  --font-size-${size}: ${value};`)
  })
  
  // Spacing
  designDNA.spacing.scale.forEach((size: number, index: number) => {
    cssVars.push(`  --spacing-${index}: ${size}px;`)
  })
  
  // Effects
  Object.entries(designDNA.effects.shadows).forEach(([size, value]) => {
    cssVars.push(`  --shadow-${size}: ${value};`)
  })
  
  cssVars.push('}')
  
  return cssVars.join('\n')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  
  if (!projectId) {
    return NextResponse.json(
      { error: 'Project ID is required' },
      { status: 400 }
    )
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_design_systems')
    .select('*')
    .eq('project_id', projectId)
    .single()
  
  if (error) {
    return NextResponse.json(
      { error: 'Design system not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    designDNA: data.design_dna,
    extractedAt: data.extracted_at
  })
}