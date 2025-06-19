'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import TrendChart from '../../components/TrendChart'
import MajorGroupsTable from '../../components/MajorGroupsTable'
import HelpSection from '../../components/HelpSection'
import { Search, TrendingUp, BarChart3, Filter, Users, GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('trends.title')}</h1>
              <p className="text-gray-600 mt-2">{t('trends.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* View Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">{t('trends.analysisMode')}</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setViewMode('university')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'university' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('trends.byUniversity')}
            </button>
            <button
              onClick={() => setViewMode('majorGroup')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'majorGroup' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('trends.byMajorGroup')}
            </button>
          </div>

          {viewMode === 'university' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trends.searchUniversities')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('trends.searchUniversities.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trends.selectedUniversity')}
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {universities.slice(0, 50).map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trends.searchMajorGroups')}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('trends.searchMajorGroups.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('trends.selectedMajorGroups', { count: selectedMajorGroups.length })}
                </label>
                {selectedMajorGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedMajorGroups.map(groupName => (
                      <span
                        key={groupName}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                      >
                        <span>{groupName}</span>
                        <button
                          onClick={() => removeMajorGroup(groupName)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-3">{t('trends.noMajorGroups')}</p>
                )}
              </div>

              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 gap-1 p-2">
                  {majorGroups.slice(0, 100).map(group => (
                    <button
                      key={group.组名}
                      onClick={() => addMajorGroup(group.组名)}
                      disabled={selectedMajorGroups.includes(group.组名) || selectedMajorGroups.length >= 6}
                      className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedMajorGroups.includes(group.组名)
                          ? 'bg-blue-100 text-blue-800'
                          : selectedMajorGroups.length >= 6
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{group.组名}</div>
                      <div className="text-xs text-gray-500">{group.院校名}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Main Trend Charts */}
        {viewMode === 'university' && selectedUniversity && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <TrendChart
                universityName={selectedUniversity}
                data={data}
              />
            </motion.div>
            
            {/* Major Groups Table */}
            <MajorGroupsTable
              universityName={selectedUniversity}
              data={data}
            />
          </>
        )}

        {viewMode === 'majorGroup' && selectedMajorGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
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

        {/* Popular Universities Overview */}
        {viewMode === 'university' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('trends.popularUniversities')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {topUniversities.map((universityName, index) => (
                <motion.div
                  key={universityName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <TrendChart
                    universityName={universityName}
                    data={data}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Trends Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-xl p-6 shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4">{t('trends.marketSummary')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Math.round(data.filter(d => d.年份 === 2024).length / data.filter(d => d.年份 === 2023).length * 100)}%
              </div>
              <div className="text-sm text-gray-600">{t('trends.programGrowth')}</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {universities.length}
              </div>
              <div className="text-sm text-gray-600">{t('trends.totalUniversities')}</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                5 {t('trends.years')}
              </div>
              <div className="text-sm text-gray-600">{t('trends.historicalCoverage')}</div>
            </div>
          </div>
        </motion.div>

        {/* Help Section */}
        <HelpSection 
          title={t('help.understandingTrends')}
          type="tips"
          className="mt-8"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-gray-400">
            {t('trends.subtitle')}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {t('trends.totalUniversities')}: {universities.length} | {data.length.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 