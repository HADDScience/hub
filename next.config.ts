import type { NextConfig } from "next"

/** Vercel(프로젝트 hadd-hub)에 정적 export 로 올린다. 주소는 /hub 아래다. */
const nextConfig: NextConfig = {
  turbopack: { root: import.meta.dirname },
  output: "export",
  images: { unoptimized: true },
  basePath: "/hub",
  assetPrefix: "/hub",

  // trailingSlash 를 켜지 않는다. 켜면 /hub 로 들어온 요청에 308 → /hub/ 를 돌려주는데,
  // 이 앱 앞에는 홈페이지가 서 있다. 홈페이지의 rewrite 는 /hub/ 를 여기로 넘길 때
  // 끝 슬래시를 떨어뜨려 /hub 로 보내므로, 그 308 의 Location(/hub/)이 홈페이지
  // 오리진에서 다시 해석돼 /hub/ → /hub → /hub/ … 로 무한히 돈다. 실제로 그렇게 됐다.
  // (GitHub Pages 시절엔 디렉터리 인덱스를 찾느라 켜 둬야 했다 — 그 사정은 끝났다.)
}

export default nextConfig
