'use client'

import { useMemo } from 'react'
import { ChevronRight, Eye, EyeOff, Trash2 } from 'lucide-react'
import { MotionCollapse, MotionDisclosure } from './ui/Motion'
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
  years?: number[]
  mode: 'university' | 'majorGroup'
  onRemoveUniversity: (name: string) => void
  onRemoveMajorGroup: (name: string) => void
  seriesColors?: string[]
  excludedMajorGroups?: string[]
  onToggleGroupExclusion?: (groupName: string) => void
}

interface GroupRow {
  groupName: string
  universityName: string
  groupNumber: string
  yearData: Record<number, UniversityData | undefined>
}

function displayScore(score?: string) {
  if (!score) return '—'
  return /^580(?:分)?(?:及)?以上$/.test(score.replace(/\s/g, '')) ? '580+' : score
}

export default function MajorGroupsTable({
  universityNames, data, years, mode, onRemoveUniversity, onRemoveMajorGroup,
  seriesColors = ['#256f8f', '#8f4b3f', '#3f7f63', '#9a6a25', '#6d5b8f', '#98704a'],
  excludedMajorGroups = [], onToggleGroupExclusion,
}: MajorGroupsTableProps) {
  const { t } = useLanguage()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const allYears = useMemo(() => Array.from(new Set(years || data.map(item => item.年份))).sort((a, b) => b - a), [data, years])
  const sections = useMemo(() => universityNames.map((name, index) => {
    const rows = new Map<string, GroupRow>()
    data.filter(item => item.院校名 === name).forEach(item => {
      const row: GroupRow = rows.get(item.组名) || { groupName: item.组名, universityName: name, groupNumber: item.组号, yearData: {} }
      row.yearData[item.年份] = item
      rows.set(item.组名, row)
    })
    return { name, index, rows: Array.from(rows.values()).sort((a, b) => a.groupNumber.localeCompare(b.groupNumber, undefined, { numeric: true })) }
  }).filter(section => section.rows.length > 0), [universityNames, data])

  const renderDeleteAction = (row: GroupRow) => <button
    type="button" className="focus-ring history-delete"
    aria-label={`${mode === 'university' ? (isChinese ? '删除院校' : 'Remove university') : (isChinese ? '删除专业组' : 'Remove group')} ${mode === 'university' ? row.universityName : row.groupName}`}
    onClick={() => mode === 'university' ? onRemoveUniversity(row.universityName) : onRemoveMajorGroup(row.groupName)}>
    <Trash2 className="h-3.5 w-3.5" />{mode === 'university' ? (isChinese ? '删除院校' : 'Remove university') : (isChinese ? '删除专业组' : 'Remove group')}
  </button>

  const renderGroupActions = (row: GroupRow) => {
    const excluded = excludedMajorGroups.includes(row.groupName)
    return <div className="history-group-actions">
      {onToggleGroupExclusion && <button type="button" className="focus-ring history-ignore"
        aria-label={`${excluded ? (isChinese ? '显示该组' : 'Show group') : (isChinese ? '不看该组' : 'Hide group')} ${row.groupName}`}
        aria-expanded={!excluded} onClick={() => onToggleGroupExclusion(row.groupName)}>
        {excluded ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {excluded ? (isChinese ? '显示该组' : 'Show group') : (isChinese ? '不看该组' : 'Hide group')}
      </button>}
      {renderDeleteAction(row)}
    </div>
  }

  return <div className="history-content">
    <p className="history-reading-key">{isChinese ? '上方为位次，下方为投档分数' : 'Rank above · cutoff score below'}</p>
    {sections.map(section => <MotionDisclosure key={section.name} className="history-university" defaultOpen>
      <summary className="focus-ring history-university-heading">
        <span className="series-dot" style={{ backgroundColor: seriesColors[section.index % seriesColors.length] }} />
        <h3>{section.name}</h3>
        <span className="history-university-count">{section.rows.length}{isChinese ? ' 个组' : ' groups'}</span>
        <ChevronRight className="history-university-chevron h-4 w-4" aria-hidden="true" />
      </summary>
      <div className="space-y-3 md:hidden">
        {section.rows.map(row => <article key={row.groupName} className={`history-group history-all-years ${excludedMajorGroups.includes(row.groupName) ? 'is-ignored' : ''}`}>
          <div className="history-group-heading"><h4>{row.groupNumber}{isChinese ? '组' : ' Group'}</h4>{renderGroupActions(row)}</div>
          <MotionCollapse open={!excludedMajorGroups.includes(row.groupName)}><dl className="history-year-grid" aria-label={`${row.groupName} ${isChinese ? '历年位次和投档分数' : 'historical ranks and scores'}`}>
            {allYears.map(year => <div key={year}>
              <dt>{year}</dt>
              <dd className="history-year-rank">{row.yearData[year]?.最低排名?.toLocaleString() || '—'}</dd>
              <dd className="history-year-score">{displayScore(row.yearData[year]?.投档线)}</dd>
            </div>)}
          </dl></MotionCollapse>
        </article>)}
      </div>
      <div className="history-scroll hidden md:block" tabIndex={0} role="region" aria-label={`${section.name} ${isChinese ? '历年数据，可横向滚动' : 'history, scroll horizontally'}`}>
        <table className="history-table history-comparison">
          <caption className="sr-only">{section.name} — {isChinese ? '历年位次和投档分数' : 'Historical ranks and cutoff scores'}</caption>
          <thead><tr><th scope="col" className="sticky left-0 z-10 text-left">{isChinese ? '专业组' : 'Group'}</th>{allYears.map(year => <th scope="col" key={year}>{year}</th>)}<th scope="col">{isChinese ? '操作' : 'Actions'}</th></tr></thead>
          <tbody>{section.rows.map(row => <tr key={row.groupName} className={excludedMajorGroups.includes(row.groupName) ? 'history-ignored-row' : undefined}>
            <th scope="row" className="sticky left-0 z-10 text-left"><span title={row.groupName}>{row.groupNumber}{isChinese ? '组' : ' Group'}</span></th>
            {allYears.map(year => <td key={year} className="text-center"><MotionCollapse open={!excludedMajorGroups.includes(row.groupName)}><div className="history-year-rank">{row.yearData[year]?.最低排名?.toLocaleString() || '—'}</div><div className="history-year-score">{displayScore(row.yearData[year]?.投档线)}</div></MotionCollapse></td>)}
            <td>{renderGroupActions(row)}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </MotionDisclosure>)}
    {data.some(item => !excludedMajorGroups.includes(item.组名) && displayScore(item.投档线) === '580+') && <p className="history-footnote">{isChinese ? '580+：实际投档分数未公布，位次为参考值。' : '580+: exact cutoffs are unpublished; ranks are reference values.'}</p>}
  </div>
}
