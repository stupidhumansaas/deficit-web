'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface UsageRecord {
  id: string
  userId: string
  date: string
  scanCount: number
  lastScanAt: string | null
  user: {
    id: string
    email: string
    displayName: string | null
    subscriptionTier: string
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function UsageRecordsPage() {
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editScanCount, setEditScanCount] = useState(0)

  const fetchUsageRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (dateFilter) params.set('date', dateFilter)

      const res = await fetch(`/api/admin/usage-records?${params}`)
      const data = await res.json()
      setUsageRecords(data.usageRecords)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch usage records:', error)
    } finally {
      setLoading(false)
    }
  }, [page, dateFilter])

  useEffect(() => {
    fetchUsageRecords()
  }, [fetchUsageRecords])

  const handleEdit = (record: UsageRecord) => {
    setEditingId(record.id)
    setEditScanCount(record.scanCount)
  }

  const handleSave = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/usage-records/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanCount: editScanCount }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setEditingId(null)
      fetchUsageRecords()
    } catch (error) {
      console.error('Failed to save usage record:', error)
      alert('Failed to save changes')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this usage record?')) return

    try {
      const res = await fetch(`/api/admin/usage-records/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchUsageRecords()
    } catch (error) {
      console.error('Failed to delete usage record:', error)
      alert('Failed to delete usage record')
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'FREE':
        return 'bg-gray-700 text-gray-300'
      case 'PRO_MONTHLY':
        return 'bg-blue-500/20 text-blue-400'
      case 'PRO_ANNUAL':
        return 'bg-purple-500/20 text-purple-400'
      case 'LIFETIME':
        return 'bg-yellow-500/20 text-yellow-400'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
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
        <h1 className="text-2xl font-bold">Usage Records</h1>
        <p className="text-gray-500">Track scan usage per user per day</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        />
        {dateFilter && (
          <button
            onClick={() => {
              setDateFilter('')
              setPage(1)
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg"
          >
            Clear Filter
          </button>
        )}
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
                  Tier
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Scan Count
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Last Scan
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
              ) : usageRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No usage records found
                  </td>
                </tr>
              ) : (
                usageRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${record.user.id}`}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        {record.user.displayName || record.user.email.split('@')[0]}
                      </Link>
                      <div className="text-xs text-gray-500">{record.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${getTierBadgeColor(
                          record.user.subscriptionTier
                        )}`}
                      >
                        {record.user.subscriptionTier.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{record.date}</td>
                    <td className="px-4 py-3">
                      {editingId === record.id ? (
                        <input
                          type="number"
                          value={editScanCount}
                          onChange={(e) => setEditScanCount(parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-white">{record.scanCount}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDateTime(record.lastScanAt)}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === record.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(record.id)}
                            className="text-green-500 hover:text-green-400 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-gray-500 hover:text-white text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className="text-red-500 hover:text-red-400 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-gray-500 hover:text-red-400 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
              {pagination.total} records
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
