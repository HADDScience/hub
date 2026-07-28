"use client"

import { useTheme } from "next-themes"

import { useClock } from "@/hooks/use-environment"
import { cn } from "@/lib/utils"

export function MenuBar() {
  const { time, date } = useClock()
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <header className="flex h-9 shrink-0 items-center gap-3 border-b border-white/10 bg-black/25 px-3 text-[11px] text-white/90 backdrop-blur-md">
      <span className="flex items-center gap-1.5 font-semibold tracking-tight">
        <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
        HADD SCIENCE
      </span>

      <span className="hidden text-white/60 sm:inline">툴</span>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-white/70 sm:inline">{date}</span>
        <span className="font-medium tabular-nums" suppressHydrationWarning>
          {time}
        </span>
        <button
          type="button"
          aria-label="테마 전환"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className={cn(
            "grid size-6 place-items-center rounded-md text-white/80 transition-colors",
            "hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
          )}
        >
          {resolvedTheme === "dark" ? "☀" : "☾"}
        </button>
      </div>
    </header>
  )
}
