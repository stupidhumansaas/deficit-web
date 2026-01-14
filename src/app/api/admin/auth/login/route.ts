import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'
)

// Simple in-memory rate limiting
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown'
}

function isRateLimited(ip: string): boolean {
  const attempts = loginAttempts.get(ip)
  if (!attempts) return false

  // Reset if lockout period has passed
  if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(ip)
    return false
  }

  return attempts.count >= MAX_ATTEMPTS
}

function recordFailedAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip)
  if (attempts) {
    attempts.count++
    attempts.lastAttempt = Date.now()
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() })
  }
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip)
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)

    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!admin) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash)

    if (!isValid) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Clear failed attempts on successful login
    clearAttempts(ip)

    // Update last login
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    })

    // Create JWT token
    const token = await new SignJWT({ adminId: admin.id, email: admin.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({ success: true })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
