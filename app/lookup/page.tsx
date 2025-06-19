'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HelpSection from '../../components/HelpSection'
import { Search, Target, TrendingUp, ChevronRight, Star, Filter } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('lookup.title')}</h1>
              <p className="text-gray-600 mt-2">{t('lookup.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-blue-600" />
              <Search className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">{t('lookup.enterRanking')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lookup.yourRanking')}
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  placeholder={t('lookup.yourRanking.placeholder')}
                  value={userRanking}
                  onChange={(e) => setUserRanking(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t('lookup.yourRanking.help')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('lookup.academicYear')}
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {userRanking && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                {t('lookup.searchResults', { count: searchResults.length, ranking: userRanking, year: selectedYear })}
              </p>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('lookup.availableMajorGroups')}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>{t('lookup.sortedByCompetitiveness')}</span>
              </div>
            </div>

            <div className="space-y-3">
              {searchResults.slice(0, 50).map((option, index) => (
                <motion.div
                  key={`${option.组名}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{option.院校名}</h3>
                        <p className="text-sm text-gray-600">{option.组名}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">{t('lookup.minRanking')}:</span>
                          <p className="font-medium">{option.最低排名.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('lookup.yourMargin')}:</span>
                          <p className={`font-medium ${option.marginRanking > 1000 ? 'text-green-600' : option.marginRanking > 500 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {option.marginRanking.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('lookup.scoreLine')}:</span>
                          <p className="font-medium">{option.投档线}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">{t('lookup.safetyLevel')}:</span>
                          <p className={`font-medium ${option.marginRanking > 1000 ? 'text-green-600' : option.marginRanking > 500 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {option.marginRanking > 1000 ? t('lookup.safe') : option.marginRanking > 500 ? t('lookup.moderate') : t('lookup.risky')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.div>
              ))}
            </div>

            {searchResults.length > 50 && (
              <div className="text-center mt-6">
                <p className="text-gray-500">{t('lookup.showingResults', { total: searchResults.length })}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* No Results */}
        {userRanking && searchResults.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-lg text-center"
          >
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('lookup.noResults')}</h3>
            <p className="text-gray-600">
              {t('lookup.noResults.message', { ranking: userRanking, year: selectedYear })}
            </p>
          </motion.div>
        )}

        {/* Guide */}
        <HelpSection 
          title={t('help.howToUse')}
          type="howToUse"
          className="mt-8"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="h-6 w-6" />
            <span className="text-lg font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-gray-400">
            {t('lookup.subtitle')}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {userRanking && searchResults.length > 0 ? 
              `${t('lookup.yourRanking')}: ${userRanking} | ${t('lookup.availableMajorGroups')}: ${searchResults.length}` :
              `${data.length.toLocaleString()} ${t('dashboard.stats.records').toLowerCase()}`
            }
          </div>
        </div>
      </footer>
    </div>
  )
} 