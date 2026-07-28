import type { NextConfig } from "next"

/** GitHub Pages(org 사이트 하위 경로 /hub)로 정적 배포한다. */
const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  output: "export",
  images: { unoptimized: true },
  basePath: "/hub",
  assetPrefix: "/hub",
  trailingSlash: true,
}

export default nextConfig
