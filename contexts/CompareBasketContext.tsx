'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface CompareBasketContextType {
  universities: string[]
  majorGroups: string[]
  hasHydrated: boolean
  hasSavedBasket: boolean
  addUniversity: (name: string) => void
  addMajorGroup: (name: string) => void
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
  const [universities, setUniversities] = useState<string[]>([])
  const [majorGroups, setMajorGroups] = useState<string[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)
  const [hasSavedBasket, setHasSavedBasket] = useState(false)

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

  const value = useMemo<CompareBasketContextType>(
    () => ({
      universities,
      majorGroups,
      hasHydrated,
      hasSavedBasket,
      addUniversity: (name) => {
        setUniversities((current) => {
          if (!name || current.includes(name) || current.length >= MAX_ITEMS) return current
          return [...current, name]
        })
      },
      addMajorGroup: (name) => {
        setMajorGroups((current) => {
          if (!name || current.includes(name) || current.length >= MAX_ITEMS) return current
          return [...current, name]
        })
      },
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
    [universities, majorGroups, hasHydrated, hasSavedBasket]
  )

  return (
    <CompareBasketContext.Provider value={value}>
      {children}
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
