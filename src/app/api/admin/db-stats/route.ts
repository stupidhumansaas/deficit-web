import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // User stats
    const [
      totalUsers,
      freeUsers,
      proMonthlyUsers,
      proAnnualUsers,
      lifetimeUsers,
      usersWithAppleId,
      todaySignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionTier: 'FREE' } }),
      prisma.user.count({ where: { subscriptionTier: 'PRO_MONTHLY' } }),
      prisma.user.count({ where: { subscriptionTier: 'PRO_ANNUAL' } }),
      prisma.user.count({ where: { subscriptionTier: 'LIFETIME' } }),
      prisma.user.count({ where: { appleUserId: { not: null } } }),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    ])

    // Food log stats
    const [totalFoodLogs, todayFoodLogs, aiLogs, manualLogs, barcodeLogs, voiceLogs] =
      await Promise.all([
        prisma.foodLog.count(),
        prisma.foodLog.count({ where: { date: today } }),
        prisma.foodLog.count({ where: { source: 'AI' } }),
        prisma.foodLog.count({ where: { source: 'MANUAL' } }),
        prisma.foodLog.count({ where: { source: 'BARCODE' } }),
        prisma.foodLog.count({ where: { source: 'VOICE' } }),
      ])

    // Usage records stats
    const [totalUsageRecords, totalScansResult] = await Promise.all([
      prisma.usageRecord.count(),
      prisma.usageRecord.aggregate({ _sum: { scanCount: true } }),
    ])

    // Refresh tokens stats
    const [totalTokens, activeTokens] = await Promise.all([
      prisma.refreshToken.count(),
      prisma.refreshToken.count({ where: { expiresAt: { gt: new Date() } } }),
    ])

    return NextResponse.json({
      users: {
        total: totalUsers,
        free: freeUsers,
        proMonthly: proMonthlyUsers,
        proAnnual: proAnnualUsers,
        lifetime: lifetimeUsers,
        withAppleId: usersWithAppleId,
        todaySignups,
      },
      foodLogs: {
        total: totalFoodLogs,
        today: todayFoodLogs,
        bySource: {
          AI: aiLogs,
          MANUAL: manualLogs,
          BARCODE: barcodeLogs,
          VOICE: voiceLogs,
        },
      },
      usageRecords: {
        total: totalUsageRecords,
        totalScans: totalScansResult._sum.scanCount || 0,
      },
      refreshTokens: {
        total: totalTokens,
        active: activeTokens,
      },
    })
  } catch (error) {
    console.error('Error fetching db stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
