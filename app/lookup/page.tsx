'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HelpSection from '../../components/HelpSection'
import { Target, ChevronRight, Filter, Sparkles } from 'lucide-react'
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

interface AvailableOption {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number
  年份: number
  marginRanking: number
}

export default function LookupPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [userRanking, setUserRanking] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [availableOptions, setAvailableOptions] = useState<AvailableOption[]>([])
  const [searchResults, setSearchResults] = useState<AvailableOption[]>([])

  useEffect(() => {
    fetch(getDataPath())
      .then(res => res.json())
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading data:', err)
        setLoading(false)
      })
  }, [])

  const years = Array.from(new Set(data.map(item => item.年份))).sort((a, b) => b - a)

  const searchByRanking = () => {
    const ranking = parseInt(userRanking)
    if (isNaN(ranking) || ranking <= 0) {
      setSearchResults([])
      return
    }

    // Find all major groups where the user's ranking is better than or equal to the minimum ranking
    const options = data
      .filter(item => 
        item.年份 === selectedYear && 
        item.最低排名 && 
        ranking <= item.最低排名
      )
      .map(item => ({
        组名: item.组名,
        院校名: item.院校名,
        组号: item.组号,
        投档线: item.投档线,
        最低排名: item.最低排名!,
        年份: item.年份,
        marginRanking: item.最低排名! - ranking // How much margin the student has
      }))
      .sort((a, b) => a.最低排名 - b.最低排名) // Sort by competitiveness (lower ranking = more competitive)

    setSearchResults(options)
  }

  useEffect(() => {
    if (userRanking) {
      searchByRanking()
    }
  }, [userRanking, selectedYear, data])

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
              <span>{t('lookup.title')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">{t('lookup.title')}</h1>
            <p className="mt-3 text-slate-600">{t('lookup.subtitle')}</p>
          </div>
          <div className="surface-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">{t('lookup.enterRanking')}</p>
                <h3 className="text-lg font-semibold text-slate-900">{searchResults.length}</h3>
              </div>
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-slate-50 px-3 py-3">
                <p className="text-xs text-slate-500">{t('lookup.academicYear')}</p>
                <p className="font-semibold text-slate-900">{selectedYear}</p>
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
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('lookup.enterRanking')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-600 mb-2">
                  {t('lookup.yourRanking')}
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    placeholder={t('lookup.yourRanking.placeholder')}
                    value={userRanking}
                    onChange={(e) => setUserRanking(e.target.value)}
                    className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm"
                    min="1"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {t('lookup.yourRanking.help')}
                </p>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-2">
                  {t('lookup.academicYear')}
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {userRanking && (
              <div className="mt-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {t('lookup.searchResults', { count: searchResults.length, ranking: userRanking, year: selectedYear })}
              </div>
            )}
          </motion.div>

          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-3xl p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">{t('lookup.availableMajorGroups')}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Filter className="h-4 w-4" />
                  <span>{t('lookup.sortedByCompetitiveness')}</span>
                </div>
              </div>

              <div className="space-y-3">
                {searchResults.slice(0, 50).map((option, index) => (
                  <motion.div
                    key={`${option.组名}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-slate-900">{option.院校名}</h3>
                      <p className="text-sm text-slate-500">{option.组名}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-xs text-slate-400">{t('lookup.minRanking')}</span>
                        <p className="font-medium text-slate-800">{option.最低排名.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('lookup.yourMargin')}</span>
                        <p className={`font-medium ${option.marginRanking > 1000 ? 'text-emerald-600' : option.marginRanking > 500 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {option.marginRanking.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('lookup.scoreLine')}</span>
                        <p className="font-medium text-slate-800">{option.投档线}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{t('lookup.safetyLevel')}</span>
                        <p className={`font-medium ${option.marginRanking > 1000 ? 'text-emerald-600' : option.marginRanking > 500 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {option.marginRanking > 1000 ? t('lookup.safe') : option.marginRanking > 500 ? t('lookup.moderate') : t('lookup.risky')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </motion.div>
                ))}
              </div>

              {searchResults.length > 50 && (
                <div className="text-center mt-6 text-sm text-slate-500">
                  {t('lookup.showingResults', { total: searchResults.length })}
                </div>
              )}
            </motion.div>
          )}

          {userRanking && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl p-8 text-center"
            >
              <Target className="h-14 w-14 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('lookup.noResults')}</h3>
              <p className="text-sm text-slate-600">
                {t('lookup.noResults.message', { ranking: userRanking, year: selectedYear })}
              </p>
            </motion.div>
          )}

          <HelpSection
            title={t('help.howToUse')}
            type="howToUse"
            className="mt-4"
            defaultExpanded={false}
          >
            <div className="text-sm space-y-1">
              <p>{t('help.lookup.instruction1')}</p>
              <p>{t('help.lookup.instruction2')}</p>
              <p>{t('help.lookup.instruction3')}</p>
              <p>{t('help.lookup.instruction4')}</p>
            </div>
          </HelpSection>
        </div>
      </section>

      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 text-slate-700">
            <Target className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">{t('lookup.subtitle')}</p>
          <div className="mt-4 text-xs text-slate-400">
            {userRanking && searchResults.length > 0
              ? `${t('lookup.yourRanking')}: ${userRanking} • ${t('lookup.availableMajorGroups')}: ${searchResults.length}`
              : `${data.length.toLocaleString()} ${t('dashboard.stats.records').toLowerCase()}`
            }
          </div>
        </div>
      </footer>
    </div>
  )
} 