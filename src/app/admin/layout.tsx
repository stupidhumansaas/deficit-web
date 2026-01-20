'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/food-logs', label: 'Food Logs' },
  { href: '/admin/notifications', label: 'Notifications' },
  { href: '/admin/usage-records', label: 'Usage Records' },
  { href: '/admin/refresh-tokens', label: 'Refresh Tokens' },
  { href: '/admin/waitlist', label: 'Waitlist' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)

  // Skip auth check for login page
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setAuthenticated(true) // Don't block login page
      return
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/check')
        const data = await res.json()

        if (data.authenticated) {
          setAuthenticated(true)
          setAdminEmail(data.email)
        } else {
          setAuthenticated(false)
          router.push('/admin/login')
        }
      } catch {
        setAuthenticated(false)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [isLoginPage, router])

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // Show loading state while checking auth
  if (authenticated === null && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Show children directly for login page (no sidebar)
  if (isLoginPage) {
    return <>{children}</>
  }

  // Not authenticated, will redirect
  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-red-500">DEFICIT ADMIN</h1>
          <p className="text-xs text-gray-500 mt-1">Database Management</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      isActive
                        ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-3">
          {adminEmail && (
            <div className="text-xs text-gray-500 truncate">{adminEmail}</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left text-gray-500 hover:text-red-400 text-sm"
          >
            Sign Out
          </button>
          <Link
            href="/"
            className="block text-gray-500 hover:text-white text-sm"
          >
            ← Back to Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
