import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '录取规则：你的志愿如何变成录取？｜上海高考志愿分析',
  description: '通过投档实验、志愿换序和专业调剂情境，读懂上海 2026 年本科普通批次录取规则。附官方政策来源与填报核对清单。',
}

export default function AdmissionLayout({ children }: { children: React.ReactNode }) {
  return children
}
