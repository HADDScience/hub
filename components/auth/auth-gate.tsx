"use client"

import { createContext, useContext, useEffect, useState } from "react"

import {
  clearStoredSession,
  OmnisAuthError,
  readStoredSession,
  redeemGrant,
  startSignIn,
  storeSession,
  takeGrantFromHash,
  verifyStoredSession,
  type OmnisSession,
  type OmnisUser,
} from "@/lib/omnis-auth"
import { LoginScreen } from "@/components/auth/login-screen"
import { captureNextTarget, takeNextTarget } from "@/lib/next-target"

/** 화면에 쓰기 좋은 사용자 프로필. Omnis 자체계정에서 온다. */
export interface HubUser extends OmnisUser {
  /** Omnis 계정에는 프로필 사진이 없다. Avatar 는 이름 이니셜로 떨어진다. */
  avatarUrl: string | null
}

interface AuthValue {
  session: OmnisSession
  user: HubUser
  signOut: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

/** AuthGate 안에서 로그인한 사용자·세션·로그아웃에 접근한다. */
export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error("useAuth 는 AuthGate 안에서만 쓸 수 있습니다.")
  return value
}

function toHubUser(user: OmnisUser): HubUser {
  return { ...user, avatarUrl: null }
}

type Phase =
  | { kind: "loading" }
  | { kind: "signed-out"; error: string | null }
  | { kind: "leaving" }
  | { kind: "ready"; session: OmnisSession }

/**
 * 로그인 게이트. 인증되지 않은 사람은 로그인 화면을 보고, 인증되면 자식(데스크톱·
 * 계정 페이지)이 렌더된다.
 *
 * 계정의 주인은 Omnis 자체계정이다. 허브에는 소셜 버튼이 없다 — 구글·카카오는
 * Omnis 로그인 화면에서 고르는 문이고, 그 문으로 들어와도 Omnis 계정에 연결돼
 * 있지 않으면 통과하지 못한다. 즉 **허브를 통해 Omnis 계정 없이 들어오는 길은 없다.**
 *
 * 허브는 사내 도구 전체의 **유일한 로그인 화면**이기도 하다. 다른 툴이
 * `/hub/?next=<경로>` 로 보내오면 로그인 뒤 그 경로로 돌려보낸다
 * (`lib/next-target.ts`).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" })

  useEffect(() => {
    let cancelled = false

    /** 로그인이 확정된 뒤. 다른 툴에서 넘어왔다면 그 자리로 돌려보낸다. */
    function settle(session: OmnisSession) {
      if (cancelled) return
      const next = takeNextTarget()
      if (next) {
        // 데스크톱을 잠깐 보여줬다가 이동하면 화면이 튀므로 phase 를 바꾸지 않는다.
        setPhase({ kind: "leaving" })
        window.location.replace(`${window.location.origin}${next}`)
        return
      }
      setPhase({ kind: "ready", session })
    }

    async function run() {
      // 주소를 건드리는 일은 전부 먼저 끝낸다. 이후 렌더에서 주소창이 정리된다.
      captureNextTarget()
      const grant = takeGrantFromHash()

      if (grant) {
        try {
          const session = await redeemGrant(grant)
          if (cancelled) return
          storeSession(session)
          settle(session)
        } catch (err) {
          if (cancelled) return
          clearStoredSession()
          setPhase({
            kind: "signed-out",
            error:
              err instanceof OmnisAuthError
                ? err.message
                : "로그인을 마치지 못했습니다. 다시 시도해 주세요.",
          })
        }
        return
      }

      const stored = readStoredSession()
      if (!stored) {
        setPhase({ kind: "signed-out", error: null })
        return
      }
      if (stored.expiresAt <= Date.now()) {
        clearStoredSession()
        setPhase({ kind: "signed-out", error: null })
        return
      }

      // 저장된 세션을 그대로 믿지 않고 Omnis 에 한 번 되묻는다 — 퇴사 처리가
      // 토큰 수명(8시간)을 기다리지 않고 다음 새로고침에 바로 먹히게 하는 값이다.
      const outcome = await verifyStoredSession(stored.token)
      if (cancelled) return

      if (outcome.kind === "rejected") {
        clearStoredSession()
        setPhase({ kind: "signed-out", error: null })
        return
      }

      if (outcome.kind === "ok") {
        // 이름·역할이 Omnis 에서 바뀌었을 수 있으니 최신값으로 갈아 끼운다.
        const refreshed = { ...stored, user: outcome.user }
        storeSession(refreshed)
        settle(refreshed)
        return
      }

      // 판단 불가(네트워크 등). 런처는 데이터 경계가 아니므로 저장된 만료 시각을
      // 믿고 통과시킨다. 인터넷이 한 번 끊길 때마다 사람을 쫓아낼 이유가 없다.
      settle(stored)
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [])

  function signOut() {
    clearStoredSession()
    setPhase({ kind: "signed-out", error: null })
  }

  if (phase.kind === "loading" || phase.kind === "leaving") {
    return (
      <div className="grid min-h-svh place-items-center bg-background text-muted-foreground">
        <span className="text-sm">
          {phase.kind === "leaving" ? "돌아가는 중…" : "확인 중…"}
        </span>
      </div>
    )
  }

  if (phase.kind === "signed-out") {
    return <LoginScreen onSignIn={() => startSignIn()} error={phase.error} />
  }

  return (
    <AuthContext.Provider
      value={{
        session: phase.session,
        user: toHubUser(phase.session.user),
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
