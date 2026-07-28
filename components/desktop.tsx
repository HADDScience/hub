"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { GridViewIcon, Menu01Icon } from "@hugeicons/core-free-icons"

import { AppIcon } from "@/components/app-icon"
import { MenuBar } from "@/components/menu-bar"
import { APPS, STATUS_LABEL, type LauncherApp } from "@/lib/apps"
import { useCoarsePointer } from "@/hooks/use-environment"
import { cn } from "@/lib/utils"

type View = "grid" | "list"

function openApp(app: LauncherApp) {
  if (!app.url) return
  if (app.sameTab) {
    window.location.href = app.url
  } else {
    window.open(app.url, "_blank", "noopener,noreferrer")
  }
}

/**
 * 아이콘이 실제로 몇 개씩 한 줄에 놓였는지 DOM 에서 읽는다.
 * 반응형 그리드라 열 수를 상수로 둘 수 없어 위/아래 이동에 필요하다.
 */
function columnsOf(nodes: (HTMLButtonElement | null)[]): number {
  const tops = nodes.map((n) => n?.offsetTop ?? -1).filter((t) => t >= 0)
  if (tops.length === 0) return 1
  const first = tops[0]
  const count = tops.filter((t) => t === first).length
  return Math.max(1, count)
}

export function Desktop() {
  const [view, setView] = useState<View>("grid")
  const [selected, setSelected] = useState(0)
  const coarse = useCoarsePointer()
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const move = useCallback((delta: number) => {
    setSelected((current) => {
      const next = current + delta
      if (next < 0 || next >= APPS.length) return current
      itemRefs.current[next]?.focus()
      return next
    })
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const columns = view === "grid" ? columnsOf(itemRefs.current) : 1

      switch (event.key) {
        case "ArrowRight":
          event.preventDefault()
          move(1)
          break
        case "ArrowLeft":
          event.preventDefault()
          move(-1)
          break
        case "ArrowDown":
          event.preventDefault()
          move(columns)
          break
        case "ArrowUp":
          event.preventDefault()
          move(-columns)
          break
        default:
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [move, view])

  return (
    <div className="relative flex h-svh flex-col overflow-hidden bg-background text-foreground">
      {/* ─── 배경: 중립 캔버스 + 헤어라인 그리드 + 한 점의 인디고 전압 ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-70 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(130%_90%_at_50%_-5%,#000_30%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(48%_38%_at_12%_-6%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_70%)]"
      />

      <MenuBar />

      <main
        className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-8"
        onClick={(e) => {
          // 바탕 클릭 시 선택 해제 느낌만 준다 (포커스는 유지)
          if (e.target === e.currentTarget) setSelected(-1)
        }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.08em] text-primary uppercase">
                Workspace
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                내부 도구
              </h1>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {APPS.length}개 앱
            </span>
          </div>

          {view === "grid" ? (
            <div
              role="listbox"
              aria-label="앱 목록"
              className="flex flex-wrap gap-2 sm:gap-3"
            >
              {APPS.map((app, i) => (
                <AppIcon
                  key={app.id}
                  ref={(node) => {
                    itemRefs.current[i] = node
                  }}
                  app={app}
                  selected={selected === i}
                  openOnSingleClick={coarse}
                  onSelect={() => setSelected(i)}
                  onOpen={() => openApp(app)}
                />
              ))}
            </div>
          ) : (
            <ul
              role="listbox"
              aria-label="앱 목록"
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              {APPS.map((app, i) => {
                const disabled = app.url === null
                return (
                  <li key={app.id}>
                    <button
                      ref={(node) => {
                        itemRefs.current[i] = node
                      }}
                      type="button"
                      role="option"
                      aria-selected={selected === i}
                      aria-disabled={disabled}
                      onClick={() => {
                        setSelected(i)
                        if (coarse && !disabled) openApp(app)
                      }}
                      onDoubleClick={() => !disabled && openApp(app)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setSelected(i)
                          if (!disabled) openApp(app)
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left outline-none transition-colors last:border-b-0",
                        selected === i ? "bg-accent" : "hover:bg-accent/60",
                        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        disabled && "opacity-60"
                      )}
                    >
                      <span
                        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[22%] border border-border"
                        aria-hidden
                      >
                        <Image
                          src={app.icon}
                          alt=""
                          sizes="36px"
                          className="size-full object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-medium text-foreground">
                          {app.name}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {app.description}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                          app.status === "live"
                            ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                            : app.status === "maintenance"
                              ? "bg-[var(--color-warn)]/15 text-[var(--color-warn)]"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {STATUS_LABEL[app.status]}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>

      <footer className="relative z-10 flex h-9 shrink-0 items-center gap-3 border-t border-border bg-card/85 px-3 text-[11px] text-muted-foreground backdrop-blur-md">
        <span>
          {coarse ? "탭하여 열기" : "더블클릭하여 열기"} · 방향키로 이동, Enter
          로 실행
        </span>
        <button
          type="button"
          aria-label={view === "grid" ? "목록으로 보기" : "아이콘으로 보기"}
          onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
          className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          <HugeiconsIcon
            icon={view === "grid" ? Menu01Icon : GridViewIcon}
            size={13}
            aria-hidden
          />
          {view === "grid" ? "목록으로 보기" : "아이콘으로 보기"}
        </button>
      </footer>
    </div>
  )
}
