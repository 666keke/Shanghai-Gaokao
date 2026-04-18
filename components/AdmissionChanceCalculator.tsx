'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
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
  
  const getSafetyConfig = (level: 'possiblySafe' | 'safe' | 'moderate' | 'risky') => {
    switch (level) {
      case 'possiblySafe':
        return {
          icon: HelpCircle,
          color: 'sky',
          bgClass: 'bg-sky-50',
          borderClass: 'border-sky-200',
          textClass: 'text-sky-700',
          iconClass: 'text-sky-600',
          label: t('calc.possiblySafe'),
          description: t('calc.possiblySafe.desc'),
          hasInfo: true,
        }
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
          hasInfo: false,
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
          hasInfo: false,
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
          hasInfo: false,
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
            className="workbench-card rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[color:var(--brand)] mb-2">
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
            className="workbench-card rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.safeCount + stats.possiblySafeCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {t('calc.stats.safe')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="workbench-card rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[color:var(--sage)] mb-2">
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
            className="workbench-card rounded-lg p-4 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-[color:var(--brand)] mb-2">
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
        <div className="grid gap-4 md:grid-cols-2">
          {(['possiblySafe', 'safe', 'moderate', 'risky'] as const).map((level, idx) => {
            const config = getSafetyConfig(level)
            const Icon = config.icon
            const items = groupedResults[level]

            // Skip if no items for this level
            if (items.length === 0) return null

            return (
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`rounded-lg border ${config.borderClass} ${config.bgClass} p-5`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.iconClass}`} />
                    <span className={`whitespace-nowrap font-semibold ${config.textClass}`}>
                      {config.label}
                    </span>
                    {config.hasInfo && (
                      <button
                        onClick={() => setShowPossiblySafeInfo(!showPossiblySafeInfo)}
                        className="text-sky-500 hover:text-sky-600 transition-colors"
                        title={t('calc.possiblySafe.info')}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <span className={`shrink-0 text-2xl font-bold ${config.textClass}`}>
                    {items.length}
                  </span>
                </div>
                
                {/* Info tooltip for possiblySafe */}
                {config.hasInfo && showPossiblySafeInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 rounded-lg border border-sky-200 bg-sky-100/50 p-3"
                  >
                    <p className="text-xs text-sky-800">
                      {t('calc.possiblySafe.info')}
                    </p>
                  </motion.div>
                )}
                
                <p className="text-xs text-slate-600 mb-4">
                  {config.description}
                </p>

                <div className="space-y-2">
                  {items.slice(0, 3).map((item, i) => (
                    <div
                      key={`${item.组名}-${i}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-lg bg-white/70 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <span className="break-words font-medium leading-5 text-slate-900">
                          {item.组名}
                        </span>
                      </div>
                      <span className="whitespace-nowrap pt-0.5 text-xs text-slate-500">
                        {item.最低排名.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <Link
                      href={`/lookup?ranking=${ranking}&year=${selectedYear}&filter=${level}`}
                      className="flex items-center justify-center gap-1 rounded-lg bg-white/70 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white"
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
