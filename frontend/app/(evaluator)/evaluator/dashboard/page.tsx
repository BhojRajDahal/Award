"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileText, Loader2, User, Mail } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

interface ApplicationDisplay {
  id: string
  application_id: number
  user_id?: number
  applicant: string
  email: string
  prize: string
  date: string
  status: string
}

export default function EvaluatorDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [evaluator, setEvaluator] = useState<any>(null)
  const [applicantProfile, setApplicantProfile] = useState<ApplicationDisplay | null>(null)
  const [userProfileData, setUserProfileData] = useState<any>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  /** `"all"` or `String(prize_id)` */
  const [awardFilter, setAwardFilter] = useState("all")
  /** `"all"` or calendar year e.g. `"2026"` from submitted date */
  const [yearFilter, setYearFilter] = useState("all")

  useEffect(() => {
    // Get evaluator data from localStorage
    const evaluatorData = localStorage.getItem("evaluatorData")
    if (evaluatorData) {
      try {
        setEvaluator(JSON.parse(evaluatorData))
      } catch (error) {
        console.error("Failed to parse evaluator data", error)
      }
    }

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

  const submissionYear = (app: Application): number | null => {
    try {
      const raw = app.created_at || app.updated_at
      if (!raw) return null
      const y = new Date(raw).getFullYear()
      return Number.isFinite(y) ? y : null
    } catch {
      return null
    }
  }

  const prizeOptions = useMemo(() => {
    const byId = new Map<number, string>()
    for (const app of applications) {
      const id = Number(app.prize_id)
      if (!Number.isFinite(id) || id <= 0) continue
      if (byId.has(id)) continue
      const title = (app.prize?.prize_name || "").trim() || `Prize #${id}`
      byId.set(id, title)
    }
    return [...byId.entries()]
      .map(([prize_id, title]) => ({ prize_id, title }))
      .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }))
  }, [applications])

  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    for (const app of applications) {
      const y = submissionYear(app)
      if (y != null) years.add(y)
    }
    return [...years].sort((a, b) => b - a)
  }, [applications])

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (awardFilter !== "all") {
        const want = Number(awardFilter)
        if (!Number.isFinite(want) || app.prize_id !== want) return false
      }
      if (yearFilter !== "all") {
        const want = Number(yearFilter)
        const y = submissionYear(app)
        if (y == null || y !== want) return false
      }
      return true
    })
  }, [applications, awardFilter, yearFilter])

  useEffect(() => {
    if (awardFilter !== "all" && !prizeOptions.some((p) => String(p.prize_id) === awardFilter)) {
      setAwardFilter("all")
    }
  }, [prizeOptions, awardFilter])

  useEffect(() => {
    if (yearFilter !== "all" && !yearOptions.includes(Number(yearFilter))) {
      setYearFilter("all")
    }
  }, [yearOptions, yearFilter])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    } catch {
      return "N/A"
    }
  }

  // Map database status to UI status
  const mapStatusToUI = (status: string): string => {
    const statusMap: Record<string, string> = {
      'submitted': 'Pending',
      'processing': 'Under Review',
      'accepted': 'Approved',
      'declined': 'Rejected',
      'draft': 'Draft'
    }
    return statusMap[status.toLowerCase()] || status
  }

  // Get file URL - handle both proxy and direct backend access
  const getFileUrl = (filePath: string) => {
    if (!filePath) {
      console.warn('[getFileUrl] Empty file path')
      return "#"
    }
    
    // Remove 'public/' prefix if present
    const cleanPath = filePath.replace(/^public\//, '')
    
    // Determine base URL
    const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL
    let fullUrl: string
    
    if (rawBase && rawBase.includes('http')) {
      // Direct backend URL (e.g., http://localhost:5000)
      fullUrl = `${rawBase}/api/files/${cleanPath}`
    } else {
      // Relative path - Next.js will proxy /api/* to backend
      fullUrl = `/api/files/${cleanPath}`
    }
    
    return fullUrl
  }

  const handleViewApplicant = async (app: Application) => {
    setApplicantProfile({
      id: `APP-${String(app.application_id).padStart(3, '0')}`,
      application_id: app.application_id,
      user_id: app.user_id,
      applicant: app.user?.full_name || "Unknown User",
      email: app.user?.email || "",
      prize: app.prize?.prize_name || "Unknown Prize",
      date: formatDate(app.created_at),
      status: mapStatusToUI(app.status),
    })
    setIsProfileOpen(true)
    setIsProfileLoading(true)
    
    const evaluatorToken = localStorage.getItem("evaluatorToken")

    if (!evaluatorToken) {
      toast.error("Authentication required")
      setIsProfileLoading(false)
      return
    }

    // Get user_id from the application
    let user_id = app.user_id

    if (!user_id) {
      toast.error("Could not find user ID")
      setIsProfileLoading(false)
      return
    }

    try {
      // Fetch user profile with only approved applications
      const profileResponse = await apiClient.get(`/api/evaluator/user/${user_id}/profile`, {
        headers: {
          Authorization: `Bearer ${evaluatorToken}`,
        },
      })

      setUserProfileData(profileResponse.data)
    } catch (error: any) {
      console.error("Error fetching user profile:", error)
      toast.error(error.response?.data?.msg || "Failed to load user profile")
    } finally {
      setIsProfileLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Evaluator Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {evaluator?.full_name || "Evaluator"}. Review and evaluate applications.
        </p>
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
        <>
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accepted Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredApplications.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <div className="grid gap-4 border-b px-6 pb-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eval-filter-award" className="text-xs font-medium text-muted-foreground">
                  Award
                </Label>
                <Select value={awardFilter} onValueChange={setAwardFilter}>
                  <SelectTrigger id="eval-filter-award" className="w-full min-w-0 sm:max-w-md" size="default">
                    <SelectValue placeholder="All awards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All awards</SelectItem>
                    {prizeOptions.map(({ prize_id, title }) => (
                      <SelectItem key={prize_id} value={String(prize_id)}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eval-filter-year" className="text-xs font-medium text-muted-foreground">
                  Year
                </Label>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger id="eval-filter-year" className="w-full min-w-0 sm:max-w-md" size="default">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardContent className="p-0">
              {filteredApplications.length === 0 ? (
                <div className="flex min-h-[160px] items-center justify-center px-4 py-10 text-muted-foreground">
                  No application
                </div>
              ) : (
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
                    {filteredApplications.map((application) => (
                      <TableRow key={application.application_id}>
                        <TableCell className="font-medium">
                          APP-{String(application.application_id).padStart(3, "0")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div
                              className="font-medium cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleViewApplicant(application)}
                            >
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
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Applicant Profile Dialog - A4 Format */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="w-full max-w-[210mm] min-h-[297mm] max-h-[90vh] overflow-y-auto px-4 sm:px-8 pt-8 sm:pt-16 pb-8 sm:pb-16 print:w-[210mm] print:h-[297mm] print:p-0" style={{ maxWidth: '210mm', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <DialogHeader className="mb-8">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Applicant Profile (Approved Applications Only)
            </DialogTitle>
            <DialogDescription>
              Complete information about {applicantProfile?.applicant || userProfileData?.user?.full_name}
            </DialogDescription>
          </DialogHeader>
          {isProfileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading profile...</span>
            </div>
          ) : userProfileData ? (
            <div className="space-y-6 pt-4 pb-12 w-full" style={{ width: '100%', maxWidth: '210mm', marginBottom: '3rem' }}>
              {/* Profile Picture in top right corner */}
              {(() => {
                // Extract profile picture from all applications
                let profilePicture: string | null = null
                if (userProfileData.applications && userProfileData.applications.length > 0) {
                  for (const app of userProfileData.applications) {
                    // Check common fields
                    if (app.common_field_values) {
                      for (const field of app.common_field_values) {
                        if (field.file_path) {
                          const fieldName = (field.field_name || '').toLowerCase()
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(field.file_path)
                          if (isImage && (fieldName.includes('photo') || fieldName.includes('picture') || fieldName.includes('profile') || fieldName.includes('image') || fieldName.includes('avatar'))) {
                            profilePicture = field.file_path
                            break
                          }
                        }
                      }
                    }
                    // Check prize-specific fields
                    if (!profilePicture && app.prize_specific_field_values) {
                      for (const field of app.prize_specific_field_values) {
                        if (field.file_path) {
                          const fieldName = (field.field_name || '').toLowerCase()
                          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(field.file_path)
                          if (isImage && (fieldName.includes('photo') || fieldName.includes('picture') || fieldName.includes('profile') || fieldName.includes('image') || fieldName.includes('avatar'))) {
                            profilePicture = field.file_path
                            break
                          }
                        }
                      }
                    }
                    if (profilePicture) break
                  }
                }
                return (
                  <div className="flex items-start justify-between pb-4 border-b-2 mb-6">
                    <div className="flex-1 pr-4">
                      <p className="text-3xl font-bold mb-2">{userProfileData.user.full_name}</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {userProfileData.user.email}
                        </p>
                        <p className="text-muted-foreground">UID-{userProfileData.user.uid}</p>
                        <p className="text-muted-foreground">Member Since: {formatDate(userProfileData.user.created_at)}</p>
                      </div>
                    </div>
                    <div className="h-[300px] w-[300px] ring-4 ring-white shrink-0 rounded-none overflow-hidden bg-white flex items-center justify-center">
                      {profilePicture ? (
                        <img 
                          src={getFileUrl(profilePicture)} 
                          alt={userProfileData.user.full_name}
                          className="max-w-full max-h-full object-contain"
                          style={{ width: '300px', height: '300px', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-6xl font-semibold">
                          {userProfileData.user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}
              {/* User Basic Info */}
              <div className="grid grid-cols-2 gap-6 w-full">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Full Name</p>
                  <p className="text-lg font-semibold">{userProfileData.user.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-lg flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {userProfileData.user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">User ID</p>
                  <p className="text-lg">UID-{userProfileData.user.uid}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                  <p className="text-lg">{formatDate(userProfileData.user.created_at)}</p>
                </div>
              </div>

              {/* Total Approved Applications */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Approved Applications</p>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1 bg-green-500">
                    {userProfileData.total_applications} Approved Application{userProfileData.total_applications !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>

              {/* All Approved Applications with Field Values */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All Approved Applications & Submitted Information
                </p>
                <div className="space-y-4">
                  {userProfileData.applications && userProfileData.applications.length > 0 ? (
                    userProfileData.applications.map((app: any, appIdx: number) => {
                      // Extract profile picture to exclude it from documents
                      let profilePicturePath: string | null = null
                      if (app.common_field_values) {
                        for (const field of app.common_field_values) {
                          if (field.file_path) {
                            const fieldName = (field.field_name || '').toLowerCase()
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(field.file_path)
                            if (isImage && (fieldName.includes('photo') || fieldName.includes('picture') || fieldName.includes('profile') || fieldName.includes('image') || fieldName.includes('avatar'))) {
                              profilePicturePath = field.file_path
                              break
                            }
                          }
                        }
                      }
                      if (!profilePicturePath && app.prize_specific_field_values) {
                        for (const field of app.prize_specific_field_values) {
                          if (field.file_path) {
                            const fieldName = (field.field_name || '').toLowerCase()
                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(field.file_path)
                            if (isImage && (fieldName.includes('photo') || fieldName.includes('picture') || fieldName.includes('profile') || fieldName.includes('image') || fieldName.includes('avatar'))) {
                              profilePicturePath = field.file_path
                              break
                            }
                          }
                        }
                      }
                      
                      // Collect all documents from this application, excluding profile picture
                      const documents: string[] = []
                      if (app.common_field_values) {
                        app.common_field_values.forEach((field: any) => {
                          if (field.file_path && field.file_path !== profilePicturePath) {
                            documents.push(field.file_path)
                          }
                        })
                      }
                      if (app.prize_specific_field_values) {
                        app.prize_specific_field_values.forEach((field: any) => {
                          if (field.file_path && field.file_path !== profilePicturePath) {
                            documents.push(field.file_path)
                          }
                        })
                      }

                      return (
                        <div key={app.application_id || appIdx} className="bg-muted p-4 rounded-lg space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{app.prize_title || "Unknown Prize"}</p>
                              <p className="text-xs text-muted-foreground">
                                APP-{String(app.application_id).padStart(3, '0')} • {formatDate(app.submitted_at || app.created_at)}
                              </p>
                            </div>
                            <Badge className="bg-green-500 text-white hover:bg-green-600">
                              {mapStatusToUI(app.status)}
                            </Badge>
                          </div>

                          {/* Common Fields */}
                          {app.common_field_values && app.common_field_values.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Common Information:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {app.common_field_values.map((field: any, idx: number) => (
                                  <div key={idx} className="bg-background p-2 rounded">
                                    <span className="font-medium text-xs text-muted-foreground">{field.field_name}:</span>
                                    <div className="mt-1">
                                      {field.file_path ? (
                                        <a 
                                          href={getFileUrl(field.file_path)} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-primary hover:underline text-xs break-all"
                                        >
                                          {field.file_path.split('/').pop()}
                                        </a>
                                      ) : (
                                        <span className="text-xs">{field.value || "N/A"}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Prize-Specific Fields */}
                          {app.prize_specific_field_values && app.prize_specific_field_values.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Prize-Specific Information:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {app.prize_specific_field_values.map((field: any, idx: number) => (
                                  <div key={idx} className="bg-background p-2 rounded">
                                    <span className="font-medium text-xs text-muted-foreground">{field.field_name}:</span>
                                    <div className="mt-1">
                                      {field.file_path ? (
                                        <a 
                                          href={getFileUrl(field.file_path)} 
                                          target="_blank" 
                                          rel="noopener noreferrer" 
                                          className="text-primary hover:underline text-xs break-all"
                                        >
                                          {field.file_path.split('/').pop()}
                                        </a>
                                      ) : (
                                        <span className="text-xs">{field.value || "N/A"}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Documents for this application */}
                          {documents.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">Attached Files:</p>
                              <div className="flex flex-wrap gap-2">
                                {documents.map((doc, idx) => (
                                  <a
                                    key={idx}
                                    href={getFileUrl(doc)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-16 w-24 bg-background rounded-lg flex items-center justify-center text-xs border hover:bg-accent cursor-pointer transition-colors p-2 text-center break-all"
                                  >
                                    {doc.split('/').pop()}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No approved applications found</p>
                  )}
                </div>
              </div>
              {/* Assign Marks Button */}
              <div className="mt-8 pt-6 border-t-2 flex justify-end">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2">
                  Assign Marks
                </Button>
              </div>
            </div>
          ) : applicantProfile ? (
            <div className="space-y-6 py-4">
              <p className="text-muted-foreground text-center py-8">Loading user profile...</p>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              <p className="text-muted-foreground text-center py-8">No profile data available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

