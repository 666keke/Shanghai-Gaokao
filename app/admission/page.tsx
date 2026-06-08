'use client'

import { type ReactNode, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CircleDot,
  FileText,
  GraduationCap,
  ListChecks,
  MousePointer2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Waypoints,
  XCircle,
} from 'lucide-react'

const termDefinitions = {
  位次: '将考生成绩从高到低排序后得到的位置。投档时，位次靠前的考生先被检索。',
  批次: '按招生类型和录取顺序划分的投档录取阶段。前一批次录取后，后续批次通常不再参加。',
  院校专业组: '同一高校内，选考科目要求相同或相近的一组专业。上海本科普通批以它为志愿单位。',
  志愿: '考生在某一批次中填报的选择项。上海本科普通批的一项志愿对应一个院校专业组。',
  平行投档: '按考生成绩排序，再按志愿顺序检索；符合条件时只投到一个院校专业组。',
  投档: '考试院按规则把考生电子档案投到一个院校专业组。投档不等于最终录取。',
  录取: '高校在已投档考生中按招生章程安排专业，并完成录取审核。',
  调剂: '服从调剂表示高校可在已投档院校专业组内安排其他未满专业，不跨学校、不跨专业组。',
  退档: '投档后若不符合高校章程限制，或专业无法安排且不服从调剂，档案可能被退回。',
  征求志愿: '某批次录取后仍有未完成计划时，面向符合条件且未录取考生再次组织填报和投档录取。',
  计划余额: '某个院校专业组在当前投档环节尚未用完的招生计划。',
  招生章程: '高校公布的录取规则文件，包含体检、单科成绩、外语语种、专业录取规则等限制。',
} as const

type TermName = keyof typeof termDefinitions
type Subject = '物理' | '化学' | '生物' | '政治' | '历史' | '地理'

const subjectOptions: Subject[] = ['物理', '化学', '生物', '政治', '历史', '地理']

const storyChoices = [
  {
    order: 1,
    group: '华东理工(01)',
    cutoff: 560,
    rank: 8117,
    requirement: ['物理', '化学'] as Subject[],
    seats: 0,
    majors: ['工科试验班', '计算机类', '电子信息类', '能源化工'],
  },
  {
    order: 2,
    group: '上海大学(02)',
    cutoff: 555,
    rank: 9302,
    requirement: ['物理', '化学'] as Subject[],
    seats: 1,
    majors: ['理科试验班', '电气类', '通信工程', '人工智能'],
  },
  {
    order: 3,
    group: '东华大学(01)',
    cutoff: 553,
    rank: 9779,
    requirement: ['物理', '化学'] as Subject[],
    seats: 3,
    majors: ['计算机类', '智能制造', '数据科学', '材料类'],
  },
  {
    order: 4,
    group: '北京化工(01)',
    cutoff: 553,
    rank: 9779,
    requirement: ['物理', '化学'] as Subject[],
    seats: 4,
    majors: ['化工与制药类', '自动化类', '生物工程', '材料科学'],
  },
  {
    order: 5,
    group: '南京师大(01)',
    cutoff: 554,
    rank: 9550,
    requirement: [] as Subject[],
    seats: 2,
    majors: ['新闻传播', '法学', '经济学', '公共管理'],
  },
  {
    order: 6,
    group: '河海大学(03)',
    cutoff: 552,
    rank: 10002,
    requirement: ['物理'] as Subject[],
    seats: 6,
    majors: ['水利类', '土木工程', '环境科学', '遥感科学'],
  },
]

const sourceLinks = [
  {
    label: '2026 志愿填报与投档录取实施办法',
    shortLabel: '实施办法',
    href: 'https://www.shmeea.edu.cn/page/08000/20260402/20157.html',
  },
  {
    label: '2025 招生录取工作日程',
    shortLabel: '录取日程',
    href: 'https://www.shmeea.edu.cn/page/02200/20250609/19471.html',
  },
]

const CHAPTER_COUNT = 8

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function estimateRank(score: number) {
  const anchors = [
    { score: 580, rank: 1293 },
    { score: 570, rank: 6004 },
    { score: 560, rank: 8117 },
    { score: 555, rank: 9302 },
    { score: 553, rank: 9779 },
    { score: 545, rank: 11800 },
    { score: 530, rank: 15800 },
    { score: 500, rank: 24500 },
    { score: 470, rank: 33000 },
    { score: 430, rank: 43000 },
  ]

  if (score >= anchors[0].score) return anchors[0].rank
  if (score <= anchors[anchors.length - 1].score) return anchors[anchors.length - 1].rank

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const high = anchors[index]
    const low = anchors[index + 1]
    if (score <= high.score && score >= low.score) {
      const progress = (high.score - score) / (high.score - low.score)
      return Math.round(high.rank + progress * (low.rank - high.rank))
    }
  }

  return 9302
}

function requirementLabel(requirement: Subject[]) {
  return requirement.length ? requirement.join(' + ') : '不限'
}

function matchesRequirement(selectedSubjects: Subject[], requirement: Subject[]) {
  return requirement.every((subject) => selectedSubjects.includes(subject))
}

function getChoiceState(index: number, matchIndex: number) {
  if (matchIndex >= 0 && index > matchIndex) return 'stopped'
  if (index === matchIndex) return 'matched'
  return 'full'
}

function getChoiceStateLabel(state: string) {
  if (state === 'matched') return '投档到此组'
  if (state === 'stopped') return '不再检索'
  return '计划已满'
}

function getChoiceStateClass(state: string) {
  if (state === 'matched') {
    return 'border-[color-mix(in_oklch,var(--sage)_34%,var(--line))] bg-[color-mix(in_oklch,var(--sage-soft)_48%,white)] text-[color:var(--ink)]'
  }
  if (state === 'stopped') return 'border-[var(--line)] bg-[var(--paper-strong)] text-[color:var(--ink-soft)] opacity-70'
  return 'border-[color-mix(in_oklch,oklch(0.55_0.115_72)_24%,var(--line))] bg-[color-mix(in_oklch,var(--amber-soft)_50%,white)] text-[color:var(--ink)]'
}

export default function AdmissionGuidePage() {
  const [year, setYear] = useState(2025)
  const [score, setScore] = useState(555)
  const [subjects, setSubjects] = useState<Subject[]>(['物理', '化学', '地理'])
  const [acceptAdjustment, setAcceptAdjustment] = useState(false)
  const [meetsLimits, setMeetsLimits] = useState(true)

  const rank = useMemo(() => estimateRank(score), [score])
  const firstMatchedIndex = useMemo(
    () => storyChoices.findIndex((choice) => score >= choice.cutoff && choice.seats > 0 && matchesRequirement(subjects, choice.requirement)),
    [score, subjects]
  )
  const matchedChoice = firstMatchedIndex >= 0 ? storyChoices[firstMatchedIndex] : null

  const adjustmentOutcome = useMemo(() => {
    if (!meetsLimits) {
      return {
        title: '章程限制不满足：存在退档风险',
        detail: '体检、单科成绩、外语语种等条件仍以高校招生章程为准。进档后不满足限制，仍可能被退档。',
        className:
          'border-[color-mix(in_oklch,oklch(0.52_0.115_18)_28%,var(--line))] bg-[color-mix(in_oklch,var(--rose-soft)_54%,white)]',
        icon: <XCircle className="h-5 w-5" />,
      }
    }

    if (!acceptAdjustment) {
      return {
        title: '不服从调剂：退档风险上升',
        detail: '若所填 4 个专业均无法满足，高校通常不能安排组内其他专业，可能退档。',
        className:
          'border-[color-mix(in_oklch,oklch(0.55_0.115_72)_30%,var(--line))] bg-[color-mix(in_oklch,var(--amber-soft)_62%,white)]',
        icon: <AlertTriangle className="h-5 w-5" />,
      }
    }

    return {
      title: '服从调剂：组内安排空间更大',
      detail: '调剂只发生在已投档院校专业组内，不跨学校、不跨专业组。',
      className:
        'border-[color-mix(in_oklch,var(--sage)_26%,var(--line))] bg-[color-mix(in_oklch,var(--sage-soft)_52%,white)]',
      icon: <CheckCircle2 className="h-5 w-5" />,
    }
  }, [acceptAdjustment, meetsLimits])

  const toggleSubject = (subject: Subject) => {
    setSubjects((current) => {
      if (current.includes(subject)) return current.filter((item) => item !== subject)
      if (current.length >= 3) return [...current.slice(1), subject]
      return [...current, subject]
    })
  }

  return (
    <main className="h-[calc(100svh-72px)] snap-y snap-mandatory overflow-y-auto scroll-smooth text-[color:var(--ink)]">
      <ChapterFrame
        index={1}
        kicker="一个上海考生的录取旅程"
        title="假设我是这名考生"
        lead="先只看一个人。年份、分数、选科，就是故事的起点。"
      >
        <IdentityStage
          year={year}
          score={score}
          rank={rank}
          subjects={subjects}
          setYear={setYear}
          setScore={setScore}
          toggleSubject={toggleSubject}
          matchedChoice={matchedChoice}
        />
      </ChapterFrame>

      <ChapterFrame
        index={2}
        kicker="宏观镜头"
        title="我在一整条队伍中的位置"
        lead={
          <>
            <Term name="平行投档" />先看<Term name="位次" />。每个圆圈代表 100 人，带“我”的圆点就是当前位置。
          </>
        }
      >
        <CohortDots score={score} rank={rank} />
      </ChapterFrame>

      <ChapterFrame
        index={3}
        kicker="资格门槛"
        title="轮到我之前，先看哪扇门能进"
        lead={
          <>
            不是所有<Term name="院校专业组" />都能填。选科、批次、章程会先筛掉一部分选择。
          </>
        }
      >
        <GateStage subjects={subjects} meetsLimits={meetsLimits} />
      </ChapterFrame>

      <ChapterFrame
        index={4}
        kicker="我的志愿表"
        title="我填下的是一串院校专业组"
        lead={
          <>
            本科普通批的一项<Term name="志愿" />对应一个<Term name="院校专业组" />。系统会从第 1 个开始往下检索。
          </>
        }
      >
        <ChoiceStack score={score} subjects={subjects} />
      </ChapterFrame>

      <ChapterFrame
        index={5}
        kicker="投档那一刻"
        title="找到第一个可投组，就停"
        lead={
          <>
            前序志愿在这里统一呈现为“计划已满”。一旦完成<Term name="投档" />，后面的志愿不再检索。
          </>
        }
      >
        <FilingStage firstMatchedIndex={firstMatchedIndex} matchedChoice={matchedChoice} />
      </ChapterFrame>

      <ChapterFrame
        index={6}
        kicker="进档以后"
        title="投档后，只在这个组内分专业"
        lead={
          <>
            <Term name="录取" />发生在高校内部。先看专业志愿怎样在同一个组里被安排。
          </>
        }
      >
        <MajorStage matchedChoice={matchedChoice} />
      </ChapterFrame>

      <ChapterFrame
        index={7}
        kicker="风险开关"
        title="不服从调剂，会把风险放大"
        lead={
          <>
            若专业志愿都安排不了，是否服从<Term name="调剂" />会决定学校还能不能在组内继续安排。
          </>
        }
      >
        <RiskStage
          acceptAdjustment={acceptAdjustment}
          setAcceptAdjustment={setAcceptAdjustment}
          meetsLimits={meetsLimits}
          setMeetsLimits={setMeetsLimits}
          adjustmentOutcome={adjustmentOutcome}
        />
      </ChapterFrame>

      <ChapterFrame
        index={8}
        kicker="故事分岔"
        title="如果没有录取，再看征求志愿"
        lead={
          <>
            <Term name="征求志愿" />不是自动补录。是否有缺额、能否参加，都以当次公告为准。
          </>
        }
      >
        <AfterStage />
      </ChapterFrame>
    </main>
  )
}

function ChapterFrame({
  index,
  kicker,
  title,
  lead,
  children,
}: {
  index: number
  kicker: string
  title: string
  lead: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex h-[calc(100svh-72px)] snap-start snap-always items-center overflow-hidden px-4 py-2 md:px-8 md:py-6">
      <div className="mx-auto grid w-full max-w-5xl gap-3 md:gap-6">
        <header className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-md bg-[color-mix(in_oklch,var(--paper-strong)_84%,white)] px-2.5 py-1 text-xs font-semibold text-[color:var(--brand)] shadow-sm">
            <span>第 {index} 幕 / {CHAPTER_COUNT}</span>
            <span className="h-1 w-1 rounded bg-[var(--line)]" />
            <span>{kicker}</span>
          </div>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-normal text-[color:var(--ink)] md:mt-4 md:text-5xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)] md:mt-4 md:text-lg md:leading-8">{lead}</p>
          {index === 1 && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-md bg-[color-mix(in_oklch,var(--amber-soft)_48%,white)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--ink-soft)] md:mt-3">
              <MousePointer2 className="h-3.5 w-3.5" />
              荧光术语可悬停查看解释，移动端点按查看。
            </div>
          )}
        </header>
        {children}
      </div>
    </section>
  )
}

function IdentityStage({
  year,
  score,
  rank,
  subjects,
  setYear,
  setScore,
  toggleSubject,
  matchedChoice,
}: {
  year: number
  score: number
  rank: number
  subjects: Subject[]
  setYear: (year: number) => void
  setScore: (score: number) => void
  toggleSubject: (subject: Subject) => void
  matchedChoice: (typeof storyChoices)[number] | null
}) {
  return (
    <section className="hero-workbench rounded-lg p-2 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-4 md:mb-5">
        <div className="inline-flex items-center gap-2 rounded-md bg-white/55 px-2.5 py-1 text-xs font-semibold text-[color:var(--brand-dark)]">
          <Sparkles className="h-3.5 w-3.5" />
          主角档案
        </div>
        <div className="text-sm font-semibold text-[color:var(--ink-soft)]">
          约第 {rank.toLocaleString('zh-CN')} 位
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_1.2fr] lg:items-center">
        <div className="rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper-strong)_72%,white)] p-3 sm:p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CircleDot className="h-5 w-5 shrink-0 text-[color:var(--brand)]" />
                <div className="truncate text-sm font-semibold text-[color:var(--ink)]">{year} 上海考生</div>
              </div>
              <div className="mt-2 truncate text-xs text-[color:var(--ink-soft)]">{subjects.join(' / ')}</div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-semibold tabular-nums leading-none text-[color:var(--ink)] md:text-6xl">{score}</div>
              <div className="mt-1 text-xs font-semibold text-[color:var(--ink-soft)] sm:text-sm">高考成绩</div>
            </div>
          </div>
          <div className="mt-3 rounded-md bg-[var(--brand-soft)] px-3 py-2 text-sm font-semibold text-[color:var(--brand-dark)]">
            {matchedChoice ? `故事结果：${matchedChoice.group}` : '故事结果：暂未投档'}
          </div>
        </div>

        <div className="grid gap-2 md:gap-4">
          <div>
            <div className="text-sm font-semibold text-[color:var(--ink-soft)]">年份</div>
            <div className="mt-1.5 grid grid-cols-3 gap-2 md:mt-2">
              {[2025, 2024, 2023].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setYear(item)}
                  className={`focus-ring h-8 rounded-md border text-sm font-semibold transition md:h-11 ${
                    year === item
                      ? 'border-[color:var(--brand)] bg-[var(--brand-dark)] text-white'
                      : 'border-[var(--line)] bg-[color-mix(in_oklch,var(--paper-strong)_88%,white)] text-[color:var(--ink-soft)] hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[color:var(--ink-soft)]">分数</div>
              <div className="rounded-md bg-[var(--brand-soft)] px-2.5 py-1 text-sm font-semibold text-[color:var(--brand-dark)]">
                {score} 分
              </div>
            </div>
            <input
              aria-label="调整故事主角成绩"
              type="range"
              min={430}
              max={580}
              step={1}
              value={score}
              onChange={(event) => setScore(Number(event.target.value))}
              className="mt-2 h-2 w-full accent-[var(--brand)] md:mt-3"
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-[color:var(--ink-soft)]">选科</div>
            <div className="mt-1.5 grid grid-cols-6 gap-1.5 md:mt-2 md:grid-cols-3 md:gap-2">
              {subjectOptions.map((subject) => {
                const selected = subjects.includes(subject)
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={`focus-ring h-7 rounded-md border text-xs font-semibold transition md:h-10 md:text-sm ${
                      selected
                        ? 'border-[color:var(--brand)] bg-[var(--brand-soft)] text-[color:var(--brand-dark)]'
                        : 'border-[var(--line)] bg-[color-mix(in_oklch,var(--paper-strong)_88%,white)] text-[color:var(--ink-soft)] hover:border-[color:var(--brand)]'
                    }`}
                  >
                    {subject}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CohortDots({ score, rank }: { score: number; rank: number }) {
  const totalDots = 120
  const myDot = clamp(Math.round(((580 - score) / 150) * (totalDots - 1)), 0, totalDots - 1)
  const percentile = clamp(Math.round((myDot / totalDots) * 100), 1, 99)

  return (
    <section className="workbench-card rounded-lg p-3 sm:p-6">
      <div className="mb-2 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">每点 = 100 人</p>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)] sm:text-xl">我的圆点在这里</h2>
        </div>
        <div className="rounded-md bg-[var(--brand-soft)] px-3 py-2 text-sm font-semibold text-[color:var(--brand-dark)]">
          {score} 分 · 前约 {percentile}%
        </div>
      </div>
      <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_72%,white)] p-2 sm:gap-2 sm:p-4">
        {Array.from({ length: totalDots }).map((_, index) => {
          const isMe = index === myDot
          const zone =
            index < 26
              ? 'bg-[color-mix(in_oklch,var(--brand-soft)_54%,white)]'
              : index < 72
                ? 'bg-[color-mix(in_oklch,var(--sage-soft)_52%,white)]'
                : 'bg-[color-mix(in_oklch,var(--amber-soft)_48%,white)]'
          return (
            <div
              key={index}
              title={isMe ? `我：${score} 分，约第 ${rank.toLocaleString('zh-CN')} 位` : '100 名考生'}
              className={`relative aspect-square rounded-full border transition ${
                isMe
                  ? 'scale-125 border-[color:var(--brand-dark)] bg-[var(--brand-dark)] text-white shadow-[0_0_0_4px_color-mix(in_oklch,var(--brand-soft)_76%,transparent)]'
                  : `border-[var(--line)] ${zone}`
              }`}
            >
              {isMe && <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold leading-none">我</span>}
            </div>
          )
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)] sm:mt-4">
        左上更靠前，右下更靠后。圆点为叙事示意。
      </p>
    </section>
  )
}

function GateStage({ subjects, meetsLimits }: { subjects: Subject[]; meetsLimits: boolean }) {
  const subjectPass = subjects.includes('物理') && subjects.includes('化学')

  return (
    <section className="workbench-card rounded-lg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <ShieldCheck className="h-6 w-6 text-[color:var(--brand)]" />
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">资格门槛</p>
          <h2 className="mt-1 text-xl font-semibold text-[color:var(--ink)]">
            {subjectPass && meetsLimits ? '这组可以进入检索' : '有门槛需要先解决'}
          </h2>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3 md:gap-3">
        <GatePill label="批次" value="本科普通批" good />
        <GatePill label="选科" value={subjectPass ? '物理 + 化学可用' : '部分理工组不可填'} good={subjectPass} />
        <GatePill label="章程" value={meetsLimits ? '进档后继续核验' : '可能不满足限制'} good={meetsLimits} />
      </div>
    </section>
  )
}

function ChoiceStack({ score, subjects }: { score: number; subjects: Subject[] }) {
  return (
    <section className="workbench-card rounded-lg p-3 sm:p-6">
      <div className="mb-2 flex items-center gap-3 sm:mb-5">
        <FileText className="h-5 w-5 text-[color:var(--brand)] sm:h-6 sm:w-6" />
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">前 6 个志愿示意</p>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)] sm:text-xl">顺序本身就是规则的一部分</h2>
        </div>
      </div>
      <div className="grid gap-1 sm:gap-2">
        {storyChoices.map((choice) => {
          const eligible = matchesRequirement(subjects, choice.requirement)
          return (
            <div key={choice.group} className="grid grid-cols-[28px_minmax(0,1fr)_58px] items-center gap-2 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_82%,white)] p-1.5 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:gap-3 sm:p-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--brand-soft)] text-sm font-semibold text-[color:var(--brand-dark)] sm:h-9 sm:w-9">
                {choice.order}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-[color:var(--ink)]">{choice.group}</span>
                <span className="mt-1 hidden text-xs text-[color:var(--ink-soft)] sm:block">
                  投档线 {choice.cutoff} · 要求 {requirementLabel(choice.requirement)}
                </span>
              </span>
              <span className={`rounded-md px-1.5 py-1 text-center text-[11px] font-semibold sm:px-2 sm:text-xs ${eligible && score >= choice.cutoff ? 'bg-[color-mix(in_oklch,var(--sage-soft)_52%,white)] text-[color:var(--ink)]' : 'bg-[color-mix(in_oklch,var(--paper-strong)_76%,white)] text-[color:var(--ink-soft)]'}`}>
                {eligible ? '可检索' : '选科不符'}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function FilingStage({
  firstMatchedIndex,
  matchedChoice,
}: {
  firstMatchedIndex: number
  matchedChoice: (typeof storyChoices)[number] | null
}) {
  return (
    <section className="workbench-card rounded-lg p-3 sm:p-6">
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-5">
        <div className="flex items-center gap-3">
          <Waypoints className="h-5 w-5 text-[color:var(--brand)] sm:h-6 sm:w-6" />
          <div>
            <p className="text-xs font-semibold text-[color:var(--brand)]">检索轨迹</p>
            <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)] sm:text-xl">
              {matchedChoice ? `档案投到 ${matchedChoice.group}` : '暂未形成投档'}
            </h2>
          </div>
        </div>
      </div>
      <div className="grid gap-1 sm:gap-2">
        {storyChoices.map((choice, index) => {
          const state = getChoiceState(index, firstMatchedIndex)
          return (
            <div
              key={choice.group}
              className={`grid grid-cols-[28px_minmax(0,1fr)_72px] items-center gap-2 rounded-lg border p-1.5 sm:grid-cols-[34px_minmax(0,1fr)_86px] sm:gap-3 sm:p-3 ${getChoiceStateClass(state)}`}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[color-mix(in_oklch,var(--paper-strong)_92%,white)] text-sm font-semibold sm:h-8 sm:w-8">
                {choice.order}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{choice.group}</div>
                <div className="mt-1 hidden text-xs opacity-75 sm:block">投档线 {choice.cutoff} · 计划余额 {choice.seats}</div>
              </div>
              <div className="text-right text-xs font-semibold">{getChoiceStateLabel(state)}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MajorStage({
  matchedChoice,
}: {
  matchedChoice: (typeof storyChoices)[number] | null
}) {
  const majors = matchedChoice?.majors || storyChoices[1].majors

  return (
    <section className="workbench-card rounded-lg p-3 sm:p-6">
      <div className="mb-2 flex items-center gap-3 sm:mb-5">
        <GraduationCap className="h-5 w-5 text-[color:var(--brand)] sm:h-6 sm:w-6" />
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">进档后</p>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)] sm:text-xl">
            {matchedChoice ? `${matchedChoice.group} 组内分专业` : '组内分专业'}
          </h2>
        </div>
      </div>
      <div className="grid gap-1 sm:gap-2">
        {majors.map((major, index) => (
          <div key={major} className="grid grid-cols-[36px_minmax(0,1fr)_50px] items-center gap-2 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_82%,white)] p-2 sm:grid-cols-[44px_minmax(0,1fr)_68px] sm:gap-3 sm:p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--brand-soft)] text-sm font-semibold text-[color:var(--brand-dark)] sm:h-9 sm:w-9">
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[color:var(--ink)]">{major}</div>
              <div className="mt-0.5 text-xs text-[color:var(--ink-soft)]">专业志愿 {index + 1}</div>
            </div>
            <div className="text-right text-[11px] font-semibold text-[color:var(--ink-soft)] sm:text-xs">
              组内
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-[color-mix(in_oklch,var(--brand)_20%,var(--line))] bg-[var(--brand-soft)] px-3 py-2 text-sm font-semibold text-[color:var(--brand-dark)] sm:mt-4">
        专业安排只在已投档的院校专业组内发生，不跨学校、不跨专业组。
      </div>
    </section>
  )
}

function RiskStage({
  acceptAdjustment,
  setAcceptAdjustment,
  meetsLimits,
  setMeetsLimits,
  adjustmentOutcome,
}: {
  acceptAdjustment: boolean
  setAcceptAdjustment: (value: boolean) => void
  meetsLimits: boolean
  setMeetsLimits: (value: boolean) => void
  adjustmentOutcome: { title: string; detail: string; className: string; icon: ReactNode }
}) {
  return (
    <section className="workbench-card rounded-lg p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-[color:var(--brand)]" />
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">退档风险</p>
          <h2 className="mt-1 text-xl font-semibold text-[color:var(--ink)]">两个条件决定风险大小</h2>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <ToggleRow label="服从组内专业调剂" checked={acceptAdjustment} onChange={setAcceptAdjustment} help="关闭后，专业装不下时更容易退档。" />
        <ToggleRow label="符合章程限制条件" checked={meetsLimits} onChange={setMeetsLimits} help="体检、单科、语种等要求仍要核验。" />
      </div>
      <div className={`mt-4 rounded-lg border p-4 text-[color:var(--ink)] ${adjustmentOutcome.className}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {adjustmentOutcome.icon}
          {adjustmentOutcome.title}
        </div>
        <p className="mt-2 text-sm leading-6">{adjustmentOutcome.detail}</p>
      </div>
    </section>
  )
}

function AfterStage() {
  return (
    <section className="workbench-card rounded-lg p-3 sm:p-6">
      <div className="mb-3 flex items-center gap-3 sm:mb-5">
        <RotateCcw className="h-5 w-5 text-[color:var(--brand)] sm:h-6 sm:w-6" />
        <div>
          <p className="text-xs font-semibold text-[color:var(--brand)]">征求志愿</p>
          <h2 className="mt-1 text-lg font-semibold text-[color:var(--ink)] sm:text-xl">不是自动补录，而是重新填报</h2>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center md:gap-3">
        <AfterStep icon={<BookOpenCheck className="h-5 w-5" />} title="公布缺额" />
        <ArrowRight className="mx-auto hidden h-5 w-5 text-[color:var(--ink-soft)] md:block" />
        <AfterStep icon={<FileText className="h-5 w-5" />} title="重新填报" />
        <ArrowRight className="mx-auto hidden h-5 w-5 text-[color:var(--ink-soft)] md:block" />
        <AfterStep icon={<ListChecks className="h-5 w-5" />} title="再次投档录取" />
      </div>
      <div className="mt-3 flex flex-wrap gap-2 sm:mt-6">
        <Link href="/" className="focus-ring rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper-strong)_88%,white)] px-2.5 py-2 text-sm font-semibold text-[color:var(--ink-soft)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] sm:px-3">
          回到首页
        </Link>
        <Link href="/lookup" className="focus-ring rounded-lg bg-[var(--brand-dark)] px-2.5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand)] sm:px-3">
          查询数据
        </Link>
        {sourceLinks.map((source) => (
          <a
            key={source.href}
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="focus-ring rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_82%,white)] px-2.5 py-2 text-sm font-semibold text-[color:var(--ink-soft)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] sm:px-3"
          >
            {source.shortLabel}
          </a>
        ))}
      </div>
    </section>
  )
}

function GatePill({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div
      className={`rounded-lg border p-3 sm:p-4 ${
        good
          ? 'border-[color-mix(in_oklch,var(--sage)_24%,var(--line))] bg-[color-mix(in_oklch,var(--sage-soft)_46%,white)]'
          : 'border-[color-mix(in_oklch,oklch(0.52_0.115_18)_24%,var(--line))] bg-[color-mix(in_oklch,var(--rose-soft)_50%,white)]'
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
        <div className="text-xs font-semibold text-[color:var(--ink-soft)]">{label}</div>
        {good ? <CheckCircle2 className="h-4 w-4 text-[color:var(--sage)]" /> : <XCircle className="h-4 w-4 text-[color:var(--ink)]" />}
      </div>
      <div className="text-base font-semibold text-[color:var(--ink)] sm:text-lg">{value}</div>
    </div>
  )
}

function AfterStep({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_82%,white)] p-3 text-center sm:p-5">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[color:var(--brand-dark)] sm:h-10 sm:w-10">
        {icon}
      </div>
      <div className="mt-2 text-sm font-semibold text-[color:var(--ink)] sm:mt-3">{title}</div>
    </div>
  )
}

function ToggleRow({
  label,
  help,
  checked,
  onChange,
}: {
  label: string
  help: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="focus-ring grid grid-cols-[minmax(0,1fr)_48px] items-center gap-3 rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper)_82%,white)] p-3 text-left transition hover:border-[color:var(--brand)] hover:bg-[color-mix(in_oklch,var(--paper-strong)_90%,white)] sm:grid-cols-[minmax(0,1fr)_52px]"
    >
      <span>
        <span className="block text-sm font-semibold text-[color:var(--ink)]">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-[color:var(--ink-soft)]">{help}</span>
      </span>
      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition ${checked ? 'bg-[var(--brand-dark)]' : 'bg-[var(--line)]'}`}
        aria-hidden="true"
      >
        <span className={`h-5 w-5 rounded-full bg-[color-mix(in_oklch,var(--paper-strong)_92%,white)] transition ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </span>
    </button>
  )
}

function Term({ name, children }: { name: TermName; children?: ReactNode }) {
  const label = children || name
  const definition = termDefinitions[name]

  return (
    <span className="group/term relative inline-flex align-baseline">
      <button
        type="button"
        aria-label={`${String(label)}：${definition}`}
        title={definition}
        className="focus-ring cursor-help rounded-[3px] px-1 font-semibold text-[color:var(--ink)] shadow-[inset_0_-0.42em_0_color-mix(in_oklch,var(--amber-soft)_88%,transparent)] transition hover:text-[color:var(--brand-dark)]"
      >
        {label}
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-full z-50 mt-2 hidden w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-[var(--line)] bg-[color-mix(in_oklch,var(--paper-strong)_96%,white)] p-3 text-left text-xs font-medium leading-5 text-[color:var(--ink-soft)] shadow-xl group-hover/term:block group-focus-within/term:block"
      >
        <span className="mb-1 block text-sm font-semibold text-[color:var(--ink)]">{name}</span>
        {definition}
      </span>
    </span>
  )
}
