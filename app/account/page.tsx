"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Logout01Icon,
  Mail01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/avatar"
import { useAuth } from "@/components/auth/auth-gate"
import { LinkedAccounts } from "@/components/auth/linked-accounts"

/** 소셜 프로바이더 표시용 한글 라벨. */
const PROVIDER_LABEL: Record<string, string> = {
  google: "Google",
  kakao: "카카오",
}

/**
 * 계정 설정 — 소셜 로그인으로 인증된 사용자의 프로필·연결된 로그인 수단·로그아웃.
 * AuthGate 안(layout)에서 렌더되므로 useAuth 로 세션에 접근한다.
 * 지금은 소셜 전용이라 비밀번호 변경 UI는 안내만 두고 비활성화한다.
 */
export default function AccountPage() {
  const { user, session, signOut } = useAuth()

  // app_metadata.provider 는 **최초 가입 수단**으로 고정돼 연결 후에는 어긋난다.
  // 실제로 연결된 수단은 identities 를 봐야 한다.
  const linkedLabels = (session.user.identities ?? []).map(
    (i) => PROVIDER_LABEL[i.provider] ?? i.provider
  )

  return (
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto w-full max-w-[560px] px-5 py-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            aria-label="허브로 돌아가기"
            className="grid size-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} aria-hidden />
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">계정 설정</h1>
            <p className="text-xs text-muted-foreground">
              HADD SCIENCE 허브 · 소셜 로그인 계정
            </p>
          </div>
        </div>

        {/* 프로필 카드 */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full text-xl ring-1 ring-border">
              <Avatar url={user.avatarUrl} name={user.name} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{user.name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  size={14}
                  aria-hidden
                  className="shrink-0"
                />
                {user.email ?? "이메일 정보 없음"}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
                {linkedLabels.length > 0
                  ? `${linkedLabels.join(" · ")} 연결됨`
                  : "소셜 로그인"}
              </span>
            </div>
          </div>
        </section>

        {/* 연결된 로그인 수단 — 구글·카카오를 한 계정으로 묶는다 */}
        <LinkedAccounts />

        {/* 로그인 방식 안내 */}
        <section className="mt-4 rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              size={16}
              aria-hidden
              className="text-muted-foreground"
            />
            로그인 방식
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            현재 허브는 <span className="font-medium text-foreground">소셜 로그인 전용</span>입니다.
            이메일·비밀번호 가입과 비밀번호 변경은 아직 제공하지 않습니다.
            계정 정보(이름·프로필 사진)는 연결된 소셜 계정에서 관리됩니다.
          </p>
        </section>

        {/* 로그아웃 */}
        <section className="mt-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">로그아웃</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                이 브라우저에서 허브 세션을 종료합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive"
            >
              <HugeiconsIcon icon={Logout01Icon} size={15} aria-hidden />
              로그아웃
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
