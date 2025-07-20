import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Clock, CheckCircle, XCircle, Shield, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { consultationService } from '@/services/consultationService'
import { useAuthStore } from '@/store/authStore'
import type { Consultation } from '@/services/consultationService'
import { format } from 'date-fns'

export default function ConsultationsList() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      setLoading(true)
      const role = user?.role === 'lawyer' ? 'lawyer' : 'seeker'
      const data = await consultationService.getMyConsultations(role)
      setConsultations(data)
    } catch (error) {
      console.error('Failed to fetch consultations:', error)
    } finally {
      setLoading(false)
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
        return <XCircle className="h-4 w-4" />
      default:
        return null
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

  const filteredConsultations = consultations.filter(consultation => {
    if (activeTab === 'all') return true
    return consultation.status === activeTab
  })

  const groupConsultationsByDate = (consultations: Consultation[]) => {
    const groups: { [key: string]: Consultation[] } = {}
    
    consultations.forEach(consultation => {
      const date = format(new Date(consultation.createdAt), 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(consultation)
    })
    
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const isLawyer = user?.role === 'lawyer'
  const groupedConsultations = groupConsultationsByDate(filteredConsultations)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
        <p className="text-gray-600">View and manage your consultation requests and messages</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {consultations.filter(c => c.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 rounded-full">
                {consultations.filter(c => c.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            {consultations.filter(c => c.status === 'active').length > 0 && (
              <Badge variant="success" className="ml-2 h-5 w-5 p-0 rounded-full">
                {consultations.filter(c => c.status === 'active').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredConsultations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No consultations found</p>
                {!isLawyer && (
                  <Button onClick={() => navigate('/lawyers')} className="mt-4">
                    Find a Lawyer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {groupedConsultations.map(([date, consultations]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <div className="space-y-3">
                    {consultations.map((consultation) => {
                      const otherUser = isLawyer ? consultation.seeker : consultation.lawyer
                      const showAnonymous = consultation.isAnonymous && !isLawyer
                      
                      return (
                        <Card 
                          key={consultation.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage 
                                  src={showAnonymous ? undefined : otherUser?.avatar} 
                                  alt={showAnonymous ? 'Anonymous' : otherUser?.name} 
                                />
                                <AvatarFallback>
                                  {showAnonymous ? 'A' : otherUser?.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {showAnonymous ? 'Anonymous User' : otherUser?.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">{consultation.topic}</p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant={getStatusColor(consultation.status)}>
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(consultation.status)}
                                        {consultation.status}
                                      </span>
                                    </Badge>
                                    {consultation.isAnonymous && (
                                      <Shield className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                  {consultation.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(consultation.createdAt), 'h:mm a')}
                                  </span>
                                  
                                  {consultation.status === 'pending' && isLawyer && (
                                    <div className="flex items-center gap-1 text-yellow-600">
                                      <AlertCircle className="h-3 w-3" />
                                      <span className="text-xs font-medium">Action Required</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}