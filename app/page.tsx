'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, BarChart3, Users, GraduationCap, Star, Filter, ChevronRight, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import TrendChart from '../components/TrendChart'

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

export default function HomePage() {
  const { t } = useLanguage()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [displayLimit, setDisplayLimit] = useState(20)
  const [selectedMajorGroup, setSelectedMajorGroup] = useState<{name: string, university: string} | null>(null)
  const [showTrendModal, setShowTrendModal] = useState(false)

  useEffect(() => {
    // Load data from JSON file
    fetch('/data.json')
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

  const filteredData = data.filter(item => 
    item.院校名.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.年份 === selectedYear
  )

  // Reset display limit when search/filter changes
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

  const uniqueUniversities = Array.from(new Set(data.map(item => item.院校名)))
  const years = Array.from(new Set(data.map(item => item.年份))).sort((a, b) => b - a)

  const stats = {
    totalUniversities: uniqueUniversities.length,
    totalRecords: data.length,
    yearsCovered: years.length,
    avgRanking: Math.round(data.filter(d => d.最低排名).reduce((sum, d) => sum + (d.最低排名 || 0), 0) / data.filter(d => d.最低排名).length)
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              {t('dashboard.title')}
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t('dashboard.subtitle', { count: data.length.toLocaleString(), years: stats.yearsCovered })}
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('dashboard.search.placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg backdrop-blur-sm bg-white/90"
              />
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg card-hover">
              <Users className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUniversities}</h3>
              <p className="text-gray-600">{t('dashboard.stats.universities')}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg card-hover">
              <BarChart3 className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalRecords.toLocaleString()}</h3>
              <p className="text-gray-600">{t('dashboard.stats.records')}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg card-hover">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.yearsCovered}</h3>
              <p className="text-gray-600">{t('dashboard.stats.years')}</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg card-hover">
              <Star className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgRanking.toLocaleString()}</h3>
              <p className="text-gray-600">{t('dashboard.stats.avgRanking')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      <section id="search" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.search.results')}</h3>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredData.slice(0, displayLimit).map((university, index) => (
              <motion.div
                key={`${university.组名}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md hover:shadow-lg transition-all card-hover cursor-pointer"
                onClick={() => openTrendModal(university.组名, university.院校名)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900">{university.院校名}</h4>
                    <p className="text-gray-600">{university.组名}</p>
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">{t('dashboard.university.admissionScore')}:</span>
                        <p className="font-medium">{university.投档线}</p>
                      </div>
                      {university.最低排名 && (
                        <div>
                          <span className="text-gray-500">{t('dashboard.university.minRanking')}:</span>
                          <p className="font-medium">{university.最低排名.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">{t('common.year')}:</span>
                        <p className="font-medium">{university.年份}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">{t('dashboard.university.group')}:</span>
                        <p className="font-medium">{university.组号}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>

          {filteredData.length > displayLimit && (
            <div className="text-center mt-8">
              <button 
                onClick={() => setDisplayLimit(prev => prev + 20)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('dashboard.loadMore', { remaining: filteredData.length - displayLimit })}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trend Modal */}
      <AnimatePresence>
        {showTrendModal && selectedMajorGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeTrendModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedMajorGroup.name}
                  </h3>
                  <p className="text-gray-600">{selectedMajorGroup.university}</p>
                </div>
                <button
                  onClick={closeTrendModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-gray-400">
            {t('dashboard.subtitle', { count: stats.totalRecords.toLocaleString(), years: stats.yearsCovered })}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {years[years.length - 1]} - {years[0]} | {stats.totalRecords.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 