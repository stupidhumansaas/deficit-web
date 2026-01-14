'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface FoodLog {
  id: string
  userId: string
  calories: number
  baseCalories: number | null
  description: string
  imageUrl: string | null
  isGreasy: boolean
  source: string
  confidence: string | null
  protein: number | null
  carbs: number | null
  fat: number | null
  date: string
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

export default function FoodLogsPage() {
  const searchParams = useSearchParams()
  const initialUserId = searchParams.get('userId') || ''

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState(initialUserId)
  const [page, setPage] = useState(1)

  const fetchFoodLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) params.set('search', search)
      if (sourceFilter) params.set('source', sourceFilter)
      if (dateFilter) params.set('date', dateFilter)
      if (userIdFilter) params.set('userId', userIdFilter)

      const res = await fetch(`/api/admin/food-logs?${params}`)
      const data = await res.json()
      setFoodLogs(data.foodLogs)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch food logs:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, sourceFilter, dateFilter, userIdFilter])

  useEffect(() => {
    fetchFoodLogs()
  }, [fetchFoodLogs])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchFoodLogs()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this food log?')) return

    try {
      const res = await fetch(`/api/admin/food-logs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchFoodLogs()
    } catch (error) {
      console.error('Failed to delete food log:', error)
      alert('Failed to delete food log')
    }
  }

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'AI':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
      case 'MANUAL':
        return 'bg-gray-700 text-gray-300'
      case 'BARCODE':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'VOICE':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Food Logs</h1>
        <p className="text-gray-500">Manage all food log entries</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by description..."
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
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Sources</option>
          <option value="AI">AI</option>
          <option value="MANUAL">Manual</option>
          <option value="BARCODE">Barcode</option>
          <option value="VOICE">Voice</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />

        {userIdFilter && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
            <span className="text-sm text-gray-400">User ID:</span>
            <span className="text-sm font-mono">{userIdFilter.substring(0, 8)}...</span>
            <button
              onClick={() => {
                setUserIdFilter('')
                setPage(1)
              }}
              className="text-gray-500 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Calories
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Macros
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : foodLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No food logs found
                  </td>
                </tr>
              ) : (
                foodLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="text-sm truncate">{log.description}</div>
                        <div className="text-xs text-gray-600 font-mono">{log.id}</div>
                        {log.isGreasy && (
                          <span className="text-xs text-yellow-500">Greasy</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${log.user.id}`}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {log.user.displayName || log.user.email.split('@')[0]}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-red-500">{log.calories}</div>
                      {log.baseCalories && log.baseCalories !== log.calories && (
                        <div className="text-xs text-gray-500">
                          Base: {log.baseCalories}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.protein !== null || log.carbs !== null || log.fat !== null ? (
                        <div className="text-xs space-y-0.5">
                          <div>
                            <span className="text-gray-500">P:</span>{' '}
                            <span>{log.protein ?? '-'}g</span>
                          </div>
                          <div>
                            <span className="text-gray-500">C:</span>{' '}
                            <span>{log.carbs ?? '-'}g</span>
                          </div>
                          <div>
                            <span className="text-gray-500">F:</span>{' '}
                            <span>{log.fat ?? '-'}g</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${getSourceBadgeColor(
                          log.source
                        )}`}
                      >
                        {log.source}
                      </span>
                      {log.confidence && (
                        <div className="text-xs text-gray-500 mt-1">{log.confidence}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">{log.date}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(log.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/food-logs/${log.id}`}
                          className="text-red-500 hover:text-red-400 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-gray-500 hover:text-red-400 text-sm"
                        >
                          Delete
                        </button>
                      </div>
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
              {pagination.total} logs
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
