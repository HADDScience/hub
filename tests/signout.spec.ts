import { expect, test, type Page } from "@playwright/test"

const origin = "http://127.0.0.1:3011"
const user = {
  id: "fixture",
  name: "테스트 사용자",
  email: null,
  role: "MEMBER",
}

async function signedIn(page: Page) {
  await page.route("**/__session-fixture", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><html></html>",
    })
  )
  await page.goto("/__session-fixture")
  await page.evaluate((user) => {
    localStorage.setItem("hadd.hub.welcome.v1", "1")
    sessionStorage.removeItem("hadd.hub-next")
    localStorage.setItem(
      "hadd.sso.session.hub",
      JSON.stringify({
        token: "fixture-hub-token",
        expiresAt: Date.now() + 3600000,
        user,
      })
    )
  }, user)
  await page
    .context()
    .addCookies([
      { name: "fixture-sso", value: "active", url: origin, httpOnly: true },
    ])
  await page.route("**/api/sso/verify", (route) =>
    route.fulfill({ json: { user } })
  )
  await page.goto("/hub/account")
  await expect(
    page.getByRole("button", { name: "로그아웃", exact: true })
  ).toBeVisible()
}

async function authEndpoints(
  page: Page,
  mode: "ok" | "network" | "cookie-survives" | "invalid-csrf" = "ok"
) {
  await page.route("**/api/auth/csrf", (route) =>
    mode === "network"
      ? route.abort()
      : route.fulfill({
          json: mode === "invalid-csrf" ? {} : { csrfToken: "fixture-csrf" },
        })
  )
  await page.route("**/api/auth/signout", async (route) => {
    expect(route.request().method()).toBe("POST")
    expect(route.request().headers()["cookie"]).toContain("fixture-sso=active")
    expect(route.request().headers()["x-auth-return-redirect"]).toBe("1")
    const form = new URLSearchParams(route.request().postData()!)
    expect(form.get("csrfToken")).toBe("fixture-csrf")
    expect(form.get("callbackUrl")).toBe(`${origin}/hub`)
    await route.fulfill({
      json: { url: `${origin}/hub` },
      headers:
        mode === "cookie-survives"
          ? {}
          : {
              "set-cookie":
                "fixture-sso=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax",
            },
    })
  })
  await page.route("**/api/auth/session", async (route) => {
    const active = route
      .request()
      .headers()
      ["cookie"]?.includes("fixture-sso=active")
    await route.fulfill({ json: active ? { user } : null })
  })
}

test("로그아웃 후 쿠키가 없어져 다음 로그인에서 자격 증명을 다시 요구한다", async ({
  page,
}) => {
  await signedIn(page)
  await authEndpoints(page)
  await page.route("**/sso/authorize?**", async (route) => {
    const active = route
      .request()
      .headers()
      ["cookie"]?.includes("fixture-sso=active")
    await route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: active
        ? "<h1>자동 로그인됨</h1>"
        : "<h1>HADD 계정 인증이 필요합니다</h1>",
    })
  })
  await page.getByRole("button", { name: "로그아웃", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "HADD 계정으로 로그인", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(() => localStorage.getItem("hadd.sso.session.hub"))
  ).toBeNull()
  expect(
    (await page.context().cookies()).some(
      (cookie) => cookie.name === "fixture-sso"
    )
  ).toBe(false)
  await page
    .getByRole("button", { name: "HADD 계정으로 로그인", exact: true })
    .click()
  await expect(
    page.getByRole("heading", { name: "HADD 계정 인증이 필요합니다" })
  ).toBeVisible()
})

test("네트워크 실패와 새로고침 뒤에도 로그인 버튼 대신 재시도를 제공한다", async ({
  page,
}) => {
  await signedIn(page)
  await authEndpoints(page, "network")
  await page.getByRole("button", { name: "로그아웃", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "로그아웃을 완료하지 못했습니다" })
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "로그아웃을 완료하지 못했습니다" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "HADD 계정으로 로그인", exact: true })
  ).toHaveCount(0)
  await page.unroute("**/api/auth/csrf")
  await page.route("**/api/auth/csrf", (route) =>
    route.fulfill({ json: { csrfToken: "fixture-csrf" } })
  )
  await page.getByRole("button", { name: "로그아웃 다시 시도" }).click()
  await expect(
    page.getByRole("button", { name: "HADD 계정으로 로그인", exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(() =>
      localStorage.getItem("hadd.sso.signout-pending.hub")
    )
  ).toBeNull()
})

for (const mode of ["cookie-survives", "invalid-csrf"] as const) {
  test(`${mode}: 공통 세션 종료가 확인되지 않으면 성공으로 처리하지 않는다`, async ({
    page,
  }) => {
    await signedIn(page)
    await authEndpoints(page, mode)
    await page.getByRole("button", { name: "로그아웃", exact: true }).click()
    await expect(
      page.getByRole("heading", { name: "로그아웃을 완료하지 못했습니다" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "HADD 계정으로 로그인", exact: true })
    ).toHaveCount(0)
  })
}
