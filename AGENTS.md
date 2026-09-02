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
- GitHub Pages 정적 배포(`output: "export"`)다. 서버 액션·라우트 핸들러·ISR 은 쓸 수 없다.
- 커밋 전에 `pnpm lint`(경고 포함 0)와 `pnpm build` 가 통과해야 한다.

## 인증 구조 문서

허브의 로그인은 Omnis 가 발급하는 SSO 토큰을 받는다. 구조·불변식·함정은
**Omnis 저장소**(`~/omnis-deploy`)의 `mydocs/` 에 있다.

| 문서 | 무엇 |
|---|---|
| `mydocs/tech/auth-architecture.md` | 사내 도구 인증 구조. 불변식 5개 |
| `mydocs/troubleshootings/supabase-limits.md` | 왜 Supabase 를 걷었나 |
| `mydocs/manual/ai-pairing.md` | 작업 절차·검증 기준 |

허브 쪽 진입점은 `lib/omnis-auth.ts` 와 `components/auth/auth-gate.tsx` 다.

**이 저장소는 `main` 푸시가 곧 전사 배포다** (GitHub Actions → Pages).
브랜치에서 작업하고 확인한 뒤 머지한다.
