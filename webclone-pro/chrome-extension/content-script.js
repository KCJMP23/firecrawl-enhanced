// WebClone Pro Chrome Extension - Content Script
// Handles communication between page and extension

class WebCloneExtractor {
  constructor() {
    this.isExtracting = false
    this.hoveredElement = null
    this.selectedElements = new Set()
    this.extractionMode = null
    this.overlay = null
    this.toolbar = null
    
    this.init()
  }

  init() {
    // Listen for messages from extension
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'startExtraction':
          this.startExtraction(request.mode)
          sendResponse({ success: true })
          break
        case 'stopExtraction':
          this.stopExtraction()
          sendResponse({ success: true })
          break
        case 'extractAnimation':
          this.extractAnimation(request.element)
            .then(result => sendResponse(result))
          return true // Keep channel open for async response
        case 'extractDesign':
          this.extractDesignSystem()
            .then(result => sendResponse(result))
          return true
        case 'clonePage':
          this.cloneEntirePage()
            .then(result => sendResponse(result))
          return true
        case 'getPageInfo':
          sendResponse(this.getPageInfo())
          break
        default:
          sendResponse({ error: 'Unknown action' })
      }
    })

    // Inject analyzer script
    this.injectAnalyzer()
  }

  injectAnalyzer() {
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('analyzer.js')
    script.onload = () => script.remove()
    document.head.appendChild(script)
  }

  startExtraction(mode) {
    this.extractionMode = mode
    this.isExtracting = true
    
    // Create overlay
    this.createOverlay()
    
    // Add event listeners
    document.addEventListener('mouseover', this.handleMouseOver)
    document.addEventListener('mouseout', this.handleMouseOut)
    document.addEventListener('click', this.handleClick)
    document.addEventListener('keydown', this.handleKeyDown)
    
    // Show toolbar
    this.createToolbar()
    
    // Send status update
    chrome.runtime.sendMessage({
      action: 'extractionStarted',
      mode: mode
    })
  }

  stopExtraction() {
    this.isExtracting = false
    this.extractionMode = null
    
    // Remove overlay
    this.removeOverlay()
    
    // Remove event listeners
    document.removeEventListener('mouseover', this.handleMouseOver)
    document.removeEventListener('mouseout', this.handleMouseOut)
    document.removeEventListener('click', this.handleClick)
    document.removeEventListener('keydown', this.handleKeyDown)
    
    // Remove toolbar
    this.removeToolbar()
    
    // Clear selections
    this.selectedElements.clear()
    
    // Send status update
    chrome.runtime.sendMessage({
      action: 'extractionStopped'
    })
  }

  createOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.id = 'webclone-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 999999;
      transition: all 0.2s ease;
      display: none;
    `
    document.body.appendChild(this.overlay)
  }

  removeOverlay() {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
  }

  createToolbar() {
    this.toolbar = document.createElement('div')
    this.toolbar.id = 'webclone-toolbar'
    this.toolbar.innerHTML = `
      <div class="webclone-toolbar-inner">
        <div class="webclone-toolbar-title">
          WebClone Pro - ${this.extractionMode} Mode
        </div>
        <div class="webclone-toolbar-info">
          <span class="webclone-selected-count">${this.selectedElements.size} selected</span>
        </div>
        <div class="webclone-toolbar-actions">
          <button class="webclone-btn webclone-btn-primary" id="webclone-extract">
            Extract Selected
          </button>
          <button class="webclone-btn webclone-btn-secondary" id="webclone-clear">
            Clear Selection
          </button>
          <button class="webclone-btn webclone-btn-danger" id="webclone-cancel">
            Cancel
          </button>
        </div>
      </div>
    `
    
    document.body.appendChild(this.toolbar)
    
    // Add button listeners
    document.getElementById('webclone-extract').addEventListener('click', () => {
      this.performExtraction()
    })
    
    document.getElementById('webclone-clear').addEventListener('click', () => {
      this.clearSelection()
    })
    
    document.getElementById('webclone-cancel').addEventListener('click', () => {
      this.stopExtraction()
    })
  }

  removeToolbar() {
    if (this.toolbar) {
      this.toolbar.remove()
      this.toolbar = null
    }
  }

  handleMouseOver = (e) => {
    if (!this.isExtracting) return
    
    e.stopPropagation()
    const element = e.target
    
    if (element.id === 'webclone-overlay' || element.closest('#webclone-toolbar')) {
      return
    }
    
    this.hoveredElement = element
    this.highlightElement(element)
  }

  handleMouseOut = (e) => {
    if (!this.isExtracting) return
    
    e.stopPropagation()
    this.overlay.style.display = 'none'
  }

  handleClick = (e) => {
    if (!this.isExtracting) return
    
    const element = e.target
    
    if (element.id === 'webclone-overlay' || element.closest('#webclone-toolbar')) {
      return
    }
    
    e.preventDefault()
    e.stopPropagation()
    
    // Toggle selection
    if (this.selectedElements.has(element)) {
      this.selectedElements.delete(element)
      element.classList.remove('webclone-selected')
    } else {
      this.selectedElements.add(element)
      element.classList.add('webclone-selected')
    }
    
    // Update counter
    this.updateSelectionCount()
  }

  handleKeyDown = (e) => {
    if (!this.isExtracting) return
    
    // ESC to cancel
    if (e.key === 'Escape') {
      this.stopExtraction()
    }
    
    // Enter to extract
    if (e.key === 'Enter' && this.selectedElements.size > 0) {
      this.performExtraction()
    }
  }

  highlightElement(element) {
    const rect = element.getBoundingClientRect()
    
    this.overlay.style.left = `${rect.left + window.scrollX}px`
    this.overlay.style.top = `${rect.top + window.scrollY}px`
    this.overlay.style.width = `${rect.width}px`
    this.overlay.style.height = `${rect.height}px`
    this.overlay.style.display = 'block'
  }

  updateSelectionCount() {
    const countEl = document.querySelector('.webclone-selected-count')
    if (countEl) {
      countEl.textContent = `${this.selectedElements.size} selected`
    }
  }

  clearSelection() {
    this.selectedElements.forEach(el => {
      el.classList.remove('webclone-selected')
    })
    this.selectedElements.clear()
    this.updateSelectionCount()
  }

  async performExtraction() {
    const elements = Array.from(this.selectedElements)
    
    switch (this.extractionMode) {
      case 'animation':
        await this.extractAnimations(elements)
        break
      case 'design':
        await this.extractDesigns(elements)
        break
      case 'clone':
        await this.cloneElements(elements)
        break
    }
    
    this.stopExtraction()
  }

  async extractAnimations(elements) {
    const animations = []
    
    for (const element of elements) {
      // Check for CSS animations
      const computedStyle = window.getComputedStyle(element)
      const animationName = computedStyle.animationName
      
      if (animationName && animationName !== 'none') {
        animations.push({
          type: 'css',
          element: this.getElementSelector(element),
          animation: {
            name: animationName,
            duration: computedStyle.animationDuration,
            delay: computedStyle.animationDelay,
            timingFunction: computedStyle.animationTimingFunction,
            iterationCount: computedStyle.animationIterationCount,
            direction: computedStyle.animationDirection,
            fillMode: computedStyle.animationFillMode,
            playState: computedStyle.animationPlayState
          },
          keyframes: await this.extractKeyframes(animationName)
        })
      }
      
      // Check for CSS transitions
      const transition = computedStyle.transition
      if (transition && transition !== 'none') {
        animations.push({
          type: 'transition',
          element: this.getElementSelector(element),
          transition: transition
        })
      }
      
      // Check for GSAP animations
      const gsapAnimations = await this.extractGSAPAnimations(element)
      animations.push(...gsapAnimations)
      
      // Check for Framer Motion
      const framerAnimations = await this.extractFramerMotionAnimations(element)
      animations.push(...framerAnimations)
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'animationsExtracted',
      data: animations
    })
    
    // Show notification
    this.showNotification(`Extracted ${animations.length} animations`)
  }

  async extractGSAPAnimations(element) {
    return new Promise((resolve) => {
      // Communicate with injected script
      window.postMessage({
        type: 'WEBCLONE_EXTRACT_GSAP',
        selector: this.getElementSelector(element)
      }, '*')
      
      // Listen for response
      const handler = (event) => {
        if (event.data.type === 'WEBCLONE_GSAP_RESULT') {
          window.removeEventListener('message', handler)
          resolve(event.data.animations || [])
        }
      }
      
      window.addEventListener('message', handler)
      
      // Timeout after 1 second
      setTimeout(() => {
        window.removeEventListener('message', handler)
        resolve([])
      }, 1000)
    })
  }

  async extractFramerMotionAnimations(element) {
    return new Promise((resolve) => {
      // Check React fiber for Framer Motion props
      const fiber = this.getReactFiber(element)
      
      if (fiber && fiber.memoizedProps) {
        const props = fiber.memoizedProps
        
        if (props.animate || props.initial || props.variants) {
          resolve([{
            type: 'framer-motion',
            element: this.getElementSelector(element),
            props: {
              initial: props.initial,
              animate: props.animate,
              exit: props.exit,
              variants: props.variants,
              transition: props.transition
            }
          }])
          return
        }
      }
      
      resolve([])
    })
  }

  getReactFiber(element) {
    const key = Object.keys(element).find(key => 
      key.startsWith('__reactInternalInstance') || 
      key.startsWith('__reactFiber')
    )
    return element[key]
  }

  async extractKeyframes(animationName) {
    const keyframes = []
    
    // Search through stylesheets
    for (const stylesheet of document.styleSheets) {
      try {
        for (const rule of stylesheet.cssRules) {
          if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === animationName) {
            for (const keyframe of rule.cssRules) {
              keyframes.push({
                keyText: keyframe.keyText,
                style: Object.assign({}, keyframe.style)
              })
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheets
      }
    }
    
    return keyframes
  }

  async extractDesigns(elements) {
    const designs = []
    
    for (const element of elements) {
      const computedStyle = window.getComputedStyle(element)
      
      designs.push({
        selector: this.getElementSelector(element),
        styles: {
          // Layout
          display: computedStyle.display,
          position: computedStyle.position,
          width: computedStyle.width,
          height: computedStyle.height,
          margin: computedStyle.margin,
          padding: computedStyle.padding,
          
          // Typography
          fontFamily: computedStyle.fontFamily,
          fontSize: computedStyle.fontSize,
          fontWeight: computedStyle.fontWeight,
          lineHeight: computedStyle.lineHeight,
          letterSpacing: computedStyle.letterSpacing,
          textAlign: computedStyle.textAlign,
          color: computedStyle.color,
          
          // Background
          backgroundColor: computedStyle.backgroundColor,
          backgroundImage: computedStyle.backgroundImage,
          backgroundSize: computedStyle.backgroundSize,
          backgroundPosition: computedStyle.backgroundPosition,
          
          // Borders
          border: computedStyle.border,
          borderRadius: computedStyle.borderRadius,
          
          // Effects
          boxShadow: computedStyle.boxShadow,
          opacity: computedStyle.opacity,
          transform: computedStyle.transform,
          filter: computedStyle.filter,
          
          // Flexbox/Grid
          flexDirection: computedStyle.flexDirection,
          justifyContent: computedStyle.justifyContent,
          alignItems: computedStyle.alignItems,
          gap: computedStyle.gap,
          gridTemplateColumns: computedStyle.gridTemplateColumns,
          gridTemplateRows: computedStyle.gridTemplateRows
        }
      })
    }
    
    // Extract color palette
    const colorPalette = await this.extractColorPalette()
    
    // Extract typography scale
    const typographyScale = await this.extractTypographyScale()
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'designExtracted',
      data: {
        elements: designs,
        palette: colorPalette,
        typography: typographyScale,
        spacing: this.extractSpacingScale()
      }
    })
    
    this.showNotification('Design system extracted successfully')
  }

  async extractColorPalette() {
    const colors = new Set()
    const elements = document.querySelectorAll('*')
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el)
      
      // Extract color properties
      const colorProps = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'textDecorationColor'
      ]
      
      colorProps.forEach(prop => {
        const value = style[prop]
        if (value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent') {
          colors.add(value)
        }
      })
    })
    
    return Array.from(colors)
  }

  async extractTypographyScale() {
    const fonts = new Map()
    const elements = document.querySelectorAll('*')
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el)
      const fontSize = style.fontSize
      
      if (!fonts.has(fontSize)) {
        fonts.set(fontSize, {
          size: fontSize,
          family: style.fontFamily,
          weight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          count: 0
        })
      }
      
      fonts.get(fontSize).count++
    })
    
    // Sort by usage and return top fonts
    return Array.from(fonts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  extractSpacingScale() {
    const spacings = new Set()
    const elements = document.querySelectorAll('*')
    
    elements.forEach(el => {
      const style = window.getComputedStyle(el)
      
      // Extract spacing properties
      const spacingProps = [
        'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
        'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
        'gap', 'rowGap', 'columnGap'
      ]
      
      spacingProps.forEach(prop => {
        const value = style[prop]
        if (value && value !== '0px' && value !== 'normal') {
          spacings.add(value)
        }
      })
    })
    
    return Array.from(spacings).sort((a, b) => {
      const aNum = parseFloat(a)
      const bNum = parseFloat(b)
      return aNum - bNum
    })
  }

  async cloneElements(elements) {
    const clonedData = []
    
    for (const element of elements) {
      clonedData.push({
        html: element.outerHTML,
        styles: await this.extractAllStyles(element),
        scripts: await this.extractRelatedScripts(element),
        assets: await this.extractAssets(element)
      })
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'elementsCloned',
      data: clonedData
    })
    
    this.showNotification(`Cloned ${elements.length} elements`)
  }

  async cloneEntirePage() {
    const pageData = {
      url: window.location.href,
      title: document.title,
      html: document.documentElement.outerHTML,
      styles: await this.extractAllPageStyles(),
      scripts: await this.extractAllScripts(),
      assets: await this.extractAllAssets(),
      metadata: {
        viewport: document.querySelector('meta[name="viewport"]')?.content,
        description: document.querySelector('meta[name="description"]')?.content,
        keywords: document.querySelector('meta[name="keywords"]')?.content,
        ogImage: document.querySelector('meta[property="og:image"]')?.content
      }
    }
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'pageCloned',
      data: pageData
    })
    
    return { success: true }
  }

  async extractAllStyles(element) {
    const styles = []
    
    // Get inline styles
    if (element.style.cssText) {
      styles.push({
        type: 'inline',
        content: element.style.cssText
      })
    }
    
    // Get computed styles
    const computedStyle = window.getComputedStyle(element)
    const computedObj = {}
    
    for (let i = 0; i < computedStyle.length; i++) {
      const prop = computedStyle[i]
      computedObj[prop] = computedStyle.getPropertyValue(prop)
    }
    
    styles.push({
      type: 'computed',
      content: computedObj
    })
    
    // Get matching CSS rules
    for (const stylesheet of document.styleSheets) {
      try {
        for (const rule of stylesheet.cssRules) {
          if (rule.type === CSSRule.STYLE_RULE && element.matches(rule.selectorText)) {
            styles.push({
              type: 'rule',
              selector: rule.selectorText,
              content: rule.style.cssText
            })
          }
        }
      } catch (e) {
        // Cross-origin stylesheets
      }
    }
    
    return styles
  }

  async extractAllPageStyles() {
    const styles = []
    
    // Extract all stylesheets
    for (const stylesheet of document.styleSheets) {
      try {
        const rules = []
        for (const rule of stylesheet.cssRules) {
          rules.push(rule.cssText)
        }
        
        styles.push({
          type: 'stylesheet',
          href: stylesheet.href,
          content: rules.join('\n')
        })
      } catch (e) {
        // Cross-origin stylesheet
        if (stylesheet.href) {
          styles.push({
            type: 'external',
            href: stylesheet.href
          })
        }
      }
    }
    
    // Extract inline styles
    document.querySelectorAll('style').forEach(style => {
      styles.push({
        type: 'inline',
        content: style.textContent
      })
    })
    
    return styles
  }

  async extractRelatedScripts(element) {
    // Extract scripts that might be related to this element
    const scripts = []
    
    // Check for data attributes that might indicate script usage
    const dataAttrs = {}
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-')) {
        dataAttrs[attr.name] = attr.value
      }
    }
    
    if (Object.keys(dataAttrs).length > 0) {
      scripts.push({
        type: 'data-attributes',
        content: dataAttrs
      })
    }
    
    // Check for event listeners
    const eventTypes = [
      'click', 'submit', 'change', 'input', 'focus', 'blur',
      'mouseenter', 'mouseleave', 'mouseover', 'mouseout'
    ]
    
    eventTypes.forEach(eventType => {
      const listeners = getEventListeners(element)?.[eventType]
      if (listeners && listeners.length > 0) {
        scripts.push({
          type: 'event-listener',
          event: eventType,
          count: listeners.length
        })
      }
    })
    
    return scripts
  }

  async extractAllScripts() {
    const scripts = []
    
    document.querySelectorAll('script').forEach(script => {
      if (script.src) {
        scripts.push({
          type: 'external',
          src: script.src,
          async: script.async,
          defer: script.defer
        })
      } else {
        scripts.push({
          type: 'inline',
          content: script.textContent
        })
      }
    })
    
    return scripts
  }

  async extractAssets(element) {
    const assets = []
    
    // Extract images
    element.querySelectorAll('img').forEach(img => {
      assets.push({
        type: 'image',
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      })
    })
    
    // Extract background images
    const bgImage = window.getComputedStyle(element).backgroundImage
    if (bgImage && bgImage !== 'none') {
      const urlMatch = bgImage.match(/url\(['"]?(.+?)['"]?\)/)
      if (urlMatch) {
        assets.push({
          type: 'background-image',
          src: urlMatch[1]
        })
      }
    }
    
    // Extract videos
    element.querySelectorAll('video').forEach(video => {
      assets.push({
        type: 'video',
        src: video.src,
        poster: video.poster,
        width: video.width,
        height: video.height
      })
    })
    
    return assets
  }

  async extractAllAssets() {
    const assets = {
      images: [],
      fonts: [],
      icons: []
    }
    
    // Extract all images
    document.querySelectorAll('img').forEach(img => {
      assets.images.push({
        src: img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    })
    
    // Extract fonts
    for (const stylesheet of document.styleSheets) {
      try {
        for (const rule of stylesheet.cssRules) {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            assets.fonts.push({
              family: rule.style.fontFamily,
              src: rule.style.src,
              weight: rule.style.fontWeight,
              style: rule.style.fontStyle
            })
          }
        }
      } catch (e) {
        // Cross-origin
      }
    }
    
    // Extract favicons
    document.querySelectorAll('link[rel*="icon"]').forEach(link => {
      assets.icons.push({
        rel: link.rel,
        href: link.href,
        sizes: link.sizes?.value
      })
    })
    
    return assets
  }

  getElementSelector(element) {
    // Generate a unique selector for the element
    if (element.id) {
      return `#${element.id}`
    }
    
    let path = []
    let current = element
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase()
      
      if (current.className) {
        selector += '.' + current.className.split(' ').filter(c => c).join('.')
      }
      
      // Add nth-child if needed
      const siblings = current.parentNode?.children
      if (siblings && siblings.length > 1) {
        const index = Array.from(siblings).indexOf(current) + 1
        selector += `:nth-child(${index})`
      }
      
      path.unshift(selector)
      current = current.parentNode
      
      // Stop at body or if we have enough specificity
      if (current === document.body || path.length >= 3) {
        break
      }
    }
    
    return path.join(' > ')
  }

  showNotification(message) {
    const notification = document.createElement('div')
    notification.className = 'webclone-notification'
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 999999;
      animation: slideInUp 0.3s ease;
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOutDown 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  getPageInfo() {
    return {
      url: window.location.href,
      title: document.title,
      elements: document.querySelectorAll('*').length,
      animations: this.detectAnimations(),
      frameworks: this.detectFrameworks()
    }
  }

  detectAnimations() {
    const animations = {
      css: 0,
      gsap: false,
      framerMotion: false,
      lottie: false,
      anime: false
    }
    
    // Count CSS animations
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el)
      if (style.animationName && style.animationName !== 'none') {
        animations.css++
      }
    })
    
    // Detect animation libraries
    animations.gsap = typeof window.gsap !== 'undefined'
    animations.lottie = typeof window.lottie !== 'undefined'
    animations.anime = typeof window.anime !== 'undefined'
    
    // Check for Framer Motion (React)
    const reactElements = document.querySelectorAll('[data-framer-component-type]')
    animations.framerMotion = reactElements.length > 0
    
    return animations
  }

  detectFrameworks() {
    const frameworks = []
    
    // React
    if (window.React || document.querySelector('[data-reactroot]')) {
      frameworks.push('React')
    }
    
    // Vue
    if (window.Vue || document.querySelector('[data-v-]')) {
      frameworks.push('Vue')
    }
    
    // Angular
    if (window.ng || document.querySelector('[ng-version]')) {
      frameworks.push('Angular')
    }
    
    // jQuery
    if (window.jQuery) {
      frameworks.push('jQuery')
    }
    
    // Bootstrap
    if (document.querySelector('[class*="col-"], [class*="container"], [class*="row"]')) {
      frameworks.push('Bootstrap')
    }
    
    // Tailwind
    if (document.querySelector('[class*="flex"], [class*="grid"], [class*="bg-"], [class*="text-"]')) {
      const classes = Array.from(document.querySelectorAll('*'))
        .flatMap(el => Array.from(el.classList))
        .join(' ')
      
      if (classes.match(/\b(flex|grid|bg|text|p|m|w|h)-\S+/)) {
        frameworks.push('Tailwind CSS')
      }
    }
    
    return frameworks
  }
}

// Initialize extractor
const extractor = new WebCloneExtractor()

// Add global styles
const style = document.createElement('style')
style.textContent = `
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }
  
  .webclone-selected {
    outline: 3px solid #10b981 !important;
    outline-offset: 2px !important;
  }
`
document.head.appendChild(style)