'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import type { CSSProperties } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  Shield,
  AlertTriangle,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Info,
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
  safetyLevel: 'possiblySafe' | 'safe' | 'moderate' | 'risky'
}

export interface GroupedResults {
  possiblySafe: AdmissionResult[]
  safe: AdmissionResult[]
  moderate: AdmissionResult[]
  risky: AdmissionResult[]
}

// Helper function to check if the score is 580 or above (special case)
function is580OrAbove(score: string): boolean {
  return score.includes('580') && (score.includes('及以上') || score.includes('分及以上') || score === '580')
}

export interface AdmissionStats {
  totalAccessible: number
  totalPrograms: number
  accessiblePercent: number
  uniqueUniversities: number
  possiblySafeCount: number
  safeCount: number
  moderateCount: number
  riskyCount: number
}

interface AdmissionChanceCalculatorProps {
  data: UniversityData[]
  selectedYear: number
  years: number[]
  onYearChange: (year: number) => void
  rankPresets?: number[]
  embedded?: boolean
  compact?: boolean
  onExpand?: () => void
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
  rankPresets,
  embedded = false,
  compact = false,
  onExpand,
  onRankingChange,
  showEmptyState = true,
  showResults = true,
  onResultsChange,
  onConfirm,
}: AdmissionChanceCalculatorProps) {
  const { t } = useLanguage()
  const [ranking, setRanking] = useState('')
  const [isCalculating, setIsCalculating] = useState(false)
  const [rankBinCount, setRankBinCount] = useState(20)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBinCount = () => {
      if (window.innerWidth >= 1280) {
        setRankBinCount(44)
      } else if (window.innerWidth >= 1024) {
        setRankBinCount(36)
      } else if (window.innerWidth >= 640) {
        setRankBinCount(28)
      } else {
        setRankBinCount(20)
      }
    }

    updateBinCount()
    window.addEventListener('resize', updateBinCount)
    return () => window.removeEventListener('resize', updateBinCount)
  }, [])

  // Calculate admission chances based on ranking
  const results = useMemo(() => {
    const rankingNum = parseInt(ranking)
    if (isNaN(rankingNum) || rankingNum <= 0) return null

    const yearData = data.filter((item) => item.年份 === selectedYear)

    const matches: AdmissionResult[] = []

    yearData.forEach((item) => {
      // Must have ranking data to be considered
      if (!item.最低排名) return
      
      // User's ranking must be good enough (lower number = better ranking)
      if (rankingNum > item.最低排名) return

      const margin = item.最低排名 - rankingNum

      // Special case: 580 or above scores - mark as possiblySafe
      // The ranking exists (it's the ranking at exactly 580 points)
      // but we can't calculate precise safety level since actual score is unknown
      if (is580OrAbove(item.投档线)) {
        matches.push({
          组名: item.组名,
          院校名: item.院校名,
          组号: item.组号,
          投档线: item.投档线,
          最低排名: item.最低排名,
          年份: item.年份,
          margin,
          safetyLevel: 'possiblySafe',
        })
        return
      }

      // Normal case: calculate safety level based on margin
      let safetyLevel: 'possiblySafe' | 'safe' | 'moderate' | 'risky'
      if (margin > 1000) safetyLevel = 'safe'
      else if (margin > 500) safetyLevel = 'moderate'
      else safetyLevel = 'risky'

      matches.push({
        组名: item.组名,
        院校名: item.院校名,
        组号: item.组号,
        投档线: item.投档线,
        最低排名: item.最低排名,
        年份: item.年份,
        margin,
        safetyLevel,
      })
    })

    // Sort: possiblySafe first (by ranking), then by ranking
    matches.sort((a, b) => {
      if (a.safetyLevel === 'possiblySafe' && b.safetyLevel !== 'possiblySafe') return -1
      if (a.safetyLevel !== 'possiblySafe' && b.safetyLevel === 'possiblySafe') return 1
      return (a.最低排名 || 0) - (b.最低排名 || 0)
    })

    return matches
  }, [ranking, selectedYear, data])

  // Group results by safety level
  const groupedResults = useMemo(() => {
    if (!results) return null
    return {
      possiblySafe: results.filter((r) => r.safetyLevel === 'possiblySafe'),
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
      (item) => item.年份 === selectedYear && (item.最低排名 || is580OrAbove(item.投档线))
    ).length
    const accessiblePercent = totalPrograms > 0 ? Math.round((results.length / totalPrograms) * 100) : 0

    const uniqueUniversities = new Set(results.map((r) => r.院校名)).size

    return {
      totalAccessible: results.length,
      totalPrograms,
      accessiblePercent,
      uniqueUniversities,
      possiblySafeCount: groupedResults?.possiblySafe.length || 0,
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
  const isChinese = t('calc.title') === '录取概率分析'
  const transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.25, 1, 0.5, 1] as const }
  const handleConfirm = useCallback(() => {
    if (!canConfirm) return
    onConfirm?.(ranking)
  }, [canConfirm, onConfirm, ranking])
  const yearRankRange = useMemo(() => {
    const ranks = data
      .filter((item) => item.年份 === selectedYear && item.最低排名)
      .map((item) => item.最低排名!)

    return {
      min: 1,
      max: ranks.length ? Math.max(...ranks) : 0,
    }
  }, [data, selectedYear])
  const rankDistributionBins = useMemo(() => {
    const ranks = data
      .filter((item) => item.年份 === selectedYear && item.最低排名)
      .map((item) => item.最低排名!)
    const maxRank = ranks.length ? Math.max(...ranks) : 0
    const bins = Array.from({ length: rankBinCount }, () => 0)

    if (maxRank <= 1) return bins.map(() => 0.25)

    ranks.forEach((rankValue) => {
      const index = Math.min(
        bins.length - 1,
        Math.max(0, Math.floor(((rankValue - 1) / (maxRank - 1)) * bins.length))
      )
      bins[index] += 1
    })

    const maxBin = Math.max(...bins, 1)
    return bins.map((count) => (count / maxBin) * 0.74 + 0.26)
  }, [data, rankBinCount, selectedYear])

  return (
    <div className={compact ? '' : 'space-y-8'}>
      {/* Main Calculator Card */}
      <motion.div
        initial={{ opacity: 0, y: embedded ? 10 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
        className={
          embedded
            ? compact
              ? ''
              : 'border-t border-stone-200/80 pt-5 sm:pt-6'
            : 'workbench-card rounded-lg p-5 sm:p-6'
        }
      >
        {embedded ? (
          <>
            <motion.div
              initial={false}
              animate={
                compact
                  ? { height: 'auto', opacity: 1, y: 0 }
                  : { height: 0, opacity: 0, y: shouldReduceMotion ? 0 : 6 }
              }
              transition={transition}
              className="overflow-hidden"
              aria-hidden={!compact}
            >
              <div
                className={`grid grid-cols-[minmax(5.75rem,1fr)_4.75rem_4.75rem_2.5rem] items-center gap-2 sm:grid-cols-[minmax(12rem,1fr)_7rem_7rem_auto] ${
                  compact ? '' : 'pointer-events-none'
                }`}
              >
                <label className="focus-within:border-[color:var(--brand)] flex h-11 min-w-0 items-center gap-1.5 rounded-md border border-stone-200 bg-white/80 px-2 transition-colors">
                  <span className="shrink-0 text-[11px] font-semibold text-[color:var(--ink-soft)]">
                    {isChinese ? '位次' : 'Rank'}
                  </span>
                  <input
                    type="number"
                    value={ranking}
                    onChange={(e) => handleRankingChange(e.target.value)}
                    placeholder={isChinese ? '输入' : 'Rank'}
                    aria-label={t('calc.yourRanking')}
                    className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[color:var(--ink)] outline-none placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    min="1"
                    disabled={!compact}
                  />
                </label>

                <label className="focus-within:border-[color:var(--brand)] flex h-11 min-w-0 items-center rounded-md border border-stone-200 bg-white/80 px-1.5 transition-colors sm:px-2">
                  <span className="sr-only">{t('calc.referenceYear')}</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    aria-label={t('calc.referenceYear')}
                    className="w-full bg-transparent text-base font-semibold text-[color:var(--ink)] outline-none sm:text-sm"
                    disabled={!compact}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  disabled={!compact || !canConfirm}
                  onClick={handleConfirm}
                  className="focus-ring inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-md bg-[var(--brand-dark)] px-2 text-xs font-semibold text-white transition hover:bg-[var(--brand)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-3 sm:text-sm"
                >
                  {isChinese ? '确认' : 'Go'}
                  <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
                </button>

                <button
                  type="button"
                  onClick={onExpand}
                  aria-expanded={false}
                  aria-label={isChinese ? '展开位次输入' : 'Expand rank input'}
                  disabled={!compact}
                  className="focus-ring inline-flex h-11 min-w-0 items-center justify-center gap-1 rounded-md border border-stone-200 bg-white/70 px-2 text-xs font-semibold text-[color:var(--ink-soft)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] active:scale-[0.98] sm:px-3"
                >
                  <ChevronDown className="h-4 w-4" />
                  <span className="hidden sm:inline">{isChinese ? '展开' : 'Edit'}</span>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={false}
              animate={
                compact
                  ? { height: 0, opacity: 0, y: shouldReduceMotion ? 0 : -6 }
                  : { height: 'auto', opacity: 1, y: 0 }
              }
              transition={transition}
              className="overflow-hidden"
              aria-hidden={compact}
            >
              <div className={`grid gap-4 ${compact ? 'pointer-events-none' : ''}`}>
                {/* Ranking Input */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    {t('calc.yourRanking')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={ranking}
                      onChange={(e) => handleRankingChange(e.target.value)}
                      placeholder={t('calc.placeholder')}
                      className="focus-ring h-[56px] w-full rounded-lg border border-stone-300 bg-white px-4 text-xl font-semibold placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      min="1"
                      disabled={compact}
                    />
                    {isCalculating && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <RankDistribution
                    ranking={canConfirm ? rankingNumber : null}
                    minRank={yearRankRange.min}
                    maxRank={yearRankRange.max}
                    bins={rankDistributionBins}
                    reduceMotion={shouldReduceMotion}
                  />
                </div>

                <div
                  className={
                    embedded
                      ? 'grid gap-4 sm:grid-cols-[120px_128px] sm:justify-end sm:items-end'
                      : 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px_128px] sm:items-end'
                  }
                >
                  {(!embedded || (rankPresets && rankPresets.length > 0)) && (
                    <div>
                      <p className="text-xs text-slate-500">{t('calc.hint')}</p>
                      {rankPresets && rankPresets.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">
                            {isChinese ? '常见位次' : 'Try rank'}
                          </span>
                          {rankPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              disabled={compact}
                              onClick={() => handleRankingChange(String(preset))}
                              className={`focus-ring rounded-md border px-2.5 py-1 text-xs font-semibold transition active:scale-[0.98] ${
                                ranking === String(preset)
                                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[color:var(--brand-dark)]'
                                  : 'border-stone-200 bg-white text-slate-600 hover:border-[var(--brand)] hover:text-[color:var(--brand)]'
                              }`}
                            >
                              {preset.toLocaleString()}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Year Selector */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t('calc.referenceYear')}
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => onYearChange(parseInt(e.target.value))}
                      className="focus-ring h-[54px] w-full rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium"
                      disabled={compact}
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
                      disabled={compact || !canConfirm}
                      onClick={handleConfirm}
                      className="focus-ring inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                    >
                      {t('calc.confirm')}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--brand-soft)]">
                <Target className="h-5 w-5 text-[color:var(--brand-dark)]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {t('calc.title')}
                </h2>
                <p className="text-sm text-slate-500">{t('calc.subtitle')}</p>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Ranking Input */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  {t('calc.yourRanking')}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={ranking}
                    onChange={(e) => handleRankingChange(e.target.value)}
                    placeholder={t('calc.placeholder')}
                    className="focus-ring h-[56px] w-full rounded-lg border border-stone-300 bg-white px-4 text-xl font-semibold placeholder:text-slate-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    min="1"
                  />
                  {isCalculating && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
                    </div>
                  )}
                </div>
                <RankDistribution
                  ranking={canConfirm ? rankingNumber : null}
                  minRank={yearRankRange.min}
                  maxRank={yearRankRange.max}
                  bins={rankDistributionBins}
                  reduceMotion={shouldReduceMotion}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px_128px] sm:items-end">
                {(!embedded || (rankPresets && rankPresets.length > 0)) && (
                  <div>
                    <p className="text-xs text-slate-500">{t('calc.hint')}</p>
                    {rankPresets && rankPresets.length > 0 && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {isChinese ? '常见位次' : 'Try rank'}
                        </span>
                        {rankPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleRankingChange(String(preset))}
                            className={`focus-ring rounded-md border px-2.5 py-1 text-xs font-semibold transition active:scale-[0.98] ${
                              ranking === String(preset)
                                ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[color:var(--brand-dark)]'
                                : 'border-stone-200 bg-white text-slate-600 hover:border-[var(--brand)] hover:text-[color:var(--brand)]'
                            }`}
                          >
                            {preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Year Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {t('calc.referenceYear')}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(parseInt(e.target.value))}
                    className="focus-ring h-[54px] w-full rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium"
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
                    onClick={handleConfirm}
                    className="focus-ring inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand)] active:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0"
                  >
                    {t('calc.confirm')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
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
          className="workbench-card rounded-lg p-8 text-center"
        >
          <Sparkles className="h-12 w-12 text-[color:var(--brand)] mx-auto mb-4" />
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

function RankDistribution({
  ranking,
  minRank,
  maxRank,
  bins,
  reduceMotion,
}: {
  ranking: number | null
  minRank: number
  maxRank: number
  bins: number[]
  reduceMotion: boolean | null
}) {
  const { t } = useLanguage()
  const hasRange = maxRank > minRank
  const rawPosition = hasRange && ranking ? ((ranking - minRank) / (maxRank - minRank)) * 100 : 0
  const position = Math.min(100, Math.max(0, rawPosition))
  const percentText =
    hasRange && ranking
      ? Math.max(1, Math.min(100, Math.round((ranking / maxRank) * 100)))
      : null
  const isBeyondRange = Boolean(ranking && hasRange && ranking > maxRank)
  const markerLeft = hasRange && ranking ? position : 8
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.36, ease: [0.22, 1, 0.36, 1] }

  return (
    <div className="mt-3 px-1">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-[color:var(--ink)]">
          {t('calc.rankPosition.title')}
        </span>
        <span className="text-xs text-[color:var(--ink-soft)]">
          {ranking && percentText
            ? isBeyondRange
              ? t('calc.rankPosition.beyond')
              : t('calc.rankPosition.summary', { percent: percentText })
            : t('calc.rankPosition.empty')}
        </span>
      </div>

      <div className="relative h-11">
        <div className="absolute inset-x-0 top-3 flex h-8 items-end gap-0.5 overflow-hidden rounded-md bg-[color-mix(in_oklch,var(--brand-soft)_26%,white)] px-1.5 pb-1 sm:gap-1">
          {bins.map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-sm bg-[color-mix(in_oklch,var(--brand)_44%,white)]"
              style={{
                height: `${height * 100}%`,
                opacity: 0.32 + height * 0.28,
              }}
            />
          ))}
        </div>

        {ranking && (
          <motion.div
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
            initial={false}
            animate={{ left: `${markerLeft}%` }}
            transition={transition}
          >
            <div className="rounded-md bg-[var(--brand-dark)] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
              {ranking.toLocaleString()}
            </div>
            <div className="h-8 w-px bg-[var(--brand-dark)]" />
          </motion.div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-[color:var(--ink-soft)]">
        <span>{t('calc.rankPosition.front')}</span>
        <span>{t('calc.rankPosition.back')}</span>
      </div>
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
  const [showPossiblySafeInfo, setShowPossiblySafeInfo] = useState(false)
  const isChinese = t('calc.title') === '录取概率分析'
  
  const getSafetyConfig = (level: 'possiblySafe' | 'safe' | 'moderate' | 'risky') => {
    switch (level) {
      case 'possiblySafe':
        return {
          icon: HelpCircle,
          label: t('calc.possiblySafe'),
          description: t('calc.possiblySafe.desc'),
          hasInfo: true,
          accent: 'oklch(0.47 0.095 224)',
          surface: 'color-mix(in oklch, var(--brand-soft) 34%, white)',
          surfaceSoft: 'color-mix(in oklch, var(--brand-soft) 18%, white)',
          border: 'color-mix(in oklch, var(--brand) 24%, var(--line))',
          row: 'color-mix(in oklch, white 76%, var(--brand-soft))',
        }
      case 'safe':
        return {
          icon: Shield,
          label: t('calc.safe'),
          description: t('calc.safe.desc'),
          hasInfo: false,
          accent: 'var(--sage)',
          surface: 'color-mix(in oklch, var(--sage-soft) 42%, white)',
          surfaceSoft: 'color-mix(in oklch, var(--sage-soft) 22%, white)',
          border: 'color-mix(in oklch, var(--sage) 24%, var(--line))',
          row: 'color-mix(in oklch, white 78%, var(--sage-soft))',
        }
      case 'moderate':
        return {
          icon: AlertTriangle,
          label: t('calc.moderate'),
          description: t('calc.moderate.desc'),
          hasInfo: false,
          accent: 'oklch(0.55 0.115 72)',
          surface: 'color-mix(in oklch, var(--amber-soft) 36%, white)',
          surfaceSoft: 'color-mix(in oklch, var(--amber-soft) 20%, white)',
          border: 'color-mix(in oklch, oklch(0.55 0.115 72) 22%, var(--line))',
          row: 'color-mix(in oklch, white 78%, var(--amber-soft))',
        }
      case 'risky':
        return {
          icon: AlertCircle,
          label: t('calc.risky'),
          description: t('calc.risky.desc'),
          hasInfo: false,
          accent: 'oklch(0.52 0.115 18)',
          surface: 'color-mix(in oklch, var(--rose-soft) 34%, white)',
          surfaceSoft: 'color-mix(in oklch, var(--rose-soft) 20%, white)',
          border: 'color-mix(in oklch, oklch(0.52 0.115 18) 22%, var(--line))',
          row: 'color-mix(in oklch, white 78%, var(--rose-soft))',
        }
    }
  }

  const safetyLevels = (['possiblySafe', 'safe', 'moderate', 'risky'] as const).map((level) => ({
    level,
    count: groupedResults[level].length,
    config: getSafetyConfig(level),
  }))
  const totalVisible = safetyLevels.reduce((sum, item) => sum + item.count, 0)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
          className="workbench-card rounded-lg p-4 sm:p-5"
        >
          <div className="grid grid-cols-[34px_minmax(0,1fr)] gap-4 sm:grid-cols-[42px_minmax(0,1fr)] sm:gap-5">
            <div className="flex h-full min-h-36 flex-col-reverse gap-1 rounded-md bg-[color-mix(in_oklch,var(--paper)_68%,white)] p-1 shadow-[inset_0_0_0_1px_var(--line)]">
              {safetyLevels.map(({ level, count, config }) => {
                const segmentStyle = {
                  flexGrow: count > 0 ? Math.max(count, Math.max(totalVisible, 1) * 0.035) : 0,
                  background: config.accent,
                  opacity: count > 0 ? 0.88 : 0,
                } as CSSProperties

                return (
                  <motion.span
                    key={level}
                    initial={{ scaleY: 0.2, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: count > 0 ? 1 : 0 }}
                    transition={{ delay: 0.18, duration: 0.42, ease: [0.25, 1, 0.5, 1] }}
                    className="min-h-1 origin-bottom rounded-sm"
                    style={segmentStyle}
                    title={`${config.label}: ${count}`}
                  />
                )
              })}
            </div>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[color:var(--ink)]">
                    {isChinese ? '层级分布' : 'Safety mix'}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[color:var(--ink-soft)]">
                    {isChinese
                      ? `${Number(ranking).toLocaleString()} 位次下，共 ${totalVisible.toLocaleString()} 个可选专业组。`
                      : `${totalVisible.toLocaleString()} reachable major groups at rank ${Number(ranking).toLocaleString()}.`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-2xl font-semibold leading-none text-[color:var(--ink)]">
                    {stats.accessiblePercent}%
                  </div>
                  <div className="mt-1 text-[11px] font-medium text-[color:var(--ink-soft)]">
                    {isChinese ? '覆盖' : 'Reach'}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {safetyLevels.map(({ level, count, config }, idx) => {
                  const percent = totalVisible > 0 ? Math.round((count / totalVisible) * 100) : 0

                  return (
                    <motion.div
                      key={level}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.04, duration: 0.2 }}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-sm"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: config.accent }}
                      />
                      <span className="truncate font-medium text-[color:var(--ink)]">
                        {config.label}
                      </span>
                      <span className="tabular-nums text-[color:var(--ink-soft)]">
                        {count.toLocaleString()}
                        <span className="ml-1 text-xs">/ {percent}%</span>
                      </span>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Safety Level Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          {safetyLevels.map(({ level, config }, idx) => {
            const Icon = config.icon
            const items = groupedResults[level]
            const tierStyle = {
              '--tier-accent': config.accent,
              '--tier-surface': config.surface,
              '--tier-surface-soft': config.surfaceSoft,
              '--tier-border': config.border,
              '--tier-row': config.row,
            } as CSSProperties

            // Skip if no items for this level
            if (items.length === 0) return null

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 + idx * 0.06, duration: 0.26, ease: [0.25, 1, 0.5, 1] }}
                style={tierStyle}
                className="rounded-lg border border-[var(--tier-border)] bg-[var(--tier-surface)] p-4 shadow-[0_16px_44px_-38px_oklch(0.22_0.04_245/0.38)] sm:p-5"
              >
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2 text-[var(--tier-accent)]">
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <h3 className="truncate text-lg font-semibold leading-7">
                          {config.label}
                        </h3>
                      </div>
                      <p className="mt-1.5 max-w-[26rem] text-sm leading-6 text-[color:var(--ink-soft)]">
                        {config.description}
                      </p>
                      {config.hasInfo && (
                        <button
                          type="button"
                          aria-expanded={showPossiblySafeInfo}
                          aria-label={t('calc.possiblySafe.info')}
                          onClick={() => setShowPossiblySafeInfo(!showPossiblySafeInfo)}
                          className="focus-ring mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-[var(--tier-accent)] transition hover:bg-white/60 active:scale-[0.98]"
                          title={t('calc.possiblySafe.info')}
                        >
                          <Info className="h-3.5 w-3.5" />
                          {isChinese ? '说明' : 'Note'}
                        </button>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-[var(--tier-accent)]">
                      <div className="text-3xl font-semibold leading-none tabular-nums">
                        {items.length}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {config.hasInfo && showPossiblySafeInfo && (
                    <motion.div
                      key="possibly-safe-note"
                      initial={{ opacity: 0, height: 0, y: -4 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -4 }}
                      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mb-3 rounded-md border border-[color-mix(in_oklch,var(--tier-accent)_18%,transparent)] bg-[var(--tier-surface-soft)] px-3 py-2">
                        <p className="text-xs leading-5 text-[color:var(--ink-soft)]">
                          {t('calc.possiblySafe.info')}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {items.slice(0, 3).map((item, i) => (
                    <motion.div
                      key={`${item.组名}-${i}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28 + idx * 0.04 + i * 0.03, duration: 0.18 }}
                      className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-[var(--tier-row)] px-3 py-2 text-sm shadow-[inset_0_0_0_1px_oklch(1_0_0/0.42)]"
                    >
                      <div className="min-w-0">
                        <span className="break-words font-semibold leading-5 text-[color:var(--ink)]">
                          {item.组名}
                        </span>
                      </div>
                      <span className="whitespace-nowrap text-sm font-medium text-[color:var(--ink-soft)]">
                        {item.最低排名.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                  {items.length > 3 && (
                    <Link
                      href={`/lookup?ranking=${ranking}&year=${selectedYear}&filter=${level}`}
                      className="focus-ring flex min-h-11 items-center justify-center gap-1 rounded-md bg-white/65 px-3 py-2 text-sm font-semibold text-[color:var(--ink-soft)] transition hover:bg-white hover:text-[var(--tier-accent)] active:scale-[0.99]"
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
