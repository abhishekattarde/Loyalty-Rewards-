'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            🎁 Earn rewards with every purchase
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Scan. Earn. <span className="text-orange-500">Shop.</span>
          </h1>
          <p className="text-xl text-gray-500 mb-8 max-w-2xl mx-auto">
            Find a QR code inside your product box, scan it to earn points, and redeem them for
            exciting rewards.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <>
                <Link href="/wallet" className="btn-primary text-lg px-8 py-3">
                  My Wallet — {(session.user as any).pointsBalance ?? 0} pts
                </Link>
                <Link href="/shop" className="btn-secondary text-lg px-8 py-3">
                  Browse Shop
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-primary text-lg px-8 py-3">
                  Sign In to Shop
                </Link>
                <Link href="/scan/demo" className="btn-secondary text-lg px-8 py-3">
                  Scan a QR Code
                </Link>
              </>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            {
              step: '01',
              icon: '📦',
              title: 'Buy a Product',
              desc: 'Purchase any product from our store. Each box contains a unique QR code.',
            },
            {
              step: '02',
              icon: '📱',
              title: 'Scan the QR Code',
              desc: 'Find the QR code inside the box and scan it with your phone camera.',
            },
            {
              step: '03',
              icon: '🛍️',
              title: 'Earn & Redeem',
              desc: 'Points are added to your wallet instantly. 50 points = ₹25 off your next order.',
            },
          ].map((item) => (
            <div key={item.step} className="card text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="text-xs font-bold text-orange-500 mb-1">STEP {item.step}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Points info */}
        <div className="mt-12 card bg-orange-500 border-orange-500 text-white text-center">
          <p className="text-lg font-semibold">
            💰 50 Points = ₹25 &nbsp;|&nbsp; Earn points with every scan &nbsp;|&nbsp; No expiry
          </p>
        </div>
      </main>
    </div>
  )
}
