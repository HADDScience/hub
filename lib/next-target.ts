"use client"

/**
 * 다른 툴에서 넘어온 복귀 지점(`?next=`)을 다룬다.
 *
 * 로그인 화면을 허브 하나로 모으기 위한 장치다. 각 툴(ip-platform 등)은 자체
 * 로그인 화면을 두지 않고, 로그아웃 상태면 `/hub/?next=<돌아올 경로>` 로 보내기만
 * 한다. 허브는 로그인이 끝나면 그 경로로 되돌려보낸다.
 *
 * 복귀 지점을 URL 이 아니라 sessionStorage 에 맡기는 이유:
 * OAuth 왕복 동안 주소창은 프로바이더와 Supabase 가 갈아치우므로 `?next=` 가
 * 그대로 살아남는다고 볼 수 없다. redirectTo 에 얹어 보내는 방법도 있지만 그러면
 * Supabase 콘솔의 Redirect URLs 에 쿼리까지 허용하는 와일드카드를 등록해야 한다.
 * sessionStorage 는 같은 탭·같은 오리진에서 왕복을 견디므로 추가 설정이 없다.
 */

const KEY = "hadd.hub-next"

/**
 * 같은 오리진의 절대 경로만 허용한다(오픈 리다이렉트 방지).
 * `//evil.com` 과 `/\evil.com` 은 브라우저가 다른 오리진으로 해석하므로 막는다.
 */
function isSafePath(value: string): boolean {
  return (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.startsWith("/\\")
  )
}

/**
 * 주소의 `?next=` 를 sessionStorage 로 옮기고 주소창에서 지운다.
 * 세션을 확인하기 전에 불러야 한다.
 */
export function captureNextTarget(): void {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  const next = url.searchParams.get("next")
  if (next === null) return

  // 주소창에 남겨 두면 새로고침·북마크마다 복귀가 되살아난다. code 등 다른
  // 파라미터는 Supabase 가 쓰므로 next 만 걷어낸다.
  url.searchParams.delete("next")
  window.history.replaceState(null, "", url.toString())

  if (!isSafePath(next)) return
  try {
    window.sessionStorage.setItem(KEY, next)
  } catch {
    /* 시크릿 모드 등 — 복귀를 포기하고 허브에 머문다 */
  }
}

/** 저장된 복귀 지점을 꺼내면서 지운다. 없으면 null. */
export function takeNextTarget(): string | null {
  if (typeof window === "undefined") return null
  try {
    const value = window.sessionStorage.getItem(KEY)
    if (value === null) return null
    window.sessionStorage.removeItem(KEY)
    return isSafePath(value) ? value : null
  } catch {
    return null
  }
}
