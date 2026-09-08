"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { BlurFade } from "@/components/magicui/blur-fade"
import "./welcome.css"

const WelcomeScene = dynamic(() => import("./welcome-scene"), { ssr: false })
const services = [
  {
    id: "omnis",
    name: "Omnis",
    description: "업무와 지식을 한곳에",
    screen: "서비스 소개 화면",
  },
  {
    id: "alzheimer",
    name: "AI Alzheimer",
    description: "라만 스펙트럼 분석",
    screen: "분석 도구 화면",
  },
  {
    id: "ecm",
    name: "AI ECM",
    description: "ECM 조성 예측",
    screen: "조성 예측 화면",
  },
  {
    id: "admin",
    name: "콘텐츠 관리",
    description: "우리 회사의 소식과 사진",
    screen: "예시 콘텐츠 화면",
  },
]
const titles = [
  <>
    안녕하세요.
    <br />
    <span>HADD Hub</span>에 오신 걸 환영합니다.
  </>,
  <>
    우리의 도구가 만나는 곳.
    <br />
    <span>Hub</span>에 대해서 소개해 드릴게요.
  </>,
  <>
    다양한 도구를 연결하는,
    <br className="mobile-break" /> <span>하나의 Hub.</span>
  </>,
  <>
    로그인 방법은 달라도,
    <br className="mobile-break" /> <span>HADD 계정 하나로.</span>
  </>,
  <>
    <span>HADD Hub</span>에서
    <br />
    다양한 사내도구를 활용해 보세요.
  </>,
]

function ServiceMap() {
  return (
    <div
      className="service-map"
      role="img"
      aria-label="가운데 HADD Hub가 Omnis, AI Alzheimer, AI ECM, 콘텐츠 관리의 실제 화면과 연결된 지도"
    >
      <svg
        className="map-connections"
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hub-line">
            <stop stopColor="#66C2EA" stopOpacity=".2" />
            <stop offset=".5" stopColor="#0095DA" stopOpacity=".6" />
            <stop offset="1" stopColor="#66C2EA" stopOpacity=".2" />
          </linearGradient>
        </defs>
        {[
          "M500 250 C360 250 370 110 185 110",
          "M500 250 C640 250 630 110 815 110",
          "M500 250 C360 250 370 390 185 390",
          "M500 250 C640 250 630 390 815 390",
        ].map((d, i) => (
          <g key={d}>
            <path d={d} stroke="url(#hub-line)" strokeWidth="1.3" />
            <path
              className="connection-signal"
              style={{ animationDelay: `${i * -1.7}s` }}
              d={d}
              stroke="#0095DA"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 490"
            />
          </g>
        ))}
      </svg>
      <div className="map-hub">
        <div className="hub-orbit" />
        <div className="hub-core">
          <span>HADD</span>
          <strong>Hub</strong>
        </div>
        <span className="hub-caption">모든 도구의 시작점</span>
      </div>
      {services.map((service, index) => (
        <figure className={`service-preview service-${index}`} key={service.id}>
          <div className="service-screen">
            <Image
              src={`/hub/onboarding/${service.id}.webp`}
              alt={`${service.name} ${service.screen}`}
              width={1280}
              height={820}
              sizes="(max-width: 760px) 38vw, 280px"
            />
          </div>
          <figcaption>
            <strong>{service.name}</strong>
            <span>{service.description}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function AccountMap() {
  return (
    <div
      className="account-map"
      role="img"
      aria-label="Google과 카카오를 기존 HADD 자체계정에 연결해 같은 계정으로 사내 도구를 이용합니다"
    >
      <svg
        className="account-connections"
        viewBox="0 0 800 380"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        {[
          "M160 80 C160 185 400 135 400 260",
          "M400 80 L400 260",
          "M640 80 C640 185 400 135 400 260",
        ].map((d, i) => (
          <g key={d}>
            <path
              d={d}
              stroke="#66C2EA"
              strokeOpacity=".38"
              strokeWidth="1.3"
            />
            <path
              d={d}
              className="connection-signal"
              style={{ animationDelay: `${i * -2}s` }}
              stroke="#0095DA"
              strokeWidth="2"
              strokeDasharray="4 490"
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
      <div className="login-methods">
        <div className="login-method">
          <div className="provider-orb google-orb">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 1.9-6.9 1.9-5.3 0-9.9-3.6-11.5-8.4H5.7v5.3A20.4 20.4 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.5 27.5a12.3 12.3 0 0 1 0-7v-5.3H5.7a20 20 0 0 0 0 17.6l6.8-5.3Z"
              />
              <path
                fill="#EA4335"
                d="M24 12.1c3 0 5.7 1 7.8 3l5.8-5.8A19.6 19.6 0 0 0 24 4 20.4 20.4 0 0 0 5.7 15.2l6.8 5.3C14.1 15.7 18.7 12.1 24 12.1Z"
              />
            </svg>
          </div>
          <span>Google</span>
        </div>
        <div className="login-method">
          <div className="provider-orb own-orb">
            <span>HADD</span>
          </div>
          <span>자체계정</span>
        </div>
        <div className="login-method">
          <div className="provider-orb kakao-orb">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#391B1B"
                d="M24 8C13.5 8 5 14.5 5 22.5c0 5.1 3.5 9.6 8.8 12.2L12 42l8.3-5.2c1.2.2 2.5.3 3.7.3 10.5 0 19-6.5 19-14.6S34.5 8 24 8Z"
              />
            </svg>
          </div>
          <span>카카오</span>
        </div>
      </div>
      <div className="account-destination">
        <div className="account-seal">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m12 3 7 3v6c0 4-7 8-7 8s-7-4-7-8V6l7-3Z"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="m8.5 11.5 2.5 2.5 4.5-5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </div>
        <strong>하나의 HADD 계정</strong>
        <span>연결된 로그인 수단으로, 사내 도구를 이어서.</span>
      </div>
    </div>
  )
}

export default function WelcomeTour({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const reduced = useReducedMotion()
  const surface = useRef<HTMLButtonElement>(null)
  const lastAdvance = useRef(0)
  useEffect(() => {
    surface.current?.focus({ preventScroll: true })
  }, [])
  const diagram = step === 2 || step === 3

  function advance() {
    const now = performance.now()
    if (now - lastAdvance.current < 800) return
    lastAdvance.current = now
    if (step === titles.length - 1) onFinish()
    else setStep(step + 1)
  }

  return (
    <main
      className={`welcome welcome-step-${step} ${diagram ? "welcome-diagram" : ""}`}
      aria-label="HADD Hub 처음 사용 안내"
    >
      <div className="welcome-wash" aria-hidden="true" />
      <div className="welcome-periphery" aria-hidden="true">
        <div className="welcome-fallback-object fallback-one" />
        <div className="welcome-fallback-object fallback-two" />
        <WelcomeScene step={step} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={step}
          className="welcome-chapter"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: reduced ? "none" : "blur(8px)" }}
          transition={{
            duration: reduced ? 0 : 0.65,
            ease: [0.2, 0.6, 0.2, 1],
          }}
        >
          <div className="welcome-centered-copy">
            <BlurFade delay={0.15} duration={1.5} offset={14} direction="up">
              <h1>{titles[step]}</h1>
            </BlurFade>
            {step === 2 && (
              <BlurFade delay={0.4} duration={1.2}>
                <p className="welcome-description">
                  업무와 지식부터 연구와 분석까지. 필요한 도구로 자연스럽게.
                </p>
              </BlurFade>
            )}
            {step === 3 && (
              <BlurFade delay={0.4} duration={1.2}>
                <p className="welcome-description">
                  구글·카카오를 기존 HADD 계정에 연결해 사용할 수 있어요.
                </p>
              </BlurFade>
            )}
          </div>
          {step === 2 && (
            <BlurFade
              className="welcome-map-wrap"
              delay={0.5}
              duration={1.7}
              direction="up"
            >
              <ServiceMap />
            </BlurFade>
          )}
          {step === 3 && (
            <BlurFade
              className="welcome-map-wrap"
              delay={0.5}
              duration={1.7}
              direction="up"
            >
              <AccountMap />
            </BlurFade>
          )}
          {step === 4 && (
            <BlurFade delay={0.6} duration={1.5}>
              <p className="welcome-outro">당신의 다음 작업이 시작되는 곳.</p>
            </BlurFade>
          )}
        </motion.section>
      </AnimatePresence>
      <div
        className="welcome-click-hint"
        key={`hint-${step}`}
        aria-hidden="true"
      >
        <span className="click-ripple">
          <span />
        </span>
        <span className="desktop-hint">
          {step === 4
            ? "화면을 클릭해 시작하세요"
            : "화면 어디든 클릭해 주세요"}
        </span>
        <span className="touch-hint">
          {step === 4
            ? "화면을 터치해 시작하세요"
            : "화면 어디든 터치해 주세요"}
        </span>
      </div>
      <button
        ref={surface}
        className="welcome-click-surface"
        aria-label={
          step === 4
            ? "안내 마치고 허브 시작하기"
            : `${step + 1} / 5. 화면을 클릭하거나 Enter를 눌러 다음 장면으로`
        }
        onClick={advance}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            onFinish()
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            setStep((current) => Math.max(0, current - 1))
          }
          if (event.key === "ArrowRight") {
            event.preventDefault()
            advance()
          }
        }}
      />
      <span className="sr-only" role="status">
        {step + 1} / 5 단계. 왼쪽 방향키로 이전 장면, Escape로 안내 종료.
      </span>
    </main>
  )
}
