// Advanced Animation Extraction & Redesign Engine
// Extracts animations from websites and converts between libraries

export type AnimationLibrary = 'gsap' | 'framer-motion' | 'lottie' | 'css' | 'three-js' | 'anime-js' | 'motion-one'

export interface ExtractedAnimation {
  id: string
  name: string
  library: AnimationLibrary
  type: 'timeline' | 'keyframe' | 'spring' | 'tween' | 'morph' | '3d'
  target: string // CSS selector or component
  duration: number
  delay?: number
  easing?: string
  properties: AnimationProperty[]
  keyframes?: Keyframe[]
  timeline?: TimelineStep[]
  rawCode: string
  metadata: AnimationMetadata
}

export interface AnimationProperty {
  name: string
  from?: any
  to?: any
  value?: any
  unit?: string
}

export interface Keyframe {
  time: number // 0-1 percentage
  properties: AnimationProperty[]
  easing?: string
}

export interface TimelineStep {
  target: string
  startTime: number
  duration: number
  properties: AnimationProperty[]
  easing?: string
}

export interface AnimationMetadata {
  complexity: 'simple' | 'moderate' | 'complex'
  performance: 'light' | 'medium' | 'heavy'
  browserSupport: string[]
  estimatedSize: number // bytes
  tags: string[]
}

export interface ConvertedAnimation {
  original: ExtractedAnimation
  converted: ExtractedAnimation
  code: string
  compatibility: number // 0-100% accuracy
  warnings?: string[]
}

export class AnimationExtractor {
  private animations: Map<string, ExtractedAnimation> = new Map()
  private observer?: MutationObserver
  
  // Extract GSAP animations
  extractGSAP(element: Element): ExtractedAnimation[] {
    const extracted: ExtractedAnimation[] = []
    
    // Check for GSAP timeline or tween
    // @ts-ignore - GSAP may be available globally
    if (typeof gsap !== 'undefined') {
      // @ts-ignore
      const tweens = gsap.getTweensOf(element)
      
      tweens.forEach((tween: any) => {
        const animation: ExtractedAnimation = {
          id: this.generateId(),
          name: `gsap-${element.className || element.tagName.toLowerCase()}`,
          library: 'gsap',
          type: 'tween',
          target: this.getSelector(element),
          duration: tween.duration() * 1000,
          delay: tween.delay() * 1000,
          easing: tween.vars.ease?.name || 'power2.out',
          properties: this.extractGSAPProperties(tween),
          rawCode: this.generateGSAPCode(tween),
          metadata: {
            complexity: 'moderate',
            performance: 'light',
            browserSupport: ['chrome', 'firefox', 'safari', 'edge'],
            estimatedSize: 500,
            tags: ['gsap', 'tween']
          }
        }
        
        extracted.push(animation)
        this.animations.set(animation.id, animation)
      })
    }
    
    return extracted
  }

  // Extract Framer Motion animations
  extractFramerMotion(component: any): ExtractedAnimation[] {
    const extracted: ExtractedAnimation[] = []
    
    // Parse Framer Motion variants and animate props
    if (component.props?.animate) {
      const animation: ExtractedAnimation = {
        id: this.generateId(),
        name: `framer-${component.type?.name || 'component'}`,
        library: 'framer-motion',
        type: 'spring',
        target: component.type?.name || 'div',
        duration: 500, // Default spring duration
        properties: this.extractFramerProperties(component.props),
        rawCode: this.generateFramerCode(component.props),
        metadata: {
          complexity: 'simple',
          performance: 'medium',
          browserSupport: ['chrome', 'firefox', 'safari', 'edge'],
          estimatedSize: 800,
          tags: ['framer-motion', 'react', 'spring']
        }
      }
      
      extracted.push(animation)
      this.animations.set(animation.id, animation)
    }
    
    return extracted
  }

  // Extract Lottie animations
  extractLottie(animationData: any): ExtractedAnimation {
    const animation: ExtractedAnimation = {
      id: this.generateId(),
      name: animationData.nm || 'lottie-animation',
      library: 'lottie',
      type: 'keyframe',
      target: '.lottie-container',
      duration: (animationData.op - animationData.ip) * (1000 / animationData.fr),
      properties: [],
      keyframes: this.extractLottieKeyframes(animationData),
      rawCode: JSON.stringify(animationData, null, 2),
      metadata: {
        complexity: 'complex',
        performance: 'heavy',
        browserSupport: ['chrome', 'firefox', 'safari', 'edge'],
        estimatedSize: JSON.stringify(animationData).length,
        tags: ['lottie', 'after-effects', 'vector']
      }
    }
    
    this.animations.set(animation.id, animation)
    return animation
  }

  // Extract CSS animations
  extractCSS(element: Element): ExtractedAnimation[] {
    const extracted: ExtractedAnimation[] = []
    const computedStyle = window.getComputedStyle(element)
    
    // Check for CSS animations
    const animationName = computedStyle.animationName
    if (animationName && animationName !== 'none') {
      const animation: ExtractedAnimation = {
        id: this.generateId(),
        name: animationName,
        library: 'css',
        type: 'keyframe',
        target: this.getSelector(element),
        duration: parseFloat(computedStyle.animationDuration) * 1000,
        delay: parseFloat(computedStyle.animationDelay) * 1000,
        easing: computedStyle.animationTimingFunction,
        properties: [],
        keyframes: this.extractCSSKeyframes(animationName),
        rawCode: this.getCSSAnimationCode(animationName),
        metadata: {
          complexity: 'simple',
          performance: 'light',
          browserSupport: ['chrome', 'firefox', 'safari', 'edge'],
          estimatedSize: 200,
          tags: ['css', 'keyframes']
        }
      }
      
      extracted.push(animation)
      this.animations.set(animation.id, animation)
    }
    
    // Check for CSS transitions
    const transition = computedStyle.transition
    if (transition && transition !== 'none') {
      const transitionProps = this.parseCSSTransition(transition)
      
      transitionProps.forEach(prop => {
        const animation: ExtractedAnimation = {
          id: this.generateId(),
          name: `transition-${prop.property}`,
          library: 'css',
          type: 'tween',
          target: this.getSelector(element),
          duration: prop.duration,
          delay: prop.delay,
          easing: prop.easing,
          properties: [{
            name: prop.property,
            from: computedStyle.getPropertyValue(prop.property),
            to: null // Will be determined on hover/interaction
          }],
          rawCode: `transition: ${transition};`,
          metadata: {
            complexity: 'simple',
            performance: 'light',
            browserSupport: ['chrome', 'firefox', 'safari', 'edge'],
            estimatedSize: 100,
            tags: ['css', 'transition']
          }
        }
        
        extracted.push(animation)
        this.animations.set(animation.id, animation)
      })
    }
    
    return extracted
  }

  // Convert animation between libraries
  convert(animation: ExtractedAnimation, targetLibrary: AnimationLibrary): ConvertedAnimation {
    let converted: ExtractedAnimation
    let code: string
    let compatibility = 100
    const warnings: string[] = []
    
    switch (targetLibrary) {
      case 'gsap':
        ({ animation: converted, code } = this.convertToGSAP(animation))
        break
      case 'framer-motion':
        ({ animation: converted, code } = this.convertToFramerMotion(animation))
        break
      case 'lottie':
        ({ animation: converted, code } = this.convertToLottie(animation))
        compatibility = 70 // Lottie conversion is limited
        warnings.push('Lottie conversion may require After Effects for full compatibility')
        break
      case 'css':
        ({ animation: converted, code } = this.convertToCSS(animation))
        if (animation.type === 'spring') {
          compatibility = 80
          warnings.push('CSS does not support spring animations natively')
        }
        break
      case 'three-js':
        ({ animation: converted, code } = this.convertToThreeJS(animation))
        compatibility = 60 // 3D conversion is complex
        warnings.push('Three.js conversion requires 3D context setup')
        break
      case 'anime-js':
        ({ animation: converted, code } = this.convertToAnimeJS(animation))
        break
      case 'motion-one':
        ({ animation: converted, code } = this.convertToMotionOne(animation))
        break
      default:
        throw new Error(`Unsupported target library: ${targetLibrary}`)
    }
    
    return {
      original: animation,
      converted,
      code,
      compatibility,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  // Convert to GSAP
  private convertToGSAP(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'gsap' as AnimationLibrary }
    let code = ''
    
    if (animation.type === 'timeline') {
      code = `const tl = gsap.timeline();\n`
      animation.timeline?.forEach(step => {
        const props = this.propertiesToGSAP(step.properties)
        code += `tl.to("${step.target}", {
  duration: ${step.duration / 1000},
  ${Object.entries(props).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ')}
}, ${step.startTime / 1000});\n`
      })
    } else {
      const props = this.propertiesToGSAP(animation.properties)
      code = `gsap.to("${animation.target}", {
  duration: ${animation.duration / 1000},
  delay: ${(animation.delay || 0) / 1000},
  ease: "${animation.easing || 'power2.out'}",
  ${Object.entries(props).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ')}
});`
    }
    
    return { animation: converted, code }
  }

  // Convert to Framer Motion
  private convertToFramerMotion(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'framer-motion' as AnimationLibrary }
    const props = this.propertiesToFramer(animation.properties)
    
    const code = `<motion.div
  initial={{ ${this.formatFramerProps(props.initial)} }}
  animate={{ ${this.formatFramerProps(props.animate)} }}
  transition={{
    duration: ${animation.duration / 1000},
    delay: ${(animation.delay || 0) / 1000},
    ease: "${animation.easing || 'easeOut'}"
  }}
/>`
    
    return { animation: converted, code }
  }

  // Convert to CSS
  private convertToCSS(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'css' as AnimationLibrary }
    let code = ''
    
    if (animation.type === 'keyframe' || animation.keyframes) {
      const keyframes = animation.keyframes || this.generateKeyframesFromProperties(animation.properties)
      
      code = `@keyframes ${animation.name} {\n`
      keyframes.forEach(kf => {
        code += `  ${Math.round(kf.time * 100)}% {\n`
        kf.properties.forEach(prop => {
          const cssProp = this.toCSSProperty(prop.name)
          const value = prop.to || prop.value
          code += `    ${cssProp}: ${value}${prop.unit || ''};\n`
        })
        code += `  }\n`
      })
      code += `}\n\n`
      code += `.animated-element {
  animation: ${animation.name} ${animation.duration}ms ${animation.easing || 'ease'} ${animation.delay || 0}ms;
}`
    } else {
      // Convert to transition
      const props = animation.properties.map(p => this.toCSSProperty(p.name)).join(', ')
      code = `.element {
  transition: ${props} ${animation.duration}ms ${animation.easing || 'ease'} ${animation.delay || 0}ms;
}`
    }
    
    return { animation: converted, code }
  }

  // Convert to Lottie (limited conversion)
  private convertToLottie(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'lottie' as AnimationLibrary }
    
    // Generate basic Lottie JSON structure
    const lottieData = {
      v: '5.0.0',
      fr: 60,
      ip: 0,
      op: Math.round((animation.duration / 1000) * 60),
      w: 1920,
      h: 1080,
      nm: animation.name,
      ddd: 0,
      assets: [],
      layers: [
        {
          ddd: 0,
          ind: 1,
          ty: 4,
          nm: 'Layer 1',
          ks: {
            o: { a: 0, k: 100 },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [960, 540, 0] },
            a: { a: 0, k: [0, 0, 0] },
            s: { a: 0, k: [100, 100, 100] }
          }
        }
      ]
    }
    
    const code = `// Lottie animation data
const animationData = ${JSON.stringify(lottieData, null, 2)};

// Usage with lottie-web
lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  animationData: animationData
});`
    
    return { animation: converted, code }
  }

  // Convert to Three.js
  private convertToThreeJS(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'three-js' as AnimationLibrary }
    
    const code = `// Three.js animation
const mixer = new THREE.AnimationMixer(mesh);
const clip = new THREE.AnimationClip('${animation.name}', ${animation.duration / 1000}, [
  ${animation.properties.map(prop => `
  new THREE.KeyframeTrack(
    '.${prop.name}',
    [0, ${animation.duration / 1000}],
    [${prop.from || 0}, ${prop.to || 1}]
  )`).join(',')}
]);

const action = mixer.clipAction(clip);
action.play();

// Update in render loop
function animate() {
  mixer.update(clock.getDelta());
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}`
    
    return { animation: converted, code }
  }

  // Convert to Anime.js
  private convertToAnimeJS(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'anime-js' as AnimationLibrary }
    const props = this.propertiesToAnime(animation.properties)
    
    const code = `anime({
  targets: '${animation.target}',
  ${Object.entries(props).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ')},
  duration: ${animation.duration},
  delay: ${animation.delay || 0},
  easing: '${animation.easing || 'easeOutQuad'}'
});`
    
    return { animation: converted, code }
  }

  // Convert to Motion One
  private convertToMotionOne(animation: ExtractedAnimation): { animation: ExtractedAnimation; code: string } {
    const converted = { ...animation, library: 'motion-one' as AnimationLibrary }
    const props = this.propertiesToMotionOne(animation.properties)
    
    const code = `import { animate } from '@motionone/dom';

animate('${animation.target}', ${JSON.stringify(props)}, {
  duration: ${animation.duration / 1000},
  delay: ${(animation.delay || 0) / 1000},
  easing: '${animation.easing || 'ease-out'}'
});`
    
    return { animation: converted, code }
  }

  // Helper methods
  private extractGSAPProperties(tween: any): AnimationProperty[] {
    const properties: AnimationProperty[] = []
    const vars = tween.vars
    
    const ignoredProps = ['ease', 'duration', 'delay', 'onComplete', 'onStart', 'onUpdate']
    
    Object.keys(vars).forEach(key => {
      if (!ignoredProps.includes(key)) {
        properties.push({
          name: key,
          from: tween.target[key],
          to: vars[key]
        })
      }
    })
    
    return properties
  }

  private extractFramerProperties(props: any): AnimationProperty[] {
    const properties: AnimationProperty[] = []
    
    if (props.animate) {
      Object.entries(props.animate).forEach(([key, value]) => {
        properties.push({
          name: key,
          from: props.initial?.[key],
          to: value
        })
      })
    }
    
    return properties
  }

  private extractLottieKeyframes(data: any): Keyframe[] {
    // Simplified Lottie keyframe extraction
    return [
      { time: 0, properties: [] },
      { time: 1, properties: [] }
    ]
  }

  private extractCSSKeyframes(animationName: string): Keyframe[] {
    const keyframes: Keyframe[] = []
    const styleSheets = Array.from(document.styleSheets)
    
    styleSheets.forEach(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || [])
        rules.forEach(rule => {
          if ((rule as any).name === animationName && (rule as any).type === CSSRule.KEYFRAMES_RULE) {
            const keyframeRule = rule as any
            Array.from(keyframeRule.cssRules).forEach((kf: any) => {
              const time = parseFloat(kf.keyText) / 100
              const properties: AnimationProperty[] = []
              
              Array.from(kf.style).forEach((prop: any) => {
                properties.push({
                  name: prop,
                  value: kf.style[prop]
                })
              })
              
              keyframes.push({ time, properties })
            })
          }
        })
      } catch (e) {
        // Cross-origin stylesheets may throw
      }
    })
    
    return keyframes
  }

  private getCSSAnimationCode(animationName: string): string {
    // Try to find the actual CSS code
    const styleSheets = Array.from(document.styleSheets)
    
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || [])
        for (const rule of rules) {
          if ((rule as any).name === animationName && (rule as any).type === CSSRule.KEYFRAMES_RULE) {
            return rule.cssText
          }
        }
      } catch (e) {
        // Cross-origin stylesheets may throw
      }
    }
    
    return `/* Animation: ${animationName} */`
  }

  private parseCSSTransition(transition: string): any[] {
    const parts = transition.split(',').map(t => t.trim())
    
    return parts.map(part => {
      const [property, duration, easing, delay] = part.split(' ')
      return {
        property: property || 'all',
        duration: duration ? parseFloat(duration) * 1000 : 0,
        easing: easing || 'ease',
        delay: delay ? parseFloat(delay) * 1000 : 0
      }
    })
  }

  private generateGSAPCode(tween: any): string {
    const vars = { ...tween.vars }
    delete vars.ease
    
    return `gsap.to("${this.getSelector(tween.target)}", {
  duration: ${tween.duration()},
  ${Object.entries(vars).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(',\n  ')}
});`
  }

  private generateFramerCode(props: any): string {
    return `<motion.div
  initial={${JSON.stringify(props.initial || {})}}
  animate={${JSON.stringify(props.animate || {})}}
  transition={${JSON.stringify(props.transition || {})}}
/>`
  }

  private propertiesToGSAP(properties: AnimationProperty[]): any {
    const result: any = {}
    
    properties.forEach(prop => {
      const gsapName = this.toGSAPProperty(prop.name)
      result[gsapName] = prop.to || prop.value
    })
    
    return result
  }

  private propertiesToFramer(properties: AnimationProperty[]): any {
    const initial: any = {}
    const animate: any = {}
    
    properties.forEach(prop => {
      const framerName = this.toFramerProperty(prop.name)
      if (prop.from !== undefined) initial[framerName] = prop.from
      if (prop.to !== undefined) animate[framerName] = prop.to
    })
    
    return { initial, animate }
  }

  private propertiesToAnime(properties: AnimationProperty[]): any {
    const result: any = {}
    
    properties.forEach(prop => {
      const animeName = this.toAnimeProperty(prop.name)
      result[animeName] = [prop.from || 0, prop.to || 1]
    })
    
    return result
  }

  private propertiesToMotionOne(properties: AnimationProperty[]): any {
    const result: any = {}
    
    properties.forEach(prop => {
      result[prop.name] = prop.to || prop.value
    })
    
    return result
  }

  private formatFramerProps(props: any): string {
    return Object.entries(props)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ')
  }

  private generateKeyframesFromProperties(properties: AnimationProperty[]): Keyframe[] {
    return [
      {
        time: 0,
        properties: properties.map(p => ({ ...p, value: p.from }))
      },
      {
        time: 1,
        properties: properties.map(p => ({ ...p, value: p.to }))
      }
    ]
  }

  private toGSAPProperty(name: string): string {
    const mapping: Record<string, string> = {
      'transform': 'x',
      'opacity': 'opacity',
      'background-color': 'backgroundColor',
      'color': 'color',
      'width': 'width',
      'height': 'height'
    }
    return mapping[name] || name
  }

  private toFramerProperty(name: string): string {
    const mapping: Record<string, string> = {
      'transform': 'x',
      'opacity': 'opacity',
      'background-color': 'backgroundColor',
      'color': 'color',
      'width': 'width',
      'height': 'height'
    }
    return mapping[name] || name
  }

  private toAnimeProperty(name: string): string {
    const mapping: Record<string, string> = {
      'transform': 'translateX',
      'opacity': 'opacity',
      'background-color': 'backgroundColor',
      'color': 'color',
      'width': 'width',
      'height': 'height'
    }
    return mapping[name] || name
  }

  private toCSSProperty(name: string): string {
    // Convert camelCase to kebab-case
    return name.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  private getSelector(element: Element): string {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  private generateId(): string {
    return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Observe DOM for animations
  startObserving() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node instanceof Element) {
            this.extractCSS(node)
            this.extractGSAP(node)
          }
        })
      })
    })
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    })
  }

  stopObserving() {
    this.observer?.disconnect()
  }

  // Get all extracted animations
  getAllAnimations(): ExtractedAnimation[] {
    return Array.from(this.animations.values())
  }

  // Clear all animations
  clearAnimations() {
    this.animations.clear()
  }
}

// Export singleton instance
export const animationExtractor = new AnimationExtractor()