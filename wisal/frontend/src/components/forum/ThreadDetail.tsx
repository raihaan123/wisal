import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ArrowLeft,
  MessageSquare, 
  Heart, 
  Share2, 
  Eye, 
  Calendar,
  Loader2,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { forumService, ForumPost, Comment } from '@/services/forumService'
import { useAuthStore } from '@/store/authStore'
import { formatDistanceToNow } from 'date-fns'

export default function ThreadDetail() {
  const { threadId } = useParams<{ threadId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (threadId) {
      loadPost()
    }
  }, [threadId])

  const loadPost = async () => {
    if (!threadId) return

    setLoading(true)
    setError(null)

    try {
      const postData = await forumService.getPost(threadId)
      setPost(postData)
      setLiked(user ? postData.likes.includes(user._id) : false)
      setLikesCount(postData.likes.length)
    } catch (err: any) {
      setError('Failed to load thread. It may have been deleted or you may not have permission to view it.')
      console.error('Error loading post:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user || !post) {
      navigate('/login')
      return
    }

    try {
      if (liked) {
        const result = await forumService.unlikePost(post._id)
        setLiked(false)
        setLikesCount(result.likes)
      } else {
        const result = await forumService.likePost(post._id)
        setLiked(true)
        setLikesCount(result.likes)
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleShare = async () => {
    if (!post) return

    try {
      await forumService.sharePost(post._id)
      // Copy link to clipboard
      const url = `${window.location.origin}/forum/thread/${post._id}`
      await navigator.clipboard.writeText(url)
      // You might want to show a toast notification here
    } catch (err) {
      console.error('Error sharing post:', err)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      navigate('/login')
      return
    }

    if (!post || !replyContent.trim()) return

    setSubmittingReply(true)
    setReplyError(null)

    try {
      const newComment = await forumService.addComment(post._id, replyContent.trim())
      setPost({
        ...post,
        comments: [...post.comments, newComment]
      })
      setReplyContent('')
    } catch (err: any) {
      setReplyError(err.response?.data?.error || 'Failed to post reply. Please try again.')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!post || !commentId) return

    try {
      await forumService.deleteComment(post._id, commentId)
      setPost({
        ...post,
        comments: post.comments.filter(c => c._id !== commentId)
      })
    } catch (err) {
      console.error('Error deleting comment:', err)
    }
  }

  const handleDeletePost = async () => {
    if (!post || !window.confirm('Are you sure you want to delete this thread?')) return

    try {
      await forumService.deletePost(post._id)
      navigate('/forum')
    } catch (err) {
      console.error('Error deleting post:', err)
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-500 mb-4">{error || 'Thread not found'}</p>
            <Button onClick={() => navigate('/forum')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Forum
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate('/forum')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Forum
      </Button>

      {/* Main Thread */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.authorId.profilePicture} />
                    <AvatarFallback>
                      {post.authorId.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.authorId.name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>
            </div>
            {user && user._id === post.authorId._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/forum/thread/${post._id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-gray max-w-none mb-4 whitespace-pre-wrap">
            {post.content}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant={liked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
            >
              <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount} views
            </span>
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.comments.length} replies
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Reply Form */}
      {user ? (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold">Post a Reply</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply}>
              {replyError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{replyError}</AlertDescription>
                </Alert>
              )}
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                disabled={submittingReply}
                className="resize-none mb-4"
              />
              <Button type="submit" disabled={submittingReply || !replyContent.trim()}>
                {submittingReply ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Reply'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Please log in to post a reply</p>
            <Button onClick={() => navigate('/login')}>
              Log In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Comments/Replies */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg mb-4">
          {post.comments.length} {post.comments.length === 1 ? 'Reply' : 'Replies'}
        </h3>
        
        {post.comments.map((comment, index) => (
          <Card key={comment._id || index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.userId.profilePicture} />
                  <AvatarFallback>
                    {comment.userId.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{comment.userId.name}</span>
                      <span className="text-gray-600">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {user && user._id === comment.userId._id && comment._id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment._id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}