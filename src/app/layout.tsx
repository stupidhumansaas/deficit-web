import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DEFICIT - Calorie Tracking That Actually Works',
  description: 'Eat to empty. Move to charge. The brutalist calorie tracker with Apple Watch integration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
