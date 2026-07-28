import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  fallback: [
    "Pretendard",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "system-ui",
    "sans-serif",
  ],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "monospace",
  ],
})

export const metadata: Metadata = {
  title: "HADD SCIENCE 툴",
  description: "HADD SCIENCE 내부 도구 모음 — omnis · ip-platform · CRM",
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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
