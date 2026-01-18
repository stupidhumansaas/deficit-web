import Link from 'next/link'

export default function SupportPage() {
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
            <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
            <Link href="/support" className="text-white">SUPPORT</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-black tracking-tighter mb-2">SUPPORT</h1>
        <p className="text-gray-500 mb-12">We&apos;re here to help.</p>

        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">// CONTACT US</h2>
            <p className="mb-4">
              For support inquiries, bug reports, or feature requests, please email us at:
            </p>
            <a
              href="mailto:willmorrisonwebdev@gmail.com"
              className="inline-block text-2xl font-bold text-primary hover:underline"
            >
              willmorrisonwebdev@gmail.com
            </a>
            <p className="mt-4 text-sm">
              We typically respond within 24-48 hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// FAQ</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-primary font-bold mb-2">How do I track food?</h3>
                <p>
                  Tap the &quot;LOG FOOD&quot; button on the home screen. You can use AI photo scanning (Pro),
                  barcode scanning (Pro), manual entry, or select from previous meals.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">How does the calorie &quot;charging&quot; work?</h3>
                <p>
                  DEFICIT syncs with Apple HealthKit to read your active calories burned. These calories
                  are added to your daily budget at a configurable rate (50-100% for Pro users).
                  Walk more, eat more.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">Why isn&apos;t HealthKit syncing?</h3>
                <p>
                  Make sure you&apos;ve granted DEFICIT permission to read Health data. Go to Settings &gt; Privacy
                  &amp; Security &gt; Health &gt; DEFICIT and enable Active Energy.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">How do I restore my subscription?</h3>
                <p>
                  Open DEFICIT, go to Settings, and tap &quot;Restore Purchases&quot;. Make sure you&apos;re signed
                  into the same Apple ID used for the original purchase.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">How do I cancel my subscription?</h3>
                <p>
                  Subscriptions are managed through your Apple ID. Go to Settings &gt; [Your Name] &gt;
                  Subscriptions on your iPhone, find DEFICIT, and tap Cancel Subscription.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">Is my data private?</h3>
                <p>
                  Yes. Your food log is stored locally on your device. AI photo scans are processed
                  in real-time and not stored on our servers. See our{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>

              <div>
                <h3 className="text-primary font-bold mb-2">How do I delete my account?</h3>
                <p>
                  Go to Settings in the app and tap &quot;Delete Account&quot;. This will permanently remove
                  your account and all associated data from our servers. Local data on your device
                  can be removed by deleting the app.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// BUG REPORTS</h2>
            <p className="mb-4">
              Found a bug? Please include the following in your email:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Your device model (e.g., iPhone 15 Pro)</li>
              <li>iOS version (e.g., iOS 17.2)</li>
              <li>Steps to reproduce the issue</li>
              <li>Screenshots if applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">// FEATURE REQUESTS</h2>
            <p>
              Have an idea to make DEFICIT better? We&apos;d love to hear it. Email us at{' '}
              <a href="mailto:willmorrisonwebdev@gmail.com" className="text-primary hover:underline">
                willmorrisonwebdev@gmail.com
              </a>{' '}
              with the subject line &quot;Feature Request&quot;.
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
              <Link href="/support" className="hover:text-white transition-colors">SUPPORT</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
