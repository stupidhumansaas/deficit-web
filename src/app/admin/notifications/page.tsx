'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Bell, Send, Clock, CheckCircle, XCircle, AlertTriangle, Plus, Users } from 'lucide-react'

interface Campaign {
  id: string
  title: string
  notificationTitle: string
  notificationBody: string
  status: string
  targetTiers: string[]
  targetPlatforms: string[]
  totalRecipients: number
  sentCount: number
  failedCount: number
  scheduledFor: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  createdBy: string | null
}

interface Stats {
  totalCampaigns: number
  activeCampaigns: number
  totalNotificationsSent: number
  notificationsSentToday: number
  notificationsSentThisWeek: number
  totalPushTokens: number
  activePushTokens: number
  usersWithNotificationsEnabled: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function NotificationsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (statusFilter) params.set('status', statusFilter)

      const res = await fetch(`/api/admin/notifications?${params}`)
      const data = await res.json()
      setCampaigns(data.campaigns || [])
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications/stats')
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
    fetchStats()
  }, [fetchCampaigns, fetchStats])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-700 text-gray-300">
            <Clock className="w-3 h-3" />
            Draft
          </span>
        )
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
            <Send className="w-3 h-3" />
            Sending...
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        )
      default:
        return <span className="px-2 py-1 text-xs rounded bg-gray-700">{status}</span>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500" />
            Notifications
          </h1>
          <p className="text-gray-500">Manage push notification campaigns</p>
        </div>
        <button
          onClick={() => setShowNewCampaign(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-gray-500 text-sm">Active Push Tokens</div>
            <div className="text-2xl font-bold text-white">{stats.activePushTokens.toLocaleString()}</div>
            <div className="text-xs text-gray-600">{stats.totalPushTokens.toLocaleString()} total</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-gray-500 text-sm">Notifications Enabled</div>
            <div className="text-2xl font-bold text-white">{stats.usersWithNotificationsEnabled.toLocaleString()}</div>
            <div className="text-xs text-gray-600">users</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-gray-500 text-sm">Sent Today</div>
            <div className="text-2xl font-bold text-green-400">{stats.notificationsSentToday.toLocaleString()}</div>
            <div className="text-xs text-gray-600">{stats.notificationsSentThisWeek.toLocaleString()} this week</div>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="text-gray-500 text-sm">Total Campaigns</div>
            <div className="text-2xl font-bold text-white">{stats.totalCampaigns}</div>
            <div className="text-xs text-gray-600">{stats.activeCampaigns} active</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="QUEUED">Queued</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Campaigns Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Campaign
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  Progress
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
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No campaigns found
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">{campaign.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {campaign.notificationTitle}
                        </div>
                        <div className="text-xs text-gray-600 font-mono">{campaign.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(campaign.status)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {campaign.targetTiers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {campaign.targetTiers.map((tier) => (
                              <span
                                key={tier}
                                className="px-1.5 py-0.5 text-xs bg-gray-700 rounded"
                              >
                                {tier}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">All users</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {campaign.totalRecipients > 0 ? (
                        <div>
                          <div className="text-sm text-white">
                            {campaign.sentCount.toLocaleString()} / {campaign.totalRecipients.toLocaleString()}
                          </div>
                          {campaign.failedCount > 0 && (
                            <div className="text-xs text-red-400">
                              {campaign.failedCount} failed
                            </div>
                          )}
                          <div className="w-24 h-1.5 bg-gray-700 rounded-full mt-1">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (campaign.sentCount / campaign.totalRecipients) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-400">{formatDate(campaign.createdAt)}</div>
                      {campaign.scheduledFor && (
                        <div className="text-xs text-blue-400">
                          Scheduled: {formatDate(campaign.scheduledFor)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/notifications/${campaign.id}`}
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
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
              campaigns
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

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <NewCampaignModal
          onClose={() => setShowNewCampaign(false)}
          onCreated={() => {
            setShowNewCampaign(false)
            fetchCampaigns()
          }}
        />
      )}
    </div>
  )
}

// New Campaign Modal Component
function NewCampaignModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [formData, setFormData] = useState({
    title: '',
    notificationTitle: '',
    notificationBody: '',
    targetTiers: [] as string[],
    scheduledFor: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduledFor: formData.scheduledFor || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create campaign')
      }

      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const tierOptions = ['FREE', 'PRO_MONTHLY', 'PRO_ANNUAL', 'LIFETIME']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-4">New Campaign</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Campaign Title (internal)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., January Promo"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notification Title</label>
            <input
              type="text"
              value={formData.notificationTitle}
              onChange={(e) => setFormData({ ...formData, notificationTitle: e.target.value })}
              placeholder="Title shown to users"
              maxLength={50}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500"
              required
            />
            <div className="text-xs text-gray-600 mt-1">{formData.notificationTitle.length}/50</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notification Body</label>
            <textarea
              value={formData.notificationBody}
              onChange={(e) => setFormData({ ...formData, notificationBody: e.target.value })}
              placeholder="Message body"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 resize-none"
              required
            />
            <div className="text-xs text-gray-600 mt-1">{formData.notificationBody.length}/200</div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Subscription Tiers</label>
            <div className="flex flex-wrap gap-2">
              {tierOptions.map((tier) => (
                <label key={tier} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.targetTiers.includes(tier)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          targetTiers: [...formData.targetTiers, tier],
                        })
                      } else {
                        setFormData({
                          ...formData,
                          targetTiers: formData.targetTiers.filter((t) => t !== tier),
                        })
                      }
                    }}
                    className="rounded bg-gray-700 border-gray-600 text-red-500"
                  />
                  <span className="text-sm text-gray-300">{tier.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Leave all unchecked to target all users
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
            <div className="text-xs text-gray-600 mt-1">
              Leave empty to save as draft
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
