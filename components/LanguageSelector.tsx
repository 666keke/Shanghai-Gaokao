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
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
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