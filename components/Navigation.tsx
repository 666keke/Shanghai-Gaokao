'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { BarChart3, Building2, GraduationCap, Home, Menu, ShoppingBasket, Target, Trash2, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useCompareBasket } from '../contexts/CompareBasketContext'
import LanguageSelector from './LanguageSelector'

export default function Navigation() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const basket = useCompareBasket()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBasketOpen, setIsBasketOpen] = useState(false)
  const isChinese = t('nav.title') === '上海高考志愿分析'

  const navItems = [
    { href: '/', label: t('nav.dashboard'), icon: Home },
    { href: '/lookup', label: t('nav.lookup'), icon: Target },
    { href: '/trends', label: t('nav.library'), icon: Building2 },
  ]

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsBasketOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur">
        <div className="page-wrap">
          <div className="flex min-h-[72px] items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--brand-soft)_76%,white)] text-[color:var(--brand-dark)]">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold tracking-tight text-[color:var(--ink)] sm:text-lg">
                  {t('nav.title')}
                </h1>
                <p className="hidden text-xs text-[color:var(--ink-soft)] sm:block">
                  2020-2024 admission data
                </p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-white/70 p-1">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                      isActiveRoute(href)
                        ? 'bg-[var(--brand-dark)] text-white'
                        : 'text-[color:var(--ink-soft)] hover:bg-stone-100 hover:text-[color:var(--ink)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsBasketOpen((open) => !open)}
                  className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--ink-soft)] transition-colors hover:bg-stone-100 hover:text-[color:var(--ink)]"
                >
                  <ShoppingBasket className="h-4 w-4" />
                  <span>{isChinese ? '对比篮' : 'Basket'}</span>
                  {basket.totalItems > 0 && (
                    <span className="rounded-md bg-[var(--brand-soft)] px-1.5 py-0.5 text-xs font-semibold text-[color:var(--brand-dark)]">
                      {basket.totalItems}
                    </span>
                  )}
                </button>

                {isBasketOpen && <BasketPanel isChinese={isChinese} />}
              </div>
              <div className="h-8 w-px bg-stone-200" />
              <LanguageSelector />
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <LanguageSelector />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((open) => !open)}
                className="focus-ring rounded-lg border border-stone-200 bg-white/80 p-2 text-[color:var(--ink-soft)]"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-slate-900/20"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-4 right-4 top-20 rounded-lg border border-stone-200 bg-[var(--paper-strong)] p-3 shadow-xl">
            <div className="mb-2 flex items-center gap-2 px-2 py-2 text-sm font-semibold text-[color:var(--ink)]">
              <BarChart3 className="h-4 w-4 text-[color:var(--brand)]" />
              {isChinese ? '导航' : 'Navigation'}
            </div>
            <div className="grid gap-1">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium ${
                    isActiveRoute(href)
                      ? 'bg-[var(--brand-dark)] text-white'
                      : 'text-[color:var(--ink-soft)] hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                </Link>
              ))}
              <Link
                href="/trends"
                className="mt-2 flex items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-3 text-sm font-medium text-[color:var(--ink)]"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBasket className="h-4 w-4" />
                  {isChinese ? '对比篮' : 'Compare Basket'}
                </span>
                <span className="rounded-md bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-semibold text-[color:var(--brand-dark)]">
                  {basket.totalItems}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BasketPanel({ isChinese }: { isChinese: boolean }) {
  const basket = useCompareBasket()
  const hasItems = basket.totalItems > 0

  return (
    <div className="absolute right-0 top-12 z-50 w-[360px] rounded-lg border border-stone-200 bg-[var(--paper-strong)] p-4 shadow-xl">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[color:var(--ink)]">
            {isChinese ? '对比篮' : 'Compare Basket'}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
            {isChinese ? '最多各保存 6 个院校和专业组。' : 'Save up to 6 universities and 6 major groups.'}
          </p>
        </div>
        {hasItems && (
          <button
            type="button"
            onClick={basket.clearBasket}
            className="focus-ring rounded-md p-1.5 text-slate-500 hover:bg-stone-100 hover:text-rose-700"
            aria-label={isChinese ? '清空对比篮' : 'Clear basket'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasItems ? (
        <div className="grid gap-3">
          <BasketSection
            title={isChinese ? '院校' : 'Universities'}
            items={basket.universities}
            onRemove={basket.removeUniversity}
          />
          <BasketSection
            title={isChinese ? '专业组' : 'Major Groups'}
            items={basket.majorGroups}
            onRemove={basket.removeMajorGroup}
          />
          <Link
            href={basket.universities.length === 0 && basket.majorGroups.length > 0 ? '/trends#major-groups' : '/trends'}
            className="focus-ring mt-1 flex items-center justify-center rounded-lg bg-[var(--brand-dark)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand)]"
          >
            {isChinese ? '打开院校库对比' : 'Open comparison'}
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-4 text-sm text-[color:var(--ink-soft)]">
          {isChinese
            ? '在查询结果或院校库里点击“加入对比”，这里会保存你的候选项。'
            : 'Use “Add to compare” in lookup results or the library to save candidates here.'}
        </div>
      )}
    </div>
  )
}

function BasketSection({
  title,
  items,
  onRemove,
}: {
  title: string
  items: string[]
  onRemove: (item: string) => void
}) {
  if (items.length === 0) return null

  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase text-[color:var(--ink-soft)]">{title}</div>
      <div className="grid gap-1">
        {items.map((item) => (
          <div
            key={item}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-white/75 px-2.5 py-2 text-sm"
          >
            <span className="truncate font-medium text-[color:var(--ink)]">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="focus-ring rounded-md p-1 text-slate-400 hover:bg-stone-100 hover:text-rose-700"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
