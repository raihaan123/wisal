import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Star, Clock, Shield, MessageSquare, Video, Phone, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { lawyerService } from '@/services/lawyerService'
import { consultationService } from '@/services/consultationService'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@/types/auth'
import type { CreateConsultationDto } from '@/services/consultationService'

export default function LawyerProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user: currentUser } = useAuthStore()
  const [lawyer, setLawyer] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConsultationDialog, setShowConsultationDialog] = useState(false)
  const [consultationForm, setConsultationForm] = useState<CreateConsultationDto>({
    lawyerId: id!,
    type: 'chat',
    topic: '',
    description: '',
    isAnonymous: false,
  })

  useEffect(() => {
    if (id) {
      fetchLawyerProfile()
    }
  }, [id])

  const fetchLawyerProfile = async () => {
    try {
      setLoading(true)
      const data = await lawyerService.getLawyerById(id!)
      setLawyer(data)
    } catch (error) {
      console.error('Failed to fetch lawyer profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load lawyer profile',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRequestConsultation = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    if (!consultationForm.topic || !consultationForm.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const consultation = await consultationService.createConsultation(consultationForm)
      toast({
        title: 'Success',
        description: 'Consultation request sent successfully',
      })
      setShowConsultationDialog(false)
      navigate(`/consultations/${consultation.id}`)
    } catch (error) {
      console.error('Failed to create consultation:', error)
      toast({
        title: 'Error',
        description: 'Failed to send consultation request',
        variant: 'destructive',
      })
    }
  }

  const getConsultationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-5 w-5" />
      case 'video':
        return <Video className="h-5 w-5" />
      case 'phone':
        return <Phone className="h-5 w-5" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!lawyer || !lawyer.lawyerProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Lawyer profile not found.</p>
          <Button onClick={() => navigate('/lawyers')} className="mt-4">
            Back to Lawyers
          </Button>
        </Card>
      </div>
    )
  }

  const profile = lawyer.lawyerProfile

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/lawyers')}
        className="mb-6 flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Lawyers
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={lawyer.avatar} alt={lawyer.name} />
                  <AvatarFallback className="text-2xl">{lawyer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-2xl font-bold">{lawyer.name}</h1>
                      <div className="flex items-center gap-4 mt-2 text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location.city}, {profile.location.state}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{profile.yearsOfExperience} years experience</span>
                        </div>
                      </div>
                    </div>
                    {profile.verificationStatus === 'verified' && (
                      <Badge className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  {profile.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{profile.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500">
                        ({profile.totalConsultations} consultations)
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.consultationTypes.map((type) => (
                      <Badge key={type} variant="outline" className="flex items-center gap-1">
                        {getConsultationIcon(type)}
                        <span className="capitalize">{type}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {lawyer.bio && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-600">{lawyer.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((lang) => (
                  <Badge key={lang} variant="outline">
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bar Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Bar Number: {profile.barNumber}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="font-medium mb-1">Available Days:</p>
                  <div className="flex flex-wrap gap-1">
                    {profile.availability.days.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Hours:</p>
                  <p className="text-gray-600 text-sm">{profile.availability.hours}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <Dialog open={showConsultationDialog} onOpenChange={setShowConsultationDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg">
                    Request Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Consultation with {lawyer.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Consultation Type</Label>
                      <RadioGroup
                        value={consultationForm.type}
                        onValueChange={(value) => setConsultationForm(prev => ({ ...prev, type: value as any }))}
                        className="mt-2"
                      >
                        {profile.consultationTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <RadioGroupItem value={type} id={type} />
                            <Label htmlFor={type} className="flex items-center gap-2 cursor-pointer">
                              {getConsultationIcon(type)}
                              <span className="capitalize">{type}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <Label htmlFor="topic">Topic *</Label>
                      <Input
                        id="topic"
                        value={consultationForm.topic}
                        onChange={(e) => setConsultationForm(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="Brief topic of your consultation"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={consultationForm.description}
                        onChange={(e) => setConsultationForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please describe your legal issue or question..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    {currentUser?.role === 'activist' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="anonymous"
                          checked={consultationForm.isAnonymous}
                          onChange={(e) => setConsultationForm(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="anonymous" className="text-sm">
                          Request anonymously
                        </Label>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowConsultationDialog(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleRequestConsultation}
                        className="flex-1"
                      >
                        Send Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}