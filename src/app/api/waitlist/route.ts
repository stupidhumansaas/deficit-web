import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    const supabase = supabaseAdmin()

    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already on the waitlist' },
        { status: 409 }
      )
    }

    // Get referral source from headers
    const referer = request.headers.get('referer') || ''
    const userAgent = request.headers.get('user-agent') || ''

    // Insert new signup
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.toLowerCase(),
        referral_source: referer,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to join waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
