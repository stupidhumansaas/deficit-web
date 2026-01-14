import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const allowedFields = ['scanCount', 'lastScanAt']

    const updateData: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'lastScanAt') {
          updateData[field] = body[field] ? new Date(body[field]) : null
        } else {
          updateData[field] = body[field]
        }
      }
    }

    const usageRecord = await prisma.usageRecord.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(usageRecord)
  } catch (error) {
    console.error('Error updating usage record:', error)
    return NextResponse.json({ error: 'Failed to update usage record' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.usageRecord.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting usage record:', error)
    return NextResponse.json({ error: 'Failed to delete usage record' }, { status: 500 })
  }
}
