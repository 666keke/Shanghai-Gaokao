import type { Metadata } from 'next'
import './globals.css'
import Navigation from '../components/Navigation'
import { LanguageProvider } from '../contexts/LanguageContext'
import { DisclaimerProvider } from '../contexts/DisclaimerContext'
import { CompareBasketProvider } from '../contexts/CompareBasketContext'
import { MotionProvider, PageMotion } from '../components/ui/Motion'
import { LookupProvider } from '../contexts/LookupContext'
import DynamicLayout from '../components/DynamicLayout'

export const metadata: Metadata = {
  description: 'Shanghai Gaokao admission records. Search by rank and compare historical cutoff scores.',
  keywords: 'gaokao, university, admission, analytics, china, education',
  authors: [{ name: 'Gaokao Analytics Team' }],
  openGraph: {
    title: 'Shanghai Gaokao admission data',
    description: 'Compare historical admission ranks and cutoff scores for universities and major groups.',
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
      <body>
        <LanguageProvider>
          <DisclaimerProvider>
            <CompareBasketProvider>
              <LookupProvider>
              <MotionProvider>
              <DynamicLayout>
                <div className="min-h-screen app-shell">
                  <div className="relative min-h-screen">
                    <div className="relative min-h-screen">
                      <Navigation />
                      <PageMotion>{children}</PageMotion>
                    </div>
                  </div>
                </div>
              </DynamicLayout>
              </MotionProvider>
              </LookupProvider>
            </CompareBasketProvider>
          </DisclaimerProvider>
        </LanguageProvider>
      </body>
    </html>
  )
} 
