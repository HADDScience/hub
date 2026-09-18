<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HADD 허브 — 작업 규약

- 허브는 사내 도구 전체의 **유일한 로그인 화면**이다. 툴은 자체 로그인 화면을 두지 않고
  `https://hub.haddscience.com/?next=<돌아올 경로>` 로 보낸다. 이 계약(`lib/next-target.ts`)을
  깨면 그 툴들이 로그인 화면 없이 허공에 뜬다.
- `next` 는 **허브와 같은 오리진의 절대 경로**만 받는다. 검증(`isSafePath`)을 우회하는 값을
  통과시키면 그대로 오픈 리다이렉트가 된다. 서브도메인으로 옮긴 뒤(2026-09-18)로 허브와
  오리진을 같이 쓰는 툴은 없다 — 다른 오리진의 툴을 이 방식으로 되돌려보내려면 경로가 아니라
  **허용 오리진 목록**을 두는 설계가 따로 필요하다. 지금은 그런 툴이 없다.
- 정적 export(`output: "export"`)다. 서버 액션·라우트 핸들러·ISR 은 쓸 수 없다.
- 커밋 전에 `pnpm lint`(경고 포함 0)와 `pnpm build` 가 통과해야 한다.

## 배포

Vercel 프로젝트 `hadd-hub` 가 이 저장소의 `main` 을 보고 있다. **푸시하면 그대로
배포된다** — 다른 브랜치와 PR 은 프리뷰 주소를 받는다. GitHub Actions 는 없다.

사용자가 보는 주소는 **`https://hub.haddscience.com`** 이다. 도메인이 Vercel 네임서버
(`ns1/ns2.vercel-dns.com`)에 있어 이 서브도메인은 프로젝트에 붙은 도메인 그대로다.

2026-09-18 이전에는 홈페이지(`hadd-website`)의 `/hub` 아래에 rewrite 로 얹혀 살았고,
그래서 `basePath` 가 `/hub` 였다. 지금은 자기 오리진을 쓰므로 접두어가 없다. 옛
`haddscience.com/hub/…` 는 홈페이지가 308 로 이 서브도메인에 넘긴다(hadd-website
2d874a1). 쿼리를 유지하므로 다른 툴이 들고 있는 `?next=` 도 그대로 살아서 넘어온다.

프리뷰 배포는 오리진이 달라 로그인이 안 된다(Omnis 가 등록된 오리진으로만 토큰을
돌려보낸다). 프리뷰로는 화면만 보고, 로그인은 `main` 배포에서 확인한다.

빌드 시 번들에 박히는 값은 Vercel 프로젝트의 환경변수다 — 비밀은 없다.

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_OMNIS_URL` | `https://omnis.haddscience.com` (경로 접두어 없음) |
| `NEXT_PUBLIC_SSO_APP_ID` | `hub-com` (등록 밖 오리진용 폴백) |

`NEXT_PUBLIC_BASE_PATH` 는 **설정하지 않는다.** 남아 있으면 `lib/omnis-auth.ts` 의
`BASE_PATH` 가 되살아나 `?next=/hub/` 를 Omnis 에 보내는데, Omnis 의 `hub-com` 등록은
basePath 가 `""` 라 거부한다 — 로그인이 통째로 막힌다. (옛 `github.io/hub` 배포를 다시
올릴 일이 있을 때만 쓰는 탈출구다.)

## Omnis 와의 계약

허브의 앱 id 는 접속 오리진을 보고 고른다(`APP_ID_BY_ORIGIN`). 새 주소는
`hub-com` 이고, Omnis(`~/work/omnis-local` 의 `lib/sso.ts`)에 origin
`https://hub.haddscience.com` · basePath `""` 로 등록돼 있어야 한다. 한쪽만 바뀌면
`origin_not_allowed` 로 로그인이 막힌다.

Omnis 와 오리진이 다르므로 `/api/sso/redeem`·`/api/sso/verify` 는 CORS 요청이다
(Omnis 가 등록 오리진에만 `Access-Control-Allow-Origin` 을 준다). 로그아웃도 같은 이유로
Omnis 의 로그아웃 화면으로 이동해서 끝낸다 — 다른 오리진의 HttpOnly 쿠키는 만질 수 없다.

## 인증 구조 문서

허브의 로그인은 Omnis 가 발급하는 SSO 토큰을 받는다. 구조·불변식·함정은
**Omnis 저장소**(`~/work/omnis-local`)의 `mydocs/` 에 있다.

| 문서 | 무엇 |
|---|---|
| `mydocs/tech/auth-architecture.md` | 사내 도구 인증 구조. 불변식 5개 |
| `mydocs/troubleshootings/supabase-limits.md` | 왜 Supabase 를 걷었나 |
| `mydocs/manual/ai-pairing.md` | 작업 절차·검증 기준 |

허브 쪽 진입점은 `lib/omnis-auth.ts` 와 `components/auth/auth-gate.tsx` 다.

**이 저장소는 `main` 푸시가 곧 전사 배포다** (Vercel `hadd-hub`).
브랜치에서 작업하고 프리뷰로 확인한 뒤 머지한다.
