import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Forum from '@/components/forum/Forum'
import PrivateForum from '@/components/forum/PrivateForum'
import { MessageSquare, Shield, Users } from 'lucide-react'

export default function ForumPage() {
  const { user } = useAuthStore()
  const [view, setView] = useState<'public' | 'private'>('public')

  // Check if user has access to private forums
  const hasPrivateAccess = user && ['lawyer', 'admin', 'seeker'].includes(user.role)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
        <p className="text-gray-600">
          Connect with our community, ask questions, and share experiences
        </p>
      </div>

      {hasPrivateAccess && (
        <Tabs value={view} onValueChange={(v) => setView(v as 'public' | 'private')} className="mb-6">
          <TabsList>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Public Forum
            </TabsTrigger>
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Private Forum
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {view === 'public' ? (
        <Forum />
      ) : (
        hasPrivateAccess ? (
          <PrivateForum />
        ) : (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              Private forums are only available to registered users with active cases.
            </p>
            <Button onClick={() => setView('public')}>
              Return to Public Forum
            </Button>
          </Card>
        )
      )}
    </div>
  )
}