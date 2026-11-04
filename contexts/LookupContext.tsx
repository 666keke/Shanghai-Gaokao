'use client'

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

export type SafetyFilter = 'all' | 'possiblySafe' | 'safe' | 'moderate' | 'risky' | 'notAdmitted'

interface LookupState {
  userRanking: string
  setUserRanking: Dispatch<SetStateAction<string>>
  selectedYear: number
  setSelectedYear: Dispatch<SetStateAction<number>>
  safetyFilter: SafetyFilter
  setSafetyFilter: Dispatch<SetStateAction<SafetyFilter>>
  searchTerm: string
  setSearchTerm: Dispatch<SetStateAction<string>>
  searchOpen: boolean
  setSearchOpen: Dispatch<SetStateAction<boolean>>
}

const LookupContext = createContext<LookupState | undefined>(undefined)

// Keep the query independent of route mounts, including PageMotion's keyed content.
export function LookupProvider({ children }: { children: ReactNode }) {
  const [userRanking, setUserRanking] = useState('')
  const [selectedYear, setSelectedYear] = useState(2025)
  const [safetyFilter, setSafetyFilter] = useState<SafetyFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  return <LookupContext.Provider value={{ userRanking, setUserRanking, selectedYear, setSelectedYear, safetyFilter, setSafetyFilter, searchTerm, setSearchTerm, searchOpen, setSearchOpen }}>{children}</LookupContext.Provider>
}

export function useLookup() {
  const state = useContext(LookupContext)
  if (!state) throw new Error('useLookup must be used within LookupProvider')
  return state
}
