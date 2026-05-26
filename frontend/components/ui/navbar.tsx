"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"
import { Globe, LogOut, UserCircle2 } from "lucide-react"
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const pathname = usePathname()
  const { t, setLanguage } = useTranslation()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const isEvaluatorArea = pathname?.startsWith("/evaluator") && pathname !== "/evaluator/login"

  const displayName = (user?.full_name || "").trim() || user?.email || "Account"
  const showEmailSubtitle = Boolean((user?.full_name || "").trim() && user?.email)

  const handleSignOut = () => {
    if (isEvaluatorArea && typeof window !== "undefined") {
      localStorage.removeItem("evaluatorToken")
      localStorage.removeItem("evaluatorData")
    }
    logout(isEvaluatorArea ? "/evaluator/login" : "/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between max-w-full">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center">
          <Image
            src="/Nepal_Academy_of_Science_and_Technology_Logo.svg.png"       // or /logo.png
            alt="NAST Logo"
            width={32}
            height={32}
            className="object-cover"
            priority
          />
        </div>

        <Link href="/" className="font-bold text-xl hidden md:block">
          NAST
        </Link>
      </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            {t("nav.home")}
          </Link>
          <Link href="/prizes" className="text-sm font-medium hover:text-primary transition-colors">
            {t("nav.prizes")}
          </Link>
          <Link href="/past-prize-history" className="text-sm font-medium hover:text-primary transition-colors">
            {t("nav.past_prize_history")}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ne")}>नेपाली</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  {isAdmin ? "Admin" : t("nav.dashboard")}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserCircle2 className="h-4 w-4" />
                    <span className="hidden sm:inline truncate max-w-[10rem]">
                      {displayName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium leading-tight">{displayName}</p>
                    {showEmailSubtitle ? (
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    ) : null}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={isAdmin ? "/admin" : "/dashboard"} className="w-full">
                      {isAdmin ? "Admin Portal" : t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" className="flex items-center gap-2" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span>{t("nav.logout") || "Sign out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
