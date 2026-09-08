"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const WelcomeTour = dynamic(() => import("./welcome-tour"), { ssr: false })
const SEEN_KEY = "hadd.hub.welcome.v1"

/** Mount authentication only after the introduction; never delay an SSO grant. */
export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<"loading" | "tour" | "app">("loading")

  useEffect(() => {
    const url = new URL(window.location.href)
    const returning =
      url.searchParams.has("next") ||
      new URLSearchParams(url.hash.slice(1)).has("sso")
    let seen = false
    try {
      seen = localStorage.getItem(SEEN_KEY) === "1"
    } catch {
      /* Storage is optional. */
    }
    const show = !returning && (url.searchParams.get("intro") === "1" || !seen)
    const frame = requestAnimationFrame(() => setPhase(show ? "tour" : "app"))
    return () => cancelAnimationFrame(frame)
  }, [])

  function finish() {
    try {
      localStorage.setItem(SEEN_KEY, "1")
    } catch {
      /* Continue without persistence. */
    }
    const url = new URL(window.location.href)
    url.searchParams.delete("intro")
    window.history.replaceState(null, "", url.toString())
    setPhase("app")
  }

  if (phase === "loading")
    return (
      <div
        className="welcome-loading"
        role="status"
        aria-label="허브 준비 중"
      />
    )
  if (phase === "tour") return <WelcomeTour onFinish={finish} />
  return children
}
