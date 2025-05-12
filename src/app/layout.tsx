import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Voice Assistant',
  description: 'An AI-powered voice chat assistant using Gemini and OpenAI',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#1E1E2E',
  viewport: 'width=device-width, initial-scale=1.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background min-h-screen`}>
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  )
} 