import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Warn if default secret is used in production
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_JWT_SECRET) {
  console.warn('WARNING: ADMIN_JWT_SECRET is not set. Using default secret is insecure!')
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'admin-secret-change-in-production'
)

const ALLOWED_ORIGINS = [
  'https://deficit.vercel.app',
  'http://localhost:3000',
]

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.headers.get('origin')

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }

  // Skip auth for login page and auth endpoints
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    const response = NextResponse.next()
    // Add CORS headers to auth endpoints
    if (pathname.startsWith('/api/')) {
      Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
    }
    return response
  }

  // Protect all /admin pages
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Protect all /api/admin endpoints
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token || !(await verifyToken(token))) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
        response.headers.set(key, value)
      })
      return response
    }
  }

  // Add CORS headers to all API responses
  const response = NextResponse.next()
  if (pathname.startsWith('/api/')) {
    Object.entries(getCorsHeaders(origin)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
