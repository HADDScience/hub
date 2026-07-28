# HADD SCIENCE 툴 런처 (hub)

HADD SCIENCE 내부 도구로 들어가는 입구입니다. 가상 데스크톱 화면에 앱 아이콘을 놓고,
더블클릭하면 해당 도구로 이동합니다.

**배포 URL — <https://haddscience.github.io/hub/>**

## 조작

| 동작 | 방법 |
| --- | --- |
| 앱 열기 | 아이콘 **더블클릭** (터치 기기에서는 **한 번 탭**) |
| 선택 이동 | 방향키 ←→↑↓ (그리드 열 수를 실제 배치에서 읽어 위아래로도 이동) |
| 실행 | Enter 또는 Space |
| 보기 전환 | 하단 우측 `목록으로 보기` / `아이콘으로 보기` |
| 테마 | 상단 우측 ☾ / ☀ |

아이콘 우상단의 `↗` 표시는 **새 탭**에서 열리는 앱이라는 뜻입니다(다른 도메인에 배포된 앱).
같은 `haddscience.github.io` 안의 앱은 현재 탭에서 열려 뒤로가기로 런처에 돌아올 수 있습니다.

## 앱 추가하기

`lib/apps.ts` 의 `APPS` 배열에 항목 하나만 추가하면 됩니다. 그리드·목록·상태 배지가 모두 따라옵니다.

```ts
{
  id: "crm",
  name: "CRM",
  description: "고객 관리",
  url: "https://haddscience.github.io/crm/",  // 제작 전이면 null
  status: "live",                              // live | coming | maintenance
  glyph: "◎",                                  // 아이콘 글리프
  tint: "from-slate-400 to-slate-600",         // 아이콘 배경 그라디언트
  sameTab: true,                               // 같은 오리진이면 현재 탭에서 열기
}
```

`url` 이 `null` 이면 실행되지 않고 "제작 예정" 배지가 붙습니다.

## 현재 등록된 앱

| 앱 | 주소 | 상태 |
| --- | --- | --- |
| omnis | https://omnis-omega.vercel.app | 운영중 |
| ip-platform | https://haddscience.github.io/ip-platform/ | 운영중 |
| raman-diff | https://haddscience.github.io/raman-g-peak-diff/ | 운영중 |
| CRM | — | 제작 예정 |

## 로컬 실행

```bash
pnpm install
pnpm dev          # http://localhost:3000/hub
pnpm build        # 정적 내보내기 → out/
pnpm lint
pnpm typecheck
```

`basePath` 가 `/hub` 이므로 개발 서버에서도 경로 뒤에 `/hub` 를 붙여야 합니다.

## 배포

`main` 에 push 하면 GitHub Actions 가 빌드해 GitHub Pages 로 배포합니다
(`.github/workflows/deploy.yml`). Next.js 정적 내보내기(`output: "export"`)라 서버가 없습니다.

## 로그인 (예정)

Supabase Auth(Google·카카오)를 붙여 허브에서 한 번 로그인하면 같은 오리진의 앱
(`ip-platform`, 추후 `CRM`)은 세션을 그대로 공유하도록 할 예정입니다.
omnis 는 다른 도메인(vercel.app)이고 NextAuth 를 쓰고 있어 세션이 자동 공유되지 않습니다 —
소셜 로그인 제공자 세션이 살아 있어 리다이렉트 한 번으로 통과되는 수준입니다.

## 기술 스택

Next.js 16 (App Router, static export) · React 19 · TypeScript(strict) · Tailwind CSS v4 ·
shadcn/ui (Base UI) · pnpm
