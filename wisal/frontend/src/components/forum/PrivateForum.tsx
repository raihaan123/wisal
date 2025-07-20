import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import { MessageSquare, Plus, Lock, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface Thread {
  id: string
  title: string
  description: string
  status: 'open' | 'closed' | 'resolved'
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string
    role: string
    avatar?: string
  }
  participants: Array<{
    id: string
    name: string
    role: string
    avatar?: string
  }>
  messages: Array<{
    id: string
    content: string
    createdAt: Date
    author: {
      id: string
      name: string
      role: string
      avatar?: string
    }
  }>
  isConfidential: boolean
}

export default function PrivateForum() {
  const { user } = useAuthStore()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newThread, setNewThread] = useState({ title: '', description: '' })
  const [newMessage, setNewMessage] = useState('')

  // Mock data for demonstration
  useEffect(() => {
    const mockThreads: Thread[] = [
      {
        id: '1',
        title: 'Urgent: Legal representation needed for protest case',
        description: 'Client was arrested during peaceful protest and needs immediate legal assistance',
        status: 'open',
        createdAt: new Date('2025-01-19'),
        updatedAt: new Date('2025-01-20'),
        createdBy: {
          id: '1',
          name: 'Sarah Johnson',
          role: 'seeker'
        },
        participants: [
          { id: '1', name: 'Sarah Johnson', role: 'seeker' },
          { id: '2', name: 'Ahmed Hassan', role: 'lawyer' },
          { id: '3', name: 'Admin Team', role: 'admin' }
        ],
        messages: [
          {
            id: '1',
            content: 'I need urgent legal help. I was arrested during a peaceful protest yesterday.',
            createdAt: new Date('2025-01-19T10:00:00'),
            author: { id: '1', name: 'Sarah Johnson', role: 'seeker' }
          },
          {
            id: '2',
            content: 'I can help with this case. I have experience with protest-related arrests. Let\'s discuss the details.',
            createdAt: new Date('2025-01-19T11:30:00'),
            author: { id: '2', name: 'Ahmed Hassan', role: 'lawyer' }
          }
        ],
        isConfidential: true
      }
    ]
    setThreads(mockThreads)
  }, [])

  const handleCreateThread = () => {
    const thread: Thread = {
      id: Date.now().toString(),
      title: newThread.title,
      description: newThread.description,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: {
        id: user?.id || '',
        name: user?.name || 'Unknown',
        role: user?.role || 'seeker'
      },
      participants: [{
        id: user?.id || '',
        name: user?.name || 'Unknown',
        role: user?.role || 'seeker'
      }],
      messages: [],
      isConfidential: true
    }
    
    setThreads([thread, ...threads])
    setNewThread({ title: '', description: '' })
    setIsCreateDialogOpen(false)
  }

  const handleSendMessage = () => {
    if (!selectedThread || !newMessage.trim()) return

    const message = {
      id: Date.now().toString(),
      content: newMessage,
      createdAt: new Date(),
      author: {
        id: user?.id || '',
        name: user?.name || 'Unknown',
        role: user?.role || 'seeker'
      }
    }

    const updatedThread = {
      ...selectedThread,
      messages: [...selectedThread.messages, message],
      updatedAt: new Date()
    }

    setSelectedThread(updatedThread)
    setThreads(threads.map(t => t.id === updatedThread.id ? updatedThread : t))
    setNewMessage('')
  }

  const getStatusColor = (status: Thread['status']) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'closed': return 'bg-gray-500'
      case 'resolved': return 'bg-blue-500'
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'lawyer': return <Badge className="bg-purple-500">Lawyer</Badge>
      case 'seeker': return <Badge className="bg-blue-500">Seeker</Badge>
      case 'admin': return <Badge className="bg-red-500">Admin</Badge>
      default: return <Badge>{role}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Thread List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Private Threads</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Thread
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Private Thread</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      placeholder="Brief title for your case"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={newThread.description}
                      onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                      placeholder="Describe your situation..."
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleCreateThread} className="w-full">
                    Create Thread
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-2">{thread.title}</h3>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(thread.status)}`} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="h-3 w-3" />
                    <span>Confidential</span>
                    <span>•</span>
                    <Users className="h-3 w-3" />
                    <span>{thread.participants.length}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{format(thread.updatedAt, 'MMM d')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Thread Detail */}
      <div className="lg:col-span-2">
        {selectedThread ? (
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{selectedThread.title}</CardTitle>
                  <Badge variant="outline">{selectedThread.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedThread.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Participants:</span>
                    {selectedThread.participants.map((p) => (
                      <span key={p.id}>{getRoleBadge(p.role)}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {selectedThread.messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <div className="bg-gray-300 h-full w-full rounded-full flex items-center justify-center text-xs">
                        {message.author.name[0]}
                      </div>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{message.author.name}</span>
                        {getRoleBadge(message.author.role)}
                        <span className="text-xs text-gray-500">
                          {format(message.createdAt, 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a thread to view the conversation</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}