"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  LinkSquare02Icon,
  Logout01Icon,
  Mail01Icon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/avatar"
import { useAuth } from "@/components/auth/auth-gate"
import { omnisSettingsUrl } from "@/lib/omnis-auth"

/** Omnis 역할 표시용 한글 라벨. */
const ROLE_LABEL: Record<string, string> = {
  ADMIN: "관리자",
  MEMBER: "구성원",
}

/**
 * 계정 설정 — 프로필 확인과 로그아웃.
 *
 * 계정 자체(이름·비밀번호·구글/카카오 연결)는 여기서 고치지 않는다. 주인이 Omnis
 * 자체계정이라 편집 화면도 Omnis 한 곳에만 둔다. 허브에도 같은 화면을 두면 두 곳이
 * 서로 다른 상태를 보여주기 시작하고, 정적 배포인 허브는 그걸 고칠 권한도 없다.
 */
export default function AccountPage() {
  const { user, signOut } = useAuth()

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
              HADD SCIENCE 허브 · Omnis 계정
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
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </div>
          </div>
        </section>

        {/* 계정 관리는 Omnis 한 곳에서 */}
        <section className="mt-4 rounded-lg border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <HugeiconsIcon
              icon={ShieldKeyIcon}
              size={16}
              aria-hidden
              className="text-muted-foreground"
            />
            로그인 수단
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            이름·비밀번호와 구글·카카오 연결은 Omnis 계정 설정에서 관리합니다.
            사내 도구는 모두 이 계정 하나를 씁니다.
          </p>
          <a
            href={omnisSettingsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
          >
            Omnis 계정 설정 열기
            <HugeiconsIcon icon={LinkSquare02Icon} size={14} aria-hidden />
          </a>
        </section>

        {/* 로그아웃 */}
        <section className="mt-4 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">로그아웃</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                이 브라우저에서 허브 세션을 종료합니다. Omnis 로그인은 유지되므로
                다시 로그인하면 바로 들어옵니다.
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
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
