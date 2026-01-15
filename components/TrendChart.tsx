'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'

interface TrendData {
  year: number
  averageRanking: number
  totalApplications: number
  universityName: string
}

interface TrendChartProps {
  universityName: string
  data: Array<{
    年份: number
    最低排名: number | null
    院校名: string
    组名?: string
    投档线: string
  }>
  title?: string // Optional custom title
}

export default function TrendChart({ universityName, data, title }: TrendChartProps) {
  const { t } = useLanguage()
  const [chartData, setChartData] = useState<TrendData[]>([])
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  useEffect(() => {
    const processedData = data
      .filter(item => {
        // Filter by either university name or major group name
        const matchesUniversity = item.院校名 === universityName
        const matchesMajorGroup = item.组名 === universityName
        return (matchesUniversity || matchesMajorGroup) && item.最低排名
      })
      .reduce((acc: Record<number, { rankings: number[], scores: string[] }>, item) => {
        const year = item.年份
        if (!acc[year]) {
          acc[year] = { rankings: [], scores: [] }
        }
        if (item.最低排名) acc[year].rankings.push(item.最低排名)
        acc[year].scores.push(item.投档线)
        return acc
      }, {})

    const trendData: TrendData[] = Object.entries(processedData).map(([year, values]) => ({
      year: parseInt(year),
      averageRanking: Math.round(values.rankings.reduce((sum, rank) => sum + rank, 0) / values.rankings.length),
      totalApplications: values.rankings.length,
      universityName
    })).sort((a, b) => a.year - b.year)

    setChartData(trendData)
  }, [universityName, data])

  if (chartData.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-4">{t('chart.admissionTrends')}</h3>
        <div className="text-center text-slate-500 py-8">
          {t('chart.noData', { name: title || universityName })}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-3xl p-6"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {t('chart.admissionTrends')} - {title || universityName}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-blue-600 text-white shadow shadow-blue-600/30'
                : 'border border-slate-200 bg-white/70 text-slate-600 hover:text-blue-600'
            }`}
          >
            {t('chart.line')}
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-600 text-white shadow shadow-blue-600/30'
                : 'border border-slate-200 bg-white/70 text-slate-600 hover:text-blue-600'
            }`}
          >
            {t('chart.bar')}
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -20px rgba(15, 23, 42, 0.35)'
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'averageRanking' ? t('chart.averageRanking') : t('chart.applications')
                ]}
              />
              <Line
                type="monotone"
                dataKey="averageRanking"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px -20px rgba(15, 23, 42, 0.35)'
                }}
                formatter={(value: number) => [value.toLocaleString(), t('chart.averageRanking')]}
              />
              <Bar 
                dataKey="averageRanking" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <p className="text-slate-500">{t('chart.bestYear')}</p>
          <p className="font-semibold text-slate-800">
            {chartData.reduce((best, current) => 
              current.averageRanking < best.averageRanking ? current : best
            ).year}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-500">{t('chart.trend')}</p>
          <p className="font-semibold text-slate-800">
            {chartData.length > 1 && chartData[chartData.length - 1].averageRanking < chartData[0].averageRanking 
              ? t('chart.improving') : chartData.length > 1 && chartData[chartData.length - 1].averageRanking > chartData[0].averageRanking
              ? t('chart.declining') : t('chart.stable')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-slate-500">{t('chart.years')}</p>
          <p className="font-semibold text-slate-800">{chartData.length}</p>
        </div>
      </div>
    </motion.div>
  )
} 