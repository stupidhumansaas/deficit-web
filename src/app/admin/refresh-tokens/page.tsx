'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface RefreshToken {
  id: string
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  user: {
    id: string
    email: string
    displayName: string | null
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function RefreshTokensPage() {
  const [refreshTokens, setRefreshTokens] = useState<RefreshToken[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [cleaningUp, setCleaningUp] = useState(false)

  const fetchRefreshTokens = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/refresh-tokens?${params}`)
      const data = await res.json()
      setRefreshTokens(data.refreshTokens)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch refresh tokens:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    fetchRefreshTokens()
  }, [fetchRefreshTokens])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this token?')) return

    try {
      const res = await fetch(`/api/admin/refresh-tokens/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchRefreshTokens()
    } catch (error) {
      console.error('Failed to delete refresh token:', error)
      alert('Failed to revoke token')
    }
  }

  const handleCleanupExpired = async () => {
    if (!confirm('This will delete all expired refresh tokens. Continue?')) return

    setCleaningUp(true)
    try {
      const res = await fetch('/api/admin/refresh-tokens?action=cleanup-expired', {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to cleanup')
      const data = await res.json()
      alert(`Successfully deleted ${data.deleted} expired tokens`)
      fetchRefreshTokens()
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error)
      alert('Failed to cleanup expired tokens')
    } finally {
      setCleaningUp(false)
    }
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) <= new Date()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getTimeUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime()
    if (diff <= 0) return 'Expired'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Refresh Tokens</h1>
          <p className="text-gray-500">Manage user authentication tokens</p>
        </div>
        <button
          onClick={handleCleanupExpired}
          disabled={cleaningUp}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
        >
          {cleaningUp ? 'Cleaning up...' : 'Cleanup Expired Tokens'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Tokens</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired Only</option>
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
                  Token
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Expires
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
              ) : refreshTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No refresh tokens found
                  </td>
                </tr>
              ) : (
                refreshTokens.map((token) => (
                  <tr
                    key={token.id}
                    className={`hover:bg-gray-800/50 ${
                      isExpired(token.expiresAt) ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${token.user.id}`}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {token.user.displayName || token.user.email.split('@')[0]}
                      </Link>
                      <div className="text-xs text-gray-500">{token.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-gray-400 max-w-xs truncate">
                        {token.token}
                      </div>
                      <div className="text-xs text-gray-600 font-mono">{token.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      {isExpired(token.expiresAt) ? (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDateTime(token.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-400">
                        {formatDateTime(token.expiresAt)}
                      </div>
                      <div
                        className={`text-xs ${
                          isExpired(token.expiresAt) ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {getTimeUntilExpiry(token.expiresAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(token.id)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                      >
                        Revoke
                      </button>
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
              {pagination.total} tokens
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
