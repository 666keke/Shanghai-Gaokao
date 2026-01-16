'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useDisclaimer } from '../contexts/DisclaimerContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function DisclaimerBanner() {
  const { hasAgreed, isLoading, setAgreed } = useDisclaimer()
  const { t } = useLanguage()

  // Don't render anything while loading to prevent layout shift
  if (isLoading) {
    return null
  }

  if (hasAgreed) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="my-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 mb-1">
            {t('disclaimer.title')}
          </h3>
          <p className="text-sm text-amber-700 mb-4">
            {t('disclaimer.content')}
          </p>
          <button
            onClick={setAgreed}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-500 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('disclaimer.agree')}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
