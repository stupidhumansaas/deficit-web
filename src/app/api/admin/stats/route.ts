import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {

  const supabase = supabaseAdmin()

  // Get total signups
  const { count: totalSignups } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  // Get today's signups
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: todaySignups } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Get signups by day for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: signupsByDay } = await supabase
    .from('waitlist')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Group by day
  const dailyCounts: { [key: string]: number } = {}
  signupsByDay?.forEach((signup) => {
    const date = new Date(signup.created_at).toISOString().split('T')[0]
    dailyCounts[date] = (dailyCounts[date] || 0) + 1
  })

  // Fill in missing days with 0
  const chartData = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    chartData.push({
      date: dateStr,
      count: dailyCounts[dateStr] || 0,
    })
  }

  return NextResponse.json({
    totalSignups: totalSignups || 0,
    todaySignups: todaySignups || 0,
    chartData,
  })
}
