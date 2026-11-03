'use client'

import { useState, useEffect, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import MobileNavigation from '../../components/MobileNavigation'
import MultiTrendChart from '../../components/MultiTrendChart'
import MajorGroupsTable from '../../components/MajorGroupsTable'
import { Search, X, Plus, Building2, Check } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useDisclaimer } from '../../contexts/DisclaimerContext'
import { useCompareBasket } from '../../contexts/CompareBasketContext'
import DisclaimerBanner from '../../components/DisclaimerBanner'
import { getDataPath } from '../../lib/utils'

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

interface MajorGroup {
  组名: string
  院校名: string
  组号: string
}

const SERIES_COLORS = ['#256f8f', '#8f4b3f', '#3f7f63', '#9a6a25', '#6d5b8f', '#98704a']

export default function LibraryPage() {
  const { t } = useLanguage()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const { hasAgreed, isLoading } = useDisclaimer()
  const basket = useCompareBasket()
  const [data, setData] = useState<UniversityData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>([])
  const [selectedMajorGroups, setSelectedMajorGroups] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'university' | 'majorGroup'>('university')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [dataPanel, setDataPanel] = useState<'trend' | 'history'>('trend')
  const [loadError, setLoadError] = useState(false)
  const [excludedMajorGroups, setExcludedMajorGroups] = useState<string[]>([])

  useEffect(() => {
    const updateMode = () => {
      if (window.location.hash === '#major-groups') setViewMode('majorGroup')
    }
    updateMode()
    window.addEventListener('hashchange', updateMode)
    return () => window.removeEventListener('hashchange', updateMode)
  }, [])

  useEffect(() => {
    fetch(getDataPath())
      .then((res) => { if (!res.ok) throw new Error(String(res.status)); return res.json() })
      .then((jsonData: UniversityData[]) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading data:', err)
        setLoadError(true)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    setSelectedUniversities(basket.universities)
  }, [basket.universities])

  useEffect(() => {
    setSelectedMajorGroups(basket.majorGroups)
  }, [basket.majorGroups])


  const universities = useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.院校名)))
        .filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort(),
    [data, searchTerm]
  )

  const majorGroups: MajorGroup[] = useMemo(
    () =>
      Array.from(
        new Map(
          data.map((item) => [
            `${item.组名}`,
            { 组名: item.组名, 院校名: item.院校名, 组号: item.组号 },
          ])
        ).values()
      )
        .filter(
          (group) =>
            group.组名.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.院校名.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.组名.localeCompare(b.组名)),
    [data, searchTerm]
  )

  const stats = useMemo(() => {
    const years = Array.from(new Set(data.map((item) => item.年份)))
    return {
      universities: new Set(data.map((item) => item.院校名)).size,
      totalRecords: data.length,
      years: years.length,
    }
  }, [data])

  // University mode functions
  const addUniversity = (name: string) => {
    if (selectedUniversities.includes(name)) return false
    if (selectedUniversities.length >= 6) {
      basket.showUniversityLimitNotice()
      return false
    }

    const didAdd = basket.addUniversity(name)
    if (didAdd) {
      setSelectedUniversities([...selectedUniversities, name])
    }

    return didAdd
  }

  const removeUniversity = (name: string) => {
    const newList = selectedUniversities.filter((uni) => uni !== name)
    setSelectedUniversities(newList)
    basket.removeUniversity(name)
  }

  // Major group mode functions
  const addMajorGroup = (groupName: string) => {
    if (selectedMajorGroups.includes(groupName)) return false
    if (selectedMajorGroups.length >= 6) {
      basket.showMajorGroupLimitNotice()
      return false
    }

    const didAdd = basket.addMajorGroup(groupName)
    if (didAdd) {
      setSelectedMajorGroups([...selectedMajorGroups, groupName])
    }

    return didAdd
  }

  const removeMajorGroup = (groupName: string) => {
    setSelectedMajorGroups(selectedMajorGroups.filter((group) => group !== groupName))
    basket.removeMajorGroup(groupName)
  }

  const toggleGroupExclusion = (groupName: string) => {
    setExcludedMajorGroups(current => current.includes(groupName)
      ? current.filter(group => group !== groupName)
      : [...current, groupName])
  }

  const ignoredTrendGroups = useMemo(() => Array.from(new Set(data
    .filter(item => selectedUniversities.includes(item.院校名) && excludedMajorGroups.includes(item.组名))
    .map(item => item.组名))), [data, selectedUniversities, excludedMajorGroups])

  const universityChartData = useMemo(() => {
    if (excludedMajorGroups.length === 0) return data
    const excludedSet = new Set(excludedMajorGroups)
    return data.filter((item) => !excludedSet.has(item.组名))
  }, [data, excludedMajorGroups])

  const allYears = useMemo(() => Array.from(new Set(data.map(item => item.年份))).sort((a, b) => b - a), [data])
  const selectedGroupData = useMemo(() => data.filter(item => selectedMajorGroups.includes(item.组名)), [data, selectedMajorGroups])
  const selectedGroupUniversities = useMemo(() => Array.from(new Set(selectedGroupData.map(item => item.院校名))), [selectedGroupData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  const selectedItems = viewMode === 'university' ? selectedUniversities : selectedMajorGroups
  const candidates = viewMode === 'university' ? universities : majorGroups.map(group => group.组名)
  const historyNames = viewMode === 'university'
    ? selectedUniversities
    : selectedGroupUniversities
  const historyData = viewMode === 'university' ? data : selectedGroupData

  return (
    <div className="library-page min-h-screen">
      <header className="library-heading page-wrap">
        <h1>{isChinese ? '院校库' : 'University library'}</h1>
        <span>{stats.universities} {isChinese ? '所院校' : 'universities'}</span>
      </header>
      <div className="page-wrap"><DisclaimerBanner /></div>
      <section className="page-wrap library-controls">
        <div className="library-mode-row">
          <div className="library-mode" role="group" aria-label={isChinese ? '对比类型' : 'Comparison type'}>
            {(['university', 'majorGroup'] as const).map(mode => <button key={mode} type="button" className="focus-ring" aria-pressed={viewMode === mode} onClick={() => { setViewMode(mode); setSearchTerm('') }}>
              {mode === 'university' ? (isChinese ? '院校' : 'Universities') : (isChinese ? '专业组' : 'Groups')}
            </button>)}
          </div>
          <button type="button" className="focus-ring library-add" disabled={!hasAgreed || isLoading || loadError} onClick={() => { setSearchTerm(''); setShowAddPanel(true) }}><Plus className="h-4 w-4" />{isChinese ? '添加' : 'Add'}</button>
        </div>
        {selectedItems.length > 0 && <div className="library-selection" aria-label={isChinese ? '已选对比项' : 'Selected comparisons'}>
          {selectedItems.map((name, index) => <span key={name} className="library-chip">
            <span className="series-dot" style={{ backgroundColor: SERIES_COLORS[index % SERIES_COLORS.length] }} />
            <span>{name}</span>
            <button type="button" className="focus-ring" aria-label={`${isChinese ? '移除' : 'Remove'} ${name}`} onClick={() => viewMode === 'university' ? removeUniversity(name) : removeMajorGroup(name)}><X className="h-3.5 w-3.5" /></button>
          </span>)}
        </div>}
        {loadError && <p role="alert" className="py-3 text-sm text-rose-700">{isChinese ? '数据加载失败，请刷新重试。' : 'Unable to load data. Refresh to retry.'}</p>}
      </section>

      <Dialog.Root open={showAddPanel} onOpenChange={setShowAddPanel}>
        <Dialog.Portal>
          <Dialog.Overlay className="selection-overlay" />
          <Dialog.Content className="selection-sheet">
            <div className="selection-sheet-heading">
              <Dialog.Title>{viewMode === 'university' ? (isChinese ? '添加院校' : 'Add universities') : (isChinese ? '添加专业组' : 'Add major groups')}</Dialog.Title>
              <Dialog.Close className="focus-ring sheet-close" aria-label={isChinese ? '关闭选择' : 'Close selection'}><X className="h-5 w-5" /></Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">{isChinese ? '搜索并选择对比项，最多选择6项。' : 'Search and select up to six comparisons.'}</Dialog.Description>
            <div className="selection-search"><Search className="h-4 w-4" /><input aria-label={isChinese ? '搜索对比项' : 'Search comparisons'} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={isChinese ? '输入名称搜索' : 'Search by name'} /></div>
            <div className="selection-candidates">
              {candidates.slice(0, 60).map(name => {
                const selected = selectedItems.includes(name)
                return <button key={name} type="button" className="focus-ring" aria-pressed={selected} onClick={() => {
                  if (viewMode === 'university') selected ? removeUniversity(name) : addUniversity(name)
                  else selected ? removeMajorGroup(name) : addMajorGroup(name)
                }}><span>{name}</span>{selected ? <Check className="h-5 w-5" /> : <Plus className="h-4 w-4" />}</button>
              })}
              {candidates.length === 0 && <p className="py-10 text-center text-sm text-slate-500">{isChinese ? '没有找到，试试其他名称' : 'No matches. Try another name.'}</p>}
            </div>
            <div className="selection-sheet-footer"><span>{selectedItems.length} / 6</span><Dialog.Close className="focus-ring">{isChinese ? '完成' : 'Done'}</Dialog.Close></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {selectedItems.length > 0 ? <main className="page-wrap library-content">
        <div className="library-data-tabs" role="tablist" aria-label={isChinese ? '数据视图' : 'Data view'}>
          {(['trend', 'history'] as const).map(panel => <button key={panel} id={`library-tab-${panel}`} type="button" role="tab" aria-selected={dataPanel === panel} aria-controls={`library-panel-${panel}`} tabIndex={dataPanel === panel ? 0 : -1} className="focus-ring" onClick={() => setDataPanel(panel)} onKeyDown={event => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault()
              const next = event.key === 'Home' ? 'trend' : event.key === 'End' ? 'history' : dataPanel === 'trend' ? 'history' : 'trend'
              setDataPanel(next)
              document.getElementById(`library-tab-${next}`)?.focus()
            }
          }}>{panel === 'trend' ? (isChinese ? '趋势' : 'Trend') : (isChinese ? '历年数据' : 'History')}</button>)}
          <span>{selectedItems.length} / 6</span>
        </div>
        <section role="tabpanel" id={`library-panel-${dataPanel}`} aria-labelledby={`library-tab-${dataPanel}`} tabIndex={0} className={`focus-ring library-panel ${dataPanel === 'history' ? 'is-history' : ''}`}>
          {dataPanel === 'trend' ? <><MultiTrendChart items={selectedItems} data={viewMode === 'university' ? universityChartData : data} mode={viewMode} title={isChinese ? '录取位次趋势' : 'Admission rank trends'} />
            {viewMode === 'university' && ignoredTrendGroups.length > 0 && <p className="ignored-trend-note" role="status">{isChinese ? '已忽略：' : 'Ignored: '}{ignoredTrendGroups.join('、')}{isChinese ? '（不计入当前趋势）' : ' (excluded from this chart)'}</p>}
          </> : <>
            <MajorGroupsTable universityNames={historyNames} data={historyData} years={allYears} mode={viewMode} onRemoveUniversity={removeUniversity} onRemoveMajorGroup={removeMajorGroup} seriesColors={SERIES_COLORS} excludedMajorGroups={viewMode === 'university' ? excludedMajorGroups : []} onToggleGroupExclusion={viewMode === 'university' ? toggleGroupExclusion : undefined} />
          </>}
        </section>
      </main> : <div className="page-wrap"><div className="library-empty"><Building2 className="h-8 w-8" /><p>{isChinese ? '选好院校，再看看历年变化' : 'Choose universities to explore admission history'}</p><button type="button" className="focus-ring library-add" disabled={!hasAgreed || isLoading || loadError} onClick={() => setShowAddPanel(true)}><Plus className="h-4 w-4" />{isChinese ? '开始选择' : 'Choose comparisons'}</button></div></div>}
      <MobileNavigation active="library" />
    </div>
  )
}
