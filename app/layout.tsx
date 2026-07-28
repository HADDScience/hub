import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthGate } from "@/components/auth/auth-gate"
import { cn } from "@/lib/utils"

/** 모노는 Geist Mono, 폴백은 SF Mono 스택 (DESIGN.md §Typography). */
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  fallback: [
    "SFMono-Regular",
    "Consolas",
    "Liberation Mono",
    "Menlo",
    "monospace",
  ],
})

export const metadata: Metadata = {
  title: "HADD SCIENCE 허브",
  description: "HADD SCIENCE 내부 도구 런처 — omnis · ip-platform · raman-diff · CRM",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={cn("antialiased", "font-sans", fontMono.variable)}
    >
      <head>
        {/* Pretendard Variable — Omnis 와 동일한 가변 폰트 (DESIGN.md §Typography) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthGate>{children}</AuthGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
