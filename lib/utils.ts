import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the correct path for static assets accounting for basePath
export function getDataPath(): string {
  const basePath = process.env.NODE_ENV === 'production' ? '/Shanghai-Gaokao' : ''
  return `${basePath}/data.json`
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return 'N/A'
  return num.toLocaleString()
}

export function formatScore(score: string): string {
  if (score === '580及以上') return '580+'
  return score
}

export function getScoreColor(score: string): string {
  const numScore = parseInt(score.replace(/[^\d]/g, ''))
  if (numScore >= 600) return 'text-red-600'
  if (numScore >= 550) return 'text-orange-600'
  if (numScore >= 500) return 'text-yellow-600'
  return 'text-green-600'
}

export function getRankingColor(ranking: number | null): string {
  if (!ranking) return 'text-gray-600'
  if (ranking <= 1000) return 'text-red-600'
  if (ranking <= 5000) return 'text-orange-600'
  if (ranking <= 10000) return 'text-yellow-600'
  return 'text-green-600'
}

export function calculateTrend(data: Array<{ 年份: number; 最低排名: number | null }>): 'up' | 'down' | 'stable' {
  const validData = data.filter(d => d.最低排名 !== null).sort((a, b) => a.年份 - b.年份)
  if (validData.length < 2) return 'stable'
  
  const recent = validData[validData.length - 1].最低排名!
  const previous = validData[validData.length - 2].最低排名!
  
  if (recent < previous - 500) return 'up' // Lower ranking number = better
  if (recent > previous + 500) return 'down'
  return 'stable'
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 