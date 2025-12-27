'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SimpleButton } from '@/components/ui'
import {
  ArrowLeft,
  Send,
  Brain,
  Sparkles,
  Code,
  Palette,
  Globe,
  Download,
  RefreshCw,
  Copy,
  Check,
  Zap,
  MessageSquare,
  User,
  Bot,
  Settings,
  Maximize2,
  Wand2,
  Image,
  Video,
  FileText,
  Layout
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    type?: 'text' | 'code' | 'suggestion' | 'transformation'
    language?: string
    preview?: string
  }
}

interface ChatPageProps {
  params: Promise<{ id: string }>
}


function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-2xl ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 ml-3' 
            : 'bg-gradient-to-r from-purple-600 to-pink-600 mr-3'
        }`}>
          {message.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
        </div>
        
        <div className={`relative group ${
          message.role === 'user' 
            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30' 
            : 'bg-white/5 border border-white/10'
        } rounded-lg px-4 py-3`}>
          {message.metadata?.type === 'code' && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
              <span className="text-xs text-white/60 flex items-center">
                <Code className="w-3 h-3 mr-1" />
                {message.metadata.language || 'Code'}
              </span>
              <SimpleButton variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </SimpleButton>
            </div>
          )}
          
          {message.metadata?.type === 'suggestion' && (
            <div className="flex items-center mb-2 text-yellow-400">
              <Sparkles className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Suggestion</span>
            </div>
          )}
          
          {message.metadata?.type === 'transformation' && (
            <div className="flex items-center mb-2 text-green-400">
              <Wand2 className="w-4 h-4 mr-2" />
              <span className="text-xs font-medium">Transformation Applied</span>
            </div>
          )}
          
          <p className="text-white/90 whitespace-pre-wrap">{message.content}</p>
          
          {message.metadata?.preview && (
            <div className="mt-3 p-3 bg-white/5 rounded-md border border-white/10">
              <div className="text-xs text-white/60 mb-2">Preview:</div>
              <div className="text-sm text-white/80">{message.metadata.preview}</div>
            </div>
          )}
          
          <span className="text-xs text-white/40 mt-2 block">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ChatPage({ params }: ChatPageProps) {
  const { id: projectId } = use(params)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you transform and remix your cloned website. What would you like to change?',
      timestamp: new Date(),
      metadata: { type: 'text' }
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const suggestions = [
    {
      icon: <Palette className="w-4 h-4" />,
      text: "Change color scheme to healthcare blue",
      action: "Transform the website's color palette to medical/healthcare theme with calming blues and whites"
    },
    {
      icon: <Layout className="w-4 h-4" />,
      text: "Modernize the layout",
      action: "Update the layout to a modern, minimalist design with better spacing"
    },
    {
      icon: <Image className="w-4 h-4" />,
      text: "Generate new hero images",
      action: "Create AI-generated hero images that match the site's theme"
    },
    {
      icon: <FileText className="w-4 h-4" />,
      text: "Rewrite content for B2B",
      action: "Transform all content to target business customers instead of consumers"
    },
    {
      icon: <Globe className="w-4 h-4" />,
      text: "Add multi-language support",
      action: "Implement language switching with translations for Spanish, French, and German"
    },
    {
      icon: <Video className="w-4 h-4" />,
      text: "Add video backgrounds",
      action: "Replace static images with engaging video backgrounds"
    }
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      metadata: { type: 'text' }
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)
    setShowSuggestions(false)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I'll help you with: "${inputMessage}". Let me analyze your website and apply the changes...`,
        timestamp: new Date(),
        metadata: { 
          type: inputMessage.includes('code') ? 'code' : 'transformation',
          language: inputMessage.includes('code') ? 'html' : undefined
        }
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)

      // Add a follow-up message
      setTimeout(() => {
        const followUp: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: 'Changes have been applied! You can see the preview in the editor. Would you like to make any other modifications?',
          timestamp: new Date(),
          metadata: { type: 'transformation' }
        }
        setMessages(prev => [...prev, followUp])
      }, 2000)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setInputMessage(suggestion.action)
    setShowSuggestions(false)
  }

  const quickActions = [
    { icon: <Wand2 className="w-4 h-4" />, label: 'Auto-Enhance', color: 'from-purple-600 to-pink-600' },
    { icon: <Zap className="w-4 h-4" />, label: 'Speed Optimize', color: 'from-yellow-600 to-orange-600' },
    { icon: <Brain className="w-4 h-4" />, label: 'Smart Layout', color: 'from-blue-600 to-cyan-600' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Add Effects', color: 'from-green-600 to-teal-600' }
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-black/50 backdrop-blur-lg border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Chat Studio</h1>
              <p className="text-sm text-white/60">Transform with conversation</p>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-6 border-b border-white/10">
          <div className="mb-4">
            <div className="text-xs text-white/60 mb-1">Project</div>
            <div className="text-white font-medium">Apple Homepage Clone</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-white/60 mb-1">Status</div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                <span className="text-sm text-white">Ready</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-white/60 mb-1">Changes</div>
              <span className="text-sm text-white">12</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 flex-1 overflow-y-auto">
          <h3 className="text-sm font-medium text-white/60 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center space-x-3 group"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {action.icon}
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <Link href={`/editor/${projectId}`} className="flex-1">
              <SimpleButton variant="outline" className="w-full">
                <Maximize2 className="w-4 h-4 mr-2" />
                Open Editor
              </SimpleButton>
            </Link>
            <SimpleButton variant="outline" size="icon">
              <Download className="w-4 h-4" />
            </SimpleButton>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-black/50 backdrop-blur-lg border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-white">AI Conversation</h2>
              <div className="flex items-center text-sm text-white/60">
                <MessageSquare className="w-4 h-4 mr-2" />
                {messages.length} messages
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SimpleButton variant="outline" size="icon">
                <RefreshCw className="w-4 h-4" />
              </SimpleButton>
              <SimpleButton variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </SimpleButton>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Suggestions */}
          {showSuggestions && messages.length === 1 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-white/60 mb-4">Suggested Transformations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20 group-hover:from-blue-600/30 group-hover:to-purple-600/30 transition-colors">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium mb-1">{suggestion.text}</div>
                        <div className="text-xs text-white/60">{suggestion.action}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex max-w-2xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-black/50 backdrop-blur-lg border-t border-white/10 px-6 py-4">
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Describe how you want to transform your website..."
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 resize-none"
                rows={2}
              />
              <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                <span className="text-xs text-white/40">{inputMessage.length}/500</span>
              </div>
            </div>
            <SimpleButton type="submit" size="icon" disabled={!inputMessage.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </SimpleButton>
          </form>
          
          <div className="flex items-center justify-between mt-3 text-xs text-white/40">
            <div className="flex items-center space-x-4">
              <span>Press Enter to send</span>
              <span>Shift+Enter for new line</span>
            </div>
            <div className="flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              AI powered by Claude
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}