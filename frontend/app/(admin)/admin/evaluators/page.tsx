"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, UserPlus, Trash2, Mail, Loader2, ClipboardCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n-context"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"

interface Evaluator {
  evaluator_id: number
  full_name: string
  email: string
  institution: string
  designation: string
  created_at?: string
}

export default function AdminEvaluatorsPage() {
  const { t } = useTranslation()
  const [evaluators, setEvaluators] = useState<Evaluator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newEvaluator, setNewEvaluator] = useState({ 
    full_name: "", 
    email: "", 
    institution: "", 
    designation: "", 
    password: "" 
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchEvaluators = async () => {
    setIsLoading(true)
    try {
      const adminToken = typeof window !== "undefined"
        ? localStorage.getItem("adminToken") || localStorage.getItem("nast_token")
        : null

      if (!adminToken) {
        toast.error("Authentication required")
        setIsLoading(false)
        return
      }

      const response = await apiClient.get("/api/admin/evaluators", {
        headers: { Authorization: `Bearer ${adminToken}` },
      })

      setEvaluators(Array.isArray(response.data) ? response.data : [])
    } catch (error: any) {
      console.error("Error fetching evaluators:", error)
      toast.error("Failed to load evaluators")
      setEvaluators([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvaluators()
  }, [])

  const handleAddEvaluator = async () => {
    if (!newEvaluator.full_name || !newEvaluator.email || !newEvaluator.institution || !newEvaluator.designation || !newEvaluator.password) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const adminToken = typeof window !== "undefined"
        ? localStorage.getItem("adminToken") || localStorage.getItem("nast_token")
        : null

      if (!adminToken) {
        toast.error("Authentication required")
        setIsSubmitting(false)
        return
      }

      const response = await apiClient.post("/api/admin/evaluators", {
        full_name: newEvaluator.full_name.trim(),
        email: newEvaluator.email.trim(),
        institution: newEvaluator.institution.trim(),
        designation: newEvaluator.designation.trim(),
        password: newEvaluator.password
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })

      toast.success(response.data?.msg || "Evaluator created successfully")
      setNewEvaluator({ full_name: "", email: "", institution: "", designation: "", password: "" })
      setIsAddOpen(false)
      fetchEvaluators()
    } catch (error: any) {
      console.error("Error creating evaluator:", error)
      const errorMsg = error.response?.data?.msg || error.message || "Failed to create evaluator"
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (evaluator_id: number) => {
    try {
      const adminToken = typeof window !== "undefined"
        ? localStorage.getItem("adminToken") || localStorage.getItem("nast_token")
        : null

      if (!adminToken) {
        toast.error("Authentication required")
        return
      }

      await apiClient.delete(`/api/admin/evaluators/${evaluator_id}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      })

      setEvaluators(evaluators.filter((e) => e.evaluator_id !== evaluator_id))
      toast.success("Evaluator deleted successfully")
    } catch (error: any) {
      console.error("Error deleting evaluator:", error)
      toast.error("Failed to delete evaluator")
    }
  }

  const handleEmailEvaluator = (email: string) => {
    window.location.href = `mailto:${email}?subject=NAST Portal - Important Notice`
    toast.success(`Opening email client for ${email}`)
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evaluators</h1>
          <p className="text-muted-foreground">Manage evaluators who can review applications</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add Evaluator
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Evaluator</DialogTitle>
              <DialogDescription>
                Create a new evaluator account. Password will be hashed securely.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={newEvaluator.full_name}
                  onChange={(e) => setNewEvaluator({ ...newEvaluator, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEvaluator.email}
                  onChange={(e) => setNewEvaluator({ ...newEvaluator, email: e.target.value })}
                  placeholder="evaluator@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={newEvaluator.institution}
                  onChange={(e) => setNewEvaluator({ ...newEvaluator, institution: e.target.value })}
                  placeholder="Enter institution name"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="designation">Designation *</Label>
                <Input
                  id="designation"
                  value={newEvaluator.designation}
                  onChange={(e) => setNewEvaluator({ ...newEvaluator, designation: e.target.value })}
                  placeholder="Enter designation (e.g., Professor, Researcher)"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newEvaluator.password}
                  onChange={(e) => setNewEvaluator({ ...newEvaluator, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddOpen(false)
                setNewEvaluator({ full_name: "", email: "", institution: "", designation: "", password: "" })
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddEvaluator} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Evaluator"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
            Evaluators
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {evaluators.length}
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading evaluators...</span>
            </div>
          ) : evaluators.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No evaluators found</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evaluator</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluators.map((evaluator) => (
                    <TableRow key={evaluator.evaluator_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-green-100 text-green-700">
                              {evaluator.full_name?.charAt(0)?.toUpperCase() || "E"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {evaluator.full_name}
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Evaluator
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{evaluator.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {evaluator.institution}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {evaluator.designation}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(evaluator.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEmailEvaluator(evaluator.email)}>
                              <Mail className="mr-2 h-4 w-4" /> Email Evaluator
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(evaluator.evaluator_id)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Evaluator
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

