"use client"

import { forwardRef } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { STATUS_LABEL, type AppStatus, type LauncherApp } from "@/lib/apps"

interface AppIconProps {
  app: LauncherApp
  selected: boolean
  /** 터치 기기에서는 단일 탭으로 실행한다 */
  openOnSingleClick: boolean
  onSelect: () => void
  onOpen: () => void
}

/** 상태 → 점 색 (기능적 색 코딩, DESIGN.md §Semantic). */
const STATUS_DOT: Record<AppStatus, string> = {
  live: "bg-[var(--color-success)]",
  coming: "bg-muted-foreground/50",
  maintenance: "bg-[var(--color-warn)]",
}

export const AppIcon = forwardRef<HTMLButtonElement, AppIconProps>(
  function AppIcon({ app, selected, openOnSingleClick, onSelect, onOpen }, ref) {
    const disabled = app.url === null
    const opensInNewTab = !disabled && !app.sameTab

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        title={`${app.name} — ${app.description}`}
        className={cn(
          "group flex w-24 flex-col items-center gap-1.5 rounded-lg p-2 outline-none transition-colors sm:w-28",
          selected ? "bg-accent" : "hover:bg-accent/60",
          "focus-visible:ring-2 focus-visible:ring-primary",
          disabled && "opacity-60"
        )}
        onClick={() => {
          onSelect()
          if (openOnSingleClick && !disabled) onOpen()
        }}
        onDoubleClick={() => {
          if (!disabled) onOpen()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect()
            if (!disabled) onOpen()
          }
        }}
      >
        <span
          className={cn(
            "relative grid size-14 place-items-center overflow-hidden rounded-[22%] border border-border bg-card shadow-sm transition-transform sm:size-16",
            !disabled && "group-hover:-translate-y-0.5 group-active:scale-95"
          )}
          aria-hidden
        >
          <Image
            src={app.icon}
            alt=""
            sizes="64px"
            className="size-full object-cover"
            priority
          />
          {opensInNewTab ? (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-background/90 text-muted-foreground ring-1 ring-border backdrop-blur">
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
            </span>
          ) : null}
          {/* 상태 점 — 기능적 색 코딩 (규칙 24) */}
          <span
            className={cn(
              "absolute bottom-1 left-1 size-2 rounded-full ring-2 ring-card",
              STATUS_DOT[app.status]
            )}
          />
        </span>

        <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
          {app.name}
        </span>

        {app.status !== "live" ? (
          <span className="rounded-full bg-muted px-1.5 py-px text-[9px] leading-tight font-medium text-muted-foreground">
            {STATUS_LABEL[app.status]}
          </span>
        ) : null}
      </button>
    )
  }
)
