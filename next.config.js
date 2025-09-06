/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Enable TypeScript checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Temporarily disable ESLint during builds for migration
    ignoreDuringBuilds: true,
  },
  images: {
    // Enable Next.js Image optimization
    unoptimized: false,
  },
}

export default nextConfig 