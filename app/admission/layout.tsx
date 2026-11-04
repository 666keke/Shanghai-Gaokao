import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '上海高考投档与录取规则｜上海高考志愿分析',
  description: '2026年上海本科普通批次投档与专业录取规则，说明志愿检索、组内调剂、同分排序和征求志愿。',
}

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return children
}
