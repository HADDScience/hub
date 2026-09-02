"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon, Logout01Icon } from "@hugeicons/core-free-icons"

import { Avatar } from "@/components/avatar"
import { useAuth } from "@/components/auth/auth-gate"
import { cn } from "@/lib/utils"

/** 우상단 사용자 메뉴 — 계정 설정 링크와 로그아웃을 담은 드롭다운. */
export function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="사용자 메뉴"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 rounded-md py-0.5 pr-1.5 pl-0.5 transition-colors outline-none",
          "hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary",
          open && "bg-accent"
        )}
      >
        <span className="grid size-6 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-border">
          <Avatar url={user.avatarUrl} name={user.name} />
        </span>
        <span className="hidden max-w-28 truncate text-[11px] font-medium sm:inline">
          {user.name}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[var(--z-popover)] mt-1.5 w-56 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
            <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-border">
              <Avatar url={user.avatarUrl} name={user.name} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12.5px] font-semibold">
                {user.name}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {user.email ?? "이메일 없음 · 카카오"}
              </span>
            </span>
          </div>

          <div className="p-1">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[12.5px] transition-colors outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <HugeiconsIcon
                icon={Settings01Icon}
                size={16}
                className="text-muted-foreground"
                aria-hidden
              />
              계정 설정
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                signOut()
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] text-destructive transition-colors outline-none hover:bg-destructive/10 focus-visible:bg-destructive/10"
            >
              <HugeiconsIcon icon={Logout01Icon} size={16} aria-hidden />
              로그아웃
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
