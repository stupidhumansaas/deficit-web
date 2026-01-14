import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'
)

export async function verifyAdminAuth(request: NextRequest): Promise<{
  authenticated: boolean
  adminId?: string
  email?: string
}> {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return { authenticated: false }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)

    return {
      authenticated: true,
      adminId: payload.adminId as string,
      email: payload.email as string,
    }
  } catch {
    return { authenticated: false }
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  )
}
