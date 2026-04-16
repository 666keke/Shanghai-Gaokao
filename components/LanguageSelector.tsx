'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by showing placeholder until mounted
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[color:var(--ink-soft)] transition-colors hover:bg-stone-100 hover:text-[color:var(--ink)]"
          disabled
        >
          <Globe size={16} />
          <span className="font-medium">中文</span>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[color:var(--ink-soft)] transition-colors hover:bg-stone-100 hover:text-[color:var(--ink)]"
        title={t('language.select')}
      >
        <Globe size={16} />
        <span className="font-medium">
          {language === 'zh' ? '中文' : 'English'}
        </span>
      </button>
    </div>
  )
} 
