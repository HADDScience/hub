"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  SparklesIcon,
  ShieldIcon,
} from "@hugeicons/core-free-icons"

import {
  GoogleSignInButton,
  KakaoSignInButton,
} from "@/components/auth/social-buttons"

/** 카카오 노출 여부 — Supabase 콘솔에서 카카오 프로바이더를 켜면 true 로 둔다. */
const KAKAO_ENABLED = true

const APPS = [
  ["omnis", "업무 관리"],
  ["ip-platform", "지식재산권"],
  ["raman-diff", "라만 분석"],
] as const

interface Props {
  onSignIn: (provider: "google" | "kakao") => void
  pending: "google" | "kakao" | null
  error: string | null
}

/**
 * 로그인 화면 — Omnis 인증 비주얼(다크 인디고 그라디언트 + 화이트 그리드).
 * 비밀번호 폼 대신 소셜 로그인 버튼만 둔다 (현재 소셜 전용).
 */
export function LoginScreen({ onSignIn, pending, error }: Props) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      {/* ─── 좌측: 다크 인디고 마케팅 표면 (데스크톱 전용) ─── */}
      <aside className="relative hidden overflow-hidden bg-[#0b1020] text-white lg:flex lg:min-h-svh lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b1020_0%,#172554_46%,#4f46e5_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className="absolute top-20 right-[-120px] h-[360px] w-[360px] rounded-full border border-white/15" />
        <div className="absolute bottom-[-140px] left-[-100px] h-[420px] w-[420px] rounded-full border border-cyan-200/20" />
        <div className="absolute top-1/2 right-16 h-32 w-32 rotate-45 border border-white/15" />

        <div className="relative z-10 flex items-center gap-3 px-10 pt-10">
          <div className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-2xl shadow-black/20 backdrop-blur">
            <HugeiconsIcon icon={DashboardSquare01Icon} size={22} />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">
              HADD SCIENCE
            </div>
            <div className="font-mono text-[10px] text-white/60">Hub</div>
          </div>
        </div>

        <div className="relative z-10 px-10 pb-14">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur">
            <HugeiconsIcon icon={SparklesIcon} size={14} aria-hidden />
            Internal tools launcher
          </div>
          <h1 className="max-w-[560px] text-[44px] font-semibold leading-[1.05] tracking-[-0.02em] xl:text-[54px]">
            모든 도구를
            <br />한 화면에서.
          </h1>
          <p className="mt-5 max-w-[480px] text-[15px] leading-7 text-white/70">
            HADD Science 팀의 내부 도구를 하나의 데스크톱에서 열고 오갑니다.
            사내 소셜 계정으로 로그인하세요.
          </p>

          <div className="mt-10 grid max-w-[520px] grid-cols-3 gap-3">
            {APPS.map(([title, caption]) => (
              <div
                key={title}
                className="rounded-lg border border-white/12 bg-white/8 p-3 backdrop-blur"
              >
                <div className="text-[12px] font-semibold">{title}</div>
                <div className="mt-1 text-[10.5px] text-white/55">{caption}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ─── 우측: 소셜 로그인 카드 (중립 표면) ─── */}
      <section className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-5 py-10 sm:px-8 dark:bg-[linear-gradient(180deg,var(--background)_0%,#111111_100%)]">
        <div className="w-full max-w-[420px]">
          <div className="mb-9 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
            </div>
            <div className="leading-tight">
              <div className="text-[14px] font-semibold tracking-tight">
                HADD SCIENCE
              </div>
              <div className="font-mono text-[9.5px] text-muted-foreground">
                Hub
              </div>
            </div>
          </div>

          <div>
            <p className="text-[12px] font-semibold text-primary">WELCOME</p>
            <h2 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              허브에 로그인
            </h2>
            <p className="mt-2 text-[13.5px] leading-6 text-muted-foreground">
              사내 소셜 계정으로 로그인하면 내부 도구 런처로 이동합니다.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-2.5">
            <GoogleSignInButton
              onClick={() => onSignIn("google")}
              disabled={pending !== null}
              pending={pending === "google"}
            />
            {KAKAO_ENABLED ? (
              <KakaoSignInButton
                onClick={() => onSignIn("kakao")}
                disabled={pending !== null}
                pending={pending === "kakao"}
              />
            ) : null}
          </div>

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-[12.5px] text-destructive"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-[12px] leading-5 text-muted-foreground">
            <HugeiconsIcon
              icon={ShieldIcon}
              size={15}
              className="mt-0.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span>
              현재 소셜 로그인만 지원합니다. 이메일·비밀번호 가입은 아직
              제공하지 않습니다. 허브에서 로그인하면 다른 HADD 도구도 자동으로
              로그인됩니다.
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
