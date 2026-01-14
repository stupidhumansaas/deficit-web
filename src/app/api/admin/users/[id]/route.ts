import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        foodLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        usageRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        refreshTokens: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            foodLogs: true,
            usageRecords: true,
            refreshTokens: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Fields that can be updated
    const allowedFields = [
      'email',
      'displayName',
      'subscriptionTier',
      'subscriptionStatus',
      'subscriptionExpiry',
      'subscriptionStartDate',
      'heightCm',
      'weightKg',
      'age',
      'sex',
      'activityLevel',
      'tdee',
      'budgetCap',
      'deficitPercent',
      'pessimismLevel',
      'weeklyGoal',
      'chargeRate',
      'bmrValue',
      'baseLimit',
      'manualBaseLimit',
      'currentStreak',
      'longestStreak',
      'lastLogDate',
      'defaultFoodPessimism',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Handle date fields
        if (field === 'subscriptionExpiry' || field === 'subscriptionStartDate') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // This will cascade delete all related records due to onDelete: Cascade
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
