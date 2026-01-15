'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  BarChart3,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  语文数学合计: number | null
  外语: number | null
  选考最高: number | null
  选考次高: number | null
  选考最低: number | null
  加分: number | null
  最低排名: number | null
  年份: number
}

interface AdmissionResult {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number
  年份: number
  margin: number
  safetyLevel: 'safe' | 'moderate' | 'risky'
}

export interface GroupedResults {
  safe: AdmissionResult[]
  moderate: AdmissionResult[]
  risky: AdmissionResult[]
}

export interface AdmissionStats {
  totalAccessible: number
  totalPrograms: number
  accessiblePercent: number
  uniqueUniversities: number
  safeCount: number
  moderateCount: number
  riskyCount: number
}

interface AdmissionChanceCalculatorProps {
  data: UniversityData[]
  selectedYear: number
  years: number[]
  onYearChange: (year: number) => void
  onRankingChange?: (value: string) => void
  showEmptyState?: boolean
  showResults?: boolean
  onResultsChange?: (payload: {
    ranking: string
    selectedYear: number
    stats: AdmissionStats
    groupedResults: GroupedResults
  } | null) => void
  onConfirm?: (ranking: string) => void
}

export default function AdmissionChanceCalculator({
  data,
  selectedYear,
  years,
  onYearChange,
  onRankingChange,
  showEmptyState = true,
  showResults = true,
  onResultsChange,
  onConfirm,
}: AdmissionChanceCalculatorProps) {
  const { t } = useLanguage()
  const [ranking, setRanking] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)

  // Calculate admission chances based on ranking
  const results = useMemo(() => {
    const rankingNum = parseInt(ranking)
    if (isNaN(rankingNum) || rankingNum <= 0) return null

    const yearData = data.filter(
      (item) => item.年份 === selectedYear && item.最低排名
    )

    const matches: AdmissionResult[] = yearData
      .filter((item) => rankingNum <= item.最低排名!)
      .map((item) => {
        const margin = item.最低排名! - rankingNum
        let safetyLevel: 'safe' | 'moderate' | 'risky'
        if (margin > 1000) safetyLevel = 'safe'
        else if (margin > 500) safetyLevel = 'moderate'
        else safetyLevel = 'risky'

        return {
          组名: item.组名,
          院校名: item.院校名,
          组号: item.组号,
          投档线: item.投档线,
          最低排名: item.最低排名!,
          年份: item.年份,
          margin,
          safetyLevel,
        }
      })
      .sort((a, b) => a.最低排名 - b.最低排名)

    return matches
  }, [ranking, selectedYear, data])

  // Group results by safety level
  const groupedResults = useMemo(() => {
    if (!results) return null
    return {
      safe: results.filter((r) => r.safetyLevel === 'safe'),
      moderate: results.filter((r) => r.safetyLevel === 'moderate'),
      risky: results.filter((r) => r.safetyLevel === 'risky'),
    }
  }, [results])

  // Calculate statistics
  const stats = useMemo<AdmissionStats | null>(() => {
    const rankingNum = parseInt(ranking)
    if (isNaN(rankingNum) || !results) return null

    const totalPrograms = data.filter(
      (item) => item.年份 === selectedYear && item.最低排名
    ).length
    const accessiblePercent = Math.round((results.length / totalPrograms) * 100)

    const uniqueUniversities = new Set(results.map((r) => r.院校名)).size

    return {
      totalAccessible: results.length,
      totalPrograms,
      accessiblePercent,
      uniqueUniversities,
      safeCount: groupedResults?.safe.length || 0,
      moderateCount: groupedResults?.moderate.length || 0,
      riskyCount: groupedResults?.risky.length || 0,
    }
  }, [ranking, results, groupedResults, data, selectedYear])

  useEffect(() => {
    if (!onResultsChange) return
    if (stats && groupedResults && ranking) {
      onResultsChange({ ranking, selectedYear, stats, groupedResults })
    } else {
      onResultsChange(null)
    }
  }, [onResultsChange, ranking, selectedYear, stats, groupedResults])

  const handleRankingChange = useCallback((value: string) => {
    setRanking(value)
    onRankingChange?.(value)
    if (value) {
      setIsCalculating(true)
      setTimeout(() => setIsCalculating(false), 300)
    }
  }, [onRankingChange])

  const rankingNumber = parseInt(ranking)
  const canConfirm = !isNaN(rankingNumber) && rankingNumber > 0

  const getSafetyConfig = (level: 'safe' | 'moderate' | 'risky') => {
    switch (level) {
      case 'safe':
        return {
          icon: Shield,
          color: 'emerald',
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-200',
          textClass: 'text-emerald-700',
          iconClass: 'text-emerald-600',
          label: t('calc.safe'),
          description: t('calc.safe.desc'),
        }
      case 'moderate':
        return {
          icon: AlertTriangle,
          color: 'amber',
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-200',
          textClass: 'text-amber-700',
          iconClass: 'text-amber-600',
          label: t('calc.moderate'),
          description: t('calc.moderate.desc'),
        }
      case 'risky':
        return {
          icon: AlertCircle,
          color: 'rose',
          bgClass: 'bg-rose-50',
          borderClass: 'border-rose-200',
          textClass: 'text-rose-700',
          iconClass: 'text-rose-600',
          label: t('calc.risky'),
          description: t('calc.risky.desc'),
        }
    }
  }

  return (
    <div className="space-y-8">
      {/* Main Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-[0_35px_80px_-60px_rgba(30,41,59,0.6)]"
      >
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-20 h-44 w-44 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10">
            <Target className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
              {t('calc.title')}
            </h2>
            <p className="text-sm text-slate-500">{t('calc.subtitle')}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
          {/* Ranking Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('calc.yourRanking')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={ranking}
                onChange={(e) => handleRankingChange(e.target.value)}
                placeholder={t('calc.placeholder')}
                className="focus-ring h-[58px] w-full rounded-2xl border border-slate-200 bg-white px-5 text-lg font-medium placeholder:text-slate-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              {isCalculating && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              )}
            </div>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {t('calc.referenceYear')}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value))}
              className="focus-ring h-[58px] w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Confirm Button */}
          <div className="flex items-end">
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => canConfirm && onConfirm?.(ranking)}
              className="focus-ring inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {t('calc.confirm')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {showResults && stats && ranking && groupedResults && (
        <AdmissionChanceResults
          ranking={ranking}
          selectedYear={selectedYear}
          stats={stats}
          groupedResults={groupedResults}
        />
      )}

      {/* Empty State */}
      {showEmptyState && !ranking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-3xl p-8 text-center"
        >
          <Sparkles className="h-12 w-12 text-blue-600/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {t('calc.empty.title')}
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {t('calc.empty.desc')}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export function AdmissionChanceResults({
  ranking,
  selectedYear,
  stats,
  groupedResults,
}: {
  ranking: string
  selectedYear: number
  stats: AdmissionStats
  groupedResults: GroupedResults
}) {
  const { t } = useLanguage()
  const getSafetyConfig = (level: 'safe' | 'moderate' | 'risky') => {
    switch (level) {
      case 'safe':
        return {
          icon: Shield,
          color: 'emerald',
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-200',
          textClass: 'text-emerald-700',
          iconClass: 'text-emerald-600',
          label: t('calc.safe'),
          description: t('calc.safe.desc'),
        }
      case 'moderate':
        return {
          icon: AlertTriangle,
          color: 'amber',
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-200',
          textClass: 'text-amber-700',
          iconClass: 'text-amber-600',
          label: t('calc.moderate'),
          description: t('calc.moderate.desc'),
        }
      case 'risky':
        return {
          icon: AlertCircle,
          color: 'rose',
          bgClass: 'bg-rose-50',
          borderClass: 'border-rose-200',
          textClass: 'text-rose-700',
          iconClass: 'text-rose-600',
          label: t('calc.risky'),
          description: t('calc.risky.desc'),
        }
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {stats.accessiblePercent}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('calc.stats.accessible')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.safeCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('calc.stats.safe')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {stats.uniqueUniversities}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('calc.stats.universities')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-indigo-600 mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-slate-900">
              {stats.totalAccessible}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('calc.stats.totalPrograms')}
            </div>
          </motion.div>
        </div>

        {/* Safety Level Breakdown */}
        <div className="grid gap-4 md:grid-cols-3">
          {(['safe', 'moderate', 'risky'] as const).map((level, idx) => {
            const config = getSafetyConfig(level)
            const Icon = config.icon
            const items = groupedResults[level]

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`rounded-2xl border ${config.borderClass} ${config.bgClass} p-5`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.iconClass}`} />
                    <span className={`font-semibold ${config.textClass}`}>
                      {config.label}
                    </span>
                  </div>
                  <span className={`text-2xl font-bold ${config.textClass}`}>
                    {items.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  {config.description}
                </p>

                <div className="space-y-2">
                  {items.slice(0, 3).map((item, i) => (
                    <div
                      key={`${item.组名}-${i}`}
                      className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-2 text-sm"
                    >
                      <div className="truncate flex-1">
                        <span className="font-medium text-slate-900">
                          {item.组名}
                        </span>
                      </div>
                      <span className="text-slate-500 text-xs ml-2">
                        {item.最低排名.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <Link
                      href={`/lookup?ranking=${ranking}&year=${selectedYear}&filter=${level}`}
                      className="flex items-center justify-center gap-1 rounded-xl bg-white/60 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white/80 transition-colors"
                    >
                      {t('calc.viewMore', { count: items.length - 3 })}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
