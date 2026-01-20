import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.DEFICIT_API_URL || 'https://deficit-production.up.railway.app'
const ADMIN_SECRET = process.env.ADMIN_SECRET

/**
 * POST /api/admin/notifications/[id]/cancel
 * Cancel an in-progress broadcast campaign
 * This calls the backend API which manages the send queue
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'ADMIN_SECRET not configured' },
        { status: 500 }
      )
    }

    // Call the backend API to cancel the campaign
    const response = await fetch(`${API_URL}/api/admin/broadcasts/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Secret': ADMIN_SECRET,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to cancel campaign' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error cancelling campaign:', error)
    return NextResponse.json({ error: 'Failed to cancel campaign' }, { status: 500 })
  }
}
