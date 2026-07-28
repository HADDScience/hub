"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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
    <div className="relative flex h-svh flex-col overflow-hidden bg-[radial-gradient(120%_120%_at_20%_0%,#1e3a5f_0%,#0f172a_45%,#020617_100%)] dark:bg-[radial-gradient(120%_120%_at_20%_0%,#12263f_0%,#0a0f1c_45%,#01030a_100%)]">
      <MenuBar />

      <main
        className="flex-1 overflow-y-auto p-5 sm:p-8"
        onClick={(e) => {
          // 바탕 클릭 시 선택 해제 느낌만 준다 (포커스는 유지)
          if (e.target === e.currentTarget) setSelected(-1)
        }}
      >
        {view === "grid" ? (
          <div
            role="listbox"
            aria-label="앱 목록"
            className="flex flex-wrap gap-2 sm:gap-4"
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
            className="mx-auto flex max-w-2xl flex-col overflow-hidden rounded-xl bg-white/6 ring-1 ring-white/10 backdrop-blur-sm"
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
                      "flex w-full items-center gap-3 border-b border-white/8 px-4 py-3 text-left text-white/90 outline-none transition-colors last:border-b-0",
                      selected === i ? "bg-white/12" : "hover:bg-white/8",
                      "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                      disabled && "opacity-55"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-lg text-white ring-1 ring-black/10",
                        app.tint
                      )}
                      aria-hidden
                    >
                      {app.glyph}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-medium">
                        {app.name}
                      </span>
                      <span className="block truncate text-[11px] text-white/60">
                        {app.description}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                      {STATUS_LABEL[app.status]}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </main>

      <footer className="flex h-9 shrink-0 items-center gap-3 border-t border-white/10 bg-black/25 px-3 text-[11px] text-white/70 backdrop-blur-md">
        <span>
          {coarse ? "탭하여 열기" : "더블클릭하여 열기"} · 방향키로 이동, Enter
          로 실행
        </span>
        <button
          type="button"
          onClick={() => setView((v) => (v === "grid" ? "list" : "grid"))}
          className="ml-auto rounded-md px-2 py-1 transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          {view === "grid" ? "⊞ 목록으로 보기" : "⊡ 아이콘으로 보기"}
        </button>
      </footer>
    </div>
  )
}
