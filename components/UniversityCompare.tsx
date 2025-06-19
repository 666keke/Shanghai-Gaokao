'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number | null
  年份: number
}

interface UniversityCompareProps {
  universities: string[]
  data: UniversityData[]
  onAddUniversity: (name: string) => void
  onRemoveUniversity: (name: string) => void
}

export default function UniversityCompare({ 
  universities, 
  data, 
  onAddUniversity, 
  onRemoveUniversity 
}: UniversityCompareProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  const availableUniversities = Array.from(new Set(data.map(item => item.院校名)))
    .filter(name => !universities.includes(name))
    .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()))

  const getUniversityStats = (universityName: string) => {
    const universityData = data.filter(item => item.院校名 === universityName)
    const recentData = universityData.filter(item => item.年份 >= 2022)
    const rankings = universityData.filter(item => item.最低排名).map(item => item.最低排名!)
    
    return {
      totalPrograms: universityData.length,
      averageRanking: rankings.length > 0 ? Math.round(rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length) : null,
      bestRanking: rankings.length > 0 ? Math.min(...rankings) : null,
      recentPrograms: recentData.length,
      yearRange: universityData.length > 0 ? `${Math.min(...universityData.map(d => d.年份))}-${Math.max(...universityData.map(d => d.年份))}` : 'N/A',
      trend: getTrend(universityData)
    }
  }

  const getTrend = (universityData: UniversityData[]) => {
    const sortedData = universityData
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

  const addUniversity = (name: string) => {
    onAddUniversity(name)
    setSearchTerm('')
    setShowAddForm(false)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">University Comparison</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add University</span>
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
              placeholder="Search universities..."
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
              {availableUniversities.slice(0, 10).map(name => (
                <button
                  key={name}
                  onClick={() => addUniversity(name)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-sm"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {universities.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No universities selected for comparison</p>
          <p className="text-sm">Click "Add University" to start comparing</p>
        </div>
      ) : (
        <div className="space-y-6">
          {universities.map(universityName => {
            const stats = getUniversityStats(universityName)
            return (
              <motion.div
                key={universityName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 relative"
              >
                <button
                  onClick={() => onRemoveUniversity(universityName)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <h4 className="text-xl font-semibold text-gray-900 mb-4 pr-8">
                  {universityName}
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Programs</span>
                    <span className="font-medium text-lg">{stats.totalPrograms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Avg Ranking</span>
                    <span className="font-medium text-lg">
                      {stats.averageRanking ? stats.averageRanking.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Best Ranking</span>
                    <span className="font-medium text-lg">
                      {stats.bestRanking ? stats.bestRanking.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Recent Programs</span>
                    <span className="font-medium text-lg">{stats.recentPrograms}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Years</span>
                    <span className="font-medium text-lg">{stats.yearRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Trend</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(stats.trend)}
                      <span className="font-medium text-lg capitalize">{stats.trend}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
} 