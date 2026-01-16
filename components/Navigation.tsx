'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { GraduationCap, Home, Building2, Target, Menu, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Home },
    { href: '/lookup', label: t('nav.lookup'), icon: Target },
    { href: '/trends', label: t('nav.library'), icon: Building2 },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

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
      <nav className="sticky top-4 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="surface-card rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600">
                <GraduationCap className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {t('nav.title')}
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center rounded-full bg-slate-100/80 p-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm transition-colors ${
                      isActiveRoute(href)
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
              <LanguageSelector />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <LanguageSelector />
              <button
                onClick={isMobileMenuOpen ? closeMobileMenu : openMobileMenu}
                className="focus-ring rounded-xl bg-slate-100/80 p-2 text-slate-600 transition-all duration-200 hover:bg-slate-200/80"
                aria-label="Toggle mobile menu"
              >
                <div className="relative h-6 w-6">
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
          <div
            className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMobileMenu}
          />

          <div
            className={`fixed bottom-6 left-4 right-4 rounded-3xl bg-white shadow-2xl z-50 md:hidden transition-transform duration-300 ease-out ${
              isAnimating ? 'translate-y-0' : 'translate-y-6'
            }`}
          >
            <div className="flex flex-col">
              <div
                className={`flex items-center justify-between px-6 pt-6 transition-all duration-500 delay-100 ${
                  isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{t('nav.title')}</h2>
                  </div>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-slate-100/70 p-2 text-slate-500 transition-colors hover:bg-slate-200/80"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-6 pb-6 pt-4">
                <nav className="space-y-2">
                  {navItems.map(({ href, label, icon: Icon }, index) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeMobileMenu}
                      className={`flex items-center justify-between rounded-2xl px-4 py-4 text-base transition-all duration-500 ${
                        isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      } ${
                        isActiveRoute(href)
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                      style={{
                        transitionDelay: isAnimating ? `${200 + index * 100}ms` : '0ms'
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </div>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
} 