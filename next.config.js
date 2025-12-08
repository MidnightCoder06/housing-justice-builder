/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable TypeScript checking during build
    ignoreBuildErrors: false,
  },
  images: {
    // Enable Next.js Image optimization
    unoptimized: false,
  },
}

export default nextConfig 