'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, HelpCircle, Lightbulb, BookOpen } from 'lucide-react'

interface HelpSectionProps {
  title: string
  type?: 'howToUse' | 'tips' | 'guide'
  icon?: 'help' | 'lightbulb' | 'book'
  children: React.ReactNode
  defaultExpanded?: boolean
  className?: string
}

export default function HelpSection({ 
  title, 
  type = 'howToUse',
  icon,
  children, 
  defaultExpanded = false,
  className = ''
}: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Define styling based on type
  const getTypeStyles = () => {
    switch (type) {
      case 'tips':
        return {
          container: 'glass-card border border-amber-100/60',
          title: 'text-amber-900',
          content: 'text-amber-700',
          button: 'text-amber-700 hover:text-amber-900'
        }
      case 'guide':
        return {
          container: 'glass-card border border-amber-100/60',
          title: 'text-amber-900',
          content: 'text-amber-700',
          button: 'text-amber-700 hover:text-amber-900'
        }
      case 'howToUse':
      default:
        return {
          container: 'glass-card border border-blue-100/60',
          title: 'text-blue-900',
          content: 'text-blue-700',
          button: 'text-blue-700 hover:text-blue-900'
        }
    }
  }

  // Get default icon based on type if not specified
  const getIcon = () => {
    if (icon === 'help') return <HelpCircle className="h-5 w-5" />
    if (icon === 'lightbulb') return <Lightbulb className="h-5 w-5" />
    if (icon === 'book') return <BookOpen className="h-5 w-5" />
    
    // Default icons based on type
    switch (type) {
      case 'tips':
        return <Lightbulb className="h-5 w-5" />
      case 'guide':
        return <BookOpen className="h-5 w-5" />
      case 'howToUse':
      default:
        return <HelpCircle className="h-5 w-5" />
    }
  }

  const styles = getTypeStyles()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${styles.container} rounded-3xl overflow-hidden ${className}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-6 ${styles.button} transition-colors hover:bg-white/50`}
      >
        <div className="flex items-center space-x-3">
          {getIcon()}
          <h2 className={`text-lg font-semibold ${styles.title}`}>
            {title}
          </h2>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className={`px-6 pb-6 ${styles.content}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 