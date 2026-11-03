'use client'

import { useLanguage } from '../contexts/LanguageContext'
import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  )
}
