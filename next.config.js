/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Include data files in serverless function bundles (Vercel)
    outputFileTracingIncludes: {
      '/*': ['./data/**'],
    },
  },
}

module.exports = nextConfig
