/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // Explicitly set SendGrid to undefined to prevent errors
    SENDGRID_API_KEY: undefined,
  },
}

module.exports = nextConfig

