'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUp, RotateCcw } from 'lucide-react'
import { PanelSwap } from '../ui/Motion'
import { motionEase, motionTime } from '../../lib/motion'
import s from './ruleExamples.module.css'

const groups = [
  { id: 'a', name: '甲校 · 01组', available: false },
  { id: 'b', name: '乙校 · 01组', available: true },
  { id: 'c', name: '丙校 · 02组', available: true },
]

export function FilingExample() {
  const [swapped, setSwapped] = useState(false)
  const reduced = useReducedMotion()
  const ordered = swapped ? [groups[0], groups[2], groups[1]] : groups
  const matchIndex = ordered.findIndex(group => group.available)
  const matched = ordered[matchIndex]
  const skipped = ordered[matchIndex + 1]

  return <div className={s.example} aria-labelledby="filing-example-title">
    <div className={s.heading}><h3 id="filing-example-title">换个顺序，档案会投向哪里？</h3><span>投档示例</span></div>
    <p className={s.caption}>假设你符合三组的投档条件。甲校已满，乙校和丙校都有余额。</p>
    <ol className={s.choices} aria-label="示例志愿顺序">
      {ordered.map((group, index) => <motion.li key={group.id} layout="position" transition={{ duration: reduced ? 0 : motionTime.surface, ease: motionEase.travel }} className={`${s.choice} ${index === matchIndex ? s.matched : index > matchIndex ? s.skipped : ''}`}>
        <span className={s.order}>0{index + 1}</span>
        <div><strong>{group.name}</strong><small>{group.available ? '有计划余额' : '计划已满'}</small></div>
        <span className={s.outcome}>{index === matchIndex ? '投档' : index < matchIndex ? '继续检索' : '不再检索'}</span>
      </motion.li>)}
    </ol>
    <div className={s.result} role="status" aria-live="polite" aria-atomic="true">
      <PanelSwap value={matched.id}><strong>档案投向{matched.name}</strong><p>{skipped.name}虽有余额，本轮也不再检索。{swapped ? '调换顺序后，优先投向了丙校。' : '如果更想去丙校，试着把它往前放。'}</p></PanelSwap>
    </div>
    <button type="button" className={s.action} onClick={() => setSwapped(current => !current)}>{swapped ? <RotateCcw size={16} /> : <ArrowUp size={16} />}{swapped ? '恢复原顺序' : '把丙校移到乙校前面'}</button>
    <p className={s.footnote}>院校为虚构，只演示检索顺序，不预测录取结果。</p>
  </div>
}

export function AdjustmentExample() {
  const [adjustment, setAdjustment] = useState(true)
  const [eligible, setEligible] = useState(true)
  const canAdjust = adjustment && eligible
  const explanation = !eligible
    ? '不符合体检、语种或单科成绩等专业录取条件，即使服从调剂，也可能被退档。'
    : !adjustment
      ? '所填专业均已录满，又不接受组内其他专业，可能无法安排专业。本轮不会再投向下一个志愿。'
      : '高校可按招生章程考虑组内其他专业，仍须审核确认，服从调剂不保证录取。'

  return <div className={s.example} aria-labelledby="adjustment-example-title">
    <div className={s.heading}><h3 id="adjustment-example-title">专业满了，还能怎样安排？</h3><span>调剂情境</span></div>
    <p className={s.caption}>假设所填专业都已录满，组内其他专业仍有名额。</p>
    <div className={s.conditions}>
      <label><span>服从组内专业调剂</span><input type="checkbox" role="switch" checked={adjustment} onChange={event => setAdjustment(event.target.checked)} /><span className={s.switch} aria-hidden="true" /></label>
      <label><span>符合专业录取条件</span><input type="checkbox" role="switch" checked={eligible} onChange={event => setEligible(event.target.checked)} /><span className={s.switch} aria-hidden="true" /></label>
    </div>
    <div className={`${s.result} ${!canAdjust ? s.caution : ''}`} role="status" aria-live="polite" aria-atomic="true">
      <PanelSwap value={`${adjustment}-${eligible}`}><strong>{canAdjust ? '可考虑组内调剂' : '存在退档风险'}</strong><p>{explanation}</p></PanelSwap>
    </div>
  </div>
}
