'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import PointsBadge from '@/components/PointsBadge'

interface Transaction {
  id: string
  points: number
  type: 'EARNED' | 'REDEEMED'
  note: string | null
  createdAt: string
  qrCode?: {
    batch?: {
      product?: { name: string }
    }
  }
}

interface WalletData {
  pointsBalance: number
  transactions: Transaction[]
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/wallet')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load wallet')
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wallet</h1>

        {loading && (
          <div className="card text-center py-10 text-gray-400">Loading...</div>
        )}

        {error && (
          <div className="card text-center py-10 text-red-500">{error}</div>
        )}

        {data && (
          <>
            {/* Balance card */}
            <div className="card bg-gradient-to-r from-orange-500 to-orange-400 text-white mb-6">
              <p className="text-orange-100 text-sm mb-1">Total Balance</p>
              <p className="text-5xl font-extrabold">{data.pointsBalance.toLocaleString()}</p>
              <p className="text-orange-100 mt-1">
                Points &nbsp;·&nbsp; ≈ ₹{(data.pointsBalance / 2).toFixed(2)}
              </p>
              <p className="text-xs text-orange-200 mt-3">50 pts = ₹25</p>
            </div>

            {/* Transaction history */}
            <div className="card">
              <h2 className="font-semibold text-lg mb-4">Transaction History</h2>
              {data.transactions.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  No transactions yet. Scan a QR code to earn points!
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.transactions.map((tx) => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {tx.type === 'EARNED'
                            ? tx.qrCode?.batch?.product?.name
                              ? `Earned from ${tx.qrCode.batch.product.name}`
                              : 'Points Earned'
                            : tx.note ?? 'Points Redeemed'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          tx.type === 'EARNED' ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {tx.type === 'EARNED' ? '+' : '-'}
                        {Math.abs(tx.points)} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
