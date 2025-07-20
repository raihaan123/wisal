import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { consultationService } from '@/services/consultationService'
import { useAuthStore } from '@/store/authStore'
import type { Consultation, ConsultationMessage } from '@/services/consultationService'
import { format } from 'date-fns'
import { socketService } from '@/services/socket'

// Import ChatScope UI Kit components
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  InfoButton,
  VideoCallButton,
  VoiceCallButton,
  MessageSeparator,
  TypingIndicator,
  Avatar as ChatAvatar,
  MessageGroup
} from '@chatscope/chat-ui-kit-react'
import { Card } from '@/components/ui/card'

// Custom component for consultation request card
const ConsultationRequestCard = ({ 
  consultation, 
  onAccept, 
  onDecline 
}: { 
  consultation: Consultation,
  onAccept: () => void,
  onDecline: () => void
}) => {
  return (
    <Card className="p-6 mb-4 bg-blue-50 border-blue-200">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">New Consultation Request</h3>
            <p className="text-sm text-gray-600 mt-1">Topic: {consultation.topic}</p>
          </div>
          <Badge variant="outline" className="text-blue-600">
            {consultation.type}
          </Badge>
        </div>
        
        <div className="bg-white p-4 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">User's Legal Issue:</p>
          <p className="text-sm text-gray-600">{consultation.description}</p>
        </div>
        
        {consultation.isAnonymous && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>This user has chosen to remain anonymous</span>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button onClick={onAccept} className="flex-1">
            <Check className="h-4 w-4 mr-2" />
            Accept Request
          </Button>
          <Button onClick={onDecline} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function ChatInterface() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user: currentUser } = useAuthStore()
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [messages, setMessages] = useState<ConsultationMessage[]>([])
  const [messageInputValue, setMessageInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (id) {
      fetchConsultation()
      fetchMessages()
      
      // Connect to socket and join consultation room
      if (!socketService.isConnected()) {
        socketService.connect()
      }
      socketService.joinConversation(id)
      
      // Set up socket event listeners
      socketService.onNewMessage(handleNewMessage)
      socketService.onUserTyping(handleUserTyping)
      socketService.onUserStoppedTyping(handleUserStoppedTyping)
      socketService.onMessageRead(handleMessageRead)
      
      return () => {
        socketService.leaveConversation(id)
      }
    }
  }, [id])

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

  const handleSend = async (message: string) => {
    if (!message.trim() || sending) return

    setSending(true)
    setMessageInputValue('')
    
    try {
      const newMessage = await consultationService.sendMessage(id!, message)
      setMessages([...messages, newMessage])
      
      // Update consultation status if it's the first message from lawyer
      if (consultation?.status === 'pending' && currentUser?.role === 'lawyer') {
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

  const handleAcceptConsultation = async () => {
    try {
      await consultationService.updateConsultationStatus(id!, 'active')
      setConsultation(prev => prev ? { ...prev, status: 'active' } : null)
      toast({
        title: 'Success',
        description: 'Consultation request accepted',
      })
    } catch (error) {
      console.error('Failed to accept consultation:', error)
      toast({
        title: 'Error',
        description: 'Failed to accept consultation',
        variant: 'destructive',
      })
    }
  }

  const handleDeclineConsultation = async () => {
    try {
      await consultationService.updateConsultationStatus(id!, 'cancelled')
      toast({
        title: 'Consultation declined',
        description: 'The consultation request has been declined',
      })
      navigate('/dashboard')
    } catch (error) {
      console.error('Failed to decline consultation:', error)
      toast({
        title: 'Error',
        description: 'Failed to decline consultation',
        variant: 'destructive',
      })
    }
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketService.startTyping(id!, currentUser!.id)
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      socketService.stopTyping(id!, currentUser!.id)
    }, 1000)
  }

  const handleNewMessage = useCallback((message: ConsultationMessage) => {
    if (message.senderId !== currentUser?.id) {
      setMessages(prev => [...prev, message])
    }
  }, [currentUser])

  const handleUserTyping = useCallback(({ userId }: { userId: string }) => {
    if (userId !== currentUser?.id) {
      setTypingUsers(prev => [...prev, userId])
    }
  }, [currentUser])

  const handleUserStoppedTyping = useCallback(({ userId }: { userId: string }) => {
    setTypingUsers(prev => prev.filter(id => id !== userId))
  }, [])

  const handleMessageRead = useCallback(({ messageId }: { messageId: string }) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, readAt: new Date().toISOString() } : msg
    ))
  }, [])

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
  const showTypingIndicator = typingUsers.length > 0

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <MainContainer>
        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back onClick={() => navigate('/dashboard')} />
            <ChatAvatar 
              src={consultation.isAnonymous && !isLawyer ? undefined : otherUser?.avatar}
              name={consultation.isAnonymous && !isLawyer ? 'Anonymous' : otherUser?.name}
            />
            <ConversationHeader.Content 
              userName={consultation.isAnonymous && !isLawyer ? 'Anonymous Seeker' : otherUser?.name}
              info={
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
              }
            />
            <ConversationHeader.Actions>
              {consultation.type === 'video' && (
                <VideoCallButton />
              )}
              {consultation.type === 'phone' && (
                <VoiceCallButton />
              )}
              <InfoButton />
            </ConversationHeader.Actions>
          </ConversationHeader>
          
          <MessageList typingIndicator={showTypingIndicator && <TypingIndicator content="Typing..." />}>
            {/* Show consultation request card for lawyers with pending consultations */}
            {isLawyer && consultation.status === 'pending' && (
              <Message model={{
                type: "custom",
                position: "single",
                direction: "incoming"
              }}>
                <Message.CustomContent>
                  <ConsultationRequestCard
                    consultation={consultation}
                    onAccept={handleAcceptConsultation}
                    onDecline={handleDeclineConsultation}
                  />
                </Message.CustomContent>
              </Message>
            )}
            
            {/* Initial consultation info */}
            <MessageSeparator content={`Consultation started ${format(new Date(consultation.createdAt), 'MMM d, yyyy')}`} />
            
            <MessageGroup direction="incoming">
              <MessageGroup.Messages>
                <Message
                  model={{
                    message: consultation.description,
                    sentTime: consultation.createdAt,
                    sender: consultation.isAnonymous && !isLawyer ? 'Anonymous' : otherUser?.name,
                    direction: 'incoming',
                    position: 'single'
                  }}
                >
                  <Message.Header sender={`Topic: ${consultation.topic}`} />
                </Message>
              </MessageGroup.Messages>
            </MessageGroup>
            
            {/* Messages */}
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === currentUser?.id
              const sender = isCurrentUser ? currentUser?.name : 
                            (consultation.isAnonymous && !isLawyer ? 'Anonymous' : otherUser?.name)
              
              return (
                <Message
                  key={msg.id}
                  model={{
                    message: msg.content,
                    sentTime: formatMessageTime(msg.createdAt),
                    sender: sender,
                    direction: isCurrentUser ? 'outgoing' : 'incoming',
                    position: 'single'
                  }}
                >
                  {msg.readAt && isCurrentUser && (
                    <Message.Footer sender="Read" />
                  )}
                </Message>
              )
            })}
          </MessageList>
          
          {consultation.status === 'active' && (
            <MessageInput 
              placeholder="Type your message here..."
              value={messageInputValue}
              onChange={(val) => {
                setMessageInputValue(val)
                handleTyping()
              }}
              onSend={handleSend}
              disabled={sending}
              attachButton={false}
            />
          )}
          
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
          
          {consultation.status === 'pending' && !isLawyer && (
            <div className="bg-yellow-50 px-4 py-3 text-center">
              <p className="text-sm text-yellow-800">
                Waiting for the lawyer to accept your consultation request.
              </p>
            </div>
          )}
        </ChatContainer>
      </MainContainer>
    </div>
  )
}