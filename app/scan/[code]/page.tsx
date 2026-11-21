'use client'

import { useEffect, useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type ScanResult =
  | { status: 'success'; pointsEarned: number; newBalance: number }
  | { status: 'already_used'; usedByYou: boolean; usedAt: string }
  | { status: 'invalid' }
  | { status: 'deactivated' }
  | { status: 'error'; message: string }

export default function ScanPage() {
  const { code } = useParams<{ code: string }>()
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()

  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      signIn('google', { callbackUrl: `/scan/${code}` })
      return
    }

    if (authStatus === 'authenticated' && !result && !loading) {
      setLoading(true)
      fetch(`/api/scan/${code}`, { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          setResult(data)
          setLoading(false)
        })
        .catch(() => {
          setResult({ status: 'error', message: 'Network error. Please try again.' })
          setLoading(false)
        })
    }
  }, [authStatus, code, result, loading])

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying your QR code...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="text-xl font-bold text-orange-500">
            🎁 LoyaltyRewards
          </Link>
        </div>

        {result?.status === 'success' && (
          <div className="card text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Points Earned!</h1>
            <div className="bg-orange-50 rounded-xl p-4 my-4">
              <p className="text-4xl font-bold text-orange-500">+{result.pointsEarned}</p>
              <p className="text-gray-500 text-sm mt-1">points added to your wallet</p>
            </div>
            <p className="text-gray-600 mb-6">
              Your new balance:{' '}
              <span className="font-bold text-gray-900">{result.newBalance} pts</span>
              <span className="text-gray-400"> (₹{(result.newBalance / 2).toFixed(0)})</span>
            </p>
            <div className="flex gap-3">
              <Link href="/wallet" className="btn-primary flex-1 text-center">
                View Wallet
              </Link>
              <Link href="/shop" className="btn-secondary flex-1 text-center">
                Shop Now
              </Link>
            </div>
          </div>
        )}

        {result?.status === 'already_used' && (
          <div className="card text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Claimed</h1>
            <p className="text-gray-500 mb-4">
              {result.usedByYou
                ? `You already claimed this QR code on ${new Date(result.usedAt).toLocaleDateString()}.`
                : 'This QR code has already been claimed by another user.'}
            </p>
            <Link href="/" className="btn-secondary w-full text-center block">
              Go Home
            </Link>
          </div>
        )}

        {result?.status === 'invalid' && (
          <div className="card text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
            <p className="text-gray-500 mb-4">
              This QR code doesn&apos;t exist. Please check the code and try again.
            </p>
            <Link href="/" className="btn-secondary w-full text-center block">
              Go Home
            </Link>
          </div>
        )}

        {result?.status === 'deactivated' && (
          <div className="card text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Code No Longer Valid</h1>
            <p className="text-gray-500 mb-4">
              This QR code batch has been deactivated. Please contact the shop owner.
            </p>
            <Link href="/" className="btn-secondary w-full text-center block">
              Go Home
            </Link>
          </div>
        )}

        {result?.status === 'error' && (
          <div className="card text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-4">{result.message}</p>
            <button onClick={() => { setResult(null); setLoading(false) }} className="btn-primary w-full">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
