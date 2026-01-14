import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// This endpoint creates an admin user
// DISABLED by default - set ADMIN_SETUP_ENABLED=true to enable
export async function POST(request: NextRequest) {
  try {
    // Setup is disabled by default
    if (process.env.ADMIN_SETUP_ENABLED !== 'true') {
      return NextResponse.json(
        { error: 'Setup endpoint is disabled' },
        { status: 403 }
      )
    }

    // Require setup key if configured
    const setupKey = process.env.ADMIN_SETUP_KEY
    const providedKey = request.headers.get('x-setup-key')

    if (setupKey && providedKey !== setupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if admin already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const admin = await prisma.adminUser.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    })

    return NextResponse.json({
      success: true,
      id: admin.id,
      email: admin.email,
    })
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}
