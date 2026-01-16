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

export default function LibraryPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedMajorGroups, setSelectedMajorGroups] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'university' | 'majorGroup'>('university')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [activeDetailUniversity, setActiveDetailUniversity] = useState<string>('')

  useEffect(() => {
    fetch(getDataPath())
      .then((res) => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
        // Pre-select some popular universities
        const popular = ['清华大学', '北京大学', '复旦大学']
        const available = Array.from(new Set(jsonData.map((item) => item.院校名)))
        const preSelected = popular.filter((name) => available.includes(name)).slice(0, 2)
        if (preSelected.length > 0) {
          setSelectedUniversities(preSelected)
          setActiveDetailUniversity(preSelected[0])
        }
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])

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
    if (!selectedUniversities.includes(name) && selectedUniversities.length < 6) {
      const newList = [...selectedUniversities, name]
      setSelectedUniversities(newList)
      if (!activeDetailUniversity) {
        setActiveDetailUniversity(name)
      }
    }
  }

  const removeUniversity = (name: string) => {
    const newList = selectedUniversities.filter((uni) => uni !== name)
    setSelectedUniversities(newList)
    if (activeDetailUniversity === name) {
      setActiveDetailUniversity(newList[0] || '')
    }
  }

  // Major group mode functions
  const addMajorGroup = (groupName: string) => {
    if (!selectedMajorGroups.includes(groupName) && selectedMajorGroups.length < 6) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter((group) => group !== groupName))
  }

  // Get all years for comparison table
  const allYears = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.年份))).sort((a, b) => b - a)
  }, [data])

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
            <span className="text-slate-900">{t('nav.library')}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                {t('library.title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('library.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="pill">
                <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                {stats.universities} {t('dashboard.stats.universities')}
              </span>
              <span className="pill">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                {stats.totalRecords.toLocaleString()} {t('dashboard.stats.records')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Mode Toggle & Controls */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            {/* Mode Toggle */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('university')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'university'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {t('library.byUniversity')}
                </button>
                <button
                  onClick={() => setViewMode('majorGroup')}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'majorGroup'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  {t('library.byMajorGroup')}
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={() => setShowAddPanel(!showAddPanel)}
                className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
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
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: `${['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]}15`,
                          color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
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
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
                        style={{
                          backgroundColor: `${['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]}15`,
                          color: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
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
                        className="focus-ring h-[42px] w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                      {viewMode === 'university' ? (
                        <div className="p-2 grid gap-1">
                          {universities
                            .filter((name) => !selectedUniversities.includes(name))
                            .slice(0, 50)
                            .map((name) => (
                              <button
                                key={name}
                                onClick={() => {
                                  addUniversity(name)
                                  setSearchTerm('')
                                }}
                                disabled={selectedUniversities.length >= 6}
                                className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                                  selectedUniversities.length >= 6
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                                    : 'hover:bg-blue-50 hover:text-blue-600'
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
                                  addMajorGroup(group.组名)
                                  setSearchTerm('')
                                }}
                                disabled={selectedMajorGroups.length >= 6}
                                className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                                  selectedMajorGroups.length >= 6
                                    ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                                    : 'hover:bg-blue-50'
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
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {viewMode === 'university' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Multi-University Comparison Chart */}
              <MultiTrendChart
                items={selectedUniversities}
                data={data}
                mode="university"
                title={t('library.universityTrendComparison')}
              />

              {/* University Detail Selector */}
              {selectedUniversities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Table2 className="h-5 w-5 text-blue-600" />
                      {t('library.majorGroupDetails')}
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {selectedUniversities.map((uni, index) => (
                        <button
                          key={uni}
                          onClick={() => setActiveDetailUniversity(uni)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            activeDetailUniversity === uni
                              ? 'text-white shadow-lg'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
                          }`}
                          style={
                            activeDetailUniversity === uni
                              ? {
                                  backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
                                  boxShadow: `0 4px 14px ${['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]}40`,
                                }
                              : {}
                          }
                        >
                          {uni}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Major Groups Table for selected university */}
              {activeDetailUniversity && (
                <MajorGroupsTable
                  universityName={activeDetailUniversity}
                  data={data}
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
                  className="glass-card rounded-3xl p-6"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Table2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900">
                      {t('library.yearlyComparison')}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 font-medium text-slate-600 sticky left-0 bg-white/95 backdrop-blur z-10">
                            {t('library.majorGroup')}
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-slate-600">
                            {t('library.university')}
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
                                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6],
                                  }}
                                />
                                <span className="font-medium text-slate-900 truncate max-w-[200px]" title={item.groupName}>
                                  {item.groupName}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              {item.universityName}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-semibold text-blue-600">
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
                  className="glass-card rounded-2xl p-8 text-center"
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
      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
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
