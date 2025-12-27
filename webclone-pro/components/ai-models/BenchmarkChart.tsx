/**
 * BenchmarkChart Component
 * 
 * Displays model performance benchmarks across different categories
 * with visual progress bars and scores. Extracted from monolithic AIModelSelection.
 */

'use client'

import { SimpleCard } from '@/components/ui'

export interface ModelBenchmark {
  modelId: string
  testName: string
  score: number
  category: 'reasoning' | 'coding' | 'creative' | 'factual' | 'safety'
  benchmark: string
  lastUpdated: Date
}

export interface BenchmarkChartProps {
  benchmarks: ModelBenchmark[]
}

export function BenchmarkChart({ benchmarks }: BenchmarkChartProps) {
  const categories = ['reasoning', 'coding', 'creative', 'factual', 'safety']
  
  return (
    <SimpleCard>
      <h3 className="text-lg font-semibold text-white mb-4">Model Benchmarks</h3>
      
      <div className="space-y-4">
        {categories.map(category => {
          const categoryBenchmarks = benchmarks.filter(b => b.category === category)
          const avgScore = categoryBenchmarks.length > 0 
            ? categoryBenchmarks.reduce((sum, b) => sum + b.score, 0) / categoryBenchmarks.length 
            : 0

          return (
            <div key={category} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/80 capitalize">{category}</span>
                <span className="text-white font-medium">{avgScore.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    avgScore >= 80 ? 'bg-green-500' :
                    avgScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${avgScore}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {categoryBenchmarks.slice(0, 3).map(benchmark => (
                  <span key={benchmark.testName} className="text-xs text-white/60">
                    {benchmark.benchmark}: {benchmark.score}%
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </SimpleCard>
  )
}

export default BenchmarkChart