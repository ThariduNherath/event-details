'use client'

import { GoogleOAuthProvider } from '@react-oauth/google'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // මෙතන fetchUser අවශ්‍ය නැහැ, මොකද ඒ වැඩේ AuthContext එකෙන් බලාගන්නවා.
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      {children}
    </GoogleOAuthProvider>
  )
}