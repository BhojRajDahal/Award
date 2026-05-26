"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/ui/navbar"
import { EvaluatorSidebar } from "@/components/evaluator/evaluator-sidebar"
import { EvaluatorGuard } from "@/components/evaluator/evaluator-guard"

export default function EvaluatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/evaluator/login"

  // For login page, render without sidebar/navbar
  if (isLoginPage) {
    return <>{children}</>
  }

  // For other pages, render with sidebar/navbar and guard
  return (
    <EvaluatorGuard>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-x-hidden">
          <aside className="hidden md:block w-64 border-r bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
            <EvaluatorSidebar />
          </aside>
          <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </EvaluatorGuard>
  )
}

