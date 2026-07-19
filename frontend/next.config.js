/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  // Google Auth එකේ COOP Warning එක නැති කරන්න මේක එකතු කරන්න 👇
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig