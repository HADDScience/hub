"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  Sun01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons"

import { useClock } from "@/hooks/use-environment"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"

/**
 * 상단 메뉴 바 — macOS 데스크톱 은유를 유지하되 Omnis 중립 표면 + 인디고 브랜드 마크.
 * 헤어라인 border-b, backdrop blur. 우측에 시계·테마·사용자 메뉴.
 */
export function MenuBar() {
  const { time, date } = useClock()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="z-[var(--z-dock)] flex h-9 shrink-0 items-center gap-3 border-b border-border bg-card/85 px-3 text-[11px] text-foreground backdrop-blur-md">
      <Link
        href="/"
        aria-label="허브 홈"
        className="flex items-center gap-1.5 rounded-md px-1 py-0.5 font-semibold tracking-tight transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="grid size-4 place-items-center rounded-[5px] bg-primary text-primary-foreground">
          <HugeiconsIcon icon={DashboardSquare01Icon} size={11} aria-hidden />
        </span>
        HADD SCIENCE
      </Link>

      <span className="hidden text-muted-foreground sm:inline">허브</span>

      <div className="ml-auto flex items-center gap-2.5">
        <a
          href="/hub/?intro=1"
          className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent"
        >
          허브 안내
        </a>
        <span className="hidden font-mono text-[10.5px] text-muted-foreground sm:inline">
          {date}
        </span>
        <span
          className="font-mono text-[11px] font-medium text-muted-foreground tabular-nums"
          suppressHydrationWarning
        >
          {time}
        </span>
        <button
          type="button"
          aria-label="테마 전환"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(
            "grid size-6 place-items-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          )}
        >
          <HugeiconsIcon
            icon={resolvedTheme === "dark" ? Sun01Icon : Moon02Icon}
            size={14}
            aria-hidden
          />
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
