/**
 * 런처에 표시할 앱 목록.
 *
 * 앱을 추가하려면 이 배열에 항목 하나만 넣으면 된다. 화면·정렬·상태 배지가 따라온다.
 */

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
  /** 아이콘 글리프 (이모지 대신 기하학적 기호로 통일) */
  glyph: string
  /** 아이콘 배경 그라디언트 (tailwind 클래스) */
  tint: string
  /** 같은 브라우저 탭에서 열지 여부. 외부 서비스는 새 탭. */
  sameTab?: boolean
}

export const APPS: LauncherApp[] = [
  {
    id: "omnis",
    name: "omnis",
    description: "채팅 기반 업무 관리 시스템",
    url: "https://omnis-omega.vercel.app",
    status: "live",
    glyph: "◈",
    tint: "from-violet-500 to-indigo-600",
  },
  {
    id: "ip-platform",
    name: "ip-platform",
    description: "지식재산권 팔로우업 · 상표·특허 현황과 미결 액션",
    url: "https://haddscience.github.io/ip-platform/",
    status: "live",
    glyph: "▤",
    tint: "from-teal-500 to-cyan-600",
    sameTab: true,
  },
  {
    id: "raman",
    name: "raman-diff",
    description: "Raman G-peak 차이(before-after) 분석 도구",
    url: "https://haddscience.github.io/raman-g-peak-diff/",
    status: "live",
    glyph: "∿",
    tint: "from-amber-500 to-orange-600",
    sameTab: true,
  },
  {
    id: "crm",
    name: "CRM",
    description: "고객 관리 — 제작 예정",
    url: null,
    status: "coming",
    glyph: "◎",
    tint: "from-slate-400 to-slate-600",
  },
]

export const STATUS_LABEL: Record<AppStatus, string> = {
  live: "운영중",
  coming: "제작 예정",
  maintenance: "점검중",
}
