'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TrendChart from '../../components/TrendChart'
import MajorGroupsTable from '../../components/MajorGroupsTable'
import {
  Search,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  Home,
  X,
  BarChart3,
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
      .then((res) => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
        const universities = Array.from(new Set(jsonData.map((item) => item.院校名)))
        if (universities.length > 0) {
          setSelectedUniversity(universities[0])
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

  useEffect(() => {
    if (searchTerm && universities.length > 0 && viewMode === 'university') {
      if (!universities.includes(selectedUniversity)) {
        setSelectedUniversity(universities[0])
      }
    }
  }, [searchTerm, universities, viewMode, selectedUniversity])

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
      universities: universities.length,
      totalRecords: data.length,
      years: years.length,
    }
  }, [data, universities])

  const addMajorGroup = (groupName: string) => {
    if (!selectedMajorGroups.includes(groupName) && selectedMajorGroups.length < 6) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter((group) => group !== groupName))
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
            <span className="text-slate-900">{t('trends.title')}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                {t('trends.title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('trends.subtitle')}</p>
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

      {/* Controls */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('university')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'university'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('trends.byUniversity')}
                </button>
                <button
                  onClick={() => setViewMode('majorGroup')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    viewMode === 'majorGroup'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('trends.byMajorGroup')}
                </button>
              </div>
            </div>

            {viewMode === 'university' ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('trends.searchUniversities.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm"
                  />
                </div>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  {universities.slice(0, 50).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('trends.searchMajorGroups.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm"
                  />
                </div>

                {selectedMajorGroups.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMajorGroups.map((groupName) => (
                      <span
                        key={groupName}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700"
                      >
                        {groupName}
                        <button
                          onClick={() => removeMajorGroup(groupName)}
                          className="hover:text-blue-900"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                  <div className="grid gap-1">
                    {majorGroups.slice(0, 50).map((group) => (
                      <button
                        key={group.组名}
                        onClick={() => addMajorGroup(group.组名)}
                        disabled={
                          selectedMajorGroups.includes(group.组名) ||
                          selectedMajorGroups.length >= 6
                        }
                        className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                          selectedMajorGroups.includes(group.组名)
                            ? 'bg-blue-100 text-blue-800'
                            : selectedMajorGroups.length >= 6
                            ? 'cursor-not-allowed bg-slate-50 text-slate-400'
                            : 'hover:bg-slate-50'
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
          </motion.div>
        </div>
      </section>

      {/* Charts */}
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {viewMode === 'university' && selectedUniversity && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {selectedMajorGroups.map((groupName, index) => (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TrendChart
                    universityName={groupName}
                    data={data.filter((item) => item.组名 === groupName)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {viewMode === 'majorGroup' && selectedMajorGroups.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {t('trends.noMajorGroups')}
              </h3>
              <p className="text-sm text-slate-600">
                {t('help.trends.instruction3')}
              </p>
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
          <p className="text-sm text-slate-500">{t('trends.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
