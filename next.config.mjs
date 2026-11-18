/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Lint (`npm run lint`) and type check (`npm run typecheck`) run as their
    // own CI steps; the build only compiles the app.
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
