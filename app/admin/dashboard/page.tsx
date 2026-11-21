'use client'

import { useEffect, useState } from 'react'

interface Stats {
  totalCodes: number
  usedCodes: number
  totalCustomers: number
  totalPointsIssued: number
  recentScans: {
    id: string
    uniqueCode: string
    usedAt: string
    pointsEarned: number
    user: { email: string; name: string | null }
    batch: { product: { name: string } }
  }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-400 text-center py-16">Loading dashboard...</div>
  }

  if (!stats) {
    return <div className="text-red-500 text-center py-16">Failed to load stats</div>
  }

  const statCards = [
    { label: 'Total QR Codes', value: stats.totalCodes.toLocaleString(), icon: '🔲', color: 'bg-blue-50 text-blue-700' },
    { label: 'Codes Scanned', value: stats.usedCodes.toLocaleString(), icon: '✅', color: 'bg-green-50 text-green-700' },
    { label: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: '👤', color: 'bg-purple-50 text-purple-700' },
    { label: 'Points Issued', value: stats.totalPointsIssued.toLocaleString(), icon: '⭐', color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
            <p className="text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent scans */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Scans</h2>
        {stats.recentScans.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">No scans yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Product</th>
                  <th className="pb-2 pr-4">Points</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-600">
                      {scan.uniqueCode.slice(0, 8)}…
                    </td>
                    <td className="py-2 pr-4 text-gray-700">
                      {scan.user.name ?? scan.user.email}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{scan.batch.product.name}</td>
                    <td className="py-2 pr-4 font-semibold text-orange-600">
                      +{scan.pointsEarned}
                    </td>
                    <td className="py-2 text-gray-400 text-xs">
                      {new Date(scan.usedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
