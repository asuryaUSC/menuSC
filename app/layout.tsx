import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'USC Dining Menu',
  description: 'Quickly check today\'s USC dining hall menus.',
  manifest: '/manifest.json',
  themeColor: '#990000',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', outfit.variable)} suppressHydrationWarning>
      <head>
        <style>{`
          html, body, h1, h2, h3, h4, h5, h6, p, span, div, button, input, textarea, a, li, ul, ol, label, th, td {
            font-family: 'Outfit', system-ui, sans-serif !important;
          }
        `}</style>
        <link rel="icon" href="/icon.png" type="image/png" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MenuSC" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="apple-touch-startup-image" href="/icon.png" />
      </head>
      <body className={cn('h-full font-sans')}>
        {children}
      </body>
    </html>
  )
} 