"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EvaluatorSidebar() {
  const pathname = usePathname()

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/evaluator/dashboard" },
    { icon: FileText, label: "Applications", href: "/evaluator/applications" },
  ]

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="px-2 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-primary">Evaluator Portal</h2>
      </div>
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
    </div>
  )
}
