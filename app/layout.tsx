import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistSans } from "geist/font/sans"
import type React from "react"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { EnvChecker } from "@/components/env-checker"
import { EnvDebug } from "@/components/env-debug"

import "./globals.css"

export const metadata = {
  title: "Jash-Piam Parekh - Software Developer",
  description: "Software Developer and Mathematics Student at UCSB",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-gradient-to-br from-indigo-900 to-cyan-400", GeistSans.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <div className="relative flex min-h-screen flex-col">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
            {process.env.NODE_ENV === "development" && <EnvChecker />}
          </div>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "development" && <EnvDebug />}
      </body>
    </html>
  )
}



import './globals.css'