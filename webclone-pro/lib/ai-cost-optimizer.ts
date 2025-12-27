/**
 * AI Cost Optimization System for WebClone Pro 2026
 * Maximize profitability while minimizing OpenAI API costs
 */

export interface ModelConfig {
  name: string
  inputCostPer1M: number
  outputCostPer1M: number
  cachedInputCostPer1M?: number
  maxTokens: number
  useCase: string[]
  qualityScore: number // 1-10
  speedScore: number // 1-10
}

export interface UsageAnalytics {
  totalTokensUsed: number
  totalCost: number
  costPerFeature: Record<string, number>
  modelUsageBreakdown: Record<string, number>
  monthlyCostTrend: number
}

export class AICostOptimizer {
  private readonly models: Record<string, ModelConfig> = {
    // Primary workhorse - 80% of tasks
    'gpt-4o-mini': {
      name: 'GPT-4o Mini',
      inputCostPer1M: 0.15,
      outputCostPer1M: 0.60,
      cachedInputCostPer1M: 0.075,
      maxTokens: 128000,
      useCase: [
        'website-analysis',
        'simple-code-generation', 
        'content-editing',
        'basic-ai-chat',
        'pdf-summarization',
        'simple-design-suggestions'
      ],
      qualityScore: 8,
      speedScore: 9
    },
    
    // Premium model - 15% of tasks
    'gpt-4o': {
      name: 'GPT-4o',
      inputCostPer1M: 2.50,
      outputCostPer1M: 10.00,
      cachedInputCostPer1M: 1.25,
      maxTokens: 128000,
      useCase: [
        'complex-code-generation',
        'advanced-design-analysis',
        'animation-extraction-logic',
        'complex-pdf-analysis',
        'advanced-ai-chat',
        'architecture-decisions'
      ],
      qualityScore: 10,
      speedScore: 8
    },
    
    // Code specialist - 5% of tasks
    'gpt-4-turbo': {
      name: 'GPT-4 Turbo',
      inputCostPer1M: 10.00,
      outputCostPer1M: 30.00,
      cachedInputCostPer1M: 5.00,
      maxTokens: 128000,
      useCase: [
        'framework-conversion',
        'complex-debugging',
        'enterprise-architecture',
        'performance-optimization'
      ],
      qualityScore: 9,
      speedScore: 7
    },
    
    // Embeddings for search
    'text-embedding-3-small': {
      name: 'Text Embedding 3 Small',
      inputCostPer1M: 0.02,
      outputCostPer1M: 0.00,
      cachedInputCostPer1M: 0.01, // batch discount
      maxTokens: 8191,
      useCase: [
        'pdf-embeddings',
        'semantic-search',
        'content-similarity',
        'document-clustering'
      ],
      qualityScore: 8,
      speedScore: 10
    }
  }

  private readonly subscriptionTiers = {
    starter: {
      monthlyPrice: 29,
      aiCreditsIncluded: 1000,
      costPerExtraCredit: 0.05
    },
    pro: {
      monthlyPrice: 79,
      aiCreditsIncluded: 5000,
      costPerExtraCredit: 0.04
    },
    enterprise: {
      monthlyPrice: 199,
      aiCreditsIncluded: 15000,
      costPerExtraCredit: 0.03
    }
  }

  /**
   * Calculate optimal model for a specific task
   */
  selectOptimalModel(task: string, complexity: 'simple' | 'medium' | 'complex', budget?: number): string {
    let candidates: string[] = []
    
    // Find models that can handle this task
    for (const [modelName, config] of Object.entries(this.models)) {
      if (config.useCase.some(useCase => 
        task.toLowerCase().includes(useCase.split('-')[0])
      )) {
        candidates.push(modelName)
      }
    }
    
    // Fallback to general models if no specific match
    if (candidates.length === 0) {
      candidates = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']
    }
    
    // Select based on complexity and budget
    switch (complexity) {
      case 'simple':
        return candidates.includes('gpt-4o-mini') ? 'gpt-4o-mini' : candidates[0]
      
      case 'medium':
        if (budget && budget < 0.01) {
          return 'gpt-4o-mini'
        }
        return candidates.includes('gpt-4o') ? 'gpt-4o' : candidates[0]
      
      case 'complex':
        if (task.includes('code') || task.includes('framework')) {
          return 'gpt-4-turbo'
        }
        return 'gpt-4o'
      
      default:
        return 'gpt-4o-mini'
    }
  }

  /**
   * Calculate cost for a specific request
   */
  calculateRequestCost(
    modelName: string,
    inputTokens: number,
    outputTokens: number,
    useCachedInput: boolean = false
  ): number {
    const model = this.models[modelName]
    if (!model) throw new Error(`Model ${modelName} not found`)
    
    const inputCost = useCachedInput && model.cachedInputCostPer1M
      ? (inputTokens / 1000000) * model.cachedInputCostPer1M
      : (inputTokens / 1000000) * model.inputCostPer1M
    
    const outputCost = (outputTokens / 1000000) * model.outputCostPer1M
    
    return inputCost + outputCost
  }

  /**
   * Convert API costs to credit system
   */
  convertCostToCredits(cost: number, tier: 'starter' | 'pro' | 'enterprise' = 'pro'): number {
    // Apply markup multiplier based on tier
    const markupMultipliers = {
      starter: 8.0,  // 8x markup for starter (80% margin)
      pro: 6.0,      // 6x markup for pro (83% margin)  
      enterprise: 4.0 // 4x markup for enterprise (75% margin)
    }
    
    const markup = markupMultipliers[tier]
    return Math.ceil(cost * markup * 1000) // Convert to credits (1 credit = $0.001)
  }

  /**
   * Estimate monthly costs per user by feature usage
   */
  estimateMonthlyUserCost(userTier: 'starter' | 'pro' | 'enterprise'): {
    features: Record<string, number>
    totalCost: number
    recommendedCredits: number
    profitMargin: number
  } {
    const usagePatterns = {
      starter: {
        'website-cloning': 5,      // 5 clones/month
        'ai-customization': 20,    // 20 AI edits
        'pdf-processing': 3,       // 3 PDFs
        'ai-chat': 50,            // 50 messages
        'design-analysis': 10     // 10 analyses
      },
      pro: {
        'website-cloning': 25,
        'ai-customization': 100,
        'pdf-processing': 15,
        'ai-chat': 200,
        'design-analysis': 50,
        'animation-extraction': 10,
        'collaboration-ai': 30
      },
      enterprise: {
        'website-cloning': 100,
        'ai-customization': 500,
        'pdf-processing': 50,
        'ai-chat': 1000,
        'design-analysis': 200,
        'animation-extraction': 50,
        'collaboration-ai': 100,
        'enterprise-features': 200
      }
    }
    
    const usage = usagePatterns[userTier]
    let totalCost = 0
    const features: Record<string, number> = {}
    
    for (const [feature, count] of Object.entries(usage)) {
      let featureCost = 0
      
      switch (feature) {
        case 'website-cloning':
          // Use GPT-4o-mini for analysis, GPT-4o for complex generation
          featureCost = count * (
            this.calculateRequestCost('gpt-4o-mini', 2000, 1000) * 0.7 + // 70% simple
            this.calculateRequestCost('gpt-4o', 3000, 2000) * 0.3      // 30% complex
          )
          break
          
        case 'ai-customization':
          // Mostly GPT-4o-mini with some GPT-4o
          featureCost = count * (
            this.calculateRequestCost('gpt-4o-mini', 1500, 800) * 0.8 +
            this.calculateRequestCost('gpt-4o', 2000, 1200) * 0.2
          )
          break
          
        case 'pdf-processing':
          // Embeddings + GPT-4o-mini for analysis + vision for images
          featureCost = count * (
            this.calculateRequestCost('text-embedding-3-small', 5000, 0, true) + // batch
            this.calculateRequestCost('gpt-4o-mini', 3000, 1000) +
            0.002 // vision API for images
          )
          break
          
        case 'ai-chat':
          // GPT-4o-mini for most, GPT-4o for complex
          featureCost = count * (
            this.calculateRequestCost('gpt-4o-mini', 800, 400, true) * 0.9 + // cached
            this.calculateRequestCost('gpt-4o', 1200, 600, true) * 0.1
          )
          break
          
        case 'animation-extraction':
          // Complex analysis requiring GPT-4o
          featureCost = count * this.calculateRequestCost('gpt-4o', 4000, 2000)
          break
          
        default:
          // Default to GPT-4o-mini
          featureCost = count * this.calculateRequestCost('gpt-4o-mini', 1000, 500)
      }
      
      features[feature] = featureCost
      totalCost += featureCost
    }
    
    const recommendedCredits = this.convertCostToCredits(totalCost, userTier)
    const tierPricing = this.subscriptionTiers[userTier]
    const profitMargin = ((tierPricing.monthlyPrice - totalCost) / tierPricing.monthlyPrice) * 100
    
    return {
      features,
      totalCost,
      recommendedCredits,
      profitMargin
    }
  }

  /**
   * Get cost optimization recommendations
   */
  getOptimizationRecommendations(): {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  } {
    return {
      immediate: [
        'Use GPT-4o-mini for 80% of tasks (8x cheaper than GPT-4o)',
        'Implement prompt caching for system prompts (50% cost reduction)',
        'Batch PDF embeddings using text-embedding-3-small (50% discount)',
        'Use vision API only for critical image analysis (limit to 5 images per PDF)',
        'Implement smart model fallback: mini → 4o → 4-turbo'
      ],
      shortTerm: [
        'Fine-tune GPT-4o-mini for domain-specific tasks (reduce prompt length)',
        'Implement response caching for common queries (reduce API calls)',
        'Use batch API for non-time-sensitive operations',
        'Optimize prompt engineering (reduce input tokens by 30-50%)',
        'Implement usage analytics and cost monitoring'
      ],
      longTerm: [
        'Develop hybrid architecture with open-source models for preprocessing',
        'Implement model switching based on user tier and budget',
        'Create domain-specific fine-tuned models',
        'Build prompt optimization engine',
        'Consider enterprise deals with OpenAI for volume discounts'
      ]
    }
  }

  /**
   * Calculate ROI for different pricing strategies
   */
  calculatePricingROI(): {
    strategy: string
    monthlyRevenue: number
    monthlyCosts: number
    grossMargin: number
    userCapacity: number
  }[] {
    const strategies = [
      {
        strategy: 'Credit System (Current)',
        pricing: this.subscriptionTiers,
        avgUserCost: 12, // $12/month in API costs
        conversionRate: 0.08 // 8% free to paid
      },
      {
        strategy: 'Usage-Based Only',
        pricing: { payPerUse: { costPerCredit: 0.05 } },
        avgUserCost: 15, // Higher due to inefficiency
        conversionRate: 0.12 // Easier entry
      },
      {
        strategy: 'Hybrid (Base + Credits)',
        pricing: { base: 19, credits: 0.04 },
        avgUserCost: 10, // Lower base cost optimization
        conversionRate: 0.10
      }
    ]
    
    return strategies.map(strategy => {
      let monthlyRevenue = 0
      let monthlyCosts = 0
      let userCapacity = 0
      
      if (strategy.strategy === 'Credit System (Current)') {
        const users = {
          starter: 1000,
          pro: 500, 
          enterprise: 100
        }
        
        monthlyRevenue = 
          users.starter * this.subscriptionTiers.starter.monthlyPrice +
          users.pro * this.subscriptionTiers.pro.monthlyPrice +
          users.enterprise * this.subscriptionTiers.enterprise.monthlyPrice
        
        monthlyCosts = 
          users.starter * 3 +   // $3 avg cost per starter user
          users.pro * 8 +      // $8 avg cost per pro user  
          users.enterprise * 25 // $25 avg cost per enterprise user
        
        userCapacity = users.starter + users.pro + users.enterprise
      }
      
      const grossMargin = ((monthlyRevenue - monthlyCosts) / monthlyRevenue) * 100
      
      return {
        strategy: strategy.strategy,
        monthlyRevenue,
        monthlyCosts,
        grossMargin,
        userCapacity
      }
    })
  }
}