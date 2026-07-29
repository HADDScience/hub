"use client"

import { createClient } from "@supabase/supabase-js"

/**
 * Supabase 브라우저 클라이언트 (허브).
 *
 * ip-platform 과 같은 프로젝트를 쓰므로 localStorage 의
 * `sb-<project-ref>-auth-token` 저장 키가 동일하다 →
 * 허브에서 로그인하면 ip-platform 도, 반대도 자동 로그인 상태다.
 *
 * anon 키는 브라우저에 노출되는 공개 키다. 실제 방어는 RLS 가 한다.
 * 허브는 테이블을 조회하지 않는 단순 런처라 스키마 지정 없이 인증만 쓴다.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 가 설정되지 않았습니다."
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
})

/**
 * OAuth 왕복 후 돌아올 주소. basePath(`/hub`)를 포함해야 한다.
 *
 * 기본값은 허브 루트(로그인). 계정 연결(linkIdentity)은 원래 보던 자리로
 * 돌아와야 하므로 `redirectTo("/account/")` 처럼 경로를 넘긴다.
 * `trailingSlash: true` 라 경로 끝의 `/` 를 붙여야 리다이렉트가 한 번 덜 돈다.
 *
 * 여기서 만들어지는 주소는 모두 Supabase 대시보드의 Redirect URLs 에
 * 등록돼 있어야 한다 (`<오리진>/hub/`, `<오리진>/hub/account/`).
 */
export function redirectTo(path: string = "/"): string {
  if (typeof window === "undefined") return ""
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/hub"
  return `${window.location.origin}${basePath}${path}`
}
