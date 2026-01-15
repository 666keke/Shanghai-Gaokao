'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TrendChart from '../../components/TrendChart'
import MajorGroupsTable from '../../components/MajorGroupsTable'
import HelpSection from '../../components/HelpSection'
import { Search, TrendingUp, GraduationCap, Sparkles } from 'lucide-react'
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

export default function TrendsPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversity, setSelectedUniversity] = useState('')
  const [selectedMajorGroups, setSelectedMajorGroups] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'university' | 'majorGroup'>('university')

  useEffect(() => {
    fetch(getDataPath())
      .then(res => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
        // Set default university (not hardcoded to 复旦大学)
        const universities = Array.from(new Set(jsonData.map(item => item.院校名)))
        if (universities.length > 0) {
          setSelectedUniversity(universities[0]) // Use first university in list, not hardcoded
        }
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])

  const universities = Array.from(new Set(data.map(item => item.院校名)))
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort()

  // Auto-select first matching university when searching
  useEffect(() => {
    if (searchTerm && universities.length > 0 && viewMode === 'university') {
      // Only auto-select if current selection is not in the filtered results
      if (!universities.includes(selectedUniversity)) {
        setSelectedUniversity(universities[0])
      }
    }
  }, [searchTerm, universities, viewMode, selectedUniversity])

  const majorGroups: MajorGroup[] = Array.from(
    new Map(data.map(item => [`${item.组名}`, { 组名: item.组名, 院校名: item.院校名, 组号: item.组号 }])).values()
  ).filter(group => 
    group.组名.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.院校名.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.组名.localeCompare(b.组名))

  const topUniversities = universities.slice(0, 6)

  const addMajorGroup = (groupName: string) => {
    if (!selectedMajorGroups.includes(groupName) && selectedMajorGroups.length < 6) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter(group => group !== groupName))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-16">
      <section className="pt-16 pb-10 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
          <div>
            <div className="pill mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>{t('trends.title')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">{t('trends.title')}</h1>
            <p className="mt-3 text-slate-600">{t('trends.subtitle')}</p>
          </div>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{t('trends.marketSummary')}</p>
                <h3 className="text-lg font-semibold text-slate-900">{universities.length}</h3>
              </div>
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-slate-500">{t('trends.totalUniversities')}</p>
                <p className="font-semibold text-slate-900">{universities.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-slate-500">{t('dashboard.stats.records')}</p>
                <p className="font-semibold text-slate-900">{data.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-6"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('trends.analysisMode')}</h2>
                <p className="text-sm text-slate-500">{t('trends.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setViewMode('university')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'university'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('trends.byUniversity')}
                </button>
                <button
                  onClick={() => setViewMode('majorGroup')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'majorGroup'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('trends.byMajorGroup')}
                </button>
              </div>
            </div>

            <div className="mt-6">
              {viewMode === 'university' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    {t('trends.searchUniversities')}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('trends.searchUniversities.placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm"
                      />
                    </div>
                  </label>
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    {t('trends.selectedUniversity')}
                    <select
                      value={selectedUniversity}
                      onChange={(e) => setSelectedUniversity(e.target.value)}
                      className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm"
                    >
                      {universities.slice(0, 50).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="flex flex-col gap-2 text-sm text-slate-600">
                    {t('trends.searchMajorGroups')}
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('trends.searchMajorGroups.placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm"
                      />
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      {t('trends.selectedMajorGroups', { count: selectedMajorGroups.length })}
                    </label>
                    {selectedMajorGroups.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedMajorGroups.map(groupName => (
                          <span
                            key={groupName}
                            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {groupName}
                            <button onClick={() => removeMajorGroup(groupName)} className="text-blue-600">×</button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">{t('trends.noMajorGroups')}</p>
                    )}
                  </div>

                  <div className="max-h-44 overflow-y-auto rounded-2xl border border-slate-200 bg-white/70 p-2">
                    <div className="grid grid-cols-1 gap-1">
                      {majorGroups.slice(0, 100).map(group => (
                        <button
                          key={group.组名}
                          onClick={() => addMajorGroup(group.组名)}
                          disabled={selectedMajorGroups.includes(group.组名) || selectedMajorGroups.length >= 6}
                          className={`text-left rounded-xl px-3 py-2 text-sm transition ${
                            selectedMajorGroups.includes(group.组名)
                              ? 'bg-blue-100 text-blue-800'
                              : selectedMajorGroups.length >= 6
                              ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-medium">{group.组名}</div>
                          <div className="text-xs text-slate-500">{group.院校名}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {viewMode === 'university' && selectedUniversity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <TrendChart universityName={selectedUniversity} data={data} />
              <MajorGroupsTable universityName={selectedUniversity} data={data} />
            </motion.div>
          )}

          {viewMode === 'majorGroup' && selectedMajorGroups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {selectedMajorGroups.map((groupName, index) => (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TrendChart
                    universityName={groupName}
                    data={data.filter(item => item.组名 === groupName)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'university' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="section-title">{t('trends.popularUniversities')}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {topUniversities.map((universityName, index) => (
                  <motion.div
                    key={universityName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <TrendChart universityName={universityName} data={data} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-3xl p-6"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('trends.marketSummary')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-semibold text-emerald-600">
                  {Math.round(data.filter(d => d.年份 === 2024).length / data.filter(d => d.年份 === 2023).length * 100)}%
                </div>
                <div className="text-slate-600">{t('trends.programGrowth')}</div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-4 text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {universities.length}
                </div>
                <div className="text-slate-600">{t('trends.totalUniversities')}</div>
              </div>
              <div className="rounded-2xl bg-purple-50 p-4 text-center">
                <div className="text-2xl font-semibold text-purple-600">
                  5 {t('trends.years')}
                </div>
                <div className="text-slate-600">{t('trends.historicalCoverage')}</div>
              </div>
            </div>
          </motion.div>

          <HelpSection
            title={t('help.understandingTrends')}
            type="tips"
            className="mt-4"
            defaultExpanded={false}
          >
            <div className="text-sm space-y-1">
              <p>{t('help.trends.instruction1')}</p>
              <p>{t('help.trends.instruction2')}</p>
              <p>{t('help.trends.instruction3')}</p>
              <p>{t('help.trends.instruction4')}</p>
              <p>{t('help.trends.instruction5')}</p>
            </div>
          </HelpSection>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('trends.subtitle')}</p>
          <div className="mt-4 text-xs text-slate-400">
            {t('trends.totalUniversities')}: {universities.length} • {data.length.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 