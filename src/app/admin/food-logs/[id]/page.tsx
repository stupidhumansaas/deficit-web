'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

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
  items: unknown
  notes: string | null
  date: string
  createdAt: string
  user: {
    id: string
    email: string
    displayName: string | null
  }
}

export default function FoodLogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [foodLog, setFoodLog] = useState<FoodLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState<Partial<FoodLog>>({})

  useEffect(() => {
    fetchFoodLog()
  }, [id])

  const fetchFoodLog = async () => {
    try {
      const res = await fetch(`/api/admin/food-logs/${id}`)
      if (!res.ok) throw new Error('Food log not found')
      const data = await res.json()
      setFoodLog(data)
      setFormData(data)
    } catch (error) {
      console.error('Failed to fetch food log:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/food-logs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setFoodLog({ ...foodLog!, ...data })
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save food log:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this food log?')) return

    try {
      const res = await fetch(`/api/admin/food-logs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      router.push('/admin/food-logs')
    } catch (error) {
      console.error('Failed to delete food log:', error)
      alert('Failed to delete food log')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!foodLog) {
    return (
      <div className="p-6">
        <div className="text-red-500">Food log not found</div>
        <Link href="/admin/food-logs" className="text-gray-400 hover:text-white mt-4 inline-block">
          Back to Food Logs
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/food-logs"
            className="text-gray-500 hover:text-white text-sm mb-2 inline-block"
          >
            ← Back to Food Logs
          </Link>
          <h1 className="text-2xl font-bold">Food Log Details</h1>
          <p className="text-gray-500 font-mono text-sm">{foodLog.id}</p>
        </div>
        <div className="flex gap-2">
          {editMode ? (
            <>
              <button
                onClick={() => {
                  setEditMode(false)
                  setFormData(foodLog)
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
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-gray-700 text-red-400 rounded-lg hover:bg-gray-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">Description</span>
              {editMode ? (
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  rows={3}
                />
              ) : (
                <div className="text-sm">{foodLog.description}</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Calories</span>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.calories || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })
                    }
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                ) : (
                  <div className="text-2xl font-bold text-red-500">{foodLog.calories}</div>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500">Base Calories</span>
                {editMode ? (
                  <input
                    type="number"
                    value={formData.baseCalories ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        baseCalories: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                ) : (
                  <div className="text-sm">{foodLog.baseCalories ?? '-'}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500">Date</span>
                {editMode ? (
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  />
                ) : (
                  <div className="text-sm">{foodLog.date}</div>
                )}
              </div>
              <div>
                <span className="text-xs text-gray-500">Created</span>
                <div className="text-sm">{new Date(foodLog.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500">User</span>
              <div>
                <Link
                  href={`/admin/users/${foodLog.user.id}`}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  {foodLog.user.displayName || foodLog.user.email}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Source & Confidence */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Source Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">Source</span>
              {editMode ? (
                <select
                  value={formData.source || ''}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="AI">AI</option>
                  <option value="MANUAL">Manual</option>
                  <option value="BARCODE">Barcode</option>
                  <option value="VOICE">Voice</option>
                </select>
              ) : (
                <div className="text-sm">{foodLog.source}</div>
              )}
            </div>

            <div>
              <span className="text-xs text-gray-500">Confidence</span>
              {editMode ? (
                <select
                  value={formData.confidence || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, confidence: e.target.value || null })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="">Not Set</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              ) : (
                <div className="text-sm">{foodLog.confidence || '-'}</div>
              )}
            </div>

            <div>
              <span className="text-xs text-gray-500">Is Greasy</span>
              {editMode ? (
                <select
                  value={formData.isGreasy ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({ ...formData, isGreasy: e.target.value === 'true' })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              ) : (
                <div className="text-sm">{foodLog.isGreasy ? 'Yes' : 'No'}</div>
              )}
            </div>

            {foodLog.imageUrl && (
              <div>
                <span className="text-xs text-gray-500">Image URL</span>
                <div className="text-sm break-all text-gray-400">{foodLog.imageUrl}</div>
              </div>
            )}
          </div>
        </div>

        {/* Macros */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Macronutrients</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-xs text-gray-500">Protein (g)</span>
              {editMode ? (
                <input
                  type="number"
                  value={formData.protein ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      protein: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              ) : (
                <div className="text-xl font-semibold text-blue-400">
                  {foodLog.protein ?? '-'}
                </div>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500">Carbs (g)</span>
              {editMode ? (
                <input
                  type="number"
                  value={formData.carbs ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      carbs: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              ) : (
                <div className="text-xl font-semibold text-yellow-400">
                  {foodLog.carbs ?? '-'}
                </div>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-500">Fat (g)</span>
              {editMode ? (
                <input
                  type="number"
                  value={formData.fat ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fat: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
              ) : (
                <div className="text-xl font-semibold text-orange-400">
                  {foodLog.fat ?? '-'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items & Notes */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Items & Notes</h2>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-gray-500">Notes</span>
              {editMode ? (
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value || null })
                  }
                  className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                  rows={2}
                />
              ) : (
                <div className="text-sm">{foodLog.notes || '-'}</div>
              )}
            </div>

            {foodLog.items && (
              <div>
                <span className="text-xs text-gray-500">Items (JSON)</span>
                <pre className="mt-1 p-3 bg-gray-800 rounded text-xs text-gray-400 overflow-auto max-h-48">
                  {JSON.stringify(foodLog.items, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
