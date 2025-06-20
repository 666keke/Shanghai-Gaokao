'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { useEffect } from 'react'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return <>{children}</>
} 