'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguage } from './LanguageContext'

interface CompareBasketContextType {
  universities: string[]
  majorGroups: string[]
  hasHydrated: boolean
  hasSavedBasket: boolean
  addUniversity: (name: string) => boolean
  addMajorGroup: (name: string) => boolean
  showUniversityLimitNotice: () => void
  showMajorGroupLimitNotice: () => void
  removeUniversity: (name: string) => void
  removeMajorGroup: (name: string) => void
  clearBasket: () => void
  hasUniversity: (name: string) => boolean
  hasMajorGroup: (name: string) => boolean
  totalItems: number
}

const CompareBasketContext = createContext<CompareBasketContextType | undefined>(undefined)

const STORAGE_KEY = 'gaokao_compare_basket'
const MAX_ITEMS = 6

export function CompareBasketProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const [universities, setUniversities] = useState<string[]>([])
  const [majorGroups, setMajorGroups] = useState<string[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)
  const [hasSavedBasket, setHasSavedBasket] = useState(false)
  const [limitNotice, setLimitNotice] = useState<{ id: number; message: string } | null>(null)

  const showLimitNotice = useCallback((message: string) => {
    setLimitNotice({ id: Date.now(), message })
  }, [])

  const showUniversityLimitNotice = useCallback(() => {
    showLimitNotice(t('basket.universitiesFull', { count: MAX_ITEMS }))
  }, [showLimitNotice, t])

  const showMajorGroupLimitNotice = useCallback(() => {
    showLimitNotice(t('basket.majorGroupsFull', { count: MAX_ITEMS }))
  }, [showLimitNotice, t])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) {
        setHasSavedBasket(false)
        setHasHydrated(true)
        return
      }
      setHasSavedBasket(true)
      const parsed = JSON.parse(saved) as { universities?: string[]; majorGroups?: string[] }
      setUniversities(Array.isArray(parsed.universities) ? parsed.universities.slice(0, MAX_ITEMS) : [])
      setMajorGroups(Array.isArray(parsed.majorGroups) ? parsed.majorGroups.slice(0, MAX_ITEMS) : [])
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      setHasSavedBasket(false)
    } finally {
      setHasHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !hasHydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ universities, majorGroups }))
  }, [universities, majorGroups, hasHydrated])

  useEffect(() => {
    if (!limitNotice) return
    const timer = window.setTimeout(() => setLimitNotice(null), 2400)
    return () => window.clearTimeout(timer)
  }, [limitNotice])

  const value = useMemo<CompareBasketContextType>(
    () => ({
      universities,
      majorGroups,
      hasHydrated,
      hasSavedBasket,
      addUniversity: (name) => {
        if (!name || universities.includes(name)) return false
        if (universities.length >= MAX_ITEMS) {
          showUniversityLimitNotice()
          return false
        }
        setUniversities([...universities, name])
        return true
      },
      addMajorGroup: (name) => {
        if (!name || majorGroups.includes(name)) return false
        if (majorGroups.length >= MAX_ITEMS) {
          showMajorGroupLimitNotice()
          return false
        }
        setMajorGroups([...majorGroups, name])
        return true
      },
      showUniversityLimitNotice,
      showMajorGroupLimitNotice,
      removeUniversity: (name) => {
        setUniversities((current) => current.filter((item) => item !== name))
      },
      removeMajorGroup: (name) => {
        setMajorGroups((current) => current.filter((item) => item !== name))
      },
      clearBasket: () => {
        setUniversities([])
        setMajorGroups([])
      },
      hasUniversity: (name) => universities.includes(name),
      hasMajorGroup: (name) => majorGroups.includes(name),
      totalItems: universities.length + majorGroups.length,
    }),
    [
      universities,
      majorGroups,
      hasHydrated,
      hasSavedBasket,
      showUniversityLimitNotice,
      showMajorGroupLimitNotice,
    ]
  )

  return (
    <CompareBasketContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {limitNotice && (
          <motion.div
            key={limitNotice.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="pointer-events-none fixed left-1/2 top-20 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 shadow-lg"
            role="status"
          >
            {limitNotice.message}
          </motion.div>
        )}
      </AnimatePresence>
    </CompareBasketContext.Provider>
  )
}

export function useCompareBasket() {
  const context = useContext(CompareBasketContext)
  if (context === undefined) {
    throw new Error('useCompareBasket must be used within a CompareBasketProvider')
  }
  return context
}
