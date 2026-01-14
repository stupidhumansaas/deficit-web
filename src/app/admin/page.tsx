'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DatabaseStats {
  users: {
    total: number
    free: number
    proMonthly: number
    proAnnual: number
    lifetime: number
    withAppleId: number
    todaySignups: number
  }
  foodLogs: {
    total: number
    today: number
    bySource: {
      AI: number
      MANUAL: number
      BARCODE: number
      VOICE: number
    }
  }
  usageRecords: {
    total: number
    totalScans: number
  }
  refreshTokens: {
    total: number
    active: number
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DatabaseStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/db-stats')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch stats')
        return res.json()
      })
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to fetch stats:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm">Database overview and statistics</p>
      </div>

      {/* User Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Users</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <StatCard label="Total" value={stats?.users.total || 0} />
          <StatCard label="Free" value={stats?.users.free || 0} />
          <StatCard label="Pro Monthly" value={stats?.users.proMonthly || 0} color="green" />
          <StatCard label="Pro Annual" value={stats?.users.proAnnual || 0} color="green" />
          <StatCard label="Lifetime" value={stats?.users.lifetime || 0} color="yellow" />
          <StatCard label="Apple ID" value={stats?.users.withAppleId || 0} />
          <StatCard label="Today" value={stats?.users.todaySignups || 0} color="blue" />
        </div>
      </div>

      {/* Food Log Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Food Logs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total" value={stats?.foodLogs.total || 0} />
          <StatCard label="Today" value={stats?.foodLogs.today || 0} color="blue" />
          <StatCard label="AI Scans" value={stats?.foodLogs.bySource.AI || 0} color="purple" />
          <StatCard label="Manual" value={stats?.foodLogs.bySource.MANUAL || 0} />
          <StatCard label="Barcode" value={stats?.foodLogs.bySource.BARCODE || 0} />
          <StatCard label="Voice" value={stats?.foodLogs.bySource.VOICE || 0} />
        </div>
      </div>

      {/* Usage & Tokens */}
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-400">Usage Records</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Records" value={stats?.usageRecords.total || 0} />
            <StatCard label="Total Scans" value={stats?.usageRecords.totalScans || 0} color="purple" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-400">Refresh Tokens</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total" value={stats?.refreshTokens.total || 0} />
            <StatCard label="Active" value={stats?.refreshTokens.active || 0} color="green" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4 text-gray-400">Quick Actions</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <QuickLink href="/admin/users" label="Manage Users" count={stats?.users.total} />
          <QuickLink href="/admin/food-logs" label="View Food Logs" count={stats?.foodLogs.total} />
          <QuickLink href="/admin/usage-records" label="Usage Records" count={stats?.usageRecords.total} />
          <QuickLink href="/admin/refresh-tokens" label="Refresh Tokens" count={stats?.refreshTokens.total} />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  color = 'default',
}: {
  label: string
  value: number
  color?: 'default' | 'green' | 'blue' | 'yellow' | 'purple' | 'red'
}) {
  const colorClasses = {
    default: 'text-white',
    green: 'text-green-500',
    blue: 'text-blue-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    red: 'text-red-500',
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function QuickLink({
  href,
  label,
  count,
}: {
  href: string
  label: string
  count?: number
}) {
  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-red-500/50 transition-colors group"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium group-hover:text-red-500 transition-colors">
          {label}
        </span>
        <span className="text-xs text-gray-600">{count?.toLocaleString()}</span>
      </div>
      <span className="text-gray-600 text-xs">→</span>
    </Link>
  )
}
