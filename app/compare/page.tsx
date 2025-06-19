'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import UnifiedCompare from '../../components/UnifiedCompare'
import HelpSection from '../../components/HelpSection'
import { GitCompare, Users, BarChart3 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

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
    fetch('/data.json')
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('compare.title')}</h1>
              <p className="text-gray-600 mt-2">{t('compare.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <GitCompare className="h-8 w-8 text-blue-600" />
              <Users className="h-8 w-8 text-green-600" />
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">{t('compare.comparisonMode')}</h2>
          
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setCompareMode('universities')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                compareMode === 'universities' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('compare.compareUniversities')}
            </button>
            <button
              onClick={() => setCompareMode('majorGroups')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                compareMode === 'majorGroups' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t('compare.compareMajorGroups')}
            </button>
          </div>


        </motion.div>

        {/* Instructions */}
        <HelpSection 
          title={t('help.howToUse')}
          type="howToUse"
          className="mb-8"
        >
          <ul className="space-y-1 text-sm">
            <li>{t('help.compare.instruction1', { type: compareMode === 'universities' ? t('help.compare.universities') : t('help.compare.majorGroups') })}</li>
            <li>{t('help.compare.instruction2')}</li>
            <li>{t('help.compare.instruction3')}</li>
            <li>{t('help.compare.instruction4')}</li>
          </ul>
        </HelpSection>

        {/* Comparison Component */}
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

        {/* Quick Stats */}
        {((compareMode === 'universities' && selectedUniversities.length > 0) || 
          (compareMode === 'majorGroups' && selectedMajorGroups.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">{t('compare.quickSummary')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length}
                </div>
                <div className="text-sm text-gray-600">
                  {compareMode === 'universities' ? t('compare.universitiesSelected') : t('compare.majorGroupsSelected')}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {compareMode === 'universities' 
                    ? selectedUniversities.reduce((total, name) => {
                        return total + data.filter(item => item.院校名 === name).length
                      }, 0)
                    : selectedMajorGroups.reduce((total, name) => {
                        return total + data.filter(item => item.组名 === name).length
                      }, 0)
                  }
                </div>
                <div className="text-sm text-gray-600">{t('compare.totalPrograms')}</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
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
                <div className="text-sm text-gray-600">{t('compare.avgRankingAll')}</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
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
                <div className="text-sm text-gray-600">{t('compare.yearsCovered')}</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tips */}
        <HelpSection 
          title={t('help.understandingComparisons')}
          type="tips"
          className="mt-8"
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GitCompare className="h-6 w-6" />
            <span className="text-lg font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-gray-400">
            {t('compare.subtitle')}
          </p>
          <div className="mt-6 text-sm text-gray-500">
            {compareMode === 'universities' ? t('compare.universitiesSelected') : t('compare.majorGroupsSelected')}: {compareMode === 'universities' ? selectedUniversities.length : selectedMajorGroups.length} | {data.length.toLocaleString()} {t('dashboard.stats.records').toLowerCase()}
          </div>
        </div>
      </footer>
    </div>
  )
} 