import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NextAuthProvider } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Voice Chat Assistant',
  description: 'An AI-powered voice chat assistant using Gemini and OpenAI',
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