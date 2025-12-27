// Popup script for WebClone Pro Chrome Extension

class PopupController {
  constructor() {
    this.currentTab = null
    this.extractionHistory = []
    this.init()
  }

  async init() {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    this.currentTab = tab

    // Load extraction history
    this.loadHistory()

    // Update page info
    this.updatePageInfo()

    // Setup event listeners
    this.setupEventListeners()

    // Check if extraction is already in progress
    this.checkExtractionStatus()
  }

  setupEventListeners() {
    // Quick action buttons
    document.getElementById('extractAnimations').addEventListener('click', () => {
      this.startExtraction('animation')
    })

    document.getElementById('extractDesign').addEventListener('click', () => {
      this.startExtraction('design')
    })

    document.getElementById('clonePage').addEventListener('click', () => {
      this.cloneEntirePage()
    })

    // Footer buttons
    document.getElementById('openDashboard').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://webclonepro.com/dashboard' })
    })

    document.getElementById('settings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage()
    })

    // Advanced options
    document.getElementById('exportFormat').addEventListener('change', (e) => {
      chrome.storage.local.set({ exportFormat: e.target.value })
    })

    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'extractionStarted':
          this.updateStatus('Extracting...', 'working')
          break
        case 'extractionStopped':
          this.updateStatus('Ready', 'ready')
          this.hideProgress()
          break
        case 'animationsExtracted':
          this.handleExtractedData('animations', request.data)
          break
        case 'designExtracted':
          this.handleExtractedData('design', request.data)
          break
        case 'pageCloned':
          this.handleExtractedData('clone', request.data)
          break
      }
    })

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.shiftKey) {
          switch (e.key) {
            case 'A':
              e.preventDefault()
              this.startExtraction('animation')
              break
            case 'D':
              e.preventDefault()
              this.startExtraction('design')
              break
            case 'C':
              e.preventDefault()
              this.cloneEntirePage()
              break
          }
        }
      }
    })
  }

  async updatePageInfo() {
    if (!this.currentTab) return

    // Update page title
    document.getElementById('pageTitle').textContent = 
      this.currentTab.title.substring(0, 40) + (this.currentTab.title.length > 40 ? '...' : '')

    // Get page info from content script
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getPageInfo'
      })

      if (response) {
        this.displayDetectedItems(response)
      }
    } catch (error) {
      console.error('Error getting page info:', error)
      // Page might not have content script injected yet
      this.injectContentScript()
    }
  }

  displayDetectedItems(pageInfo) {
    const container = document.getElementById('detectedItems')
    container.innerHTML = ''

    const items = []

    // Check for animations
    if (pageInfo.animations) {
      if (pageInfo.animations.css > 0) {
        items.push(`${pageInfo.animations.css} CSS`)
      }
      if (pageInfo.animations.gsap) {
        items.push('GSAP')
      }
      if (pageInfo.animations.framerMotion) {
        items.push('Framer')
      }
      if (pageInfo.animations.lottie) {
        items.push('Lottie')
      }
    }

    // Check for frameworks
    if (pageInfo.frameworks && pageInfo.frameworks.length > 0) {
      items.push(...pageInfo.frameworks)
    }

    // Display items
    items.forEach(item => {
      const badge = document.createElement('span')
      badge.className = 'detected-item'
      badge.textContent = item
      container.appendChild(badge)
    })

    // If no items detected
    if (items.length === 0) {
      const badge = document.createElement('span')
      badge.className = 'detected-item'
      badge.textContent = 'Analyzing...'
      container.appendChild(badge)
    }
  }

  async injectContentScript() {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: this.currentTab.id },
        files: ['content-script.js']
      })

      // Try again to get page info
      setTimeout(() => this.updatePageInfo(), 100)
    } catch (error) {
      console.error('Error injecting content script:', error)
    }
  }

  async startExtraction(mode) {
    this.showProgress(`Starting ${mode} extraction...`)
    
    try {
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'startExtraction',
        mode: mode
      })

      // Close popup to let user interact with page
      window.close()
    } catch (error) {
      console.error('Error starting extraction:', error)
      this.hideProgress()
      this.showError('Failed to start extraction. Please refresh the page.')
    }
  }

  async cloneEntirePage() {
    this.showProgress('Cloning page...', true)
    
    try {
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'clonePage'
      })

      if (response.success) {
        this.updateProgress(100)
        setTimeout(() => {
          this.hideProgress()
          this.showSuccess('Page cloned successfully!')
        }, 500)
      }
    } catch (error) {
      console.error('Error cloning page:', error)
      this.hideProgress()
      this.showError('Failed to clone page')
    }
  }

  handleExtractedData(type, data) {
    // Store in local storage
    const extraction = {
      id: Date.now(),
      type: type,
      url: this.currentTab.url,
      title: this.currentTab.title,
      timestamp: new Date().toISOString(),
      data: data
    }

    // Save to history
    this.addToHistory(extraction)

    // Get export format
    chrome.storage.local.get(['exportFormat'], (result) => {
      const format = result.exportFormat || 'react'
      
      // Process and export data
      this.exportData(extraction, format)
    })

    // Update status
    this.updateStatus('Ready', 'ready')
    this.hideProgress()
    this.showSuccess(`${type} extracted successfully!`)
  }

  exportData(extraction, format) {
    // Send to background script for processing
    chrome.runtime.sendMessage({
      action: 'exportData',
      extraction: extraction,
      format: format
    })
  }

  addToHistory(extraction) {
    // Load current history
    chrome.storage.local.get(['extractionHistory'], (result) => {
      let history = result.extractionHistory || []
      
      // Add new extraction
      history.unshift({
        id: extraction.id,
        type: extraction.type,
        title: extraction.title.substring(0, 30),
        timestamp: extraction.timestamp,
        url: extraction.url
      })

      // Keep only last 10
      history = history.slice(0, 10)

      // Save back
      chrome.storage.local.set({ extractionHistory: history }, () => {
        this.loadHistory()
      })
    })
  }

  loadHistory() {
    chrome.storage.local.get(['extractionHistory'], (result) => {
      const history = result.extractionHistory || []
      this.displayHistory(history)
    })
  }

  displayHistory(history) {
    const container = document.getElementById('historyList')
    container.innerHTML = ''

    if (history.length === 0) {
      container.innerHTML = '<div class="empty-state">No extraction history yet</div>'
      return
    }

    history.forEach(item => {
      const historyItem = document.createElement('div')
      historyItem.className = 'history-item'
      historyItem.innerHTML = `
        <div class="history-item-title">${item.title}</div>
        <div class="history-item-meta">
          <span>${this.getTypeIcon(item.type)} ${item.type}</span>
          <span>${this.formatTime(item.timestamp)}</span>
        </div>
      `
      
      historyItem.addEventListener('click', () => {
        this.viewHistoryItem(item.id)
      })

      container.appendChild(historyItem)
    })
  }

  getTypeIcon(type) {
    const icons = {
      animation: '✨',
      design: '🎨',
      clone: '📋'
    }
    return icons[type] || '📄'
  }

  formatTime(timestamp) {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return 'Just now'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`
    } else {
      return `${Math.floor(diff / 86400000)}d ago`
    }
  }

  viewHistoryItem(id) {
    // Open in dashboard
    chrome.tabs.create({
      url: `https://webclonepro.com/dashboard/extraction/${id}`
    })
  }

  checkExtractionStatus() {
    // Check if extraction is in progress
    chrome.storage.local.get(['extractionInProgress'], (result) => {
      if (result.extractionInProgress) {
        this.updateStatus('Extracting...', 'working')
      } else {
        this.updateStatus('Ready', 'ready')
      }
    })
  }

  updateStatus(text, state = 'ready') {
    const statusText = document.querySelector('.status-text')
    const statusDot = document.querySelector('.status-dot')
    
    statusText.textContent = text
    
    // Update dot color
    switch (state) {
      case 'ready':
        statusDot.style.background = '#10b981'
        break
      case 'working':
        statusDot.style.background = '#f59e0b'
        break
      case 'error':
        statusDot.style.background = '#ef4444'
        break
    }
  }

  showProgress(text = 'Processing...', animated = false) {
    const overlay = document.getElementById('progressOverlay')
    const progressText = overlay.querySelector('.progress-text')
    
    progressText.textContent = text
    overlay.classList.add('active')

    if (animated) {
      // Animate progress bar
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress > 90) {
          clearInterval(interval)
          progress = 90
        }
        this.updateProgress(progress)
      }, 500)
    }
  }

  hideProgress() {
    const overlay = document.getElementById('progressOverlay')
    overlay.classList.remove('active')
    this.updateProgress(0)
  }

  updateProgress(percent) {
    const fill = document.getElementById('progressFill')
    fill.style.width = `${percent}%`
  }

  showSuccess(message) {
    this.showNotification(message, 'success')
  }

  showError(message) {
    this.showNotification(message, 'error')
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideDown 0.3s ease;
    `
    notification.textContent = message

    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease'
      setTimeout(() => {
        notification.remove()
        style.remove()
      }, 300)
    }, 3000)
  }
}

// Initialize popup controller
document.addEventListener('DOMContentLoaded', () => {
  new PopupController()
})