"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight02Icon,
  DashboardSquare01Icon,
  ShieldIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

const APPS = [
  ["Omnis", "회사 자원 통합 관리"],
  ["AI Alzheimer", "치매진단 분광 분석"],
  ["AI ECM", "ECM 조성 처방"],
] as const

interface Props {
  onSignIn: () => void
  error: string | null
}

/**
 * 로그인 화면 — Omnis 인증 비주얼(다크 인디고 그라디언트 + 화이트 그리드).
 *
 * 버튼이 하나뿐인 것이 요점이다. 구글·카카오는 Omnis 로그인 화면에서 고른다.
 * 여기에 소셜 버튼을 두면 로그인 수단이 두 군데로 갈라져, 어느 계정으로 들어왔는지
 * 사람도 코드도 헷갈린다. 계정의 주인은 언제나 Omnis 자체계정 하나다.
 */
export function LoginScreen({ onSignIn, error }: Props) {
  const [pending, setPending] = useState(false)

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
            Omnis 에 담기지 않는 도구들의 진입점입니다. 사내 자원 관리는 Omnis 안에서,
            연구·분석 도구는 여기서 엽니다. 계정은 Omnis 하나를 함께 씁니다.
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

      {/* ─── 우측: 로그인 카드 (중립 표면) ─── */}
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
              Omnis 계정으로 로그인하면 내부 도구 런처로 이동합니다.
            </p>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setPending(true)
              onSignIn()
            }}
            className={cn(
              "mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4",
              "text-[14px] font-semibold text-primary-foreground shadow-lg shadow-primary/20",
              "transition-opacity outline-none hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <span>{pending ? "Omnis 로 이동 중…" : "Omnis로 로그인"}</span>
            {pending ? null : (
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} aria-hidden />
            )}
          </button>

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
              사내 도구는 모두 Omnis 계정 하나를 씁니다. 구글·카카오 로그인은
              Omnis 화면에서 고를 수 있고, 계정에 연결해 둔 경우에만 들어옵니다.
              계정이 필요하면 관리자에게 요청하세요.
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
