"use client"

import { useSyncExternalStore } from "react"

// ---------------------------------------------------------------------------
// 시계 (KST)
// ---------------------------------------------------------------------------

const timeFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const dateFormat = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  weekday: "short",
})

let clockBucket = -1
let clockValue = { time: "--:--", date: "" }

function clockSubscribe(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 1000)
  return () => window.clearInterval(id)
}

/** getSnapshot 은 같은 초 안에서 같은 참조를 돌려줘야 무한 렌더를 피한다. */
function clockSnapshot(): { time: string; date: string } {
  const bucket = Math.floor(Date.now() / 1000)
  if (bucket !== clockBucket) {
    clockBucket = bucket
    const now = new Date()
    clockValue = { time: timeFormat.format(now), date: dateFormat.format(now) }
  }
  return clockValue
}

const CLOCK_PLACEHOLDER = { time: "--:--", date: "" }

function clockServerSnapshot(): { time: string; date: string } {
  return CLOCK_PLACEHOLDER
}

export function useClock() {
  return useSyncExternalStore(clockSubscribe, clockSnapshot, clockServerSnapshot)
}

// ---------------------------------------------------------------------------
// 포인터 종류 — 터치 기기에서는 더블클릭 대신 단일 탭으로 연다
// ---------------------------------------------------------------------------

function coarseSubscribe(onChange: () => void): () => void {
  const mql = window.matchMedia("(pointer: coarse)")
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function coarseSnapshot(): boolean {
  return window.matchMedia("(pointer: coarse)").matches
}

function coarseServerSnapshot(): boolean {
  return false
}

export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    coarseSubscribe,
    coarseSnapshot,
    coarseServerSnapshot
  )
}
