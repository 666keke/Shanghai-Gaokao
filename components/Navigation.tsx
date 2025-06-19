'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { GraduationCap, Home, TrendingUp, GitCompare, Target, Menu, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Home },
    { href: '/trends', label: t('nav.trends'), icon: TrendingUp },
    { href: '/compare', label: t('nav.compare'), icon: GitCompare },
    { href: '/lookup', label: t('nav.lookup'), icon: Target },
  ]

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true)
    // Use requestAnimationFrame to ensure the menu renders off-screen first
    requestAnimationFrame(() => {
      setIsAnimating(true)
    })
  }

  const closeMobileMenu = () => {
    setIsAnimating(false)
    // Delay closing to allow exit animation
    setTimeout(() => setIsMobileMenuOpen(false), 300)
  }

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t('nav.title')}</h1>
            </Link>
            
            {/* Desktop Navigation */}
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

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              <button 
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                className="text-gray-600 hover:text-blue-600 p-2 transition-all duration-200 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  <Menu 
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-180 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                    }`} 
                  />
                  <X 
                    className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                      isMobileMenuOpen ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
                    }`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Popup Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />
          
          {/* Popup Menu */}
          <div 
            className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div 
                className={`flex items-center justify-between p-6 border-b border-gray-200 transition-all duration-500 delay-100 ${
                  isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">{t('nav.title')}</h2>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-6">
                <nav className="space-y-1">
                  {navItems.map(({ href, label, icon: Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobileMenu}
                      className={`flex items-center space-x-3 px-6 py-4 text-base transition-all duration-500 ${
                        isAnimating 
                          ? 'opacity-100 translate-x-0' 
                          : 'opacity-0 translate-x-8'
                      } ${
                        pathname === href
                          ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600 font-medium'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      style={{
                        transitionDelay: isAnimating ? `${200 + index * 100}ms` : '0ms'
                      }}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Footer */}
              <div 
                className={`p-6 border-t border-gray-200 transition-all duration-500 delay-500 ${
                  isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="text-sm text-gray-500 text-center">
                  {t('nav.title')} © 2024
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
} 