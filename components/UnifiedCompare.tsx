'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, TrendingUp, TrendingDown, Minus, Edit3, Eye } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number | null
  年份: number
}

interface UniversityFilter {
  name: string
  selectedMajorGroups: string[]
  selectedYears: number[]
}

interface UnifiedCompareProps {
  items: string[]
  data: UniversityData[]
  mode: 'universities' | 'majorGroups'
  onAddItem: (name: string) => void
  onRemoveItem: (name: string) => void
}

interface DetailModalData {
  name: string
  data: UniversityData[]
  selectedMajorGroups: string[]
  selectedYears: number[]
}

interface UniversityDetailModalProps {
  data: DetailModalData
  onUpdate: (data: DetailModalData) => void
}

function UniversityDetailModal({ data, onUpdate }: UniversityDetailModalProps) {
  const { t } = useLanguage()
  
  const allMajorGroups = Array.from(new Set(data.data.map(item => item.组名)))
  const allYears = Array.from(new Set(data.data.map(item => item.年份))).sort()
  
  const toggleMajorGroup = (groupName: string) => {
    const newSelected = data.selectedMajorGroups.includes(groupName)
      ? data.selectedMajorGroups.filter(g => g !== groupName)
      : [...data.selectedMajorGroups, groupName]
    
    onUpdate({ ...data, selectedMajorGroups: newSelected })
  }
  
  const toggleYear = (year: number) => {
    const newSelected = data.selectedYears.includes(year)
      ? data.selectedYears.filter(y => y !== year)
      : [...data.selectedYears, year]
    
    onUpdate({ ...data, selectedYears: newSelected })
  }
  
  const filteredData = data.data.filter(item => 
    data.selectedMajorGroups.includes(item.组名) && 
    data.selectedYears.includes(item.年份)
  )
  
  const majorGroupStats = data.selectedMajorGroups.map(groupName => {
    const groupData = filteredData.filter(item => item.组名 === groupName)
    const rankings = groupData.filter(item => item.最低排名).map(item => item.最低排名!)
    
    return {
      name: groupName,
      totalRecords: groupData.length,
      averageRanking: rankings.length > 0 ? Math.round(rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length) : null,
      bestRanking: rankings.length > 0 ? Math.min(...rankings) : null,
      yearRange: groupData.length > 0 ? `${Math.min(...groupData.map(d => d.年份))}-${Math.max(...groupData.map(d => d.年份))}` : 'N/A',
      scores: groupData.map(item => ({ year: item.年份, score: item.投档线 })).sort((a, b) => a.year - b.year)
    }
  })

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <div>
        <h4 className="text-lg font-semibold mb-3">{t('detail.selectYears')}</h4>
        <div className="flex flex-wrap gap-2">
          {allYears.map(year => (
            <button
              key={year}
              onClick={() => toggleYear(year)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                data.selectedYears.includes(year)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
      
      {/* Major Group Selection */}
      <div>
        <h4 className="text-lg font-semibold mb-3">{t('detail.selectMajorGroups', { selected: data.selectedMajorGroups.length, total: allMajorGroups.length })}</h4>
        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
          <div className="space-y-2">
            {allMajorGroups.map(groupName => (
              <label key={groupName} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.selectedMajorGroups.includes(groupName)}
                  onChange={() => toggleMajorGroup(groupName)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{groupName}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {/* Statistics */}
      {majorGroupStats.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">{t('detail.majorGroupStatistics')}</h4>
          <div className="space-y-4">
            {majorGroupStats.map(stats => (
              <div key={stats.name} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{stats.name}</h5>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                   <div>
                     <span className="text-gray-500 block">{t('detail.records')}</span>
                     <span className="font-medium">{stats.totalRecords}</span>
                   </div>
                   <div>
                     <span className="text-gray-500 block">{t('detail.avgRanking')}</span>
                     <span className="font-medium">
                       {stats.averageRanking ? stats.averageRanking.toLocaleString() : 'N/A'}
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-500 block">{t('detail.bestRanking')}</span>
                     <span className="font-medium">
                       {stats.bestRanking ? stats.bestRanking.toLocaleString() : 'N/A'}
                     </span>
                   </div>
                   <div>
                     <span className="text-gray-500 block">{t('detail.years')}</span>
                     <span className="font-medium">{stats.yearRange}</span>
                   </div>
                 </div>
                
                                 {/* Score History */}
                 {stats.scores.length > 0 && (
                   <div className="mt-3">
                     <span className="text-gray-500 text-sm block mb-2">{t('detail.scoreHistory')}:</span>
                    <div className="flex flex-wrap gap-2">
                      {stats.scores.map(score => (
                        <span
                          key={score.year}
                          className="bg-white px-2 py-1 rounded text-xs"
                        >
                          {score.year}: {score.score}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-2">{t('detail.selectionSummary')}</h4>
        <div className="text-sm text-blue-800">
          <p>{t('detail.selectedYears')}: {data.selectedYears.join(', ')}</p>
          <p>{t('detail.selectedMajorGroups')}: {data.selectedMajorGroups.length} of {allMajorGroups.length}</p>
          <p>{t('detail.totalRecords')}: {filteredData.length}</p>
        </div>
      </div>
    </div>
  )
}

export default function UnifiedCompare({ 
  items, 
  data, 
  mode,
  onAddItem, 
  onRemoveItem 
}: UnifiedCompareProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [detailModal, setDetailModal] = useState<DetailModalData | null>(null)
  const [universityFilters, setUniversityFilters] = useState<UniversityFilter[]>([])

  const isUniversityMode = mode === 'universities'
  
  const availableItems = Array.from(new Set(
    data.map(item => isUniversityMode ? item.院校名 : item.组名)
  ))
    .filter(name => !items.includes(name))
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getItemStats = (itemName: string) => {
    let itemData = data.filter(item => 
      isUniversityMode ? item.院校名 === itemName : item.组名 === itemName
    )
    
    // Apply university filters if they exist
    if (isUniversityMode) {
      const filter = universityFilters.find(f => f.name === itemName)
      if (filter) {
        itemData = itemData.filter(item => 
          filter.selectedMajorGroups.includes(item.组名) && 
          filter.selectedYears.includes(item.年份)
        )
      }
    }
    
    const recentData = itemData.filter(item => item.年份 >= 2022)
    const rankings = itemData.filter(item => item.最低排名).map(item => item.最低排名!)
    
    const baseStats = {
      totalPrograms: itemData.length,
      averageRanking: rankings.length > 0 ? Math.round(rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length) : null,
      bestRanking: rankings.length > 0 ? Math.min(...rankings) : null,
      recentPrograms: recentData.length,
      yearRange: itemData.length > 0 ? `${Math.min(...itemData.map(d => d.年份))}-${Math.max(...itemData.map(d => d.年份))}` : 'N/A',
      trend: getTrend(itemData)
    }

    // Add extra info for major groups
    if (!isUniversityMode && itemData.length > 0) {
      return {
        ...baseStats,
        universityName: itemData[0].院校名,
        groupNumber: itemData[0].组号
      }
    }

    return baseStats
  }

  const getTrend = (itemData: UniversityData[]) => {
    const sortedData = itemData
      .filter(item => item.最低排名)
      .sort((a, b) => a.年份 - b.年份)
    
    if (sortedData.length < 2) return 'stable'
    
    const recent = sortedData[sortedData.length - 1].最低排名!
    const previous = sortedData[sortedData.length - 2].最低排名!
    
    if (recent < previous - 500) return 'up'
    if (recent > previous + 500) return 'down'
    return 'stable'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const addItem = (name: string) => {
    onAddItem(name)
    setSearchTerm('')
    setShowAddForm(false)
  }

  const openDetailModal = (itemName: string) => {
    if (!isUniversityMode) return // Only for universities for now
    
    const itemData = data.filter(item => item.院校名 === itemName)
    const majorGroups = Array.from(new Set(itemData.map(item => item.组名)))
    const years = Array.from(new Set(itemData.map(item => item.年份))).sort()
    
    // Check if there's an existing filter for this university
    const existingFilter = universityFilters.find(f => f.name === itemName)
    
    setDetailModal({
      name: itemName,
      data: itemData,
      selectedMajorGroups: existingFilter ? existingFilter.selectedMajorGroups : majorGroups,
      selectedYears: existingFilter ? existingFilter.selectedYears : years
    })
  }

  const closeDetailModal = () => {
    if (detailModal) {
      // Save the filters when closing the modal
      const newFilter: UniversityFilter = {
        name: detailModal.name,
        selectedMajorGroups: detailModal.selectedMajorGroups,
        selectedYears: detailModal.selectedYears
      }
      
      setUniversityFilters(prev => {
        const existing = prev.findIndex(f => f.name === detailModal.name)
        if (existing >= 0) {
          // Update existing filter
          const updated = [...prev]
          updated[existing] = newFilter
          return updated
        } else {
          // Add new filter
          return [...prev, newFilter]
        }
      })
    }
    
    setDetailModal(null)
  }

  const labels = {
    title: isUniversityMode ? t('unified.universityComparison') : t('unified.majorGroupComparison'),
    addButton: isUniversityMode ? t('unified.addUniversity') : t('unified.addMajorGroup'),
    searchPlaceholder: isUniversityMode ? t('unified.searchUniversities.placeholder') : t('unified.searchMajorGroups.placeholder'),
    emptyMessage: isUniversityMode ? t('unified.noUniversitiesSelected') : t('unified.noMajorGroupsSelected'),
    emptySubMessage: isUniversityMode ? t('unified.clickToStart.university') : t('unified.clickToStart.majorGroup'),
    dataLabel: isUniversityMode ? t('unified.programs') : t('unified.records'),
    recentLabel: isUniversityMode ? t('unified.recentPrograms') : t('unified.recentRecords')
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">{labels.title}</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{labels.addButton}</span>
        </button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 rounded-lg"
        >
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              placeholder={labels.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {searchTerm && (
            <div className="max-h-40 overflow-y-auto">
              {availableItems.slice(0, 10).map(name => (
                <button
                  key={name}
                  onClick={() => addItem(name)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">{labels.emptyMessage}</p>
          <p className="text-sm">{labels.emptySubMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map(itemName => {
            const stats = getItemStats(itemName)
            return (
              <motion.div
                key={itemName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`bg-gray-50 rounded-lg p-6 relative ${isUniversityMode ? 'hover:bg-gray-100 cursor-pointer' : ''} transition-colors`}
                onClick={() => isUniversityMode && openDetailModal(itemName)}
              >
                <div className="absolute top-4 right-4 flex space-x-2">
                  {isUniversityMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openDetailModal(itemName)
                      }}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Remove filters when removing university
                      if (isUniversityMode) {
                        setUniversityFilters(prev => prev.filter(f => f.name !== itemName))
                      }
                      onRemoveItem(itemName)
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="pr-16">
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {itemName}
                    {isUniversityMode && (
                      <span className="ml-2 text-sm text-gray-500">
                        {t('detail.clickForDetails')}
                      </span>
                    )}
                    {isUniversityMode && universityFilters.find(f => f.name === itemName) && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {t('detail.filtered')}
                      </span>
                    )}
                  </h4>
                  {!isUniversityMode && 'universityName' in stats && (
                    <p className="text-gray-600 mb-4">{stats.universityName}</p>
                  )}
                  {isUniversityMode && universityFilters.find(f => f.name === itemName) && (
                    <p className="text-xs text-blue-600 mb-2">
                      {(() => {
                        const filter = universityFilters.find(f => f.name === itemName)!
                        return t('detail.filterInfo', { 
                          groups: filter.selectedMajorGroups.length, 
                          years: filter.selectedYears.length 
                        })
                      })()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">{labels.dataLabel}</span>
                    <span className="font-medium text-lg">{stats.totalPrograms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('unified.avgRanking')}</span>
                    <span className="font-medium text-lg">
                      {stats.averageRanking ? stats.averageRanking.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('unified.bestRanking')}</span>
                    <span className="font-medium text-lg">
                      {stats.bestRanking ? stats.bestRanking.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{labels.recentLabel}</span>
                    <span className="font-medium text-lg">{stats.recentPrograms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('unified.years')}</span>
                    <span className="font-medium text-lg">{stats.yearRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">{t('unified.trend')}</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stats.trend)}
                      <span className="font-medium text-lg capitalize">
                        {stats.trend === 'stable' ? t('unified.trend.stable') : 
                         stats.trend === 'up' ? t('unified.trend.up') : 
                         t('unified.trend.down')}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDetailModal}
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
                                     <h3 className="text-2xl font-bold text-gray-900">
                     {detailModal.name}
                   </h3>
                   <p className="text-gray-600">{t('detail.universityDetails')}</p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
                <UniversityDetailModal
                  data={detailModal}
                  onUpdate={setDetailModal}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 