# Hub 첫 방문 안내 — 로컬 시안

재생: `/hub/?intro=1`. 화면 클릭/터치 또는 Enter/Space로 진행한다.
왼쪽 방향키는 이전 장면, Escape는 종료다. 빠른 연속 클릭은 800ms 동안 무시한다.

## 시각 기준

`../hadd-website/app/globals.css`의 HADD SCIENCE 디자인 토큰을 따른다.
네이비 #062E63, 블루 #0C4DA2, 스카이 #0095DA / #66C2EA,
옅은 표면 #EFF7FC / #D6EDF9, 보조 글자 #68727E.
오렌지 #F7941D와 마젠타 #E6007E는 작은 모서리 오브젝트에 한정한다.
사용자가 지정한 영화 같은 전환을 위해 이 안내에서만 부유·블러를 사용한다.
다른 앱의 일반 UI 토큰은 변경하지 않는다.

## 화면 캡처 출처 (2026-09-08)

`public/onboarding/*.webp`는 생성 이미지가 아닌 브라우저 화면 캡처다.

- omnis: `https://haddscience.vercel.app/omnis` 공개 서비스 소개 화면.
- alzheimer: `../raman-sso/index.html`을 로컬 브라우저에서 렌더했다.
  합성 스펙트럼 4개 농도 × Control/Fibril × 20개를 입력하고 단순 통계분석 화면을 캡처했다.
  실제 연구 데이터가 아니다. 인증 응답은 캡처 브라우저 안에서만 목킹했다.
- ecm: 로컬 `/hub/ecm/predict.html` 화면. 원본 산출물은 수정하지 않았다.
- admin: 홈페이지 콘텐츠 관리 UI에 예시 기사 1개를 넣은 화면.
  캡처 브라우저에서 인증 및 기사 API 응답을 목킹했다. 실제 API 쓰기는 수행하지 않았다.

계정 그림은 Google/카카오가 기존 HADD 자체계정에 연결되는 구조를 보여준다.
소셜 로그인만으로 새 계정이 생긴다고 설명하지 않는다.

## 기존 진입 계약

첫 방문은 브라우저 localStorage `hadd.hub.welcome.v1`로 기억한다.
`?next=` 또는 `#sso=`가 있으면 안내를 생략하고 기존 AuthGate를 바로 마운트한다.
안내에는 세션이나 데이터 접근 권한을 변경하는 코드가 없다.
