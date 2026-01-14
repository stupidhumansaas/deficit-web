import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-stone-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:text-primary transition-colors">
            DEFICIT
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
            <Link href="/terms" className="text-white">TERMS</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tighter mb-2">TERMS OF SERVICE</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2025</p>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">// ACCEPTANCE</h2>
            <p>
              By using DEFICIT, you agree to these terms. If you don&apos;t agree, don&apos;t use the app.
              Simple.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// THE SERVICE</h2>
            <p className="mb-4">
              DEFICIT is a calorie tracking application. We provide tools to help you log food,
              track activity, and monitor your calorie balance.
            </p>
            <p className="text-primary font-bold">
              DEFICIT IS NOT MEDICAL ADVICE. We are not doctors. Consult a healthcare professional
              before making significant changes to your diet or exercise routine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// ACCOUNTS</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>You must be 18+ to create an account</li>
              <li>You&apos;re responsible for keeping your account secure</li>
              <li>One account per person</li>
              <li>We can terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// SUBSCRIPTIONS</h2>
            <h3 className="text-primary font-bold mb-2">Free Tier</h3>
            <p className="mb-4">
              The free tier is free forever. We won&apos;t bait-and-switch you. Core features
              remain free.
            </p>

            <h3 className="text-primary font-bold mb-2">Pro Subscriptions</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Pro Monthly: $4.99/month, auto-renews</li>
              <li>Pro Annual: $34.99/year, auto-renews</li>
              <li>Lifetime: $99.99 one-time purchase</li>
            </ul>

            <h3 className="text-primary font-bold mb-2">Billing</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Subscriptions auto-renew unless cancelled 24 hours before the period ends</li>
              <li>Payment is charged to your Apple ID account</li>
              <li>Manage subscriptions in your device&apos;s Account Settings</li>
              <li>Free trial converts to paid subscription unless cancelled</li>
              <li>Unused trial portion is forfeited upon subscription purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// REFUNDS</h2>
            <p>
              Refunds are handled by Apple according to their App Store policy. Contact Apple Support
              for refund requests. We cannot process refunds directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// CALORIE ESTIMATES</h2>
            <p className="mb-4">
              Our AI food analysis provides <strong className="text-white">estimates only</strong>.
              Actual calorie content may vary based on:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Portion sizes</li>
              <li>Preparation methods</li>
              <li>Ingredient variations</li>
              <li>Image quality and angle</li>
            </ul>
            <p className="mt-4">
              Always use your judgment. When in doubt, round up.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// HEALTH DISCLAIMER</h2>
            <div className="border border-primary p-6 bg-stone-dark">
              <p className="mb-4">
                <strong className="text-primary">IMPORTANT:</strong> DEFICIT is a tool, not a treatment.
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Do not use DEFICIT if you have or are recovering from an eating disorder</li>
                <li>Consult a doctor before starting any weight loss program</li>
                <li>Stop using the app if you experience negative physical or mental effects</li>
                <li>We are not responsible for health outcomes from using the app</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// ACCEPTABLE USE</h2>
            <p className="mb-4">Don&apos;t:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Reverse engineer, decompile, or hack the app</li>
              <li>Use the app for commercial purposes without permission</li>
              <li>Create fake accounts or abuse our systems</li>
              <li>Use the app in ways that could harm yourself or others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// LIMITATION OF LIABILITY</h2>
            <p>
              DEFICIT is provided &quot;as is&quot; without warranty. We&apos;re not liable for any damages arising
              from your use of the app, including but not limited to health outcomes, data loss,
              or subscription charges.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// CHANGES TO TERMS</h2>
            <p>
              We may update these terms. Continued use after changes constitutes acceptance.
              We&apos;ll notify you of significant changes via the app or email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// CONTACT</h2>
            <p>
              Questions? Email us at <a href="mailto:legal@deficit.app" className="text-primary hover:underline">legal@deficit.app</a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-dark">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} DEFICIT
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
              <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
