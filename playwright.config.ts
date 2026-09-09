import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3011",
    browserName: "chromium",
    channel: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --hostname 127.0.0.1 --port 3011",
    url: "http://127.0.0.1:3011/hub",
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_OMNIS_URL: "http://127.0.0.1:3011/omnis" },
  },
})
