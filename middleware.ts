import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pricing tiers by country/region
const PRICING: Record<string, { currency: string; symbol: string; annual: number; lifetime: number; monthly: number }> = {
  // USD - US and default
  US: { currency: 'USD', symbol: '$', annual: 34.99, lifetime: 99.99, monthly: 4.99 },

  // GBP - UK
  GB: { currency: 'GBP', symbol: '£', annual: 27.99, lifetime: 79.99, monthly: 3.99 },

  // EUR - Eurozone
  DE: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  FR: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  IT: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  ES: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  NL: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  BE: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  AT: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  IE: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  PT: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },
  FI: { currency: 'EUR', symbol: '€', annual: 32.99, lifetime: 94.99, monthly: 4.49 },

  // CAD - Canada
  CA: { currency: 'CAD', symbol: 'CA$', annual: 46.99, lifetime: 134.99, monthly: 6.49 },

  // AUD - Australia
  AU: { currency: 'AUD', symbol: 'A$', annual: 54.99, lifetime: 159.99, monthly: 7.49 },

  // NZD - New Zealand
  NZ: { currency: 'NZD', symbol: 'NZ$', annual: 57.99, lifetime: 169.99, monthly: 7.99 },

  // JPY - Japan (no decimals)
  JP: { currency: 'JPY', symbol: '¥', annual: 4900, lifetime: 14900, monthly: 680 },

  // INR - India (lower price point)
  IN: { currency: 'INR', symbol: '₹', annual: 1499, lifetime: 4499, monthly: 199 },

  // BRL - Brazil
  BR: { currency: 'BRL', symbol: 'R$', annual: 89.90, lifetime: 249.90, monthly: 12.90 },

  // MXN - Mexico
  MX: { currency: 'MXN', symbol: 'MX$', annual: 449, lifetime: 1299, monthly: 64 },
}

const DEFAULT_PRICING = PRICING.US

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Get country from Vercel's x-vercel-ip-country header (works on Vercel Edge)
  // Falls back to 'US' if not available (local dev or non-Vercel deployment)
  const country = request.headers.get('x-vercel-ip-country') || 'US'

  // Get pricing for this country (fall back to USD)
  const pricing = PRICING[country] || DEFAULT_PRICING

  // Set pricing data as a cookie so client can read it
  response.cookies.set('pricing', JSON.stringify({
    country,
    ...pricing
  }), {
    httpOnly: false, // Client needs to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return response
}

export const config = {
  matcher: '/',
}
