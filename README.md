# HADD SCIENCE 툴 런처 (hub)

HADD SCIENCE 내부 도구로 들어가는 입구입니다. 가상 데스크톱 화면에 앱 아이콘을 놓고,
더블클릭하면 해당 도구로 이동합니다.

**배포 URL — <https://hub.haddscience.com>**

2026-09-18 도메인 전환 전에는 홈페이지 아래 `/hub` 였습니다. 지금은 자기 서브도메인을
쓰므로 경로 접두어가 없습니다.

## 조작

| 동작 | 방법 |
| --- | --- |
| 앱 열기 | 아이콘 **더블클릭** (터치 기기에서는 **한 번 탭**) |
| 선택 이동 | 방향키 ←→↑↓ (그리드 열 수를 실제 배치에서 읽어 위아래로도 이동) |
| 실행 | Enter 또는 Space |
| 보기 전환 | 하단 우측 `목록으로 보기` / `아이콘으로 보기` |
| 테마 | 상단 우측 ☾ / ☀ |

모든 앱은 **새 탭**에서 열립니다. 허브는 그대로 남아 있으니 탭을 오가며 여러 도구를 함께 쓸 수 있습니다.

## 앱 추가하기

`lib/apps.ts` 의 `APPS` 배열에 항목 하나만 추가하면 됩니다. 그리드·목록·상태 배지가 모두 따라옵니다.

```ts
{
  id: "crm",
  name: "CRM",
  description: "고객 관리",
  url: "https://haddscience.com/crm/",  // 제작 전이면 null
  status: "live",                        // live | coming | maintenance
  glyph: "◎",                            // 아이콘 글리프
  tint: "from-slate-400 to-slate-600",   // 아이콘 배경 그라디언트
}
```

`url` 이 `null` 이면 실행되지 않고 "제작 예정" 배지가 붙습니다.

여기 오는 것은 **Omnis 안으로 들어갈 수 없는 앱**뿐입니다. 사내 자원 관리는 Omnis 한 곳으로
모으는 중이라, 그런 기능은 Omnis 의 메뉴 항목이지 별도 앱이 아닙니다 (`lib/apps.ts` 주석).

## 현재 등록된 앱

| 앱 | 주소 | 상태 |
| --- | --- | --- |
| Omnis | https://haddscience.com/omnis | 운영중 |
| 콘텐츠 관리 | https://haddscience.com/admin/ | 운영중 |
| AI Alzheimer | https://haddscience.github.io/raman-g-peak-diff/ | 운영중 |
| AI ECM | — | 점검중 (로그인 연동 작업) |

## 로컬 실행

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # 정적 내보내기 → out/
pnpm lint
pnpm typecheck
pnpm test:auth    # 로그아웃 시나리오 (Playwright, 3011 포트)
```

## 배포

Vercel 프로젝트 `hadd-hub` 가 이 저장소의 `main` 을 봅니다 — **푸시하면 그대로 배포**되고,
다른 브랜치는 프리뷰 주소를 받습니다. Next.js 정적 내보내기(`output: "export"`)라 서버가
없습니다. 환경변수와 Omnis 등록의 함정은 `AGENTS.md` 에 있습니다.

## 로그인

HADD 계정(Omnis 가 발급하는 SSO 토큰)으로 들어갑니다. 구글·카카오는 그 계정에 연결된
로그인 수단이라, 허브는 소셜 제공자를 하나도 알지 못합니다.

```
허브 → Omnis /sso/authorize?app=hub-com → 돌아올 때 #sso=<1회용 표>
     → /api/sso/redeem → 8시간 세션 토큰 · 새로고침마다 /api/sso/verify 로 재확인
```

허브는 이제 Omnis 와 **다른 오리진**입니다. redeem·verify 는 CORS 요청이고, 로그아웃은
Omnis 의 로그아웃 화면으로 이동해 끝냅니다(다른 오리진의 HttpOnly 쿠키는 만질 수 없습니다).
자세한 내용은 `docs/hub-signout.md` 와 `lib/omnis-auth.ts` 주석에 있습니다.

### 허브가 유일한 로그인 화면입니다

툴은 **자체 로그인 화면을 두지 않습니다.** 로그아웃 상태면 허브로 보내고,
허브가 로그인을 마친 뒤 원래 자리로 돌려보냅니다.

```
https://hub.haddscience.com/?next=/some/path/
```

- `next` 는 **허브와 같은 오리진의 절대 경로**만 받습니다. `//…`, `/\…` 는 오픈 리다이렉트라
  무시합니다 (`lib/next-target.ts`). 서브도메인으로 옮긴 뒤로 허브와 오리진을 같이 쓰는 툴은
  없어, 다른 오리진의 툴을 이 방식으로 되돌려보내려면 허용 오리진 목록이 따로 필요합니다.
- 받은 즉시 sessionStorage 로 옮기고 주소창에서 지웁니다. 로그인 왕복 동안 주소가
  갈아치워지기 때문입니다.
- 이미 로그인한 상태로 `?next=` 를 달고 들어와도 데스크톱을 거치지 않고 바로 돌려보냅니다.

## 기술 스택

Next.js 16 (App Router, static export) · React 19 · TypeScript(strict) · Tailwind CSS v4 ·
shadcn/ui (Base UI) · pnpm
