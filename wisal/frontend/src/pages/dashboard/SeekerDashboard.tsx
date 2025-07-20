import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Calendar, Clock, CheckCircle, AlertCircle, Search, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { consultationService } from '@/services/consultationService'
import { useAuthStore } from '@/store/authStore'
import type { Consultation } from '@/services/consultationService'
import { format } from 'date-fns'

export default function SeekerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [consultationsData, statsData] = await Promise.all([
        consultationService.getMyConsultations('seeker'),
        consultationService.getStatistics(),
      ])
      setConsultations(consultationsData)
      setStatistics(statsData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Consultation['status']) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'active':
        return 'success'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: Consultation['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'active':
        return <MessageSquare className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Manage your legal consultations and find support</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/lawyers')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Find a Lawyer</h3>
                <p className="text-sm text-gray-600">Browse verified lawyers for your cause</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/activism-hub')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Activism Hub</h3>
                <p className="text-sm text-gray-600">Connect with fellow activists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{statistics.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{statistics.active}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{statistics.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Consultations</CardTitle>
        </CardHeader>
        <CardContent>
          {consultations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No consultations yet</p>
              <Button onClick={() => navigate('/lawyers')}>Find a Lawyer</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.slice(0, 5).map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/consultations/${consultation.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={consultation.lawyer?.avatar} alt={consultation.lawyer?.name} />
                      <AvatarFallback>{consultation.lawyer?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">{consultation.lawyer?.name}</h4>
                      <p className="text-sm text-gray-600">{consultation.topic}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(consultation.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(consultation.status)} className="flex items-center gap-1">
                      {getStatusIcon(consultation.status)}
                      {consultation.status}
                    </Badge>
                    {consultation.isAnonymous && (
                      <Badge variant="outline">Anonymous</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}