'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  ChevronRight,
  Filter,
  Shield,
  AlertTriangle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  GraduationCap,
  BarChart3,
  Home,
  HelpCircle,
  Info,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useDisclaimer } from '../../contexts/DisclaimerContext'
import DisclaimerBanner from '../../components/DisclaimerBanner'
import { getDataPath } from '../../lib/utils'

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

interface AvailableOption {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number
  年份: number
  margin: number
  safetyLevel: 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted'
}

// Helper function to check if the score is 580 or above (special case)
function is580OrAbove(score: string): boolean {
  return score.includes('580') && (score.includes('及以上') || score.includes('分及以上') || score === '580')
}

function LookupContent() {
  const { t } = useLanguage()
  const { hasAgreed, isLoading } = useDisclaimer()
  const searchParams = useSearchParams()

  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [userRanking, setUserRanking] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [safetyFilter, setSafetyFilter] = useState<'all' | 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [displayLimit, setDisplayLimit] = useState(30)
  const [showPossiblySafeInfo, setShowPossiblySafeInfo] = useState(false)

  // Initialize from URL params
  useEffect(() => {
    const rankingParam = searchParams.get('ranking')
    const yearParam = searchParams.get('year')
    const filterParam = searchParams.get('filter') as 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted' | null

    if (rankingParam) setUserRanking(rankingParam)
    if (yearParam) setSelectedYear(parseInt(yearParam))
    if (filterParam && ['possiblySafe', 'safe', 'moderate', 'risky', 'notAdmitted'].includes(filterParam)) {
      setSafetyFilter(filterParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetch(getDataPath())
      .then((res) => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])

  const years = useMemo(
    () => Array.from(new Set(data.map((item) => item.年份))).sort((a, b) => b - a),
    [data]
  )

  // Calculate results (including not-admitted for filtering)
  const searchResults = useMemo(() => {
    const ranking = parseInt(userRanking)
    if (isNaN(ranking) || ranking <= 0) return []

    const options: AvailableOption[] = []

    data
      .filter((item) => item.年份 === selectedYear)
      .forEach((item) => {
        // Must have ranking data to be considered
        if (!item.最低排名) return

        const margin = item.最低排名 - ranking

        // User's ranking is not good enough - mark as notAdmitted
        if (ranking > item.最低排名) {
          options.push({
            组名: item.组名,
            院校名: item.院校名,
            组号: item.组号,
            投档线: item.投档线,
            最低排名: item.最低排名,
            年份: item.年份,
            margin, // Will be negative
            safetyLevel: 'notAdmitted',
          })
          return
        }

        // Special case: 580 or above scores - mark as possiblySafe
        // The ranking exists (it's the ranking at exactly 580 points)
        // but we can't calculate precise safety level since actual score is unknown
        if (is580OrAbove(item.投档线)) {
          options.push({
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
        let safetyLevel: 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted'
        if (margin > 1000) safetyLevel = 'safe'
        else if (margin > 500) safetyLevel = 'moderate'
        else safetyLevel = 'risky'

        options.push({
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

    return options
  }, [userRanking, selectedYear, data])

  // Apply filters and sorting
  const filteredResults = useMemo(() => {
    let results = [...searchResults]

    // By default, exclude notAdmitted unless specifically filtered
    if (safetyFilter === 'all') {
      results = results.filter((r) => r.safetyLevel !== 'notAdmitted')
    } else {
      results = results.filter((r) => r.safetyLevel === safetyFilter)
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      results = results.filter(
        (r) =>
          r.院校名.toLowerCase().includes(term) ||
          r.组名.toLowerCase().includes(term)
      )
    }

    // Sort by ranking (possiblySafe first, then by minimum ranking)
    results.sort((a, b) => {
      // notAdmitted items: sort by how close they are (least negative margin first)
      if (a.safetyLevel === 'notAdmitted' && b.safetyLevel === 'notAdmitted') {
        return b.margin - a.margin // Less negative first
      }
      
      // possiblySafe items first (among admitted)
      if (a.safetyLevel === 'possiblySafe' && b.safetyLevel !== 'possiblySafe' && b.safetyLevel !== 'notAdmitted') return -1
      if (a.safetyLevel !== 'possiblySafe' && a.safetyLevel !== 'notAdmitted' && b.safetyLevel === 'possiblySafe') return 1

      // Sort by ranking (lower ranking = more competitive)
      return a.最低排名 - b.最低排名
    })

    return results
  }, [searchResults, safetyFilter, searchTerm])

  // Stats (excluding notAdmitted from total counts)
  const stats = useMemo(() => {
    const admittedResults = searchResults.filter((r) => r.safetyLevel !== 'notAdmitted')
    return {
      total: admittedResults.length,
      possiblySafe: searchResults.filter((r) => r.safetyLevel === 'possiblySafe').length,
      safe: searchResults.filter((r) => r.safetyLevel === 'safe').length,
      moderate: searchResults.filter((r) => r.safetyLevel === 'moderate').length,
      risky: searchResults.filter((r) => r.safetyLevel === 'risky').length,
      notAdmitted: searchResults.filter((r) => r.safetyLevel === 'notAdmitted').length,
      universities: new Set(admittedResults.map((r) => r.院校名)).size,
    }
  }, [searchResults])

  const getSafetyConfig = (level: 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted') => {
    switch (level) {
      case 'notAdmitted':
        return {
          icon: AlertCircle,
          bgClass: 'bg-slate-50',
          borderClass: 'border-slate-300',
          textClass: 'text-slate-600',
          badgeClass: 'bg-slate-200 text-slate-700',
          label: t('calc.notAdmitted'),
          hasInfo: false,
        }
      case 'possiblySafe':
        return {
          icon: HelpCircle,
          bgClass: 'bg-sky-50',
          borderClass: 'border-sky-200',
          textClass: 'text-sky-700',
          badgeClass: 'bg-sky-100 text-sky-700',
          label: t('calc.possiblySafe'),
          hasInfo: true,
        }
      case 'safe':
        return {
          icon: Shield,
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-200',
          textClass: 'text-emerald-700',
          badgeClass: 'bg-emerald-100 text-emerald-700',
          label: t('calc.safe'),
          hasInfo: false,
        }
      case 'moderate':
        return {
          icon: AlertTriangle,
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-200',
          textClass: 'text-amber-700',
          badgeClass: 'bg-amber-100 text-amber-700',
          label: t('calc.moderate'),
          hasInfo: false,
        }
      case 'risky':
        return {
          icon: AlertCircle,
          bgClass: 'bg-rose-50',
          borderClass: 'border-rose-200',
          textClass: 'text-rose-700',
          badgeClass: 'bg-rose-100 text-rose-700',
          label: t('calc.risky'),
          hasInfo: false,
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <section className="pt-8 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900">{t('lookup.title')}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                {t('lookup.title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('lookup.subtitle')}</p>
            </div>

            {userRanking && stats.total > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {stats.possiblySafe > 0 && (
                  <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm">
                    <HelpCircle className="h-4 w-4 text-sky-600" />
                    <span className="font-medium text-sky-700">{stats.possiblySafe}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-emerald-700">{stats.safe}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-700">{stats.moderate}</span>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                  <span className="font-medium text-rose-700">{stats.risky}</span>
                </div>
              </div>
            )}
          </div>
          {/* Disclaimer Banner */}
          <DisclaimerBanner />
        </div>
      </section>

      {/* Search Controls */}
      <section className={`px-4 pb-6 ${!isLoading && !hasAgreed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto]">
              {/* Ranking Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('calc.yourRanking')}
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    placeholder={t('calc.placeholder')}
                    value={userRanking}
                    onChange={(e) => {
                      setUserRanking(e.target.value)
                      setDisplayLimit(30)
                    }}
                    className="focus-ring h-[46px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />
                </div>
              </div>

              {/* Year Selector */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('calc.referenceYear')}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="focus-ring h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Safety Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('lookup.safetyLevel')}
                </label>
                <select
                  value={safetyFilter}
                  onChange={(e) =>
                    setSafetyFilter(e.target.value as typeof safetyFilter)
                  }
                  className="focus-ring h-[46px] w-full rounded-xl border border-slate-200 bg-white px-4 text-sm"
                >
                  <option value="all">{t('lookup.allLevels')}</option>
                  <option value="possiblySafe">{t('calc.possiblySafe')}</option>
                  <option value="safe">{t('calc.safe')}</option>
                  <option value="moderate">{t('calc.moderate')}</option>
                  <option value="risky">{t('calc.risky')}</option>
                  <option value="notAdmitted">{t('calc.notAdmitted')}</option>
                </select>
              </div>
            </div>

            {/* Search within results */}
            {userRanking && searchResults.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('dashboard.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          {/* Results Header */}
          {userRanking && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {t('lookup.searchResults', {
                  count: filteredResults.length,
                  ranking: userRanking,
                  year: selectedYear,
                })}
              </p>
              {filteredResults.length !== searchResults.length && (
                <button
                  onClick={() => {
                    setSafetyFilter('all')
                    setSearchTerm('')
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t('common.clearSearch')}
                </button>
              )}
            </div>
          )}

          {/* Results List */}
          <AnimatePresence mode="wait">
            {filteredResults.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {filteredResults.slice(0, displayLimit).map((option, index) => {
                  const config = getSafetyConfig(option.safetyLevel)
                  const Icon = config.icon

                  return (
                    <motion.div
                      key={`${option.组名}-${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.3) }}
                      className={`rounded-2xl border ${config.borderClass} ${config.bgClass} p-4 transition-all hover:shadow-md`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-slate-900 truncate">
                              {option.院校名}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
                            >
                              <Icon className="h-3 w-3" />
                              {config.label}
                              {config.hasInfo && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowPossiblySafeInfo(!showPossiblySafeInfo)
                                  }}
                                  className="ml-0.5 hover:opacity-70"
                                >
                                  <Info className="h-3 w-3" />
                                </button>
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 truncate">
                            {option.组名} · {option.组号}
                          </p>
                          {config.hasInfo && showPossiblySafeInfo && (
                            <p className="text-xs text-sky-600 mt-1 bg-sky-50 rounded-lg px-2 py-1">
                              {t('calc.possiblySafe.info')}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-xs text-slate-500">
                              {t('lookup.minRanking')}
                            </p>
                            <p className="font-semibold text-slate-900">
                              {option.最低排名.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">
                              {option.safetyLevel === 'notAdmitted' ? t('lookup.gap') : t('lookup.yourMargin')}
                            </p>
                            <p className={`font-semibold ${config.textClass}`}>
                              {option.margin >= 0 ? '+' : ''}{option.margin.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-500">
                              {t('lookup.scoreLine')}
                            </p>
                            <p className="font-semibold text-slate-900">
                              {option.投档线}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {/* Load More */}
                {filteredResults.length > displayLimit && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 30)}
                      className="focus-ring inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      {t('dashboard.loadMore', {
                        remaining: filteredResults.length - displayLimit,
                      })}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : userRanking ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('lookup.noResults')}
                </h3>
                <p className="text-sm text-slate-600">
                  {t('lookup.noResults.message', {
                    ranking: userRanking,
                    year: selectedYear,
                  })}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-2xl p-8 text-center"
              >
                <Target className="h-12 w-12 text-blue-600/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('calc.empty.title')}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  {t('calc.empty.desc')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('lookup.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  )
}
