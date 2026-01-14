'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Download, Trash2, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react'

interface WaitlistEntry {
  id: string
  email: string
  referral_source: string | null
  user_agent: string | null
  created_at: string
}

interface WaitlistResponse {
  data: WaitlistEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function WaitlistAdmin() {
  const [data, setData] = useState<WaitlistResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('created_at')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        search,
        sort,
        order,
      })

      const res = await fetch(`/api/admin/waitlist?${params}`)
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch:', error)
    } finally {
      setLoading(false)
    }
  }, [page, search, sort, order])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(column)
      setOrder('desc')
    }
  }

  const handleSelectAll = () => {
    if (selected.size === data?.data.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(data?.data.map((d) => d.id) || []))
    }
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelected(newSelected)
  }

  const handleDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Delete ${selected.size} entries?`)) return

    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })

      if (res.ok) {
        setSelected(new Set())
        fetchData()
      }
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleExport = () => {
    if (!data?.data.length) return

    const csv = [
      ['Email', 'Referral Source', 'Joined'].join(','),
      ...data.data.map((entry) =>
        [
          entry.email,
          entry.referral_source || '',
          new Date(entry.created_at).toISOString(),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deficit-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-stone-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-500 hover:text-white">
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-xl font-black tracking-tighter">WAITLIST</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="btn-secondary text-xs flex items-center gap-2"
              disabled={!data?.data.length}
            >
              <Download size={14} />
              EXPORT CSV
            </button>
            {selected.size > 0 && (
              <button
                onClick={handleDelete}
                className="btn-secondary text-xs flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black"
              >
                <Trash2 size={14} />
                DELETE ({selected.size})
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="SEARCH BY EMAIL..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-stone-dark border border-gray-800 pl-12 pr-4 py-3 text-white font-mono text-sm"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 text-sm text-gray-500">
          {data?.total || 0} TOTAL ENTRIES
          {search && ` / FILTERED`}
        </div>

        {/* Table */}
        <div className="border border-stone-dark overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-dark-half">
              <tr>
                <th className="p-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={selected.size === data?.data.length && data?.data.length > 0}
                    onChange={handleSelectAll}
                    className="accent-primary"
                  />
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white"
                  >
                    EMAIL
                    <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="p-4 text-left hidden md:table-cell">
                  <span className="text-xs font-bold text-gray-500">SOURCE</span>
                </th>
                <th className="p-4 text-left">
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white"
                  >
                    JOINED
                    <ArrowUpDown size={12} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    LOADING...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    NO ENTRIES FOUND
                  </td>
                </tr>
              ) : (
                data?.data.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-stone-dark hover:bg-stone-dark-half"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(entry.id)}
                        onChange={() => handleSelect(entry.id)}
                        className="accent-primary"
                      />
                    </td>
                    <td className="p-4 font-mono text-sm">{entry.email}</td>
                    <td className="p-4 text-sm text-gray-500 hidden md:table-cell truncate max-w-[200px]">
                      {entry.referral_source || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-500">
              PAGE {page} OF {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.totalPages}
                className="btn-secondary text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
