'use client'

import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
}

interface Batch {
  id: string
  pointsPerCode: number
  totalCodes: number
  greetingMsg: string
  isActive: boolean
  createdAt: string
  product: { name: string }
  _count?: { codes: number }
  usedCount?: number
}

export default function AdminBatchesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [form, setForm] = useState({
    productId: '',
    quantity: '20',
    pointsPerCode: '10',
    greetingMsg: 'Thanks for your purchase. Earn these points for further shopping.',
  })
  const [error, setError] = useState('')

  async function loadData() {
    const [productsRes, batchesRes] = await Promise.all([
      fetch('/api/admin/products'),
      fetch('/api/admin/batches'),
    ])
    const pData = await productsRes.json()
    const bData = await batchesRes.json()
    setProducts(pData.products ?? [])
    setBatches(bData.batches ?? [])
    if (pData.products?.length > 0 && !form.productId) {
      setForm((f) => ({ ...f, productId: pData.products[0].id }))
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: form.productId,
          quantity: parseInt(form.quantity),
          pointsPerCode: parseInt(form.pointsPerCode),
          greetingMsg: form.greetingMsg,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to generate batch')
        setGenerating(false)
        return
      }

      // Download the PDF
      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'qr-batch.pdf'

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename ?? 'qr-batch.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      loadData()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function toggleBatch(batchId: string, isActive: boolean) {
    await fetch('/api/admin/batches', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchId, isActive: !isActive }),
    })
    loadData()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">QR Batch Generator</h1>

      {/* Generator form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-slate-700 mb-4">Generate New Batch</h2>

        {products.length === 0 && !loading && (
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm mb-4">
            Create a product first before generating QR codes.
          </div>
        )}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Product *</label>
              <select
                required
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantity *</label>
              <input
                required
                type="number"
                min="1"
                max="1000"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Points per Code *</label>
              <input
                required
                type="number"
                min="1"
                value={form.pointsPerCode}
                onChange={(e) => setForm({ ...form, pointsPerCode: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Greeting Message</label>
              <textarea
                rows={2}
                value={form.greetingMsg}
                onChange={(e) => setForm({ ...form, greetingMsg: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={generating || products.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span> Generating PDF...
              </>
            ) : (
              <>📄 Generate &amp; Download PDF</>
            )}
          </button>
        </form>
      </div>

      {/* Batch history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-slate-700">Previous Batches</h2>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : batches.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No batches generated yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Codes</th>
                <th className="px-4 py-3">Points/Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{batch.product.name}</td>
                  <td className="px-4 py-3 text-gray-600">{batch.totalCodes}</td>
                  <td className="px-4 py-3 text-orange-600 font-semibold">{batch.pointsPerCode} pts</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      batch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {batch.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBatch(batch.id, batch.isActive)}
                      className={`text-xs hover:underline ${
                        batch.isActive ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {batch.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
