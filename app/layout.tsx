import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/contexts/AppContext'
import './globals.css'

export const metadata: Metadata = {
  title: '発注アシスト Cloud Biz',
  description: 'KU-DETA 発注 webアプリ',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
