/**
 * 런처에 표시할 앱 목록.
 *
 * 여기 오는 것은 **Omnis 안으로 들어갈 수 없는 앱**뿐이다.
 *
 * 사내 자원 관리(업무·지식·지식재산권·고객)는 Omnis 한 곳으로 모으는 중이다.
 * 그런 기능은 Omnis 의 메뉴 항목이지 별도 앱이 아니므로 여기 오지 않는다.
 * 반대로 연구·분석 도구처럼 성격이 다르고 각자의 실행 환경을 가진 것들은
 * 합칠 수가 없다 — 그것들의 진입점이 이 화면이다.
 *
 * 그래서 항목이 늘어나는 것은 좋은 신호가 아니다. 새 기능을 여기 올리기 전에
 * "이건 Omnis 안 페이지가 될 수 없나"를 먼저 묻는다.
 *
 * 앱을 추가하려면 이 배열에 항목 하나만 넣으면 된다. 화면·정렬·상태 배지가 따라온다.
 * 아이콘은 assets/icons 에 두고 정적 import 한다 (basePath 처리를 Next 가 해준다).
 * 아이콘이 아직 없으면 비워도 된다 — 글리프가 대신 그려진다.
 */

import type { StaticImageData } from "next/image"

import omnisIcon from "@/assets/icons/omnis.png"
import ramanIcon from "@/assets/icons/raman-diff.png"

export type AppStatus = "live" | "coming" | "maintenance"

export interface LauncherApp {
  id: string
  /** 아이콘 아래 표시되는 이름 */
  name: string
  /** 한 줄 설명 — 목록 보기와 툴팁에 쓴다 */
  description: string
  /** 비어 있으면(제작 예정) 실행되지 않는다 */
  url: string | null
  status: AppStatus
  /** 앱 아이콘 이미지. 없으면 글리프로 그린다. */
  icon?: StaticImageData
  /** 이미지가 없거나 못 불러올 때 대신 쓰는 글리프 */
  glyph: string
  /** 글리프 폴백용 배경 그라디언트 (tailwind 클래스) */
  tint: string
}

export const APPS: LauncherApp[] = [
  {
    id: "omnis",
    name: "Omnis",
    description: "회사 자원 통합 관리 — 업무·지식·지식재산권·보고",
    url: "https://omnis.haddscience.com",
    status: "live",
    icon: omnisIcon,
    glyph: "◈",
    tint: "from-violet-500 to-indigo-600",
  },
  {
    // 회사 홈페이지(haddscience.com)의 소식·사진을 고치는 편집 화면.
    // Omnis 의 메뉴가 아니라 홈페이지 쪽 도구다 — 로그인만 Omnis 계정(website-admin-com)을
    // 쓰고, 고치는 대상은 대외 사이트다. Omnis 가 자기 서브도메인으로 나가면서(2026-09-18)
    // 이제 오리진도 서로 다르다.
    id: "site-admin",
    name: "콘텐츠 관리",
    description: "회사 홈페이지 소식·사진 편집",
    url: "https://haddscience.com/admin/",
    status: "live",
    glyph: "✎",
    tint: "from-sky-500 to-blue-600",
  },
  {
    id: "ai-alzheimer",
    name: "AI Alzheimer",
    description: "그래핀 기반 치매진단 — 라만 G-peak 분광 분석",
    url: "https://haddscience.github.io/raman-g-peak-diff/",
    status: "live",
    icon: ramanIcon,
    glyph: "∿",
    tint: "from-amber-500 to-orange-600",
  },
  {
    // 2026-09-22 에 자기 서브도메인으로 다시 열었다. 껐던 이유는 Tailscale
    // Funnel 의 인증이 "링크를 아는 사람은 다 통과"하는 공유 토큰 하나뿐이라
    // 미공개 데이터셋과 논문 원장이 그 링크와 함께 새어나갈 수 있었기 때문이다.
    // 지금은 서버가 Omnis 세션을 검증한다 — 로그인 없이 어느 경로를 열어도
    // 401 이고, 브라우저에는 Omnis 로그인으로 넘기는 브리지 화면만 나온다.
    //
    // 허브를 거치지 않고 Omnis 로 직접 간다(앱 id `ai-ecm-com`, origin
    // https://ecm.haddscience.com · basePath ""). 그래서 여기가 하는 일은
    // 주소를 내보내는 것뿐이다.
    id: "ai-ecm",
    name: "AI ECM",
    description: "장기별 ECM 조성 처방",
    url: "https://ecm.haddscience.com",
    status: "live",
    glyph: "⬡",
    tint: "from-teal-500 to-cyan-600",
  },
]

export const STATUS_LABEL: Record<AppStatus, string> = {
  live: "운영중",
  coming: "제작 예정",
  maintenance: "점검중",
}
