'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { BarChart3, GraduationCap, TrendingUp, Building2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { useDisclaimer } from '../contexts/DisclaimerContext'
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

  const isHeroExpanded = !confirmedRanking

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
    return {
      totalUniversities: uniqueUniversities.length,
      totalRecords: data.length,
      yearsCovered: years.length,
      rankedRecords: rankedRecords.length,
    }
  }, [data, years])

  const logoPool = useMemo(
    () => [
      { name: 'Peking University', file: 'PKU.svg' },
      { name: 'Fudan University', file: 'FDU.svg' },
      { name: 'Zhejiang University', file: 'ZJU.svg' },
      { name: 'Nanjing University', file: 'NJU.svg' },
      { name: 'Beihang University', file: 'Beihang.svg' },
      { name: 'Nankai University', file: 'Nankai.svg' },
    ],
    []
  )

  const [logoSelection, setLogoSelection] = useState(logoPool)

  useEffect(() => {
    setLogoSelection([...logoPool].sort(() => 0.5 - Math.random()))
  }, [logoPool])

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <section
        className={`relative overflow-hidden px-4 pt-12 sm:pt-20 pb-8 sm:pb-10 transition-all duration-500 ease-out ${
          isHeroExpanded
            ? 'min-h-[calc(100svh-96px)] lg:min-h-[calc(100vh-96px)] flex items-center'
            : ''
        }`}
      >
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute right-0 top-12 h-52 w-52 rounded-full bg-indigo-500/15 blur-3xl" />

          <div className="grid gap-8 sm:gap-10 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-5 sm:gap-6 items-center text-center lg:items-start lg:text-left"
            >
              {/* Logo Cloud */}
              <div className="grid w-full grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 order-2">
                {logoSelection.slice(0, 6).map((logo, index) => (
                  <motion.div
                    key={logo.file}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex w-full aspect-[4/3] items-center justify-center rounded-2xl border border-slate-200 bg-white opacity-100 shadow-sm p-3 sm:p-4"
                  >
                    <img
                      src={getSvgPath(logo.file)}
                      alt={logo.name}
                      className="h-full w-full object-contain scale-90 sm:scale-95"
                    />
                  </motion.div>
                ))}
              </div>

              <div className="order-1 max-w-xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 leading-tight">
                  {t('dashboard.title') === '大学录取智能分析' ? (
                    <span>
                      大学录取<span className="text-gradient">智能</span>分析
                    </span>
                  ) : (
                    <span>
                      University Admission <span className="text-gradient">Intelligence</span>
                    </span>
                  )}
                </h1>
                <p className="text-slate-600 text-base sm:text-lg">
                  {t('dashboard.subtitle', {
                    count: stats.totalRecords.toLocaleString(),
                    years: stats.yearsCovered,
                  })}
                </p>
              </div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 order-3"
              >
                <span className="pill">
                  <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                  {stats.totalUniversities} {t('dashboard.stats.universities')}
                </span>
                <span className="pill">
                  <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                  {stats.rankedRecords.toLocaleString()} {t('dashboard.stats.records')}
                </span>
                <span className="pill">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  {stats.yearsCovered} {t('dashboard.stats.years')}
                </span>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DisclaimerBanner />
              <div className={`space-y-4 ${!isLoading && !hasAgreed ? 'opacity-50 pointer-events-none' : ''}`}>
                <AdmissionChanceCalculator
                  data={data}
                  selectedYear={selectedYear}
                  years={years}
                  onYearChange={setSelectedYear}
                  onRankingChange={setRankingValue}
                  showEmptyState={false}
                  showResults={false}
                  onResultsChange={setResultPayload}
                  onConfirm={setConfirmedRanking}
                />
              
                {/* Library Button */}
                <Link href="/trends" className="block">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 sm:p-8 shadow-[0_25px_60px_-35px_rgba(30,41,59,0.5)] hover:shadow-[0_30px_70px_-35px_rgba(30,41,59,0.6)] transition-shadow duration-300"
                  >
                    <div className="pointer-events-none absolute -inset-6">
                      <ShaderGradientCanvas
                        className="absolute inset-0"
                        style={{ position: 'absolute', inset: 0 }}
                        pixelDensity={1.6}
                        fov={40}
                      >
                        <ShaderGradient
                          control="props"
                          animate="on"
                          brightness={1.2}
                          cAzimuthAngle={180}
                          cDistance={3.6}
                          cPolarAngle={90}
                          cameraZoom={1}
                          color1="#1e40af"
                          color2="#3b82f6"
                          color3="#818cf8"
                          envPreset="city"
                          grain="on"
                          lightType="3d"
                          positionX={-1.4}
                          positionY={0}
                          positionZ={0}
                          range="disabled"
                          rangeEnd={40}
                          rangeStart={0}
                          reflection={0.1}
                          rotationX={0}
                          rotationY={10}
                          rotationZ={50}
                          shader="defaults"
                          type="plane"
                          uAmplitude={1}
                          uDensity={1.3}
                          uFrequency={5.5}
                          uSpeed={0.4}
                          uStrength={4}
                          uTime={0}
                          wireframe={false}
                        />
                      </ShaderGradientCanvas>
                    </div>
                    <div className="absolute inset-0 bg-slate-900/25" />
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-white">
                            {t('nav.library')}
                          </h3>
                          <p className="text-sm text-blue-100">
                            {t('library.subtitle')}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {confirmedRanking && resultPayload && (
        <section className="px-4 pb-10">
          <div ref={resultsRef} className="max-w-6xl mx-auto">
            <AdmissionChanceResults
              ranking={resultPayload.ranking}
              selectedYear={resultPayload.selectedYear}
              stats={resultPayload.stats}
              groupedResults={resultPayload.groupedResults}
            />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-10 border-t border-white/50 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2 text-slate-700">
            <GraduationCap className="h-5 w-5" />
            <span className="text-base font-semibold">{t('nav.title')}</span>
          </div>
          <p className="text-sm text-slate-500">
            {t('dashboard.subtitle', {
              count: stats.totalRecords.toLocaleString(),
              years: stats.yearsCovered,
            })}
          </p>
        </div>
      </footer>
    </div>
  )
}
