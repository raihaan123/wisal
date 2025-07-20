import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, X, Plus } from 'lucide-react'
import { forumService, CreatePostData } from '@/services/forumService'
import { useAuthStore } from '@/store/authStore'

const createThreadSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters').max(10000, 'Content must be less than 10000 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed').optional(),
})

type CreateThreadFormData = z.infer<typeof createThreadSchema>

interface CreateThreadFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const FORUM_CATEGORIES = [
  { value: 'general', label: 'General Discussion' },
  { value: 'legal-advice', label: 'Legal Advice' },
  { value: 'rights-awareness', label: 'Rights Awareness' },
  { value: 'success-stories', label: 'Success Stories' },
  { value: 'resources', label: 'Resources & Information' },
  { value: 'activism', label: 'Activism & Campaigns' },
  { value: 'support', label: 'Support & Guidance' },
]

export default function CreateThreadForm({ onSuccess, onCancel }: CreateThreadFormProps) {
  const { user } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTag, setCurrentTag] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateThreadFormData>({
    resolver: zodResolver(createThreadSchema),
    defaultValues: {
      tags: [],
    },
  })

  const selectedCategory = watch('category')

  const handleAddTag = () => {
    if (currentTag.trim() && tags.length < 5) {
      const newTags = [...tags, currentTag.trim()]
      setTags(newTags)
      setValue('tags', newTags)
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    setTags(newTags)
    setValue('tags', newTags)
  }

  const onSubmit = async (data: CreateThreadFormData) => {
    if (!user) {
      setError('You must be logged in to create a thread')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const postData: CreatePostData = {
        ...data,
        isPublished: true,
        status: 'published',
      }

      await forumService.createPost(postData)
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create thread. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Thread</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="title">Thread Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter a descriptive title for your thread"
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue('category', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {FORUM_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Share your thoughts, questions, or experiences..."
              rows={8}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag and press Enter"
                disabled={isSubmitting || tags.length >= 5}
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={isSubmitting || tags.length >= 5 || !currentTag.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="ml-1 hover:text-destructive"
                    disabled={isSubmitting}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {errors.tags && (
              <p className="text-sm text-red-500 mt-1">{errors.tags.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Thread'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}