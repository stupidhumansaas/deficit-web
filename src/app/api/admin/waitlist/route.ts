import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const search = searchParams.get('search') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const order = searchParams.get('order') || 'desc'

  const offset = (page - 1) * limit

  const supabase = supabaseAdmin()

  // Build query
  let query = supabase
    .from('waitlist')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  // Apply sorting
  query = query.order(sort, { ascending: order === 'asc' })

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Supabase error:', error)
    return NextResponse.json({ error: 'Failed to fetch waitlist' }, { status: 500 })
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs required' }, { status: 400 })
    }

    const supabase = supabaseAdmin()

    const { error } = await supabase
      .from('waitlist')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to delete entries' }, { status: 500 })
    }

    return NextResponse.json({ success: true, deleted: ids.length })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
