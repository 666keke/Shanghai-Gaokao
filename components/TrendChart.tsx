'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { motion } from 'framer-motion'

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
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Admission Trends</h3>
        <div className="text-center text-gray-500 py-8">
          No trend data available for {title || universityName}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl p-6 shadow-lg"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Admission Trends - {title || universityName}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'line' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              chartType === 'bar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'averageRanking' ? 'Average Ranking' : 'Applications'
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="year" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Average Ranking']}
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
          <p className="text-gray-500">Best Year</p>
          <p className="font-semibold">
            {chartData.reduce((best, current) => 
              current.averageRanking < best.averageRanking ? current : best
            ).year}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Trend</p>
          <p className="font-semibold">
            {chartData.length > 1 && chartData[chartData.length - 1].averageRanking < chartData[0].averageRanking 
              ? '↗️ Improving' : chartData.length > 1 && chartData[chartData.length - 1].averageRanking > chartData[0].averageRanking
              ? '↘️ Declining' : '→ Stable'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Years</p>
          <p className="font-semibold">{chartData.length}</p>
        </div>
      </div>
    </motion.div>
  )
} 