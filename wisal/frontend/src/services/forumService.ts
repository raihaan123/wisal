import api from './api'

export interface ForumPost {
  _id: string
  authorId: {
    _id: string
    name: string
    profilePicture?: string
  }
  title: string
  content: string
  category: string
  tags: string[]
  images?: string[]
  likes: string[]
  shares: number
  comments: Comment[]
  isPublished: boolean
  viewCount: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface Comment {
  _id?: string
  userId: {
    _id: string
    name: string
    profilePicture?: string
  }
  content: string
  createdAt: string
}

export interface CreatePostData {
  title: string
  content: string
  category: string
  tags?: string[]
  isPublished?: boolean
  status?: 'draft' | 'published'
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface PostsResponse {
  posts: ForumPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PostsQuery {
  category?: string
  tags?: string | string[]
  authorId?: string
  page?: number
  limit?: number
}

class ForumService {
  // Get posts with pagination and filters
  async getPosts(query?: PostsQuery): Promise<PostsResponse> {
    const params = new URLSearchParams()
    if (query?.category) params.append('category', query.category)
    if (query?.tags) {
      if (Array.isArray(query.tags)) {
        query.tags.forEach(tag => params.append('tags', tag))
      } else {
        params.append('tags', query.tags)
      }
    }
    if (query?.authorId) params.append('authorId', query.authorId)
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())

    const response = await api.get(`/posts?${params.toString()}`)
    return response.data
  }

  // Search posts
  async searchPosts(query: string, page = 1, limit = 20): Promise<PostsResponse> {
    const response = await api.get('/posts/search', {
      params: { q: query, page, limit }
    })
    return response.data
  }

  // Get trending posts
  async getTrendingPosts(): Promise<ForumPost[]> {
    const response = await api.get('/posts/trending')
    return response.data
  }

  // Get single post
  async getPost(postId: string): Promise<ForumPost> {
    const response = await api.get(`/posts/${postId}`)
    return response.data
  }

  // Create new post
  async createPost(data: CreatePostData): Promise<ForumPost> {
    const response = await api.post('/posts', {
      ...data,
      isPublished: data.isPublished !== false,
      status: data.status || 'published'
    })
    return response.data
  }

  // Update post
  async updatePost(postId: string, data: UpdatePostData): Promise<ForumPost> {
    const response = await api.put(`/posts/${postId}`, data)
    return response.data
  }

  // Delete post
  async deletePost(postId: string): Promise<void> {
    await api.delete(`/posts/${postId}`)
  }

  // Like post
  async likePost(postId: string): Promise<{ likes: number }> {
    const response = await api.post(`/posts/${postId}/like`)
    return response.data
  }

  // Unlike post
  async unlikePost(postId: string): Promise<{ likes: number }> {
    const response = await api.delete(`/posts/${postId}/like`)
    return response.data
  }

  // Share post
  async sharePost(postId: string): Promise<{ shares: number }> {
    const response = await api.post(`/posts/${postId}/share`)
    return response.data
  }

  // Get comments
  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get(`/posts/${postId}/comments`)
    return response.data
  }

  // Add comment
  async addComment(postId: string, content: string): Promise<Comment> {
    const response = await api.post(`/posts/${postId}/comments`, { content })
    return response.data
  }

  // Delete comment
  async deleteComment(postId: string, commentId: string): Promise<void> {
    await api.delete(`/posts/${postId}/comments/${commentId}`)
  }

  // Upload images
  async uploadImages(postId: string, files: File[]): Promise<{ images: string[] }> {
    const formData = new FormData()
    files.forEach(file => formData.append('images', file))
    
    const response = await api.post(`/posts/${postId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}

export const forumService = new ForumService()