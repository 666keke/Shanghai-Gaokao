'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Table2 } from 'lucide-react'
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
  universityNames: string[]
  data: UniversityData[]
  seriesColors?: string[]
}

interface GroupRow {
  groupName: string
  universityName: string
  groupNumber: string
  avgRanking: number | null
  yearData: Record<number, { ranking: number | null; score: string }>
}

export default function MajorGroupsTable({
  universityNames,
  data,
  seriesColors = ['#256f8f', '#8f4b3f', '#3f7f63', '#9a6a25', '#6d5b8f', '#98704a'],
}: MajorGroupsTableProps) {
  const { t } = useLanguage()
  const [visibleUniversities, setVisibleUniversities] = useState<string[]>(universityNames)

  useEffect(() => {
    setVisibleUniversities((current) => {
      const selectedSet = new Set(universityNames)
      const kept = current.filter((name) => selectedSet.has(name))
      const added = universityNames.filter((name) => !current.includes(name))
      return [...kept, ...added]
    })
  }, [universityNames])

  const selectedSet = useMemo(() => new Set(universityNames), [universityNames])

  const universityData = useMemo(
    () => data.filter((item) => selectedSet.has(item.院校名)),
    [data, selectedSet]
  )

  const allYears = useMemo(
    () => Array.from(new Set(universityData.map((item) => item.年份))).sort((a, b) => b - a),
    [universityData]
  )

  const groupRows = useMemo(() => {
    const grouped = new Map<string, GroupRow>()

    universityData.forEach((item) => {
      const key = `${item.院校名}-${item.组名}`
      const existing =
        grouped.get(key) ||
        {
          groupName: item.组名,
          universityName: item.院校名,
          groupNumber: item.组号,
          avgRanking: null,
          yearData: {},
        }

      existing.yearData[item.年份] = {
        ranking: item.最低排名,
        score: item.投档线 || '-',
      }
      grouped.set(key, existing)
    })

    return Array.from(grouped.values())
      .map((row) => {
        const rankings = Object.values(row.yearData)
          .map((yearItem) => yearItem.ranking)
          .filter((ranking): ranking is number => Boolean(ranking))

        return {
          ...row,
          avgRanking:
            rankings.length > 0
              ? Math.round(rankings.reduce((sum, ranking) => sum + ranking, 0) / rankings.length)
              : null,
        }
      })
      .sort((a, b) => {
        const universitySort =
          universityNames.indexOf(a.universityName) - universityNames.indexOf(b.universityName)
        if (universitySort !== 0) return universitySort

        return a.groupNumber.localeCompare(b.groupNumber, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      })
  }, [universityData, universityNames])

  const visibleSet = useMemo(() => new Set(visibleUniversities), [visibleUniversities])

  const universitySections = useMemo(
    () =>
      universityNames
        .map((name, index) => ({
          name,
          index,
          rows: groupRows.filter((row) => row.universityName === name),
        }))
        .filter((section) => section.rows.length > 0),
    [groupRows, universityNames]
  )

  const visibleSections = useMemo(
    () => universitySections.filter((section) => visibleSet.has(section.name)),
    [universitySections, visibleSet]
  )

  const toggleUniversityVisibility = (name: string) => {
    setVisibleUniversities((current) => {
      if (current.includes(name)) {
        return current.filter((item) => item !== name)
      }
      return universityNames.filter((item) => item === name || current.includes(item))
    })
  }

  if (universityNames.length === 0 || universityData.length === 0 || groupRows.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="workbench-card rounded-lg p-6"
    >
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Table2 className="h-5 w-5 text-[color:var(--brand)]" />
            <h3 className="text-lg font-semibold text-slate-900">
              {t('library.yearlyComparison')}
            </h3>
          </div>
          <p className="max-w-[72ch] text-sm leading-6 text-slate-600">
            按大学分组展示专业组，横向查看各年份最低排名与投档线。
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:max-w-[50%] lg:items-end">
          <span className="text-xs font-medium text-slate-500">{t('library.visibility')}</span>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            {universityNames.map((name, index) => {
              const isVisible = visibleSet.has(name)

              return (
            <button
              key={name}
              type="button"
              aria-pressed={isVisible}
              onClick={() => toggleUniversityVisibility(name)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                isVisible
                  ? 'border-stone-200 bg-white text-slate-800 hover:border-[var(--brand)]'
                  : 'border-stone-200 bg-stone-100 text-slate-400 hover:bg-white hover:text-slate-700'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: isVisible
                    ? seriesColors[index % seriesColors.length]
                    : 'rgb(148 163 184)',
                }}
              />
              {name}
              {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
              )
            })}
          </div>
        </div>
      </div>

      {visibleSections.length > 0 ? (
        <div className="space-y-8">
          {visibleSections.map((section) => (
            <section key={section.name} className="border-t border-stone-200 pt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: seriesColors[section.index % seriesColors.length] }}
                  />
                  <h4 className="text-base font-semibold text-slate-900">{section.name}</h4>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {t('library.groupCount', { count: section.rows.length })}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="sticky left-0 z-10 min-w-[220px] bg-white/95 py-3 px-4 text-left font-medium text-slate-600 backdrop-blur">
                        {t('library.majorGroup')}
                      </th>
                      <th className="min-w-[120px] py-3 px-4 text-center font-medium text-slate-600">
                        {t('library.avgRanking')}
                      </th>
                      {allYears.map((year) => (
                        <th
                          key={year}
                          className="min-w-[112px] py-3 px-4 text-center font-medium text-slate-600"
                        >
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((item, index) => (
                      <motion.tr
                        key={`${item.universityName}-${item.groupName}`}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.02, 0.18) }}
                        className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                      >
                        <td className="sticky left-0 z-10 bg-white/95 py-3 px-4 backdrop-blur">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2 w-2 flex-shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  seriesColors[section.index % seriesColors.length],
                              }}
                            />
                            <div className="min-w-0">
                              <div
                                className="max-w-[220px] truncate font-medium text-slate-900"
                                title={item.groupName}
                              >
                                {item.groupName}
                              </div>
                              <div className="text-xs text-slate-500">
                                {t('trends.majorGroupsTable.groupNumber')} {item.groupNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-medium text-[color:var(--brand)]">
                            {item.avgRanking ? item.avgRanking.toLocaleString() : '-'}
                          </span>
                        </td>
                        {allYears.map((year) => (
                          <td key={year} className="py-3 px-4 text-center">
                            {item.yearData[year]?.ranking ? (
                              <div>
                                <div className="font-medium text-slate-900">
                                  {item.yearData[year].ranking?.toLocaleString()}
                                </div>
                                <div className="mt-0.5 whitespace-nowrap text-xs text-slate-500">
                                  {item.yearData[year].score}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="border-t border-stone-200 py-10 text-center text-sm text-slate-500">
          {t('library.allUniversitiesHidden')}
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span>{t('library.majorGroup')}: {groupRows.length}</span>
        <span>{t('dashboard.stats.records')}: {universityData.length}</span>
      </div>
    </motion.div>
  )
} 
