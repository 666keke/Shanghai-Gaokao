import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'
import { LanguageProvider } from '../contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  description: 'Modern analytics platform for Chinese university admission data, trends, and predictions',
  keywords: 'gaokao, university, admission, analytics, china, education',
  authors: [{ name: 'Gaokao Analytics Team' }],
  openGraph: {
    title: 'Gaokao Analytics - University Admission Intelligence',
    description: 'Comprehensive analytics for Chinese university admissions',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Navigation />
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
} 