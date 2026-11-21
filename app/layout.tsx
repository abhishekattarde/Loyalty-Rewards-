'use client'

import './globals.css'
import { SessionProvider } from 'next-auth/react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>LoyaltyRewards</title>
        <meta name="description" content="Scan QR codes, earn points, and shop with rewards" />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
