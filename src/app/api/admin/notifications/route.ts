import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const API_URL = process.env.DEFICIT_API_URL || 'https://deficit-production.up.railway.app'
const ADMIN_SECRET = process.env.ADMIN_SECRET

/**
 * GET /api/admin/notifications
 * List broadcast campaigns with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    const [campaigns, total] = await Promise.all([
      prisma.broadcastCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.broadcastCampaign.count({ where }),
    ])

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
  }
}

/**
 * POST /api/admin/notifications
 * Create a new broadcast campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const campaign = await prisma.broadcastCampaign.create({
      data: {
        title: body.title,
        notificationTitle: body.notificationTitle,
        notificationBody: body.notificationBody,
        data: body.data || null,
        targetTiers: body.targetTiers || [],
        targetPlatforms: body.targetPlatforms || [],
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
        createdBy: body.createdBy || null,
        status: body.scheduledFor ? 'QUEUED' : 'DRAFT',
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 })
  }
}
