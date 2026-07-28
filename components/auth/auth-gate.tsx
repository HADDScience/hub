"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"

import { supabase, redirectTo } from "@/lib/supabase"
import { LoginScreen } from "@/components/auth/login-screen"

/** 소셜 로그인 세션에서 뽑아낸, 화면에 쓰기 좋은 사용자 프로필. */
export interface HubUser {
  id: string
  email: string | null
  name: string
  avatarUrl: string | null
  provider: string | null
}

interface AuthValue {
  session: Session
  user: HubUser
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

/** AuthGate 안에서 로그인한 사용자·세션·로그아웃에 접근한다. */
export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error("useAuth 는 AuthGate 안에서만 쓸 수 있습니다.")
  return value
}

function toHubUser(session: Session): HubUser {
  const meta = session.user.user_metadata as Record<string, unknown>
  const name =
    String(meta?.full_name ?? meta?.name ?? "") ||
    session.user.email?.split("@")[0] ||
    "사용자"
  const avatarUrl =
    (typeof meta?.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta?.picture === "string" && meta.picture) ||
    null
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    name,
    avatarUrl,
    provider: session.user.app_metadata?.provider ?? null,
  }
}

type Phase =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "ready"; session: Session }

/**
 * 소셜 로그인 게이트. 미인증 사용자는 로그인 화면을 보고,
 * 인증되면 자식(데스크톱·계정 페이지)이 렌더된다.
 * 승인/멤버십 절차 없이 소셜 로그인만으로 통과하는 단순 게이트다.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" })
  const [pending, setPending] = useState<"google" | "kakao" | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    function resolve(session: Session | null) {
      if (cancelled) return
      setPhase(session ? { kind: "ready", session } : { kind: "signed-out" })
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      resolve(session)
    )

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signIn(provider: "google" | "kakao") {
    setPending(provider)
    setError(null)
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo() },
    })
    if (err) {
      setPending(null)
      setError(`로그인을 시작하지 못했습니다: ${err.message}`)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setPhase({ kind: "signed-out" })
  }

  if (phase.kind === "loading") {
    return (
      <div className="grid min-h-svh place-items-center bg-background text-muted-foreground">
        <span className="text-sm">확인 중…</span>
      </div>
    )
  }

  if (phase.kind === "signed-out") {
    return (
      <LoginScreen
        onSignIn={signIn}
        pending={pending}
        error={error}
      />
    )
  }

  return (
    <AuthContext.Provider
      value={{
        session: phase.session,
        user: toHubUser(phase.session),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
