import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Shield, AlertTriangle, DollarSign, FileCheck, BarChart3, TrendingUp, UserCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { adminService } from '@/services/adminService'
import { useToast } from '@/components/ui/use-toast'
import type { VerificationRequest, ContentReport, AdminStatistics } from '@/services/adminService'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [statistics, setStatistics] = useState<AdminStatistics>({
    totalUsers: 0,
    totalLawyers: 0,
    totalActivists: 0,
    totalConsultations: 0,
    pendingVerifications: 0,
    activeConsultations: 0,
    reportedContent: 0,
    revenue: {
      daily: 0,
      weekly: 0,
      monthly: 0,
    },
  })
  const [verifications, setVerifications] = useState<VerificationRequest[]>([])
  const [reports, setReports] = useState<ContentReport[]>([])
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null)
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [resolution, setResolution] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsData, verificationsData, reportsData] = await Promise.all([
        adminService.getStatistics(),
        adminService.getVerificationRequests('pending'),
        adminService.getContentReports('pending'),
      ])
      setStatistics(statsData)
      setVerifications(verificationsData)
      setReports(reportsData)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationReview = async (status: 'approved' | 'rejected') => {
    if (!selectedVerification) return

    try {
      await adminService.reviewVerification(selectedVerification.id, {
        status,
        notes: reviewNotes,
      })
      toast({
        title: 'Success',
        description: `Verification ${status}`,
      })
      setSelectedVerification(null)
      setReviewNotes('')
      fetchData()
    } catch (error) {
      console.error('Failed to review verification:', error)
      toast({
        title: 'Error',
        description: 'Failed to review verification',
        variant: 'destructive',
      })
    }
  }

  const handleReportResolution = async (status: 'resolved' | 'dismissed') => {
    if (!selectedReport) return

    try {
      await adminService.resolveReport(selectedReport.id, {
        status,
        resolution,
      })
      toast({
        title: 'Success',
        description: `Report ${status}`,
      })
      setSelectedReport(null)
      setResolution('')
      fetchData()
    } catch (error) {
      console.error('Failed to resolve report:', error)
      toast({
        title: 'Error',
        description: 'Failed to resolve report',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform users and content</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{statistics.totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {statistics.totalLawyers} lawyers, {statistics.totalActivists} activists
                </p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Verifications</p>
                <p className="text-2xl font-bold">{statistics.pendingVerifications}</p>
              </div>
              <FileCheck className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reported Content</p>
                <p className="text-2xl font-bold">{statistics.reportedContent}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${statistics.revenue.monthly}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="verifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="verifications">Verifications</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="verifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Lawyer Verifications</CardTitle>
            </CardHeader>
            <CardContent>
              {verifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending verifications</p>
              ) : (
                <div className="space-y-4">
                  {verifications.map((verification) => (
                    <div
                      key={verification.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={verification.user.avatar} alt={verification.user.name} />
                          <AvatarFallback>{verification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{verification.user.name}</h4>
                          <p className="text-sm text-gray-600">{verification.user.email}</p>
                          <p className="text-xs text-gray-500">
                            Submitted {format(new Date(verification.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedVerification(verification)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending reports</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-red-400" />
                        <div>
                          <h4 className="font-medium">{report.reason}</h4>
                          <p className="text-sm text-gray-600">{report.description}</p>
                          <p className="text-xs text-gray-500">
                            Reported by {report.reporter.name} on {format(new Date(report.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Full user management interface</p>
                <Button onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Detailed analytics and insights</p>
                <Button onClick={() => navigate('/admin/analytics')}>
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Lawyer Verification</DialogTitle>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedVerification.user.avatar} alt={selectedVerification.user.name} />
                  <AvatarFallback>{selectedVerification.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedVerification.user.name}</h3>
                  <p className="text-gray-600">{selectedVerification.user.email}</p>
                  {selectedVerification.user.lawyerProfile && (
                    <p className="text-sm text-gray-500">
                      Bar Number: {selectedVerification.user.lawyerProfile.barNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Submitted Documents</h4>
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-gray-400" />
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {doc.type}
                      </a>
                      <span className="text-xs text-gray-500">
                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reviewNotes">Review Notes</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleVerificationReview('rejected')}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleVerificationReview('approved')}
                  className="flex-1"
                >
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Resolution Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Content Report</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Report Details</h4>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Type:</span> {selectedReport.targetType}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Reason:</span> {selectedReport.reason}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Reported by</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedReport.reporter.avatar} alt={selectedReport.reporter.name} />
                    <AvatarFallback>{selectedReport.reporter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{selectedReport.reporter.name}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(selectedReport.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="resolution">Resolution</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe the action taken..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleReportResolution('dismissed')}
                  className="flex-1"
                >
                  Dismiss
                </Button>
                <Button
                  onClick={() => handleReportResolution('resolved')}
                  className="flex-1"
                >
                  Resolve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}