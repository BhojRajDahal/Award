"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Clock, Plus, Loader2 } from "lucide-react"
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

export default function ApplicationsPage() {
  const { user } = useAuth({ requireAuth: true })
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("nast_token") || localStorage.getItem("token")
          : null

      if (!token) {
        toast.error("No authentication token found")
        setLoading(false)
        return
      }

      const response = await apiClient.get("/api/application/my-applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setApplications(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      console.error("Applications fetch error:", err)
      toast.error(err.response?.data?.msg || "Failed to fetch applications")
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
      case "submitted":
        return "bg-blue-500"
      case "draft":
        return "bg-gray-500"
      case "approved":
      case "accepted":
        return "bg-green-500"
      case "rejected":
      case "declined":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "Under Review"
      case "processing":
        return "Processing"
      case "approved":
        return "Approved"
      case "rejected":
        return "Rejected"
      case "draft":
        return "Draft"
      case "accepted":
        return "Accepted"
      case "declined":
        return "Declined"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your prize applications.</p>
        </div>
        <Link href="/prizes">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading applications...</span>
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No applications found.</p>
            <Link href="/prizes">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Application
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.application_id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {app.prize_title || `Prize #${app.prize_id}`}
                  </CardTitle>
                  <CardDescription>Application ID: APP-{app.application_id}</CardDescription>
                </div>
                <Badge variant="outline" className={`${getStatusColor(app.status)} text-white border-none`}>
                  {getStatusDisplay(app.status)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Submitted: {formatDate(app.submitted_at || app.created_at)}
                  </div>
                  <Link href={`/dashboard/applications/${app.application_id}`} className="ml-auto">
                    <Button variant="link" size="sm" className="px-0">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
