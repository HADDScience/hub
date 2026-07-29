"use client"

import { useState } from "react"
import type { AuthError, UserIdentity } from "@supabase/supabase-js"

import { supabase, redirectTo } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-gate"
import { GoogleMark, KakaoMark } from "@/components/auth/social-buttons"
import { cn } from "@/lib/utils"

type Provider = "google" | "kakao"

const PROVIDERS: {
  id: Provider
  label: string
  Mark: () => React.ReactElement
}[] = [
  { id: "google", label: "Google", Mark: GoogleMark },
  { id: "kakao", label: "카카오", Mark: KakaoMark },
]

/**
 * 연결 실패 사유를 사람이 읽을 수 있는 문장으로 바꾼다.
 * 셋 다 설정·데이터 문제라 "다시 시도"로는 풀리지 않으므로 할 일을 적어 준다.
 */
function messageFor(err: AuthError): string {
  switch (err.code) {
    case "manual_linking_disabled":
      return "계정 연결이 서버에서 꺼져 있습니다. Supabase 대시보드 → Authentication → Manual Linking 을 켜야 합니다."
    case "identity_already_exists":
      return "이 소셜 계정은 이미 다른 허브 사용자에 연결돼 있습니다. 그 계정으로 로그인하거나, 관리자에게 계정 정리를 요청하세요."
    case "single_identity_not_deletable":
      return "마지막 남은 로그인 수단은 해제할 수 없습니다. 계정에 들어올 방법이 사라지기 때문입니다."
    default:
      return err.message
  }
}

/**
 * 연결된 로그인 수단 관리.
 *
 * 소셜 제공자끼리는 공통 식별자가 없다 — 구글의 `sub` 와 카카오 회원번호는
 * 무관하고, 이메일은 카카오에서 선택 동의라 없을 수도, 서로 다를 수도 있다.
 * 그래서 "속성이 같으면 같은 사람"으로 묶지 않고, **이미 로그인한 세션**이
 * 계정 소유를 증명한 상태에서 다른 제공자를 얹는 방식(linkIdentity)을 쓴다.
 * 남의 계정에 붙이려면 그 계정 세션이 필요하므로 원리적으로 막힌다.
 */
export function LinkedAccounts() {
  const { session } = useAuth()
  const [busy, setBusy] = useState<Provider | null>(null)
  const [error, setError] = useState<string | null>(null)

  const identities = session.user.identities ?? []
  const linkedCount = identities.length

  async function link(provider: Provider) {
    setBusy(provider)
    setError(null)
    // 성공하면 제공자 동의 화면으로 떠나고, 끝나면 이 페이지로 돌아온다.
    const { error: err } = await supabase.auth.linkIdentity({
      provider,
      options: { redirectTo: redirectTo("/account/") },
    })
    if (err) {
      setBusy(null)
      setError(messageFor(err))
    }
  }

  async function unlink(identity: UserIdentity, label: string) {
    if (!window.confirm(`${label} 연결을 해제할까요? 다시 연결할 수 있습니다.`)) {
      return
    }
    setBusy(identity.provider as Provider)
    setError(null)
    const { error: err } = await supabase.auth.unlinkIdentity(identity)
    if (err) {
      setBusy(null)
      setError(messageFor(err))
      return
    }
    // 해제 결과는 토큰에 반영돼야 화면(AuthGate 의 session)이 따라온다.
    await supabase.auth.refreshSession()
    setBusy(null)
  }

  return (
    <section className="mt-4 rounded-lg border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">연결된 로그인 수단</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        연결해 두면 어느 쪽으로 로그인해도 같은 계정으로 들어옵니다. 두 계정의
        이메일이 달라도 됩니다.
      </p>

      <ul className="mt-4 flex flex-col gap-2">
        {PROVIDERS.map(({ id, label, Mark }) => {
          const identity = identities.find((i) => i.provider === id)
          const email =
            typeof identity?.identity_data?.email === "string"
              ? identity.identity_data.email
              : null
          const last = Boolean(identity) && linkedCount <= 1
          const pending = busy === id

          return (
            <li
              key={id}
              className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted">
                <Mark />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {identity ? (email ?? "연결됨") : "연결 안 됨"}
                </span>
              </span>

              {identity ? (
                <button
                  type="button"
                  disabled={last || pending}
                  onClick={() => void unlink(identity, label)}
                  title={
                    last ? "마지막 로그인 수단은 해제할 수 없습니다." : undefined
                  }
                  className={cn(
                    "shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium transition-colors outline-none",
                    "hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                  )}
                >
                  {pending ? "해제 중…" : "연결 해제"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void link(id)}
                  className={cn(
                    "shrink-0 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition-opacity outline-none",
                    "hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {pending ? "이동 중…" : "연결"}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          {error}
        </p>
      ) : null}
    </section>
  )
}
