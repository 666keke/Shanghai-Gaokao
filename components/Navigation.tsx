'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, Home, TrendingUp, GitCompare, Search, Target } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Home },
    { href: '/trends', label: t('nav.trends'), icon: TrendingUp },
    { href: '/compare', label: t('nav.compare'), icon: GitCompare },
    { href: '/lookup', label: t('nav.lookup'), icon: Target },
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">{t('nav.title')}</h1>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 transition-colors ${
                  pathname === href
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            <LanguageSelector />
          </div>

          {/* Mobile menu button - you can expand this later */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <button className="text-gray-600 hover:text-blue-600">
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 