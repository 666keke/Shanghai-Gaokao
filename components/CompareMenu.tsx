'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Building2, Check, Layers, Plus } from 'lucide-react'
import { useCompareBasket } from '../contexts/CompareBasketContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function CompareMenu({ universityName, groupName }: { universityName: string; groupName: string }) {
  const basket = useCompareBasket()
  const { t } = useLanguage()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()
  const groupAdded = basket.hasMajorGroup(groupName)
  const universityAdded = basket.hasUniversity(universityName)
  const selectedCount = Number(groupAdded) + Number(universityAdded)

  const close = (restoreFocus = false) => {
    setPosition(null)
    if (restoreFocus) trigger.current?.focus()
  }

  useEffect(() => {
    if (!position) return
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
  }, [position])

  const toggle = () => {
    if (position) return close()
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const height = 160
    setPosition({
      left: Math.max(12, Math.min(rect.right - 248, window.innerWidth - 260)),
      top: rect.bottom + height + 8 < window.innerHeight ? rect.bottom + 6 : Math.max(8, rect.top - height - 6),
    })
  }

  return <>
    <button ref={trigger} type="button" className="focus-ring compare-action primary-action compare-trigger" aria-label={`${groupName} ${isChinese ? '对比选项' : 'comparison options'}`} aria-haspopup="menu" aria-expanded={!!position} aria-controls={position ? id : undefined} aria-pressed={selectedCount > 0}
      onClick={event => { event.stopPropagation(); toggle() }}
      onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); toggle() } }}>
      {selectedCount ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
      {selectedCount ? (isChinese ? `已选 ${selectedCount}` : `Added ${selectedCount}`) : (isChinese ? '对比' : 'Compare')}
    </button>
    {position && createPortal(
      <div ref={menu} id={id} role="menu" aria-label={isChinese ? '选择对比对象' : 'Choose comparison type'} className="compare-popup" style={position}
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
      </div>, document.body
    )}
  </>
}
