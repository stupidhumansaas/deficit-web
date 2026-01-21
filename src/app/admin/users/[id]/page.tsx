'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface FoodLog {
  id: string
  calories: number
  description: string
  source: string
  date: string
  createdAt: string
}

interface UsageRecord {
  id: string
  date: string
  scanCount: number
  lastScanAt: string | null
}

interface RefreshToken {
  id: string
  expiresAt: string
  createdAt: string
}

interface User {
  id: string
  email: string
  passwordHash: string
  displayName: string | null
  heightCm: number | null
  weightKg: number | null
  age: number | null
  sex: string | null
  activityLevel: string | null
  tdee: number | null
  budgetCap: number | null
  deficitPercent: number
  pessimismLevel: string
  weeklyGoal: string | null
  chargeRate: number | null
  bmrValue: number | null
  baseLimit: number | null
  manualBaseLimit: number | null
  currentStreak: number
  longestStreak: number
  lastLogDate: string | null
  defaultFoodPessimism: boolean
  subscriptionTier: string
  subscriptionStatus: string
  subscriptionExpiry: string | null
  subscriptionStartDate: string | null
  revenueCatAppUserId: string | null
  appleUserId: string | null
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
  foodLogs: FoodLog[]
  usageRecords: UsageRecord[]
  refreshTokens: RefreshToken[]
  _count: {
    foodLogs: number
    usageRecords: number
    refreshTokens: number
  }
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      if (!res.ok) throw new Error('User not found')
      const data = await res.json()
      setUser(data)
      // Ensure subscription fields have explicit values to prevent fallback issues
      setFormData({
        ...data,
        subscriptionTier: data.subscriptionTier || 'FREE',
        subscriptionStatus: data.subscriptionStatus || 'ACTIVE',
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Ensure subscription fields are always explicitly included
      const dataToSave = {
        ...formData,
        subscriptionTier: formData.subscriptionTier || 'FREE',
        subscriptionStatus: formData.subscriptionStatus || 'ACTIVE',
      }
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setUser({ ...user!, ...data })
      setFormData({
        ...data,
        subscriptionTier: data.subscriptionTier || 'FREE',
        subscriptionStatus: data.subscriptionStatus || 'ACTIVE',
      })
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/admin/users')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user')
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-red-500">User not found</div>
        <Link href="/admin/users" className="text-gray-400 hover:text-white mt-4 inline-block">
          Back to Users
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/admin/users" className="text-gray-500 hover:text-white text-sm mb-2 inline-block">
            ← Back to Users
          </Link>
          <h1 className="text-2xl font-bold">{user.displayName || user.email}</h1>
          <p className="text-gray-500 font-mono text-sm">{user.id}</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false)
                  // Ensure subscription fields have explicit values when canceling
                  setFormData({
                    ...user,
                    subscriptionTier: user.subscriptionTier || 'FREE',
                    subscriptionStatus: user.subscriptionStatus || 'ACTIVE',
                  })
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Edit User
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-gray-700 text-red-400 rounded-lg hover:bg-gray-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 mb-3">
            Are you sure you want to delete this user? This will also delete all their food logs,
            usage records, and refresh tokens. This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Yes, Delete User'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3">
            <Field
              label="Email"
              value={formData.email || ''}
              editMode={editMode}
              onChange={(v) => setFormData({ ...formData, email: v })}
            />
            <Field
              label="Display Name"
              value={formData.displayName || ''}
              editMode={editMode}
              onChange={(v) => setFormData({ ...formData, displayName: v || null })}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Created</span>
                <div className="text-sm">{formatDate(user.createdAt)}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Last Login</span>
                <div className="text-sm">{formatDate(user.lastLoginAt)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Apple User ID</span>
                <div className="text-sm font-mono text-gray-400 truncate">
                  {user.appleUserId || '-'}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">RevenueCat ID</span>
                <div className="text-sm font-mono text-gray-400 truncate">
                  {user.revenueCatAppUserId || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <div className="space-y-3">
            <SelectField
              label="Tier"
              value={formData.subscriptionTier ?? 'FREE'}
              editMode={editMode}
              options={[
                { value: 'FREE', label: 'Free' },
                { value: 'PRO_MONTHLY', label: 'Pro Monthly' },
                { value: 'PRO_ANNUAL', label: 'Pro Annual' },
                { value: 'LIFETIME', label: 'Lifetime' },
              ]}
              onChange={(v) => setFormData({ ...formData, subscriptionTier: v })}
            />
            <SelectField
              label="Status"
              value={formData.subscriptionStatus ?? 'ACTIVE'}
              editMode={editMode}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'EXPIRED', label: 'Expired' },
              ]}
              onChange={(v) => setFormData({ ...formData, subscriptionStatus: v })}
            />
            <DateField
              label="Expiry Date"
              value={formData.subscriptionExpiry || ''}
              editMode={editMode}
              onChange={(v) => setFormData({ ...formData, subscriptionExpiry: v || null })}
            />
            <DateField
              label="Start Date"
              value={formData.subscriptionStartDate || ''}
              editMode={editMode}
              onChange={(v) => setFormData({ ...formData, subscriptionStartDate: v || null })}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <NumberField
                label="Height (cm)"
                value={formData.heightCm ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, heightCm: v ? parseInt(v) : null })}
              />
              <NumberField
                label="Weight (kg)"
                value={formData.weightKg ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, weightKg: v ? parseInt(v) : null })}
              />
              <NumberField
                label="Age"
                value={formData.age ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, age: v ? parseInt(v) : null })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Sex"
                value={formData.sex || ''}
                editMode={editMode}
                options={[
                  { value: '', label: 'Not Set' },
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                ]}
                onChange={(v) => setFormData({ ...formData, sex: v || null })}
              />
              <SelectField
                label="Activity Level"
                value={formData.activityLevel || ''}
                editMode={editMode}
                options={[
                  { value: '', label: 'Not Set' },
                  { value: 'SEDENTARY', label: 'Sedentary' },
                  { value: 'LIGHT', label: 'Light' },
                  { value: 'MODERATE', label: 'Moderate' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'VERY_ACTIVE', label: 'Very Active' },
                ]}
                onChange={(v) => setFormData({ ...formData, activityLevel: v || null })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <NumberField
                label="TDEE"
                value={formData.tdee ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, tdee: v ? parseInt(v) : null })}
              />
              <NumberField
                label="BMR"
                value={formData.bmrValue ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, bmrValue: v ? parseInt(v) : null })}
              />
              <NumberField
                label="Budget Cap"
                value={formData.budgetCap ?? ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, budgetCap: v ? parseInt(v) : null })}
              />
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">App Settings</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Deficit %"
                value={formData.deficitPercent ?? 20}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, deficitPercent: parseInt(v) || 20 })}
              />
              <Field
                label="Pessimism Level"
                value={formData.pessimismLevel || 'normal'}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, pessimismLevel: v })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NumberField
                label="Current Streak"
                value={formData.currentStreak ?? 0}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, currentStreak: parseInt(v) || 0 })}
              />
              <NumberField
                label="Longest Streak"
                value={formData.longestStreak ?? 0}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, longestStreak: parseInt(v) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Weekly Goal"
                value={formData.weeklyGoal || ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, weeklyGoal: v || null })}
              />
              <Field
                label="Last Log Date"
                value={formData.lastLogDate || ''}
                editMode={editMode}
                onChange={(v) => setFormData({ ...formData, lastLogDate: v || null })}
              />
            </div>
          </div>
        </div>

        {/* Recent Food Logs */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Food Logs</h2>
            <span className="text-sm text-gray-500">Total: {user._count.foodLogs}</span>
          </div>
          {user.foodLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No food logs</p>
          ) : (
            <div className="space-y-2">
              {user.foodLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                >
                  <div>
                    <div className="text-sm truncate max-w-xs">{log.description}</div>
                    <div className="text-xs text-gray-500">
                      {log.date} - {log.source}
                    </div>
                  </div>
                  <div className="text-red-500 font-semibold">{log.calories} cal</div>
                </div>
              ))}
            </div>
          )}
          {user._count.foodLogs > 10 && (
            <Link
              href={`/admin/food-logs?userId=${user.id}`}
              className="text-red-500 hover:text-red-400 text-sm mt-3 inline-block"
            >
              View all {user._count.foodLogs} logs →
            </Link>
          )}
        </div>

        {/* Usage Records */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Usage Records</h2>
            <span className="text-sm text-gray-500">Total: {user._count.usageRecords}</span>
          </div>
          {user.usageRecords.length === 0 ? (
            <p className="text-gray-500 text-sm">No usage records</p>
          ) : (
            <div className="space-y-2">
              {user.usageRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                >
                  <div className="text-sm">{record.date}</div>
                  <div className="text-gray-400">{record.scanCount} scans</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Field Components
function Field({
  label,
  value,
  editMode,
  onChange,
}: {
  label: string
  value: string
  editMode: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      {editMode ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
      ) : (
        <div className="text-sm">{value || '-'}</div>
      )}
    </div>
  )
}

function NumberField({
  label,
  value,
  editMode,
  onChange,
}: {
  label: string
  value: number | string
  editMode: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      {editMode ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
      ) : (
        <div className="text-sm">{value ?? '-'}</div>
      )}
    </div>
  )
}

function SelectField({
  label,
  value,
  editMode,
  options,
  onChange,
}: {
  label: string
  value: string
  editMode: boolean
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      {editMode ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="text-sm">
          {options.find((o) => o.value === value)?.label || value || '-'}
        </div>
      )}
    </div>
  )
}

function DateField({
  label,
  value,
  editMode,
  onChange,
}: {
  label: string
  value: string | null
  editMode: boolean
  onChange: (v: string) => void
}) {
  const dateValue = value ? new Date(value).toISOString().split('T')[0] : ''

  return (
    <div>
      <span className="text-xs text-gray-500">{label}</span>
      {editMode ? (
        <input
          type="date"
          value={dateValue}
          onChange={(e) => onChange(e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        />
      ) : (
        <div className="text-sm">{value ? new Date(value).toLocaleDateString() : '-'}</div>
      )}
    </div>
  )
}
