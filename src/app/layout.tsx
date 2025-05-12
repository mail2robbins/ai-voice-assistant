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
  other: {
    'theme-color': '#1E1E2E',
    'viewport': 'width=device-width, initial-scale=1.0',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'application-name': 'AI Voice Assistant',
    'apple-mobile-web-app-title': 'Voice AI',
    'msapplication-TileColor': '#1E1E2E',
    'msapplication-config': 'none'
  }
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