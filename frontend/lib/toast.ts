import toast from 'react-hot-toast'

const baseStyle = {
  background: '#1a1a1a',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.1)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  padding: '12px 16px',
  borderRadius: '10px',
}

export const notify = {
  success: (msg: string) =>
    toast.success(msg, {
      style: baseStyle,
      iconTheme: { primary: '#00FFB2', secondary: '#1a1a1a' },
    }),

  error: (msg: string) =>
    toast.error(msg, {
      style: baseStyle,
      iconTheme: { primary: '#ef4444', secondary: '#1a1a1a' },
    }),

  info: (msg: string) =>
    toast(msg, {
      style: baseStyle,
      icon: 'ℹ️',
    }),
}