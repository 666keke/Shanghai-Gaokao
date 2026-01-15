'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import UnifiedCompare from '../../components/UnifiedCompare'
import {
  GitCompare,
  GraduationCap,
  ChevronRight,
  Home,
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

export default function ComparePage() {
  const { t } = useLanguage()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedMajorGroups, setSelectedMajorGroups] = useState<string[]>([])
  const [compareMode, setCompareMode] = useState<'universities' | 'majorGroups'>(
    'universities'
  )

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
        setSelectedUniversities(preSelected)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])

  const stats = useMemo(() => {
    const universities = new Set(data.map((item) => item.院校名))
    return {
      universities: universities.size,
      totalRecords: data.length,
    }
  }, [data])

  const addUniversity = (name: string) => {
    if (!selectedUniversities.includes(name) && selectedUniversities.length < 5) {
      setSelectedUniversities([...selectedUniversities, name])
    }
  }

  const removeUniversity = (name: string) => {
    setSelectedUniversities(selectedUniversities.filter((uni) => uni !== name))
  }

  const addMajorGroup = (groupName: string) => {
    if (!selectedMajorGroups.includes(groupName) && selectedMajorGroups.length < 5) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter((group) => group !== groupName))
  }

  // Quick stats for comparison
  const comparisonStats = useMemo(() => {
    const items =
      compareMode === 'universities' ? selectedUniversities : selectedMajorGroups

    if (items.length === 0) return null

    const totalPrograms = items.reduce((total, name) => {
      return (
        total +
        data.filter((item) =>
          compareMode === 'universities' ? item.院校名 === name : item.组名 === name
        ).length
      )
    }, 0)

    const rankings = items.flatMap((name) =>
      data
        .filter((item) =>
          compareMode === 'universities' ? item.院校名 === name : item.组名 === name
        )
        .filter((item) => item.最低排名)
        .map((item) => item.最低排名!)
    )

    const avgRanking =
      rankings.length > 0
        ? Math.round(rankings.reduce((sum, r) => sum + r, 0) / rankings.length)
        : 0

    return {
      count: items.length,
      totalPrograms,
      avgRanking,
    }
  }, [compareMode, selectedUniversities, selectedMajorGroups, data])

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
            <span className="text-slate-900">{t('compare.title')}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
                <GitCompare className="h-8 w-8 text-purple-600" />
                {t('compare.title')}
              </h1>
              <p className="text-slate-600 mt-1">{t('compare.subtitle')}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="pill">
                <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
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

      {/* Mode Toggle */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setCompareMode('universities')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    compareMode === 'universities'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-600'
                  }`}
                >
                  {t('compare.compareUniversities')}
                </button>
                <button
                  onClick={() => setCompareMode('majorGroups')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    compareMode === 'majorGroups'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-purple-200 hover:text-purple-600'
                  }`}
                >
                  {t('compare.compareMajorGroups')}
                </button>
              </div>

              {comparisonStats && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      {compareMode === 'universities'
                        ? t('compare.universitiesSelected')
                        : t('compare.majorGroupsSelected')}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {comparisonStats.count}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">{t('compare.totalPrograms')}</p>
                    <p className="font-semibold text-slate-900">
                      {comparisonStats.totalPrograms}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">
                      {t('compare.avgRankingAll')}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {comparisonStats.avgRanking.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison */}
      <section className="px-4 pb-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <UnifiedCompare
              items={
                compareMode === 'universities'
                  ? selectedUniversities
                  : selectedMajorGroups
              }
              data={data}
              mode={compareMode}
              onAddItem={compareMode === 'universities' ? addUniversity : addMajorGroup}
              onRemoveItem={
                compareMode === 'universities' ? removeUniversity : removeMajorGroup
              }
            />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('compare.subtitle')}</p>
        </div>
      </footer>
    </div>
  )
}
