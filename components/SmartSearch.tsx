'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  GraduationCap, 
  Clock,
  Award
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

interface UniversityData {
  组名: string
  院校名: string
  组号: string
  投档线: string
  语文数学合计: number | null
  外语: number | null
  选考最高: number | null
  选考次高: number | null
  选考最低: number | null
  加分: number | null
  最低排名: number | null
  年份: number
}

interface SearchSuggestion {
  type: 'university' | 'recent'
  value: string
  rank?: number
  programs?: number
  matchedText?: string
}

interface SmartSearchProps {
  data: UniversityData[]
  onSearch: (term: string) => void
  onSelectUniversity?: (university: string) => void
  placeholder?: string
}

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function SmartSearch({ 
  data, 
  onSearch, 
  onSelectUniversity,
  placeholder
}: SmartSearchProps) {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  const searchInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 150)

  // Initialize search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gaokao-search-history')
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse search history:', e)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveSearchHistory = useCallback((term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8)
    setSearchHistory(newHistory)
    localStorage.setItem('gaokao-search-history', JSON.stringify(newHistory))
  }, [searchHistory])

  // Optimized fuzzy search function
  const fuzzyMatch = useCallback((text: string, query: string): number => {
    if (!query) return 0
    
    const textLower = text.toLowerCase()
    const queryLower = query.toLowerCase()
    
    // Exact match gets highest score
    if (textLower.includes(queryLower)) {
      return 100 - (textLower.indexOf(queryLower) * 2)
    }
    
    // Character-by-character matching for fuzzy search
    let score = 0
    let queryIndex = 0
    
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        score += 1
        queryIndex++
      }
    }
    
    return queryIndex === queryLower.length ? score * 2 : 0
  }, [])

  // Pre-computed university stats for better performance
  const universityStats = useMemo(() => {
    const stats = new Map<string, { avgRanking: number; programs: number }>()
    
    Array.from(new Set(data.map(item => item.院校名))).forEach(name => {
      const universityData = data.filter(item => item.院校名 === name)
      const rankings = universityData.filter(item => item.最低排名).map(item => item.最低排名!)
      const avgRanking = rankings.length > 0 
        ? rankings.reduce((sum, rank) => sum + rank, 0) / rankings.length
        : 999999
      
      stats.set(name, {
        avgRanking: Math.round(avgRanking),
        programs: universityData.length
      })
    })
    
    return stats
  }, [data])

  // Generate search suggestions with optimized performance
  const suggestions = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      // Show recent searches and top universities when no search term
      const recentSuggestions: SearchSuggestion[] = searchHistory.slice(0, 4).map(term => ({
        type: 'recent',
        value: term
      }))

      const topUniversities = Array.from(universityStats.entries())
        .sort((a, b) => a[1].avgRanking - b[1].avgRanking)
        .slice(0, 6)
        .map(([name, stats]): SearchSuggestion => ({
          type: 'university',
          value: name,
          rank: stats.avgRanking < 999999 ? stats.avgRanking : undefined,
          programs: stats.programs
        }))

      return [...recentSuggestions, ...topUniversities]
    }

    const allSuggestions: SearchSuggestion[] = []

    // University suggestions with optimized search
    const universities = Array.from(universityStats.keys())
      .map(name => ({
        name,
        score: fuzzyMatch(name, debouncedSearchTerm),
        stats: universityStats.get(name)!
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ name, stats }): SearchSuggestion => ({
        type: 'university',
        value: name,
        rank: stats.avgRanking < 999999 ? stats.avgRanking : undefined,
        programs: stats.programs,
        matchedText: debouncedSearchTerm
      }))

    allSuggestions.push(...universities)
    
    return allSuggestions.slice(0, 8)
  }, [debouncedSearchTerm, searchHistory, universityStats, fuzzyMatch])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }, [showSuggestions, selectedIndex, suggestions])

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent') {
      setSearchTerm(suggestion.value)
      onSearch(suggestion.value)
    } else if (suggestion.type === 'university') {
      setSearchTerm(suggestion.value)
      onSelectUniversity?.(suggestion.value)
      saveSearchHistory(suggestion.value)
    }
    
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }, [onSearch, onSelectUniversity, saveSearchHistory])

  // Handle search execution
  const handleSearch = useCallback((term: string = searchTerm) => {
    if (term.trim()) {
      saveSearchHistory(term.trim())
      onSearch(term.trim())
    }
    setShowSuggestions(false)
  }, [searchTerm, saveSearchHistory, onSearch])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }, [])

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    setShowSuggestions(true)
  }, [])

  // Handle input blur (with delay to allow clicks)
  const handleInputBlur = useCallback(() => {
    setTimeout(() => setShowSuggestions(false), 200)
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setShowSuggestions(false)
    setSelectedIndex(-1)
    searchInputRef.current?.focus()
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Search Input */}
      <div className="relative flex gap-3">
        <div className="relative flex-1">
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder || t('dashboard.search.placeholder')}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="focus-ring w-full rounded-2xl border border-slate-200 bg-white/90 py-4 pl-4 pr-12 text-lg shadow-lg shadow-slate-900/10 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
              aria-label={t('common.clearSearch')}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => handleSearch()}
          className="rounded-2xl bg-blue-600 px-8 py-4 text-white font-medium shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center gap-2 hover:bg-blue-500"
          aria-label={t('common.search')}
        >
          <Search className="h-5 w-5" />
          <span className="hidden sm:inline">{t('dashboard.search.button')}</span>
        </button>
      </div>

      {/* Search Suggestions */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || debouncedSearchTerm) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-card rounded-2xl overflow-hidden z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
              <motion.div
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-slate-100 last:border-b-0 ${
                  index === selectedIndex ? 'bg-blue-50' : 'hover:bg-slate-50'
                }`}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                <div className="flex items-center w-full">
                  {/* Left: Icon + Name */}
                  <div className="flex items-center gap-3 truncate flex-1">
                    <div className="flex-shrink-0">
                      {suggestion.type === 'university' && (
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                      )}
                      {suggestion.type === 'recent' && (
                        <Clock className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <span className="font-medium text-slate-900 truncate">
                        {suggestion.matchedText ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: suggestion.value.replace(
                                new RegExp(`(${suggestion.matchedText})`, 'gi'),
                                '<mark class="bg-amber-200 text-amber-900">$1</mark>'
                              )
                            }}
                          />
                        ) : (
                          suggestion.value
                        )}
                      </span>
                      {suggestion.rank && suggestion.rank <= 1000 && (
                        <Award className="h-4 w-4 text-amber-500 inline-block ml-1 align-middle" />
                      )}
                    </div>
                  </div>

                  {/* Middle: Rank */}
                  <div className="hidden md:block px-4 text-left flex-shrink-0" style={{ minWidth: '150px' }}>
                    {suggestion.type === 'university' && (
                      <span className="text-slate-600 truncate">
                        {t('smartSearch.avgRanking', { rank: suggestion.rank ? suggestion.rank.toLocaleString() : 'N/A' })}
                      </span>
                    )}
                  </div>

                  {/* Right: Programs */}
                  <div className="text-right flex-shrink-0" style={{ minWidth: '100px' }}>
                    {suggestion.programs && (
                      <span className="text-slate-500">
                        {t('smartSearch.programsCount', { count: suggestion.programs })}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                <p>{t('smartSearch.noResults', { query: debouncedSearchTerm })}</p>
                <p className="mt-2 text-xs">{t('smartSearch.tip')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 