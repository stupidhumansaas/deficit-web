import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-stone-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:text-primary transition-colors">
            DEFICIT
          </Link>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="text-white">PRIVACY</Link>
            <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tighter mb-2">PRIVACY POLICY</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2025</p>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">// SUMMARY</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>No data sold to third parties. Ever.</li>
              <li>No advertising SDKs.</li>
              <li>Analytics are anonymized.</li>
              <li>Your food log stays on your device.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// DATA WE COLLECT</h2>
            <h3 className="text-primary font-bold mb-2">Account Information</h3>
            <p className="mb-4">
              When you create an account, we collect your email address for authentication and
              communication purposes only.
            </p>

            <h3 className="text-primary font-bold mb-2">Health & Fitness Data</h3>
            <p className="mb-4">
              DEFICIT integrates with Apple HealthKit to read active energy burned (calories).
              This data is used locally on your device to calculate your daily calorie budget.
              We do not transmit HealthKit data to our servers.
            </p>

            <h3 className="text-primary font-bold mb-2">Food Log Data</h3>
            <p className="mb-4">
              Your food entries are stored locally on your device using Apple&apos;s SwiftData framework.
              If you enable iCloud backup, this data may be synced to your iCloud account under Apple&apos;s
              privacy terms.
            </p>

            <h3 className="text-primary font-bold mb-2">AI Food Analysis (Pro Feature)</h3>
            <p>
              When you use the AI food scan feature, images are temporarily sent to our API for processing.
              Images are processed in real-time and are <strong className="text-white">not stored</strong> on
              our servers. We use this data solely to provide calorie estimates and do not use it for training
              or any other purpose.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// DATA WE DON&apos;T COLLECT</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Location data</li>
              <li>Contacts or photos (beyond explicit food scans)</li>
              <li>Device identifiers for advertising</li>
              <li>Browsing history</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// ANALYTICS</h2>
            <p>
              We use anonymized analytics to understand how people use DEFICIT and improve the app.
              This includes aggregated data like feature usage and crash reports. We cannot identify
              individual users from this data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// THIRD PARTIES</h2>
            <p className="mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">RevenueCat</strong> — Subscription management</li>
              <li><strong className="text-white">Apple App Store</strong> — Payment processing</li>
              <li><strong className="text-white">OpenAI</strong> — AI food analysis (images not stored)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// YOUR RIGHTS</h2>
            <p className="mb-4">You can:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Export your data at any time (Pro feature)</li>
              <li>Delete your account and all associated data</li>
              <li>Opt out of analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// CONTACT</h2>
            <p>
              Questions? Email us at <a href="mailto:privacy@deficit.app" className="text-primary hover:underline">privacy@deficit.app</a>
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
