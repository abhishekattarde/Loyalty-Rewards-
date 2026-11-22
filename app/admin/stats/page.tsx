'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'

export default function StatsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="p-8 text-center">Loading...</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stats</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Codes', value: stats?.totalCodes ?? 0 },
            { label: 'Used Codes', value: stats?.usedCodes ?? 0 },
            { label: 'Customers', value: stats?.totalCustomers ?? 0 },
            { label: 'Points Issued', value: stats?.totalPointsIssued ?? 0 },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-3xl font-bold text-orange-500">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
