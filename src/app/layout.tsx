import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KVAnime - Cyberpunk Anime Browser',
  description: 'ACGOS-style anime browsing with CMS sources',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
