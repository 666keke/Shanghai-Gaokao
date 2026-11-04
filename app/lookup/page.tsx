'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import {
  Target,
  ChevronRight,
  Shield,
  AlertTriangle,
  AlertCircle,
  Search,
  BarChart3,
  HelpCircle,
  X,
} from 'lucide-react'
import { useLookup, type SafetyFilter } from '../../contexts/LookupContext'
import EmptyState from '../../components/ui/EmptyState'
import { useLanguage } from '../../contexts/LanguageContext'
import { useDisclaimer } from '../../contexts/DisclaimerContext'
import { useCompareBasket } from '../../contexts/CompareBasketContext'
import { MotionCollapse, MotionDisclosure, MotionScope, SelectionMarker, StateSlot } from '../../components/ui/Motion'
import { motionEase, motionTime } from '../../lib/motion'
import CompareMenu from '../../components/CompareMenu'
import MobileNavigation from '../../components/MobileNavigation'
import DisclaimerBanner from '../../components/DisclaimerBanner'
import { getDataPath } from '../../lib/utils'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string | null
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
  投档线: string | null
  最低排名: number
  年份: number
  margin: number
  safetyLevel: 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted'
}

// Helper function to check if the score is 580 or above (special case)
function is580OrAbove(score: string | null | undefined): boolean {
  if (typeof score !== 'string') return false
  const normalized = score.replace(/\s/g, '')
  return normalized === '580' || /^580(?:分)?(?:及)?以上$/.test(normalized)
}

function LookupContent() {
  const { t } = useLanguage()
  const { hasAgreed, isLoading } = useDisclaimer()
  const basket = useCompareBasket()
  const searchParams = useSearchParams()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const reduceMotion = useReducedMotion()

  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const { userRanking, setUserRanking, selectedYear, setSelectedYear, safetyFilter, setSafetyFilter, searchTerm, setSearchTerm, searchOpen, setSearchOpen } = useLookup()
  const [displayLimit, setDisplayLimit] = useState(30)
  const [loadError, setLoadError] = useState(false)
  useEffect(() => { if (searchOpen) document.querySelector<HTMLInputElement>('#result-search input')?.focus({ preventScroll: true }) }, [searchOpen])
  const validRanking = /^[1-9]\d*$/.test(userRanking) && Number.isSafeInteger(Number(userRanking))
  useEffect(() => { setDisplayLimit(30) }, [userRanking, selectedYear, safetyFilter, searchTerm])
  const compareHref =
    basket.universities.length === 0 && basket.majorGroups.length > 0
      ? '/trends#major-groups'
      : '/trends'

  // Initialize from URL params
  useEffect(() => {
    const rankingParam = searchParams.get('ranking')
    const yearParam = searchParams.get('year')
    const filterParam = searchParams.get('filter') as SafetyFilter | null

    if (rankingParam !== null) setUserRanking(rankingParam)
    if (yearParam && /^20\d{2}$/.test(yearParam)) setSelectedYear(Number(yearParam))
    if (filterParam && ['all', 'possiblySafe', 'safe', 'moderate', 'risky', 'notAdmitted'].includes(filterParam)) {
      setSafetyFilter(filterParam)
    }
  }, [searchParams, setUserRanking, setSelectedYear, setSafetyFilter])

  useEffect(() => {
    fetch(getDataPath())
      .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.json() })
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setLoadError(true)
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
    if (!/^[1-9]\d*$/.test(userRanking) || !Number.isSafeInteger(ranking)) return []

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
          label: isChinese ? '未达往年位次' : 'Below past cutoff',
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
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lookup-page min-h-screen pb-16">
      <header className="library-heading page-wrap">
        <h1>{t('lookup.title')}</h1>
      </header>
      <div className="page-wrap"><DisclaimerBanner /></div>

      {/* Search Controls */}
      <section className={`lookup-input-section ${!isLoading && !hasAgreed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="page-wrap">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            className="lookup-inputs"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_100px] gap-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:gap-4">
              {/* Ranking Input */}
              <div>
                <label htmlFor="ranking" className="block text-sm font-medium text-slate-700 mb-2">
                  {isChinese ? '全市位次' : 'Your rank'}
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="ranking"
                    type="text"
                    inputMode="numeric"
                    aria-invalid={!!userRanking && !validRanking}
                    aria-describedby="ranking-help"
                    placeholder={t('calc.placeholder')}
                    value={userRanking}
                    onChange={(e) => {
                      setUserRanking(e.target.value)
                      setDisplayLimit(30)
                    }}
                    className="focus-ring h-[46px] w-full rounded-lg border border-stone-300 bg-white pl-10 pr-4 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"

                  />
                </div>
              </div>

              <p id="ranking-help" className={`${userRanking && !validRanking ? '' : 'hidden'} col-span-2 order-last text-xs text-slate-500`}>{userRanking && !validRanking ? (isChinese ? '请输入大于0的整数位次。' : 'Enter a positive whole-number rank.') : (isChinese ? '结果自动更新，位次数字越小越靠前' : 'Results update automatically · Lower rank is better')}</p>
              {/* Year Selector */}
              <div>
                <label htmlFor="reference-year" className="block text-sm font-medium text-slate-700 mb-2">
                  {isChinese ? '年份' : 'Year'}
                </label>
                <select
                  id="reference-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="focus-ring h-[46px] w-full rounded-lg border border-stone-300 bg-white px-4 text-base"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

            </div>
            {loadError && <p role="alert" className="mt-3 text-sm text-rose-700">{isChinese ? '数据加载失败，请刷新页面重试。' : 'Unable to load data. Refresh to retry.'}</p>}

          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="pb-10">
        <div className="page-wrap">
          {validRanking && !loadError && (
            <div className="lookup-toolbar mb-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h2 aria-live="polite" className="text-sm font-medium text-slate-500">{isChinese ? '专业组' : 'Groups'} <StateSlot className="font-semibold text-slate-900" value={filteredResults.length.toLocaleString()} /></h2>
                <div className="flex items-center gap-1">
                  {(safetyFilter !== 'all' || searchTerm) && <button className="focus-ring min-h-[44px] rounded-md px-3 text-xs text-slate-500" onClick={() => { setSafetyFilter('all'); setSearchTerm('') }}>{isChinese ? '重置' : 'Reset'}</button>}
                  <button type="button" className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-600" aria-expanded={searchOpen} aria-controls="result-search" aria-label={isChinese ? (searchOpen ? '关闭搜索' : '搜索院校') : 'Toggle search'} onClick={() => { if (searchOpen) setSearchTerm(''); setSearchOpen(open => !open) }}>{searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}</button>
                </div>
              </div>
              <MotionScope><div className="filter-tabs" role="group" aria-label={isChinese ? '按录取参考类别筛选' : 'Filter by category'}>
                {(['all', 'possiblySafe', 'safe', 'moderate', 'risky', 'notAdmitted'] as const).map(level => {
                  const count = level === 'all' ? stats.total : stats[level]
                  return <button key={level} type="button" aria-pressed={safetyFilter === level} onClick={() => setSafetyFilter(level)} className={`focus-ring filter-tab ${safetyFilter === level ? 'is-active' : ''}`}>
                    {safetyFilter === level && <SelectionMarker id="lookup-filter" />}<span className="motion-tab-label">{level === 'all' ? (isChinese ? '全部' : 'All') : level === 'possiblySafe' ? (isChinese ? '待核实' : 'Uncertain') : level === 'notAdmitted' ? (isChinese ? '未达线' : 'Below cutoff') : getSafetyConfig(level).label}</span><span>{count.toLocaleString()}</span>
                  </button>
                })}
              </div></MotionScope>
              <MotionCollapse open={!!(searchOpen || searchTerm)}><div id="result-search" className="relative">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <input aria-label={isChinese ? '筛选院校或专业组' : 'Filter universities or groups'} className="focus-ring h-11 w-full rounded-lg border border-stone-200 bg-white pl-10 pr-4 text-base" placeholder={isChinese ? '搜索院校、专业组' : 'Search universities or groups'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div></MotionCollapse>

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
                className="result-list motion-result-list"
              >
                <AnimatePresence initial={false} mode="popLayout">{filteredResults.slice(0, displayLimit).map((option, index) => {
                  const config = getSafetyConfig(option.safetyLevel)
                  const Icon = config.icon

                  return (
                    <motion.article key={option.组名} layout="position" initial={reduceMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, pointerEvents: 'none' }} transition={{ duration: reduceMotion ? 0 : motionTime.feedback, ease: motionEase.arrive }} className="result-row">
                      <div className="result-topline">
                        <div className="result-identity">
                          <h3 className="text-base font-semibold text-slate-900">{option.院校名}<span className="ml-2 text-sm font-normal text-slate-500">{option.组号}{isChinese ? '组' : ''}</span></h3>
                          <span className={`mt-1 inline-flex items-center gap-1 text-xs ${config.textClass}`}><Icon className="h-3 w-3" />{config.hasInfo ? (isChinese ? '待核实' : 'Verify cutoff') : config.label}</span>
                        </div>
                        <CompareMenu universityName={option.院校名} groupName={option.组名} />
                      </div>
                      <dl className="result-metrics">
                        <div><dt>{isChinese ? (config.hasInfo ? '580分位次' : '往年位次') : 'Past rank'}</dt><dd>{option.最低排名.toLocaleString()}</dd></div>
                        <div><dt>{isChinese ? '位次差' : 'Rank gap'}</dt><dd className={config.textClass}>{option.margin >= 0 ? '+' : ''}{option.margin.toLocaleString()}</dd></div>
                        <div><dt>{isChinese ? '投档线' : 'Cutoff'}</dt><dd>{config.hasInfo ? '580+' : option.投档线 || '—'}</dd></div>
                      </dl>
                      <MotionDisclosure className="result-details">
                        <summary className="focus-ring">{isChinese ? '详情' : 'Details'}<ChevronRight className="h-3.5 w-3.5" /></summary>
                        <div className="result-detail-content">
                          <p className="font-medium text-slate-700">{option.组名} · {selectedYear}</p>
                          <p>{isChinese ? '位次差等于往年参考位次减去你的位次，仅供参考。' : 'Rank gap = historical reference rank minus your rank. For reference only.'}</p>
                          {config.hasInfo && <p>{t('calc.possiblySafe.info')}</p>}

                        </div>
                      </MotionDisclosure>
                    </motion.article>
                  )
                })}</AnimatePresence>

                {/* Load More */}
                {filteredResults.length > displayLimit && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 30)}
                      className="focus-ring inline-flex items-center gap-2 rounded-lg bg-[var(--brand-dark)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--brand)]"
                    >
                      {t('dashboard.loadMore', {
                        remaining: filteredResults.length - displayLimit,
                      })}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : validRanking ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <EmptyState icon={<Target className="h-8 w-8" />} action={<button type="button" className="focus-ring library-add" onClick={() => { setSafetyFilter('all'); setSearchTerm('') }}>{isChinese ? '重置筛选' : 'Reset filters'}</button>}>
                  {t('lookup.noResults')}
                </EmptyState>
              </motion.div>
            ) : (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <EmptyState icon={<Target className="h-8 w-8" />} action={<button type="button" className="focus-ring library-add" disabled={!hasAgreed || isLoading || loadError} onClick={() => document.getElementById('ranking')?.focus()}>{isChinese ? '输入位次' : 'Enter rank'}</button>}>
                  {isChinese ? '输入全市位次，查看可选专业组' : 'Enter your citywide rank to explore major groups'}
                </EmptyState>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <AnimatePresence>
        {basket.hasHydrated && basket.totalItems > 0 && (
          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="hidden sm:block fixed right-4 z-[60] sm:right-6"
            style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <Link
              href={compareHref}
              aria-label={isChinese ? `查看对比篮，${basket.totalItems} 项` : `Open compare basket, ${basket.totalItems} items`}
              className="focus-ring group relative inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 bg-[var(--brand-dark)] px-3.5 text-sm font-semibold text-white shadow-lg transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--brand)] motion-reduce:transition-none"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isChinese ? '查看对比篮' : 'Compare basket'}
              </span>
              <span className="sm:hidden">
                {isChinese ? '对比' : 'Compare'}
              </span>
              <motion.span
                key={basket.totalItems}
                initial={reduceMotion ? false : { scale: 0.88, opacity: 0.82 }}
                animate={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-white px-1.5 text-xs font-bold tabular-nums text-[color:var(--brand-dark)] shadow-[0_1px_0_rgba(255,255,255,0.55)_inset] transition group-hover:bg-white/95 motion-reduce:transition-none"
              >
                {basket.totalItems}
              </motion.span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileNavigation active="lookup" />

      {/* Footer */}

    </div>
  )
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent"></div>
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  )
}
