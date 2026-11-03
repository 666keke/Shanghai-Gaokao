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
} from 'recharts'
import { motion, useReducedMotion } from 'framer-motion'
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
  '#256f8f',
  '#8f4b3f',
  '#3f7f63',
  '#9a6a25',
  '#6d5b8f',
  '#98704a',
  '#527b82',
  '#657a35',
]

export default function MultiTrendChart({
  items,
  data,
  mode,
  title,
}: MultiTrendChartProps) {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()

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
      <div className="trend-content">
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
      <div className="trend-content">
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
      className="trend-content"
    >
      <div className="trend-heading"><h3>{title || t('chart.admissionTrends')}</h3><span>{mode === 'university' ? (t('nav.title') === '上海高考志愿分析' ? '各组平均位次' : 'Average group rank') : (t('nav.title') === '上海高考志愿分析' ? '最低录取位次' : 'Minimum rank')}</span></div>
      <div className="trend-legend">{itemStats.map(stat => <span key={stat.name}><span className="series-dot" style={{backgroundColor: stat.color}} />{stat.name}</span>)}</div>
      <div className="trend-canvas">

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{top: 12, right: 8, left: 0, bottom: 0}}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={10} />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              width={50}
              tickLine={false}
              axisLine={false}
              domain={[minRanking, maxRanking]}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.995 0.006 86)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 10px 30px -20px rgba(15, 23, 42, 0.35)',
              }}
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name,
              ]}
              labelFormatter={(label) => `${label} ${t('common.year')}`}
            />
            {items.map((itemName, index) => (
              <Line
                key={itemName}
                type="linear"
                dataKey={itemName}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2.5}
                isAnimationActive={!reduceMotion}
                animationDuration={220}
                dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <details className="trend-statistics"><summary className="focus-ring">{t('nav.title') === '上海高考志愿分析' ? '统计详情' : 'Statistics'}</summary><div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
        {itemStats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-lg p-3 text-center"
            style={{ backgroundColor: `${stat.color}10` }}
          >
            <p className="text-xs text-slate-500 truncate" title={stat.name}>
              {stat.name}
            </p>
            <p className="text-xs text-slate-500">{t('library.avgRanking')}</p>
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
      </div></details>
    </motion.div>
  )
}
