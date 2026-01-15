'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  ListFilter,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import SmartSearch from '../components/SmartSearch'
import dynamic from 'next/dynamic'
import { getSvgPath } from '../lib/utils'

// Dynamically import the TrendChart component to reduce initial bundle size
const TrendChart = dynamic(() => import('../components/TrendChart'))

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

interface HomePageClientProps {
  data: UniversityData[]
}

export default function HomePageClient({ data }: HomePageClientProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [displayLimit, setDisplayLimit] = useState(20)
  const [selectedMajorGroup, setSelectedMajorGroup] = useState<{name: string, university: string} | null>(null)
  const [showTrendModal, setShowTrendModal] = useState(false)
  const [sortBy, setSortBy] = useState<'ranking' | 'score' | 'name'>('ranking')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [rankedOnly, setRankedOnly] = useState(true)
  const [viewDensity, setViewDensity] = useState<'comfortable' | 'compact'>('comfortable')

  useEffect(() => {
    document.title = t('nav.title')
  }, [t])

  const parseScore = (score: string) => {
    const parsed = parseInt(score.replace(/[^\d]/g, ''), 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  const filteredData = useMemo(() => {
    const results = data.filter(item => {
      const matchesSearch = !searchTerm ||
        item.院校名.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.组名.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesYear = item.年份 === selectedYear
      const matchesRanking = rankedOnly ? Boolean(item.最低排名) : true

      return matchesSearch && matchesYear && matchesRanking
    })

    const sorted = [...results].sort((a, b) => {
      if (sortBy === 'name') {
        return a.院校名.localeCompare(b.院校名)
      }
      if (sortBy === 'score') {
        return (parseScore(a.投档线) || 0) - (parseScore(b.投档线) || 0)
      }
      return (a.最低排名 || Number.MAX_SAFE_INTEGER) - (b.最低排名 || Number.MAX_SAFE_INTEGER)
    })

    return sortOrder === 'desc' ? sorted.reverse() : sorted
  }, [data, searchTerm, selectedYear, rankedOnly, sortBy, sortOrder])

  useEffect(() => {
    setDisplayLimit(20)
  }, [searchTerm, selectedYear])

  const openTrendModal = (majorGroup: string, university: string) => {
    setSelectedMajorGroup({ name: majorGroup, university })
    setShowTrendModal(true)
  }

  const closeTrendModal = () => {
    setShowTrendModal(false)
    setSelectedMajorGroup(null)
  }

  const uniqueUniversities = useMemo(() => Array.from(new Set(data.map(item => item.院校名))), [data])
  const years = useMemo(() => Array.from(new Set(data.map(item => item.年份))).sort((a, b) => b - a), [data])

  const stats = useMemo(() => ({
    totalUniversities: uniqueUniversities.length,
    totalRecords: data.length,
    yearsCovered: years.length,
    avgRanking: Math.round(data.filter(d => d.最低排名).reduce((sum, d) => sum + (d.最低排名 || 0), 0) / data.filter(d => d.最低排名).length)
  }), [data, uniqueUniversities, years])

  const rankedCount = useMemo(() => data.filter(d => d.最低排名).length, [data])

  const spotlight = useMemo(() => {
    const byUniversity = new Map<string, number>()
    data.filter(item => item.年份 === selectedYear && item.最低排名).forEach(item => {
      const current = byUniversity.get(item.院校名)
      if (!current || item.最低排名! < current) {
        byUniversity.set(item.院校名, item.最低排名!)
      }
    })
    return Array.from(byUniversity.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 3)
      .map(([name, ranking]) => ({ name, ranking }))
  }, [data, selectedYear])

  const logoPool = useMemo(() => ([
    { name: 'Peking University', file: 'PKU.svg' },
    { name: 'Fudan University', file: 'FDU.svg' },
    { name: 'Zhejiang University', file: 'ZJU.svg' },
    { name: 'Nanjing University', file: 'NJU.svg' },
    { name: 'Beihang University', file: 'Beihang.svg' },
    { name: 'Nankai University', file: 'Nankai.svg' },
  ]), [])

  const [logoSelection, setLogoSelection] = useState(logoPool)

  useEffect(() => {
    setLogoSelection([...logoPool].sort(() => 0.5 - Math.random()))
  }, [logoPool])

  const logoCloud = logoSelection

  return (
    <div className="min-h-screen pb-16">
      <section className="min-h-[calc(100svh-96px)] md:min-h-[calc(100vh-96px)] px-4 py-12 sm:py-16 flex items-center">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.05fr_0.95fr] lg:grid-cols-[1.2fr_0.8fr] gap-10 md:gap-12 lg:gap-16 items-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl font-semibold text-slate-900 leading-tight mb-5">
              {t('dashboard.title') === '大学录取智能分析' ? (
                <span className="leading-tight sm:leading-normal">
                  大学录取<br className="sm:hidden" />
                  <span className="text-gradient">智能</span>
                  分析
                </span>
              ) : t('dashboard.title') === 'University Admission Intelligence' ? (
                <span className="leading-tight sm:leading-normal">
                  University Admission <span className="text-gradient">Intelligence</span>
                </span>
              ) : (
                t('dashboard.title')
              )}
            </h2>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0, y: 12 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.08, delayChildren: 0.1 }
                }
              }}
              className="mb-6"
            >
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6">
                {logoCloud.map((logo, index) => (
                  <motion.div
                    key={logo.file}
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.96 },
                      show: { opacity: 1, y: 0, scale: 1 }
                    }}
                    animate={{
                      y: [0, -6, 0],
                      transition: {
                        duration: 3.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.2
                      }
                    }}
                    className="flex items-center justify-center rounded-2xl border border-white/70 bg-white/80 p-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]"
                  >
                    <img
                      src={getSvgPath(logo.file)}
                      alt={logo.name}
                      className="h-10 w-10 object-contain opacity-80"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <p className="text-lg text-slate-600 mb-8">
              {t('dashboard.subtitle', { count: data.length.toLocaleString(), years: stats.yearsCovered })}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
              >
                {t('dashboard.actions.startSearch')}
                <ArrowUpRight className="h-4 w-4" />
              </button>
              <Link
                href="/trends"
                className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-600"
              >
                {t('dashboard.actions.viewTrends')}
                <TrendingUp className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="pill">
                <Users className="h-3.5 w-3.5 text-blue-600" />
                {stats.totalUniversities} {t('dashboard.stats.universities')}
              </span>
              <span className="pill">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                {stats.totalRecords.toLocaleString()} {t('dashboard.stats.records')}
              </span>
              <span className="pill">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                {stats.yearsCovered} {t('dashboard.stats.years')}
              </span>
              <span className="pill">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                {stats.avgRanking.toLocaleString()} {t('dashboard.stats.avgRanking')}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-white/90 via-white/80 to-blue-50/80 p-6 sm:p-8 shadow-[0_40px_80px_-60px_rgba(30,41,59,0.8)]"
          >
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -left-12 -bottom-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900">
                  {t('dashboard.heroInsights.title')}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{t('dashboard.heroInsights.subtitle')}</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-xs text-slate-600">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                {selectedYear}
              </div>
            </div>

            <div className="relative mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
                <p className="text-xs text-slate-500">{t('dashboard.stats.records')}</p>
                <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{stats.totalRecords.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
                <p className="text-xs text-slate-500">{t('dashboard.stats.universities')}</p>
                <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{stats.totalUniversities}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
                <p className="text-xs text-slate-500">{t('dashboard.heroInsights.ranked')}</p>
                <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{rankedCount.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.6)]">
                <p className="text-xs text-slate-500">{t('dashboard.stats.years')}</p>
                <p className="text-2xl sm:text-3xl font-semibold text-slate-900">{stats.yearsCovered}</p>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/trends" className="glass-card hover-lift rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t('nav.trends')}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.actions.viewTrends')}</h3>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </Link>
            <Link href="/compare" className="glass-card hover-lift rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t('nav.compare')}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.actions.viewCompare')}</h3>
                </div>
                <LayoutGrid className="h-5 w-5 text-purple-600" />
              </div>
            </Link>
            <Link href="/lookup" className="glass-card hover-lift rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t('nav.lookup')}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.actions.viewLookup')}</h3>
                </div>
                <ListFilter className="h-5 w-5 text-emerald-600" />
              </div>
            </Link>
            <div className="glass-card rounded-3xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">{t('dashboard.search.results')}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{filteredData.length.toLocaleString()}</h3>
                </div>
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="section-title">{t('dashboard.search.results')}</h3>
                <p className="section-subtitle">
                  {t('dashboard.searchResults.count', { count: filteredData.length.toLocaleString() })}
                  {searchTerm && ` • ${t('dashboard.searchResults.query', { query: searchTerm })}`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <SlidersHorizontal className="h-4 w-4" />
                <span>{t('dashboard.filters.title')}</span>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
              <div>
                <SmartSearch
                  data={data}
                  onSearch={(term) => {
                    setSearchTerm(term)
                    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  onSelectUniversity={(university) => {
                    setSearchTerm(university)
                    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  placeholder={t('dashboard.search.placeholder')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  {t('common.year')}
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-600">
                  {t('dashboard.sortBy')}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'ranking' | 'score' | 'name')}
                    className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700"
                  >
                    <option value="ranking">{t('dashboard.sort.ranking')}</option>
                    <option value="score">{t('dashboard.sort.score')}</option>
                    <option value="name">{t('dashboard.sort.name')}</option>
                  </select>
                </label>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="focus-ring flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700"
                >
                  <span>{t('dashboard.sortBy')}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {sortOrder === 'asc' ? t('dashboard.sort.orderAsc') : t('dashboard.sort.orderDesc')}
                  </span>
                </button>
                <button
                  onClick={() => setRankedOnly(prev => !prev)}
                  aria-pressed={rankedOnly}
                  className={`focus-ring flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                    rankedOnly ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white/80 text-slate-700'
                  }`}
                >
                  <span>{t('dashboard.filters.rankOnly')}</span>
                  <span className="text-xs font-semibold">{rankedOnly ? t('dashboard.filters.enabled') : t('dashboard.filters.disabled')}</span>
                </button>
                <button
                  onClick={() => setViewDensity(prev => prev === 'comfortable' ? 'compact' : 'comfortable')}
                  className="focus-ring flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-700 sm:col-span-2"
                >
                  <span>{t('dashboard.view')}</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {viewDensity === 'comfortable' ? t('dashboard.view.comfort') : t('dashboard.view.compact')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="search" className="px-4 pb-12">
        <div className="max-w-6xl mx-auto space-y-4">
          {filteredData.length === 0 && (
            <div className="glass-card rounded-3xl p-10 text-center text-slate-600">
              <p className="text-lg font-semibold text-slate-800">{t('dashboard.results.empty')}</p>
              <p className="text-sm">{t('dashboard.results.emptyHint')}</p>
            </div>
          )}
          <div className="grid gap-4">
            {filteredData.slice(0, displayLimit).map((university, index) => (
              <motion.button
                key={`${university.组名}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={`glass-card hover-lift w-full rounded-3xl text-left ${viewDensity === 'compact' ? 'p-4' : 'p-6'}`}
                onClick={() => openTrendModal(university.组名, university.院校名)}
                aria-label={`${university.院校名} - ${university.组名}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-semibold text-slate-900">{university.院校名}</h4>
                      <span className="pill">{university.组号}</span>
                    </div>
                    <p className="text-sm text-slate-500">{university.组名}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div>
                        <span className="text-xs text-slate-400">{t('dashboard.university.admissionScore')}</span>
                        <p className="font-medium text-slate-800">{university.投档线}</p>
                      </div>
                      {university.最低排名 && (
                        <div>
                          <span className="text-xs text-slate-400">{t('dashboard.university.minRanking')}</span>
                          <p className="font-medium text-slate-800">{university.最低排名.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-slate-400">{t('common.year')}</span>
                        <p className="font-medium text-slate-800">{university.年份}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
                    <span className="text-xs font-semibold text-blue-600">{t('chart.admissionTrends')}</span>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {filteredData.length > displayLimit && (
            <div className="text-center pt-6">
              <button
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t('dashboard.loadMore', { remaining: filteredData.length - displayLimit })}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {showTrendModal && selectedMajorGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeTrendModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200/70 p-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedMajorGroup.name}</h3>
                  <p className="text-sm text-slate-500">{selectedMajorGroup.university}</p>
                </div>
                <button
                  onClick={closeTrendModal}
                  className="focus-ring rounded-xl bg-slate-100/80 p-2 text-slate-500 hover:text-slate-700"
                  aria-label={t('common.close')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <TrendChart
                  universityName={selectedMajorGroup.name}
                  data={data.filter(item => item.组名 === selectedMajorGroup.name)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">
            {t('dashboard.subtitle', { count: stats.totalRecords.toLocaleString(), years: stats.yearsCovered })}
          </p>
          <div className="mt-4 text-xs text-slate-400">
            {years.length > 0 && `${years[years.length - 1]} - ${years[0]}`} • {stats.totalRecords.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 