import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/notifications/[id]
 * Get a single broadcast campaign with stats
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const campaign = await prisma.broadcastCampaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get log stats
    const [sentCount, failedCount] = await Promise.all([
      prisma.notificationLog.count({
        where: { broadcastId: id, sentAt: { not: null } },
      }),
      prisma.notificationLog.count({
        where: { broadcastId: id, failedAt: { not: null } },
      }),
    ])

    return NextResponse.json({
      campaign,
      stats: {
        sent: sentCount,
        failed: failedCount,
      },
    })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/notifications/[id]
 * Update a draft campaign
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.broadcastCampaign.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'QUEUED') {
      return NextResponse.json(
        { error: 'Can only update draft or queued campaigns' },
        { status: 400 }
      )
    }

    const campaign = await prisma.broadcastCampaign.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.notificationTitle !== undefined && { notificationTitle: body.notificationTitle }),
        ...(body.notificationBody !== undefined && { notificationBody: body.notificationBody }),
        ...(body.data !== undefined && { data: body.data }),
        ...(body.targetTiers !== undefined && { targetTiers: body.targetTiers }),
        ...(body.targetPlatforms !== undefined && { targetPlatforms: body.targetPlatforms }),
        ...(body.scheduledFor !== undefined && {
          scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        }),
      },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/notifications/[id]
 * Delete a draft campaign
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await prisma.broadcastCampaign.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (existing.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft campaigns' },
        { status: 400 }
      )
    }

    await prisma.broadcastCampaign.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Campaign deleted' })
  } catch (error) {
    console.error('Error deleting campaign:', error)
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 })
  }
}
