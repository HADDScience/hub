"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * 소셜 아바타(외부 URL) + 이니셜 폴백.
 * 정적 배포라 next/image 대신 plain img 를 쓰고, 로드 실패 시 이니셜로 대체한다.
 * 원형 마스킹·크기는 부모(고정 크기 + overflow-hidden rounded-full)가 담당한다.
 */
export function Avatar({
  url,
  name,
  className,
}: {
  url: string | null
  name: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const initial = name.trim().charAt(0) || "U"

  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={cn("size-full object-cover", className)}
      />
    )
  }
  return (
    <span
      className={cn(
        "grid size-full place-items-center bg-primary/15 font-semibold text-primary",
        className
      )}
      aria-hidden
    >
      {initial}
    </span>
  )
}
