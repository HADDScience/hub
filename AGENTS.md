<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# HADD 허브 — 작업 규약

- 허브는 사내 도구 전체의 **유일한 로그인 화면**이다. 같은 오리진의 툴은 자체 로그인
  화면을 두지 않고 `/hub/?next=<돌아올 경로>` 로 보낸다. 이 계약(`lib/next-target.ts`)을
  깨면 ip-platform 이 로그인 화면 없이 허공에 뜬다.
- `next` 는 같은 오리진의 절대 경로만 받는다. 검증(`isSafePath`)을 우회하는 값을
  통과시키면 그대로 오픈 리다이렉트가 된다.
- 정적 export(`output: "export"`)다. 서버 액션·라우트 핸들러·ISR 은 쓸 수 없다.
- 커밋 전에 `pnpm lint`(경고 포함 0)와 `pnpm build` 가 통과해야 한다.

## 배포

Vercel 프로젝트 `hadd-hub` 가 이 저장소의 `main` 을 보고 있다. **푸시하면 그대로
배포된다** — 다른 브랜치와 PR 은 프리뷰 주소를 받는다. GitHub Actions 는 없다.

사용자가 보는 주소는 `haddscience.vercel.app/hub/` 다. 허브가 그 도메인의 프로젝트인
것은 아니고, 홈페이지(`HADDScience.github.io` 저장소)의 `vercel.json` 이 `/hub/*` 를
이 프로젝트로 rewrite 한다. **rewrite 이지 redirect 가 아니다** — 이게 뒤집히면
오리진이 바뀌면서 Omnis 의 `hub-vercel` 등록(origin `haddscience.vercel.app`)과
어긋나 로그인이 통째로 막히고, `/hub/?next=` 로 넘어오는 툴들도 같이 끊긴다.

프리뷰 배포는 오리진이 달라 로그인이 안 된다(Omnis 가 등록된 오리진으로만 토큰을
돌려보낸다). 프리뷰로는 화면만 보고, 로그인은 `main` 배포에서 확인한다.

빌드 시 번들에 박히는 값은 Vercel 프로젝트의 환경변수 세 개다 — 비밀은 없다.

| 이름 | 값 |
|---|---|
| `NEXT_PUBLIC_OMNIS_URL` | `https://haddscience.vercel.app/omnis` |
| `NEXT_PUBLIC_SSO_APP_ID` | `hub-vercel` |
| `NEXT_PUBLIC_BASE_PATH` | `/hub` |

## 인증 구조 문서

허브의 로그인은 Omnis 가 발급하는 SSO 토큰을 받는다. 구조·불변식·함정은
**Omnis 저장소**(`~/omnis-deploy`)의 `mydocs/` 에 있다.

| 문서 | 무엇 |
|---|---|
| `mydocs/tech/auth-architecture.md` | 사내 도구 인증 구조. 불변식 5개 |
| `mydocs/troubleshootings/supabase-limits.md` | 왜 Supabase 를 걷었나 |
| `mydocs/manual/ai-pairing.md` | 작업 절차·검증 기준 |

허브 쪽 진입점은 `lib/omnis-auth.ts` 와 `components/auth/auth-gate.tsx` 다.

**이 저장소는 `main` 푸시가 곧 전사 배포다** (Vercel `hadd-hub`).
브랜치에서 작업하고 프리뷰로 확인한 뒤 머지한다.
