import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Paperclip, Phone, Video, MoreVertical, ArrowLeft, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { consultationService } from '@/services/consultationService'
import { useAuthStore } from '@/store/authStore'
import type { Consultation, ConsultationMessage } from '@/services/consultationService'
import { format } from 'date-fns'

export default function ChatInterface() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user: currentUser } = useAuthStore()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (id) {
      fetchConsultation()
      fetchMessages()
      // Set up real-time updates (websocket or polling)
      const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds
      return () => clearInterval(interval)
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConsultation = async () => {
    try {
      const data = await consultationService.getConsultationById(id!)
      setConsultation(data)
    } catch (error) {
      console.error('Failed to fetch consultation:', error)
      toast({
        title: 'Error',
        description: 'Failed to load consultation',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await consultationService.getMessages(id!)
      setMessages(data)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const message = await consultationService.sendMessage(id!, newMessage)
      setMessages([...messages, message])
      setNewMessage('')
      
      // Update consultation status if it's the first message
      if (consultation?.status === 'pending') {
        await consultationService.updateConsultationStatus(id!, 'active')
        setConsultation(prev => prev ? { ...prev, status: 'active' } : null)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  const handleFileAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Handle file upload
    toast({
      title: 'Info',
      description: 'File attachments coming soon',
    })
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getOtherUser = () => {
    if (!consultation) return null
    return currentUser?.role === 'lawyer' ? consultation.seeker : consultation.lawyer
  }

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (messageDate.toDateString() === today.toDateString()) {
      return format(messageDate, 'h:mm a')
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday ' + format(messageDate, 'h:mm a')
    } else {
      return format(messageDate, 'MMM d, h:mm a')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Consultation not found.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const otherUser = getOtherUser()
  const isLawyer = currentUser?.role === 'lawyer'

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar>
              <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
              <AvatarFallback>
                {consultation.isAnonymous && !isLawyer ? 'A' : otherUser?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold">
                {consultation.isAnonymous && !isLawyer ? 'Anonymous Seeker' : otherUser?.name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={consultation.status === 'active' ? 'success' : 'secondary'} className="text-xs">
                  {consultation.status}
                </Badge>
                {consultation.isAnonymous && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Anonymous
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {consultation.type === 'video' && (
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
            )}
            {consultation.type === 'phone' && (
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Topic Banner */}
      <div className="bg-blue-50 px-4 py-2 border-b">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Topic:</span> {consultation.topic}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Initial consultation description */}
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Consultation started {format(new Date(consultation.createdAt), 'MMM d, yyyy')}</p>
            <Card className="mt-4 p-4 text-left">
              <p className="text-sm font-medium mb-2">Initial Description:</p>
              <p className="text-sm text-gray-600">{consultation.description}</p>
            </Card>
          </div>

          {/* Messages */}
          {messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white border'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {formatMessageTime(message.createdAt)}
                    {message.readAt && isCurrentUser && (
                      <span className="ml-2">✓✓</span>
                    )}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {consultation.status === 'active' && (
        <div className="bg-white border-t px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttachment}
                className="hidden"
                multiple
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Status messages */}
      {consultation.status === 'completed' && (
        <div className="bg-gray-100 px-4 py-3 text-center">
          <p className="text-sm text-gray-600">This consultation has been completed.</p>
          {!consultation.rating && currentUser?.role === 'activist' && (
            <Button variant="link" className="text-sm">
              Rate this consultation
            </Button>
          )}
        </div>
      )}

      {consultation.status === 'pending' && (
        <div className="bg-yellow-50 px-4 py-3 text-center">
          <p className="text-sm text-yellow-800">
            {isLawyer 
              ? 'Send a message to accept this consultation request.'
              : 'Waiting for the lawyer to accept your consultation request.'}
          </p>
        </div>
      )}
    </div>
  )
}