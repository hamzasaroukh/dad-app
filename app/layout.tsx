import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'
import PinLock from '@/components/PinLock'
import RegisterSW from '@/components/RegisterSW'

export const metadata: Metadata = {
  title: 'الحسين النجاري — مصاريف',
  description: 'تطبيق تتبع المصاريف الشهرية',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'مصاريف',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4338ca',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <RegisterSW />
        <PinLock>
          <LanguageProvider>{children}</LanguageProvider>
        </PinLock>
      </body>
    </html>
  )
}
