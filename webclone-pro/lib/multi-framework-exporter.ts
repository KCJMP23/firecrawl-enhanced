// Multi-Framework Export System
// Exports cloned websites to any framework (React, Vue, Angular, Svelte, etc.)

import { ExtractedAnimation } from './animation-extractor'
import { DesignDNA } from './design-dna-extractor'

export type ExportFramework = 
  | 'react-tailwind'
  | 'react-styled'
  | 'react-css-modules'
  | 'next-tailwind'
  | 'next-styled'
  | 'vue-3'
  | 'vue-2'
  | 'nuxt-3'
  | 'angular'
  | 'svelte'
  | 'sveltekit'
  | 'solid'
  | 'qwik'
  | 'astro'
  | 'remix'
  | 'gatsby'
  | 'vanilla'
  | 'webcomponents'
  | 'lit'
  | 'alpine'
  | 'htmx'

export interface ExportOptions {
  framework: ExportFramework
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion' | 'vanilla-css' | 'sass'
  typescript: boolean
  testing: 'jest' | 'vitest' | 'cypress' | 'playwright' | 'none'
  stateManagement?: 'redux' | 'zustand' | 'mobx' | 'recoil' | 'pinia' | 'vuex' | 'none'
  componentLibrary?: 'mui' | 'antd' | 'chakra' | 'mantine' | 'shadcn' | 'daisyui' | 'none'
  buildTool?: 'vite' | 'webpack' | 'parcel' | 'rollup' | 'esbuild' | 'turbopack'
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun'
  optimization: {
    treeshaking: boolean
    codeSplitting: boolean
    lazyLoading: boolean
    imageOptimization: boolean
    minification: boolean
    compression: boolean
  }
}

export interface ExportedProject {
  framework: ExportFramework
  structure: FileStructure
  files: Map<string, FileContent>
  dependencies: Dependencies
  scripts: Scripts
  config: ConfigFiles
  documentation: Documentation
  deployment: DeploymentConfig
}

export interface FileStructure {
  src: {
    components: string[]
    pages?: string[]
    styles: string[]
    utils: string[]
    hooks?: string[]
    stores?: string[]
    api?: string[]
    assets: string[]
  }
  public?: string[]
  tests?: string[]
  config: string[]
}

export interface FileContent {
  path: string
  content: string
  type: 'component' | 'style' | 'script' | 'config' | 'asset' | 'test'
  language: 'typescript' | 'javascript' | 'css' | 'scss' | 'html' | 'json' | 'yaml'
}

export interface Dependencies {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  peerDependencies?: Record<string, string>
}

export interface Scripts {
  dev: string
  build: string
  start: string
  test?: string
  lint?: string
  format?: string
  preview?: string
}

export interface ConfigFiles {
  packageJson: object
  tsconfig?: object
  viteConfig?: object
  webpackConfig?: object
  eslintConfig?: object
  prettierConfig?: object
  tailwindConfig?: object
  postcssConfig?: object
}

export interface Documentation {
  readme: string
  apiDocs?: string
  componentDocs?: Map<string, string>
  setupGuide: string
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'docker' | 'static'
  config: object
  envVars: Record<string, string>
  buildCommand: string
  outputDir: string
}

export class MultiFrameworkExporter {
  private converters: Map<ExportFramework, FrameworkConverter>
  
  constructor() {
    this.converters = new Map()
    this.initializeConverters()
  }
  
  private initializeConverters() {
    // React converters
    this.converters.set('react-tailwind', new ReactTailwindConverter())
    this.converters.set('react-styled', new ReactStyledConverter())
    this.converters.set('next-tailwind', new NextTailwindConverter())
    
    // Vue converters
    this.converters.set('vue-3', new Vue3Converter())
    this.converters.set('nuxt-3', new Nuxt3Converter())
    
    // Other frameworks
    this.converters.set('angular', new AngularConverter())
    this.converters.set('svelte', new SvelteConverter())
    this.converters.set('solid', new SolidConverter())
    this.converters.set('qwik', new QwikConverter())
    this.converters.set('astro', new AstroConverter())
  }
  
  async export(
    html: string,
    styles: string,
    scripts: string,
    assets: Map<string, Blob>,
    options: ExportOptions,
    designDNA?: DesignDNA,
    animations?: ExtractedAnimation[]
  ): Promise<ExportedProject> {
    const converter = this.converters.get(options.framework)
    
    if (!converter) {
      throw new Error(`Unsupported framework: ${options.framework}`)
    }
    
    // Parse HTML into components
    const components = await this.parseComponents(html)
    
    // Convert styles
    const convertedStyles = await this.convertStyles(styles, options)
    
    // Convert scripts
    const convertedScripts = await this.convertScripts(scripts, options)
    
    // Generate project structure
    const project = await converter.convert({
      components,
      styles: convertedStyles,
      scripts: convertedScripts,
      assets,
      options,
      designDNA,
      animations
    })
    
    // Add optimization
    if (options.optimization) {
      await this.optimizeProject(project, options.optimization)
    }
    
    // Generate documentation
    project.documentation = await this.generateDocumentation(project, options)
    
    // Setup deployment config
    project.deployment = await this.setupDeployment(project, options)
    
    return project
  }
  
  private async parseComponents(html: string): Promise<Component[]> {
    const components: Component[] = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Extract reusable components
    const elements = doc.querySelectorAll('[data-component], header, footer, nav, main, section, article')
    
    for (const element of elements) {
      const component = await this.extractComponent(element)
      components.push(component)
    }
    
    return components
  }
  
  private async extractComponent(element: Element): Promise<Component> {
    const name = this.generateComponentName(element)
    const props = this.extractProps(element)
    const children = this.extractChildren(element)
    const events = this.extractEvents(element)
    
    return {
      name,
      html: element.outerHTML,
      props,
      children,
      events,
      styles: this.extractInlineStyles(element),
      dependencies: this.detectDependencies(element)
    }
  }
  
  private generateComponentName(element: Element): string {
    if (element.hasAttribute('data-component')) {
      return element.getAttribute('data-component')!
    }
    
    const tag = element.tagName.toLowerCase()
    const className = element.className.split(' ')[0]
    
    return this.toPascalCase(className || tag)
  }
  
  private extractProps(element: Element): ComponentProp[] {
    const props: ComponentProp[] = []
    
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-')) {
        props.push({
          name: this.toCamelCase(attr.name.replace('data-', '')),
          type: this.inferType(attr.value),
          defaultValue: attr.value,
          required: false
        })
      }
    }
    
    return props
  }
  
  private async convertStyles(styles: string, options: ExportOptions): Promise<ConvertedStyles> {
    switch (options.styling) {
      case 'tailwind':
        return await this.convertToTailwind(styles)
      case 'styled-components':
        return await this.convertToStyledComponents(styles)
      case 'css-modules':
        return await this.convertToCSSModules(styles)
      case 'emotion':
        return await this.convertToEmotion(styles)
      default:
        return { type: 'vanilla', content: styles }
    }
  }
  
  private async convertToTailwind(css: string): Promise<ConvertedStyles> {
    const classes = new Map<string, string>()
    
    // Parse CSS and convert to Tailwind classes
    const rules = this.parseCSSRules(css)
    
    for (const rule of rules) {
      const tailwindClasses = this.cssToTailwind(rule)
      classes.set(rule.selector, tailwindClasses.join(' '))
    }
    
    return {
      type: 'tailwind',
      classes,
      customStyles: this.extractNonTailwindStyles(css)
    }
  }
  
  private cssToTailwind(rule: CSSRule): string[] {
    const classes: string[] = []
    const style = (rule as CSSStyleRule).style
    
    // Map CSS properties to Tailwind classes
    const mappings = {
      'display': {
        'flex': 'flex',
        'grid': 'grid',
        'block': 'block',
        'inline': 'inline',
        'none': 'hidden'
      },
      'position': {
        'relative': 'relative',
        'absolute': 'absolute',
        'fixed': 'fixed',
        'sticky': 'sticky'
      },
      'padding': (value: string) => this.spacingToTailwind('p', value),
      'margin': (value: string) => this.spacingToTailwind('m', value),
      'color': (value: string) => this.colorToTailwind('text', value),
      'background-color': (value: string) => this.colorToTailwind('bg', value),
      'border-radius': (value: string) => this.radiusToTailwind(value),
      'font-size': (value: string) => this.textSizeToTailwind(value),
      'font-weight': (value: string) => this.fontWeightToTailwind(value)
    }
    
    // Convert each CSS property
    for (let i = 0; i < style.length; i++) {
      const prop = style[i]
      const value = style.getPropertyValue(prop)
      
      if (mappings[prop]) {
        if (typeof mappings[prop] === 'function') {
          classes.push(mappings[prop](value))
        } else if (mappings[prop][value]) {
          classes.push(mappings[prop][value])
        }
      }
    }
    
    return classes
  }
  
  private async optimizeProject(project: ExportedProject, optimization: any) {
    if (optimization.treeshaking) {
      await this.applyTreeshaking(project)
    }
    
    if (optimization.codeSplitting) {
      await this.applyCodeSplitting(project)
    }
    
    if (optimization.lazyLoading) {
      await this.applyLazyLoading(project)
    }
    
    if (optimization.imageOptimization) {
      await this.optimizeImages(project)
    }
    
    if (optimization.minification) {
      await this.minifyCode(project)
    }
  }
  
  private async generateDocumentation(project: ExportedProject, options: ExportOptions): Promise<Documentation> {
    const readme = this.generateReadme(project, options)
    const setupGuide = this.generateSetupGuide(project, options)
    const apiDocs = this.generateAPIDocs(project)
    const componentDocs = await this.generateComponentDocs(project)
    
    return {
      readme,
      setupGuide,
      apiDocs,
      componentDocs
    }
  }
  
  private generateReadme(project: ExportedProject, options: ExportOptions): string {
    return `# ${project.framework} Project

Generated with WebClone Pro - The Ultimate Website Cloning Platform

## 🚀 Quick Start

\`\`\`bash
# Install dependencies
${options.packageManager} install

# Start development server
${options.packageManager} run dev

# Build for production
${options.packageManager} run build
\`\`\`

## 📦 Tech Stack

- Framework: ${options.framework}
- Styling: ${options.styling}
- Build Tool: ${options.buildTool || 'Vite'}
- Package Manager: ${options.packageManager || 'npm'}
${options.typescript ? '- Language: TypeScript' : ''}
${options.testing !== 'none' ? `- Testing: ${options.testing}` : ''}
${options.stateManagement !== 'none' ? `- State Management: ${options.stateManagement}` : ''}

## 🏗️ Project Structure

\`\`\`
src/
├── components/     # Reusable components
├── pages/         # Page components
├── styles/        # Global styles
├── utils/         # Utility functions
├── hooks/         # Custom hooks
└── assets/        # Static assets
\`\`\`

## 🎨 Customization

### Design System

The project includes an extracted design system with:
- Color palette
- Typography scale
- Spacing system
- Component variants

### Animations

Extracted animations are available in the \`animations/\` directory.

## 🚢 Deployment

This project is configured for deployment to ${project.deployment.platform}.

### Deploy with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

## 📄 License

MIT © WebClone Pro

---

Built with ❤️ by [WebClone Pro](https://webclonepro.com)
`
  }
  
  private generateSetupGuide(project: ExportedProject, options: ExportOptions): string {
    return `# Setup Guide

## Prerequisites

- Node.js 18+ 
- ${options.packageManager || 'npm'} installed

## Installation Steps

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd <project-name>
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   ${options.packageManager} install
   \`\`\`

3. **Environment Setup**
   Create a \`.env.local\` file:
   \`\`\`
   NEXT_PUBLIC_API_URL=your-api-url
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   \`\`\`

4. **Start Development**
   \`\`\`bash
   ${options.packageManager} run dev
   \`\`\`

## Available Scripts

- \`dev\`: Start development server
- \`build\`: Build for production
- \`start\`: Start production server
- \`test\`: Run tests
- \`lint\`: Run linting
- \`format\`: Format code

## Customization

### Styling
${options.styling === 'tailwind' ? `
Edit \`tailwind.config.js\` to customize:
- Colors
- Typography
- Spacing
- Breakpoints
` : ''}

### Components
Components are located in \`src/components/\`

## Troubleshooting

### Common Issues

1. **Port already in use**
   Change the port in \`package.json\` or use:
   \`\`\`bash
   PORT=3001 ${options.packageManager} run dev
   \`\`\`

2. **Build errors**
   Clear cache and rebuild:
   \`\`\`bash
   rm -rf node_modules .next
   ${options.packageManager} install
   ${options.packageManager} run build
   \`\`\`
`
  }
  
  private toPascalCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^./, char => char.toUpperCase())
  }
  
  private toCamelCase(str: string): string {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^./, char => char.toLowerCase())
  }
  
  private inferType(value: string): string {
    if (value === 'true' || value === 'false') return 'boolean'
    if (!isNaN(Number(value))) return 'number'
    return 'string'
  }
}

// Framework-specific converters
abstract class FrameworkConverter {
  abstract convert(input: ConversionInput): Promise<ExportedProject>
  
  protected generatePackageJson(name: string, deps: Dependencies, scripts: Scripts): object {
    return {
      name,
      version: '1.0.0',
      private: true,
      scripts,
      dependencies: deps.dependencies,
      devDependencies: deps.devDependencies,
      ...(deps.peerDependencies && { peerDependencies: deps.peerDependencies })
    }
  }
  
  protected generateComponentFile(
    component: Component,
    framework: string,
    typescript: boolean
  ): string {
    // Override in specific converters
    return ''
  }
}

class ReactTailwindConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    const files = new Map<string, FileContent>()
    const structure: FileStructure = {
      src: {
        components: [],
        pages: [],
        styles: ['globals.css'],
        utils: [],
        hooks: [],
        assets: []
      },
      public: [],
      tests: [],
      config: ['package.json', 'tailwind.config.js', 'postcss.config.js']
    }
    
    // Convert components
    for (const component of input.components) {
      const fileName = `${component.name}.${input.options.typescript ? 'tsx' : 'jsx'}`
      const filePath = `src/components/${fileName}`
      
      structure.src.components.push(fileName)
      
      files.set(filePath, {
        path: filePath,
        content: this.generateReactComponent(component, input.options.typescript),
        type: 'component',
        language: input.options.typescript ? 'typescript' : 'javascript'
      })
    }
    
    // Generate App component
    files.set('src/App.tsx', {
      path: 'src/App.tsx',
      content: this.generateAppComponent(input.components),
      type: 'component',
      language: 'typescript'
    })
    
    // Generate styles
    files.set('src/globals.css', {
      path: 'src/globals.css',
      content: this.generateTailwindGlobals(input.designDNA),
      type: 'style',
      language: 'css'
    })
    
    // Generate config files
    const dependencies = this.getReactDependencies(input.options)
    const scripts = this.getReactScripts()
    const config = this.getReactConfig(input.options)
    
    return {
      framework: 'react-tailwind',
      structure,
      files,
      dependencies,
      scripts,
      config,
      documentation: {} as Documentation,
      deployment: {} as DeploymentConfig
    }
  }
  
  private generateReactComponent(component: Component, typescript: boolean): string {
    const imports = this.generateImports(component)
    const props = typescript ? this.generateTypeScript(component) : ''
    
    return `${imports}
${props}
export default function ${component.name}(${typescript ? `props: ${component.name}Props` : 'props'}) {
  return (
    <div className="component-${component.name.toLowerCase()}">
      ${this.convertHTMLToJSX(component.html)}
    </div>
  )
}`
  }
  
  private generateImports(component: Component): string {
    const imports: string[] = []
    
    // React import
    if (component.events.length > 0 || component.props.some(p => p.type === 'function')) {
      imports.push("import { useState, useEffect } from 'react'")
    } else {
      imports.push("import React from 'react'")
    }
    
    // Component dependencies
    component.dependencies.forEach(dep => {
      imports.push(`import ${dep} from './${dep}'`)
    })
    
    return imports.join('\n')
  }
  
  private generateTypeScript(component: Component): string {
    if (component.props.length === 0) {
      return `interface ${component.name}Props {}`
    }
    
    const props = component.props.map(prop => {
      const optional = !prop.required ? '?' : ''
      return `  ${prop.name}${optional}: ${prop.type}`
    }).join('\n')
    
    return `interface ${component.name}Props {\n${props}\n}\n`
  }
  
  private convertHTMLToJSX(html: string): string {
    // Convert HTML attributes to JSX
    return html
      .replace(/class=/g, 'className=')
      .replace(/for=/g, 'htmlFor=')
      .replace(/tabindex=/g, 'tabIndex=')
      .replace(/onclick=/g, 'onClick=')
      .replace(/onchange=/g, 'onChange=')
      .replace(/style="([^"]*)"/g, (_, styles) => {
        const styleObj = this.stylesToObject(styles)
        return `style={${JSON.stringify(styleObj)}}`
      })
  }
  
  private stylesToObject(styles: string): object {
    const obj: any = {}
    
    styles.split(';').forEach(style => {
      const [key, value] = style.split(':').map(s => s.trim())
      if (key && value) {
        const camelKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
        obj[camelKey] = value
      }
    })
    
    return obj
  }
  
  private generateAppComponent(components: Component[]): string {
    const imports = components
      .map(c => `import ${c.name} from './components/${c.name}'`)
      .join('\n')
    
    return `${imports}

function App() {
  return (
    <div className="app">
      ${components.map(c => `<${c.name} />`).join('\n      ')}
    </div>
  )
}

export default App`
  }
  
  private generateTailwindGlobals(designDNA?: DesignDNA): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    ${designDNA ? this.generateCSSVariables(designDNA) : ''}
  }
  
  body {
    @apply antialiased;
  }
}

@layer components {
  /* Custom component styles */
}`
  }
  
  private generateCSSVariables(designDNA: DesignDNA): string {
    const variables: string[] = []
    
    // Colors
    Object.entries(designDNA.colors.primary).forEach(([key, value]) => {
      variables.push(`--color-primary-${key}: ${value};`)
    })
    
    // Typography
    Object.entries(designDNA.typography.fontSizes).forEach(([key, value]) => {
      variables.push(`--font-size-${key}: ${value};`)
    })
    
    // Spacing
    Object.entries(designDNA.spacing.scale).forEach(([key, value]) => {
      variables.push(`--spacing-${key}: ${value};`)
    })
    
    return variables.join('\n    ')
  }
  
  private getReactDependencies(options: ExportOptions): Dependencies {
    const deps: Dependencies = {
      dependencies: {
        'react': '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
        '@vitejs/plugin-react': '^4.0.0',
        'autoprefixer': '^10.4.14',
        'postcss': '^8.4.24',
        'tailwindcss': '^3.3.2',
        'vite': '^4.3.9'
      }
    }
    
    if (options.typescript) {
      deps.devDependencies['typescript'] = '^5.1.3'
      deps.devDependencies['@types/node'] = '^20.3.1'
    }
    
    // Add component library
    if (options.componentLibrary === 'shadcn') {
      deps.dependencies['@radix-ui/react-dialog'] = '^1.0.4'
      deps.dependencies['@radix-ui/react-slot'] = '^1.0.2'
      deps.dependencies['class-variance-authority'] = '^0.6.0'
      deps.dependencies['clsx'] = '^1.2.1'
      deps.dependencies['tailwind-merge'] = '^1.13.2'
    }
    
    // Add state management
    if (options.stateManagement === 'zustand') {
      deps.dependencies['zustand'] = '^4.3.8'
    } else if (options.stateManagement === 'redux') {
      deps.dependencies['@reduxjs/toolkit'] = '^1.9.5'
      deps.dependencies['react-redux'] = '^8.1.0'
    }
    
    return deps
  }
  
  private getReactScripts(): Scripts {
    return {
      dev: 'vite',
      build: 'tsc && vite build',
      start: 'vite preview',
      lint: 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0',
      preview: 'vite preview'
    }
  }
  
  private getReactConfig(options: ExportOptions): ConfigFiles {
    return {
      packageJson: {},
      tsconfig: options.typescript ? {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true
        },
        include: ['src'],
        references: [{ path: './tsconfig.node.json' }]
      } : undefined,
      viteConfig: {
        plugins: ['@vitejs/plugin-react()'],
        resolve: {
          alias: {
            '@': '/src'
          }
        }
      },
      tailwindConfig: {
        content: [
          './index.html',
          './src/**/*.{js,ts,jsx,tsx}'
        ],
        theme: {
          extend: {}
        },
        plugins: []
      },
      postcssConfig: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {}
        }
      }
    }
  }
}

class NextTailwindConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Similar to React but with Next.js specific features
    // Pages router or App router
    // Server components
    // API routes
    // Image optimization
    // etc.
    
    return {} as ExportedProject
  }
}

class Vue3Converter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Vue 3 Composition API
    // Single File Components
    // Vue Router
    // Pinia/Vuex
    
    return {} as ExportedProject
  }
}

class Nuxt3Converter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Nuxt 3 with auto-imports
    // Server-side rendering
    // Nitro server
    
    return {} as ExportedProject
  }
}

class AngularConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Angular components
    // Services
    // Modules
    // RxJS
    
    return {} as ExportedProject
  }
}

class SvelteConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Svelte components
    // Stores
    // Reactive statements
    
    return {} as ExportedProject
  }
}

class SolidConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // SolidJS components
    // Signals
    // Fine-grained reactivity
    
    return {} as ExportedProject
  }
}

class QwikConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Qwik components
    // Resumability
    // Lazy loading
    
    return {} as ExportedProject
  }
}

class AstroConverter extends FrameworkConverter {
  async convert(input: ConversionInput): Promise<ExportedProject> {
    // Astro components
    // Islands architecture
    // Static generation
    
    return {} as ExportedProject
  }
}

// Type definitions
interface Component {
  name: string
  html: string
  props: ComponentProp[]
  children: Component[]
  events: ComponentEvent[]
  styles: string
  dependencies: string[]
}

interface ComponentProp {
  name: string
  type: string
  defaultValue?: any
  required: boolean
}

interface ComponentEvent {
  name: string
  handler: string
}

interface ConversionInput {
  components: Component[]
  styles: ConvertedStyles
  scripts: string
  assets: Map<string, Blob>
  options: ExportOptions
  designDNA?: DesignDNA
  animations?: ExtractedAnimation[]
}

interface ConvertedStyles {
  type: string
  content?: string
  classes?: Map<string, string>
  customStyles?: string
}

// Helper functions
function spacingToTailwind(prefix: string, value: string): string {
  const pixels = parseInt(value)
  const rem = pixels / 16
  
  const spacingMap: Record<number, string> = {
    0: '0',
    0.125: '0.5',
    0.25: '1',
    0.5: '2',
    0.75: '3',
    1: '4',
    1.25: '5',
    1.5: '6',
    2: '8',
    2.5: '10',
    3: '12',
    4: '16',
    5: '20',
    6: '24',
    8: '32',
    10: '40',
    12: '48',
    16: '64'
  }
  
  const closest = Object.keys(spacingMap)
    .map(Number)
    .reduce((prev, curr) => 
      Math.abs(curr - rem) < Math.abs(prev - rem) ? curr : prev
    )
  
  return `${prefix}-${spacingMap[closest]}`
}

// Export singleton
export const multiFrameworkExporter = new MultiFrameworkExporter()