import type { NextConfig } from "next"

/**
 * Vercel(프로젝트 hadd-hub)에 정적 export 로 올린다. 주소는 hub.haddscience.com 루트다.
 *
 * 2026-09-18 이전에는 홈페이지의 `/hub` 아래에 rewrite 로 얹혀 살았고, 그래서 basePath 가
 * `/hub` 였다 — 자산 경로가 홈페이지의 `/_next` 와 부딪히지 않게 하려는 것이었다. 도메인을
 * 붙이면서 자기 서브도메인을 받았으므로 그 접두어가 필요 없다. 옛 `/hub` 주소는 홈페이지가
 * 이 서브도메인으로 308 을 보낸다.
 */
const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  output: "export",
  images: { unoptimized: true },

  // trailingSlash 를 켜지 않는다. 예전에 홈페이지 rewrite 와 맞물려 /hub/ → /hub → /hub/ 로
  // 무한히 돈 적이 있다. 서브도메인 루트로 옮긴 뒤에도 켤 이유가 없다.
}

export default nextConfig
