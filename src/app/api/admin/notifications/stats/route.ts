import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/notifications/stats
 * Get notification statistics for the dashboard
 */
export async function GET() {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const [
      totalCampaigns,
      activeCampaigns,
      totalNotificationsSent,
      notificationsSentToday,
      notificationsSentThisWeek,
      totalPushTokens,
      activePushTokens,
      usersWithNotificationsEnabled,
    ] = await Promise.all([
      prisma.broadcastCampaign.count(),
      prisma.broadcastCampaign.count({
        where: { status: 'PROCESSING' },
      }),
      prisma.notificationLog.count({
        where: { sentAt: { not: null } },
      }),
      prisma.notificationLog.count({
        where: { sentAt: { gte: today } },
      }),
      prisma.notificationLog.count({
        where: { sentAt: { gte: thisWeek } },
      }),
      prisma.pushToken.count(),
      prisma.pushToken.count({ where: { isActive: true } }),
      prisma.userNotificationPreference.count({
        where: { notificationsEnabled: true },
      }),
    ])

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalNotificationsSent,
      notificationsSentToday,
      notificationsSentThisWeek,
      totalPushTokens,
      activePushTokens,
      usersWithNotificationsEnabled,
    })
  } catch (error) {
    console.error('Error fetching notification stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
