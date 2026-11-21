export const runtime = 'nodejs' 'use client'

import { useEffect, useState } from 'react'

interface CodeRow {
  id: string
  uniqueCode: string
  isUsed: boolean
  usedAt: string | null
  usedBy: { email: string; name: string | null } | null
  batch: {
    id: string
    pointsPerCode: number
    product: { name: string }
  }
}

interface Batch {
  id: string
  createdAt: string
  product: { name: string }
  totalCodes: number
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [selectedBatch, setSelectedBatch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const LIMIT = 25

  useEffect(() => {
    fetch('/api/admin/batches')
      .then((r) => r.json())
      .then((data) => setBatches(data.batches ?? []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
    })
    if (selectedBatch) params.set('batchId', selectedBatch)

    fetch(`/api/admin/codes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCodes(data.codes ?? [])
        setTotal(data.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [selectedBatch, page])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">QR Codes</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Filter by Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => { setSelectedBatch(e.target.value); setPage(1) }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">All batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.product.name} — {new Date(b.createdAt).toLocaleDateString()} ({b.totalCodes} codes)
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500 pb-2">{total} total codes</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">No codes found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Points</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Claimed By</th>
                    <th className="px-4 py-3">Claimed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {codes.map((code) => (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {code.uniqueCode}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{code.batch.product.name}</td>
                      <td className="px-4 py-3 text-orange-600 font-semibold">
                        {code.batch.pointsPerCode} pts
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          code.isUsed
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {code.isUsed ? 'Used' : 'Unused'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {code.usedBy ? code.usedBy.email : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {code.usedAt ? new Date(code.usedAt).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
