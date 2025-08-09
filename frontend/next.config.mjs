/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow access from other devices on the same network
  experimental: {
    // Enable external access
  },
  // Add API proxy for backend access
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5205/api/:path*',
      },
    ];
  },
  // Optional: Add custom headers for CORS if needed
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
