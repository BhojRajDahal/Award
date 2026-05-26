"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Clock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n-context"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"



interface Application {
  application_id: number
  prize_id: number
  prize_title?: string
  status: string
  submitted_at?: string
  updated_at?: string
  created_at?: string
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth({ requireAuth: true })
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      // Use cookie-based session auth from the shared API client.
      // Avoid forcing a potentially stale legacy token from localStorage.
      const response = await apiClient.get("/api/application/my-applications")

      setApplications(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      console.error("Applications fetch error:", err)
      toast.error(err.response?.data?.msg || "Failed to fetch applications")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics - status values are lowercase in the database
  const totalApplications = applications.length
  const submittedCount = applications.filter((app) => {
    const status = app.status?.toLowerCase()
    return status === "submitted" || status === "processing" || status === "approved" || status === "rejected" || status === "accepted" || status === "declined"
  }).length
  const draftCount = applications.filter((app) => app.status?.toLowerCase() === "draft").length
  const pendingCount = applications.filter((app) => app.status?.toLowerCase() === "submitted").length

  // Get recent applications (sorted by updated_at or created_at)
  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime()
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime()
      return dateB - dateA
    })
    .slice(0, 5)

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "draft":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.dashboard")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcome")}, {user?.full_name?.split(" ")[0] || "Applicant"}. {t("dashboard.subtitle")}
          </p>
        </div>
        <Link href="/prizes">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("dashboard.new_app")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.total")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {submittedCount} submitted, {draftCount} draft
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stats.pending")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting admin action</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recent.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading applications...</span>
            </div>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No applications yet.</p>
              <Link href="/prizes">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> {t("dashboard.new_app")}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <Link key={app.application_id} href={`/dashboard/applications`}>
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium">{app.prize_title || `Prize #${app.prize_id}`}</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {formatDate(app.updated_at || app.created_at)}
                      </p>
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
