"use client"

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

type AuthGuardProps = {
  children: ReactNode
  requireAdmin?: boolean
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { isChecking, isAuthenticated, isAdmin } = useAuth({
    requireAuth: true,
    requireAdmin,
  })

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking access…</span>
        </div>
      </div>
    )
  }

  // If admin access is required but user is not admin, show access denied
  if (requireAdmin && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}


