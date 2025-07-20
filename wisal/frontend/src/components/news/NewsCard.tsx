import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, ExternalLink } from 'lucide-react'
import type { NewsArticle } from '@/services/newsService'

interface NewsCardProps {
  article: NewsArticle
  onClick?: () => void
}

export function NewsCard({ article, onClick }: NewsCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      window.open(article.url, '_blank', 'noopener,noreferrer')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card 
      className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      {/* Image Section */}
      {article.image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
          {article.logo && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
              <img
                src={article.logo}
                alt={article.source}
                className="h-6 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {article.headline}
          </h3>
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
          <Badge variant="secondary" className="font-normal">
            {article.source}
          </Badge>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.date)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-gray-600 line-clamp-3">
          {article.text}
        </p>
      </CardContent>
    </Card>
  )
}

// Compact version for sidebars or smaller spaces
export function NewsCardCompact({ article, onClick }: NewsCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      window.open(article.url, '_blank', 'noopener,noreferrer')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {article.image && (
            <div className="flex-shrink-0">
              <img
                src={article.image}
                alt={article.headline}
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {article.headline}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{article.source}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
            </div>
          </div>
          
          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  )
}