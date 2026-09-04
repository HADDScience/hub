"use client"

/**
 * Omnis 를 발급자로 삼는 허브 로그인.
 *
 * 예전에는 Supabase 세션을 localStorage 로 공유했다. 그 방식은 **같은 오리진**
 * 안에서만 성립한다 — 허브와 ip-platform 은 둘 다 haddscience.github.io 라 통했지만,
 * Omnis 는 Vercel 이라 오리진이 달라 같은 방법으로 넓힐 수 없었다.
 *
 * 그래서 계정의 주인을 Omnis 자체계정 하나로 모으고, Omnis 가 짧은 수명의 서명
 * 토큰을 발급하게 했다. 구글·카카오는 Omnis 안에서 고르는 "그 계정으로 들어오는
 * 또 하나의 문"이라, 허브는 소셜 제공자를 하나도 알 필요가 없다.
 *
 * 흐름:
 *   1. startSignIn()  → https://omnis-hadd.vercel.app/sso/authorize?app=hub&next=/hub/
 *   2. Omnis 가 로그인을 확인하고 /hub/#sso=<grant> 로 돌려보낸다 (60초·1회용)
 *   3. takeGrantFromHash() → redeemGrant() → 8시간짜리 세션 토큰 + 프로필
 *   4. 새로고침마다 verifyStoredSession() 으로 아직 유효한지 되묻는다
 *
 * 토큰이 프래그먼트(#)로 오는 이유: 프래그먼트는 서버로 전송되지 않아 GitHub Pages
 * 접근 로그에도 Referer 에도 남지 않는다. 그래서 받자마자 주소창에서도 지운다.
 *
 * 정적 앱이라 비밀키를 들 수 없다. 서명 검증은 Omnis 의 /api/sso/verify 가 대신
 * 하는데, 이게 오히려 낫다 — 퇴사 처리(isActive=false)가 토큰 수명을 기다리지 않고
 * 다음 새로고침에 바로 먹힌다.
 *
 * 이름에 관하여: 이 파일은 발급자를 "Omnis" 라고 부른다. 그게 실제로 토큰을 발급하는
 * 배포이기 때문이고, 식별자를 바꾸면 어느 서버 이야기인지 흐려진다. 반면 **화면에는
 * 그 이름이 나가지 않는다** — 사용자에게는 「HADD 계정」이다. 계정은 회사 것이고
 * Omnis 는 그 계정으로 열리는 제품 중 하나다. 아래 messageFor 의 문장들이 "Omnis"
 * 대신 "인증 서버"라고 쓰는 이유다.
 */

const OMNIS_ORIGIN = process.env.NEXT_PUBLIC_OMNIS_URL ?? "https://omnis-hadd.vercel.app"

/** Omnis 의 앱 화이트리스트에 등록된 id. 토큰의 audience 이기도 하다. */
const APP_ID = process.env.NEXT_PUBLIC_SSO_APP_ID ?? "hub"

/** next.config.ts 의 basePath 와 같아야 한다. */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "/hub"

/**
 * 세션 저장 키에 앱 id 를 넣는다.
 *
 * 허브와 ip-platform 은 같은 오리진이라 localStorage 를 통째로 나눠 쓴다. 그런데
 * Omnis 가 주는 토큰은 audience 가 앱별로 다르다 — 허브 토큰은 ip-platform 에서
 * 검증에 실패한다. 한 칸에 같이 넣으면 서로 덮어써서 둘 다 로그인이 풀린다.
 *
 * 앱이 각자 자기 표를 받아야 하지만, 그 왕복은 사람 눈에 보이지 않는다.
 * Omnis 쿠키가 살아 있으면 /sso/authorize 가 곧바로 되돌려보내기 때문이다.
 */
const STORAGE_KEY = `hadd.sso.session.${APP_ID}`

export interface OmnisUser {
  id: string
  name: string
  email: string | null
  /** Omnis 의 역할 — "ADMIN" | "MEMBER" */
  role: string
}

export interface OmnisSession {
  token: string
  /** epoch ms */
  expiresAt: number
  user: OmnisUser
}

// ─── 로그인 시작 ────────────────────────────────────────────────────

/**
 * Omnis 로그인 화면으로 보낸다.
 *
 * 돌아올 자리로는 이 앱 안쪽 경로만 넘긴다. 다른 툴로 돌아가는 일은 여기서 하지
 * 않는다 — 그건 허브로 되돌아온 뒤 lib/next-target.ts 가 맡는다. Omnis 쪽에서도
 * 이 값이 허브 basePath 밖이면 거부하므로, 넘겨 봐야 400 이 날 뿐이다.
 */
export function startSignIn(returnPath: string = `${BASE_PATH}/`): void {
  if (typeof window === "undefined") return
  const url = new URL("/sso/authorize", OMNIS_ORIGIN)
  url.searchParams.set("app", APP_ID)
  url.searchParams.set("next", returnPath)
  window.location.assign(url.toString())
}

/** Omnis 의 계정 설정 — 소셜 연결·비밀번호는 전부 저기서 관리한다. */
export function omnisSettingsUrl(): string {
  return `${OMNIS_ORIGIN}/settings`
}

// ─── 돌아온 토큰 집어내기 ────────────────────────────────────────────

/**
 * 주소의 `#sso=` 를 꺼내면서 주소창에서 지운다. 세션을 확인하기 전에 부른다.
 *
 * 지우지 않으면 새로고침·북마크·화면 공유에 1회용 표가 그대로 남는다.
 * 이미 쓴 표라 재사용은 Omnis 가 막지만, 굳이 남겨 둘 이유가 없다.
 */
export function takeGrantFromHash(): string | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash
  if (!hash.startsWith("#")) return null

  const params = new URLSearchParams(hash.slice(1))
  const grant = params.get("sso")
  if (!grant) return null

  params.delete("sso")
  const rest = params.toString()
  window.history.replaceState(
    null,
    "",
    `${window.location.pathname}${window.location.search}${rest ? `#${rest}` : ""}`
  )
  return grant
}

// ─── Omnis 와 주고받기 ──────────────────────────────────────────────

export class OmnisAuthError extends Error {
  constructor(readonly code: string, message: string) {
    super(message)
  }
}

/** 서버가 주는 error 코드를 사람이 읽을 문장으로. 전부 "다시 시도"로는 안 풀린다. */
function messageFor(code: string): string {
  switch (code) {
    case "grant_already_used":
      return "이미 사용된 로그인 링크입니다. 다시 로그인해 주세요."
    case "invalid_grant":
      return "로그인 링크가 만료되었습니다. 다시 로그인해 주세요."
    case "account_inactive":
      return "이 계정은 비활성 상태입니다. 관리자에게 문의해 주세요."
    case "origin_not_allowed":
    case "unknown_app":
      return "이 주소는 인증 서버에 등록돼 있지 않습니다. 관리자에게 알려주세요."
    case "sso_disabled":
      return "인증 서버에 SSO 설정이 없습니다. 관리자에게 알려주세요."
    default:
      return "로그인을 마치지 못했습니다. 다시 시도해 주세요."
  }
}

async function post(path: string, token: string): Promise<Response> {
  return fetch(`${OMNIS_ORIGIN}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, app: APP_ID }),
  })
}

/** 1회용 표를 8시간짜리 세션으로 바꾼다. 실패하면 OmnisAuthError. */
export async function redeemGrant(grant: string): Promise<OmnisSession> {
  let res: Response
  try {
    res = await post("/api/sso/redeem", grant)
  } catch {
    throw new OmnisAuthError("network", "인증 서버에 연결하지 못했습니다. 네트워크를 확인해 주세요.")
  }

  const body = (await res.json().catch(() => null)) as
    | { token?: string; expiresAt?: number; user?: OmnisUser; error?: string }
    | null

  if (!res.ok || !body?.token || !body.user || !body.expiresAt) {
    const code = body?.error ?? "unknown"
    throw new OmnisAuthError(code, messageFor(code))
  }

  return { token: body.token, expiresAt: body.expiresAt, user: body.user }
}

export type VerifyOutcome =
  /** 살아 있다. user 는 Omnis 가 방금 DB 에서 읽은 최신값이다. */
  | { kind: "ok"; user: OmnisUser }
  /** 서버가 분명히 거부했다 — 저장된 세션을 지워야 한다. */
  | { kind: "rejected" }
  /** 판단 불가(네트워크·서버 오류). 저장된 만료 시각을 믿고 버틴다. */
  | { kind: "unknown" }

/**
 * 저장된 세션이 아직 유효한지 Omnis 에 되묻는다.
 *
 * 만료 시각만 스스로 보고 넘어가면 퇴사·계정 삭제가 토큰 수명(8시간)만큼 늦게
 * 먹힌다. 반대로 네트워크가 끊겼다고 로그아웃시키면, 데이터 경계도 아닌 런처가
 * 인터넷 한 번 끊길 때마다 사람을 쫓아낸다. 그래서 "거부"와 "판단 불가"를 나눈다.
 */
export async function verifyStoredSession(token: string): Promise<VerifyOutcome> {
  let res: Response
  try {
    res = await post("/api/sso/verify", token)
  } catch {
    return { kind: "unknown" }
  }

  if (res.status === 401 || res.status === 403) return { kind: "rejected" }
  if (!res.ok) return { kind: "unknown" }

  const body = (await res.json().catch(() => null)) as { user?: OmnisUser } | null
  if (!body?.user) return { kind: "unknown" }
  return { kind: "ok", user: body.user }
}

// ─── 저장 ───────────────────────────────────────────────────────────

export function readStoredSession(): OmnisSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<OmnisSession>
    if (
      typeof parsed.token !== "string" ||
      typeof parsed.expiresAt !== "number" ||
      !parsed.user?.id
    ) {
      return null
    }
    return parsed as OmnisSession
  } catch {
    // 시크릿 모드·저장소 차단·깨진 JSON — 전부 "세션 없음"으로 본다
    return null
  }
}

export function storeSession(session: OmnisSession): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // 저장하지 못해도 이번 방문은 그대로 쓸 수 있다. 새로고침하면 다시 로그인한다.
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* 지울 수 없으면 만료를 기다리는 수밖에 없다 */
  }
}
