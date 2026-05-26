"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { itemsFromPagedApiResponse } from "@/lib/paged-api-response"
import { toast } from "sonner"

interface Application {
  application_id: number
  user_id: number
  prize_id: number
  status: string
  created_at: string
  updated_at: string
  user?: {
    full_name: string
    email: string
  }
  prize?: {
    prize_name: string
  }
}

export default function EvaluatorApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const evaluatorToken = localStorage.getItem("evaluatorToken")

      if (!evaluatorToken) {
        toast.error("Authentication required")
        setIsLoading(false)
        return
      }

      const response = await apiClient.get("/api/evaluator/applications", {
        params: { limit: 200, page: 1, _t: Date.now() },
        headers: {
          Authorization: `Bearer ${evaluatorToken}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      const list = itemsFromPagedApiResponse<Application>(response.data)
      setApplications(list)
    } catch (error: any) {
      console.error("Error fetching applications:", error)
      toast.error("Failed to load applications")
      setApplications([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
      </div>

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading…</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4 py-16 text-muted-foreground">
          No application
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Application ID</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Award</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.application_id}>
                      <TableCell className="font-medium">
                        APP-{String(application.application_id).padStart(3, '0')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {application.user?.full_name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {application.user?.email || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.prize?.prize_name || `Award #${application.prize_id}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(application.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

