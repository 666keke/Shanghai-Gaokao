'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface DisclaimerContextType {
  hasAgreed: boolean
  isLoading: boolean
  setAgreed: () => void
}

const DisclaimerContext = createContext<DisclaimerContextType | undefined>(undefined)

const STORAGE_KEY = 'gaokao_disclaimer_agreed'

export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const [hasAgreed, setHasAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const agreed = localStorage.getItem(STORAGE_KEY)
      if (agreed === 'true') {
        setHasAgreed(true)
      }
    }
    setIsLoading(false)
  }, [])

  const setAgreed = () => {
    setHasAgreed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
  }

  return (
    <DisclaimerContext.Provider value={{ hasAgreed, isLoading, setAgreed }}>
      {children}
    </DisclaimerContext.Provider>
  )
}

export function useDisclaimer() {
  const context = useContext(DisclaimerContext)
  if (context === undefined) {
    throw new Error('useDisclaimer must be used within a DisclaimerProvider')
  }
  return context
}
