'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { motionEase, motionTime } from '../lib/motion'
import { StateSlot } from './ui/Motion'
import { createPortal } from 'react-dom'
import { Building2, Check, Layers, Plus } from 'lucide-react'
import { useCompareBasket } from '../contexts/CompareBasketContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function CompareMenu({ universityName, groupName }: { universityName: string; groupName: string }) {
  const basket = useCompareBasket()
  const { t } = useLanguage()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()
  const groupAdded = basket.hasMajorGroup(groupName)
  const universityAdded = basket.hasUniversity(universityName)
  const selectedCount = Number(groupAdded) + Number(universityAdded)

  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) trigger.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const outside = (event: PointerEvent) => {
      if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) close()
    }
    const dismiss = () => close()
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', dismiss)
    // Keep the popup attached to its original row when the list moves.
    const scroll = (event: Event) => { if (!menu.current?.contains(event.target as Node)) close() }
    window.addEventListener('scroll', scroll, true)
    return () => {
      document.removeEventListener('pointerdown', outside)
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', scroll, true)
    }
  }, [open])

  const toggle = () => {
    if (open) return close()
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const height = 160
    setOpen(true)
    setPosition({
      left: Math.max(12, Math.min(rect.right - 248, window.innerWidth - 260)),
      top: rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6),
    })
  }

  return <>
    <button ref={trigger} type="button" className="focus-ring compare-action primary-action compare-trigger" aria-label={`${groupName} ${isChinese ? '对比选项' : 'comparison options'}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} aria-pressed={selectedCount > 0}
      onClick={event => { event.stopPropagation(); toggle() }}
      onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); toggle() } }}>
      {selectedCount ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      <StateSlot className="compare-state-label" value={selectedCount}>{selectedCount ? (isChinese ? `已选 ${selectedCount}` : `Added ${selectedCount}`) : (isChinese ? '对比' : 'Compare')}</StateSlot>
    </button>
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>{open && <motion.div key="compare-menu" initial={reduced ? false : { opacity: 0, y: -5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -3, scale: reduced ? 1 : 0.985 }} transition={{ duration: reduced ? 0 : motionTime.feedback, ease: motionEase.arrive }} ref={menu} id={id} role="menu" aria-label={isChinese ? '选择对比对象' : 'Choose comparison type'} className="compare-popup" style={position}
        onKeyDown={event => {
          if (event.key === 'Escape') { event.preventDefault(); close(true) }
          if (event.key === 'Tab') close()
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            const buttons = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('button') || [])
            const current = buttons.indexOf(document.activeElement as HTMLButtonElement)
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length
            buttons[next]?.focus()
          }
        }}>
        <p className="compare-popup-title">{universityName}</p>
        <button type="button" role="menuitemcheckbox" aria-checked={groupAdded} onClick={() => { groupAdded ? basket.removeMajorGroup(groupName) : basket.addMajorGroup(groupName); close(true) }}>
          <Layers className="h-4 w-4" /><span>{isChinese ? '对比专业组' : 'Compare group'}</span>{groupAdded && <Check className="h-4 w-4" />}
        </button>
        <button type="button" role="menuitemcheckbox" aria-checked={universityAdded} onClick={() => { universityAdded ? basket.removeUniversity(universityName) : basket.addUniversity(universityName); close(true) }}>
          <Building2 className="h-4 w-4" /><span>{isChinese ? '对比整所院校' : 'Compare university'}</span>{universityAdded && <Check className="h-4 w-4" />}
        </button>
      </motion.div>}</AnimatePresence>, document.body
    )}
  </>
}
