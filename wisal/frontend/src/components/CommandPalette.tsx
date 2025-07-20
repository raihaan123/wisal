import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuthStore } from '@/store/authStore'
import {
  Search,
  Home,
  Users,
  MessageSquare,
  User,
  LogOut,
  Settings,
  FileText,
  Shield,
  Activity,
  Bot,
  Briefcase,
  Calendar,
  Hash,
  HelpCircle
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ComponentType<any>
  action: () => void
  category: 'navigation' | 'actions' | 'ai' | 'help'
  keywords?: string[]
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  // Toggle command palette with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands: CommandItem[] = [
    // Navigation commands
    {
      id: 'home',
      title: 'Go to Home',
      icon: Home,
      action: () => {
        navigate('/')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['home', 'main', 'landing']
    },
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      icon: Activity,
      action: () => {
        navigate('/dashboard')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['dashboard', 'overview']
    },
    {
      id: 'lawyers',
      title: 'Browse Lawyers',
      icon: Briefcase,
      action: () => {
        navigate('/lawyers')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['lawyers', 'attorneys', 'legal', 'professionals']
    },
    {
      id: 'activism',
      title: 'Activism Hub',
      icon: Shield,
      action: () => {
        navigate('/activism-hub')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['activism', 'community', 'campaigns']
    },
    {
      id: 'forum',
      title: 'Community Forum',
      icon: MessageSquare,
      action: () => {
        navigate('/forum')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['forum', 'community', 'discussion', 'threads']
    },
    
    // Action commands
    {
      id: 'search-lawyers',
      title: 'Search for Lawyers',
      description: 'Find lawyers by specialization',
      icon: Search,
      action: () => {
        navigate('/lawyers')
        setOpen(false)
      },
      category: 'actions',
      keywords: ['search', 'find', 'lawyers']
    },
    {
      id: 'create-thread',
      title: 'Create Forum Thread',
      description: 'Start a new discussion',
      icon: MessageSquare,
      action: () => {
        // This would open the create thread dialog
        navigate('/dashboard?action=create-thread')
        setOpen(false)
      },
      category: 'actions',
      keywords: ['create', 'thread', 'forum', 'discussion']
    },
    {
      id: 'schedule-consultation',
      title: 'Schedule Consultation',
      description: 'Book a meeting with a lawyer',
      icon: Calendar,
      action: () => {
        navigate('/dashboard?action=schedule')
        setOpen(false)
      },
      category: 'actions',
      keywords: ['schedule', 'consultation', 'booking', 'appointment']
    },
    
    // AI commands
    {
      id: 'ai-legal-assistant',
      title: 'AI Legal Assistant',
      description: 'Get instant legal guidance',
      icon: Bot,
      action: () => {
        navigate('/dashboard?ai=legal-assistant')
        setOpen(false)
      },
      category: 'ai',
      keywords: ['ai', 'assistant', 'legal', 'help', 'bot']
    },
    {
      id: 'ai-document-analysis',
      title: 'AI Document Analysis',
      description: 'Analyze legal documents with AI',
      icon: FileText,
      action: () => {
        navigate('/dashboard?ai=document-analysis')
        setOpen(false)
      },
      category: 'ai',
      keywords: ['ai', 'document', 'analysis', 'scan']
    },
    {
      id: 'ai-case-matcher',
      title: 'AI Case Matcher',
      description: 'Find lawyers that match your case',
      icon: Users,
      action: () => {
        navigate('/dashboard?ai=case-matcher')
        setOpen(false)
      },
      category: 'ai',
      keywords: ['ai', 'match', 'case', 'lawyer', 'find']
    },
    
    // User commands
    {
      id: 'profile',
      title: 'My Profile',
      icon: User,
      action: () => {
        navigate('/dashboard?view=profile')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['profile', 'account', 'me']
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      action: () => {
        navigate('/dashboard?view=settings')
        setOpen(false)
      },
      category: 'navigation',
      keywords: ['settings', 'preferences', 'config']
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: LogOut,
      action: () => {
        logout()
        navigate('/')
        setOpen(false)
      },
      category: 'actions',
      keywords: ['logout', 'signout', 'exit']
    },
    
    // Help commands
    {
      id: 'help',
      title: 'Help & Documentation',
      icon: HelpCircle,
      action: () => {
        navigate('/help')
        setOpen(false)
      },
      category: 'help',
      keywords: ['help', 'docs', 'documentation', 'guide']
    }
  ]

  // Filter commands based on search and user authentication
  const filteredCommands = commands.filter((command) => {
    // Filter out auth-required commands if not logged in
    if (!user && ['dashboard', 'profile', 'settings', 'logout', 'create-thread', 'schedule-consultation'].includes(command.id)) {
      return false
    }
    
    // Filter by search
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords?.some(k => k.toLowerCase().includes(searchLower))
    )
  })

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    actions: filteredCommands.filter(c => c.category === 'actions'),
    ai: filteredCommands.filter(c => c.category === 'ai'),
    help: filteredCommands.filter(c => c.category === 'help')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Quick search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium opacity-75">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-2xl">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                placeholder="Type a command or search..."
                value={search}
                onValueChange={setSearch}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden">
              <Command.Empty className="py-6 text-center text-sm text-gray-500">
                No results found.
              </Command.Empty>

              {groupedCommands.navigation.length > 0 && (
                <Command.Group heading="Navigation">
                  {groupedCommands.navigation.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.title}
                      onSelect={command.action}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <command.icon className="mr-2 h-4 w-4" />
                      <span>{command.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {groupedCommands.actions.length > 0 && (
                <Command.Group heading="Actions">
                  {groupedCommands.actions.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.title}
                      onSelect={command.action}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <command.icon className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{command.title}</span>
                        {command.description && (
                          <span className="text-xs text-gray-500">{command.description}</span>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {groupedCommands.ai.length > 0 && (
                <Command.Group heading="AI Features">
                  {groupedCommands.ai.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.title}
                      onSelect={command.action}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <command.icon className="mr-2 h-4 w-4 text-purple-600" />
                      <div className="flex flex-col">
                        <span>{command.title}</span>
                        {command.description && (
                          <span className="text-xs text-gray-500">{command.description}</span>
                        )}
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {groupedCommands.help.length > 0 && (
                <Command.Group heading="Help">
                  {groupedCommands.help.map((command) => (
                    <Command.Item
                      key={command.id}
                      value={command.title}
                      onSelect={command.action}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none hover:bg-gray-100 aria-selected:bg-gray-100"
                    >
                      <command.icon className="mr-2 h-4 w-4" />
                      <span>{command.title}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}