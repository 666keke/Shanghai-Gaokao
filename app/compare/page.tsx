'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import UnifiedCompare from '../../components/UnifiedCompare'
import HelpSection from '../../components/HelpSection'
import { GitCompare, Sparkles } from 'lucide-react'
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
  const [compareMode, setCompareMode] = useState<'universities' | 'majorGroups'>('universities')

  useEffect(() => {
    fetch(getDataPath())
      .then(res => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
        
        // Pre-select some popular universities for demo
        const popular = ['清华大学', '北京大学', '复旦大学']
        const available = Array.from(new Set(jsonData.map(item => item.院校名)))
        const preSelected = popular.filter(name => available.includes(name)).slice(0, 2)
        setSelectedUniversities(preSelected)
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])



  const addUniversity = (name: string) => {
    if (!selectedUniversities.includes(name) && selectedUniversities.length < 5) {
      setSelectedUniversities([...selectedUniversities, name])
    }
  }

  const removeUniversity = (name: string) => {
    setSelectedUniversities(selectedUniversities.filter(uni => uni !== name))
  }

  const addMajorGroup = (groupName: string) => {
    if (!selectedMajorGroups.includes(groupName) && selectedMajorGroups.length < 5) {
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
              <span>{t('compare.title')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">{t('compare.title')}</h1>
            <p className="mt-3 text-slate-600">{t('compare.subtitle')}</p>
          </div>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{t('compare.quickSummary')}</p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length}
                </h3>
              </div>
              <GitCompare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-slate-500">{compareMode === 'universities' ? t('compare.universitiesSelected') : t('compare.majorGroupsSelected')}</p>
                <p className="font-semibold text-slate-900">{compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length}</p>
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
                <h2 className="text-xl font-semibold text-slate-900">{t('compare.comparisonMode')}</h2>
                <p className="text-sm text-slate-500">{t('compare.subtitle')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCompareMode('universities')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    compareMode === 'universities'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('compare.compareUniversities')}
                </button>
                <button
                  onClick={() => setCompareMode('majorGroups')}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    compareMode === 'majorGroups'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'border border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:text-blue-600'
                  }`}
                >
                  {t('compare.compareMajorGroups')}
                </button>
              </div>
            </div>
          </motion.div>

          <HelpSection
            title={t('help.howToUse')}
            type="howToUse"
            className="mb-4"
          >
            <ul className="space-y-1 text-sm">
              <li>{t('help.compare.instruction1', { type: compareMode === 'universities' ? t('help.compare.universities') : t('help.compare.majorGroups') })}</li>
              <li>{t('help.compare.instruction2')}</li>
              <li>{t('help.compare.instruction3')}</li>
              <li>{t('help.compare.instruction4')}</li>
            </ul>
          </HelpSection>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UnifiedCompare
              items={compareMode === 'universities' ? selectedUniversities : selectedMajorGroups}
              data={data}
              mode={compareMode}
              onAddItem={compareMode === 'universities' ? addUniversity : addMajorGroup}
              onRemoveItem={compareMode === 'universities' ? removeUniversity : removeMajorGroup}
            />
          </motion.div>

          {((compareMode === 'universities' && selectedUniversities.length > 0) ||
            (compareMode === 'majorGroups' && selectedMajorGroups.length > 0)) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-3xl p-6"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('compare.quickSummary')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-slate-900 mb-1">
                    {compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length}
                  </div>
                  <div className="text-slate-600">
                    {compareMode === 'universities' ? t('compare.universitiesSelected') : t('compare.majorGroupsSelected')}
                  </div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-emerald-600 mb-1">
                    {compareMode === 'universities'
                      ? selectedUniversities.reduce((total, name) => {
                          return total + data.filter(item => item.院校名 === name).length
                        }, 0)
                      : selectedMajorGroups.reduce((total, name) => {
                          return total + data.filter(item => item.组名 === name).length
                        }, 0)
                    }
                  </div>
                  <div className="text-slate-600">{t('compare.totalPrograms')}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-blue-600 mb-1">
                    {Math.round(
                      (compareMode === 'universities'
                        ? selectedUniversities.reduce((total, name) => {
                            const rankings = data
                              .filter(item => item.院校名 === name && item.最低排名)
                              .map(item => item.最低排名!)
                            return total + (rankings.length > 0 ? rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length : 0)
                          }, 0) / selectedUniversities.length
                        : selectedMajorGroups.reduce((total, name) => {
                            const rankings = data
                              .filter(item => item.组名 === name && item.最低排名)
                              .map(item => item.最低排名!)
                            return total + (rankings.length > 0 ? rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length : 0)
                          }, 0) / selectedMajorGroups.length
                      )
                    ).toLocaleString()}
                  </div>
                  <div className="text-slate-600">{t('compare.avgRankingAll')}</div>
                </div>
                <div className="rounded-2xl bg-purple-50 p-4 text-center">
                  <div className="text-2xl font-semibold text-purple-600 mb-1">
                    {Array.from(new Set(
                      (compareMode === 'universities'
                        ? selectedUniversities.flatMap(name =>
                            data.filter(item => item.院校名 === name).map(item => item.年份)
                          )
                        : selectedMajorGroups.flatMap(name =>
                            data.filter(item => item.组名 === name).map(item => item.年份)
                          )
                      )
                    )).length}
                  </div>
                  <div className="text-slate-600">{t('compare.yearsCovered')}</div>
                </div>
              </div>
            </motion.div>
          )}

          <HelpSection
            title={t('help.understandingComparisons')}
            type="tips"
            className="mt-4"
            defaultExpanded={false}
          >
            <div className="text-sm space-y-1">
              <p>{t('help.compare.tip1')}</p>
              <p>{t('help.compare.tip2')}</p>
              <p>{t('help.compare.tip3')}</p>
              <p>{t('help.compare.tip4', { type: compareMode === 'universities' ? t('help.compare.universities') : t('help.compare.majorGroups') })}</p>
            </div>
          </HelpSection>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 text-slate-700">
            <GitCompare className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('compare.subtitle')}</p>
          <div className="mt-4 text-xs text-slate-400">
            {compareMode === 'universities' ? t('compare.universitiesSelected') : t('compare.majorGroupsSelected')}: {compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length} • {data.length.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 