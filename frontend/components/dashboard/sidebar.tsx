"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Award, FileText, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n-context"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const sidebarItems = [
    { icon: LayoutDashboard, label: t("sidebar.overview"), href: "/dashboard" },
    { icon: FileText, label: t("sidebar.applications"), href: "/dashboard/applications" },
    { icon: Award, label: t("sidebar.prizes"), href: "/prizes" },
  ]

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="space-y-1">
        {sidebarItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", pathname === item.href && "bg-secondary")}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>
      <div className="mt-auto pt-4 border-t">
        <Link href="/login">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {t("sidebar.signout")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
