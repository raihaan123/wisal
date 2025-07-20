import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Search, Filter, Calendar, Users, MessageSquare, TrendingUp } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Climate Action March',
    date: '2024-02-15',
    location: 'New York, NY',
    category: 'Climate',
    participants: 1250,
    description: 'Join us for a peaceful march demanding immediate climate action.',
    legalSupport: true,
  },
  {
    id: '2',
    title: 'Digital Privacy Workshop',
    date: '2024-02-20',
    location: 'Online',
    category: 'Digital Rights',
    participants: 500,
    description: 'Learn about protecting your digital privacy as an activist.',
    legalSupport: false,
  },
  {
    id: '3',
    title: 'Workers Rights Rally',
    date: '2024-02-25',
    location: 'Los Angeles, CA',
    category: 'Labor',
    participants: 800,
    description: 'Stand with workers demanding fair wages and safe working conditions.',
    legalSupport: true,
  },
]

const categories = ['All', 'Climate', 'Human Rights', 'Digital Rights', 'Labor', 'Social Justice']

export default function ActivismHub() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showLegalHelpModal, setShowLegalHelpModal] = useState(false)

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleGetLegalHelp = () => {
    if (isAuthenticated) {
      navigate('/lawyers')
    } else {
      navigate('/register')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Activism Hub</h1>
        <p className="text-lg text-gray-600">
          Stay informed about activism events and access legal resources
        </p>
      </div>

      {/* Legal Help CTA */}
      <Card className="mb-8 bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-2xl">Need Legal Support?</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Connect with pro bono lawyers who understand activist rights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showLegalHelpModal} onOpenChange={setShowLegalHelpModal}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg">
                Get Legal Help Now
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Legal Support Options</DialogTitle>
                <DialogDescription>
                  Choose how you'd like to connect with a lawyer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleGetLegalHelp}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Browse Available Lawyers
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => {
                    setShowLegalHelpModal(false)
                    navigate(isAuthenticated ? '/chat' : '/register')
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Describe Your Legal Needs
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events, causes, or resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary">{event.category}</Badge>
                {event.legalSupport && (
                  <Badge variant="default">Legal Support Available</Badge>
                )}
              </div>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(event.date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.participants} participants
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{event.description}</p>
              <p className="text-sm font-medium mt-2">{event.location}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Learn More
              </Button>
              {event.legalSupport && (
                <Button size="sm" className="flex-1" onClick={handleGetLegalHelp}>
                  Get Legal Info
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Resources Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Legal Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Know Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Essential information about your rights as an activist during protests and demonstrations.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Read Guide</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Legal Precedents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Important court cases that have shaped activist rights and protections.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">View Cases</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                24/7 legal hotlines and emergency contacts for activists in need.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm">Get Contacts</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}