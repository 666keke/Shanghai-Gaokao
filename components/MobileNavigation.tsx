'use client'

import Link from 'next/link'
import { ShoppingBasket, Target } from 'lucide-react'
import { useCompareBasket } from '../contexts/CompareBasketContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function MobileNavigation({ active }: { active: 'lookup' | 'library' }) {
  const basket = useCompareBasket()
  const { t } = useLanguage()
  const isChinese = t('nav.title') === '上海高考志愿分析'
  const compareHref = basket.universities.length === 0 && basket.majorGroups.length > 0 ? '/trends#major-groups' : '/trends'
  return <nav className="lookup-bottom-nav" aria-label={isChinese ? '快捷导航' : 'Quick navigation'}>
    <Link href="/lookup" aria-current={active === 'lookup' ? 'page' : undefined}><Target className="h-5 w-5" /><span>{isChinese ? '查询' : 'Lookup'}</span></Link>
    <Link href={active === 'library' ? '/trends' : compareHref} aria-current={active === 'library' ? 'page' : undefined} aria-label={isChinese ? `对比，已选 ${basket.totalItems} 项` : `Compare, ${basket.totalItems} selected`}>
      <span className="relative"><ShoppingBasket className="h-5 w-5" />{basket.totalItems > 0 && <span className="basket-count" aria-hidden="true">{basket.totalItems}</span>}</span>
      <span>{isChinese ? '对比' : 'Compare'}</span>
    </Link>
  </nav>
}
