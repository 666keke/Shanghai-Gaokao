import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '../components/Navigation'
import { LanguageProvider } from '../contexts/LanguageContext'
import { DisclaimerProvider } from '../contexts/DisclaimerContext'
import DynamicLayout from '../components/DynamicLayout'

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
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <LanguageProvider>
          <DisclaimerProvider>
            <DynamicLayout>
              <div className="min-h-screen app-shell">
                <div className="relative min-h-screen">
                  <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
                  <div className="relative min-h-screen">
                    <Navigation />
                    {children}
                  </div>
                </div>
              </div>
            </DynamicLayout>
          </DisclaimerProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 