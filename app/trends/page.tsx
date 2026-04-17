'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import MultiTrendChart from '../../components/MultiTrendChart'
import MajorGroupsTable from '../../components/MajorGroupsTable'
import {
  Search,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Home,
  X,
  BarChart3,
  Plus,
  Building2,
  Layers,
  ChevronDown,
  Table2,
} from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useDisclaimer } from '../../contexts/DisclaimerContext'
import { useCompareBasket } from '../../contexts/CompareBasketContext'
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

interface MajorGroup {
  组名: string
  院校名: string
  组号: string
}

const SERIES_COLORS = ['#256f8f', '#8f4b3f', '#3f7f63', '#9a6a25', '#6d5b8f', '#98704a']

export default function LibraryPage() {
  const { t } = useLanguage()
  const { hasAgreed, isLoading } = useDisclaimer()
  const basket = useCompareBasket()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedMajorGroups, setSelectedMajorGroups] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'university' | 'majorGroup'>('university')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [hasSeededDefaultUniversities, setHasSeededDefaultUniversities] = useState(false)
  const [hasUserEditedUniversities, setHasUserEditedUniversities] = useState(false)
  const [excludedMajorGroups, setExcludedMajorGroups] = useState<string[]>([])
  const [chartUpdateMessage, setChartUpdateMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#major-groups') {
      setViewMode('majorGroup')
    }
  }, [])

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

  useEffect(() => {
    if (
      loading ||
      data.length === 0 ||
      !basket.hasHydrated ||
      basket.hasSavedBasket ||
      basket.universities.length > 0 ||
      basket.majorGroups.length > 0 ||
      selectedUniversities.length > 0 ||
      hasSeededDefaultUniversities ||
      hasUserEditedUniversities
    ) {
      return
    }

    const popular = ['清华大学', '北京大学', '复旦大学']
    const available = Array.from(new Set(data.map((item) => item.院校名)))
    const preSelected = popular.filter((name) => available.includes(name)).slice(0, 2)
    if (preSelected.length > 0) {
      setSelectedUniversities(preSelected)
      setHasSeededDefaultUniversities(true)
    }
  }, [
    basket.hasHydrated,
    basket.hasSavedBasket,
    basket.universities.length,
    basket.majorGroups.length,
    data,
    hasSeededDefaultUniversities,
    hasUserEditedUniversities,
    loading,
    selectedUniversities.length,
  ])

  useEffect(() => {
    if (basket.universities.length === 0) return
    setSelectedUniversities(basket.universities)
  }, [basket.universities])

  useEffect(() => {
    setSelectedMajorGroups(basket.majorGroups)
  }, [basket.majorGroups])

  useEffect(() => {
    if (!chartUpdateMessage) return
    const timer = window.setTimeout(() => setChartUpdateMessage(null), 2200)
    return () => window.clearTimeout(timer)
  }, [chartUpdateMessage])

  const universities = useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.院校名)))
        .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort(),
    [data, searchTerm]
  )

  const majorGroups: MajorGroup[] = useMemo(
    () =>
      Array.from(
        new Map(
          data.map((item) => [
            `${item.组名}`,
            { 组名: item.组名, 院校名: item.院校名, 组号: item.组号 },
          ])
        ).values()
      )
        .filter(
          (group) =>
            group.组名.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.院校名.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.组名.localeCompare(b.组名)),
    [data, searchTerm]
  )

  const stats = useMemo(() => {
    const years = Array.from(new Set(data.map((item) => item.年份)))
    return {
      universities: new Set(data.map((item) => item.院校名)).size,
      totalRecords: data.length,
      years: years.length,
    }
  }, [data])

  // University mode functions
  const addUniversity = (name: string) => {
    if (selectedUniversities.includes(name)) return false
    if (selectedUniversities.length >= 6) {
      basket.showUniversityLimitNotice()
      return false
    }

    const didAdd = basket.addUniversity(name)
    if (didAdd) {
      setHasUserEditedUniversities(true)
      setSelectedUniversities([...selectedUniversities, name])
    }

    return didAdd
  }

  const removeUniversity = (name: string) => {
    setHasUserEditedUniversities(true)
    const newList = selectedUniversities.filter((uni) => uni !== name)
    setSelectedUniversities(newList)
    basket.removeUniversity(name)
  }

  // Major group mode functions
  const addMajorGroup = (groupName: string) => {
    if (selectedMajorGroups.includes(groupName)) return false
    if (selectedMajorGroups.length >= 6) {
      basket.showMajorGroupLimitNotice()
      return false
    }

    const didAdd = basket.addMajorGroup(groupName)
    if (didAdd) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }

    return didAdd
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter((group) => group !== groupName))
    basket.removeMajorGroup(groupName)
  }

  const toggleGroupExclusion = (groupName: string) => {
    setExcludedMajorGroups((current) => {
      const isExcluded = current.includes(groupName)
      setChartUpdateMessage(
        isExcluded ? t('library.groupRestoredToast') : t('library.groupExcludedToast')
      )
      return isExcluded ? current.filter((group) => group !== groupName) : [...current, groupName]
    })
  }

  // Get all years for comparison table
  const allYears = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.年份))).sort((a, b) => b - a)
  }, [data])

  const universityChartData = useMemo(() => {
    if (excludedMajorGroups.length === 0) return data
    const excludedSet = new Set(excludedMajorGroups)
    return data.filter((item) => !excludedSet.has(item.组名))
  }, [data, excludedMajorGroups])

  // Major group comparison data
  const majorGroupComparisonData = useMemo(() => {
    return selectedMajorGroups.map((groupName) => {
      const groupData = data.filter((item) => item.组名 === groupName)
      const universityName = groupData[0]?.院校名 || ''
      
      const yearData: Record<number, { ranking: number | null; score: string }> = {}
      allYears.forEach((year) => {
        const yearItem = groupData.find((item) => item.年份 === year)
        yearData[year] = {
          ranking: yearItem?.最低排名 || null,
          score: yearItem?.投档线 || '-',
        }
      })

      const rankings = groupData.filter((item) => item.最低排名).map((item) => item.最低排名!)
      const avgRanking = rankings.length > 0
        ? Math.round(rankings.reduce((sum, r) => sum + r, 0) / rankings.length)
        : null

      return {
        groupName,
        universityName,
        yearData,
        avgRanking,
      }
    })
  }, [selectedMajorGroups, data, allYears])

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
    <div className="min-h-screen pb-16">
      <AnimatePresence>
        {chartUpdateMessage && (
          <div className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex justify-center">
            <motion.div
              key={chartUpdateMessage}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full max-w-sm rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-lg"
              role="status"
            >
              {chartUpdateMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <section className="pb-6 pt-8">
        <div className="page-wrap">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href="/" className="flex items-center gap-1 hover:text-[color:var(--brand)]">
              <Home className="h-4 w-4" />
              {t('nav.dashboard')}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900">{t('nav.library')}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-[color:var(--brand)]" />
                {t('library.title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('library.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="pill">
                <GraduationCap className="h-3.5 w-3.5 text-[color:var(--brand)]" />
                {stats.universities} {t('dashboard.stats.universities')}
              </span>
              <span className="pill">
                <BarChart3 className="h-3.5 w-3.5 text-[color:var(--sage)]" />
                {stats.totalRecords.toLocaleString()} {t('dashboard.stats.records')}
              </span>
            </div>
          </div>
          
          {/* Disclaimer Banner */}
          <DisclaimerBanner />
        </div>
      </section>

      {/* Mode Toggle & Controls */}
      <section className={`pb-6 ${!isLoading && !hasAgreed ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="page-wrap">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="workbench-card rounded-lg p-5"
          >
            {/* Mode Toggle */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('university')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'university'
                      ? 'bg-[var(--brand-dark)] text-white'
                      : 'border border-stone-300 bg-white text-slate-600 hover:border-[var(--brand)] hover:text-[color:var(--brand)]'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {t('library.byUniversity')}
                </button>
                <button
                  onClick={() => setViewMode('majorGroup')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'majorGroup'
                      ? 'bg-[var(--brand-dark)] text-white'
                      : 'border border-stone-300 bg-white text-slate-600 hover:border-[var(--brand)] hover:text-[color:var(--brand)]'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  {t('library.byMajorGroup')}
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowAddPanel(!showAddPanel)}
                className="focus-ring flex items-center gap-2 rounded-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand)]"
              >
                <Plus className="h-4 w-4" />
                {viewMode === 'university' ? t('library.addUniversity') : t('library.addMajorGroup')}
                <ChevronDown className={`h-4 w-4 transition-transform ${showAddPanel ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Selected Items */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {viewMode === 'university' ? (
                  selectedUniversities.length > 0 ? (
                    selectedUniversities.map((uni, index) => (
                      <motion.span
                        key={uni}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: `${SERIES_COLORS[index % SERIES_COLORS.length]}15`,
                          color: SERIES_COLORS[index % SERIES_COLORS.length],
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                          }}
                        />
                        {uni}
                        <button
                          onClick={() => removeUniversity(uni)}
                          className="hover:opacity-70"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">{t('library.noUniversitiesSelected')}</span>
                  )
                ) : (
                  selectedMajorGroups.length > 0 ? (
                    selectedMajorGroups.map((group, index) => (
                      <motion.span
                        key={group}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: `${SERIES_COLORS[index % SERIES_COLORS.length]}15`,
                          color: SERIES_COLORS[index % SERIES_COLORS.length],
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                          }}
                        />
                        {group}
                        <button
                          onClick={() => removeMajorGroup(group)}
                          className="hover:opacity-70"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">{t('library.noMajorGroupsSelected')}</span>
                  )
                )}
              </div>
            </div>

            {/* Add Panel */}
            <AnimatePresence>
              {showAddPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-slate-200">
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={
                          viewMode === 'university'
                            ? t('library.searchUniversities')
                            : t('library.searchMajorGroups')
                        }
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="focus-ring h-[42px] w-full rounded-lg border border-stone-300 bg-white pl-10 pr-4 text-sm"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-lg border border-stone-300 bg-white">
                      {viewMode === 'university' ? (
                        <div className="p-2 grid gap-1">
                          {universities
                            .filter((name) => !selectedUniversities.includes(name))
                            .slice(0, 50)
                            .map((name) => (
                              <button
                                key={name}
                                onClick={() => {
                                  if (addUniversity(name)) setSearchTerm('')
                                }}
                                aria-disabled={selectedUniversities.length >= 6}
                                className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                                  selectedUniversities.length >= 6
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                                    : 'hover:bg-[var(--brand-soft)] hover:text-[color:var(--brand-dark)]'
                                }`}
                              >
                                {name}
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="p-2 grid gap-1">
                          {majorGroups
                            .filter((group) => !selectedMajorGroups.includes(group.组名))
                            .slice(0, 50)
                            .map((group) => (
                              <button
                                key={group.组名}
                                onClick={() => {
                                  if (addMajorGroup(group.组名)) setSearchTerm('')
                                }}
                                aria-disabled={selectedMajorGroups.length >= 6}
                                className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                                  selectedMajorGroups.length >= 6
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                                    : 'hover:bg-[var(--brand-soft)]'
                                }`}
                              >
                                <div className="font-medium">{group.组名}</div>
                                <div className="text-xs text-slate-500">{group.院校名}</div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {viewMode === 'university'
                        ? t('library.maxUniversities', { count: 6 - selectedUniversities.length })
                        : t('library.maxMajorGroups', { count: 6 - selectedMajorGroups.length })}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-10">
        <div className="page-wrap space-y-6">
          {viewMode === 'university' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Multi-University Comparison Chart */}
              <MultiTrendChart
                items={selectedUniversities}
                data={universityChartData}
                mode="university"
                title={t('library.universityTrendComparison')}
              />

              {/* Major Groups Table for selected universities */}
              {selectedUniversities.length > 0 && (
                <MajorGroupsTable
                  universityNames={selectedUniversities}
                  data={data}
                  seriesColors={SERIES_COLORS}
                  excludedMajorGroups={excludedMajorGroups}
                  onToggleGroupExclusion={toggleGroupExclusion}
                />
              )}
            </motion.div>
          )}

          {viewMode === 'majorGroup' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Multi-Major Group Comparison Chart */}
              <MultiTrendChart
                items={selectedMajorGroups}
                data={data}
                mode="majorGroup"
                title={t('library.majorGroupTrendComparison')}
              />

              {/* Major Group Comparison Table */}
              {selectedMajorGroups.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="workbench-card rounded-lg p-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Table2 className="h-5 w-5 text-[color:var(--brand)]" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {t('library.yearlyComparison')}
                    </h3>
                  </div>

                  <div className="space-y-3 md:hidden">
                    {majorGroupComparisonData.map((item, index) => (
                      <article
                        key={`${item.groupName}-mobile`}
                        className="rounded-lg border border-stone-200 bg-white p-3"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-start gap-2">
                              <span
                                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                                style={{
                                  backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                                }}
                              />
                              <div>
                                <h4 className="text-sm font-semibold leading-5 text-slate-900">
                                  {item.groupName}
                                </h4>
                                <p className="text-xs text-slate-500">{item.universityName}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className="text-[10px] font-medium text-slate-500">
                              {t('library.avgRanking')}
                            </div>
                            <div className="text-sm font-semibold text-[color:var(--brand)]">
                              {item.avgRanking?.toLocaleString() || '-'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-5 gap-1">
                          {allYears.map((year) => {
                            const yearItem = item.yearData[year]

                            return (
                              <div
                                key={year}
                                className="min-h-[72px] rounded-md border border-stone-200 bg-stone-50 px-1.5 py-2 text-center"
                              >
                                <div className="text-[10px] font-semibold text-slate-500">
                                  {year}
                                </div>
                                {yearItem?.ranking ? (
                                  <>
                                    <div className="mt-1 text-xs font-semibold leading-4 text-slate-900">
                                      {yearItem.ranking.toLocaleString()}
                                    </div>
                                    <div className="mt-0.5 break-words text-[10px] leading-3 text-slate-500">
                                      {yearItem.score}
                                    </div>
                                  </>
                                ) : (
                                  <div className="mt-3 text-xs text-slate-300">-</div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-medium text-slate-600 sticky left-0 bg-white/95 backdrop-blur z-10">
                            {t('library.majorGroup')}
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-slate-600">
                            {t('library.avgRanking')}
                          </th>
                          {allYears.map((year) => (
                            <th key={year} className="text-center py-3 px-4 font-medium text-slate-600 min-w-[100px]">
                              {year}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {majorGroupComparisonData.map((item, index) => (
                          <motion.tr
                            key={item.groupName}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-3 px-4 sticky left-0 bg-white/95 backdrop-blur z-10">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length],
                                  }}
                                />
                                <span className="font-medium text-slate-900 truncate max-w-[200px]" title={item.groupName}>
                                  {item.groupName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-[color:var(--brand)]">
                                {item.avgRanking?.toLocaleString() || '-'}
                              </span>
                            </td>
                            {allYears.map((year) => (
                              <td key={year} className="py-3 px-4 text-center">
                                {item.yearData[year]?.ranking ? (
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {item.yearData[year].ranking?.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {item.yearData[year].score}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                            ))}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {majorGroupComparisonData.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Layers className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p>{t('library.noMajorGroupsSelected')}</p>
                      <p className="text-sm mt-1">{t('library.addMajorGroupHint')}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedMajorGroups.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="workbench-card rounded-lg p-8 text-center"
                >
                  <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {t('library.noMajorGroupsSelected')}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {t('library.addMajorGroupHint')}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-stone-200 bg-stone-50/80">
        <div className="page-wrap py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('library.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
