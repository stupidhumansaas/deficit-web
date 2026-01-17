'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Pricing {
  country: string
  currency: string
  symbol: string
  annual: number
  lifetime: number
  monthly: number
}

const DEFAULT_PRICING: Pricing = {
  country: 'US',
  currency: 'USD',
  symbol: '$',
  annual: 34.99,
  lifetime: 99.99,
  monthly: 4.99,
}

function formatPrice(price: number, currency: string): string {
  if (currency === 'JPY' || currency === 'KRW') {
    return Math.round(price).toLocaleString()
  }
  return price.toFixed(2)
}

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [pricing, setPricing] = useState<Pricing>(DEFAULT_PRICING)

  useEffect(() => {
    const cookies = document.cookie.split(';')
    const pricingCookie = cookies.find(c => c.trim().startsWith('pricing='))
    if (pricingCookie) {
      try {
        const value = decodeURIComponent(pricingCookie.split('=')[1])
        const parsed = JSON.parse(value)
        setPricing(parsed)
      } catch {
        // Use default pricing
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage('YOU\'RE IN. WE\'LL BE IN TOUCH.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'SOMETHING WENT WRONG')
      }
    } catch {
      setStatus('error')
      setMessage('NETWORK ERROR. TRY AGAIN.')
    }
  }

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <h1 className="text-lg font-black tracking-tighter">DEFICIT</h1>
        <nav className="flex gap-6 text-[10px] font-bold tracking-[0.2em] text-white/40">
          <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
          <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
        </nav>
      </header>

      {/* Hero - Title + Phone Mockup + Waitlist */}
      <section className="pt-8 md:pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left: Text Content + Waitlist Form */}
          <div className="text-center md:text-left order-2 md:order-1">
            <h1 className="text-white tracking-tighter text-[56px] md:text-[80px] lg:text-[100px] font-black leading-[0.85] uppercase">
              DEFICIT
            </h1>
            <h2 className="mt-4 text-white font-black text-xl md:text-2xl tracking-tighter leading-tight">
              EAT TO EMPTY. MOVE TO CHARGE.
            </h2>
            <p className="mt-4 text-white/40 font-bold text-[10px] md:text-xs tracking-[0.3em] max-w-md uppercase leading-relaxed mx-auto md:mx-0">
              NO ADS. NO BLOAT. NO BULLSHIT.
            </p>

            {/* Waitlist Form */}
            <div className="mt-8 max-w-md mx-auto md:mx-0">
              {/* Early Adopter Badge */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="w-2 h-2 bg-[#ff382e]" />
                <span className="text-[#ff382e] text-[10px] font-black tracking-[0.2em]">
                  FIRST 50 SIGNUPS GET 1 YEAR PRO FREE
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="ENTER_EMAIL"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-2 border-white text-white h-14 px-5 text-base font-bold tracking-tight placeholder:text-white/20 focus:outline-none focus:border-[#ff382e] transition-colors"
                  disabled={status === 'loading' || status === 'success'}
                />
                <button
                  type="submit"
                  className="w-full bg-[#ff382e] hover:bg-[#e02d24] text-white h-14 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50"
                  disabled={status === 'loading' || status === 'success'}
                >
                  <span className="text-base font-black tracking-tighter uppercase">
                    {status === 'loading' ? 'JOINING...' : 'JOIN WAITLIST'}
                  </span>
                </button>
              </form>

              {message && (
                <p className={`mt-3 text-center md:text-left text-sm font-black tracking-wide ${status === 'success' ? 'text-[#34C759]' : 'text-[#ff382e]'}`}>
                  {message}
                </p>
              )}

              <p className="mt-4 text-center md:text-left text-white/30 text-[10px] leading-relaxed uppercase tracking-[0.2em]">
                iOS + APPLE WATCH. COMING SOON.
              </p>
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="flex justify-center order-1 md:order-2">
            <Image
              src="/phone-mockup.png"
              alt="DEFICIT App Screenshot"
              width={400}
              height={565}
              priority
              className="w-auto h-auto max-w-[280px] md:max-w-[350px] lg:max-w-[400px]"
            />
          </div>
        </div>
      </section>

      {/* Full-Width Void Bar */}
      <section className="w-full h-[80px] md:h-[100px] relative border-y border-white/10 overflow-hidden">
        <div className="absolute inset-0 hatch-pattern" />
        <div className="absolute inset-y-0 left-0 bg-white" style={{ width: '77%' }} />
        <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
          <div className="flex flex-col items-center">
            <p className="text-white text-xl md:text-3xl font-black tracking-tighter">REMAINING: 1,158 KCAL</p>
            <p className="text-white text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase mt-1">+117 CHARGED FROM MOVEMENT</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-black tracking-[0.3em] text-white/40 mb-10 text-center">HOW_IT_WORKS</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="border border-white/10 p-6">
              <p className="text-[#ff382e] text-[10px] font-black tracking-[0.2em] mb-3">01_CHARGE</p>
              <p className="text-white font-black text-lg tracking-tight mb-2">NO GUESSING YOUR ACTIVITY</p>
              <p className="text-sm text-white/40 leading-relaxed">
                We don't let you claim you're "moderately active" from a dropdown. Your Apple Watch tracks real movement. We treat everyone as sedentary and credit half your active calories back—because other apps let you "earn" a pizza after a walk. That's why they don't work.
              </p>
            </div>

            <div className="border border-white/10 p-6">
              <p className="text-[#ff382e] text-[10px] font-black tracking-[0.2em] mb-3">02_ADAPT</p>
              <p className="text-white font-black text-lg tracking-tight mb-2">LEARNS HOW YOUR BODY ACTUALLY WORKS</p>
              <p className="text-sm text-white/40 leading-relaxed">
                We track what you eat vs. how your weight actually moves. Over time, your budget adapts to your real metabolism—not a calculator's guess.
              </p>
            </div>

            <div className="border border-white/10 p-6">
              <p className="text-[#ff382e] text-[10px] font-black tracking-[0.2em] mb-3">03_SCAN</p>
              <p className="text-white font-black text-lg tracking-tight mb-2">AI THAT DOESN'T LIE TO YOU</p>
              <p className="text-sm text-white/40 leading-relaxed">
                Point. Snap. Logged. Our food analysis is tuned to not underestimate. Other apps lowball portions so you feel good. We'd rather you hit your goal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-[10px] font-black tracking-[0.3em] text-white/40 mb-10 text-center">PRICING</p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="border border-white/10 p-6">
              <p className="text-[10px] font-black tracking-[0.2em] text-white/40 mb-2">FREE</p>
              <p className="text-4xl font-black text-white mb-6">{pricing.symbol}0</p>
              <ul className="space-y-3 text-sm text-white/40">
                <li>The Void Bar</li>
                <li>Manual logging</li>
                <li>Apple Watch sync</li>
                <li>7-day history</li>
                <li>No ads</li>
              </ul>
            </div>

            <div className="border-2 border-[#ff382e] p-6 relative">
              <div className="absolute -top-3 left-4 bg-[#ff382e] px-2 py-1">
                <span className="text-[10px] font-black tracking-wider text-black">BEST VALUE</span>
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] text-[#ff382e] mb-2">PRO ANNUAL</p>
              <p className="text-4xl font-black text-white mb-1">
                {pricing.symbol}{formatPrice(pricing.annual, pricing.currency)}
              </p>
              <p className="text-xs text-white/40 mb-6">/YEAR</p>
              <ul className="space-y-3 text-sm text-white/60">
                <li>Everything in Free</li>
                <li>Barcode scanning</li>
                <li>AI food scan</li>
                <li>Unlimited history</li>
                <li>Adaptive TDEE</li>
              </ul>
            </div>

            <div className="border border-white/10 p-6">
              <p className="text-[10px] font-black tracking-[0.2em] text-white/40 mb-2">LIFETIME</p>
              <p className="text-4xl font-black text-white mb-1">
                {pricing.symbol}{formatPrice(pricing.lifetime, pricing.currency)}
              </p>
              <p className="text-xs text-white/40 mb-6">ONE TIME</p>
              <ul className="space-y-3 text-sm text-white/40">
                <li>All Pro features</li>
                <li>Forever</li>
                <li>All future updates</li>
                <li>One-time payment</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
          <div className="flex items-center gap-6">
            <span>iOS + WATCH</span>
            <span>OLED_OPTIMIZED</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
            <span>&copy;{new Date().getFullYear()} DEFICIT</span>
          </div>
        </div>
      </footer>

      {/* Corner gradient */}
      <div className="fixed bottom-0 left-0 w-32 h-32 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff382e] to-transparent" />
      </div>
    </main>
  )
}
