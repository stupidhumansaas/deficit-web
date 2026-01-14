import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const foodLog = await prisma.foodLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    if (!foodLog) {
      return NextResponse.json({ error: 'Food log not found' }, { status: 404 })
    }

    return NextResponse.json(foodLog)
  } catch (error) {
    console.error('Error fetching food log:', error)
    return NextResponse.json({ error: 'Failed to fetch food log' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const allowedFields = [
      'calories',
      'baseCalories',
      'description',
      'imageUrl',
      'isGreasy',
      'source',
      'confidence',
      'protein',
      'carbs',
      'fat',
      'items',
      'notes',
      'date',
    ]

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const foodLog = await prisma.foodLog.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(foodLog)
  } catch (error) {
    console.error('Error updating food log:', error)
    return NextResponse.json({ error: 'Failed to update food log' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.foodLog.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting food log:', error)
    return NextResponse.json({ error: 'Failed to delete food log' }, { status: 500 })
  }
}
