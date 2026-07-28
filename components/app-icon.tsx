"use client"

import { forwardRef } from "react"

import { cn } from "@/lib/utils"
import { STATUS_LABEL, type LauncherApp } from "@/lib/apps"

interface AppIconProps {
  app: LauncherApp
  selected: boolean
  /** 터치 기기에서는 단일 탭으로 실행한다 */
  openOnSingleClick: boolean
  onSelect: () => void
  onOpen: () => void
}

export const AppIcon = forwardRef<HTMLButtonElement, AppIconProps>(
  function AppIcon(
    { app, selected, openOnSingleClick, onSelect, onOpen },
    ref
  ) {
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
          selected ? "bg-foreground/10" : "hover:bg-foreground/5",
          "focus-visible:ring-2 focus-visible:ring-primary",
          disabled && "opacity-55"
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
            "relative grid size-14 place-items-center rounded-[18px] bg-gradient-to-br text-2xl text-white shadow-sm ring-1 ring-black/10 transition-transform sm:size-16 sm:text-[28px]",
            app.tint,
            !disabled && "group-hover:-translate-y-0.5 group-active:scale-95"
          )}
          aria-hidden
        >
          {app.glyph}
          {opensInNewTab ? (
            <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-background text-[9px] leading-none text-muted-foreground ring-1 ring-foreground/15">
              ↗
            </span>
          ) : null}
        </span>

        <span className="w-full truncate text-center text-[11px] font-medium">
          {app.name}
        </span>

        {app.status !== "live" ? (
          <span className="rounded-full bg-foreground/10 px-1.5 py-px text-[9px] leading-tight text-muted-foreground">
            {STATUS_LABEL[app.status]}
          </span>
        ) : null}
      </button>
    )
  }
)
