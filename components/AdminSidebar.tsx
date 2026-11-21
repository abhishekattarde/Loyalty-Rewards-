'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
  { label: 'Products', href: '/admin/products', icon: '🎁' },
  { label: 'QR Batches', href: '/admin/batches', icon: '🔲' },
  { label: 'Codes', href: '/admin/codes', icon: '🗂️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-slate-800 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700">
        <p className="font-bold text-lg">
          Loyalty<span className="text-orange-400">Rewards</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white font-medium'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
