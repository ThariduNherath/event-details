import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { Toaster } from 'react-hot-toast'
import VerifyBanner from '@/components/ui/VerifyBanner'

export const metadata: Metadata = {
  title: 'NEXUS 2025 — The Future Awaits',
  description: 'The most immersive tech event of the decade. Join 10,000+ innovators at NEXUS 2025.',
  icons: {
    icon: '/favicon.ico', 
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="noise">
        <AuthProvider>
          <CartProvider>
            <VerifyBanner />
            {children}
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}