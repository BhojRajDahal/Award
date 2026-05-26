import type React from "react"
import { Navbar } from "@/components/ui/navbar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AuthGuard } from "@/components/auth/auth-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAdmin>
      <div className="min-h-screen flex flex-col overflow-x-hidden">
        <Navbar />
        <div className="flex-1 flex overflow-x-hidden">
          <aside className="hidden md:block w-64 border-r bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
            <AdminSidebar />
          </aside>
          <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
