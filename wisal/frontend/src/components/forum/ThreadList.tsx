import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react'
import { forumService, ForumPost, PostsQuery } from '@/services/forumService'
import { formatDistanceToNow } from 'date-fns'

interface ThreadListProps {
  category?: string
  showTrending?: boolean
  searchQuery?: string
}

export default function ThreadList({ category, showTrending = false, searchQuery }: ThreadListProps) {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  useEffect(() => {
    loadPosts()
  }, [category, page, searchQuery, showTrending])

  const loadPosts = async () => {
    setLoading(true)
    setError(null)

    try {
      if (showTrending) {
        const trendingPosts = await forumService.getTrendingPosts()
        setPosts(trendingPosts)
        setTotalPages(1)
      } else if (searchQuery) {
        const response = await forumService.searchPosts(searchQuery, page, limit)
        setPosts(response.posts)
        setTotalPages(response.pagination.pages)
      } else {
        const query: PostsQuery = {
          category,
          page,
          limit,
        }
        const response = await forumService.getPosts(query)
        setPosts(response.posts)
        setTotalPages(response.pagination.pages)
      }
    } catch (err: any) {
      setError('Failed to load threads. Please try again.')
      console.error('Error loading posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryLabel = (categoryValue: string) => {
    const categories: Record<string, string> = {
      'general': 'General Discussion',
      'legal-advice': 'Legal Advice',
      'rights-awareness': 'Rights Awareness',
      'success-stories': 'Success Stories',
      'resources': 'Resources',
      'activism': 'Activism',
      'support': 'Support',
    }
    return categories[categoryValue] || categoryValue
  }

  const getCategoryColor = (categoryValue: string) => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-100 text-blue-800',
      'legal-advice': 'bg-purple-100 text-purple-800',
      'rights-awareness': 'bg-green-100 text-green-800',
      'success-stories': 'bg-yellow-100 text-yellow-800',
      'resources': 'bg-indigo-100 text-indigo-800',
      'activism': 'bg-red-100 text-red-800',
      'support': 'bg-pink-100 text-pink-800',
    }
    return colors[categoryValue] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={loadPosts} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No threads found</h3>
          <p className="text-gray-600">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Be the first to start a discussion in this category!'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {showTrending && (
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">Trending Discussions</h3>
        </div>
      )}

      {posts.map((post) => (
        <Card key={post._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.authorId.profilePicture} />
                <AvatarFallback>
                  {post.authorId.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <Link
                      to={`/forum/thread/${post._id}`}
                      className="text-lg font-semibold hover:underline line-clamp-2"
                    >
                      {post.title}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>{post.authorId.name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                </div>

                <p className="text-gray-700 line-clamp-2 mb-3">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {post.comments.length} replies
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {post.likes.length} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {post.viewCount} views
                  </span>
                  {post.shares > 0 && (
                    <span className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {post.shares} shares
                    </span>
                  )}
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {!showTrending && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}