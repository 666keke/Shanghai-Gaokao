'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { TrendingUp } from 'lucide-react'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  最低排名: number | null
  年份: number
}

interface MultiTrendChartProps {
  items: string[] // University names or major group names
  data: UniversityData[]
  mode: 'university' | 'majorGroup'
  title?: string
}

// Color palette for multiple series
const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export default function MultiTrendChart({
  items,
  data,
  mode,
  title,
}: MultiTrendChartProps) {
  const { t } = useLanguage()

  const chartData = useMemo(() => {
    // Get all unique years
    const allYears = Array.from(new Set(data.map((item) => item.年份))).sort()

    // Build chart data with each year as a row
    return allYears.map((year) => {
      const row: Record<string, number | string> = { year }

      items.forEach((itemName) => {
        const itemData = data.filter((item) => {
          if (mode === 'university') {
            return item.院校名 === itemName && item.年份 === year && item.最低排名
          } else {
            return item.组名 === itemName && item.年份 === year && item.最低排名
          }
        })

        if (itemData.length > 0) {
          const rankings = itemData.map((item) => item.最低排名!)
          const avgRanking = Math.round(
            rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length
          )
          row[itemName] = avgRanking
        }
      })

      return row
    })
  }, [items, data, mode])

  // Calculate min and max for Y axis
  const { minRanking, maxRanking } = useMemo(() => {
    let min = Infinity
    let max = -Infinity

    chartData.forEach((row) => {
      items.forEach((itemName) => {
        const value = row[itemName]
        if (typeof value === 'number') {
          if (value < min) min = value
          if (value > max) max = value
        }
      })
    })

    if (min === Infinity) min = 0
    if (max === -Infinity) max = 10000

    return {
      minRanking: Math.max(0, min - 500),
      maxRanking: max + 500,
    }
  }, [chartData, items])

  // Calculate statistics for each item
  const itemStats = useMemo(() => {
    return items.map((itemName, index) => {
      const values = chartData
        .map((row) => row[itemName])
        .filter((v): v is number => typeof v === 'number')

      if (values.length === 0) {
        return {
          name: itemName,
          color: COLORS[index % COLORS.length],
          avgRanking: null,
          trend: 'stable' as const,
        }
      }

      const avgRanking = Math.round(
        values.reduce((sum, v) => sum + v, 0) / values.length
      )

      // Calculate trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (values.length >= 2) {
        const first = values[0]
        const last = values[values.length - 1]
        if (last < first - 300) trend = 'up' // Ranking improved (lower is better)
        else if (last > first + 300) trend = 'down' // Ranking declined
      }

      return {
        name: itemName,
        color: COLORS[index % COLORS.length],
        avgRanking,
        trend,
      }
    })
  }, [items, chartData])

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-4">{t('chart.admissionTrends')}</h3>
        <div className="text-center text-slate-500 py-12">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p>{mode === 'university' ? t('trends.selectUniversity') : t('trends.noMajorGroups')}</p>
        </div>
      </div>
    )
  }

  if (chartData.every((row) => items.every((item) => row[item] === undefined))) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-4">{t('chart.admissionTrends')}</h3>
        <div className="text-center text-slate-500 py-8">
          {t('chart.noData', { name: title || items.join(', ') })}
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
          {title || t('chart.admissionTrends')}
        </h3>
        <div className="text-sm text-slate-500">
          {items.length} {mode === 'university' ? t('library.universitiesComparing') : t('library.majorGroupsComparing')}
        </div>
      </div>

      {/* Legend with stats */}
      <div className="flex flex-wrap gap-3 mb-4">
        {itemStats.map((stat) => (
          <div
            key={stat.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stat.color }}
            />
            <span className="font-medium" style={{ color: stat.color }}>
              {stat.name}
            </span>
            {stat.avgRanking && (
              <span className="text-slate-500">
                ({t('chart.averageRanking')}: {stat.avgRanking.toLocaleString()})
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              domain={[minRanking, maxRanking]}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 30px -20px rgba(15, 23, 42, 0.35)',
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name,
              ]}
              labelFormatter={(label) => `${label} ${t('common.year')}`}
            />
            <Legend />
            {items.map((itemName, index) => (
              <Line
                key={itemName}
                type="monotone"
                dataKey={itemName}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2.5}
                dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {itemStats.slice(0, 4).map((stat) => (
          <div
            key={stat.name}
            className="text-center p-3 rounded-xl"
            style={{ backgroundColor: `${stat.color}10` }}
          >
            <p className="text-xs text-slate-500 truncate" title={stat.name}>
              {stat.name}
            </p>
            <p className="font-semibold text-lg" style={{ color: stat.color }}>
              {stat.avgRanking ? stat.avgRanking.toLocaleString() : 'N/A'}
            </p>
            <p className="text-xs" style={{ color: stat.color }}>
              {stat.trend === 'up'
                ? t('chart.improving')
                : stat.trend === 'down'
                ? t('chart.declining')
                : t('chart.stable')}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
