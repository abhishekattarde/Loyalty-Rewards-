'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Loyalty<span className="text-orange-500">Rewards</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/shop" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
            Shop
          </Link>
          <Link href="/wallet" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
            Wallet
          </Link>
          {session ? (
            <>
              <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                {(session.user as any).pointsBalance ?? 0} pts
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-1.5 px-4">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden text-gray-500 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          <Link href="/shop" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
          <Link href="/wallet" className="text-sm text-gray-700" onClick={() => setMenuOpen(false)}>
            Wallet
          </Link>
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-gray-500 text-left"
            >
              Sign out
            </button>
          ) : (
            <Link href="/login" className="btn-primary text-sm py-1.5 px-4 text-center" onClick={() => setMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
