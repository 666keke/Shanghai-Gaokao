'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpenCheck, Building2, Check, GraduationCap, Plus, SearchCheck, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { useDisclaimer } from '../contexts/DisclaimerContext'
import { useCompareBasket } from '../contexts/CompareBasketContext'
import AdmissionChanceCalculator, {
  AdmissionChanceResults,
  AdmissionStats,
  GroupedResults,
} from '../components/AdmissionChanceCalculator'
import DisclaimerBanner from '../components/DisclaimerBanner'
import { getSvgPath } from '../lib/utils'

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

interface HomePageClientProps {
  data: UniversityData[]
}

export default function HomePageClient({ data }: HomePageClientProps) {
  const { t } = useLanguage()
  const { hasAgreed, isLoading } = useDisclaimer()
  const basket = useCompareBasket()
  const [selectedYear, setSelectedYear] = useState<number>(2024)
  const [rankingValue, setRankingValue] = useState('')
  const [confirmedRanking, setConfirmedRanking] = useState<string | null>(null)
  const [resultPayload, setResultPayload] = useState<{
    ranking: string
    selectedYear: number
    stats: AdmissionStats
    groupedResults: GroupedResults
  } | null>(null)
  const resultsRef = useRef<HTMLDivElement | null>(null)
  const isChinese = t('dashboard.title') === '大学录取智能分析'

  useEffect(() => {
    if (!rankingValue) {
      setConfirmedRanking(null)
    } else if (confirmedRanking && rankingValue !== confirmedRanking) {
      setConfirmedRanking(null)
    }
  }, [rankingValue, confirmedRanking])

  useEffect(() => {
    if (!confirmedRanking || !resultPayload || !resultsRef.current) return
    if (typeof window === 'undefined') return
    const isMobile = window.matchMedia('(max-width: 640px)').matches
    if (!isMobile) return
    const target = resultsRef.current
    const nav = document.querySelector('nav')
    const offset = nav instanceof HTMLElement ? nav.getBoundingClientRect().height + 24 : 96
    const timer = window.setTimeout(() => {
      const top = target.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }, 50)
    return () => window.clearTimeout(timer)
  }, [confirmedRanking, resultPayload])

  useEffect(() => {
    document.title = t('nav.title')
  }, [t])

  const years = useMemo(
    () => Array.from(new Set(data.map((item) => item.年份))).sort((a, b) => b - a),
    [data]
  )

  const stats = useMemo(() => {
    const uniqueUniversities = Array.from(new Set(data.map((item) => item.院校名)))
    const rankedRecords = data.filter((d) => d.最低排名)
    const latestYear = years[0] || 2024
    const latestRecords = data.filter((item) => item.年份 === latestYear)
    return {
      totalUniversities: uniqueUniversities.length,
      totalRecords: data.length,
      yearsCovered: years.length,
      rankedRecords: rankedRecords.length,
      latestYear,
      latestRecords: latestRecords.length,
    }
  }, [data, years])

  const logoPool = useMemo(
    () => [
      { name: '上海交大', englishName: 'Shanghai Jiao Tong University', file: 'SJTU.svg' },
      { name: '同济大学', englishName: 'Tongji University', file: 'Tongji.svg' },
      { name: '复旦大学', englishName: 'Fudan University', file: 'FDU.svg' },
      { name: '浙江大学', englishName: 'Zhejiang University', file: 'ZJU.svg' },
      { name: '南京大学', englishName: 'Nanjing University', file: 'NJU.svg' },
      { name: '北京航大', englishName: 'Beihang University', file: 'Beihang.svg' },
    ],
    []
  )

  const toggleFeaturedUniversity = (name: string) => {
    if (basket.hasUniversity(name)) {
      basket.removeUniversity(name)
    } else {
      basket.addUniversity(name)
    }
  }

  return (
    <div className="min-h-screen pb-14">
      <main className="page-wrap pt-8 sm:pt-10">
        <section className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-start lg:gap-7">
          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-workbench rounded-lg p-5 sm:p-6 lg:p-7"
            >
              <div className="mb-5">
                <div className="max-w-3xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-white/55 px-2.5 py-1 text-xs font-semibold text-[color:var(--brand-dark)]">
                    <SearchCheck className="h-3.5 w-3.5" />
                    {isChinese ? '第一步' : 'Step one'}
                  </div>
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[color:var(--ink)] sm:text-5xl lg:text-[3.35rem]">
                    {isChinese ? '输入你的位次' : 'Enter your rank'}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--ink-soft)] sm:text-lg">
                    {isChinese
                      ? '查看匹配院校与专业组。'
                      : 'Start with eligible major groups, then sort choices by safe, steady, and reach.'}
                  </p>
                </div>
              </div>

              <DisclaimerBanner />
              <div className={!isLoading && !hasAgreed ? 'pointer-events-none opacity-50' : ''}>
                <AdmissionChanceCalculator
                  data={data}
                  selectedYear={selectedYear}
                  years={years}
                  onYearChange={setSelectedYear}
                  embedded
                  onRankingChange={setRankingValue}
                  showEmptyState={false}
                  showResults={false}
                  onResultsChange={setResultPayload}
                  onConfirm={setConfirmedRanking}
                />
              </div>
            </motion.div>

            {confirmedRanking && resultPayload && (
              <section ref={resultsRef} className="pb-8">
                <AdmissionChanceResults
                  ranking={resultPayload.ranking}
                  selectedYear={resultPayload.selectedYear}
                  stats={resultPayload.stats}
                  groupedResults={resultPayload.groupedResults}
                />
              </section>
            )}
          </div>

          <aside className="grid gap-4">
            {confirmedRanking && resultPayload ? (
              <>
                <section className="workbench-card rounded-lg p-5">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase text-[color:var(--brand)]">
                      {isChinese ? '下一步' : 'Next'}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-[color:var(--ink)]">
                      {isChinese ? '把结果变成清单' : 'Turn results into a list'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                      {isChinese
                        ? `当前按 ${resultPayload.selectedYear} 年、位次 ${Number(resultPayload.ranking).toLocaleString()} 试算。`
                        : `Using ${resultPayload.selectedYear}, rank ${Number(resultPayload.ranking).toLocaleString()}.`}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Link
                      href={`/lookup?ranking=${resultPayload.ranking}&year=${resultPayload.selectedYear}`}
                      className="hover-lift flex items-center justify-between rounded-lg border border-stone-200 bg-white/75 p-3"
                    >
                      <span className="flex items-center gap-3">
                        <BookOpenCheck className="h-5 w-5 text-[color:var(--brand)]" />
                        <span>
                          <span className="block text-sm font-semibold text-[color:var(--ink)]">
                            {isChinese ? '完整清单' : 'Full list'}
                          </span>
                          <span className="block text-xs text-[color:var(--ink-soft)]">
                            {isChinese ? '筛选院校和安全等级' : 'Filter options'}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[color:var(--brand)]" />
                    </Link>

                    <Link
                      href="/trends"
                      className="hover-lift flex items-center justify-between rounded-lg border border-stone-200 bg-white/75 p-3"
                    >
                      <span className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-[color:var(--sage)]" />
                        <span>
                          <span className="block text-sm font-semibold text-[color:var(--ink)]">
                            {isChinese ? '趋势核对' : 'Trend check'}
                          </span>
                          <span className="block text-xs text-[color:var(--ink-soft)]">
                            {isChinese ? '比较多年变化' : 'Compare years'}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-[color:var(--brand)]" />
                    </Link>
                  </div>
                </section>

                <section className="rounded-lg border border-stone-200 bg-white/55 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--sage)]" />
                    <p className="text-xs leading-5 text-[color:var(--ink-soft)]">
                      {isChinese
                        ? '安全等级用于缩小范围，不替代招生章程、专业限制和当年官方数据。'
                        : 'Safety levels narrow the range; confirm official rules and current-year data.'}
                    </p>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="workbench-card rounded-lg p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[color:var(--sage)]" />
                    <h2 className="text-base font-semibold text-[color:var(--ink)]">
                      {isChinese ? '工作流' : 'Workflow'}
                    </h2>
                  </div>
                  <ol className="grid gap-3 text-sm text-[color:var(--ink-soft)]">
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-xs font-semibold text-[color:var(--brand-dark)]">
                        1
                      </span>
                      {isChinese ? '输入位次并选择参考年份。' : 'Enter your rank and choose a reference year.'}
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-xs font-semibold text-[color:var(--brand-dark)]">
                        2
                      </span>
                      {isChinese ? '按安全、稳妥、冲刺分组检查专业组。' : 'Review major groups by safety category.'}
                    </li>
                    <li className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-xs font-semibold text-[color:var(--brand-dark)]">
                        3
                      </span>
                      {isChinese ? '进入院校库核对多年趋势。' : 'Check multi-year trends in the library.'}
                    </li>
                  </ol>
                </section>

                <Link
                  href="/trends"
                  className="workbench-card group block rounded-lg p-5 transition hover:border-[color:var(--brand)] hover:bg-white focus-ring"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-[color:var(--brand)]" />
                      <h2 className="text-base font-semibold text-[color:var(--ink)]">
                        {t('nav.library')}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-[color:var(--ink-soft)]">
                        {stats.latestYear}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-md border border-stone-200 bg-white text-[color:var(--brand)] transition group-hover:border-[color:var(--brand)] group-hover:bg-[var(--brand-soft)]">
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
                    {t('library.subtitle')}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Metric value={stats.latestRecords.toLocaleString()} label={t('dashboard.stats.records')} />
                    <Metric value={stats.totalUniversities} label={t('dashboard.stats.universities')} />
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--brand)]">
                    {isChinese ? '进入院校库' : 'Open library'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>

                <section className="workbench-card rounded-lg p-5">
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-[color:var(--brand)]" />
                      <h2 className="text-base font-semibold text-[color:var(--ink)]">
                        {isChinese ? '常看院校' : 'Featured Schools'}
                      </h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                      {isChinese ? '可直接加入对比篮' : 'Add directly to compare'}
                    </p>
                  </div>
                  <div className="grid gap-2">
                    {logoPool.map((logo) => {
                      const isAdded = basket.hasUniversity(logo.name)

                      return (
                        <div
                          key={logo.file}
                          className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-stone-200 bg-white/75 p-3"
                        >
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white">
                            <img
                              src={getSvgPath(logo.file)}
                              alt={logo.englishName}
                              className="h-9 w-9 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-[color:var(--ink)]">
                              {isChinese ? logo.name : logo.englishName}
                            </div>
                            <div className="truncate text-xs text-[color:var(--ink-soft)]">
                              {isChinese ? logo.englishName : logo.name}
                            </div>
                          </div>
                          <button
                            type="button"
                            aria-pressed={isAdded}
                            onClick={() => toggleFeaturedUniversity(logo.name)}
                            className={`focus-ring inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-semibold transition ${
                              isAdded
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100'
                                : 'border-stone-200 text-[color:var(--brand)] hover:border-[var(--brand)]'
                            }`}
                          >
                            {isAdded ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                            {isAdded ? (isChinese ? '已加' : 'Added') : (isChinese ? '对比' : 'Add')}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </section>
              </>
            )}
          </aside>
        </section>

      </main>

      <footer className="mt-10 border-t border-stone-200 bg-stone-50/80">
        <div className="page-wrap py-6 text-sm text-[color:var(--ink-soft)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-[color:var(--ink)]">{t('nav.title')}</span>
            <span>
              {stats.totalRecords.toLocaleString()} records · {stats.yearsCovered} years
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white/70 p-3">
      <div className="text-lg font-semibold text-[color:var(--ink)]">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase text-[color:var(--ink-soft)]">
        {label}
      </div>
    </div>
  )
}
