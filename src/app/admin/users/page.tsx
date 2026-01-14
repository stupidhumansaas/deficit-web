'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  displayName: string | null
  subscriptionTier: string
  subscriptionStatus: string
  subscriptionExpiry: string | null
  appleUserId: string | null
  revenueCatAppUserId: string | null
  createdAt: string
  lastLoginAt: string | null
  currentStreak: number
  longestStreak: number
  _count: {
    foodLogs: number
    usageRecords: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('')
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (tierFilter) params.set('tier', tierFilter)

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, tierFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-700 text-gray-300'
      case 'PRO_MONTHLY':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'PRO_ANNUAL':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'LIFETIME':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-500">Manage all user accounts</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by email, name, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={tierFilter}
          onChange={(e) => {
            setTierFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Tiers</option>
          <option value="FREE">Free</option>
          <option value="PRO_MONTHLY">Pro Monthly</option>
          <option value="PRO_ANNUAL">Pro Annual</option>
          <option value="LIFETIME">Lifetime</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Subscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Auth
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">
                          {user.displayName || user.email.split('@')[0]}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-600 font-mono">{user.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${getTierBadgeColor(
                          user.subscriptionTier
                        )}`}
                      >
                        {user.subscriptionTier.replace('_', ' ')}
                      </span>
                      {user.subscriptionExpiry && (
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {formatDate(user.subscriptionExpiry)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {user.appleUserId && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">Apple</span>
                        )}
                        {user.revenueCatAppUserId && (
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">RC</span>
                        )}
                        {!user.appleUserId && !user.revenueCatAppUserId && (
                          <span className="text-xs text-gray-500">Email</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>
                          <span className="text-gray-500">Logs:</span>{' '}
                          <span className="text-white">{user._count.foodLogs}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Streak:</span>{' '}
                          <span className="text-white">{user.currentStreak}</span>
                          <span className="text-gray-600"> / {user.longestStreak}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-400">{formatDate(user.createdAt)}</div>
                      {user.lastLoginAt && (
                        <div className="text-xs text-gray-600">
                          Last: {formatDate(user.lastLoginAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        View / Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-gray-400">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
