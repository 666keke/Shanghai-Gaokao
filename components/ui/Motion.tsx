'use client'

import { Children, useEffect, useId, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { motionEase, motionTime } from '../../lib/motion'

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  return <MotionConfig reducedMotion="user" transition={{ duration: reduced ? 0 : motionTime.content, ease: motionEase.arrive }}>{children}</MotionConfig>
}

export function PageMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return <div key={pathname} className="page-motion">{children}</div>
}

export function StateSlot({ value, children, className = '', style }: { value: string | number; children?: ReactNode; className?: string; style?: CSSProperties }) {
  const reduced = useReducedMotion()
  if (reduced) return <span className={className} style={style}>{children ?? value}</span>
  return <span className={`motion-slot ${className}`} style={style}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span key={value} className="motion-slot-value" initial={{ y: '85%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '-85%', opacity: 0 }} transition={{ duration: motionTime.feedback, ease: motionEase.arrive }}>{children ?? value}</motion.span>
    </AnimatePresence>
  </span>
}

export function SelectionMarker({ id, surface = false }: { id: string; surface?: boolean }) {
  const reduced = useReducedMotion()
  return <motion.span aria-hidden="true" className={surface ? 'motion-selection-surface' : 'motion-selection-line'} layoutId={id} transition={{ duration: reduced ? 0 : motionTime.surface, ease: motionEase.travel }} />
}

export function MotionScope({ children }: { children: ReactNode }) {
  const id = useId()
  return <LayoutGroup id={id}>{children}</LayoutGroup>
}

export function MotionCollapse({ open, children, id, className = '', onRest }: { open: boolean; children: ReactNode; id?: string; className?: string; onRest?: () => void }) {
  const reduced = useReducedMotion()
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (contentRef.current) contentRef.current.inert = !open }, [open])
  return <motion.div id={id} className={`motion-collapse ${className}`} initial={false}
    animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
    transition={{ height: { duration: reduced ? 0 : motionTime.content, ease: motionEase.travel }, opacity: { duration: reduced ? 0 : 0.1, delay: open && !reduced ? 0.06 : 0 } }}
    aria-hidden={!open} ref={contentRef} onAnimationComplete={onRest}>
    {children}
  </motion.div>
}

// Keep native summary/keyboard semantics. The content stays mounted through exit.
export function MotionDisclosure({ children, defaultOpen = false, ...props }: Omit<HTMLAttributes<HTMLDetailsElement>, 'onClick'> & { defaultOpen?: boolean }) {
  const [expanded, setExpanded] = useState(defaultOpen)
  const [present, setPresent] = useState(defaultOpen)
  const current = useRef(expanded)
  current.current = expanded
  const [summary, ...body] = Children.toArray(children)
  return <details {...props} open={present} data-expanded={expanded} className={`motion-disclosure ${props.className || ''}`} onClick={event => {
    const target = event.target as HTMLElement
    const heading = target.closest('summary')
    if (!heading || heading.parentElement !== event.currentTarget || target.closest('a,button,input,select')) return
    event.preventDefault()
    setPresent(true)
    setExpanded(value => !value)
  }}>
    {summary}
    <MotionCollapse open={expanded} onRest={() => { if (!current.current) setPresent(false) }}>{body}</MotionCollapse>
  </details>
}

export function PanelSwap({ value, children }: { value: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  return <div className="motion-panel-stack"><AnimatePresence initial={false} mode="popLayout">
    <motion.div key={value} initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -3, pointerEvents: 'none' }} transition={{ duration: reduced ? 0 : motionTime.feedback, ease: motionEase.arrive }}>{children}</motion.div>
  </AnimatePresence></div>
}
