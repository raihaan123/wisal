import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, Calendar, DollarSign, Star, Clock, TrendingUp, Users, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { consultationService } from '@/services/consultationService'
import { lawyerService } from '@/services/lawyerService'
import { useAuthStore } from '@/store/authStore'
import type { Consultation } from '@/services/consultationService'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'

export default function LawyerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [statistics, setStatistics] = useState({
    totalConsultations: 0,
    completedConsultations: 0,
    averageRating: 0,
    monthlyEarnings: 0,
    upcomingConsultations: 0,
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<{ days: string[], hours: string }>({
    days: [],
    hours: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [consultationsData, statsData] = await Promise.all([
        consultationService.getMyConsultations('lawyer'),
        lawyerService.getStatistics(user?.id!),
      ])
      setConsultations(consultationsData)
      setStatistics(statsData)
      
      // Load availability
      if (user?.lawyerProfile) {
        setAvailability(user.lawyerProfile.availability)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async () => {
    try {
      await lawyerService.updateAvailability(user?.id!, availability)
      // Update local state
      useAuthStore.getState().updateUser({
        lawyerProfile: {
          ...user?.lawyerProfile!,
          availability,
        },
      })
    } catch (error) {
      console.error('Failed to update availability:', error)
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const availableHours = [
    '9:00 AM - 12:00 PM',
    '12:00 PM - 3:00 PM',
    '3:00 PM - 6:00 PM',
    '6:00 PM - 9:00 PM',
    'Flexible',
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lawyer Dashboard</h1>
          <p className="text-gray-600">Manage your consultations and availability</p>
        </div>
        <Button onClick={() => navigate('/profile/settings')}>
          <Settings className="h-4 w-4 mr-2" />
          Profile Settings
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Consultations</p>
                <p className="text-2xl font-bold">{statistics.totalConsultations}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{statistics.completedConsultations}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Earnings</p>
                <p className="text-2xl font-bold">${statistics.monthlyEarnings}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{statistics.upcomingConsultations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consultations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="consultations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No consultations yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/consultations/${consultation.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage 
                            src={consultation.isAnonymous ? undefined : consultation.seeker?.avatar} 
                            alt={consultation.isAnonymous ? 'Anonymous' : consultation.seeker?.name} 
                          />
                          <AvatarFallback>
                            {consultation.isAnonymous ? 'A' : consultation.seeker?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {consultation.isAnonymous ? 'Anonymous Seeker' : consultation.seeker?.name}
                          </h4>
                          <p className="text-sm text-gray-600">{consultation.topic}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(consultation.createdAt), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(consultation.status)}>
                          {consultation.status}
                        </Badge>
                        <Badge variant="outline">{consultation.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Availability Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleNextMonth}>
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => (
                      <div key={day} className="text-center text-sm font-medium py-2">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth().map((day, index) => {
                      const dayName = format(day, 'EEE')
                      const isAvailable = availability.days.includes(dayName)
                      
                      return (
                        <div
                          key={index}
                          className={`
                            text-center py-2 text-sm rounded
                            ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                            ${isToday(day) ? 'bg-primary text-primary-foreground' : ''}
                            ${isAvailable && isSameMonth(day, currentMonth) && !isToday(day) ? 'bg-green-100 text-green-800' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Availability Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Update Availability</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Available Days</label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map(day => {
                          const dayAbbr = day.slice(0, 3)
                          const isSelected = availability.days.includes(dayAbbr)
                          
                          return (
                            <Button
                              key={day}
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setAvailability(prev => ({
                                  ...prev,
                                  days: isSelected
                                    ? prev.days.filter(d => d !== dayAbbr)
                                    : [...prev.days, dayAbbr]
                                }))
                              }}
                            >
                              {day}
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Available Hours</label>
                      <Select
                        value={availability.hours}
                        onValueChange={(value) => setAvailability(prev => ({ ...prev, hours: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hours" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableHours.map(hours => (
                            <SelectItem key={hours} value={hours}>
                              {hours}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={updateAvailability}>
                      Update Availability
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}