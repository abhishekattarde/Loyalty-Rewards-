'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  description: string | null
  pricePoints: number
  imageUrl: string | null
}

interface ShopData {
  products: Product[]
  userBalance: number
}

export default function ShopPage() {
  const [data, setData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function loadData() {
    const res = await fetch('/api/shop/products')
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleRedeem(productId: string, pricePoints: number) {
    if (!data || data.userBalance < pricePoints) {
      setMessage({ type: 'error', text: 'Insufficient points balance.' })
      return
    }

    setRedeeming(productId)
    setMessage(null)

    try {
      const res = await fetch('/api/shop/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const json = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: `Redeemed! New balance: ${json.newBalance} pts` })
        loadData()
      } else {
        setMessage({ type: 'error', text: json.error ?? 'Redemption failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Try again.' })
    } finally {
      setRedeeming(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Rewards Shop</h1>
          {data && (
            <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
              Your balance: {data.userBalance} pts
            </div>
          )}
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-400 py-16">Loading products...</div>
        )}

        {data && data.products.length === 0 && (
          <div className="card text-center py-12 text-gray-400">
            No products available yet. Check back soon!
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.products.map((product) => {
              const canAfford = data.userBalance >= product.pricePoints
              return (
                <div key={product.id} className="card flex flex-col">
                  {product.imageUrl ? (
                    <div className="relative h-40 rounded-lg overflow-hidden mb-4 bg-gray-100">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="h-40 rounded-lg bg-orange-50 flex items-center justify-center mb-4 text-4xl">
                      🎁
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-500 text-sm mb-3 flex-1">{product.description}</p>
                  )}
                  <div className="mt-auto">
                    <p className="text-orange-600 font-bold mb-3">
                      {product.pricePoints} pts
                      <span className="text-gray-400 font-normal text-sm ml-1">
                        (≈ ₹{(product.pricePoints / 2).toFixed(2)})
                      </span>
                    </p>
                    <button
                      onClick={() => handleRedeem(product.id, product.pricePoints)}
                      disabled={!canAfford || redeeming === product.id}
                      className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                        canAfford
                          ? 'btn-primary'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {redeeming === product.id
                        ? 'Redeeming...'
                        : canAfford
                        ? 'Redeem'
                        : 'Not enough points'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
