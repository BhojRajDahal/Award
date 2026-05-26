"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

export const AUTH_EVENT = "nast-auth-changed"

export type AuthUser = {
  id?: string | number
  uid?: string | number // Database primary key for users table
  user_id?: string | number // Alias for uid, used in some contexts
  evaluator_id?: string | number
  full_name?: string
  email: string
  role?: string
}

type UseAuthOptions = {
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function useAuth(options?: UseAuthOptions) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  const requireAuth = options?.requireAuth ?? false
  const requireAdmin = options?.requireAdmin ?? false
  const redirectTo = options?.redirectTo ?? "/login"

  const syncFromStorage = useCallback(async () => {
    try {
      const res = await apiClient.get("/api/auth/me")
      const authUser = res.data?.user ?? null
      setUser(authUser)
      setToken(authUser ? "cookie-session" : null)
    } catch {
      setUser(null)
      setToken(null)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    syncFromStorage().catch(() => {
      setIsChecking(false)
    })
  }, [syncFromStorage])

  useEffect(() => {
    const handleAuthChange = () => syncFromStorage()

    if (typeof window !== "undefined") {
      window.addEventListener(AUTH_EVENT, handleAuthChange)
      window.addEventListener("storage", handleAuthChange)
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(AUTH_EVENT, handleAuthChange)
        window.removeEventListener("storage", handleAuthChange)
      }
    }
  }, [syncFromStorage])

  useEffect(() => {
    if (isChecking) {
      return
    }

    if (requireAuth && !user) {
      router.replace(redirectTo)
      return
    }

    if (requireAdmin && user && (user as any).role !== "admin") {
      router.replace("/dashboard")
    }
  }, [isChecking, requireAuth, requireAdmin, redirectTo, router, user])

  const logout = useCallback((redirectTo: string = "/login") => {
    if (typeof window === "undefined") {
      return
    }

    apiClient.post("/api/auth/logout").finally(() => {
      window.dispatchEvent(new Event(AUTH_EVENT))
      router.push(redirectTo)
    })
  }, [router])

  return {
    user,
    token,
    isChecking,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean((user as any)?.role === "admin"),
    logout,
    refresh: syncFromStorage,
  }
}

