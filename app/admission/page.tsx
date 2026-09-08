'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, ArrowUpRight, ArrowRight, Check, ChevronDown, MinusCircle, Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import s from './admission.module.css'

const chapters = [
  { id: 'principles', label: '先懂规则' },
  { id: 'experiment', label: '试一次投档' },
  { id: 'after', label: '进档之后' },
  { id: 'questions', label: '解开误区' },
  { id: 'checklist', label: '填报前核对' },
]
const source = 'https://www.shmeea.edu.cn/page/08000/20260402/20157.html'
const initialGroups = [
  { id: 'A', name: '青浦大学 · 01组', field: '理工类', requirement: '物理 + 化学', limit: 6500 },
  { id: 'B', name: '浦江大学 · 02组', field: '人文社科类', requirement: '不限', limit: 9900 },
  { id: 'C', name: '申城大学 · 01组', field: '理工类', requirement: '物理 + 化学', limit: 11800 },
  { id: 'D', name: '海川学院 · 03组', field: '综合类', requirement: '不限', limit: 16000 },
]
type Group = typeof initialGroups[number]
const checklist = ['核对选科与专业组要求', '读过招生章程中的专业录取办法', '确认体检、语种、单科成绩等限制', '了解组内专业，再决定是否服从调剂', '按真实意愿排序，并留出梯度']
const questions = [
  { title: '把想冲的学校放第一，会影响后面的志愿吗？', answer: '如果前面的志愿未能投出，系统会接着检索后面的志愿；在平行志愿投档中，不会仅仅因为你把某组放在后面，就让分数更低的考生优先。不过，一旦前面的志愿投档成功，后面的志愿就不再检索。所以，能接受、也更喜欢的专业组，应该放在前面。', tag: '志愿顺序' },
  { title: '超过去年的最低位次，今年就稳了吗？', answer: '不能据此保证。历史最低位次是当年报考选择、招生计划和投档共同形成的结果。今年计划、专业组构成或考生偏好变化，都可能改变结果。比较时要看同一个专业组的多年数据，也要确认选科要求和组内专业是否发生变化。', tag: '历史数据' },
  { title: '同分的时候，谁先投档？', answer: '本科普通批次依次比较：语文与数学合计成绩；语文或数学中的单科最高成绩；外语成绩；选考科目最高成绩；选考科目次高成绩；考生志愿顺序。前一项相同才比较下一项。志愿顺序也相同的同分同位考生同时投档。公开的一分一段表位次不能完整代替这套同分排序。', tag: '同分排序' },
  { title: '同一所大学的不同专业组，可以互相调剂吗？', answer: '不可以。专业调剂只能在你被投档的院校专业组内进行。即使是同一所大学，另一个专业组里有空余名额，也不能据此跨组调剂。选择专业组时，要一起了解组内所有可能被调剂到的专业。', tag: '专业调剂' },
  { title: '退档后，会接着看我的下一个志愿吗？', answer: '本轮平行志愿投档不会重新检索后续志愿。2026 年上海本科普通批次录取后设两次征求志愿，符合相应条件的未录取考生需重新填报；第二次涉及降分政策及高校是否同意降分。具体资格、缺额计划与时间，以考试院当次公告为准。', tag: '征求志愿' },
]

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className={s.eyebrow}>{children}</div>
}

function SectionHeading({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <header className={s.sectionHeading}><span className={s.sectionNumber}>{number}</span><div><h2>{title}</h2><p>{children}</p></div></header>
}

export default function AdmissionGuidePage() {
  const [activeChapter, setActiveChapter] = useState('')
  const [checked, setChecked] = useState<number[]>([])
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [adjustment, setAdjustment] = useState(true)
  const [eligible, setEligible] = useState(true)
  const [progress, setProgress] = useState(0)
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      const article = articleRef.current
      if (!article) return
      const top = article.getBoundingClientRect().top + window.scrollY
      const length = article.offsetHeight - window.innerHeight
      setProgress(Math.min(100, Math.max(0, ((window.scrollY - top) / Math.max(1, length)) * 100)))
      let current = ''
      for (const chapter of chapters) {
        if ((document.getElementById(chapter.id)?.getBoundingClientRect().top ?? Infinity) < 210) current = chapter.id
      }
      setActiveChapter(current)
    }
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame) }
  }, [])

  return (
    <main className={s.page} ref={articleRef}>
      <div className={s.wrap}>
        <div className={s.folio}><span><i /> 志愿填报 · 规则解读</span><span>上海 / 2026 <span className={s.folioExtra}>　 ·　 约 6 分钟阅读</span></span></div>
        <header className={s.cover}>
          <div className={s.coverCopy}>
            <Eyebrow>录取规则 · 交互指南 <span>5 个章节</span></Eyebrow>
            <h1>你的志愿，<br /><em>究竟如何变成录取？</em></h1>
            <p className={s.coverLead}>从一张志愿表，到一个录取结果。<br />看懂中间的每一步，才能把选择权握在自己手里。</p>
            <div className={s.coverActions}><a href="#experiment" className={s.primaryLink}>亲手试一次投档 <ArrowUpRight size={19} /></a><a href="#principles" className={s.textLink}>从头读起 <ArrowDown size={16} /></a></div>
            <p className={s.scope}>适用于上海本科普通批次 · 依据 2026 年实施办法</p>
          </div>
          <CoverGraphic />
        </header>
        <div className={s.facts}>
          <div><strong>24<span>个</span></strong><p>平行志愿<small>每个志愿对应一个院校专业组</small></p></div>
          <div><strong>4<span>个</span></strong><p>组内专业志愿<small>每组另设是否服从专业调剂</small></p></div>
          <div><strong>1<span>次</span></strong><p>本轮投档机会<small>投档成功后，后续志愿停止检索</small></p></div>
        </div>
      </div>

      <nav className={s.chapterNav} aria-label="文章目录"><div className={s.navInner}><span className={s.navLabel}>阅读路线 <ArrowRight size={14} /></span>{chapters.map((chapter, index) => <a key={chapter.id} href={`#${chapter.id}`} aria-current={activeChapter === chapter.id ? 'location' : undefined}><span>0{index + 1}</span>{chapter.label}</a>)}<span className={s.readProgress}>{Math.round(progress)}%</span></div><div className={s.progressTrack} style={{ width: `${progress}%` }} /></nav>

      <div className={s.wrap}>
        <section id="principles" className={s.section}>
          <SectionHeading number="01" title="先记住这三个动作。">分数优先，遵循志愿，一轮投档。把这句话拆开，规则就清楚了。</SectionHeading>
          <div className={s.principles}>
            <div><span className={s.smallNumber}>第一步</span><div className={s.queueIllustration} aria-hidden="true">{[1, 2, 3, 4, 5, 6, 7].map(n => <i key={n} className={n === 5 ? s.you : ''}>{n === 5 ? '你' : ''}</i>)}</div><h3>先排队，看谁先被检索。</h3><p>按投档成绩从高到低处理考生。同分时，再按规定比较单科成绩等。排在前面的考生先投档。</p><span className={s.principleNote}>你的志愿顺序，不会改变你的成绩。</span></div>
            <div><span className={s.smallNumber}>第二步</span><div className={s.orderIllustration} aria-hidden="true"><span>01</span><ArrowRight /><span>02</span><ArrowRight /><b>03 <Check size={14} /></b></div><h3>轮到你，按你的顺序找。</h3><p>从第一个志愿开始，依次检索。遇到符合投档条件、还有计划余额的专业组，就向这一组投档。</p><span className={s.principleNote}>越想去的可接受选项，越应该靠前。</span></div>
            <div><span className={s.smallNumber}>第三步</span><div className={s.stopIllustration} aria-hidden="true"><span>投档成功</span><i /><b>停止检索</b></div><h3>一旦投出，这一轮就停。</h3><p>档案不会同时投给多所大学。高校接收档案后，依据招生章程安排专业、审核录取条件。</p><span className={s.principleNote}>投档成功，后面还有专业录取这一步。</span></div>
          </div>
        </section>

        <section id="experiment" className={`${s.section} ${s.experimentSection}`}>
          <SectionHeading number="02" title="如果现在轮到你。">改一改位次，换一换顺序，看档案会在哪里停下。</SectionHeading>
          <AdmissionExperiment />
          <div className={s.editorNote}><span>读图笔记</span><p>“最低位次”是投档完成后形成的结果。本演示用预设边界简化计划余额变化；院校、专业组与数字均为虚构，不用于预测录取。选科不符的条目仅为教学保留，实际填报时不具备该组报考资格。</p></div>
        </section>

        <section id="after" className={s.section}>
          <SectionHeading number="03" title="进了档，还没到终点。">考试院负责投档，高校负责专业录取。两步之间，最容易被忽略的是调剂与录取条件。</SectionHeading>
          <div className={s.afterGrid}>
            <div className={s.afterStory}><Eyebrow>从专业组，到具体专业</Eyebrow><h3>你选的不只是学校，<br />还有一个专业范围。</h3><p>同一所大学的不同专业组，是不同的志愿。组内专业如何分配，由高校招生章程决定，并不都采用同一种排序办法。</p><blockquote>调剂的边界，<br />是你投进的<strong>那一个专业组。</strong></blockquote><p>在填下“服从”之前，先看清组内还有哪些专业，以及自己是否愿意就读。</p></div>
            <div className={s.riskExperiment}><Eyebrow>情境推演 <span>试着切换选项</span></Eyebrow><h3>假设你填的 4 个专业都满了。</h3><p>组内还有其他专业的空余计划，接下来会怎样？</p><Toggle label="服从专业调剂" detail="愿意考虑该组内其他专业" checked={adjustment} onChange={setAdjustment} /><Toggle label="符合录取条件" detail="体检、单科成绩、外语语种等均符合" checked={eligible} onChange={setEligible} /><div className={`${s.riskResult} ${eligible && adjustment ? s.riskSuccess : s.riskWarning}`} role="status"><span>{eligible && adjustment ? '仍有专业安排的可能' : '存在退档风险'}</span><p>{!eligible ? '服从调剂不能消除录取条件限制。不符合章程要求，仍可能被退档。' : adjustment ? '高校可按已公布的调剂规则，在这个专业组内安排专业。最终结果仍需高校审核。' : '所填专业已满，又不接受调剂，高校可能无法安排专业。本轮后续志愿不会再被检索。'}</p></div></div>
          </div>
          <div className={s.routeStrip}><span>按位序投档</span><ArrowRight /><span>高校安排专业</span><ArrowRight /><strong>审核后录取</strong><p>若退档：关注征求志愿资格与公告，重新填报。</p></div>
        </section>

        <section id="questions" className={s.section}>
          <div className={s.questionGrid}><div><Eyebrow>填报时的常见疑问</Eyebrow><span className={s.sectionNumber}>04</span><h2>这些地方，<br />最容易想错。</h2><p>把“听说”变成有依据的判断。</p><a className={s.textLink} href={source} target="_blank" rel="noreferrer">对照官方实施办法 <ArrowUpRight size={16} /></a></div><div className={s.accordion}>{questions.map((question, index) => <div key={question.title} className={`${s.question} ${openQuestion === index ? s.questionOpen : ''}`}><h3><button type="button" aria-expanded={openQuestion === index} aria-controls={`answer-${index}`} onClick={() => setOpenQuestion(openQuestion === index ? null : index)}><span className={s.questionIndex}>0{index + 1}</span><span>{question.title}</span><ChevronDown size={18} /></button></h3><div id={`answer-${index}`} className={s.answer} hidden={openQuestion !== index}><span>{question.tag}</span><p>{question.answer}</p></div></div>)}</div></div>
        </section>

        <section id="checklist" className={`${s.section} ${s.checklistSection}`}>
          <div className={s.checklistIntro}><Eyebrow>05 / 填报前核对</Eyebrow><h2>最后，把规则<br />变成你的检查表。</h2><p>每确认一项，就勾掉一项。<br />带着清楚的判断，再去寻找适合自己的选择。</p><div className={s.checkCount}><strong>{checked.length}</strong><span>/ {checklist.length} 项已核对</span></div><div className={s.checkProgress} aria-hidden="true">{checklist.map((_, index) => <i key={index} className={index < checked.length ? s.checkProgressDone : undefined} />)}</div><p className={s.checkMessage} role="status">{checked.length === checklist.length ? '核对完成，带着这些判断去看院校吧。' : '逐项确认，给自己的选择多一份把握。'}</p></div>
          <div className={s.checklist}>{checklist.map((item, index) => <label key={item} className={checked.includes(index) ? s.checkedItem : ''}><input type="checkbox" checked={checked.includes(index)} onChange={() => setChecked(current => current.includes(index) ? current.filter(n => n !== index) : [...current, index])} /><span className={s.checkboxVisual}><Check size={16} /></span><span>{item}</span><small>0{index + 1}</small></label>)}<div className={s.nextLinks}><Link href="/lookup" className={s.primaryLink}>按我的位次找专业组 <ArrowUpRight size={18} /></Link><Link href="/trends" className={s.textLink}>看看历年走势 <ArrowRight size={16} /></Link></div></div>
        </section>

        <footer className={s.sources}><div><Eyebrow>资料来源与阅读说明</Eyebrow><a href={source} target="_blank" rel="noreferrer">上海市 2026 年普通高等学校招生志愿填报与投档录取实施办法 <ArrowUpRight size={15} /></a><p>上海市教育考试院 · 2026 年 4 月 2 日发布。本页解读聚焦本科普通批次；其他批次的志愿设置与投档方式可能不同。具体专业录取条件请查阅高校当年招生章程。</p></div><a href="#" className={s.backTop}>回到开头 <ArrowUp size={16} /></a></footer>
      </div>
    </main>
  )
}

function CoverGraphic() {
  return <figure className={`${s.coverGraphic} hero-workbench`}>
    <div className={s.graphicTop}><span>一份档案的旅程</span><span>投档示意</span></div>
    <div className={s.graphicQueue}><span>按成绩排队</span><div aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} className={i === 24 ? s.queueYou : i > 24 ? s.queueLater : ''}>{i === 24 ? '你' : ''}</i>)}</div><small>前面的考生先投档，接着轮到你。</small></div>
    <div className={s.graphicRoute}><div className={s.document}><span>你的志愿表</span><strong>24</strong><small>个可填的专业组</small><div aria-hidden="true"><i /><i /><i /></div></div><div className={s.graphicChoices}><div><span>01</span><p>第一个志愿<small>计划已满，继续</small></p><ArrowDown size={17} /></div><div className={s.graphicMatch}><span>02</span><p>下一个志愿<small>符合条件 · 有余额</small></p><Check size={18} /></div><div className={s.graphicClosed}><span>03</span><p>后续志愿<small>停止检索</small></p><span>—</span></div></div></div>
    <figcaption><span className={s.graphicArrow}>↳</span><p>顺序由你决定。<br /><strong>档案在第一个可投的志愿停下。</strong></p></figcaption>
    <div className={s.graphicBottom}><span>成绩决定先后 · 志愿决定路径</span><span>示意图</span></div>
  </figure>
}

function Toggle({ label, detail, checked, onChange }: { label: string; detail: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <button type="button" className={s.toggleRow} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span><strong>{label}</strong><small>{detail}</small></span><span className={`${s.toggle} ${checked ? s.toggleOn : ''}`}><i /></span></button>
}

function AdmissionExperiment() {
  const [rank, setRank] = useState(8600)
  const [subject, setSubject] = useState('science')
  const [groups, setGroups] = useState(initialGroups)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)
  const reducedMotion = useReducedMotion()
  const eligible = (group: Group) => group.requirement === '不限' || subject === 'science'
  const matchIndex = groups.findIndex(group => eligible(group) && rank <= group.limit)
  const stopAt = matchIndex === -1 ? groups.length : matchIndex + 1
  const finished = step >= stopAt
  const matched = finished && matchIndex !== -1

  useEffect(() => {
    if (!playing) return
    if (finished) { setPlaying(false); return }
    const timer = window.setTimeout(() => setStep(current => current + 1), reducedMotion ? 250 : 850)
    return () => window.clearTimeout(timer)
  }, [playing, step, finished, reducedMotion])

  const restart = () => { setPlaying(false); setStep(0) }
  const move = (index: number, direction: number) => {
    const next = [...groups]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setGroups(next)
    restart()
  }
  const reset = () => { setRank(8600); setSubject('science'); setGroups(initialGroups); restart() }
  const status = !step ? '系统准备就绪' : matched ? `档案投向${groups[matchIndex].name}` : finished ? '本轮没有可投的专业组' : `第 ${step} 志愿未投出，继续检索`

  return <div className={`${s.lab} workbench-card`}>
    <div className={s.labTop}><span><i /> 平行志愿实验室</span><span>虚构情境 · 仅演示规则</span></div>
    <div className={s.labGrid}>
      <div className={s.labControls}>
        <label htmlFor="simulation-rank" className={s.controlLabel}>假设你的投档位序是</label>
        <div className={s.rankValue}><strong>{rank.toLocaleString('en-US')}</strong><span>名</span></div>
        <input id="simulation-rank" type="range" min="1000" max="20000" step="100" value={rank} aria-valuetext={`第 ${rank} 名`} onChange={e => { setRank(Number(e.target.value)); restart() }} className={s.range} />
        <div className={s.rangeLabels}><span>1,000 名</span><span>20,000 名</span></div>
        <label htmlFor="simulation-subject" className={s.subjectLabel}>你的选科组合</label><select id="simulation-subject" value={subject} onChange={e => { setSubject(e.target.value); restart() }}><option value="science">物理 / 化学 / 地理</option><option value="humanities">政治 / 历史 / 地理</option></select>
        <div className={s.labHint}><span>试一试</span><p>保持位次不变，把“海川学院”移到前面。投档结果会改变吗？</p><button type="button" onClick={() => { setGroups([initialGroups[3], ...initialGroups.slice(0, 3)]); restart() }}>将海川学院移至第一位 <ArrowUpRight size={14} /></button></div>
        <button type="button" className={s.resetButton} onClick={reset}><RotateCcw size={14} /> 恢复初始情境</button>
      </div>
      <div className={s.labStage}>
        <div className={s.listHeading}><span>你的志愿顺序 <small>用箭头调整</small></span><span>检索结果</span></div>
        <ol className={s.groupList}>{groups.map((group, index) => {
          const scanned = index < step && index < stopAt
          const isMatch = scanned && index === matchIndex
          const isFull = scanned && eligible(group) && rank > group.limit
          const closed = finished && matchIndex !== -1 && index > matchIndex
          const reason = !eligible(group) ? '选科不符' : rank > group.limit ? '计划已满' : '投档成功'
          return <motion.li layout={!reducedMotion} transition={{ duration: 0.25 }} key={group.id} className={`${s.groupRow} ${isMatch ? s.groupMatched : ''} ${isFull ? s.groupFull : ''} ${closed ? s.groupClosed : ''}`}><span className={s.groupIndex}>0{index + 1}</span><div className={s.groupInfo}><strong>{group.name}</strong><span>{group.field} <i /> {group.requirement}</span><small>演示边界 {group.limit.toLocaleString('en-US')} 名</small></div><span className={`${s.groupStatus} ${isMatch ? s.statusMatched : isFull ? s.statusFull : scanned ? s.statusScanned : ''}`}>{scanned ? <>{isMatch && <Check size={14} />}{isFull && <MinusCircle size={12} aria-hidden="true" />}{reason}</> : closed ? '不再检索' : '等待检索'}</span><div className={s.orderButtons}><button type="button" disabled={index === 0} aria-label={`上移${group.name}`} onClick={() => move(index, -1)}><ArrowUp size={14} /></button><button type="button" disabled={index === groups.length - 1} aria-label={`下移${group.name}`} onClick={() => move(index, 1)}><ArrowDown size={14} /></button></div></motion.li>
        })}</ol>
        <div className={s.playback}><button type="button" className={s.playButton} onClick={() => { if (playing) { setPlaying(false); return } if (finished) setStep(0); setPlaying(true) }}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? '暂停演示' : finished ? '重新演示' : step ? '继续演示' : '开始投档'}</button><button type="button" className={s.stepButton} disabled={finished} onClick={() => { setPlaying(false); setStep(current => current + 1) }}><SkipForward size={15} /> 单步检索</button><span>{Math.min(step, stopAt)} / {groups.length}</span></div>
        <div className={`${s.labResult} ${matched ? s.labResultMatched : ''}`} role="status" aria-live="polite"><span className={s.resultIcon}>{matched ? <Check size={18} /> : <ArrowRight size={18} />}</span><div><strong>{status}</strong><p>{matched ? '后续志愿停止检索。接下来由高校进行专业录取。' : finished ? '演示中所有志愿均未能投出。试着调整位次，或恢复初始情境。' : step ? `“${groups[step - 1].name}”${eligible(groups[step - 1]) ? '在此情境下计划已满' : '不符合选科要求'}。` : '点击开始，看系统如何逐个检索；也可以单步查看。'}</p></div></div>
      </div>
    </div>
  </div>
}
