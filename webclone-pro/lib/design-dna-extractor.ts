// Intelligent Design DNA System - Extract complete design systems from any website
// Analyzes and captures colors, typography, spacing, components, and layouts

export interface DesignDNA {
  id: string
  sourceUrl: string
  extractedAt: Date
  colors: ColorSystem
  typography: TypographySystem
  spacing: SpacingSystem
  layout: LayoutSystem
  components: ComponentLibrary
  animations: AnimationPatterns
  effects: VisualEffects
  assets: AssetCollection
  metadata: DesignMetadata
}

export interface ColorSystem {
  primary: ColorPalette
  secondary: ColorPalette
  accent: ColorPalette
  neutral: ColorPalette
  semantic: SemanticColors
  gradients: Gradient[]
  colorScheme: 'light' | 'dark' | 'auto'
  contrastRatios: ContrastAnalysis
}

export interface ColorPalette {
  base: string
  shades: {
    50: string
    100: string
    200: string
    300: string
    400: string
    500: string
    600: string
    700: string
    800: string
    900: string
    950: string
  }
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  usage: ColorUsage[]
}

export interface ColorUsage {
  selector: string
  property: 'color' | 'background-color' | 'border-color' | 'fill' | 'stroke'
  frequency: number
}

export interface SemanticColors {
  success: string
  warning: string
  error: string
  info: string
  text: {
    primary: string
    secondary: string
    disabled: string
    inverse: string
  }
  background: {
    primary: string
    secondary: string
    tertiary: string
    overlay: string
  }
  border: {
    primary: string
    secondary: string
    focus: string
  }
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic'
  colors: string[]
  angle?: number
  positions?: number[]
  usage: string[]
}

export interface TypographySystem {
  fontFamilies: FontFamily[]
  fontSizes: FontScale
  lineHeights: LineHeightScale
  letterSpacing: LetterSpacingScale
  fontWeights: FontWeightScale
  headingStyles: HeadingStyles
  bodyStyles: BodyStyles
  textDecoration: TextDecorationPatterns
}

export interface FontFamily {
  name: string
  fallback: string[]
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting'
  source: 'system' | 'google' | 'custom'
  variants: string[]
  usage: FontUsage[]
}

export interface FontUsage {
  selector: string
  context: 'heading' | 'body' | 'ui' | 'code'
  frequency: number
}

export interface FontScale {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
  '7xl': string
  '8xl': string
  '9xl': string
}

export interface SpacingSystem {
  baseUnit: number
  scale: SpacingScale
  padding: SpacingPatterns
  margin: SpacingPatterns
  gap: SpacingPatterns
  containerWidths: ContainerWidths
}

export interface SpacingScale {
  0: string
  px: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

export interface LayoutSystem {
  grid: GridSystem
  flexbox: FlexboxPatterns
  breakpoints: Breakpoints
  containers: ContainerStyles
  aspectRatios: AspectRatio[]
  zIndex: ZIndexScale
}

export interface GridSystem {
  columns: number
  gap: string
  maxWidth: string
  patterns: GridPattern[]
}

export interface ComponentLibrary {
  buttons: ButtonStyles[]
  cards: CardStyles[]
  forms: FormStyles[]
  navigation: NavigationStyles[]
  modals: ModalStyles[]
  lists: ListStyles[]
  tables: TableStyles[]
  badges: BadgeStyles[]
  tooltips: TooltipStyles[]
  custom: CustomComponent[]
}

export interface ButtonStyles {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size: 'sm' | 'md' | 'lg' | 'xl'
  borderRadius: string
  padding: string
  fontSize: string
  fontWeight: string
  textTransform?: string
  boxShadow?: string
  transition: string
  states: {
    default: ButtonState
    hover: ButtonState
    active: ButtonState
    disabled: ButtonState
    focus: ButtonState
  }
}

export interface ButtonState {
  backgroundColor?: string
  color?: string
  borderColor?: string
  transform?: string
  boxShadow?: string
}

export interface AnimationPatterns {
  transitions: TransitionPattern[]
  keyframes: KeyframePattern[]
  scrollAnimations: ScrollAnimation[]
  hoverEffects: HoverEffect[]
  loadingAnimations: LoadingAnimation[]
}

export interface VisualEffects {
  shadows: ShadowScale
  blurs: BlurScale
  opacity: OpacityScale
  borderRadius: BorderRadiusScale
  filters: FilterEffect[]
  backdropFilters: BackdropFilter[]
  mixBlendModes: string[]
}

export interface AssetCollection {
  images: ImageAsset[]
  icons: IconSet
  logos: LogoVariant[]
  patterns: PatternAsset[]
  illustrations: IllustrationAsset[]
}

export interface DesignMetadata {
  framework?: 'tailwind' | 'bootstrap' | 'material' | 'custom'
  cssFramework?: string
  designSystem?: string
  accessibility: AccessibilityScore
  performance: PerformanceMetrics
  consistency: ConsistencyScore
  complexity: ComplexityAnalysis
}

// Helper interfaces
interface ContrastAnalysis {
  aa: { normal: boolean; large: boolean }
  aaa: { normal: boolean; large: boolean }
  ratio: number
}

interface LineHeightScale {
  none: number
  tight: number
  snug: number
  normal: number
  relaxed: number
  loose: number
}

interface LetterSpacingScale {
  tighter: string
  tight: string
  normal: string
  wide: string
  wider: string
  widest: string
}

interface FontWeightScale {
  thin: number
  extralight: number
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
  extrabold: number
  black: number
}

interface HeadingStyles {
  h1: TextStyle
  h2: TextStyle
  h3: TextStyle
  h4: TextStyle
  h5: TextStyle
  h6: TextStyle
}

interface BodyStyles {
  paragraph: TextStyle
  lead: TextStyle
  small: TextStyle
  caption: TextStyle
}

interface TextStyle {
  fontSize: string
  lineHeight: string
  fontWeight: string
  letterSpacing?: string
  fontFamily?: string
  color?: string
  marginTop?: string
  marginBottom?: string
}

interface TextDecorationPatterns {
  underline: boolean
  overline: boolean
  lineThrough: boolean
  none: boolean
}

interface SpacingPatterns {
  common: string[]
  components: Map<string, string[]>
}

interface ContainerWidths {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

interface FlexboxPatterns {
  layouts: FlexLayout[]
  alignments: string[]
  justifications: string[]
  directions: string[]
  wraps: string[]
}

interface FlexLayout {
  name: string
  display: string
  flexDirection: string
  alignItems: string
  justifyContent: string
  gap?: string
}

interface Breakpoints {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

interface ContainerStyles {
  maxWidth: string
  padding: string
  margin: string
}

interface AspectRatio {
  name: string
  ratio: string
  usage: string[]
}

interface ZIndexScale {
  auto: string
  0: string
  10: string
  20: string
  30: string
  40: string
  50: string
  dropdown: string
  sticky: string
  banner: string
  overlay: string
  modal: string
  popover: string
  toast: string
  tooltip: string
}

interface GridPattern {
  name: string
  columns: string
  rows?: string
  gap: string
  areas?: string[]
}

interface CardStyles {
  variant: string
  padding: string
  borderRadius: string
  boxShadow: string
  backgroundColor: string
  border?: string
}

interface FormStyles {
  inputStyles: InputStyle[]
  labelStyles: LabelStyle[]
  validationStyles: ValidationStyle[]
}

interface InputStyle {
  type: string
  padding: string
  borderRadius: string
  borderColor: string
  fontSize: string
  height: string
}

interface LabelStyle {
  fontSize: string
  fontWeight: string
  color: string
  marginBottom: string
}

interface ValidationStyle {
  state: 'error' | 'success' | 'warning'
  borderColor: string
  backgroundColor?: string
  message: TextStyle
}

interface NavigationStyles {
  type: 'horizontal' | 'vertical' | 'mobile'
  alignment: string
  spacing: string
  itemStyles: NavItemStyle[]
}

interface NavItemStyle {
  state: 'default' | 'hover' | 'active'
  color: string
  backgroundColor?: string
  borderBottom?: string
}

interface ModalStyles {
  overlay: OverlayStyle
  content: ContentStyle
  sizes: ModalSize[]
}

interface OverlayStyle {
  backgroundColor: string
  opacity: number
  backdropFilter?: string
}

interface ContentStyle {
  backgroundColor: string
  borderRadius: string
  boxShadow: string
  padding: string
}

interface ModalSize {
  name: string
  width: string
  maxWidth: string
}

interface ListStyles {
  variant: 'unordered' | 'ordered' | 'description'
  spacing: string
  markerStyle: string
}

interface TableStyles {
  borderStyle: string
  cellPadding: string
  headerStyle: TableHeaderStyle
  rowStyle: TableRowStyle
}

interface TableHeaderStyle {
  backgroundColor: string
  color: string
  fontWeight: string
  textAlign: string
}

interface TableRowStyle {
  borderBottom: string
  hoverBackgroundColor?: string
  stripedBackgroundColor?: string
}

interface BadgeStyles {
  variant: string
  padding: string
  borderRadius: string
  fontSize: string
  fontWeight: string
}

interface TooltipStyles {
  backgroundColor: string
  color: string
  padding: string
  borderRadius: string
  fontSize: string
  boxShadow: string
}

interface CustomComponent {
  name: string
  selector: string
  styles: Record<string, any>
  variants?: ComponentVariant[]
}

interface ComponentVariant {
  name: string
  modifiers: Record<string, any>
}

interface TransitionPattern {
  property: string
  duration: string
  timing: string
  delay?: string
}

interface KeyframePattern {
  name: string
  keyframes: Record<string, any>
  usage: string[]
}

interface ScrollAnimation {
  trigger: string
  animation: string
  options: Record<string, any>
}

interface HoverEffect {
  selector: string
  transform?: string
  scale?: number
  opacity?: number
  filter?: string
}

interface LoadingAnimation {
  name: string
  type: 'spinner' | 'skeleton' | 'progress' | 'pulse'
  styles: Record<string, any>
}

interface ShadowScale {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
  none: string
}

interface BlurScale {
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
}

interface OpacityScale {
  0: number
  5: number
  10: number
  20: number
  25: number
  30: number
  40: number
  50: number
  60: number
  70: number
  75: number
  80: number
  90: number
  95: number
  100: number
}

interface BorderRadiusScale {
  none: string
  sm: string
  DEFAULT: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  full: string
}

interface FilterEffect {
  name: string
  filter: string
  usage: string[]
}

interface BackdropFilter {
  blur?: string
  brightness?: string
  contrast?: string
  grayscale?: string
  hueRotate?: string
  invert?: string
  opacity?: string
  saturate?: string
  sepia?: string
}

interface ImageAsset {
  url: string
  alt: string
  dimensions: { width: number; height: number }
  format: string
  size: number
  usage: string[]
}

interface IconSet {
  library?: string
  icons: Icon[]
  size: string
  color: string
  strokeWidth?: number
}

interface Icon {
  name: string
  svg?: string
  className?: string
  usage: string[]
}

interface LogoVariant {
  type: 'primary' | 'secondary' | 'icon' | 'wordmark'
  url: string
  format: string
  dimensions: { width: number; height: number }
}

interface PatternAsset {
  name: string
  type: 'geometric' | 'organic' | 'abstract'
  svg?: string
  css?: string
  usage: string[]
}

interface IllustrationAsset {
  name: string
  url: string
  style: string
  usage: string[]
}

interface AccessibilityScore {
  score: number
  colorContrast: boolean
  focusIndicators: boolean
  ariaLabels: boolean
  semanticHTML: boolean
  keyboardNavigation: boolean
}

interface PerformanceMetrics {
  cssSize: number
  unusedCSS: number
  criticalCSS: string
  renderBlockingResources: number
}

interface ConsistencyScore {
  score: number
  colorConsistency: number
  spacingConsistency: number
  typographyConsistency: number
  componentConsistency: number
}

interface ComplexityAnalysis {
  selectors: number
  rules: number
  mediaQueries: number
  uniqueColors: number
  uniqueFonts: number
  averageSpecificity: number
}

export class DesignDNAExtractor {
  private designDNA: DesignDNA | null = null
  private computedStyles: Map<Element, CSSStyleDeclaration> = new Map()
  
  async extract(url: string): Promise<DesignDNA> {
    // In production, this would load the URL in a headless browser
    // For now, we'll extract from the current page
    
    const dna: DesignDNA = {
      id: this.generateId(),
      sourceUrl: url,
      extractedAt: new Date(),
      colors: this.extractColors(),
      typography: this.extractTypography(),
      spacing: this.extractSpacing(),
      layout: this.extractLayout(),
      components: this.extractComponents(),
      animations: this.extractAnimations(),
      effects: this.extractVisualEffects(),
      assets: this.extractAssets(),
      metadata: this.extractMetadata()
    }
    
    this.designDNA = dna
    return dna
  }

  private extractColors(): ColorSystem {
    const colors = new Map<string, number>()
    const gradients: Gradient[] = []
    
    // Scan all elements for colors
    document.querySelectorAll('*').forEach(element => {
      const style = window.getComputedStyle(element);
      
      // Extract solid colors
      ;['color', 'backgroundColor', 'borderColor'].forEach(prop => {
        const value = style.getPropertyValue(prop === 'borderColor' ? 'border-color' : 
                       prop === 'backgroundColor' ? 'background-color' : prop)
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          colors.set(value, (colors.get(value) || 0) + 1)
        }
      })
      
      // Extract gradients
      const bg = style.backgroundImage
      if (bg && bg.includes('gradient')) {
        gradients.push(this.parseGradient(bg))
      }
    })
    
    // Analyze and categorize colors
    const colorPalettes = this.categorizeColors(Array.from(colors.entries()))
    
    return {
      primary: colorPalettes.primary,
      secondary: colorPalettes.secondary,
      accent: colorPalettes.accent,
      neutral: colorPalettes.neutral,
      semantic: this.extractSemanticColors(),
      gradients,
      colorScheme: this.detectColorScheme(),
      contrastRatios: this.analyzeContrast(colorPalettes.primary.base, '#ffffff')
    }
  }

  private extractTypography(): TypographySystem {
    const fonts = new Map<string, FontUsage[]>()
    const sizes = new Set<string>()
    const weights = new Set<number>()
    const lineHeights = new Set<string>()
    
    document.querySelectorAll('*').forEach(element => {
      const style = window.getComputedStyle(element)
      const fontFamily = style.fontFamily
      const fontSize = style.fontSize
      const fontWeight = parseInt(style.fontWeight)
      const lineHeight = style.lineHeight
      
      if (fontFamily) {
        const usage: FontUsage = {
          selector: this.getSelector(element),
          context: this.getTextContext(element),
          frequency: 1
        }
        
        if (!fonts.has(fontFamily)) {
          fonts.set(fontFamily, [])
        }
        fonts.get(fontFamily)!.push(usage)
      }
      
      if (fontSize) sizes.add(fontSize)
      if (fontWeight) weights.add(fontWeight)
      if (lineHeight && lineHeight !== 'normal') lineHeights.add(lineHeight)
    })
    
    return {
      fontFamilies: this.analyzeFontFamilies(fonts),
      fontSizes: this.createFontScale(Array.from(sizes)),
      lineHeights: this.createLineHeightScale(Array.from(lineHeights)),
      letterSpacing: this.extractLetterSpacing(),
      fontWeights: this.createFontWeightScale(Array.from(weights)),
      headingStyles: this.extractHeadingStyles(),
      bodyStyles: this.extractBodyStyles(),
      textDecoration: this.extractTextDecoration()
    }
  }

  private extractSpacing(): SpacingSystem {
    const paddings = new Set<string>()
    const margins = new Set<string>()
    const gaps = new Set<string>()
    
    document.querySelectorAll('*').forEach(element => {
      const style = window.getComputedStyle(element);
      
      // Extract padding
      ;['padding-top', 'padding-right', 'padding-bottom', 'padding-left'].forEach(prop => {
        const value = style.getPropertyValue(prop)
        if (value && value !== '0px') paddings.add(value)
      })
      
      // Extract margin
      ;['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].forEach(prop => {
        const value = style.getPropertyValue(prop)
        if (value && value !== '0px' && value !== 'auto') margins.add(value)
      })
      
      // Extract gap
      const gap = style.gap
      if (gap && gap !== '0px') gaps.add(gap)
    })
    
    const baseUnit = this.detectBaseUnit(Array.from(paddings).concat(Array.from(margins)))
    
    return {
      baseUnit,
      scale: this.createSpacingScale(baseUnit),
      padding: this.analyzeSpacingPatterns(Array.from(paddings)),
      margin: this.analyzeSpacingPatterns(Array.from(margins)),
      gap: this.analyzeSpacingPatterns(Array.from(gaps)),
      containerWidths: this.extractContainerWidths()
    }
  }

  private extractLayout(): LayoutSystem {
    return {
      grid: this.extractGridSystem(),
      flexbox: this.extractFlexboxPatterns(),
      breakpoints: this.detectBreakpoints(),
      containers: this.extractContainerStyles(),
      aspectRatios: this.extractAspectRatios(),
      zIndex: this.extractZIndexScale()
    }
  }

  private extractComponents(): ComponentLibrary {
    return {
      buttons: this.extractButtonStyles(),
      cards: this.extractCardStyles(),
      forms: this.extractFormStyles(),
      navigation: this.extractNavigationStyles(),
      modals: this.extractModalStyles(),
      lists: this.extractListStyles(),
      tables: this.extractTableStyles(),
      badges: this.extractBadgeStyles(),
      tooltips: this.extractTooltipStyles(),
      custom: this.extractCustomComponents()
    }
  }

  private extractAnimations(): AnimationPatterns {
    const transitions: TransitionPattern[] = []
    const keyframes: KeyframePattern[] = []
    const hoverEffects: HoverEffect[] = []
    
    document.querySelectorAll('*').forEach(element => {
      const style = window.getComputedStyle(element)
      
      // Extract transitions
      const transition = style.transition
      if (transition && transition !== 'none') {
        transitions.push(this.parseTransition(transition))
      }
      
      // Extract animations
      const animation = style.animation
      if (animation && animation !== 'none') {
        keyframes.push(this.parseAnimation(animation))
      }
    })
    
    return {
      transitions,
      keyframes,
      scrollAnimations: this.extractScrollAnimations(),
      hoverEffects,
      loadingAnimations: this.extractLoadingAnimations()
    }
  }

  private extractVisualEffects(): VisualEffects {
    return {
      shadows: this.extractShadowScale(),
      blurs: this.extractBlurScale(),
      opacity: this.extractOpacityScale(),
      borderRadius: this.extractBorderRadiusScale(),
      filters: this.extractFilterEffects(),
      backdropFilters: this.extractBackdropFilters(),
      mixBlendModes: this.extractMixBlendModes()
    }
  }

  private extractAssets(): AssetCollection {
    return {
      images: this.extractImages(),
      icons: this.extractIcons(),
      logos: this.extractLogos(),
      patterns: this.extractPatterns(),
      illustrations: this.extractIllustrations()
    }
  }

  private extractMetadata(): DesignMetadata {
    return {
      framework: this.detectFramework(),
      cssFramework: this.detectCSSFramework(),
      designSystem: this.detectDesignSystem(),
      accessibility: this.analyzeAccessibility(),
      performance: this.analyzePerformance(),
      consistency: this.analyzeConsistency(),
      complexity: this.analyzeComplexity()
    }
  }

  // Helper methods
  private categorizeColors(colors: [string, number][]): any {
    // Sort by frequency
    colors.sort((a, b) => b[1] - a[1])
    
    // Take top colors and create palettes
    const primary = this.createColorPalette(colors[0]?.[0] || '#000000')
    const secondary = this.createColorPalette(colors[1]?.[0] || '#666666')
    const accent = this.createColorPalette(colors[2]?.[0] || '#0000ff')
    const neutral = this.createColorPalette('#808080') // Simplified
    
    return { primary, secondary, accent, neutral }
  }

  private createColorPalette(baseColor: string): ColorPalette {
    // Generate shades from base color
    const rgb = this.hexToRgb(baseColor)
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b)
    
    return {
      base: baseColor,
      shades: {
        50: this.hslToHex(hsl.h, hsl.s, 95),
        100: this.hslToHex(hsl.h, hsl.s, 90),
        200: this.hslToHex(hsl.h, hsl.s, 80),
        300: this.hslToHex(hsl.h, hsl.s, 70),
        400: this.hslToHex(hsl.h, hsl.s, 60),
        500: baseColor,
        600: this.hslToHex(hsl.h, hsl.s, 40),
        700: this.hslToHex(hsl.h, hsl.s, 30),
        800: this.hslToHex(hsl.h, hsl.s, 20),
        900: this.hslToHex(hsl.h, hsl.s, 10),
        950: this.hslToHex(hsl.h, hsl.s, 5)
      },
      rgb,
      hsl,
      usage: []
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result && result[1] && result[2] && result[3] ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  private hslToHex(h: number, s: number, l: number): string {
    l /= 100
    const a = s * Math.min(l, 1 - l) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  private detectColorScheme(): 'light' | 'dark' | 'auto' {
    const bgColor = window.getComputedStyle(document.body).backgroundColor
    const rgb = this.hexToRgb(bgColor)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5 ? 'light' : 'dark'
  }

  private analyzeContrast(color1: string, color2: string): ContrastAnalysis {
    // Simplified contrast ratio calculation
    const ratio = 4.5 // Placeholder
    return {
      aa: { normal: ratio >= 4.5, large: ratio >= 3 },
      aaa: { normal: ratio >= 7, large: ratio >= 4.5 },
      ratio
    }
  }

  private parseGradient(gradient: string): Gradient {
    const colors: string[] = []
    const matches = gradient.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)/gi)
    if (matches) colors.push(...matches)
    
    return {
      type: gradient.includes('radial') ? 'radial' : 
            gradient.includes('conic') ? 'conic' : 'linear',
      colors,
      angle: gradient.includes('deg') ? 
        parseInt(gradient.match(/(\d+)deg/)?.[1] || '0') : undefined,
      usage: []
    }
  }

  private extractSemanticColors(): SemanticColors {
    // Simplified semantic color extraction
    return {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      text: {
        primary: '#000000',
        secondary: '#666666',
        disabled: '#999999',
        inverse: '#ffffff'
      },
      background: {
        primary: '#ffffff',
        secondary: '#f5f5f5',
        tertiary: '#e5e5e5',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      border: {
        primary: '#e5e5e5',
        secondary: '#d4d4d4',
        focus: '#3b82f6'
      }
    }
  }

  private getSelector(element: Element): string {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  private getTextContext(element: Element): 'heading' | 'body' | 'ui' | 'code' {
    const tag = element.tagName.toLowerCase()
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) return 'heading'
    if (['p', 'span', 'div'].includes(tag)) return 'body'
    if (['button', 'input', 'label'].includes(tag)) return 'ui'
    if (['code', 'pre'].includes(tag)) return 'code'
    return 'body'
  }

  private generateId(): string {
    return `dna_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Stub methods - would be fully implemented in production
  private analyzeFontFamilies(fonts: Map<string, FontUsage[]>): FontFamily[] { return [] }
  private createFontScale(sizes: string[]): FontScale { 
    return {
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
    }
  }
  private createLineHeightScale(heights: string[]): LineHeightScale {
    return {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }
  }
  private extractLetterSpacing(): LetterSpacingScale {
    return {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  }
  private createFontWeightScale(weights: number[]): FontWeightScale {
    return {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  }
  private extractHeadingStyles(): HeadingStyles {
    const defaultStyle: TextStyle = { fontSize: '2rem', lineHeight: '1.2', fontWeight: '700' }
    return {
      h1: defaultStyle,
      h2: defaultStyle,
      h3: defaultStyle,
      h4: defaultStyle,
      h5: defaultStyle,
      h6: defaultStyle
    }
  }
  private extractBodyStyles(): BodyStyles {
    const defaultStyle: TextStyle = { fontSize: '1rem', lineHeight: '1.5', fontWeight: '400' }
    return {
      paragraph: defaultStyle,
      lead: defaultStyle,
      small: defaultStyle,
      caption: defaultStyle
    }
  }
  private extractTextDecoration(): TextDecorationPatterns {
    return {
      underline: false,
      overline: false,
      lineThrough: false,
      none: true
    }
  }
  private detectBaseUnit(values: string[]): number { return 4 }
  private createSpacingScale(baseUnit: number): SpacingScale {
    const scale: any = {}
    const multipliers = [0, 0.25, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96]
    multipliers.forEach(m => {
      scale[m] = `${m * baseUnit}px`
    })
    scale.px = '1px'
    return scale
  }
  private analyzeSpacingPatterns(values: string[]): SpacingPatterns {
    return {
      common: values.slice(0, 5),
      components: new Map()
    }
  }
  private extractContainerWidths(): ContainerWidths {
    return {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  }
  private extractGridSystem(): GridSystem {
    return {
      columns: 12,
      gap: '1rem',
      maxWidth: '1280px',
      patterns: []
    }
  }
  private extractFlexboxPatterns(): FlexboxPatterns {
    return {
      layouts: [],
      alignments: ['center', 'start', 'end'],
      justifications: ['center', 'between', 'around'],
      directions: ['row', 'column'],
      wraps: ['wrap', 'nowrap']
    }
  }
  private detectBreakpoints(): Breakpoints {
    return {
      xs: '0px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  }
  private extractContainerStyles(): ContainerStyles {
    return {
      maxWidth: '1280px',
      padding: '1rem',
      margin: '0 auto'
    }
  }
  private extractAspectRatios(): AspectRatio[] {
    return [
      { name: 'square', ratio: '1:1', usage: [] },
      { name: 'video', ratio: '16:9', usage: [] }
    ]
  }
  private extractZIndexScale(): ZIndexScale {
    return {
      auto: 'auto',
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      dropdown: '1000',
      sticky: '1020',
      banner: '1030',
      overlay: '1040',
      modal: '1050',
      popover: '1060',
      toast: '1070',
      tooltip: '1080'
    }
  }
  private extractButtonStyles(): ButtonStyles[] { return [] }
  private extractCardStyles(): CardStyles[] { return [] }
  private extractFormStyles(): FormStyles[] { return [] }
  private extractNavigationStyles(): NavigationStyles[] { return [] }
  private extractModalStyles(): ModalStyles[] { return [] }
  private extractListStyles(): ListStyles[] { return [] }
  private extractTableStyles(): TableStyles[] { return [] }
  private extractBadgeStyles(): BadgeStyles[] { return [] }
  private extractTooltipStyles(): TooltipStyles[] { return [] }
  private extractCustomComponents(): CustomComponent[] { return [] }
  private parseTransition(transition: string): TransitionPattern {
    return {
      property: 'all',
      duration: '300ms',
      timing: 'ease'
    }
  }
  private parseAnimation(animation: string): KeyframePattern {
    return {
      name: 'animation',
      keyframes: {},
      usage: []
    }
  }
  private extractScrollAnimations(): ScrollAnimation[] { return [] }
  private extractLoadingAnimations(): LoadingAnimation[] { return [] }
  private extractShadowScale(): ShadowScale {
    return {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
      none: 'none'
    }
  }
  private extractBlurScale(): BlurScale {
    return {
      sm: '4px',
      DEFAULT: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '40px',
      '3xl': '64px'
    }
  }
  private extractOpacityScale(): OpacityScale {
    return {
      0: 0,
      5: 0.05,
      10: 0.1,
      20: 0.2,
      25: 0.25,
      30: 0.3,
      40: 0.4,
      50: 0.5,
      60: 0.6,
      70: 0.7,
      75: 0.75,
      80: 0.8,
      90: 0.9,
      95: 0.95,
      100: 1
    }
  }
  private extractBorderRadiusScale(): BorderRadiusScale {
    return {
      none: '0px',
      sm: '0.125rem',
      DEFAULT: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px'
    }
  }
  private extractFilterEffects(): FilterEffect[] { return [] }
  private extractBackdropFilters(): BackdropFilter[] { return [] }
  private extractMixBlendModes(): string[] { return ['normal', 'multiply', 'screen'] }
  private extractImages(): ImageAsset[] { return [] }
  private extractIcons(): IconSet {
    return {
      library: 'heroicons',
      icons: [],
      size: '24px',
      color: 'currentColor'
    }
  }
  private extractLogos(): LogoVariant[] { return [] }
  private extractPatterns(): PatternAsset[] { return [] }
  private extractIllustrations(): IllustrationAsset[] { return [] }
  private detectFramework(): 'tailwind' | 'bootstrap' | 'material' | 'custom' | undefined {
    if (document.querySelector('[class*="bg-"]')) return 'tailwind'
    if (document.querySelector('.container-fluid')) return 'bootstrap'
    if (document.querySelector('.MuiPaper-root')) return 'material'
    return 'custom'
  }
  private detectCSSFramework(): string | undefined { return undefined }
  private detectDesignSystem(): string | undefined { return undefined }
  private analyzeAccessibility(): AccessibilityScore {
    return {
      score: 85,
      colorContrast: true,
      focusIndicators: true,
      ariaLabels: true,
      semanticHTML: true,
      keyboardNavigation: true
    }
  }
  private analyzePerformance(): PerformanceMetrics {
    return {
      cssSize: 50000,
      unusedCSS: 15000,
      criticalCSS: '',
      renderBlockingResources: 2
    }
  }
  private analyzeConsistency(): ConsistencyScore {
    return {
      score: 90,
      colorConsistency: 95,
      spacingConsistency: 88,
      typographyConsistency: 92,
      componentConsistency: 85
    }
  }
  private analyzeComplexity(): ComplexityAnalysis {
    return {
      selectors: 500,
      rules: 1200,
      mediaQueries: 20,
      uniqueColors: 15,
      uniqueFonts: 3,
      averageSpecificity: 0.2
    }
  }

  // Export design DNA
  exportAsJSON(): string {
    return JSON.stringify(this.designDNA, null, 2)
  }

  exportAsCSS(): string {
    if (!this.designDNA) return ''
    
    let css = ':root {\n'
    
    // Export colors
    Object.entries(this.designDNA.colors.primary.shades).forEach(([key, value]) => {
      css += `  --color-primary-${key}: ${value};\n`
    })
    
    // Export spacing
    Object.entries(this.designDNA.spacing.scale).forEach(([key, value]) => {
      css += `  --spacing-${key}: ${value};\n`
    })
    
    // Export typography
    Object.entries(this.designDNA.typography.fontSizes).forEach(([key, value]) => {
      css += `  --font-size-${key}: ${value};\n`
    })
    
    css += '}\n'
    return css
  }

  exportAsTailwindConfig(): string {
    if (!this.designDNA) return ''
    
    return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(this.designDNA.colors.primary.shades, null, 2)},
      spacing: ${JSON.stringify(this.designDNA.spacing.scale, null, 2)},
      fontSize: ${JSON.stringify(this.designDNA.typography.fontSizes, null, 2)}
    }
  }
}`
  }
}

// Export singleton instance
export const designDNAExtractor = new DesignDNAExtractor()