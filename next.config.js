/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/Shanghai-Gaokao' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/Shanghai-Gaokao/' : '',
}

module.exports = nextConfig 