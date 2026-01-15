'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number | null
  年份: number
}

interface MajorGroupsTableProps {
  universityName: string
  data: UniversityData[]
}

export default function MajorGroupsTable({ universityName, data }: MajorGroupsTableProps) {
  const { t } = useLanguage()
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')

  // Filter and sort data for the selected university
  const universityData = data
    .filter(item => item.院校名 === universityName)
    .sort((a, b) => {
      // Sort by year (descending), then by group name
      if (a.年份 !== b.年份) {
        return b.年份 - a.年份
      }
      return a.组名.localeCompare(b.组名)
    })

  // Get unique years for filter options
  const availableYears = Array.from(
    new Set(universityData.map(item => item.年份))
  ).sort((a, b) => b - a)

  // Apply year filter
  const filteredData = selectedYear === 'all' 
    ? universityData 
    : universityData.filter(item => item.年份 === selectedYear)

  if (universityData.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-3xl p-6 mt-8"
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('trends.majorGroupsTable')}
            </h3>
            <p className="text-gray-600">
              {t('trends.majorGroupsTable.subtitle')}
            </p>
          </div>
          
          {/* Year Filter */}
          <div className="flex flex-col sm:items-end">
            <label className="text-sm font-medium text-gray-700 mb-2">
              {t('trends.majorGroupsTable.filterByYear')}
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="focus-ring min-w-[120px] rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm"
            >
              <option value="all">{t('trends.majorGroupsTable.allYears')}</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                {t('trends.majorGroupsTable.year')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                {t('trends.majorGroupsTable.groupNumber')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                {t('trends.majorGroupsTable.groupName')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                {t('trends.majorGroupsTable.admissionScore')}
              </th>
              <th className="text-left py-3 px-4 font-medium text-slate-600">
                {t('trends.majorGroupsTable.minRanking')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <motion.tr
                key={`${item.年份}-${item.组号}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {item.年份}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-900">{item.组号}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-slate-700">{item.组名}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-emerald-600">{item.投档线}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-indigo-600">
                    {item.最低排名 ? item.最低排名.toLocaleString() : 'N/A'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>
          {t('dashboard.stats.records')}: {filteredData.length}
          {selectedYear !== 'all' && (
            <span className="ml-2">
              ({t('trends.majorGroupsTable.year')}: {selectedYear})
            </span>
          )}
        </span>
        {selectedYear !== 'all' && (
          <span>
            {t('trends.majorGroupsTable.allYears')}: {universityData.length}
          </span>
        )}
      </div>
    </motion.div>
  )
} 