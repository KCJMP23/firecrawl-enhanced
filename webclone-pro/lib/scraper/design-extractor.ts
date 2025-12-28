/**
 * Design System Extraction Service
 * Extracts design patterns, not content - for ethical remixing
 */

import { chromium, Page, Browser } from 'playwright'

export interface DesignSystem {
  colors: ColorPalette
  typography: Typography
  spacing: SpacingSystem
  layout: LayoutPatterns
  animations: AnimationStyles
  components: ComponentPatterns
  images: ImageStyles
  shadows: ShadowSystem
  borders: BorderSystem
}

export interface ColorPalette {
  primary: string[]
  secondary: string[]
  neutral: string[]
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }
  gradients: string[]
}

export interface Typography {
  fontFamilies: string[]
  fontSizes: string[]
  fontWeights: string[]
  lineHeights: string[]
  letterSpacings: string[]
  headingStyles: Record<string, any>
  bodyStyles: Record<string, any>
}

export interface SpacingSystem {
  base: number
  scale: number[]
  containerPadding: string[]
  sectionSpacing: string[]
  componentSpacing: string[]
}

export interface LayoutPatterns {
  gridSystems: string[]
  flexPatterns: string[]
  maxWidths: string[]
  breakpoints: Record<string, string>
  aspectRatios: string[]
}

export interface AnimationStyles {
  transitions: string[]
  durations: string[]
  easings: string[]
  keyframes: Record<string, any>
  scrollAnimations: any[]
}

export interface ComponentPatterns {
  buttons: ComponentStyle[]
  cards: ComponentStyle[]
  navigation: ComponentStyle[]
  forms: ComponentStyle[]
  modals: ComponentStyle[]
}

export interface ComponentStyle {
  name: string
  styles: Record<string, any>
  variants: string[]
  states: string[]
}

export interface ImageStyles {
  aspectRatios: string[]
  objectFits: string[]
  filters: string[]
  overlays: string[]
}

export interface ShadowSystem {
  elevations: string[]
  colors: string[]
  spreads: string[]
}

export interface BorderSystem {
  widths: string[]
  styles: string[]
  radii: string[]
  colors: string[]
}

export class DesignExtractor {
  private browser: Browser | null = null
  private page: Page | null = null

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    this.page = await this.browser.newPage()
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }

  async extract(url: string): Promise<DesignSystem> {
    if (!this.page) {
      await this.init()
    }

    console.log(`📊 Extracting design system from: ${url}`)
    await this.page!.goto(url, { waitUntil: 'networkidle' })

    // Extract all design tokens
    const designSystem = await this.page!.evaluate(() => {
      // Helper functions
      const getComputedStyles = (element: Element) => {
        return window.getComputedStyle(element)
      }

      const extractColors = () => {
        const colors = new Set<string>()
        const elements = document.querySelectorAll('*')
        
        elements.forEach(el => {
          const styles = getComputedStyles(el)
          
          // Background colors
          const bg = styles.backgroundColor
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            colors.add(bg)
          }
          
          // Text colors
          const color = styles.color
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            colors.add(color)
          }
          
          // Border colors
          const borderColor = styles.borderColor
          if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
            colors.add(borderColor)
          }
        })
        
        return Array.from(colors)
      }

      const extractTypography = () => {
        const fonts = new Set<string>()
        const sizes = new Set<string>()
        const weights = new Set<string>()
        const lineHeights = new Set<string>()
        const letterSpacings = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyles(el)
          
          if (styles.fontFamily) fonts.add(styles.fontFamily)
          if (styles.fontSize) sizes.add(styles.fontSize)
          if (styles.fontWeight) weights.add(styles.fontWeight)
          if (styles.lineHeight) lineHeights.add(styles.lineHeight)
          if (styles.letterSpacing) letterSpacings.add(styles.letterSpacing)
        })
        
        return {
          fontFamilies: Array.from(fonts),
          fontSizes: Array.from(sizes).sort((a, b) => parseFloat(a) - parseFloat(b)),
          fontWeights: Array.from(weights).sort((a, b) => parseInt(a) - parseInt(b)),
          lineHeights: Array.from(lineHeights),
          letterSpacings: Array.from(letterSpacings),
          headingStyles: {},
          bodyStyles: {}
        }
      }

      const extractSpacing = () => {
        const paddings = new Set<string>()
        const margins = new Set<string>()
        const gaps = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyles(el)
          
          if (styles.padding) paddings.add(styles.padding)
          if (styles.margin) margins.add(styles.margin)
          if (styles.gap) gaps.add(styles.gap)
        })
        
        return {
          base: 8,
          scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80],
          containerPadding: Array.from(paddings),
          sectionSpacing: Array.from(margins),
          componentSpacing: Array.from(gaps)
        }
      }

      const extractLayout = () => {
        const displays = new Set<string>()
        const grids = new Set<string>()
        const flexs = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyles(el)
          
          if (styles.display) displays.add(styles.display)
          if (styles.gridTemplateColumns) grids.add(styles.gridTemplateColumns)
          if (styles.flexDirection) flexs.add(styles.flexDirection)
        })
        
        return {
          gridSystems: Array.from(grids),
          flexPatterns: Array.from(flexs),
          maxWidths: ['640px', '768px', '1024px', '1280px', '1536px'],
          breakpoints: {
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px'
          },
          aspectRatios: ['1:1', '4:3', '16:9', '21:9']
        }
      }

      const extractAnimations = () => {
        const transitions = new Set<string>()
        const transforms = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyles(el)
          
          if (styles.transition) transitions.add(styles.transition)
          if (styles.transform && styles.transform !== 'none') {
            transforms.add(styles.transform)
          }
        })
        
        return {
          transitions: Array.from(transitions),
          durations: ['150ms', '200ms', '300ms', '500ms', '700ms', '1000ms'],
          easings: ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'],
          keyframes: {},
          scrollAnimations: []
        }
      }

      const extractShadows = () => {
        const shadows = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const styles = getComputedStyles(el)
          
          if (styles.boxShadow && styles.boxShadow !== 'none') {
            shadows.add(styles.boxShadow)
          }
        })
        
        return {
          elevations: Array.from(shadows),
          colors: [],
          spreads: []
        }
      }

      const extractBorders = () => {
        const widths = new Set<string>()
        const radii = new Set<string>()
        const styles = new Set<string>()
        
        document.querySelectorAll('*').forEach(el => {
          const computed = getComputedStyles(el)
          
          if (computed.borderWidth) widths.add(computed.borderWidth)
          if (computed.borderRadius) radii.add(computed.borderRadius)
          if (computed.borderStyle) styles.add(computed.borderStyle)
        })
        
        return {
          widths: Array.from(widths),
          styles: Array.from(styles),
          radii: Array.from(radii),
          colors: []
        }
      }

      const extractComponents = () => {
        // Extract button patterns
        const buttons = Array.from(document.querySelectorAll('button, [role="button"], .btn, .button'))
          .slice(0, 5)
          .map((el, i) => ({
            name: `Button-${i + 1}`,
            styles: {
              padding: getComputedStyles(el).padding,
              borderRadius: getComputedStyles(el).borderRadius,
              fontSize: getComputedStyles(el).fontSize,
              fontWeight: getComputedStyles(el).fontWeight
            },
            variants: [],
            states: ['default', 'hover', 'active', 'disabled']
          }))

        // Extract card patterns
        const cards = Array.from(document.querySelectorAll('.card, [class*="card"], article'))
          .slice(0, 5)
          .map((el, i) => ({
            name: `Card-${i + 1}`,
            styles: {
              padding: getComputedStyles(el).padding,
              borderRadius: getComputedStyles(el).borderRadius,
              boxShadow: getComputedStyles(el).boxShadow
            },
            variants: [],
            states: []
          }))

        return {
          buttons,
          cards,
          navigation: [],
          forms: [],
          modals: []
        }
      }

      // Extract all design tokens
      const colors = extractColors()
      const colorPalette: ColorPalette = {
        primary: colors.slice(0, 5),
        secondary: colors.slice(5, 10),
        neutral: colors.filter(c => c.includes('rgb')),
        semantic: {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        },
        gradients: []
      }

      return {
        colors: colorPalette,
        typography: extractTypography(),
        spacing: extractSpacing(),
        layout: extractLayout(),
        animations: extractAnimations(),
        components: extractComponents(),
        images: {
          aspectRatios: ['1:1', '4:3', '16:9'],
          objectFits: ['cover', 'contain', 'fill'],
          filters: [],
          overlays: []
        },
        shadows: extractShadows(),
        borders: extractBorders()
      }
    })

    console.log('✅ Design system extraction complete')
    return designSystem as DesignSystem
  }

  async extractScreenshot(url: string): Promise<string> {
    if (!this.page) {
      await this.init()
    }

    await this.page!.goto(url, { waitUntil: 'networkidle' })
    const screenshot = await this.page!.screenshot({ 
      type: 'png',
      fullPage: false 
    })
    
    return `data:image/png;base64,${screenshot.toString('base64')}`
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}

// Export singleton instance
export const designExtractor = new DesignExtractor()