import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'
)

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      authenticated: true,
      email: payload.email,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
