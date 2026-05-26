"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

type EvaluatorGuardProps = {
  children: ReactNode
}

export function EvaluatorGuard({ children }: EvaluatorGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Skip guard for login page
  const isLoginPage = pathname === "/evaluator/login"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    // Skip authentication check for login page
    if (isLoginPage) {
      setIsAuthenticated(true)
      setIsChecking(false)
      return
    }

    apiClient
      .get("/api/auth/me")
      .then((res) => {
        if (res.data?.role === "evaluator") {
          setIsAuthenticated(true)
        } else {
          router.replace("/evaluator/login")
        }
      })
      .catch(() => {
        router.replace("/evaluator/login")
      })
      .finally(() => {
        setIsChecking(false)
      })
  }, [router, isLoginPage])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking access…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

