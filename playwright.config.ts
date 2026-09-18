import { defineConfig } from "@playwright/test"

/**
 * 테스트용 로컬 서버 주소. 포트는 바꿀 수 있게 열어 둔다 — 3011 은 옆 프로젝트의 개발
 * 서버가 잡고 있을 때가 있고, 그러면 `reuseExistingServer: false` 가 곧바로 실패한다.
 * 테스트 파일도 이 값을 가져다 쓴다(허브가 자기 오리진을 보고 동작하기 때문).
 */
export const PORT = process.env.HUB_TEST_PORT ?? "3011"
export const ORIGIN = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: ORIGIN,
    browserName: "chromium",
    channel: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: `pnpm dev --hostname 127.0.0.1 --port ${PORT}`,
    url: ORIGIN,
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_OMNIS_URL: `${ORIGIN}/omnis` },
  },
})
