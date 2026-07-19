'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleButtonProps {
  onCredential: (credential: string) => void
  onError?: (message: string) => void
}

export default function GoogleButton({ onCredential, onError }: GoogleButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null)

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

  const renderButton = () => {
    if (!window.google || !buttonRef.current || !clientId) return

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential: string }) => {
        if (response?.credential) {
          onCredential(response.credential)
        } else {
          onError?.('Google sign-in did not return a credential')
        }
      },
    })

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 320,
      shape: 'rectangular',
      text: 'continue_with',
    })
  }

  useEffect(() => {
    if (window.google) renderButton()
  }, [])

  if (!clientId) {
    return (
      <div className="font-mono text-xs text-mist/50 border border-white/10 rounded px-4 py-3 text-center">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable Google Sign-In
      </div>
    )
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={renderButton}
      />
      <div ref={buttonRef} className="flex justify-center" />
    </>
  )
}