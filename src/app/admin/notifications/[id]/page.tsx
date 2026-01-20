'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bell,
  ArrowLeft,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Save,
  Users,
  RefreshCw,
} from 'lucide-react'

interface Campaign {
  id: string
  title: string
  notificationTitle: string
  notificationBody: string
  data: Record<string, unknown> | null
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
  sent: number
  failed: number
}

interface NotificationLog {
  id: string
  userId: string
  type: string
  title: string
  body: string
  sentAt: string | null
  failedAt: string | null
  failureReason: string | null
  createdAt: string
  user: {
    id: string
    email: string
    displayName: string | null
  }
}

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<Campaign>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'logs'>('details')
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)
  const [logsPagination, setLogsPagination] = useState<{ total: number; totalPages: number } | null>(null)
  const [logsFilter, setLogsFilter] = useState('')

  const fetchCampaign = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch campaign')
      }

      setCampaign(data.campaign)
      setStats(data.stats)
      setFormData(data.campaign)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const params = new URLSearchParams({
        page: logsPage.toString(),
        limit: '50',
      })
      if (logsFilter) params.set('status', logsFilter)

      const res = await fetch(`/api/admin/notifications/${id}/logs?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setLogsPagination(data.pagination)
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }, [id, logsPage, logsFilter])

  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [activeTab, fetchLogs])

  // Auto-refresh for processing campaigns
  useEffect(() => {
    if (campaign?.status === 'PROCESSING') {
      const interval = setInterval(fetchCampaign, 3000)
      return () => clearInterval(interval)
    }
  }, [campaign?.status, fetchCampaign])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update campaign')
      }

      const data = await res.json()
      setCampaign(data.campaign)
      setEditMode(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    setSending(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/notifications/${id}/send`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start campaign')
      }

      setShowSendConfirm(false)
      fetchCampaign()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSending(false)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/notifications/${id}/cancel`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to cancel campaign')
      }

      fetchCampaign()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setCancelling(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete campaign')
      }

      router.push('/admin/notifications')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setShowDeleteConfirm(false)
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-700 text-gray-300">
            <Clock className="w-4 h-4" />
            Draft
          </span>
        )
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-4 h-4" />
            Scheduled
          </span>
        )
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
            <Send className="w-4 h-4" />
            Sending...
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        )
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded bg-red-500/20 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-4 h-4" />
            Failed
          </span>
        )
      default:
        return <span className="px-3 py-1 text-sm rounded bg-gray-700">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="text-red-400">{error || 'Campaign not found'}</div>
        <Link href="/admin/notifications" className="text-red-500 hover:text-red-400 mt-4 inline-block">
          &larr; Back to Notifications
        </Link>
      </div>
    )
  }

  const canEdit = campaign.status === 'DRAFT' || campaign.status === 'QUEUED'
  const canSend = campaign.status === 'DRAFT' || campaign.status === 'QUEUED'
  const canCancel = campaign.status === 'PROCESSING' || campaign.status === 'QUEUED'
  const canDelete = campaign.status === 'DRAFT'

  const tierOptions = ['FREE', 'PRO_MONTHLY', 'PRO_ANNUAL', 'LIFETIME']

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/notifications"
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Notifications
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6 text-red-500" />
              {campaign.title}
            </h1>
            <div className="text-gray-500 text-sm font-mono mt-1">{campaign.id}</div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(campaign.status)}
            {campaign.status === 'PROCESSING' && (
              <button
                onClick={fetchCampaign}
                className="p-2 text-gray-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Progress Section (for processing/completed) */}
      {(campaign.status === 'PROCESSING' || campaign.status === 'COMPLETED') && campaign.totalRecipients > 0 && (
        <div className="mb-6 bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Progress</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-gray-500 text-sm">Total Recipients</div>
              <div className="text-2xl font-bold text-white">
                {campaign.totalRecipients.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Sent</div>
              <div className="text-2xl font-bold text-green-400">
                {campaign.sentCount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-sm">Failed</div>
              <div className="text-2xl font-bold text-red-400">
                {campaign.failedCount.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{
                  width: `${(campaign.sentCount / campaign.totalRecipients) * 100}%`,
                }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{
                  width: `${(campaign.failedCount / campaign.totalRecipients) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {Math.round(((campaign.sentCount + campaign.failedCount) / campaign.totalRecipients) * 100)}% complete
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 rounded-lg border border-gray-800 p-1">
        <button
          onClick={() => setActiveTab('details')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'details'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs'
              ? 'bg-gray-800 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Delivery Logs
        </button>
      </div>

      {activeTab === 'details' && (
        <>
          {/* Campaign Details */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campaign Details</h2>
          {canEdit && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-red-500 hover:text-red-400"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Campaign Title</label>
            {editMode ? (
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            ) : (
              <div className="text-white">{campaign.title}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notification Title</label>
            {editMode ? (
              <input
                type="text"
                value={formData.notificationTitle || ''}
                onChange={(e) => setFormData({ ...formData, notificationTitle: e.target.value })}
                maxLength={50}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            ) : (
              <div className="text-white font-medium">{campaign.notificationTitle}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Notification Body</label>
            {editMode ? (
              <textarea
                value={formData.notificationBody || ''}
                onChange={(e) => setFormData({ ...formData, notificationBody: e.target.value })}
                maxLength={200}
                rows={3}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
              />
            ) : (
              <div className="text-white">{campaign.notificationBody}</div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Tiers</label>
            {editMode ? (
              <div className="flex flex-wrap gap-2">
                {tierOptions.map((tier) => (
                  <label key={tier} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.targetTiers || []).includes(tier)}
                      onChange={(e) => {
                        const current = formData.targetTiers || []
                        if (e.target.checked) {
                          setFormData({ ...formData, targetTiers: [...current, tier] })
                        } else {
                          setFormData({
                            ...formData,
                            targetTiers: current.filter((t) => t !== tier),
                          })
                        }
                      }}
                      className="rounded bg-gray-700 border-gray-600 text-red-500"
                    />
                    <span className="text-sm text-gray-300">{tier.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {campaign.targetTiers.length > 0 ? (
                  campaign.targetTiers.map((tier) => (
                    <span key={tier} className="px-2 py-1 text-sm bg-gray-700 rounded">
                      {tier.replace('_', ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">All users</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Created</label>
              <div className="text-white">{formatDate(campaign.createdAt)}</div>
              {campaign.createdBy && (
                <div className="text-xs text-gray-500">by {campaign.createdBy}</div>
              )}
            </div>

            {campaign.scheduledFor && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Scheduled For</label>
                <div className="text-blue-400">{formatDate(campaign.scheduledFor)}</div>
              </div>
            )}

            {campaign.startedAt && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Started</label>
                <div className="text-white">{formatDate(campaign.startedAt)}</div>
              </div>
            )}

            {campaign.completedAt && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Completed</label>
                <div className="text-white">{formatDate(campaign.completedAt)}</div>
              </div>
            )}
          </div>
        </div>

        {editMode && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={() => {
                setEditMode(false)
                setFormData(campaign)
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h2 className="text-lg font-semibold mb-4">Actions</h2>

        <div className="flex flex-wrap gap-3">
          {canSend && (
            <button
              onClick={() => setShowSendConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Send Now
            </button>
          )}

          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {cancelling ? 'Cancelling...' : 'Cancel Campaign'}
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>
        </>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          {/* Logs Filter */}
          <div className="p-4 border-b border-gray-800">
            <select
              value={logsFilter}
              onChange={(e) => {
                setLogsFilter(e.target.value)
                setLogsPage(1)
              }}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            >
              <option value="">All Logs</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <Link
                            href={`/admin/users/${log.user.id}`}
                            className="text-white hover:text-red-400"
                          >
                            {log.user.displayName || log.user.email}
                          </Link>
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.sentAt ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {formatDate(log.sentAt || log.failedAt || log.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-red-400">
                        {log.failureReason || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Logs Pagination */}
          {logsPagination && logsPagination.totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {logsPage} of {logsPagination.totalPages} ({logsPagination.total} logs)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogsPage(logsPage - 1)}
                  disabled={logsPage === 1}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setLogsPage(logsPage + 1)}
                  disabled={logsPage === logsPagination.totalPages}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send Confirmation Modal */}
      {showSendConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Send Campaign?</h3>
            <p className="text-gray-400 mb-4">
              This will immediately start sending notifications to all eligible users. This action
              cannot be undone.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-400">Notification Preview</div>
              <div className="font-medium text-white mt-1">{campaign.notificationTitle}</div>
              <div className="text-gray-300 mt-1">{campaign.notificationBody}</div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSendConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Starting...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Delete Campaign?</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to delete this campaign? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
