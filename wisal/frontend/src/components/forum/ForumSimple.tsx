import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, Heart, Share2, Plus } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  _id: string
  title: string
  content: string
  category: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  likes: string[]
  comments: Array<{
    _id: string
    userId: {
      _id: string
      name: string
      avatar?: string
    }
    content: string
    createdAt: string
  }>
  viewCount: number
  createdAt: string
  updatedAt: string
}

export default function ForumSimple() {
  const { user } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('general')

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''
      const response = await api.get(`/posts${params}`)
      setPosts(response.data.posts || response.data)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [selectedCategory])

  // Create new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('Please login to create a post')
      return
    }

    try {
      const response = await api.post('/posts', {
        title,
        content,
        category,
        visibility: 'public'
      })
      
      setPosts([response.data, ...posts])
      setShowCreateForm(false)
      setTitle('')
      setContent('')
      setCategory('general')
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    }
  }

  // Like post
  const handleLike = async (postId: string) => {
    if (!user) {
      alert('Please login to like posts')
      return
    }

    try {
      const response = await api.post(`/posts/${postId}/like`)
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likes: response.data.likes }
          : post
      ))
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General Discussion' },
    { value: 'legal-advice', label: 'Legal Advice' },
    { value: 'activism', label: 'Activism' },
    { value: 'resources', label: 'Resources' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600 mt-1">Share your thoughts and connect with others</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-forest-green hover:bg-moss-green"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Thread
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2">
        {categories.map(cat => (
          <Button
            key={cat.value}
            variant={selectedCategory === cat.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat.value)}
            className={selectedCategory === cat.value ? 'bg-forest-green hover:bg-moss-green' : ''}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Create Post Form */}
      {showCreateForm && (
        <Card className="border-2 border-forest-green/20">
          <CardHeader>
            <CardTitle>Create New Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your topic?"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Discussion</SelectItem>
                    <SelectItem value="legal-advice">Legal Advice</SelectItem>
                    <SelectItem value="activism">Activism</SelectItem>
                    <SelectItem value="resources">Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-forest-green hover:bg-moss-green">
                  Post Thread
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-8">Loading threads...</div>
      ) : posts.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">No threads yet. Be the first to start a discussion!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {post.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-gray-700 line-clamp-3">{post.content}</p>
                    
                    <div className="flex items-center gap-6 mt-4">
                      <button 
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          post.likes.includes(user?._id || '') 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.likes.includes(user?._id || '') ? 'fill-current' : ''}`} />
                        <span>{post.likes.length}</span>
                      </button>
                      
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-forest-green transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length}</span>
                      </button>
                      
                      <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-forest-green transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      
                      <span className="text-sm text-gray-400 ml-auto">
                        {post.viewCount} views
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}